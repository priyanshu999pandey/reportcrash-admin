import axios from 'axios'
import {
  ArrowLeft,
  FileText,
  Layers3,
  LoaderCircle,
  PhoneCall,
  Save,
} from 'lucide-react'
import { useEffect, useState, type SubmitEventHandler } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/baseComponents/Button'
import { apiUrls } from '../../config/api'
import { saveHelpline, setHelplines } from '../../store/helplineSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import type {
  EmergencyHelplineFormProps,
  EmergencyHelplineListResponse,
  EmergencyHelplineNavigationState,
  EmergencyHelplineResponse,
  EmergencyHelplinePayload,
} from '../../types'

const categories = ['Emergency', 'Medical', 'Disaster', 'Safety', 'Child Safety']

const EmergencyHelplineForm = ({ mode }: EmergencyHelplineFormProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { helplineId } = useParams<{ helplineId: string }>()
  const navigationHelpline = (
    location.state as EmergencyHelplineNavigationState | null
  )?.helpline
  const storedHelpline = useAppSelector((state) =>
    state.helplines.items.find((helpline) => helpline._id === helplineId),
  )
  const existingHelpline = navigationHelpline ?? storedHelpline
  const [name, setName] = useState(existingHelpline?.name ?? '')
  const [number, setNumber] = useState(existingHelpline?.number ?? '')
  const [category, setCategory] = useState(
    existingHelpline?.category ?? 'Emergency',
  )
  const [description, setDescription] = useState(
    existingHelpline?.description ?? '',
  )
  const [isActive, setIsActive] = useState(
    existingHelpline?.isActive ?? true,
  )
  const [isLoading, setIsLoading] = useState(
    mode === 'edit' && !existingHelpline,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const isEditing = mode === 'edit'

  useEffect(() => {
    if (!isEditing || existingHelpline || !helplineId) return
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
        const helpline = result.data.find((item) => item._id === helplineId)

        if (!helpline) {
          setError('Emergency helpline not found.')
          return
        }

        setName(helpline.name)
        setNumber(helpline.number)
        setCategory(helpline.category)
        setDescription(helpline.description)
        setIsActive(helpline.isActive)
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
  }, [dispatch, existingHelpline, helplineId, isEditing])

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    setError('')

    if (!name.trim() || !number.trim() || !category || !description.trim()) {
      setError('Please complete all required fields.')
      return
    }

    const payload: EmergencyHelplinePayload = {
      name: name.trim(),
      number: number.trim(),
      category,
      description: description.trim(),
      isActive,
    }

    try {
      setIsSubmitting(true)
      const response = isEditing
        ? await axios.patch(`${apiUrls.helplines}${helplineId}`, payload)
        : await axios.post(apiUrls.helplines, payload)
      const result = response.data as EmergencyHelplineResponse

      if (!result.success) {
        setError(result.message || 'Unable to save emergency helpline.')
        return
      }

      dispatch(saveHelpline(result.data))
      navigate(`/emergency-helplines/view/${result.data._id}`, {
        state: { helpline: result.data },
      })
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.message ?? requestError.message)
      } else {
        setError('Unable to save emergency helpline.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <button type="button" onClick={() => navigate('/emergency-helplines')} className="mb-4 inline-flex items-center gap-2 text-small font-semibold text-text-muted transition-colors hover:text-primary"><ArrowLeft size={16} />Emergency Helplines <span>/</span><strong className="text-text">{isEditing ? 'Edit Helpline' : 'Create Helpline'}</strong></button>

        <div className="mb-5">
          <h1 className="m-0 text-title font-bold tracking-tight text-text">{isEditing ? 'Edit Emergency Helpline' : 'Create Emergency Helpline'}</h1>
          <p className="mt-1 mb-0 text-small text-text-muted">{isEditing ? 'Update the helpline number and its availability.' : 'Add a new emergency number for ReportCrash users.'}</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-16 text-small text-text-muted shadow-sm"><LoaderCircle size={18} className="animate-spin text-primary" />Loading helpline details...</div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
            <div className="rounded-xl border border-border-soft bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary"><PhoneCall size={20} /></span>
                <div><h2 className="m-0 text-body font-bold text-text">Helpline Information</h2><p className="mt-1 mb-0 text-tiny text-text-muted">Enter the contact details shown to users.</p></div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-small font-semibold text-text">Helpline Name <span className="text-primary">*</span></span>
                  <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g., Police Helpline" className="h-11 w-full rounded-lg border border-border bg-white px-3 text-small text-text outline-none transition-colors focus:border-primary" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-small font-semibold text-text">Helpline Number <span className="text-primary">*</span></span>
                  <input type="tel" value={number} onChange={(event) => setNumber(event.target.value)} placeholder="e.g., 112" className="h-11 w-full rounded-lg border border-border bg-white px-3 text-small text-text outline-none transition-colors focus:border-primary" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-small font-semibold text-text">Category <span className="text-primary">*</span></span>
                  <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-11 w-full rounded-lg border border-border bg-white px-3 text-small text-text outline-none transition-colors focus:border-primary">
                    {categories.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-small font-semibold text-text">Description <span className="text-primary">*</span></span>
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={6} maxLength={300} placeholder="Describe when users should call this helpline" className="w-full resize-none rounded-lg border border-border bg-white px-3 py-3 text-small text-text outline-none transition-colors focus:border-primary" />
                  <span className="mt-1 block text-right text-tiny text-text-muted">{description.length} / 300</span>
                </label>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-xl border border-border-soft bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary"><Layers3 size={19} /></span><div><h2 className="m-0 text-body font-bold text-text">Helpline Status</h2><p className="mt-1 mb-0 text-tiny text-text-muted">Control its visibility for users.</p></div></div>
                <button type="button" onClick={() => setIsActive((current) => !current)} className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${isActive ? 'border-primary bg-primary-faint' : 'border-border bg-white'}`}>
                  <span><strong className="block text-small text-text">{isActive ? 'Active' : 'Inactive'}</strong><span className="mt-1 block text-tiny text-text-muted">{isActive ? 'Visible and available to users' : 'Hidden from users'}</span></span>
                  <span className={`relative h-6 w-11 rounded-full transition-colors ${isActive ? 'bg-primary' : 'bg-border'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} /></span>
                </button>
              </div>

              <div className="rounded-xl border border-border-soft bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"><FileText size={17} /></span><p className="m-0 text-tiny leading-6 text-text-muted">Use an official and verified emergency number. Changes become available after the API request succeeds.</p></div>
              </div>
            </div>

            {error && <p className="m-0 rounded-lg bg-accent-soft px-3 py-2 text-small font-medium text-accent xl:col-span-2">{error}</p>}

            <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-5 xl:col-span-2">
              <Button variant="outline" size="small" onClick={() => navigate('/emergency-helplines')}>Cancel</Button>
              <Button type="submit" variant="red" size="small" disabled={isSubmitting} className="gap-2">{isSubmitting ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}{isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Helpline'}</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default EmergencyHelplineForm
