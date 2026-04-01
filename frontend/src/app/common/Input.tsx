import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-[#1E1F21]">{label}</label>
        )}
        <input
          ref={ref}
          className={`rounded-lg border px-3 py-2 text-sm outline-none transition
            bg-white text-[#1E1F21] placeholder-[#6D6E6F]
            focus:ring-2 focus:ring-[#761819] ${
              error
                ? 'border-red-500 focus:border-red-500'
                : 'border-[#DDDDDD] focus:border-[#761819]'
            }`}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input