import axios from 'axios'
import { clearAuthSession } from '../utils/auth'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url ?? '')
    const isAuthenticationRequest = requestUrl.includes('/auth/')

    if (error.response?.status === 401 && !isAuthenticationRequest) {
      clearAuthSession()
      window.location.assign('/login')
    }

    return Promise.reject(error)
  },
)

export const apiUrls = {
  sendOtp: `${apiBaseUrl}/auth/send-otp`,
  verifyOtp: `${apiBaseUrl}/auth/verify-otp`,
  users: `${apiBaseUrl}/user`,
  roles: `${apiBaseUrl}/role`,
  permissions: `${apiBaseUrl}/permission`,
  permissionModules: `${apiBaseUrl}/permission/modules`,
  createRole: `${apiBaseUrl}/role/`,
  updateRole: (roleId: string) => `${apiBaseUrl}/role/${roleId}`,
  accidentReports: `${apiBaseUrl}/accident/all`,
  accidentReportById: (reportId: string) =>
    `${apiBaseUrl}/accident/${reportId}`,
  deleteAccidentReport: (reportId: string) =>
    `${apiBaseUrl}/accident/${reportId}`,
  updateAccidentReportStatus: (reportId: string) =>
    `${apiBaseUrl}/accident/${reportId}/status`,
  blogs: `${apiBaseUrl}/blogs`,
  blogById: (blogId: string) => `${apiBaseUrl}/blogs/${blogId}`,
  deleteBlog: (blogId: string) => `${apiBaseUrl}/blogs/${blogId}`,
  helplines: `${apiBaseUrl}/helpline/`,
}
