import axios from 'axios'
import { Clock3, Eye, LoaderCircle, Pencil, Siren, UserRound, Users, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DateRangePicker from '../../components/baseComponents/DateRangePicker'
import FilterSelect from '../../components/baseComponents/FilterSelect'
import Pagination from '../../components/baseComponents/Pagination'
import SearchBar from '../../components/baseComponents/SearchBar'
import StatisticCard from '../../components/baseComponents/StatisticCard'
import Table from '../../components/baseComponents/Table'
import { apiUrls } from '../../config/api'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  setSelectedSosAlert,
  setSosAlerts,
  setSosAlertsError,
  setSosAlertsLoading,
  updateSosAlertStatus,
} from '../../store/sosAlertSlice'
import type {
  DateRange,
  SosAlertsApiResponse,
  TableColumn,
  TableRow,
  UpdateSosAlertStatusResponse,
} from '../../types'
import { hasAuthPermission } from '../../utils/auth'

const columns: TableColumn[] = [
  { key: 'number', header: '#' },
  { key: 'user', header: 'User' },
  { key: 'location', header: 'Location' },
  { key: 'recipients', header: 'Recipients' },
  { key: 'status', header: 'Status' },
  { key: 'triggeredAt', header: 'Triggered At' },
  { key: 'actions', header: 'Actions' },
]

const lastTwentyFourHourCutoff = Date.now() - 24 * 60 * 60 * 1000

const formatTriggeredAt = (value: string) => {
  const date = new Date(value)
  return {
    date: new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date),
    time: new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date),
  }
}

