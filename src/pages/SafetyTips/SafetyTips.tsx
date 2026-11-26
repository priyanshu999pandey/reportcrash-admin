import axios from 'axios'
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/baseComponents/Button'
import ApiImage from '../../components/baseComponents/ApiImage'
import FilterSelect from '../../components/baseComponents/FilterSelect'
import Pagination from '../../components/baseComponents/Pagination'
import SearchBar from '../../components/baseComponents/SearchBar'
import StatisticCard from '../../components/baseComponents/StatisticCard'
import Table from '../../components/baseComponents/Table'
import { apiUrls } from '../../config/api'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  removeBlog,
  setBlogError,
  setBlogLoading,
  setBlogs,
} from '../../store/blogSlice'
import type {
  BlogListItem,
  BlogListResponse,
  DeleteBlogResponse,
  SafetyTip,
  TableColumn,
  TableRow,
} from '../../types'
import { hasAuthPermission } from '../../utils/auth'

const columns: TableColumn[] = [
  { key: 'number', header: '#' },
  { key: 'blogId', header: 'Blog ID' },
  { key: 'thumbnail', header: 'Thumbnail' },
  { key: 'title', header: 'Title' },
  { key: 'category', header: 'Category' },
  { key: 'readTime', header: 'Read Time' },
  { key: 'publishedAt', header: 'Published At' },
  { key: 'actions', header: 'Actions' },
]

const formatPublishedDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value))
    : 'Not published'

const createSafetyTip = (blog: BlogListItem): SafetyTip => ({
  id: blog.id,
  slug: blog.slug,
  title: blog.title,
  description: `<p>${blog.excerpt}</p>`,
  image: blog.coverImage ?? '',
  readTime: blog.readTime,
  status: 'Published',
  views: 0,
  createdOn: formatPublishedDate(blog.publishedAt),
  createdDate: blog.publishedAt?.slice(0, 10) ?? '',
})

const SafetyTips = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const {
    items: blogs,
    total: totalBlogs,
    totalPages: serverTotalPages,
    isLoading,
    error,
  } = useAppSelector((state) => state.blogs)
  const adminRole = useAppSelector((state) => state.auth.adminRole)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('latest')
  const [deletingBlogId, setDeletingBlogId] = useState('')
  const [actionError, setActionError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const tipsPerPage = 10
  const canCreateBlogs = hasAuthPermission(adminRole, 'blogs:create')
  const canUpdateBlogs = hasAuthPermission(adminRole, 'blogs:update')
  const canDeleteBlogs =
    hasAuthPermission(adminRole, 'blogs:delete') ||
    hasAuthPermission(adminRole, 'safety-tips:delete')

  useEffect(() => {
    const controller = new AbortController()

    const loadBlogs = async () => {
      dispatch(setBlogLoading(true))
      dispatch(setBlogError(''))

      try {
        const response = await axios.get(apiUrls.blogs, {
          signal: controller.signal,
          params: {
            page: currentPage,
            limit: tipsPerPage,
            ...(search.trim() ? { search: search.trim() } : {}),
            ...(categoryFilter !== 'all'
              ? { category: categoryFilter }
              : {}),
          },
        })
        const result = response.data as BlogListResponse
        dispatch(setBlogs(result))
      } catch (requestError: unknown) {
        if (axios.isCancel(requestError)) return
        if (axios.isAxiosError(requestError)) {
          dispatch(
            setBlogError(
              requestError.response?.data?.message ?? requestError.message,
            ),
          )
        } else {
          dispatch(setBlogError('Unable to load safety tips.'))
        }
      } finally {
        if (!controller.signal.aborted) {
          dispatch(setBlogLoading(false))
        }
      }
    }

    void loadBlogs()
    return () => controller.abort()
  }, [categoryFilter, currentPage, dispatch, search])

  const categories = useMemo(
    () => [...new Set(blogs.map((blog) => blog.category))],
    [blogs],
  )

  const displayedBlogs = useMemo(() => {
    return [...blogs].sort((first, second) => {
      if (sortOrder === 'oldest') {
        return (first.publishedAt ?? '').localeCompare(
          second.publishedAt ?? '',
        )
      }
      return (second.publishedAt ?? '').localeCompare(
        first.publishedAt ?? '',
      )
    })
  }, [blogs, sortOrder])

  const totalPages = Math.max(1, serverTotalPages)
  const activePage = Math.min(currentPage, totalPages)
  const firstTipIndex = (activePage - 1) * tipsPerPage

  const resetFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setSortOrder('latest')
    setCurrentPage(1)
  }

  const deleteTip = async (blogId: string) => {
    if (!window.confirm('Are you sure you want to delete this safety tip?')) {
      return
    }

    setDeletingBlogId(blogId)
    setActionError('')

    try {
      const response = await axios.delete(apiUrls.deleteBlog(blogId))
      const result = response.data as DeleteBlogResponse

      if (!result.success) {
        setActionError(result.message || 'Unable to delete safety tip.')
        return
      }

      dispatch(removeBlog(blogId))
      if (blogs.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1)
      }
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        setActionError(
          requestError.response?.data?.message ?? requestError.message,
        )
      } else {
        setActionError('Unable to delete safety tip.')
      }
    } finally {
      setDeletingBlogId('')
    }
  }

  const openTip = (blog: BlogListItem, mode: 'view' | 'edit') => {
    const tip = createSafetyTip(blog)
    navigate(`/safety-tips/${mode}/${blog.slug}`, { state: { tip } })
  }

  const tableRows: TableRow[] = displayedBlogs.map((blog, index) => ({
    key: blog.id,
    cells: {
      number: firstTipIndex + index + 1,
      blogId: <span className="font-medium text-text">{blog.id}</span>,
      thumbnail: (
        blog.coverImage ? (
          <ApiImage
            src={blog.coverImage}
            alt={blog.title}
            className="h-12 w-20 rounded-lg object-cover"
          />
        ) : (
          <span className="flex h-12 w-20 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <FileText size={18} />
          </span>
        )
      ),
      title: (
        <span className="font-semibold text-text">{blog.title}</span>
      ),
      category: (
        <span className="inline-flex rounded-full bg-primary-soft px-2.5 py-1 font-semibold text-primary capitalize">
          {blog.category}
        </span>
      ),
      readTime: (
        <span className="inline-flex items-center gap-1.5 text-text">
          <Clock3 size={15} className="text-text-muted" />
          {blog.readTime} min
        </span>
      ),
      publishedAt: formatPublishedDate(blog.publishedAt),
      actions: (
        <div className="flex items-center gap-1">
          <button type="button" title="View safety tip" onClick={() => openTip(blog, 'view')} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary"><Eye size={17} /></button>
          {canUpdateBlogs && <button type="button" title="Edit safety tip" onClick={() => openTip(blog, 'edit')} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary"><Pencil size={17} /></button>}
          {canDeleteBlogs && (
            <button
              type="button"
              title="Delete safety tip"
              disabled={deletingBlogId === blog.id}
              onClick={() => void deleteTip(blog.id)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deletingBlogId === blog.id ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Trash2 size={17} />
              )}
            </button>
          )}
        </div>
      ),
    },
  }))

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="m-0 text-title font-bold tracking-tight text-text">Road &amp; Safety Tips</h1>
            <p className="mt-1 mb-0 text-small text-text-muted">Manage safety and awareness tips for users.</p>
          </div>
          {canCreateBlogs && <Button variant="red" size="small" onClick={() => navigate('/safety-tips/create')} className="gap-2 self-start sm:self-auto"><Plus size={16} />Create Safety Tip</Button>}
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatisticCard id="total-tips" label="Total Tips" value={totalBlogs} icon={FileText} tone="accent" />
          <StatisticCard id="published-tips" label="Published" value={totalBlogs} icon={CheckCircle2} tone="green" />
        </div>

        <div className="overflow-visible rounded-xl border border-border-soft bg-white shadow-sm">
          <div className="grid gap-2 border-b border-border p-3 sm:grid-cols-2 xl:grid-cols-[minmax(15rem,1fr)_10rem_10rem_auto]">
            <SearchBar value={search} placeholder="Search by ID, title, slug, excerpt or category..." onChange={(value) => { setSearch(value); setCurrentPage(1) }} />
            <FilterSelect value={categoryFilter} options={[{ label: 'All Categories', value: 'all' }, ...categories.map((category) => ({ label: category, value: category }))]} onChange={(value) => { setCategoryFilter(value); setCurrentPage(1) }} />
            <FilterSelect value={sortOrder} options={[{ label: 'Latest First', value: 'latest' }, { label: 'Oldest First', value: 'oldest' }]} onChange={(value) => { setSortOrder(value); setCurrentPage(1) }} />
            <button type="button" title="Reset filters" onClick={resetFilters} className="h-8 rounded-md border border-primary-border bg-white px-3 text-tiny font-semibold text-primary transition-colors hover:bg-primary-hover">Reset</button>
          </div>

          {actionError && <p className="m-3 rounded-lg bg-accent-soft px-3 py-2 text-tiny font-medium text-accent">{actionError}</p>}
          {error && <p className="m-3 rounded-lg bg-accent-soft px-3 py-2 text-tiny font-medium text-accent">{error}</p>}
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-12 text-small text-text-muted"><LoaderCircle size={18} className="animate-spin text-primary" />Loading safety tips...</div>
          ) : (
            <Table columns={columns} rows={tableRows} />
          )}

          <Pagination currentPage={activePage} totalPages={totalPages} totalItems={totalBlogs} pageSize={tipsPerPage} currentItemCount={displayedBlogs.length} itemLabel="tips" onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  )
}

export default SafetyTips
