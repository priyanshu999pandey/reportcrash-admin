import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock3,
  Eye,
  FileText,
  RefreshCw,
  UserRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DateRangePicker from '../../components/baseComponents/DateRangePicker'
import FilterSelect from '../../components/baseComponents/FilterSelect'
import SearchBar from '../../components/baseComponents/SearchBar'
import StatisticCard from '../../components/baseComponents/StatisticCard'
import Table from '../../components/baseComponents/Table'
import type {
  AccidentReportDetailsRow,
  DateRange,
  TableColumn,
  TableRow,
} from '../../types'

const reportStatusOptions = [
  { label: 'Under Review', value: 'Under Review' },
  { label: 'Resolved', value: 'Resolved' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Rejected', value: 'Rejected' },
]

const accidentReports: AccidentReportDetailsRow[] = [
  {
    reportId: 'RA-2026-000123',
    user: 'Rohit Sharma',
    phone: '98745 63210',
    accidentType: 'Multi-Vehicle Collision',
    location: {
      address: 'Connaught Place, Delhi, India',
      latitude: 28.6139,
      longitude: 77.209,
    },
    date: '31 Oct 2026',
    dateValue: '2026-10-31',
    time: '04:50 PM',
    injury: 'Critical',
    status: 'Under Review',
    description:
      'A multi-vehicle collision was reported near Connaught Place. Emergency services secured the scene for review.',
    media: {
      images: [
        {
          id: 'RA-2026-000123-scene',
          title: 'Crash scene',
          url: 'https://images.unsplash.com/photo-1713623311317-d3c43a4be4cf?auto=format&fit=crop&w=1200&q=80',
        },
        {
          id: 'RA-2026-000123-response',
          title: 'Emergency response',
          url: 'https://images.unsplash.com/photo-1748794598302-15f3e93170e4?auto=format&fit=crop&w=1200&q=80',
        },
      ],
      audio: {
        id: 'RA-2026-000123-audio',
        title: 'Submitted audio recording',
        url: 'https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3',
      },
    },
  },
  {
    reportId: 'RA-2026-000122',
    user: 'Priya Singh',
    phone: '98745 63211',
    accidentType: 'Bike Accident',
    location: {
      address: 'Cyber City, Gurugram, India',
      latitude: 28.4595,
      longitude: 77.0266,
    },
    date: '31 Oct 2026',
    dateValue: '2026-10-31',
    time: '03:20 PM',
    injury: 'Normal',
    status: 'Resolved',
    description:
      'A bike accident was reported near Cyber City. The rider received immediate medical assistance.',
    media: {
      images: [
        {
          id: 'RA-2026-000122-scene',
          title: 'Bike accident scene',
          url: 'https://images.unsplash.com/photo-1713623311317-d3c43a4be4cf?auto=format&fit=crop&w=1200&q=80',
        },
      ],
      audio: {
        id: 'RA-2026-000122-audio',
        title: 'Submitted audio recording',
        url: 'https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3',
      },
    },
  },
  {
    reportId: 'RA-2026-000121',
    user: 'Amit Kumar',
    phone: '98745 63212',
    accidentType: 'Hit & Run',
    location: {
      address: 'Sector 62, Noida, India',
      latitude: 28.5355,
      longitude: 77.391,
    },
    date: '30 Oct 2026',
    dateValue: '2026-10-30',
    time: '02:18 PM',
    injury: 'Severe',
    status: 'In Progress',
    description:
      'A hit-and-run incident was reported in Sector 62. Police verification is currently in progress.',
    media: {
      images: [
        {
          id: 'RA-2026-000121-scene',
          title: 'Roadside evidence',
          url: 'https://images.unsplash.com/photo-1713623311317-d3c43a4be4cf?auto=format&fit=crop&w=1200&q=80',
        },
      ],
      audio: {
        id: 'RA-2026-000121-audio',
        title: 'Witness audio recording',
        url: 'https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3',
      },
    },
  },
  {
    reportId: 'RA-2026-000120',
    user: 'Guest User',
    phone: '+91 98745 63213',
    accidentType: 'Pedestrian Accident',
    location: {
      address: 'Sector 15, Faridabad, India',
      latitude: 28.4089,
      longitude: 77.3178,
    },
    date: '30 Oct 2026',
    dateValue: '2026-10-30',
    time: '01:05 PM',
    injury: 'Critical',
    status: 'Rejected',
    description:
      'A pedestrian accident was reported in Sector 15. The submitted report was rejected after verification.',
    media: {
      images: [
        {
          id: 'RA-2026-000120-scene',
          title: 'Pedestrian accident scene',
          url: 'https://images.unsplash.com/photo-1713623311317-d3c43a4be4cf?auto=format&fit=crop&w=1200&q=80',
        },
      ],
      audio: {
        id: 'RA-2026-000120-audio',
        title: 'Submitted audio recording',
        url: 'https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3',
      },
    },
  },
  {
    reportId: 'RA-2026-000119',
    user: 'Neha Verma',
    phone: '98745 63214',
    accidentType: 'Truck Accident',
    location: {
      address: 'Raj Nagar, Ghaziabad, India',
      latitude: 28.6692,
      longitude: 77.4538,
    },
    date: '29 Oct 2026',
    dateValue: '2026-10-29',
    time: '11:12 AM',
    injury: 'Normal',
    status: 'In Progress',
    description:
      'A truck accident was reported near Raj Nagar. Road clearance and investigation are in progress.',
    media: {
      images: [
        {
          id: 'RA-2026-000119-scene',
          title: 'Truck accident scene',
          url: 'https://images.unsplash.com/photo-1713623311317-d3c43a4be4cf?auto=format&fit=crop&w=1200&q=80',
        },
      ],
      audio: {
        id: 'RA-2026-000119-audio',
        title: 'Submitted audio recording',
        url: 'https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3',
      },
    },
  },
  {
    reportId: 'RA-2026-000118',
    user: 'Sandeep Yadav',
    phone: '98745 63215',
    accidentType: 'Vehicle Overturn',
    location: {
      address: 'Rohini, Delhi, India',
      latitude: 28.7041,
      longitude: 77.1025,
    },
    date: '29 Oct 2026',
    dateValue: '2026-10-29',
    time: '10:30 AM',
    injury: 'Severe',
    status: 'Resolved',
    description:
      'A vehicle overturn was reported in Rohini. The report was resolved after emergency response.',
    media: {
      images: [
        {
          id: 'RA-2026-000118-scene',
          title: 'Overturned vehicle',
          url: 'https://images.unsplash.com/photo-1713623311317-d3c43a4be4cf?auto=format&fit=crop&w=1200&q=80',
        },
      ],
      audio: {
        id: 'RA-2026-000118-audio',
        title: 'Submitted audio recording',
        url: 'https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3',
      },
    },
  },
  {
    reportId: 'RA-2026-000117',
    user: 'Guest User',
    phone: '+91 98745 63216',
    accidentType: 'Bike Accident',
    location: {
      address: 'Saket, South Delhi, India',
      latitude: 28.4817,
      longitude: 77.1873,
    },
    date: '28 Oct 2026',
    dateValue: '2026-10-28',
    time: '09:45 AM',
    injury: 'Normal',
    status: 'Under Review',
    description:
      'A bike accident was reported near Saket. The submitted evidence is under review.',
    media: {
      images: [
        {
          id: 'RA-2026-000117-scene',
          title: 'Bike accident evidence',
          url: 'https://images.unsplash.com/photo-1713623311317-d3c43a4be4cf?auto=format&fit=crop&w=1200&q=80',
        },
      ],
      audio: {
        id: 'RA-2026-000117-audio',
        title: 'Submitted audio recording',
        url: 'https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3',
      },
    },
  },
  {
    reportId: 'RA-2026-000116',
    user: 'Kavita Jain',
    phone: '98745 63217',
    accidentType: 'Multi-Vehicle Collision',
    location: {
      address: 'India Gate, New Delhi, India',
      latitude: 28.6304,
      longitude: 77.2177,
    },
    date: '27 Oct 2026',
    dateValue: '2026-10-27',
    time: '08:55 PM',
    injury: 'Critical',
    status: 'Resolved',
    description:
      'A multi-vehicle collision was reported near India Gate. Emergency response has been completed.',
    media: {
      images: [
        {
          id: 'RA-2026-000116-scene',
          title: 'Collision scene',
          url: 'https://images.unsplash.com/photo-1713623311317-d3c43a4be4cf?auto=format&fit=crop&w=1200&q=80',
        },
      ],
      audio: {
        id: 'RA-2026-000116-audio',
        title: 'Submitted audio recording',
        url: 'https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3',
      },
    },
  },
  {
    reportId: 'RA-2026-000115',
    user: 'Vikram Mehta',
    phone: '98745 63218',
    accidentType: 'Hit & Run',
    location: {
      address: 'Sector 18, Noida, India',
      latitude: 28.5672,
      longitude: 77.321,
    },
    date: '27 Oct 2026',
    dateValue: '2026-10-27',
    time: '07:20 PM',
    injury: 'Normal',
    status: 'Rejected',
    description:
      'A hit-and-run report was submitted from Sector 18 and rejected after evidence verification.',
    media: {
      images: [
        {
          id: 'RA-2026-000115-scene',
          title: 'Reported road scene',
          url: 'https://images.unsplash.com/photo-1713623311317-d3c43a4be4cf?auto=format&fit=crop&w=1200&q=80',
        },
      ],
      audio: {
        id: 'RA-2026-000115-audio',
        title: 'Submitted audio recording',
        url: 'https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3',
      },
    },
  },
  {
    reportId: 'RA-2026-000114',
    user: 'Meera Patel',
    phone: '98745 63219',
    accidentType: 'Pedestrian Accident',
    location: {
      address: 'MG Road, Gurugram, India',
      latitude: 28.4773,
      longitude: 77.0713,
    },
    date: '26 Oct 2026',
    dateValue: '2026-10-26',
    time: '06:10 PM',
    injury: 'Severe',
    status: 'In Progress',
    description:
      'A pedestrian accident was reported near MG Road. Medical and police review are in progress.',
    media: {
      images: [
        {
          id: 'RA-2026-000114-scene',
          title: 'Accident scene',
          url: 'https://images.unsplash.com/photo-1713623311317-d3c43a4be4cf?auto=format&fit=crop&w=1200&q=80',
        },
      ],
      audio: {
        id: 'RA-2026-000114-audio',
        title: 'Submitted audio recording',
        url: 'https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3',
      },
    },
  },
]

const AccidentReports = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [datePickerKey, setDatePickerKey] = useState(0)
  const rows = accidentReports

  const accidentTypes = useMemo(
    () => [...new Set(rows.map((report) => report.accidentType))],
    [rows],
  )

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return rows.filter((report) => {
      const matchesSearch =
        !query ||
        report.reportId.toLowerCase().includes(query) ||
        report.user.toLowerCase().includes(query) ||
        report.location.address.toLowerCase().includes(query)
      const matchesType =
        typeFilter === 'all' || report.accidentType === typeFilter
      const matchesStatus =
        statusFilter === 'all' || report.status === statusFilter
      const matchesDate =
        !dateRange ||
        (report.dateValue >= dateRange.startDate &&
          report.dateValue <= dateRange.endDate)

      return matchesSearch && matchesType && matchesStatus && matchesDate
    })
  }, [dateRange, rows, search, statusFilter, typeFilter])

  const resetFilters = () => {
    setSearch('')
    setTypeFilter('all')
    setStatusFilter('all')
    setDateRange(null)
    setDatePickerKey((key) => key + 1)
  }

  const columns: TableColumn[] = [
    {
      key: 'number',
      header: '#',
    },
    {
      key: 'reportId',
      header: 'Report ID',
    },
    {
      key: 'user',
      header: 'User',
    },
    {
      key: 'accidentType',
      header: 'Accident Type',
    },
    {
      key: 'location',
      header: 'Location',
    },
    {
      key: 'dateTime',
      header: 'Date & Time',
    },
    {
      key: 'injury',
      header: 'Injury',
    },
    {
      key: 'status',
      header: 'Status',
    },
    {
      key: 'actions',
      header: 'Actions',
    },
  ]

  const tableRows: TableRow[] = filteredRows.map((report, index) => ({
    key: report.reportId,
    cells: {
      number: index + 1,
      reportId: report.reportId,
      user: (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <UserRound size={14} />
          </span>
          <span>
            <span className="block font-medium text-text">{report.user}</span>
            <span className="block text-text-muted">{report.phone}</span>
          </span>
        </div>
      ),
      accidentType: report.accidentType,
      location: report.location.address,
      dateTime: (
        <>
          <span className="block">{report.date}</span>
          <span className="block">{report.time}</span>
        </>
      ),
      injury: (
        <span
          className={`inline-flex rounded-md px-2 py-1 font-semibold ${
            report.injury === 'Critical'
              ? 'bg-accent-soft text-accent'
              : report.injury === 'Severe'
                ? 'bg-chart-amber-soft text-text'
                : 'bg-chart-green-soft text-text'
          }`}
        >
          {report.injury}
        </span>
      ),
      status: (
        <span
          className={`inline-flex rounded-md px-2 py-1 font-semibold ${
            report.status === 'Under Review'
              ? 'bg-chart-amber-soft text-chart-amber-dark'
              : report.status === 'Resolved'
                ? 'bg-chart-green-soft text-chart-green-dark'
                : report.status === 'In Progress'
                  ? 'bg-primary-soft text-primary'
                  : 'bg-accent-soft text-accent'
          }`}
        >
          {report.status}
        </span>
      ),
      actions: (
        <div className="flex items-center justify-center text-text-muted">
          <button
            type="button"
            title="View report"
            onClick={() =>
              navigate(`/accident-reports/view/${report.reportId}`, {
                state: { report },
              })
            }
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-primary-soft hover:text-primary"
          >
            <Eye size={20} />
          </button>
        </div>
      ),
    },
  }))

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-5">
          <h1 className="m-0 text-title font-bold tracking-tight text-text">
            Accident Reports
          </h1>
          <p className="mt-1 mb-0 text-small text-text-muted">
            Review and manage all reported accidents.
          </p>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatisticCard
            id="total-accident-reports"
            label="Total Reports"
            value={1248}
            icon={FileText}
            tone="primary"
          />
          <StatisticCard
            id="reports-under-review"
            label="Under Review"
            value={312}
            icon={Clock3}
            tone="accent"
          />
          <StatisticCard
            id="reports-in-progress"
            label="In Progress"
            value={186}
            icon={RefreshCw}
            tone="amber"
          />
          <StatisticCard
            id="resolved-reports"
            label="Resolved"
            value={684}
            icon={CircleCheck}
            tone="green"
          />
        </div>

        <div className="overflow-visible rounded-xl border border-border-soft bg-white shadow-sm">
          <div className="grid gap-2 border-b border-border p-3 sm:grid-cols-2 xl:grid-cols-[minmax(14rem,1fr)_9rem_9rem_auto_auto]">
            <div className="sm:col-span-2 xl:col-span-1">
              <SearchBar
                value={search}
                placeholder="Search by report ID, user name, location..."
                onChange={setSearch}
              />
            </div>

            <FilterSelect
              value={typeFilter}
              options={[
                { label: 'All Types', value: 'all' },
                ...accidentTypes.map((type) => ({ label: type, value: type })),
              ]}
              onChange={setTypeFilter}
            />

            <FilterSelect
              value={statusFilter}
              options={[
                { label: 'All Status', value: 'all' },
                ...reportStatusOptions,
              ]}
              onChange={setStatusFilter}
            />

            <DateRangePicker
              key={datePickerKey}
              onChange={setDateRange}
            />

            <button
              type="button"
              onClick={resetFilters}
              className="h-8 rounded-md border border-primary-border bg-white px-3 text-tiny font-semibold text-primary transition-colors hover:bg-primary-hover"
            >
              Reset
            </button>
          </div>

          <Table columns={columns} rows={tableRows} />
          
          <div className="flex flex-col gap-3 border-t border-border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Previous page"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-primary px-2 text-tiny font-semibold text-white">
                1
              </span>
              <button
                type="button"
                title="Next page"
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted"
              >
                <ChevronRight size={15} />
              </button>
            </div>
            <p className="m-0 text-tiny text-text-muted">
              Showing {filteredRows.length === 0 ? 0 : 1}-
              {filteredRows.length} of {filteredRows.length} reports
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccidentReports
