import axios from 'axios'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Layers3,
  LoaderCircle,
  Pencil,
  PhoneCall,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/baseComponents/Button'
import { apiUrls } from '../../config/api'
import { removeHelpline, setHelplines } from '../../store/helplineSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import type {
  EmergencyHelpline,
  EmergencyHelplineListResponse,
  EmergencyHelplineNavigationState,
} from '../../types'
import { hasAuthPermission } from '../../utils/auth'

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

const EmergencyHelplineDetails = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { helplineId } = useParams<{ helplineId: string }>()
  const navigationHelpline = (
    location.state as EmergencyHelplineNavigationState | null
  )?.helpline
  const storedHelpline = useAppSelector((state) =>
    state.helplines.items.find((item) => item._id === helplineId),
  )
  const adminRole = useAppSelector((state) => state.auth.adminRole)
  const canUpdateHelplines = hasAuthPermission(adminRole, 'helplines:update')
  const canDeleteHelplines = hasAuthPermission(adminRole, 'helplines:delete')
  const existingHelpline = navigationHelpline ?? storedHelpline
  const [helpline, setHelpline] = useState<EmergencyHelpline | null>(
    existingHelpline ?? null,
  )
  const [isLoading, setIsLoading] = useState(!existingHelpline)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (existingHelpline || !helplineId) return
    const controller = new AbortController()

    const loadHelpline = async () => {
      try {
        const response = await axios.get(apiUrls.helplines, {
          signal: controller.signal,
        })
        const result = response.data as EmergencyHelplineListResponse
        dispatch(
          setHelplines(result.data.filter((item) => !item.isDeleted)),
        )
        const currentHelpline = result.data.find(
          (item) => item._id === helplineId && !item.isDeleted,
        )

        if (!currentHelpline) {
          setError('Emergency helpline not found.')
          return
        }

        setHelpline(currentHelpline)
      } catch (requestError: unknown) {
        if (axios.isCancel(requestError)) return
        if (axios.isAxiosError(requestError)) {
          setError(requestError.response?.data?.message ?? requestError.message)
        } else {
          setError('Unable to load emergency helpline.')
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadHelpline()
    return () => controller.abort()
  }, [dispatch, existingHelpline, helplineId])

  const deleteHelpline = async () => {
    if (!helpline || !window.confirm(`Delete ${helpline.name}?`)) return

    try {
      setIsDeleting(true)
      setError('')
      await axios.delete(`${apiUrls.helplines}${helpline._id}`)
      dispatch(removeHelpline(helpline._id))
      navigate('/emergency-helplines')
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.message ?? requestError.message)
      } else {
        setError('Unable to delete emergency helpline.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center gap-2 bg-primary-page text-small text-text-muted"><LoaderCircle size={18} className="animate-spin text-primary" />Loading helpline details...</div>
  }

  if (!helpline) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
        <div className="mx-auto max-w-2xl rounded-xl border border-border bg-white p-6 text-center shadow-sm">
          <h1 className="m-0 text-title font-bold text-text">Helpline not found</h1>
          <p className="mt-2 text-small text-text-muted">{error || 'This emergency helpline is unavailable.'}</p>
          <Button variant="red" size="small" onClick={() => navigate('/emergency-helplines')} className="mt-4 gap-2"><ArrowLeft size={16} />Back to Helplines</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => navigate('/emergency-helplines')} className="inline-flex items-center gap-2 text-small font-semibold text-text-muted transition-colors hover:text-primary"><ArrowLeft size={16} />Emergency Helplines <span>/</span><strong className="text-text">Helpline Details</strong></button>
          <div className="flex flex-wrap gap-2">
            {canUpdateHelplines && <Button variant="outline" size="small" onClick={() => navigate(`/emergency-helplines/edit/${helpline._id}`, { state: { helpline } })} className="gap-2"><Pencil size={15} />Edit Helpline</Button>}
            {canDeleteHelplines && <Button variant="red" size="small" disabled={isDeleting} onClick={() => void deleteHelpline()} className="gap-2">{isDeleting ? <LoaderCircle size={15} className="animate-spin" /> : <Trash2 size={15} />}{isDeleting ? 'Deleting...' : 'Delete Helpline'}</Button>}
          </div>
        </div>

        {error && <p className="mb-4 rounded-lg bg-accent-soft px-3 py-2 text-small font-medium text-accent">{error}</p>}

        <div className="mb-4 flex flex-col gap-5 rounded-xl border border-border-soft bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><PhoneCall size={36} /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="m-0 text-title font-bold tracking-tight text-text">{helpline.name}</h1>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-tiny font-semibold ${helpline.isActive ? 'bg-chart-green-soft text-chart-green-dark' : 'bg-accent-soft text-accent'}`}>{helpline.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <a href={`tel:${helpline.number}`} className="mt-2 inline-flex items-center gap-2 text-heading font-bold text-primary"><PhoneCall size={18} />{helpline.number}</a>
            <p className="mt-3 mb-0 max-w-3xl text-small leading-6 text-text-muted">{helpline.description}</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3 border-b border-border pb-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><FileText size={18} /></span><h2 className="m-0 text-body font-bold text-text">Helpline Information</h2></div>
            <div className="divide-y divide-border-faint">
              <div className="grid grid-cols-[7rem_1fr] gap-3 py-3 text-small"><span className="text-text-muted">Name</span><strong className="text-text">{helpline.name}</strong></div>
              <div className="grid grid-cols-[7rem_1fr] gap-3 py-3 text-small"><span className="text-text-muted">Number</span><strong className="text-text">{helpline.number}</strong></div>
              <div className="grid grid-cols-[7rem_1fr] gap-3 py-3 text-small"><span className="text-text-muted">Category</span><strong className="text-primary">{helpline.category}</strong></div>
              <div className="grid grid-cols-[7rem_1fr] gap-3 py-3 text-small"><span className="text-text-muted">Description</span><strong className="text-text">{helpline.description}</strong></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-green-soft text-chart-green-dark"><CheckCircle2 size={18} /></span><h2 className="m-0 text-body font-bold text-text">Availability</h2></div>
              <div className={`flex items-start gap-3 rounded-lg p-4 ${helpline.isActive ? 'bg-chart-green-soft' : 'bg-accent-soft'}`}><Layers3 size={20} className={helpline.isActive ? 'text-chart-green-dark' : 'text-accent'} /><div><p className="m-0 text-small font-bold text-text">{helpline.isActive ? 'Helpline is active' : 'Helpline is inactive'}</p><p className="mt-1 mb-0 text-tiny text-text-muted">{helpline.isActive ? 'This number is currently visible to users.' : 'This number is currently hidden from users.'}</p></div></div>
            </div>

            <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><Clock3 size={18} /></span><h2 className="m-0 text-body font-bold text-text">Record Details</h2></div>
              <div className="space-y-3 text-small">
                <div className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-text-muted"><CalendarDays size={15} />Created At</span><strong className="text-right text-text">{formatDateTime(helpline.createdAt)}</strong></div>
                <div className="flex items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-text-muted"><Clock3 size={15} />Updated At</span><strong className="text-right text-text">{formatDateTime(helpline.updatedAt)}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyHelplineDetails
