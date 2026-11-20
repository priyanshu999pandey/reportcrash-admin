import {
  ArrowLeft,
  Eye,
  EyeOff,
  Info,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useState, type SubmitEventHandler } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/baseComponents/Button'
import type { AdminRole, CreateAdminForm, CreateUserProps } from '../../types'
import { getCreatableRoles } from '../../utils/permissions'

const roleDescriptions: Record<AdminRole, string> = {
  'Super Admin': 'Full access to all modules and system settings.',
  Admin: 'Manage reports, alerts, users and hospitals.',
  'Content Admin': 'Manage the Safety & Tips page.',
}

const CreateUser = ({ currentRole }: CreateUserProps) => {
  const navigate = useNavigate()
  const availableRoles = getCreatableRoles(currentRole)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<CreateAdminForm>({
    name: '', email: '', role: '', password: '', confirmPassword: '',
  })

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.role) {
      setError('Please complete all required fields.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password do not match.')
      return
    }
    console.log('Created administrator:', form)
    navigate('/users')
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <button type="button" onClick={() => navigate('/users')} className="mb-4 inline-flex items-center gap-2 text-small font-semibold text-text-muted transition-colors hover:text-primary">
          <ArrowLeft size={16} /> Users <span>/</span> <strong className="text-text">Create User</strong>
        </button>

        <div className="mb-5">
          <h1 className="m-0 text-title font-bold tracking-tight text-text">Create User</h1>
          <p className="mt-1 mb-0 text-small text-text-muted">Add a new administrator and assign the appropriate role.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <form onSubmit={handleSubmit} className="rounded-xl border border-border-soft bg-white p-4 shadow-sm sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-tiny font-semibold text-text">Full Name <span className="text-primary">*</span></span>
                <span className="relative block">
                  <UserRound size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" />
                  <input type="text" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Enter full name" className="h-10 w-full rounded-lg border border-border bg-white pr-3 pl-10 text-small text-text outline-none transition-colors focus:border-primary" />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-tiny font-semibold text-text">Email Address <span className="text-primary">*</span></span>
                <span className="relative block">
                  <Mail size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" />
                  <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Enter email address" className="h-10 w-full rounded-lg border border-border bg-white pr-3 pl-10 text-small text-text outline-none transition-colors focus:border-primary" />
                </span>
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-tiny font-semibold text-text">Role <span className="text-primary">*</span></span>
                <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as AdminRole }))} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-small text-text outline-none transition-colors focus:border-primary">
                  <option value="">Select role</option>
                  {availableRoles.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </label>

              {form.role && (
                <div className="flex items-start gap-3 rounded-lg border border-primary-border bg-primary-faint p-3 sm:col-span-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><ShieldCheck size={17} /></span>
                  <div><p className="m-0 text-small font-semibold text-text">{form.role}</p><p className="mt-1 mb-0 text-tiny text-text-muted">{roleDescriptions[form.role]}</p></div>
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-tiny font-semibold text-text">Password <span className="text-primary">*</span></span>
                <span className="relative block">
                  <LockKeyhole size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" />
                  <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Enter password" className="h-10 w-full rounded-lg border border-border bg-white pr-10 pl-10 text-small text-text outline-none transition-colors focus:border-primary" />
                  <button type="button" title={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)} className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-text-muted hover:text-primary">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-tiny font-semibold text-text">Confirm Password <span className="text-primary">*</span></span>
                <span className="relative block">
                  <LockKeyhole size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-text-muted" />
                  <input type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))} placeholder="Confirm password" className="h-10 w-full rounded-lg border border-border bg-white pr-10 pl-10 text-small text-text outline-none transition-colors focus:border-primary" />
                  <button type="button" title={showConfirmPassword ? 'Hide password' : 'Show password'} onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-text-muted hover:text-primary">{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </span>
              </label>
            </div>

            {error && <p className="mt-4 mb-0 rounded-lg bg-accent-soft px-3 py-2 text-tiny font-semibold text-accent">{error}</p>}

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
              <Button variant="outline" size="small" onClick={() => navigate('/users')}>Cancel</Button>
              <Button type="submit" variant="red" size="small" disabled={availableRoles.length === 0}>Create User</Button>
            </div>
          </form>

          <div className="flex items-start gap-3 rounded-xl border border-primary-border bg-primary-faint p-4 shadow-sm lg:sticky lg:top-20">
            <Info size={18} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <h2 className="m-0 text-small font-bold text-text">Role Creation Rules</h2>
              <ul className="mt-2 mb-0 space-y-2 pl-4 text-tiny leading-relaxed text-text-muted">
                <li>Super Admin can create Admin and Content Admin only.</li>
                <li>Admin can create Content Admin only.</li>
                <li>Content Admin cannot create administrator accounts.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateUser
