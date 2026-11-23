import axios from 'axios'
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Eye,
  FileText,
  Images,
  LoaderCircle,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DateRangePicker from '../../components/baseComponents/DateRangePicker'
import FilterSelect from '../../components/baseComponents/FilterSelect'
import SearchBar from '../../components/baseComponents/SearchBar'
import StatisticCard from '../../components/baseComponents/StatisticCard'
import Table from '../../components/baseComponents/Table'
import { apiUrls } from '../../config/api'
import {
  removeAccidentReport,
  setAccidentReports,
  setAccidentReportsError,
  setAccidentReportsLoading,
} from '../../store/accidentReportSlice'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import type {
  AccidentReportApiItem,
  AccidentReportsApiResponse,
  DateRange,
  DeleteAccidentReportResponse,
  TableColumn,
  TableRow,
} from '../../types'
import { hasAuthPermission } from '../../utils/auth'

const formatText = (value: string) =>
  value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const formatLocation = (report: AccidentReportApiItem) =>
  [report.location.address, report.location.city, report.location.state]
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .join(', ')

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

const columns: TableColumn[] = [
  { key: 'number', header: '#' },
  { key: 'reportId', header: 'Report ID' },
  { key: 'reporter', header: 'Reporter' },
  { key: 'accidentType', header: 'Accident Type' },
  { key: 'location', header: 'Location' },
  { key: 'injury', header: 'Injury / Trapped' },
  { key: 'status', header: 'Status' },
  { key: 'reportedAt', header: 'Reported At' },
  { key: 'actions', header: 'Actions' },
]

const rowsPerPage = 10

