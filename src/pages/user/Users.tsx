import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  UserCheck,
  UserPlus,
  UserRound,
  UserX,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/baseComponents/Button'
import DateRangePicker from '../../components/baseComponents/DateRangePicker'
import FilterSelect from '../../components/baseComponents/FilterSelect'
import SearchBar from '../../components/baseComponents/SearchBar'
import StatisticCard from '../../components/baseComponents/StatisticCard'
import Table from '../../components/baseComponents/Table'
import type {
  DateRange,
  TableColumn,
  TableRow,
  UserProfileRow,
  UserRole,
  UsersProps,
  UserStatus,
} from '../../types'
import { getVisibleUserRoles } from '../../utils/permissions'

const users: UserProfileRow[] = [
  {
    id: 'USR-1001', name: 'Rakesh Sharma', email: 'rakesh.sharma@example.com',
    role: 'Super Admin', phone: '98745 63210', status: 'Active',
    createdOn: '02 Nov 2026', createdDate: '2026-11-02', dateOfBirth: '14 Mar 1994',
    gender: 'Male', bloodGroup: 'B+', allergies: ['Dust'], medicalConditions: ['Asthma'],
    emergencyContact: { name: 'Meena Sharma', relationship: 'Mother', phone: '98745 63101' },
    totalReports: 4,
  },
  {
    id: 'USR-1002', name: 'Priya Verma', email: 'priya.verma@example.com',
    role: 'Admin', phone: '98745 63211', status: 'Active',
    createdOn: '31 Oct 2026', createdDate: '2026-10-31', dateOfBirth: '22 Aug 1997',
    gender: 'Female', bloodGroup: 'O+', allergies: [], medicalConditions: [],
    emergencyContact: { name: 'Anil Verma', relationship: 'Father', phone: '98745 63102' },
    totalReports: 2,
  },
  {
    id: 'USR-1003', name: 'Amit Kumar', email: 'amit.kumar@example.com',
    role: 'Content Admin', phone: '98745 63212', status: 'Active',
    createdOn: '28 Oct 2026', createdDate: '2026-10-28', dateOfBirth: '09 Jan 1991',
    gender: 'Male', bloodGroup: 'A+', allergies: ['Peanuts'], medicalConditions: [],
    emergencyContact: { name: 'Nisha Kumar', relationship: 'Spouse', phone: '98745 63103' },
    totalReports: 6,
  },
  {
    id: 'USR-1004', name: 'Neha Singh', email: 'neha.singh@example.com',
    role: 'User', phone: '98745 63213', status: 'Inactive',
    createdOn: '26 Oct 2026', createdDate: '2026-10-26', dateOfBirth: '18 Dec 1995',
    gender: 'Female', bloodGroup: 'AB+', allergies: ['Pollen'], medicalConditions: ['Migraine'],
    emergencyContact: { name: 'Rahul Singh', relationship: 'Brother', phone: '98745 63104' },
    totalReports: 1,
  },
  {
    id: 'USR-1005', name: 'Vikas Dubey', email: 'vikas.dubey@example.com',
    role: 'User', phone: '98745 63214', status: 'Active',
    createdOn: '24 Oct 2026', createdDate: '2026-10-24', dateOfBirth: '03 Jul 1989',
    gender: 'Male', bloodGroup: 'O-', allergies: [], medicalConditions: ['Diabetes'],
    emergencyContact: { name: 'Kavita Dubey', relationship: 'Spouse', phone: '98745 63105' },
    totalReports: 3,
  },
  {
    id: 'USR-1006', name: 'Kavita Jain', email: 'kavita.jain@example.com',
    role: 'User', phone: '98745 63215', status: 'Inactive',
    createdOn: '20 Oct 2026', createdDate: '2026-10-20', dateOfBirth: '27 May 1993',
    gender: 'Female', bloodGroup: 'A-', allergies: ['Penicillin'], medicalConditions: [],
    emergencyContact: { name: 'Mohan Jain', relationship: 'Father', phone: '98745 63106' },
    totalReports: 5,
  },
  {
    id: 'USR-1007', name: 'Sandeep Yadav', email: 'sandeep.yadav@example.com',
    role: 'User', phone: '98745 63216', status: 'Active',
    createdOn: '18 Oct 2026', createdDate: '2026-10-18', dateOfBirth: '11 Feb 1990',
    gender: 'Male', bloodGroup: 'B-', allergies: [], medicalConditions: ['Hypertension'],
    emergencyContact: { name: 'Pooja Yadav', relationship: 'Spouse', phone: '98745 63107' },
    totalReports: 2,
  },
  {
    id: 'USR-1008', name: 'Meera Patel', email: 'meera.patel@example.com',
    role: 'User', phone: '98745 63217', status: 'Active',
    createdOn: '15 Oct 2026', createdDate: '2026-10-15', dateOfBirth: '06 Sep 1996',
    gender: 'Female', bloodGroup: 'A+', allergies: ['Shellfish'], medicalConditions: [],
    emergencyContact: { name: 'Rajesh Patel', relationship: 'Father', phone: '98745 63108' },
    totalReports: 7,
  },
  {
    id: 'USR-1009', name: 'Rohit Mehta', email: 'rohit.mehta@example.com',
    role: 'User', phone: '98745 63218', status: 'Inactive',
    createdOn: '12 Oct 2026', createdDate: '2026-10-12', dateOfBirth: '29 Nov 1988',
    gender: 'Male', bloodGroup: 'O+', allergies: ['Dust'], medicalConditions: [],
    emergencyContact: { name: 'Sunita Mehta', relationship: 'Mother', phone: '98745 63109' },
    totalReports: 1,
  },
  {
    id: 'USR-1010', name: 'Anjali Gupta', email: 'anjali.gupta@example.com',
    role: 'User', phone: '98745 63219', status: 'Active',
    createdOn: '09 Oct 2026', createdDate: '2026-10-09', dateOfBirth: '16 Apr 1998',
    gender: 'Female', bloodGroup: 'AB-', allergies: [], medicalConditions: ['Thyroid'],
    emergencyContact: { name: 'Manish Gupta', relationship: 'Brother', phone: '98745 63110' },
    totalReports: 3,
  },
]

