import axios from 'axios'

// Singleton Axios instance — one place to set baseURL, auth headers, timeouts.
// Never import raw axios elsewhere in the app; always import from this module.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
})

// Response interceptor: normalize error messages from the backend ErrorResponse DTO
// so callers always receive a plain Error with a readable .message string.
api.interceptors.response.use(
  response => response,
  error => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Request failed'
    return Promise.reject(new Error(message))
  }
)

export default api
