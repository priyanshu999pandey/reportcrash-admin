import { ArrowLeft, CalendarDays, CircleUserRound, Clock3, Mail, MapPin, Phone, ShieldCheck, Siren, UserRound } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/baseComponents/Button'
import type { SosAlertNavigationState } from '../../types'

const SosAlertDetails = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const alert = (location.state as SosAlertNavigationState | null)?.alert

  if (!alert) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
        <div className="mx-auto max-w-[1440px] rounded-xl border border-border bg-white p-6 text-center shadow-sm">
          <h1 className="m-0 text-title font-bold text-text">SOS alert not found</h1>
          <Button variant="red" size="small" onClick={() => navigate('/sos-alerts')} className="mt-4 gap-2"><ArrowLeft size={16} /> Back to SOS Alerts</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <button type="button" onClick={() => navigate('/sos-alerts')} className="mb-4 inline-flex items-center gap-2 text-small font-semibold text-text-muted transition-colors hover:text-primary">
          <ArrowLeft size={16} /> SOS Alerts <span>/</span> <strong className="text-text">User Details</strong>
        </button>

        <div className="mb-5">
          <h1 className="m-0 text-title font-bold tracking-tight text-text">SOS User Details</h1>
          <p className="mt-1 mb-0 text-small text-text-muted">View the user and emergency information linked to this SOS alert.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <div className="rounded-xl border border-border-soft bg-white p-5 text-center shadow-sm">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary"><CircleUserRound size={40} /></span>
            <h2 className="mt-3 mb-1 text-body font-bold text-text">{alert.user}</h2>
            <p className="m-0 break-all text-small text-text-muted">{alert.email}</p>
            <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-tiny font-semibold ${alert.userStatus === 'Active' ? 'bg-chart-green-soft text-chart-green-dark' : 'bg-accent-soft text-accent'}`}>{alert.userStatus}</span>
            <div className="mt-5 border-t border-border pt-4 text-left">
              <p className="mb-2 text-tiny font-semibold text-text-muted">SOS ALERT ID</p>
              <p className="m-0 text-small font-bold text-text">{alert.id}</p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary"><UserRound size={20} /></span>
                <div><h2 className="m-0 text-body font-bold text-text">Personal Information</h2><p className="mt-1 mb-0 text-tiny text-text-muted">Basic contact details of the user.</p></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3"><Mail size={17} className="mt-0.5 shrink-0 text-primary" /><div><p className="m-0 text-tiny text-text-muted">Email Address</p><p className="mt-1 mb-0 break-all text-small font-medium text-text">{alert.email}</p></div></div>
                <div className="flex gap-3"><Phone size={17} className="mt-0.5 shrink-0 text-primary" /><div><p className="m-0 text-tiny text-text-muted">Phone Number</p><p className="mt-1 mb-0 text-small font-medium text-text">{alert.phone}</p></div></div>
              </div>
            </div>

            <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary"><Siren size={20} /></span>
                <div><h2 className="m-0 text-body font-bold text-text">SOS Information</h2><p className="mt-1 mb-0 text-tiny text-text-muted">Alert time, location and emergency message.</p></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3"><CalendarDays size={17} className="mt-0.5 shrink-0 text-primary" /><div><p className="m-0 text-tiny text-text-muted">Triggered Date</p><p className="mt-1 mb-0 text-small font-medium text-text">{alert.date}</p></div></div>
                <div className="flex gap-3"><Clock3 size={17} className="mt-0.5 shrink-0 text-primary" /><div><p className="m-0 text-tiny text-text-muted">Triggered Time</p><p className="mt-1 mb-0 text-small font-medium text-text">{alert.time}</p></div></div>
                <div className="flex gap-3 sm:col-span-2"><MapPin size={17} className="mt-0.5 shrink-0 text-primary" /><div><p className="m-0 text-tiny text-text-muted">Location</p><p className="mt-1 mb-0 text-small font-medium text-text">{alert.location}</p><p className="mt-1 mb-0 text-tiny text-text-muted">{alert.coordinates}</p></div></div>
                <div className="rounded-lg bg-primary-faint p-3 sm:col-span-2"><p className="m-0 text-tiny font-semibold text-text-muted">Emergency Message</p><p className="mt-1 mb-0 text-small text-text">{alert.message}</p></div>
              </div>
            </div>

            <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary"><ShieldCheck size={20} /></span>
                <div><h2 className="m-0 text-body font-bold text-text">Emergency Contact</h2><p className="mt-1 mb-0 text-tiny text-text-muted">Person to contact during this emergency.</p></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div><p className="m-0 text-tiny text-text-muted">Name</p><p className="mt-1 mb-0 text-small font-medium text-text">{alert.emergencyContact.name}</p></div>
                <div><p className="m-0 text-tiny text-text-muted">Relationship</p><p className="mt-1 mb-0 text-small font-medium text-text">{alert.emergencyContact.relationship}</p></div>
                <div><p className="m-0 text-tiny text-text-muted">Phone</p><p className="mt-1 mb-0 text-small font-medium text-text">{alert.emergencyContact.phone}</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SosAlertDetails
