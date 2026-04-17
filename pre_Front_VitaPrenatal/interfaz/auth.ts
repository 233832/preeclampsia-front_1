export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterResponse {
  id: number
  email: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface AuthState {
  isAuthenticated: boolean
  initializing: boolean
  loading: boolean
  errorMessage: string | null
}

export interface AuthContextValue extends AuthState {
  register: (email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}
