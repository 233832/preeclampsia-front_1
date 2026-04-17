import axios, { AxiosError } from "axios"
import { resolveApiOrigin, shouldIncludeCredentials } from "@/lib/api-base-url"
import { getAuthToken, notifyUnauthorized } from "@/lib/auth-token-store"

export const axiosClient = axios.create({
  baseURL: resolveApiOrigin(),
  withCredentials: true,
  timeout: 20000,
})

axiosClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  const includeCredentials = shouldIncludeCredentials()

  if (!includeCredentials) {
    config.withCredentials = false
  } else if (typeof config.withCredentials === "undefined") {
    config.withCredentials = true
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      notifyUnauthorized()
    }

    return Promise.reject(error)
  },
)
