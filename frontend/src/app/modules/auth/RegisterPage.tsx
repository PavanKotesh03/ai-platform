import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth'
import Input from '../../common/Input'
import Button from '../../common/Button'

interface FormData {
  username: string
  email: string
  password: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ mode: 'onBlur' })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await authService.register(data)
      navigate('/login', { state: { message: 'Account created! Please log in.' } })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      setServerError(error.response?.data?.detail || 'Something went wrong. Try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F8F8] px-4">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#761819]">
            <span className="text-xl font-bold text-white">A</span>
          </div>
          <h1 className="text-3xl font-bold text-[#002126]">Agentic AI</h1>
          <p className="mt-1 text-sm text-[#6D6E6F]">AI Workflow Platform</p>
        </div>

        <div className="rounded-xl border border-[#DDDDDD] bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-[#002126]">Create account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Username"
              placeholder="Enter your username"
              error={errors.username?.message}
              {...register('username', {
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' },
              })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: emailPattern, message: 'Enter a valid email' },
              })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 characters"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
            />

            {serverError && <p className="text-sm text-red-500">{serverError}</p>}

            <Button type="submit" loading={isSubmitting}>Register</Button>
          </form>

          <p className="mt-4 text-center text-sm text-[#6D6E6F]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#761819] hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}