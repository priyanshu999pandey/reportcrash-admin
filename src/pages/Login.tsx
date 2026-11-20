
import axios from 'axios'
import { Eye, EyeOff } from 'lucide-react'
import { useState, type SubmitEventHandler } from 'react'
import Button from '../components/baseComponents/Button'
import logo from '../assets/Logo.svg'
import loginBackground from '../assets/login_bg.webp'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()

    try {
      const credentials = { email, password }

      console.log('Login credentials:', credentials)
      navigate('/dashboard')

    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Login request failed:', error.message)
        return
      }

      console.error('Unexpected login error:', error)
    }
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-5 py-10"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      <div className="absolute inset-0 bg-text-overlay" />

      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-lg sm:p-10"
      >
        <img
          src={logo}
          alt="Report Crash"
          className="mb-10 h-10 w-auto"
          width="194"
          height="40"
        />

        <div className="mb-8">
          <p className="mb-2 text-small font-bold tracking-widest text-accent uppercase">
            Secure access
          </p>

          <h1
        
            className="text-title font-bold tracking-tight text-text"
          >
            Log in to your account
          </h1>

          <p className="mt-3 text-body leading-6 text-text-muted">
            Enter your email and password to continue.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-2 block text-body font-semibold text-text">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="h-12 w-full rounded-lg border border-border bg-white px-4 text-body text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary-soft"
              placeholder="name@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-body font-semibold text-text">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="h-12 w-full rounded-lg border border-border bg-white px-4 pr-12 text-body text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary-soft"
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-full border-0 bg-transparent text-text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" variant="red" fullWidth>
            Log in
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Login
