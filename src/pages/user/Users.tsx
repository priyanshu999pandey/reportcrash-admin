import axios from 'axios'
import { Eye, LoaderCircle, Pencil, UserCheck, UserPlus, UserRound, UserX } from 'lucide-react'
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
import { setUsers, setUsersError, setUsersLoading } from '../../store/userSlice'
import type { DateRange, TableColumn, TableRow, UserApiItem, UserProfileRow, UserRole, UsersApiResponse, UsersProps, UserStatus } from '../../types'
import { getVisibleUserRoles } from '../../utils/permissions'
import { hasAuthPermission } from '../../utils/auth'

const columns: TableColumn[] = [
  { key: 'number', header: '#' }, { key: 'user', header: 'User' }, { key: 'email', header: 'Email' }, { key: 'role', header: 'Role' }, { key: 'profile', header: 'Profile' }, { key: 'status', header: 'Status' }, { key: 'createdOn', header: 'Created On' }, { key: 'actions', header: 'Actions' },
]

const userStatistics = { totalUsers: 1248, activeUsers: 1054, inactiveUsers: 194, newUsersLastThirtyDays: 86 }

const formatDate = (value: string) => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))

const getRoleCategory = (user: UserApiItem): UserRole => {
  if (user.role.toLowerCase() !== 'admin') return 'User'
  const assignedRole = user.adminRole?.name.toLowerCase() ?? ''
  if (assignedRole === 'super admin') return 'Super Admin'
  if (assignedRole.includes('content')) return 'Content Admin'
  return 'Admin'
}

const getRoleLabel = (user: UserApiItem) =>
  user.role.toLowerCase() === 'admin'
    ? (user.adminRole?.name ?? 'Admin')
    : 'User'

const getDisplayName = (user: UserApiItem) => user.name?.trim() || user.email.split('@')[0].replace(/[._-]+/g, ' ')

const createProfileRow = (user: UserApiItem): UserProfileRow => ({
  id: user.id,
  name: getDisplayName(user),
  email: user.email,
  role: getRoleCategory(user),
  assignedRoleName: getRoleLabel(user),
  phone: user.phone ?? 'Not available',
  status: user.isActive ? 'Active' : 'Inactive',
  createdOn: formatDate(user.createdAt),
  createdDate: user.createdAt.slice(0, 10),
  dateOfBirth: user.personalInfo.dateOfBirth ?? 'Not available',
  gender: user.personalInfo.gender ?? 'Not available',
  bloodGroup: user.medicalInfo.bloodGroup ?? 'Not available',
  allergies: user.medicalInfo.allergies,
  medicalConditions: user.medicalInfo.medicalConditions,
  emergencyContact: { name: 'Not available', relationship: 'Not available', phone: 'Not available' },
  totalReports: 0,
})

