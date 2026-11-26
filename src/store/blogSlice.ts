import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  BlogListItem,
  BlogListResponse,
  BlogState,
  CreateBlogResponse,
} from '../types'

const initialState: BlogState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  isLoading: false,
  error: '',
  lastCreatedBlog: null,
}

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    setBlogLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setBlogError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    setBlogs: (state, action: PayloadAction<BlogListResponse>) => {
      state.items = action.payload.data
        .filter((blog) => !blog.status || blog.status === 'published')
        .map((blog) => ({ ...blog, status: 'published' }))
      state.total = action.payload.pagination.total
      state.page = action.payload.pagination.page
      state.limit = action.payload.pagination.limit
      state.totalPages = Math.max(1, action.payload.pagination.totalPages)
      state.error = ''
    },
    removeBlog: (state, action: PayloadAction<string>) => {
      const existed = state.items.some((blog) => blog.id === action.payload)
      state.items = state.items.filter((blog) => blog.id !== action.payload)
      if (existed) {
        state.total = Math.max(0, state.total - 1)
        state.totalPages = Math.max(1, Math.ceil(state.total / state.limit))
      }
    },
    setLastCreatedBlog: (
      state,
      action: PayloadAction<CreateBlogResponse['data']>,
    ) => {
      state.lastCreatedBlog = action.payload
      const createdBlog: BlogListItem = {
        id: action.payload._id,
        title: action.payload.title,
        slug: action.payload.slug,
        excerpt: action.payload.excerpt,
        coverImage: action.payload.coverImage ?? '',
        category: action.payload.category,
        readTime: action.payload.readTime,
        status: 'published',
        publishedAt:
          action.payload.publishedAt ?? action.payload.createdAt,
      }
      state.items = [
        createdBlog,
        ...state.items.filter((blog) => blog.id !== createdBlog.id),
      ]
      state.total += 1
      state.totalPages = Math.max(1, Math.ceil(state.total / state.limit))
    },
    setUpdatedBlog: (
      state,
      action: PayloadAction<CreateBlogResponse['data']>,
    ) => {
      const updatedBlog: BlogListItem = {
        id: action.payload._id,
        title: action.payload.title,
        slug: action.payload.slug,
        excerpt: action.payload.excerpt,
        coverImage: action.payload.coverImage,
        category: action.payload.category,
        readTime: action.payload.readTime,
        status: 'published',
        publishedAt:
          action.payload.publishedAt ?? action.payload.createdAt,
      }
      const blogIndex = state.items.findIndex(
        (blog) => blog.id === updatedBlog.id,
      )
      if (blogIndex >= 0) state.items[blogIndex] = updatedBlog
      else state.items.unshift(updatedBlog)
    },
  },
})

export const {
  removeBlog,
  setBlogError,
  setBlogLoading,
  setBlogs,
  setLastCreatedBlog,
  setUpdatedBlog,
} = blogSlice.actions

export default blogSlice.reducer
