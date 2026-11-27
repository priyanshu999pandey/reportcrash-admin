import axios from 'axios'
import {
  CheckCircle2,
  Eye,
  LoaderCircle,
  Pencil,
  PhoneCall,
  PhoneOff,
  Plus,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/baseComponents/Button'
import DeleteConfirmationModal from '../../components/baseComponents/DeleteConfirmationModal'
import FilterSelect from '../../components/baseComponents/FilterSelect'
import Pagination from '../../components/baseComponents/Pagination'
import SearchBar from '../../components/baseComponents/SearchBar'
import StatisticCard from '../../components/baseComponents/StatisticCard'
import Table from '../../components/baseComponents/Table'
import { apiUrls } from '../../config/api'
import {
  removeHelpline,
  setHelplineError,
  setHelplineLoading,
  setHelplines,
} from '../../store/helplineSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import type {
  EmergencyHelpline,
  EmergencyHelplineListResponse,
  TableColumn,
  TableRow,
} from '../../types'
import { hasAuthPermission } from '../../utils/auth'

const columns: TableColumn[] = [
  { key: 'number', header: '#' },
  { key: 'name', header: 'Helpline Name' },
  { key: 'phone', header: 'Number' },
  { key: 'category', header: 'Category' },
  { key: 'description', header: 'Description' },
  { key: 'status', header: 'Status' },
  { key: 'createdAt', header: 'Created At' },
  { key: 'actions', header: 'Actions' },
]

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))