const AccidentReports = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const {
    items: reports,
    total: totalReports,
    isLoading,
    error,
  } = useAppSelector((state) => state.accidentReports)
  const adminRole = useAppSelector((state) => state.auth.adminRole)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [datePickerKey, setDatePickerKey] = useState(0)
  const [requestKey, setRequestKey] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingReportId, setDeletingReportId] = useState('')
  const [actionError, setActionError] = useState('')
  const canDeleteReports = hasAuthPermission(adminRole, 'reports:delete')

  useEffect(() => {
    const controller = new AbortController()

    const loadReports = async () => {
      dispatch(setAccidentReportsLoading(true))
      dispatch(setAccidentReportsError(''))

      try {
        const response = await axios.get(apiUrls.accidentReports, {
          signal: controller.signal,
        })
        const result = response.data as AccidentReportsApiResponse

        if (!result.success) {
          dispatch(
            setAccidentReportsError(
              result.message || 'Unable to load accident reports.',
            ),
          )
          return
        }

        dispatch(
          setAccidentReports({
            items: result.data.filter((report) => !report.isDeleted),
            total: result.count,
          }),
        )
      } catch (requestError: unknown) {
        if (axios.isCancel(requestError)) return
        if (axios.isAxiosError(requestError)) {
          dispatch(
            setAccidentReportsError(
              requestError.response?.data?.message ?? requestError.message,
            ),
          )
        } else {
          dispatch(setAccidentReportsError('Unable to load accident reports.'))
        }
      } finally {
        if (!controller.signal.aborted) {
          dispatch(setAccidentReportsLoading(false))
        }
      }
    }

    void loadReports()
    return () => controller.abort()
  }, [dispatch, requestKey])

  const accidentTypes = useMemo(
    () => [...new Set(reports.map((report) => report.accidentType))],
    [reports],
  )

  const statuses = useMemo(
    () => [...new Set(reports.map((report) => report.status))],
    [reports],
  )

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase()

    return reports.filter((report) => {
      const location = formatLocation(report).toLowerCase()
      const matchesSearch =
        !query ||
        report._id.toLowerCase().includes(query) ||
        report.reportedBy.name.toLowerCase().includes(query) ||
        report.reportedBy.email.toLowerCase().includes(query) ||
        report.reportedBy.phone.toLowerCase().includes(query) ||
        location.includes(query)
      const matchesType =
        typeFilter === 'all' || report.accidentType === typeFilter
      const matchesStatus =
        statusFilter === 'all' || report.status === statusFilter
      const createdDate = report.createdAt.slice(0, 10)
      const matchesDate =
        !dateRange ||
        (createdDate >= dateRange.startDate && createdDate <= dateRange.endDate)

      return matchesSearch && matchesType && matchesStatus && matchesDate
    })
  }, [dateRange, reports, search, statusFilter, typeFilter])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReports.length / rowsPerPage),
  )
  const activePage = Math.min(currentPage, totalPages)
  const pageStartIndex = (activePage - 1) * rowsPerPage
  const paginatedReports = filteredReports.slice(
    pageStartIndex,
    pageStartIndex + rowsPerPage,
  )

  const reportedCount = reports.filter(
    (report) => report.status.toLowerCase() === 'reported',
  ).length
  const trappedCount = reports.filter(
    (report) => report.anyoneTrapped.toLowerCase() === 'yes',
  ).length
  const reportsWithMedia = reports.filter(
    (report) =>
      report.photos.length > 0 ||
      report.videos.length > 0 ||
      Boolean(report.voiceNote),
  ).length

  const resetFilters = () => {
    setSearch('')
    setTypeFilter('all')
    setStatusFilter('all')
    setDateRange(null)
    setDatePickerKey((key) => key + 1)
    setCurrentPage(1)
  }

  const deleteReport = async (reportId: string) => {
    const shouldDelete = window.confirm(
      'Are you sure you want to delete this accident report?',
    )
    if (!shouldDelete) return

    setDeletingReportId(reportId)
    setActionError('')

    try {
      const response = await axios.delete(
        apiUrls.deleteAccidentReport(reportId),
      )
      const result = response.data as DeleteAccidentReportResponse

      if (!result.success) {
        setActionError(result.message || 'Unable to delete accident report.')
        return
      }

      dispatch(removeAccidentReport(reportId))
      if (paginatedReports.length === 1 && activePage > 1) {
        setCurrentPage(activePage - 1)
      }
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        setActionError(
          requestError.response?.data?.message ?? requestError.message,
        )
      } else {
        setActionError('Unable to delete accident report.')
      }
    } finally {
      setDeletingReportId('')
    }
  }

  const tableRows: TableRow[] = paginatedReports.map((report, index) => ({
    key: report._id,
    cells: {
      number: pageStartIndex + index + 1,
      reportId: <span className="font-semibold text-text">{report._id}</span>,
      reporter: (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <UserRound size={15} />
          </span>
          <span>
            <span className="block font-semibold text-text">{report.reportedBy.name}</span>
            <span className="block text-text-muted">{report.reportedBy.phone}</span>
          </span>
        </div>
      ),
      accidentType: formatText(report.accidentType),
      location: <span className="block max-w-60 whitespace-normal">{formatLocation(report)}</span>,
      injury: (
        <div className="flex flex-col items-start gap-1">
          <span
            className={`rounded-md px-2 py-1 font-semibold ${
              report.injurySeverity?.toLowerCase() === 'serious' ||
              report.injurySeverity?.toLowerCase() === 'critical'
                ? 'bg-accent-soft text-accent'
                : report.injurySeverity
                  ? 'bg-chart-amber-soft text-chart-amber-dark'
                  : 'bg-primary-page text-text-muted'
            }`}
          >
            {report.injurySeverity ? formatText(report.injurySeverity) : 'Not provided'}
          </span>
          <span className="text-text-muted">Trapped: {formatText(report.anyoneTrapped)}</span>
        </div>
      ),
      status: (
        <span
          className={`inline-flex rounded-md px-2 py-1 font-semibold ${
            report.status.toLowerCase() === 'resolved'
              ? 'bg-chart-green-soft text-chart-green-dark'
              : report.status.toLowerCase() === 'rejected'
                ? 'bg-accent-soft text-accent'
                : report.status.toLowerCase() === 'in_progress'
                  ? 'bg-primary-soft text-primary'
                  : 'bg-chart-amber-soft text-chart-amber-dark'
          }`}
        >
          {formatText(report.status)}
        </span>
      ),
      reportedAt: <span className="whitespace-nowrap">{formatDateTime(report.createdAt)}</span>,
      actions: (
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="View report"
            onClick={() => navigate(`/accident-reports/view/${report._id}`)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary"
          >
            <Eye size={18} />
          </button>
          {canDeleteReports && (
            <button
              type="button"
              title="Delete report"
              disabled={deletingReportId === report._id}
              onClick={() => void deleteReport(report._id)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deletingReportId === report._id ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Trash2 size={17} />
              )}
            </button>
          )}
        </div>
      ),
    },
  }))

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-5">
          <h1 className="m-0 text-title font-bold tracking-tight text-text">Accident Reports</h1>
          <p className="mt-1 mb-0 text-small text-text-muted">Review all accident reports submitted by application users.</p>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatisticCard id="total-accident-reports" label="Total Reports" value={totalReports} icon={FileText} tone="primary" />
          <StatisticCard id="reported-accidents" label="Reported" value={reportedCount} icon={CircleCheck} tone="green" />
          <StatisticCard id="trapped-accidents" label="People Trapped" value={trappedCount} icon={UserRound} tone="accent" />
          <StatisticCard id="reports-with-media" label="Media Attached" value={reportsWithMedia} icon={Images} tone="amber" />
        </div>

        <div className="overflow-visible rounded-xl border border-border-soft bg-white shadow-sm">
          <div className="grid gap-2 border-b border-border p-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1fr)_9rem_9rem_auto_auto]">
            <div className="sm:col-span-2 xl:col-span-1">
              <SearchBar
                value={search}
                placeholder="Search by report ID, reporter, phone or location..."
                onChange={(value) => {
                  setSearch(value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <FilterSelect
              value={typeFilter}
              options={[
                { label: 'All Types', value: 'all' },
                ...accidentTypes.map((type) => ({ label: formatText(type), value: type })),
              ]}
              onChange={(value) => {
                setTypeFilter(value)
                setCurrentPage(1)
              }}
            />
            <FilterSelect
              value={statusFilter}
              options={[
                { label: 'All Status', value: 'all' },
                ...statuses.map((status) => ({ label: formatText(status), value: status })),
              ]}
              onChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            />
            <DateRangePicker
              key={datePickerKey}
              onChange={(value) => {
                setDateRange(value)
                setCurrentPage(1)
              }}
            />
            <button type="button" onClick={resetFilters} className="h-8 rounded-md border border-primary-border bg-white px-3 text-tiny font-semibold text-primary transition-colors hover:bg-primary-hover">Reset</button>
          </div>

          {actionError && (
            <p className="m-3 rounded-lg bg-accent-soft px-4 py-2.5 text-tiny font-medium text-accent">
              {actionError}
            </p>
          )}

          {isLoading ? (
            <div className="flex min-h-56 items-center justify-center gap-2 text-small text-text-muted">
              <LoaderCircle size={18} className="animate-spin text-primary" />
              Loading accident reports...
            </div>
          ) : error ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 px-4 text-center">
              <p className="m-0 text-small font-medium text-accent">{error}</p>
              <button type="button" onClick={() => setRequestKey((key) => key + 1)} className="h-8 rounded-full bg-primary px-4 text-tiny font-semibold text-white">Try again</button>
            </div>
          ) : (
            <Table columns={columns} rows={tableRows} />
          )}

          {!isLoading && !error && (
            <div className="flex flex-col gap-3 border-t border-border p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Previous page"
                  disabled={activePage === 1}
                  onClick={() => setCurrentPage(activePage - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-tiny font-semibold ${
                        activePage === page
                          ? 'bg-primary text-white'
                          : 'border border-border bg-white text-text-muted'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  title="Next page"
                  disabled={activePage === totalPages}
                  onClick={() => setCurrentPage(activePage + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
              <p className="m-0 text-tiny text-text-muted">
                Showing {filteredReports.length === 0 ? 0 : pageStartIndex + 1}-
                {Math.min(pageStartIndex + rowsPerPage, filteredReports.length)} of{' '}
                {filteredReports.length} reports
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccidentReports
