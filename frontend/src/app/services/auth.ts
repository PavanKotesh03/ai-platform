import client from './client'
import type { User, RegisterRequest, LoginRequest } from '@/app/store/types'

export const authService = {
  register: (data: RegisterRequest) =>
    client.post('/api/v1/auth/register', data),

  login: (data: LoginRequest) =>
    client.post('/api/v1/auth/login', data),

  logout: () =>
    client.post('/api/v1/auth/logout'),

  getMe: () =>
    client.get<User>('/api/v1/auth/me'),
}