import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  loading?: boolean
  variant?: 'primary' | 'ghost'
}

export default function Button({
  children,
  loading,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={loading || props.disabled}
      className={`flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
        variant === 'primary'
          ? 'bg-[#761819] text-white hover:bg-[#5a1213]'
          : 'border border-[#DDDDDD] text-[#002126] hover:bg-[#F8F8F8]'
      }`}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </button>
  )
}