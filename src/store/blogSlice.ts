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
    },
  },
})

export const {
  removeBlog,
  setBlogError,
  setBlogLoading,
  setBlogs,
  setLastCreatedBlog,
} = blogSlice.actions

export default blogSlice.reducer
