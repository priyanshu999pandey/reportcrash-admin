import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  BlogListItem,
  BlogState,
  CreateBlogResponse,
} from '../types'

const initialState: BlogState = {
  items: [],
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
    setBlogs: (state, action: PayloadAction<BlogListItem[]>) => {
      state.items = action.payload
        .filter((blog) => !blog.status || blog.status === 'published')
        .map((blog) => ({ ...blog, status: 'published' }))
      state.error = ''
    },
    removeBlog: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((blog) => blog.id !== action.payload)
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