const SosAlerts = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items, total, totalPages, isLoading, error } = useAppSelector(
    (state) => state.sosAlerts,
  )
  const adminRole = useAppSelector((state) => state.auth.adminRole)
  const canUpdateSos = hasAuthPermission(adminRole, 'sos-alerts:update')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [datePickerKey, setDatePickerKey] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [editingAlertId, setEditingAlertId] = useState('')
  const [updatingAlertId, setUpdatingAlertId] = useState('')
  const [actionError, setActionError] = useState('')
  const alertsPerPage = 10

  useEffect(() => {
    const controller = new AbortController()

    const loadAlerts = async () => {
      dispatch(setSosAlertsLoading(true))
      dispatch(setSosAlertsError(''))

      try {
        const response = await axios.get(apiUrls.sosAlerts, {
          signal: controller.signal,
          params: {
            page: currentPage,
            limit: alertsPerPage,
            ...(search.trim() && { search: search.trim() }),
            ...(statusFilter !== 'all' && { status: statusFilter }),
            ...(dateRange && {
              from: dateRange.startDate,
              to: dateRange.endDate,
            }),
          },
        })
        const result = response.data as SosAlertsApiResponse
        if (!result.success) {
          dispatch(setSosAlertsError(result.message || 'Unable to load SOS alerts.'))
          return
        }
        dispatch(setSosAlerts(result))
      } catch (requestError: unknown) {
        if (axios.isCancel(requestError)) return
        dispatch(
          setSosAlertsError(
            axios.isAxiosError(requestError)
              ? (requestError.response?.data?.message ?? requestError.message)
              : 'Unable to load SOS alerts.',
          ),
        )
      } finally {
        if (!controller.signal.aborted) dispatch(setSosAlertsLoading(false))
      }
    }

    void loadAlerts()
    return () => controller.abort()
  }, [currentPage, dateRange, dispatch, search, statusFilter])

  const lastTwentyFourHours = useMemo(
    () =>
      items.filter(
        (alert) =>
          new Date(alert.triggeredAt).getTime() >= lastTwentyFourHourCutoff,
      ).length,
    [items],
  )

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setDateRange(null)
    setDatePickerKey((key) => key + 1)
    setCurrentPage(1)
  }

  const updateStatus = async (sosId: string, status: string) => {
    setUpdatingAlertId(sosId)
    setActionError('')

    try {
      const response = await axios.patch(apiUrls.updateSosAlertStatus(sosId), {
        status,
      })
      const result = response.data as UpdateSosAlertStatusResponse

      if (!result.success) {
        setActionError(result.message || 'Unable to update SOS status.')
        return
      }

      dispatch(
        updateSosAlertStatus({
          sosId,
          status: result.data?.status ?? status,
          updatedAt: result.data?.updatedAt,
          statusHistory: result.data?.statusHistory,
        }),
      )
      setEditingAlertId('')
    } catch (requestError: unknown) {
      setActionError(
        axios.isAxiosError(requestError)
          ? (requestError.response?.data?.message ?? requestError.message)
          : 'Unable to update SOS status.',
      )
    } finally {
      setUpdatingAlertId('')
    }
  }

  const rows: TableRow[] = items.map((alert, index) => {
    const triggeredAt = formatTriggeredAt(alert.triggeredAt)
    const userName = alert.user.name?.trim() || alert.user.email.split('@')[0]

    return {
      key: alert._id,
      cells: {
        number: (currentPage - 1) * alertsPerPage + index + 1,
        user: (
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><UserRound size={16} /></span>
            <span><span className="block font-semibold text-text">{userName}</span><span className="block text-tiny text-text-muted">{alert.user.phone || alert.user.email}</span></span>
          </div>
        ),
        location: <span className="block max-w-64">{alert.location.address || 'Not available'}</span>,
        recipients: <span className="inline-flex items-center gap-1.5"><Users size={15} className="text-text-muted" />{alert.recipients.length}</span>,
        status: canUpdateSos && editingAlertId === alert._id ? (
          <select
            defaultValue={alert.status.toLowerCase()}
            disabled={updatingAlertId === alert._id}
            onChange={(event) => void updateStatus(alert._id, event.target.value)}
            className="h-8 rounded-md border border-border bg-white px-2 text-tiny font-semibold text-text outline-none focus:border-primary disabled:cursor-wait disabled:opacity-60"
          >
            <option value="active">Active</option>
            <option value="resolved">Resolved</option>
          </select>
        ) : <span className={`inline-flex rounded-full px-2.5 py-1 font-semibold capitalize ${alert.status.toLowerCase() === 'resolved' ? 'bg-chart-green-soft text-chart-green-dark' : 'bg-accent-soft text-accent'}`}>{alert.status}</span>,
        triggeredAt: <span><span className="block">{triggeredAt.date}</span><span className="block text-tiny text-text-muted">{triggeredAt.time}</span></span>,
        actions: (
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="View SOS alert details"
              onClick={() => {
                dispatch(setSelectedSosAlert(alert))
                navigate(`/sos-alerts/view/${alert._id}`, { state: { alert } })
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary"
            >
              <Eye size={18} />
            </button>
            {canUpdateSos && (
              editingAlertId === alert._id ? (
                <button type="button" title="Cancel status edit" disabled={updatingAlertId === alert._id} onClick={() => setEditingAlertId('')} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary disabled:opacity-60"><X size={17} /></button>
              ) : (
                <button type="button" title="Edit SOS status" onClick={() => setEditingAlertId(alert._id)} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary"><Pencil size={17} /></button>
              )
            )}
          </div>
        ),
      },
    }
  })

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-5">
          <h1 className="m-0 text-title font-bold tracking-tight text-text">SOS Alerts</h1>
          <p className="mt-1 mb-0 text-small text-text-muted">Monitor emergency alerts raised by users.</p>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatisticCard id="total-sos-alerts" label="Total SOS Alerts" value={total} icon={Siren} tone="accent" />
          <StatisticCard id="sos-last-24-hours" label="SOS in Last 24 Hours" value={lastTwentyFourHours} icon={Clock3} tone="amber" />
        </div>

        <div className="overflow-visible rounded-xl border border-border-soft bg-white shadow-sm">
          <div className="grid gap-2 border-b border-border p-3 sm:grid-cols-2 xl:grid-cols-[minmax(15rem,1fr)_10rem_auto_auto]">
            <SearchBar value={search} placeholder="Search by user or location..." onChange={(value) => { setSearch(value); setCurrentPage(1) }} />
            <FilterSelect value={statusFilter} options={[{ label: 'All Status', value: 'all' }, { label: 'Active', value: 'active' }, { label: 'Resolved', value: 'resolved' }]} onChange={(value) => { setStatusFilter(value); setCurrentPage(1) }} />
            <DateRangePicker key={datePickerKey} onChange={(value) => { setDateRange(value); setCurrentPage(1) }} />
            <button type="button" title="Reset filters" onClick={resetFilters} className="flex h-8 items-center justify-center rounded-md border border-primary-border bg-white px-3 text-tiny font-semibold text-primary transition-colors hover:bg-primary-hover">Reset</button>
          </div>

          {actionError && <p className="m-3 rounded-lg bg-accent-soft px-3 py-2 text-tiny font-medium text-accent">{actionError}</p>}

          {isLoading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-small text-text-muted"><LoaderCircle size={18} className="animate-spin text-primary" />Loading SOS alerts...</div>
          ) : error ? (
            <div className="flex min-h-48 items-center justify-center px-4 text-small font-medium text-accent">{error}</div>
          ) : (
            <Table columns={columns} rows={rows} />
          )}

          {!isLoading && !error && <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={total} pageSize={alertsPerPage} currentItemCount={items.length} itemLabel="alerts" onPageChange={setCurrentPage} />}
        </div>
      </div>
    </div>
  )
}

export default SosAlerts
