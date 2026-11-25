import { Clock3, Eye, Siren, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DateRangePicker from '../../components/baseComponents/DateRangePicker'
import Pagination from '../../components/baseComponents/Pagination'
import SearchBar from '../../components/baseComponents/SearchBar'
import StatisticCard from '../../components/baseComponents/StatisticCard'
import Table from '../../components/baseComponents/Table'
import type { DateRange, SosAlertDetailsRow, TableColumn, TableRow } from '../../types'

const sosAlertsMock: SosAlertDetailsRow[] = [
  { id: 'SOS-2026-000078', user: 'Rohit Sharma', phone: '98745 63210', email: 'rohit.sharma@example.com', location: 'Sector 24, Gurugram, India', date: '04 Nov 2026', time: '10:42 PM', dateValue: '2026-11-04', userStatus: 'Active', coordinates: '28.5037° N, 77.0888° E', message: 'Emergency assistance requested near Sector 24 main road.', emergencyContact: { name: 'Anjali Sharma', relationship: 'Sister', phone: '98745 63101' } },
  { id: 'SOS-2026-000077', user: 'Priya Singh', phone: '98745 63211', email: 'priya.singh@example.com', location: 'NH-48, Delhi, India', date: '04 Nov 2026', time: '08:32 PM', dateValue: '2026-11-04', userStatus: 'Active', coordinates: '28.5562° N, 77.1000° E', message: 'User triggered an SOS alert while travelling on NH-48.', emergencyContact: { name: 'Raj Singh', relationship: 'Father', phone: '98745 63102' } },
  { id: 'SOS-2026-000076', user: 'Amit Kumar', phone: '98745 63212', email: 'amit.kumar@example.com', location: 'Sector 62, Noida, India', date: '03 Nov 2026', time: '06:18 PM', dateValue: '2026-11-03', userStatus: 'Active', coordinates: '28.6270° N, 77.3723° E', message: 'Immediate help requested from the Sector 62 service road.', emergencyContact: { name: 'Nisha Kumar', relationship: 'Spouse', phone: '98745 63103' } },
  { id: 'SOS-2026-000075', user: 'Neha Verma', phone: '98745 63213', email: 'neha.verma@example.com', location: 'Dwarka, Delhi, India', date: '02 Nov 2026', time: '02:50 PM', dateValue: '2026-11-02', userStatus: 'Inactive', coordinates: '28.5921° N, 77.0460° E', message: 'SOS alert raised close to the Dwarka metro station.', emergencyContact: { name: 'Vivek Verma', relationship: 'Brother', phone: '98745 63104' } },
  { id: 'SOS-2026-000074', user: 'Sandeep Yadav', phone: '98745 63214', email: 'sandeep.yadav@example.com', location: 'Ghaziabad, India', date: '01 Nov 2026', time: '01:45 PM', dateValue: '2026-11-01', userStatus: 'Active', coordinates: '28.6692° N, 77.4538° E', message: 'User needs roadside emergency support in Ghaziabad.', emergencyContact: { name: 'Pooja Yadav', relationship: 'Spouse', phone: '98745 63105' } },
  { id: 'SOS-2026-000073', user: 'Guest User', phone: '98745 63215', email: 'guest.user@example.com', location: 'Faridabad, India', date: '31 Oct 2026', time: '12:30 PM', dateValue: '2026-10-31', userStatus: 'Active', coordinates: '28.4089° N, 77.3178° E', message: 'Emergency alert received from Faridabad bypass road.', emergencyContact: { name: 'Ravi Kumar', relationship: 'Friend', phone: '98745 63106' } },
  { id: 'SOS-2026-000072', user: 'Vikram Mehta', phone: '98745 63216', email: 'vikram.mehta@example.com', location: 'South Delhi, India', date: '30 Oct 2026', time: '11:22 AM', dateValue: '2026-10-30', userStatus: 'Active', coordinates: '28.5245° N, 77.2066° E', message: 'SOS request raised near a busy South Delhi crossing.', emergencyContact: { name: 'Sunita Mehta', relationship: 'Mother', phone: '98745 63107' } },
  { id: 'SOS-2026-000071', user: 'Meera Patel', phone: '98745 63217', email: 'meera.patel@example.com', location: 'Rohini, Delhi, India', date: '29 Oct 2026', time: '10:15 AM', dateValue: '2026-10-29', userStatus: 'Active', coordinates: '28.7383° N, 77.0822° E', message: 'User requested emergency assistance from Rohini Sector 9.', emergencyContact: { name: 'Rajesh Patel', relationship: 'Father', phone: '98745 63108' } },
  { id: 'SOS-2026-000070', user: 'Arjun Singh', phone: '98745 63218', email: 'arjun.singh@example.com', location: 'Noida, India', date: '28 Oct 2026', time: '09:40 AM', dateValue: '2026-10-28', userStatus: 'Inactive', coordinates: '28.5355° N, 77.3910° E', message: 'SOS alert received from the Noida expressway service lane.', emergencyContact: { name: 'Karan Singh', relationship: 'Brother', phone: '98745 63109' } },
  { id: 'SOS-2026-000069', user: 'Simran Kaur', phone: '98745 63219', email: 'simran.kaur@example.com', location: 'Gurugram, India', date: '27 Oct 2026', time: '08:15 AM', dateValue: '2026-10-27', userStatus: 'Active', coordinates: '28.4595° N, 77.0266° E', message: 'Emergency assistance requested near central Gurugram.', emergencyContact: { name: 'Harpreet Kaur', relationship: 'Mother', phone: '98745 63110' } },
]

const columns: TableColumn[] = [
  { key: 'number', header: '#' },
  { key: 'sosId', header: 'SOS ID' },
  { key: 'user', header: 'User' },
  { key: 'location', header: 'Location' },
  { key: 'triggeredAt', header: 'Triggered At' },
  { key: 'actions', header: 'Actions' },
]

const sosStatistics = { total: 210, lastTwentyFourHours: 12 }

const SosAlerts = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [datePickerKey, setDatePickerKey] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const alertsPerPage = 10

  const filteredAlerts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return sosAlertsMock.filter((alert) => {
      const matchesSearch = !query || alert.id.toLowerCase().includes(query) || alert.user.toLowerCase().includes(query) || alert.location.toLowerCase().includes(query)
      const matchesDate = !dateRange || (alert.dateValue >= dateRange.startDate && alert.dateValue <= dateRange.endDate)
      return matchesSearch && matchesDate
    })
  }, [dateRange, search])

  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / alertsPerPage))
  const activePage = Math.min(currentPage, totalPages)
  const firstAlertIndex = (activePage - 1) * alertsPerPage
  const paginatedAlerts = filteredAlerts.slice(firstAlertIndex, firstAlertIndex + alertsPerPage)

  const resetFilters = () => {
    setSearch('')
    setDateRange(null)
    setDatePickerKey((key) => key + 1)
    setCurrentPage(1)
  }

  const rows: TableRow[] = paginatedAlerts.map((alert, index) => ({
    key: alert.id,
    cells: {
      number: firstAlertIndex + index + 1,
      sosId: <span className="font-semibold text-text">{alert.id}</span>,
      user: (
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><UserRound size={16} /></span>
          <span><span className="block font-semibold text-text">{alert.user}</span><span className="block text-tiny text-text-muted">{alert.phone}</span></span>
        </div>
      ),
      location: alert.location,
      triggeredAt: <span><span className="block">{alert.date}</span><span className="block">{alert.time}</span></span>,
      actions: (
        <button type="button" title="View SOS user details" onClick={() => navigate(`/sos-alerts/view/${alert.id}`, { state: { alert } })} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary">
          <Eye size={18} />
        </button>
      ),
    },
  }))

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-5">
          <h1 className="m-0 text-title font-bold tracking-tight text-text">SOS Alerts</h1>
          <p className="mt-1 mb-0 text-small text-text-muted">Monitor emergency alerts raised by users.</p>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatisticCard id="total-sos-alerts" label="Total SOS Alerts" value={sosStatistics.total} icon={Siren} tone="accent" />
          <StatisticCard id="sos-last-24-hours" label="SOS in Last 24 Hours" value={sosStatistics.lastTwentyFourHours} icon={Clock3} tone="amber" />
        </div>

        <div className="overflow-visible rounded-xl border border-border-soft bg-white shadow-sm">
          <div className="grid gap-2 border-b border-border p-3 sm:grid-cols-[minmax(15rem,1fr)_auto_auto]">
            <SearchBar value={search} placeholder="Search by SOS ID, user name or location..." onChange={(value) => { setSearch(value); setCurrentPage(1) }} />
            <DateRangePicker key={datePickerKey} onChange={(value) => { setDateRange(value); setCurrentPage(1) }} />
            <button type="button" title="Reset filters" onClick={resetFilters} className="flex h-8 items-center justify-center rounded-md border border-primary-border bg-white px-3 text-tiny font-semibold text-primary transition-colors hover:bg-primary-hover">Reset</button>
          </div>

          <Table columns={columns} rows={rows} />

          <Pagination currentPage={activePage} totalPages={totalPages} totalItems={filteredAlerts.length} pageSize={alertsPerPage} currentItemCount={paginatedAlerts.length} itemLabel="alerts" onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  )
}

export default SosAlerts
