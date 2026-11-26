import axios from 'axios'
import {
  ArrowLeft,
  CalendarDays,
  CircleUserRound,
  Clock3,
  History,
  LoaderCircle,
  MapPin,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Siren,
  UserRound,
  Users,
} from 'lucide-react'
import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/baseComponents/Button'
import { apiUrls } from '../../config/api'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  setSelectedSosAlert,
  setSosAlertDetailError,
  setSosAlertDetailLoading,
} from '../../store/sosAlertSlice'
import type {
  SosAlertApiResponse,
  SosAlertNavigationState,
} from '../../types'

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

const SosAlertDetails = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { sosId } = useParams<{ sosId: string }>()
  const navigationAlert = (location.state as SosAlertNavigationState | null)
    ?.alert
  const { selectedAlert, isDetailLoading, detailError } = useAppSelector(
    (state) => state.sosAlerts,
  )
  const storedListAlert = useAppSelector((state) =>
    state.sosAlerts.items.find((item) => item._id === sosId),
  )
  const alert =
    selectedAlert?._id === sosId
      ? selectedAlert
      : navigationAlert?._id === sosId
        ? navigationAlert
        : storedListAlert

  useEffect(() => {
    if (!sosId) return
    const controller = new AbortController()

    const loadAlert = async () => {
      dispatch(setSosAlertDetailLoading(true))
      dispatch(setSosAlertDetailError(''))

      try {
        const response = await axios.get(apiUrls.sosAlertById(sosId), {
          signal: controller.signal,
        })
        const result = response.data as SosAlertApiResponse
        if (!result.success) {
          dispatch(setSosAlertDetailError(result.message || 'SOS alert not found.'))
          return
        }
        dispatch(setSelectedSosAlert(result.data))
      } catch (requestError: unknown) {
        if (axios.isCancel(requestError)) return
        dispatch(
          setSosAlertDetailError(
            axios.isAxiosError(requestError)
              ? (requestError.response?.data?.message ?? requestError.message)
              : 'Unable to load SOS alert details.',
          ),
        )
      } finally {
        if (!controller.signal.aborted) dispatch(setSosAlertDetailLoading(false))
      }
    }

    void loadAlert()
    return () => controller.abort()
  }, [dispatch, sosId])

  if (isDetailLoading && !alert) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center gap-2 bg-primary-page text-small text-text-muted">
        <LoaderCircle size={20} className="animate-spin text-primary" />Loading SOS alert details...
      </div>
    )
  }

  if (!alert) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
        <div className="mx-auto max-w-[1440px] rounded-xl border border-border bg-white p-6 text-center shadow-sm">
          <h1 className="m-0 text-title font-bold text-text">SOS alert not found</h1>
          <p className="mt-2 mb-0 text-small text-accent">{detailError || 'The requested SOS alert is unavailable.'}</p>
          <Button variant="red" size="small" onClick={() => navigate('/sos-alerts')} className="mt-4 gap-2"><ArrowLeft size={16} />Back to SOS Alerts</Button>
        </div>
      </div>
    )
  }

  const userName = alert.user.name?.trim() || alert.user.email.split('@')[0]
  const successfulRecipients = alert.recipients.filter(
    (recipient) => recipient.status.toLowerCase() === 'sent',
  ).length

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <button type="button" onClick={() => navigate('/sos-alerts')} className="mb-4 inline-flex items-center gap-2 text-small font-semibold text-text-muted transition-colors hover:text-primary">
          <ArrowLeft size={16} />SOS Alerts <span>/</span><strong className="text-text">Alert Details</strong>
        </button>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="m-0 text-title font-bold tracking-tight text-text">SOS Alert Details</h1>
            <p className="mt-1 mb-0 break-all text-small text-text-muted">{alert._id}</p>
          </div>
          <span className={`inline-flex self-start rounded-full px-3 py-1.5 text-tiny font-semibold capitalize ${alert.status.toLowerCase() === 'resolved' ? 'bg-chart-green-soft text-chart-green-dark' : 'bg-accent-soft text-accent'}`}>{alert.status}</span>
        </div>

        {detailError && <p className="mb-4 rounded-lg bg-accent-soft px-4 py-2.5 text-tiny font-medium text-accent">{detailError}</p>}

        <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="rounded-xl border border-border-soft bg-white p-5 text-center shadow-sm">
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary"><CircleUserRound size={40} /></span>
              <h2 className="mt-3 mb-1 text-body font-bold text-text">{userName}</h2>
              <p className="m-0 break-all text-small text-text-muted">{alert.user.email}</p>
              <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-tiny font-semibold ${alert.user.isActive ? 'bg-chart-green-soft text-chart-green-dark' : 'bg-accent-soft text-accent'}`}>{alert.user.isActive ? 'Active' : 'Inactive'}</span>
              <div className="mt-5 space-y-3 border-t border-border pt-4 text-left">
                <div className="flex gap-3"><Phone size={16} className="shrink-0 text-primary" /><span className="text-small text-text">{alert.user.phone || 'Not available'}</span></div>
                <div className="flex gap-3"><ShieldCheck size={16} className="shrink-0 text-primary" /><span className="text-small capitalize text-text">{alert.user.role}</span></div>
              </div>
            </div>

            <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2"><Users size={18} className="text-primary" /><h2 className="m-0 text-body font-bold text-text">Recipient Summary</h2></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-primary-faint p-3"><p className="m-0 text-tiny text-text-muted">Total</p><p className="mt-1 mb-0 text-title font-bold text-text">{alert.recipients.length}</p></div>
                <div className="rounded-lg bg-chart-green-soft p-3"><p className="m-0 text-tiny text-chart-green-dark">Sent</p><p className="mt-1 mb-0 text-title font-bold text-chart-green-dark">{successfulRecipients}</p></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary"><Siren size={20} /></span>
                <div><h2 className="m-0 text-body font-bold text-text">SOS Information</h2><p className="mt-1 mb-0 text-tiny text-text-muted">Alert time, location and emergency message.</p></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3"><CalendarDays size={17} className="mt-0.5 shrink-0 text-primary" /><div><p className="m-0 text-tiny text-text-muted">Triggered At</p><p className="mt-1 mb-0 text-small font-medium text-text">{formatDateTime(alert.triggeredAt)}</p></div></div>
                <div className="flex gap-3"><Clock3 size={17} className="mt-0.5 shrink-0 text-primary" /><div><p className="m-0 text-tiny text-text-muted">Last Updated</p><p className="mt-1 mb-0 text-small font-medium text-text">{formatDateTime(alert.updatedAt)}</p></div></div>
                <div className="flex gap-3 sm:col-span-2"><MapPin size={17} className="mt-0.5 shrink-0 text-primary" /><div><p className="m-0 text-tiny text-text-muted">Location</p><p className="mt-1 mb-0 text-small font-medium text-text">{alert.location.address || 'Not available'}</p><p className="mt-1 mb-0 text-tiny text-text-muted">{alert.location.latitude}, {alert.location.longitude}</p></div></div>
                <div className="rounded-lg bg-primary-faint p-3 sm:col-span-2"><div className="flex items-center gap-2"><MessageSquareText size={16} className="text-primary" /><p className="m-0 text-tiny font-semibold text-text-muted">Emergency Message</p></div><p className="mt-2 mb-0 text-small text-text">{alert.message || 'No message provided.'}</p></div>
              </div>
            </div>

            <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary"><Users size={20} /></span>
                <div><h2 className="m-0 text-body font-bold text-text">Emergency Recipients</h2><p className="mt-1 mb-0 text-tiny text-text-muted">Notification delivery details for saved contacts.</p></div>
              </div>
              {alert.recipients.length === 0 ? (
                <p className="m-0 text-small text-text-muted">No recipients available.</p>
              ) : (
                <div className="grid gap-3 xl:grid-cols-2">
                  {alert.recipients.map((recipient) => (
                    <div key={`${recipient.emergencyContact}-${recipient.phoneNumber}`} className="rounded-lg border border-border-soft p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 gap-2"><UserRound size={17} className="mt-0.5 shrink-0 text-primary" /><div className="min-w-0"><p className="m-0 font-semibold text-text">{recipient.name}</p><p className="mt-1 mb-0 text-tiny text-text-muted">{recipient.phoneNumber}</p></div></div>
                        <span className={`rounded-full px-2 py-1 text-tiny font-semibold capitalize ${recipient.status.toLowerCase() === 'sent' ? 'bg-chart-green-soft text-chart-green-dark' : 'bg-accent-soft text-accent'}`}>{recipient.status}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-tiny text-text-muted"><span>Priority: {recipient.priority}</span><span>SMS: {recipient.notifyBySms ? 'Enabled' : 'Disabled'}</span><span className="col-span-2 capitalize">Provider: {recipient.provider}</span></div>
                      {recipient.error && <p className="mt-3 mb-0 rounded-md bg-accent-soft px-2.5 py-2 text-tiny text-accent">{recipient.error}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3 border-b border-border pb-4"><History size={20} className="text-primary" /><div><h2 className="m-0 text-body font-bold text-text">Status History</h2><p className="mt-1 mb-0 text-tiny text-text-muted">Timeline of status changes.</p></div></div>
              <div className="space-y-3">
                {alert.statusHistory.map((historyItem, index) => (
                  <div key={`${historyItem.changedAt}-${index}`} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                    <div><p className="m-0 text-small font-semibold capitalize text-text">{historyItem.status}</p><p className="mt-1 mb-0 text-tiny text-text-muted">{formatDateTime(historyItem.changedAt)} · Changed by {historyItem.changedBy}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SosAlertDetails