const columns: TableColumn[] = [
  { key: 'number', header: '#' },
  { key: 'user', header: 'User' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status' },
  { key: 'createdOn', header: 'Created On' },
  { key: 'actions', header: 'Actions' },
]

const userStatistics = {
  totalUsers: 1248,
  activeUsers: 1054,
  inactiveUsers: 194,
  newUsersLastThirtyDays: 86,
}

const Users = ({ currentRole }: UsersProps) => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [datePickerKey, setDatePickerKey] = useState(0)
  const visibleRoles = useMemo(
    () => getVisibleUserRoles(currentRole),
    [currentRole],
  )

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return users.filter((user) => {
      if (!visibleRoles.includes(user.role)) return false
      const matchesSearch =
        !query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
      const matchesDate =
        !dateRange || (user.createdDate >= dateRange.startDate && user.createdDate <= dateRange.endDate)
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      return matchesSearch && matchesDate && matchesStatus && matchesRole
    })
  }, [dateRange, roleFilter, search, statusFilter, visibleRoles])

  const resetFilters = () => {
    setSearch('')
    setRoleFilter('all')
    setStatusFilter('all')
    setDateRange(null)
    setDatePickerKey((key) => key + 1)
  }

  const tableRows: TableRow[] = filteredUsers.map((user, index) => ({
    key: user.id,
    cells: {
      number: index + 1,
      user: (
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <UserRound size={16} />
          </span>
          <span>
            <span className="block font-semibold text-text">{user.name}</span>
            <span className="block text-tiny text-text-muted">{user.id}</span>
          </span>
        </div>
      ),
      email: user.email,
      role: (
        <span className={`inline-flex rounded-full px-2.5 py-1 font-semibold ${
          user.role === 'Super Admin' ? 'bg-accent-soft text-accent' :
          user.role === 'Admin' ? 'bg-primary-soft text-primary' :
          user.role === 'Content Admin' ? 'bg-chart-amber-soft text-chart-amber-dark' :
          'bg-chart-green-soft text-chart-green-dark'
        }`}>
          {user.role}
        </span>
      ),
      status: (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${
          user.status === 'Active' ? 'bg-chart-green-soft text-chart-green-dark' : 'bg-accent-soft text-accent'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'Active' ? 'bg-chart-green-dark' : 'bg-accent'}`} />
          {user.status}
        </span>
      ),
      createdOn: user.createdOn,
      actions: (
        <div className="flex items-center gap-1">
          <button type="button" title="View profile" onClick={() => navigate(`/users/view/${user.id}`, { state: { user } })} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary">
            <Eye size={18} />
          </button>
          <button type="button" title="Edit profile" onClick={() => navigate(`/users/edit/${user.id}`, { state: { user } })} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary">
            <Pencil size={17} />
          </button>
        </div>
      ),
    },
  }))

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="m-0 text-title font-bold tracking-tight text-text">Users</h1>
            <p className="mt-1 mb-0 text-small text-text-muted">View registered users and their profile information.</p>
          </div>
          <Button variant="red" size="small" onClick={() => navigate('/users/create')} className="gap-2 self-start sm:self-auto">
            <Plus size={16} /> Create User
          </Button>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatisticCard id="total-users" label="Total Users" value={userStatistics.totalUsers} icon={UserRound} tone="primary" />
          <StatisticCard id="active-users" label="Active Users" value={userStatistics.activeUsers} icon={UserCheck} tone="green" />
          <StatisticCard id="inactive-users" label="Inactive Users" value={userStatistics.inactiveUsers} icon={UserX} tone="accent" />
          <StatisticCard id="new-users-last-30-days" label="New Users (Last 30 Days)" value={userStatistics.newUsersLastThirtyDays} icon={UserPlus} tone="amber" />
        </div>

        <div className="overflow-visible rounded-xl border border-border-soft bg-white shadow-sm">
          <div className="grid gap-2 border-b border-border p-3 sm:grid-cols-2 xl:grid-cols-[minmax(15rem,1fr)_auto_9rem_9rem_auto]">
            <SearchBar value={search} placeholder="Search by name or email..." onChange={setSearch} />
            <DateRangePicker key={datePickerKey} onChange={setDateRange} />
            <FilterSelect value={roleFilter} options={[
              { label: 'All Roles', value: 'all' },
              ...visibleRoles.map((role) => ({
                label: role,
                value: role as UserRole,
              })),
            ]} onChange={setRoleFilter} />
            <FilterSelect value={statusFilter} options={[
              { label: 'All Status', value: 'all' },
              { label: 'Active', value: 'Active' as UserStatus },
              { label: 'Inactive', value: 'Inactive' as UserStatus },
            ]} onChange={setStatusFilter} />
            <button type="button" title="Reset filters" onClick={resetFilters} className="flex h-8 items-center justify-center rounded-md border border-primary-border bg-white px-3 text-tiny font-semibold text-primary transition-colors hover:bg-primary-hover">Reset</button>
          </div>

          <Table columns={columns} rows={tableRows} />

          <div className="flex flex-col gap-3 border-t border-border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1">
              <button type="button" title="Previous page" className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted"><ChevronLeft size={15} /></button>
              <span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-primary px-2 text-tiny font-semibold text-white">1</span>
              <button type="button" title="Next page" className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted"><ChevronRight size={15} /></button>
            </div>
            <p className="m-0 text-tiny text-text-muted">Showing {filteredUsers.length === 0 ? 0 : 1}-{filteredUsers.length} of {filteredUsers.length} users</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Users
