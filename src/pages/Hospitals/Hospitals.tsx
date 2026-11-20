import axios from 'axios'
import {
  BedDouble,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Hospital as HospitalIcon,
  LoaderCircle,
  MapPin,
  Navigation,
  ShieldPlus,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FilterSelect from '../../components/baseComponents/FilterSelect'
import SearchBar from '../../components/baseComponents/SearchBar'
import StatisticCard from '../../components/baseComponents/StatisticCard'
import Table from '../../components/baseComponents/Table'
import { apiUrls } from '../../config/api'
import {
  setHospitalError,
  setHospitalLoading,
  setNearbyHospitals,
} from '../../store/hospitalSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import type {
  NearbyHospitalsResponse,
  TableColumn,
  TableRow,
} from '../../types'

const columns: TableColumn[] = [
  { key: 'number', header: '#' },
  { key: 'hospital', header: 'Hospital Name' },
  { key: 'distance', header: 'Distance' },
  { key: 'type', header: 'Type' },
  { key: 'location', header: 'Location' },
  { key: 'beds', header: 'Beds' },
  { key: 'icu', header: 'ICU' },
  { key: 'availability', header: 'Availability' },
  { key: 'actions', header: 'Actions' },
]

const Hospitals = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const {
    items: hospitals,
    total: totalHospitals,
    attribution,
    isLoading,
    error,
  } = useAppSelector((state) => state.hospitals)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')

  useEffect(() => {
    const controller = new AbortController()

    const loadHospitals = async () => {
      dispatch(setHospitalLoading(true))
      dispatch(setHospitalError(''))

      try {
        const response = await axios.get(apiUrls.nearbyHospitals, {
          signal: controller.signal,
        })
        const result = response.data as NearbyHospitalsResponse
        dispatch(setNearbyHospitals(result))
      } catch (requestError: unknown) {
        if (axios.isCancel(requestError)) return
        if (axios.isAxiosError(requestError)) {
          dispatch(
            setHospitalError(
              requestError.response?.data?.message ?? requestError.message,
            ),
          )
        } else {
          dispatch(setHospitalError('Unable to load nearby hospitals.'))
        }
      } finally {
        if (!controller.signal.aborted) {
          dispatch(setHospitalLoading(false))
        }
      }
    }

    void loadHospitals()
    return () => controller.abort()
  }, [dispatch])

  const hospitalTypes = useMemo(
    () => [...new Set(hospitals.map((hospital) => hospital.type))],
    [hospitals],
  )

  const filteredHospitals = useMemo(() => {
    const query = search.trim().toLowerCase()
    return hospitals.filter((hospital) => {
      const matchesSearch =
        !query ||
        hospital.name.toLowerCase().includes(query) ||
        hospital.address.toLowerCase().includes(query) ||
        hospital.phone?.toLowerCase().includes(query)
      const matchesType =
        typeFilter === 'all' || hospital.type === typeFilter
      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === '24x7'
          ? hospital.is24x7 === true
          : hospital.isTraumaCentre === true)

      return matchesSearch && matchesType && matchesAvailability
    })
  }, [availabilityFilter, hospitals, search, typeFilter])

  const totalBeds = hospitals.reduce(
    (total, hospital) => total + (hospital.totalBeds ?? 0),
    0,
  )
  const traumaCentres = hospitals.filter(
    (hospital) => hospital.isTraumaCentre === true,
  ).length
  const availableAllDay = hospitals.filter(
    (hospital) => hospital.is24x7 === true,
  ).length

  const resetFilters = () => {
    setSearch('')
    setTypeFilter('all')
    setAvailabilityFilter('all')
  }

  const rows: TableRow[] = filteredHospitals.map((hospital, index) => ({
    key: hospital.id,
    cells: {
      number: index + 1,
      hospital: (
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><HospitalIcon size={16} /></span>
          <span><span className="block font-semibold text-text">{hospital.name}</span><span className="mt-0.5 block text-tiny text-text-muted">{hospital.phone ?? 'Phone unavailable'}</span></span>
        </div>
      ),
      distance: (
        <span className="inline-flex items-center gap-1.5 font-semibold text-text"><Navigation size={14} className="text-primary" />{hospital.distance} {hospital.distanceUnit}</span>
      ),
      type: <span className="inline-flex rounded-full bg-primary-soft px-2.5 py-1 font-semibold text-primary">{hospital.type}</span>,
      location: <span className="inline-flex max-w-56 items-start gap-1.5 whitespace-normal"><MapPin size={14} className="mt-0.5 shrink-0" />{hospital.address}</span>,
      beds: hospital.totalBeds === null ? 'Not available' : hospital.totalBeds,
      icu: hospital.totalICU === null ? 'Not available' : hospital.totalICU,
      availability: (
        <div className="flex flex-wrap gap-1">
          {hospital.is24x7 === true && <span className="rounded-full bg-chart-green-soft px-2 py-1 font-semibold text-chart-green-dark">24×7</span>}
          {hospital.isTraumaCentre === true && <span className="rounded-full bg-accent-soft px-2 py-1 font-semibold text-accent">Trauma</span>}
          {hospital.is24x7 !== true && hospital.isTraumaCentre !== true && <span className="text-text-muted">Not specified</span>}
        </div>
      ),
      actions: (
        <button type="button" title="View hospital" onClick={() => navigate(`/hospitals/view/${hospital.id}`, { state: { hospital } })} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary"><Eye size={17} /></button>
      ),
    },
  }))

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-5">
          <h1 className="m-0 text-title font-bold tracking-tight text-text">Nearby Hospitals</h1>
          <p className="mt-1 mb-0 text-small text-text-muted">Hospitals near New Delhi based on the selected search coordinates.</p>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatisticCard id="total-hospitals" label="Nearby Hospitals" value={totalHospitals} icon={HospitalIcon} tone="accent" />
          <StatisticCard id="hospital-beds" label="Total Listed Beds" value={totalBeds} icon={BedDouble} tone="primary" />
          <StatisticCard id="trauma-centres" label="Trauma Centres" value={traumaCentres} icon={ShieldPlus} tone="green" />
          <StatisticCard id="all-day-hospitals" label="24×7 Hospitals" value={availableAllDay} icon={CheckCircle2} tone="amber" />
        </div>

        <div className="overflow-visible rounded-xl border border-border-soft bg-white shadow-sm">
          <div className="grid gap-2 border-b border-border p-3 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_10rem_11rem_auto]">
            <SearchBar value={search} placeholder="Search by hospital name, address or phone..." onChange={setSearch} />
            <FilterSelect value={typeFilter} options={[{ label: 'All Types', value: 'all' }, ...hospitalTypes.map((type) => ({ label: type, value: type }))]} onChange={setTypeFilter} />
            <FilterSelect value={availabilityFilter} options={[{ label: 'All Availability', value: 'all' }, { label: '24×7', value: '24x7' }, { label: 'Trauma Centre', value: 'trauma' }]} onChange={setAvailabilityFilter} />
            <button type="button" title="Reset filters" onClick={resetFilters} className="flex h-8 items-center justify-center rounded-md border border-primary-border bg-white px-3 text-tiny font-semibold text-primary transition-colors hover:bg-primary-hover">Reset</button>
          </div>

          {error && <p className="m-3 rounded-lg bg-accent-soft px-3 py-2 text-tiny font-medium text-accent">{error}</p>}
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-12 text-small text-text-muted"><LoaderCircle size={18} className="animate-spin text-primary" />Loading nearby hospitals...</div>
          ) : (
            <Table columns={columns} rows={rows} />
          )}

          <div className="flex flex-col gap-3 border-t border-border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="m-0 text-tiny text-text-muted">Showing {filteredHospitals.length === 0 ? 0 : 1} – {filteredHospitals.length} of {totalHospitals} hospitals</p>{attribution && <p className="mt-1 mb-0 text-tiny text-text-muted">{attribution}</p>}</div>
            <div className="flex items-center gap-1"><button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted"><ChevronLeft size={15} /></button><span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-primary px-2 text-tiny font-semibold text-white">1</span><button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted"><ChevronRight size={15} /></button></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hospitals