const EmergencyHelplines = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const {
    items: helplines,
    isLoading,
    error,
  } = useAppSelector((state) => state.helplines)
  const adminRole = useAppSelector((state) => state.auth.adminRole)
  const canCreateHelplines = hasAuthPermission(adminRole, 'helplines:create')
  const canUpdateHelplines = hasAuthPermission(adminRole, 'helplines:update')
  const canDeleteHelplines = hasAuthPermission(adminRole, 'helplines:delete')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('latest')
  const [deletingId, setDeletingId] = useState('')
  const [helplinePendingDelete, setHelplinePendingDelete] = useState<EmergencyHelpline | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const helplinesPerPage = 10

  useEffect(() => {
    const controller = new AbortController()

    const loadHelplines = async () => {
      dispatch(setHelplineLoading(true))
      dispatch(setHelplineError(''))

      try {
        const response = await axios.get(apiUrls.helplines, {
          signal: controller.signal,
        })
        const result = response.data as EmergencyHelplineListResponse
        dispatch(
          setHelplines(
            result.data.filter((helpline) => !helpline.isDeleted),
          ),
        )
      } catch (requestError: unknown) {
        if (axios.isCancel(requestError)) return
        if (axios.isAxiosError(requestError)) {
          dispatch(
            setHelplineError(
              requestError.response?.data?.message ?? requestError.message,
            ),
          )
        } else {
          dispatch(setHelplineError('Unable to load emergency helplines.'))
        }
      } finally {
        if (!controller.signal.aborted) {
          dispatch(setHelplineLoading(false))
        }
      }
    }

    void loadHelplines()
    return () => controller.abort()
  }, [dispatch])

  const categories = useMemo(
    () => [...new Set(helplines.map((helpline) => helpline.category))],
    [helplines],
  )

  const filteredHelplines = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matchingHelplines = helplines.filter((helpline) => {
      const matchesSearch =
        !query ||
        helpline.name.toLowerCase().includes(query) ||
        helpline.number.toLowerCase().includes(query) ||
        helpline.category.toLowerCase().includes(query) ||
        helpline.description.toLowerCase().includes(query)
      const matchesCategory =
        categoryFilter === 'all' || helpline.category === categoryFilter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? helpline.isActive : !helpline.isActive)

      return matchesSearch && matchesCategory && matchesStatus
    })

    return [...matchingHelplines].sort((first, second) =>
      sortOrder === 'oldest'
        ? first.createdAt.localeCompare(second.createdAt)
        : second.createdAt.localeCompare(first.createdAt),
    )
  }, [categoryFilter, helplines, search, sortOrder, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredHelplines.length / helplinesPerPage))
  const activePage = Math.min(currentPage, totalPages)
  const firstHelplineIndex = (activePage - 1) * helplinesPerPage
  const paginatedHelplines = filteredHelplines.slice(firstHelplineIndex, firstHelplineIndex + helplinesPerPage)

  const activeHelplines = helplines.filter((helpline) => helpline.isActive).length
  const inactiveHelplines = helplines.length - activeHelplines

  const resetFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setStatusFilter('all')
    setSortOrder('latest')
    setCurrentPage(1)
  }

  const deleteHelpline = async (helpline: EmergencyHelpline) => {
    try {
      setDeletingId(helpline._id)
      dispatch(setHelplineError(''))
      await axios.delete(`${apiUrls.helplines}${helpline._id}`)
      dispatch(removeHelpline(helpline._id))
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        dispatch(
          setHelplineError(
            requestError.response?.data?.message ?? requestError.message,
          ),
        )
      } else {
        dispatch(setHelplineError('Unable to delete emergency helpline.'))
      }
    } finally {
      setDeletingId('')
      setHelplinePendingDelete(null)
    }
  }

  const rows: TableRow[] = paginatedHelplines.map((helpline, index) => ({
    key: helpline._id,
    cells: {
      number: firstHelplineIndex + index + 1,
      name: (
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <PhoneCall size={16} />
          </span>
          <span className="font-semibold text-text">{helpline.name}</span>
        </div>
      ),
      phone: (
        <span className="inline-flex rounded-full bg-primary-faint px-2.5 py-1 font-bold text-text">
          {helpline.number}
        </span>
      ),
      category: (
        <span className="inline-flex rounded-full bg-primary-soft px-2.5 py-1 font-semibold text-primary">
          {helpline.category}
        </span>
      ),
      description: helpline.description,
      status: (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 font-semibold ${
            helpline.isActive
              ? 'bg-chart-green-soft text-chart-green-dark'
              : 'bg-accent-soft text-accent'
          }`}
        >
          {helpline.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
      createdAt: formatDate(helpline.createdAt),
      actions: (
        <div className="flex items-center gap-1">
          <button type="button" title="View helpline" onClick={() => navigate(`/emergency-helplines/view/${helpline._id}`, { state: { helpline } })} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary"><Eye size={17} /></button>
          {canUpdateHelplines && <button type="button" title="Edit helpline" onClick={() => navigate(`/emergency-helplines/edit/${helpline._id}`, { state: { helpline } })} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary"><Pencil size={16} /></button>}
          {canDeleteHelplines && <button type="button" title="Delete helpline" disabled={deletingId === helpline._id} onClick={() => setHelplinePendingDelete(helpline)} className="flex h-8 w-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary-soft disabled:opacity-50">{deletingId === helpline._id ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}</button>}
        </div>
      ),
    },
  }))

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="m-0 text-title font-bold tracking-tight text-text">Emergency Helplines</h1>
            <p className="mt-1 mb-0 text-small text-text-muted">Manage emergency helpline numbers and their details for users.</p>
          </div>
          {canCreateHelplines && <Button variant="red" size="small" onClick={() => navigate('/emergency-helplines/create')} className="gap-2 self-start sm:self-auto"><Plus size={16} />Create Helpline</Button>}
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <StatisticCard id="total-helplines" label="Total Helplines" value={helplines.length} icon={PhoneCall} tone="accent" />
          <StatisticCard id="active-helplines" label="Active Helplines" value={activeHelplines} icon={CheckCircle2} tone="green" />
          <StatisticCard id="inactive-helplines" label="Inactive Helplines" value={inactiveHelplines} icon={PhoneOff} tone="amber" />
        </div>

        <div className="overflow-visible rounded-xl border border-border-soft bg-white shadow-sm">
          <div className="grid gap-2 border-b border-border p-3 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_10rem_11rem_9rem_auto]">
            <SearchBar value={search} placeholder="Search by name, number, description or category..." onChange={(value) => { setSearch(value); setCurrentPage(1) }} />
            <FilterSelect value={categoryFilter} options={[{ label: 'All Categories', value: 'all' }, ...categories.map((category) => ({ label: category, value: category }))]} onChange={(value) => { setCategoryFilter(value); setCurrentPage(1) }} />
            <FilterSelect value={statusFilter} options={[{ label: 'All Status', value: 'all' }, { label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} onChange={(value) => { setStatusFilter(value); setCurrentPage(1) }} />
            <FilterSelect value={sortOrder} options={[{ label: 'Latest First', value: 'latest' }, { label: 'Oldest First', value: 'oldest' }]} onChange={(value) => { setSortOrder(value); setCurrentPage(1) }} />
            <button type="button" title="Reset filters" onClick={resetFilters} className="flex h-8 items-center justify-center rounded-md border border-primary-border bg-white px-3 text-tiny font-semibold text-primary transition-colors hover:bg-primary-hover">Reset</button>
          </div>

          {error && <p className="m-3 rounded-lg bg-accent-soft px-3 py-2 text-tiny font-medium text-accent">{error}</p>}
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-12 text-small text-text-muted"><LoaderCircle size={18} className="animate-spin text-primary" />Loading helplines...</div>
          ) : (
            <Table columns={columns} rows={rows} />
          )}

          <Pagination currentPage={activePage} totalPages={totalPages} totalItems={filteredHelplines.length} pageSize={helplinesPerPage} currentItemCount={paginatedHelplines.length} itemLabel="helplines" onPageChange={setCurrentPage} />
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={Boolean(helplinePendingDelete)}
        title="Delete emergency helpline?"
        message={helplinePendingDelete ? `${helplinePendingDelete.name} will be permanently removed and will no longer be available to users.` : ''}
        isDeleting={deletingId === helplinePendingDelete?._id}
        onCancel={() => setHelplinePendingDelete(null)}
        onConfirm={() => {
          if (helplinePendingDelete) void deleteHelpline(helplinePendingDelete)
        }}
      />
    </div>
  )
}

export default EmergencyHelplines
