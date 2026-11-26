import axios from 'axios'
import { BookOpen, FileText, LoaderCircle, Siren, Users } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import StatisticCard from '../components/baseComponents/StatisticCard'
import Table from '../components/baseComponents/Table'
import AccidentReportsTrend from '../components/dashboard/AccidentReportsTrend'
import AccidentTypeDistribution from '../components/dashboard/AccidentTypeDistribution'
import { apiUrls } from '../config/api'
import { setAccidentReports, setAccidentReportsError, setAccidentReportsLoading } from '../store/accidentReportSlice'
import { setBlogs, setBlogError, setBlogLoading } from '../store/blogSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setSosAlerts, setSosAlertsError, setSosAlertsLoading } from '../store/sosAlertSlice'
import { setUsers, setUsersError, setUsersLoading } from '../store/userSlice'
import type { AccidentReportApiItem, AccidentReportsApiResponse, BlogListResponse, SosAlertsApiResponse, TableColumn, TableRow, TrendPoint, UsersApiResponse } from '../types'
import { hasAuthPermission } from '../utils/auth'

const recentAccidentColumns: TableColumn[] = [
  { key: 'number', header: '#' }, { key: 'accident-type', header: 'Accident Type' },
  { key: 'location', header: 'Location' }, { key: 'status', header: 'Status' },
  { key: 'date-time', header: 'Date & Time' },
]

const recentSosColumns: TableColumn[] = [
  { key: 'number', header: '#' }, { key: 'user', header: 'User' },
  { key: 'location', header: 'Location' }, { key: 'status', header: 'Status' },
  { key: 'date-time', header: 'Date & Time' },
]

const formatDateTime = (value: string) => {
  const date = new Date(value)
  return <><span className="block">{date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span><span className="block">{date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></>
}

const formatLabel = (value: string) => value.replaceAll('_', ' ').replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())

const statusBadge = (status: string) => {
  const normalizedStatus = status.toLowerCase()
  const className = normalizedStatus === 'resolved'
    ? 'bg-chart-green-soft text-chart-green-dark'
    : ['active', 'reported', 'responding'].includes(normalizedStatus)
      ? 'bg-chart-amber-soft text-chart-amber-dark'
      : 'bg-primary-soft text-primary'
  return <span className={`inline-flex rounded-full px-2.5 py-1 font-semibold ${className}`}>{formatLabel(status)}</span>
}

const buildTrend = (reports: AccidentReportApiItem[], numberOfDays: number): TrendPoint[] => {
  const counts = reports.reduce<Record<string, number>>((result, report) => {
    const key = new Date(report.createdAt).toISOString().slice(0, 10)
    result[key] = (result[key] ?? 0) + 1
    return result
  }, {})

  return Array.from({ length: numberOfDays }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (numberOfDays - index - 1))
    return {
      label: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      reports: counts[date.toISOString().slice(0, 10)] ?? 0,
    }
  })
}