const Users = ({ currentRole }: UsersProps) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items: users, total: totalUsers, totalPages, isLoading, error } = useAppSelector((state) => state.users)
  const adminRole = useAppSelector((state) => state.auth.adminRole)
  const canUpdateUsers = hasAuthPermission(adminRole, 'users:update')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [profileFilter, setProfileFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [datePickerKey, setDatePickerKey] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 10
  const visibleRoles = useMemo(() => getVisibleUserRoles(currentRole), [currentRole])

  useEffect(() => {
    const controller = new AbortController()
    const loadUsers = async () => {
      dispatch(setUsersLoading(true))
      dispatch(setUsersError(''))
      try {
        const response = await axios.get(apiUrls.users, {
          signal: controller.signal,
          params: {
            page: currentPage,
            limit: usersPerPage,
            search,
            ...(statusFilter !== 'all' && { isActive: statusFilter === 'Active' }),
            ...(profileFilter !== 'all' && { isProfileComplete: profileFilter === 'complete' }),
          },
        })
        const result = response.data as UsersApiResponse
        if (!result.success) {
          dispatch(setUsersError(result.message || 'Unable to load users.'))
          return
        }
        dispatch(setUsers(result))
      } catch (requestError: unknown) {
        if (axios.isCancel(requestError)) return
        dispatch(setUsersError(axios.isAxiosError(requestError) ? (requestError.response?.data?.message ?? requestError.message) : 'Unable to load users.'))
      } finally {
        if (!controller.signal.aborted) dispatch(setUsersLoading(false))
      }
    }
    void loadUsers()
    return () => controller.abort()
  }, [currentPage, dispatch, profileFilter, search, statusFilter])

  const filteredUsers = useMemo(() => users.filter((user) => {
    const userRole = getRoleCategory(user)
    const roleLabel = getRoleLabel(user)
    if (!visibleRoles.includes(userRole)) return false
    const matchesRole = roleFilter === 'all' || roleLabel === roleFilter
    const createdDate = user.createdAt.slice(0, 10)
    const matchesDate = !dateRange || (createdDate >= dateRange.startDate && createdDate <= dateRange.endDate)
    return matchesRole && matchesDate
  }), [dateRange, roleFilter, users, visibleRoles])

  const availableRoleLabels = useMemo(
    () => [...new Set([...visibleRoles, ...users.filter((user) => visibleRoles.includes(getRoleCategory(user))).map(getRoleLabel)])],
    [users, visibleRoles],
  )

  const resetFilters = () => {
    setSearch('')
    setRoleFilter('all')
    setStatusFilter('all')
    setProfileFilter('all')
    setDateRange(null)
    setDatePickerKey((key) => key + 1)
    setCurrentPage(1)
  }

  const tableRows: TableRow[] = filteredUsers.map((user, index) => {
    const profile = createProfileRow(user)
    return {
      key: user.id,
      cells: {
        number: (currentPage - 1) * usersPerPage + index + 1,
        user: <div className="flex items-center gap-2">{user.profileImage ? <img src={user.profileImage} alt={profile.name} className="h-8 w-8 shrink-0 rounded-full object-cover" /> : <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><UserRound size={16} /></span>}<span><span className="block font-semibold capitalize text-text">{profile.name}</span><span className="block text-tiny text-text-muted">{user.id}</span></span></div>,
        email: user.email,
        role: <span className="inline-flex rounded-full bg-primary-soft px-2.5 py-1 font-semibold text-primary">{getRoleLabel(user)}</span>,
        profile: <span className={`inline-flex rounded-full px-2.5 py-1 font-semibold ${user.isProfileComplete ? 'bg-chart-green-soft text-chart-green-dark' : 'bg-chart-amber-soft text-chart-amber-dark'}`}>{user.isProfileComplete ? 'Complete' : 'Incomplete'}</span>,
        status: <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${user.isActive ? 'bg-chart-green-soft text-chart-green-dark' : 'bg-accent-soft text-accent'}`}><span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-chart-green-dark' : 'bg-accent'}`} />{profile.status}</span>,
        createdOn: profile.createdOn,
        actions: <div className="flex items-center gap-1"><button type="button" title="View profile" onClick={() => navigate(`/users/view/${user.id}`, { state: { user: profile } })} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary"><Eye size={18} /></button>{canUpdateUsers && <button type="button" title="Edit profile" onClick={() => navigate(`/users/edit/${user.id}`, { state: { user: profile } })} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary"><Pencil size={17} /></button>}</div>,
      },
    }
  })

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-5"><h1 className="m-0 text-title font-bold tracking-tight text-text">Users</h1><p className="mt-1 mb-0 text-small text-text-muted">View registered users and their profile information.</p></div>
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatisticCard id="total-users" label="Total Users" value={userStatistics.totalUsers} icon={UserRound} tone="primary" /><StatisticCard id="active-users" label="Active Users" value={userStatistics.activeUsers} icon={UserCheck} tone="green" /><StatisticCard id="inactive-users" label="Inactive Users" value={userStatistics.inactiveUsers} icon={UserX} tone="accent" /><StatisticCard id="new-users-last-30-days" label="New Users (Last 30 Days)" value={userStatistics.newUsersLastThirtyDays} icon={UserPlus} tone="amber" /></div>
        <div className="overflow-visible rounded-xl border border-border-soft bg-white shadow-sm">
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto border-b border-border p-3">
            <div className="min-w-48 flex-1"><SearchBar value={search} placeholder="Search by name or email..." onChange={(value) => { setSearch(value); setCurrentPage(1) }} /></div>
            <div className="w-56 shrink-0"><DateRangePicker key={datePickerKey} onChange={(value) => { setDateRange(value); setCurrentPage(1) }} /></div>
            <div className="w-28 shrink-0"><FilterSelect value={roleFilter} options={[{ label: 'All Roles', value: 'all' }, ...availableRoleLabels.map((role) => ({ label: role, value: role }))]} onChange={(value) => { setRoleFilter(value); setCurrentPage(1) }} /></div>
            <div className="w-28 shrink-0"><FilterSelect value={statusFilter} options={[{ label: 'All Status', value: 'all' }, { label: 'Active', value: 'Active' as UserStatus }, { label: 'Inactive', value: 'Inactive' as UserStatus }]} onChange={(value) => { setStatusFilter(value); setCurrentPage(1) }} /></div>
            <div className="w-32 shrink-0"><FilterSelect value={profileFilter} options={[{ label: 'All Profiles', value: 'all' }, { label: 'Complete', value: 'complete' }, { label: 'Incomplete', value: 'incomplete' }]} onChange={(value) => { setProfileFilter(value); setCurrentPage(1) }} /></div>
            <button type="button" title="Reset filters" onClick={resetFilters} className="flex h-8 shrink-0 items-center justify-center rounded-md border border-primary-border bg-white px-3 text-tiny font-semibold text-primary transition-colors hover:bg-primary-hover">Reset</button>
          </div>
          {isLoading ? <div className="flex min-h-48 items-center justify-center gap-2 text-small text-text-muted"><LoaderCircle size={18} className="animate-spin text-primary" />Loading users...</div> : error ? <div className="flex min-h-48 items-center justify-center px-4 text-small font-medium text-accent">{error}</div> : <Table columns={columns} rows={tableRows} />}
          {!isLoading && !error && <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalUsers} pageSize={usersPerPage} currentItemCount={filteredUsers.length} itemLabel="users" onPageChange={setCurrentPage} />}
        </div>
      </div>
    </div>
  )
}

export default Users
