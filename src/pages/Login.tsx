import axios from 'axios'
import {
  ArrowLeft,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type SubmitEventHandler,
} from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/Logo.svg'
import loginBackground from '../assets/login_bg.webp'
import Button from '../components/baseComponents/Button'
import { apiUrls } from '../config/api'
import { loginSuccess } from '../store/authSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setPermissions } from '../store/rolePermissionSlice'
import type {
  AuthAdminRole,
  PermissionsResponse,
  SendOtpResponse,
  VerifyOtpResponse,
} from '../types'
import { getAuthHomeRoute, saveAuthSession } from '../utils/auth'

const authenticationType = 'signin'

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isAuthenticated, adminRole } = useAppSelector((state) => state.auth)
  const otpInputs = useRef<Array<HTMLInputElement | null>>([])
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isAuthenticated) navigate(getAuthHomeRoute(adminRole), { replace: true })
  }, [adminRole, isAuthenticated, navigate])

  const requestOtp = async (isResend = false) => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setError('Enter your admin email address.')
      return
    }

    try {
      if (isResend) setIsResending(true)
      else setIsSubmitting(true)
      setError('')
      setMessage('')

      const response = await axios.post(apiUrls.sendOtp, {
        email: normalizedEmail,
      })
      const result = response.data as SendOtpResponse

      if (!result.success) {
        setError(result.message || 'Unable to send OTP.')
        return
      }

      setEmail(result.data.email || normalizedEmail)
      setOtp(['', '', '', '', '', ''])
      setStep('otp')
      setMessage(result.message || 'OTP sent successfully.')
      setTimeout(() => otpInputs.current[0]?.focus(), 0)
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.message ?? requestError.message)
      } else {
        setError('Unable to send OTP.')
      }
    } finally {
      setIsSubmitting(false)
      setIsResending(false)
    }
  }

  const verifyOtp = async () => {
    const code = otp.join('')
    if (code.length !== 6) {
      setError('Enter the complete 6-digit OTP.')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      const response = await axios.post(apiUrls.verifyOtp, {
        email: email.trim().toLowerCase(),
        otp: code,
        type: authenticationType,
      })
      const result = response.data as VerifyOtpResponse
      
      if (!result.success || !result.data.token) {
        setError(result.message || 'OTP verification failed.')
        return
      }

      if (result.data.user.role.trim().toLowerCase() !== 'admin') {
        setError('Only admin accounts can access this panel.')
        return
      }

      const assignedRole: AuthAdminRole | null =
        result.data.adminRole ?? result.data.user.adminRole ?? null

      if (!assignedRole) {
        setError('No admin role is assigned to this account.')
        return
      }

      const permissionsResponse = await axios.get(apiUrls.permissions, {
          headers: { Authorization: `Bearer ${result.data.token}` },
      })
      const permissionsResult =
        permissionsResponse.data as PermissionsResponse

      if (!permissionsResult.success) {
        setError(permissionsResult.message || 'Unable to load permissions.')
        return
      }

      const activePermissions = permissionsResult.data.filter(
        (permission) => permission.isActive !== false,
      )
      dispatch(setPermissions(activePermissions))

      if (
        assignedRole.isActive === false ||
        assignedRole.isDeleted === true
      ) {
        setError('No active admin role is assigned to this account.')
        return
      }

      const activeRole: AuthAdminRole = {
        ...assignedRole,
        permissions: activePermissions,
        isActive: true,
      }

      const session = {
        token: result.data.token,
        user: result.data.user,
        adminRole: activeRole,
        isAuthenticated: true,
      }

      saveAuthSession(session)
      dispatch(
        loginSuccess({
          token: session.token,
          user: session.user,
          adminRole: session.adminRole,
        }),
      )
      navigate(getAuthHomeRoute(activeRole), { replace: true })
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.message ?? requestError.message)
      } else {
        setError('Unable to verify OTP.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    if (step === 'email') void requestOtp()
    else void verifyOtp()
  }

  const updateOtp = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setOtp((currentOtp) =>
      currentOtp.map((currentDigit, digitIndex) =>
        digitIndex === index ? digit : currentDigit,
      ),
    )
    setError('')
    if (digit && index < 5) otpInputs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      otpInputs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowRight' && index < 5) {
      otpInputs.current[index + 1]?.focus()
    }
  }

  const handleOtpPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pastedCode = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
    if (!pastedCode) return
    const digits = Array.from({ length: 6 }, (_, index) => pastedCode[index] ?? '')
    setOtp(digits)
    otpInputs.current[Math.min(pastedCode.length, 6) - 1]?.focus()
  }

  const changeEmail = () => {
    setStep('email')
    setOtp(['', '', '', '', '', ''])
    setError('')
    setMessage('')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center px-5 py-10" style={{ backgroundImage: `url(${loginBackground})` }}>
      <div className="absolute inset-0 bg-text-overlay" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-lg sm:p-10">
        <img src={logo} alt="Report Crash" className="mb-8 h-10 w-auto" width="194" height="40" />

        <div className="mb-7">
          <p className="mb-2 text-small font-bold tracking-widest text-accent uppercase">Secure admin access</p>
          <h1 className="m-0 text-title font-bold tracking-tight text-text">{step === 'email' ? 'Log in with email' : 'Verify your email'}</h1>
          <p className="mt-3 mb-0 text-small leading-6 text-text-muted">{step === 'email' ? 'Enter your registered admin email and we will send you a one-time password.' : `Enter the 6-digit OTP sent to ${email}.`}</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {step === 'email' ? (
            <label className="block">
              <span className="mb-2 block text-small font-semibold text-text">Email address</span>
              <input name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" required className="h-12 w-full rounded-lg border border-border bg-white px-4 text-body text-text outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-3 focus:ring-primary-soft" />
            </label>
          ) : (
            <div>
              <div className="mb-2 flex items-center justify-between gap-3"><span className="text-small font-semibold text-text">One-time password</span><button type="button" onClick={changeEmail} className="inline-flex items-center gap-1 text-tiny font-semibold text-primary"><ArrowLeft size={13} />Change email</button></div>
              <div className="grid grid-cols-6 gap-2">
                {otp.map((digit, index) => (
                  <input key={index} ref={(element) => { otpInputs.current[index] = element }} type="text" inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength={1} value={digit} onChange={(event) => updateOtp(index, event.target.value)} onKeyDown={(event) => handleOtpKeyDown(event, index)} onPaste={handleOtpPaste} className="h-12 min-w-0 rounded-lg border border-border bg-white text-center text-body font-bold text-text outline-none transition focus:border-primary focus:ring-3 focus:ring-primary-soft" />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {message && !error && <p className="m-0 rounded-lg bg-chart-green-soft px-4 py-2.5 text-tiny font-medium text-chart-green-dark">{message}</p>}
            {error && <p className="m-0 rounded-lg bg-accent-soft px-4 py-2.5 text-tiny font-medium text-accent">{error}</p>}

            <Button type="submit" variant="red" fullWidth disabled={isSubmitting} className="gap-2">
              {isSubmitting && <LoaderCircle size={17} className="animate-spin" />}
              {isSubmitting ? (step === 'email' ? 'Sending OTP...' : 'Verifying...') : step === 'email' ? 'Send OTP' : 'Verify & Log In'}
            </Button>
          </div>

          {step === 'otp' && (
            <button type="button" disabled={isResending} onClick={() => void requestOtp(true)} className="mx-auto flex items-center gap-2 text-tiny font-semibold text-primary disabled:opacity-60">
              <RefreshCw size={14} className={isResending ? 'animate-spin' : ''} />
              {isResending ? 'Resending OTP...' : 'Resend OTP'}
            </button>
          )}
        </form>
      </div>
    </div>
  )
}

export default Login