const Dashboard = () => {
  const dispatch = useAppDispatch()
  const adminRole = useAppSelector((state) => state.auth.adminRole)
  const accidentState = useAppSelector((state) => state.accidentReports)
  const sosState = useAppSelector((state) => state.sosAlerts)
  const usersState = useAppSelector((state) => state.users)
  const blogsState = useAppSelector((state) => state.blogs)
  const canViewReports = hasAuthPermission(adminRole, 'reports:read')
  const canViewSos = hasAuthPermission(adminRole, 'sos-alerts:read')
  const canViewUsers = hasAuthPermission(adminRole, 'users:read')
  const canViewBlogs = hasAuthPermission(adminRole, 'blogs:read') || hasAuthPermission(adminRole, 'safety-tips:read')

  useEffect(() => {
    const controller = new AbortController()
    const requests: Promise<void>[] = []

    if (canViewReports) requests.push((async () => {
      dispatch(setAccidentReportsLoading(true)); dispatch(setAccidentReportsError(''))
      try {
        const response = await axios.get(apiUrls.accidentReports, { signal: controller.signal, params: { page: 1, limit: 100 } })
        const result = response.data as AccidentReportsApiResponse
        dispatch(setAccidentReports({ items: result.data.filter((report) => !report.isDeleted), pagination: result.pagination }))
      } catch (error: unknown) {
        if (!axios.isCancel(error)) dispatch(setAccidentReportsError(axios.isAxiosError(error) ? (error.response?.data?.message ?? error.message) : 'Unable to load accident reports.'))
      } finally { if (!controller.signal.aborted) dispatch(setAccidentReportsLoading(false)) }
    })())

    if (canViewSos) requests.push((async () => {
      dispatch(setSosAlertsLoading(true)); dispatch(setSosAlertsError(''))
      try {
        const response = await axios.get(apiUrls.sosAlerts, { signal: controller.signal, params: { page: 1, limit: 10 } })
        const result = response.data as SosAlertsApiResponse
        dispatch(setSosAlerts(result))
      } catch (error: unknown) {
        if (!axios.isCancel(error)) dispatch(setSosAlertsError(axios.isAxiosError(error) ? (error.response?.data?.message ?? error.message) : 'Unable to load SOS alerts.'))
      } finally { if (!controller.signal.aborted) dispatch(setSosAlertsLoading(false)) }
    })())

    if (canViewUsers) requests.push((async () => {
      dispatch(setUsersLoading(true)); dispatch(setUsersError(''))
      try {
        const response = await axios.get(apiUrls.users, { signal: controller.signal, params: { page: 1, limit: 1 } })
        dispatch(setUsers(response.data as UsersApiResponse))
      } catch (error: unknown) {
        if (!axios.isCancel(error)) dispatch(setUsersError(axios.isAxiosError(error) ? (error.response?.data?.message ?? error.message) : 'Unable to load users.'))
      } finally { if (!controller.signal.aborted) dispatch(setUsersLoading(false)) }
    })())

    if (canViewBlogs) requests.push((async () => {
      dispatch(setBlogLoading(true)); dispatch(setBlogError(''))
      try {
        const response = await axios.get(apiUrls.blogs, { signal: controller.signal, params: { page: 1, limit: 1 } })
        dispatch(setBlogs(response.data as BlogListResponse))
      } catch (error: unknown) {
        if (!axios.isCancel(error)) dispatch(setBlogError(axios.isAxiosError(error) ? (error.response?.data?.message ?? error.message) : 'Unable to load safety tips.'))
      } finally { if (!controller.signal.aborted) dispatch(setBlogLoading(false)) }
    })())

    void Promise.all(requests)
    return () => controller.abort()
  }, [canViewBlogs, canViewReports, canViewSos, canViewUsers, dispatch])

  const recentAccidentTableRows = useMemo<TableRow[]>(() => [...accidentState.items]
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt)).slice(0, 5)
    .map((report, index) => ({ key: report._id, cells: {
      number: index + 1,
      'accident-type': <Link to={`/accident-reports/view/${report._id}`} className="font-semibold text-primary hover:underline">{formatLabel(report.accidentType)}</Link>,
      location: [report.location.address, report.location.city, report.location.state].filter((value, itemIndex, values) => value && values.indexOf(value) === itemIndex).join(', ') || 'Not available',
      status: statusBadge(report.status), 'date-time': formatDateTime(report.createdAt),
    } })), [accidentState.items])

  const recentSosTableRows = useMemo<TableRow[]>(() => [...sosState.items]
    .sort((first, second) => second.triggeredAt.localeCompare(first.triggeredAt)).slice(0, 5)
    .map((alert, index) => ({ key: alert._id, cells: {
      number: index + 1,
      user: <Link to={`/sos-alerts/view/${alert._id}`} className="font-semibold text-primary hover:underline">{alert.user.name?.trim() || alert.user.email}</Link>,
      location: alert.location.address || 'Not available', status: statusBadge(alert.status),
      'date-time': formatDateTime(alert.triggeredAt),
    } })), [sosState.items])

  const trendData = useMemo(() => ({
    thirtyDays: buildTrend(accidentState.items, 30),
    fortyFiveDays: buildTrend(accidentState.items, 45),
    sixtyDays: buildTrend(accidentState.items, 60),
  }), [accidentState.items])

  const accidentDistribution = useMemo(() => {
    const counts = accidentState.items.reduce<Record<string, number>>((result, report) => {
      const key = report.accidentType.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
      result[key] = (result[key] ?? 0) + 1
      return result
    }, {})
    const sampleTotal = accidentState.items.length
    const percentage = (key: string) => sampleTotal ? Math.round(((counts[key] ?? 0) * 100) / sampleTotal) : 0
    const knownKeys = ['multi vehicle collision', 'bike accident', 'hit and run', 'pedestrian accident', 'truck accident', 'vehicle overturn']
    const knownTotal = knownKeys.reduce((sum, key) => sum + (counts[key] ?? 0), 0)
    return {
      multiVehicleCollision: percentage(knownKeys[0]), bikeAccident: percentage(knownKeys[1]),
      hitAndRun: percentage(knownKeys[2]), pedestrianAccident: percentage(knownKeys[3]),
      truckAccident: percentage(knownKeys[4]), vehicleOverturn: percentage(knownKeys[5]),
      others: sampleTotal ? Math.round(((sampleTotal - knownTotal) * 100) / sampleTotal) : 0,
    }
  }, [accidentState.items])

  return <section className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-5"><h1 className="m-0 text-title font-bold tracking-tight text-text">Dashboard</h1><p className="mt-1 mb-0 text-small text-text-muted">Live overview of reports, users, safety tips and SOS alerts.</p></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {canViewReports && <StatisticCard id="total-reports" label="Total Reports" value={accidentState.total} icon={FileText} tone="primary" />}
        {canViewUsers && <StatisticCard id="registered-users" label="Registered Users" value={usersState.total} icon={Users} tone="accent" />}
        {canViewSos && <StatisticCard id="sos-alerts" label="SOS Alerts" value={sosState.total} icon={Siren} tone="accent" />}
        {canViewBlogs && <StatisticCard id="published-tips" label="Published Tips" value={blogsState.total} icon={BookOpen} tone="green" />}
      </div>

      {canViewReports && <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(22rem,1fr)]">
        <AccidentReportsTrend thirtyDaysData={trendData.thirtyDays} fortyFiveDaysData={trendData.fortyFiveDays} sixtyDaysData={trendData.sixtyDays} />
        <AccidentTypeDistribution total={accidentState.total} {...accidentDistribution} />
      </div>}

      {(canViewReports || canViewSos) && <div className={`mt-5 grid gap-4 ${canViewReports && canViewSos ? 'xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]' : ''}`}>
        {canViewReports && <section className="min-w-0 rounded-xl border border-border-soft bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3"><h2 className="m-0 text-body font-bold text-text">Recent Accident Reports</h2><Link to="/accident-reports" className="text-tiny font-semibold text-primary hover:underline">View All</Link></div>
          {accidentState.isLoading ? <div className="flex min-h-40 items-center justify-center gap-2 text-small text-text-muted"><LoaderCircle size={18} className="animate-spin text-primary" />Loading accident reports...</div> : accidentState.error ? <p className="rounded-lg bg-accent-soft px-3 py-3 text-tiny font-medium text-accent">{accidentState.error}</p> : <Table columns={recentAccidentColumns} rows={recentAccidentTableRows} />}
        </section>}
        {canViewSos && <section className="min-w-0 rounded-xl border border-border-soft bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3"><h2 className="m-0 text-body font-bold text-text">Recent SOS Alerts</h2><Link to="/sos-alerts" className="text-tiny font-semibold text-primary hover:underline">View All</Link></div>
          {sosState.isLoading ? <div className="flex min-h-40 items-center justify-center gap-2 text-small text-text-muted"><LoaderCircle size={18} className="animate-spin text-primary" />Loading SOS alerts...</div> : sosState.error ? <p className="rounded-lg bg-accent-soft px-3 py-3 text-tiny font-medium text-accent">{sosState.error}</p> : <Table columns={recentSosColumns} rows={recentSosTableRows} />}
        </section>}
      </div>}
    </div>
  </section>
}

export default Dashboard
