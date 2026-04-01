import axios from 'axios'

const client = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false  // ← prevents parallel refresh calls

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    const isRefreshCall = original?.url?.includes('/auth/refresh')
    const isLoginCall   = original?.url?.includes('/auth/login')
    const isGetMeCall   = original?.url?.includes('/auth/me')

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !isRefreshCall &&
      !isLoginCall &&
      !isGetMeCall       // ← do NOT retry getMe, it's the session check
    ) {
      if (isRefreshing) return Promise.reject(error)  // ← block parallel retries
      isRefreshing = true
      original._retry = true

      try {
        await client.post('/api/v1/auth/refresh')
        isRefreshing = false
        return client(original)
      } catch {
        isRefreshing = false
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default client