import axios from 'axios'
import {
  ArrowLeft,
  BedDouble,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Hospital as HospitalIcon,
  LoaderCircle,
  MapPin,
  Navigation,
  Phone,
  ShieldPlus,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/baseComponents/Button'
import { apiUrls } from '../../config/api'
import { setNearbyHospitals } from '../../store/hospitalSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import type {
  HospitalNavigationState,
  HospitalRow,
  NearbyHospitalsResponse,
} from '../../types'

const displayValue = (value: number | string | null) =>
  value === null || value === '' ? 'Not available' : value

const HospitalDetails = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { hospitalId } = useParams<{ hospitalId: string }>()
  const navigationHospital = (
    location.state as HospitalNavigationState | null
  )?.hospital
  const storedHospital = useAppSelector((state) =>
    state.hospitals.items.find((item) => item.id === hospitalId),
  )
  const existingHospital = navigationHospital ?? storedHospital
  const [hospital, setHospital] = useState<HospitalRow | null>(
    existingHospital ?? null,
  )
  const [isLoading, setIsLoading] = useState(!existingHospital)
  const [error, setError] = useState('')

  useEffect(() => {
    if (existingHospital || !hospitalId) return
    const controller = new AbortController()

    const loadHospital = async () => {
      try {
        const response = await axios.get(apiUrls.nearbyHospitals, {
          signal: controller.signal,
        })
        const result = response.data as NearbyHospitalsResponse
        dispatch(setNearbyHospitals(result))
        const selectedHospital = result.hospitals.find(
          (item) => item.id === hospitalId,
        )

        if (!selectedHospital) {
          setError('Hospital not found in the nearby results.')
          return
        }

        setHospital(selectedHospital)
      } catch (requestError: unknown) {
        if (axios.isCancel(requestError)) return
        if (axios.isAxiosError(requestError)) {
          setError(requestError.response?.data?.message ?? requestError.message)
        } else {
          setError('Unable to load hospital details.')
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadHospital()
    return () => controller.abort()
  }, [dispatch, existingHospital, hospitalId])

  if (isLoading) {
    return <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center gap-2 bg-primary-page text-small text-text-muted"><LoaderCircle size={18} className="animate-spin text-primary" />Loading hospital details...</div>
  }

  if (!hospital) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
        <div className="mx-auto max-w-2xl rounded-xl border border-border bg-white p-6 text-center shadow-sm">
          <h1 className="m-0 text-title font-bold text-text">Hospital not found</h1>
          <p className="mt-2 text-small text-text-muted">{error || 'This hospital is unavailable.'}</p>
          <Button variant="red" size="small" onClick={() => navigate('/hospitals')} className="mt-4 gap-2"><ArrowLeft size={16} />Back to Hospitals</Button>
        </div>
      </div>
    )
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${hospital.longitude - 0.01}%2C${hospital.latitude - 0.006}%2C${hospital.longitude + 0.01}%2C${hospital.latitude + 0.006}&layer=mapnik&marker=${hospital.latitude}%2C${hospital.longitude}`

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <button type="button" onClick={() => navigate('/hospitals')} className="mb-4 inline-flex items-center gap-2 text-small font-semibold text-text-muted transition-colors hover:text-primary"><ArrowLeft size={16} />Hospitals <span>/</span><strong className="text-text">Hospital Details</strong></button>

        <div className="mb-4 flex flex-col gap-4 rounded-xl border border-border-soft bg-white p-5 shadow-sm sm:flex-row sm:items-center">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary"><HospitalIcon size={38} /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h1 className="m-0 text-title font-bold tracking-tight text-text">{hospital.name}</h1><span className="rounded-full bg-primary-soft px-2.5 py-1 text-tiny font-semibold text-primary">{hospital.type}</span></div>
            <p className="mt-2 mb-0 inline-flex items-start gap-2 text-small text-text-muted"><MapPin size={16} className="mt-0.5 shrink-0 text-primary" />{hospital.address}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-faint px-3 py-1.5 text-tiny font-semibold text-text"><Navigation size={14} className="text-primary" />{hospital.distance} {hospital.distanceUnit} away</span>
              {hospital.is24x7 === true && <span className="inline-flex items-center gap-1.5 rounded-full bg-chart-green-soft px-3 py-1.5 text-tiny font-semibold text-chart-green-dark"><CheckCircle2 size={14} />Open 24×7</span>}
              {hospital.isTraumaCentre === true && <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-tiny font-semibold text-accent"><ShieldPlus size={14} />Trauma Centre</span>}
            </div>
          </div>
          <a href={hospital.navigationUrl} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center justify-center gap-2 rounded-full bg-primary px-3 text-tiny font-semibold text-white transition-opacity hover:opacity-90"><Navigation size={15} />Get Directions</a>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-border-soft bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3 border-b border-border pb-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><HospitalIcon size={18} /></span><h2 className="m-0 text-body font-bold text-text">Hospital Information</h2></div>
              <div className="divide-y divide-border-faint">
                <div className="grid grid-cols-[8rem_1fr] gap-3 py-3 text-tiny"><span className="text-text-muted">Hospital Name</span><strong className="text-text">{hospital.name}</strong></div>
                <div className="grid grid-cols-[8rem_1fr] gap-3 py-3 text-tiny"><span className="text-text-muted">Hospital Type</span><strong className="text-text">{hospital.type}</strong></div>
                <div className="grid grid-cols-[8rem_1fr] gap-3 py-3 text-tiny"><span className="text-text-muted">Address</span><strong className="text-text">{hospital.address}</strong></div>
                <div className="grid grid-cols-[8rem_1fr] gap-3 py-3 text-tiny"><span className="inline-flex items-center gap-1 text-text-muted"><Phone size={14} />Phone</span><strong className="text-text">{displayValue(hospital.phone)}</strong></div>
                <div className="grid grid-cols-[8rem_1fr] gap-3 py-3 text-tiny"><span className="text-text-muted">Distance</span><strong className="text-text">{hospital.distance} {hospital.distanceUnit}</strong></div>
                <div className="grid grid-cols-[8rem_1fr] gap-3 py-3 text-tiny"><span className="text-text-muted">Travel Mode</span><strong className="capitalize text-text">{hospital.travelMode}</strong></div>
                <div className="grid grid-cols-[8rem_1fr] gap-3 py-3 text-tiny"><span className="text-text-muted">Travel Time</span><strong className="text-text">{hospital.travelTime === null ? 'Not available' : `${hospital.travelTime} min`}</strong></div>
              </div>
            </div>

            <div className="rounded-xl border border-border-soft bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><Clock3 size={18} /></span><h2 className="m-0 text-body font-bold text-text">Emergency Availability</h2></div>
              <div className="grid gap-2 sm:grid-cols-2"><div className="rounded-lg bg-primary-faint p-3"><p className="m-0 text-tiny text-text-muted">24×7 Availability</p><strong className="mt-1 block text-small text-text">{hospital.is24x7 === null ? 'Not specified' : hospital.is24x7 ? 'Available' : 'Not available'}</strong></div><div className="rounded-lg bg-primary-faint p-3"><p className="m-0 text-tiny text-text-muted">Trauma Centre</p><strong className="mt-1 block text-small text-text">{hospital.isTraumaCentre === null ? 'Not specified' : hospital.isTraumaCentre ? 'Available' : 'Not available'}</strong></div></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border-soft bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><BedDouble size={18} /></span><h2 className="m-0 text-body font-bold text-text">Beds &amp; ICU Capacity</h2></div>
              <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-primary-faint p-4"><p className="m-0 text-tiny text-text-muted">Total Beds</p><strong className="mt-2 block text-title text-text">{displayValue(hospital.totalBeds)}</strong></div><div className="rounded-lg bg-chart-green-soft p-4"><p className="m-0 text-tiny text-text-muted">Available Beds</p><strong className="mt-2 block text-title text-chart-green-dark">{displayValue(hospital.availableBeds)}</strong></div><div className="rounded-lg bg-primary-faint p-4"><p className="m-0 text-tiny text-text-muted">Total ICU</p><strong className="mt-2 block text-title text-text">{displayValue(hospital.totalICU)}</strong></div><div className="rounded-lg bg-chart-green-soft p-4"><p className="m-0 text-tiny text-text-muted">Available ICU</p><strong className="mt-2 block text-title text-chart-green-dark">{displayValue(hospital.availableICU)}</strong></div></div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border-soft bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 p-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><MapPin size={18} /></span><div><h2 className="m-0 text-body font-bold text-text">Location</h2><p className="mt-1 mb-0 text-tiny text-text-muted">{hospital.latitude}, {hospital.longitude}</p></div></div><a href={hospital.navigationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-tiny font-semibold text-primary">Open Maps <ExternalLink size={13} /></a></div>
              <iframe src={mapUrl} title={`${hospital.name} location`} className="h-64 w-full border-0" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HospitalDetails
