import type { ButtonProps } from '../../types'

const Button = ({
  children,
  className = '',
  fullWidth = false,
  size = 'medium',
  type = 'button',
  variant = 'blue',
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
        size === 'tiny'
          ? 'h-7 px-2.5 text-tiny'
          : size === 'small'
            ? 'h-8 px-3 text-tiny'
            : 'h-12 px-5 text-body'
      } ${
        variant === 'red'
          ? 'bg-accent text-white focus-visible:outline-accent'
          : variant === 'outline'
            ? 'border border-accent bg-white text-accent focus-visible:outline-accent'
            : 'bg-primary text-white focus-visible:outline-primary'
      } ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
