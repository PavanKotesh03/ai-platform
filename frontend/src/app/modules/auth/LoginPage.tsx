import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../../services/auth'
import { useAuth } from '../../store/AuthContext'
import Input from '../../common/Input'
import Button from '../../common/Button'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setUser } = useAuth()
  const [serverError, setServerError] = useState('')

  const successMessage = (location.state as { message?: string })?.message

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema), mode: 'onBlur' })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await authService.login(data)
      const me = await authService.getMe()
      setUser(me.data)
      navigate('/')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      setServerError(error.response?.data?.detail || 'Something went wrong. Try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F8F8] px-4">
      <div className="w-full max-w-md">

        {/* Logo area */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#761819]">
            <span className="text-xl font-bold text-white">A</span>
          </div>
          <h1 className="text-3xl font-bold text-[#002126]">Agentic AI</h1>
          <p className="mt-1 text-sm text-[#6D6E6F]">AI Workflow Platform</p>
        </div>

        <div className="rounded-xl border border-[#DDDDDD] bg-white p-8 shadow-sm">
          {successMessage && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <h2 className="mb-6 text-xl font-semibold text-[#002126]">Welcome back</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input label="Email" type="email" placeholder="Enter your email"
              error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" placeholder="Enter your password"
              error={errors.password?.message} {...register('password')} />

            {serverError && <p className="text-sm text-red-500">{serverError}</p>}

            <Button type="submit" loading={isSubmitting}>Login</Button>
          </form>

          <p className="mt-4 text-center text-sm text-[#6D6E6F]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#761819] hover:underline font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}