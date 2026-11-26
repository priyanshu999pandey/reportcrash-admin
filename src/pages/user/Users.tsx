import axios from 'axios'
import { Eye, LoaderCircle, Pencil, Trash2, UserCheck, UserPlus, UserRound, UserX, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DateRangePicker from '../../components/baseComponents/DateRangePicker'
import ApiImage from '../../components/baseComponents/ApiImage'
import FilterSelect from '../../components/baseComponents/FilterSelect'
import Pagination from '../../components/baseComponents/Pagination'
import SearchBar from '../../components/baseComponents/SearchBar'
import StatisticCard from '../../components/baseComponents/StatisticCard'
import Table from '../../components/baseComponents/Table'
import { apiUrls } from '../../config/api'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setRoles } from '../../store/rolePermissionSlice'
import { removeStoredUser, setUsers, setUsersError, setUsersLoading } from '../../store/userSlice'
import { updateStoredUser } from '../../store/userSlice'
import type { DateRange, DeleteUserResponse, RolesResponse, TableColumn, TableRow, UpdateAssignedUserRoleResponse, UserApiItem, UserProfileRow, UserRole, UsersApiResponse, UsersProps, UserStatus } from '../../types'
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
  const availableAdminRoles = useAppSelector((state) => state.rolesPermissions.roles)
  const adminRole = useAppSelector((state) => state.auth.adminRole)
  const canDeleteUsers = hasAuthPermission(adminRole, 'users:delete')
  const canUpdateUsers = hasAuthPermission(adminRole, 'users:update')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [profileFilter, setProfileFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [datePickerKey, setDatePickerKey] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingUserId, setDeletingUserId] = useState('')
  const [assigningUser, setAssigningUser] = useState<UserApiItem | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [isAssigningRole, setIsAssigningRole] = useState(false)
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)
  const [actionError, setActionError] = useState('')
  const usersPerPage = 10
  const visibleRoles = useMemo(() => getVisibleUserRoles(currentRole), [currentRole])
  const activeAssignableRoles = useMemo(
    () =>
      availableAdminRoles.filter(
        (role) => role.isActive !== false && role.isDeleted !== true,
      ),
    [availableAdminRoles],
  )

  useEffect(() => {
    if (!canUpdateUsers || availableAdminRoles.length > 0) return

    const controller = new AbortController()
    const loadRoles = async () => {
      setIsLoadingRoles(true)
      try {
        const response = await axios.get(apiUrls.roles, {
          signal: controller.signal,
          params: { status: 'active' },
        })
        const result = response.data as RolesResponse
        if (result.success) dispatch(setRoles(result.data))
      } catch (requestError: unknown) {
        if (!axios.isCancel(requestError)) {
          setActionError(
            axios.isAxiosError(requestError)
              ? (requestError.response?.data?.message ?? requestError.message)
              : 'Unable to load admin roles.',
          )
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingRoles(false)
      }
    }

    void loadRoles()
    return () => controller.abort()
  }, [availableAdminRoles.length, canUpdateUsers, dispatch])

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

  const deleteUser = async (user: UserApiItem) => {
    if (!window.confirm(`Delete ${getDisplayName(user)}?`)) return

    setDeletingUserId(user.id)
    setActionError('')

    try {
      const response = await axios.delete(apiUrls.deleteUser(user.id))
      const result = response.data as DeleteUserResponse
      if (!result.success) {
        setActionError(result.message || 'Unable to delete user.')
        return
      }

      dispatch(removeStoredUser(user.id))
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1)
      }
    } catch (requestError: unknown) {
      setActionError(
        axios.isAxiosError(requestError)
          ? (requestError.response?.data?.message ?? requestError.message)
          : 'Unable to delete user.',
      )
    } finally {
      setDeletingUserId('')
    }
  }

  const openRoleAssignment = (user: UserApiItem) => {
    setAssigningUser(user)
    setSelectedRoleId(user.adminRole?._id ?? '')
    setActionError('')
  }

  const closeRoleAssignment = () => {
    if (isAssigningRole) return
    setAssigningUser(null)
    setSelectedRoleId('')
  }

  const assignRole = async () => {
    if (!assigningUser || !selectedRoleId) {
      setActionError('Please select an admin role.')
      return
    }

    const selectedRole = activeAssignableRoles.find(
      (role) => role._id === selectedRoleId,
    )
    if (!selectedRole) {
      setActionError('The selected admin role is unavailable.')
      return
    }

    setIsAssigningRole(true)
    setActionError('')
    try {
      const response = await axios.patch(
        apiUrls.updateAssignedUserRole(assigningUser.id),
        { roleId: selectedRoleId },
      )
      const result = response.data as UpdateAssignedUserRoleResponse
      if (!result.success) {
        setActionError(result.message || 'Unable to assign role.')
        return
      }

      dispatch(
        updateStoredUser({
          ...assigningUser,
          role: 'admin',
          adminRole: selectedRole,
        }),
      )
      setAssigningUser(null)
      setSelectedRoleId('')
    } catch (requestError: unknown) {
      setActionError(
        axios.isAxiosError(requestError)
          ? (requestError.response?.data?.message ?? requestError.message)
          : 'Unable to assign role.',
      )
    } finally {
      setIsAssigningRole(false)
    }
  }

  const tableRows: TableRow[] = filteredUsers.map((user, index) => {
    const profile = createProfileRow(user)
    return {
      key: user.id,
      cells: {
        number: (currentPage - 1) * usersPerPage + index + 1,
        user: <div className="flex items-center gap-2"><ApiImage src={user.profileImage} alt={profile.name} className="h-8 w-8 shrink-0 rounded-full object-cover" fallback={<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"><UserRound size={16} /></span>} /><span><span className="block font-semibold capitalize text-text">{profile.name}</span><span className="block text-tiny text-text-muted">{user.id}</span></span></div>,
        email: user.email,
        role: <span className="inline-flex rounded-full bg-primary-soft px-2.5 py-1 font-semibold text-primary">{getRoleLabel(user)}</span>,
        profile: <span className={`inline-flex rounded-full px-2.5 py-1 font-semibold ${user.isProfileComplete ? 'bg-chart-green-soft text-chart-green-dark' : 'bg-chart-amber-soft text-chart-amber-dark'}`}>{user.isProfileComplete ? 'Complete' : 'Incomplete'}</span>,
        status: <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${user.isActive ? 'bg-chart-green-soft text-chart-green-dark' : 'bg-accent-soft text-accent'}`}><span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-chart-green-dark' : 'bg-accent'}`} />{profile.status}</span>,
        createdOn: profile.createdOn,
        actions: <div className="flex items-center gap-1"><button type="button" title="View profile" onClick={() => navigate(`/users/view/${user.id}`, { state: { user: profile } })} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary"><Eye size={18} /></button>{canUpdateUsers && <button type="button" title="Assign or change admin role" disabled={isLoadingRoles} onClick={() => openRoleAssignment(user)} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-50">{isLoadingRoles ? <LoaderCircle size={17} className="animate-spin" /> : <Pencil size={17} />}</button>}{canDeleteUsers && <button type="button" title="Delete user" disabled={deletingUserId === user.id} onClick={() => void deleteUser(user)} className="flex h-8 w-8 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60">{deletingUserId === user.id ? <LoaderCircle size={17} className="animate-spin" /> : <Trash2 size={17} />}</button>}</div>,
      },
    }
  })

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-5"><h1 className="m-0 text-title font-bold tracking-tight text-text">Users</h1><p className="mt-1 mb-0 text-small text-text-muted">View registered users and their profile information.</p></div>
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatisticCard id="total-users" label="Total Users" value={userStatistics.totalUsers} icon={UserRound} tone="primary" /><StatisticCard id="active-users" label="Active Users" value={userStatistics.activeUsers} icon={UserCheck} tone="green" /><StatisticCard id="inactive-users" label="Inactive Users" value={userStatistics.inactiveUsers} icon={UserX} tone="accent" /><StatisticCard id="new-users-last-30-days" label="New Users (Last 30 Days)" value={userStatistics.newUsersLastThirtyDays} icon={UserPlus} tone="amber" /></div>
        <div className="overflow-visible rounded-xl border border-border-soft bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 overflow-visible border-b border-border p-3 xl:flex-nowrap">
            <div className="min-w-64 flex-1"><SearchBar value={search} placeholder="Search by name or email..." onChange={(value) => { setSearch(value); setCurrentPage(1) }} /></div>
            <div className="relative z-20 w-56 shrink-0"><DateRangePicker key={datePickerKey} onChange={(value) => { setDateRange(value); setCurrentPage(1) }} /></div>
            <div className="w-28 shrink-0"><FilterSelect value={roleFilter} options={[{ label: 'All Roles', value: 'all' }, ...availableRoleLabels.map((role) => ({ label: role, value: role }))]} onChange={(value) => { setRoleFilter(value); setCurrentPage(1) }} /></div>
            <div className="w-28 shrink-0"><FilterSelect value={statusFilter} options={[{ label: 'All Status', value: 'all' }, { label: 'Active', value: 'Active' as UserStatus }, { label: 'Inactive', value: 'Inactive' as UserStatus }]} onChange={(value) => { setStatusFilter(value); setCurrentPage(1) }} /></div>
            <div className="w-32 shrink-0"><FilterSelect value={profileFilter} options={[{ label: 'All Profiles', value: 'all' }, { label: 'Complete', value: 'complete' }, { label: 'Incomplete', value: 'incomplete' }]} onChange={(value) => { setProfileFilter(value); setCurrentPage(1) }} /></div>
            <button type="button" title="Reset filters" onClick={resetFilters} className="flex h-8 shrink-0 items-center justify-center rounded-md border border-primary-border bg-white px-3 text-tiny font-semibold text-primary transition-colors hover:bg-primary-hover">Reset</button>
          </div>
          {actionError && <p className="m-3 rounded-lg bg-accent-soft px-3 py-2 text-tiny font-medium text-accent">{actionError}</p>}
          {isLoading ? <div className="flex min-h-48 items-center justify-center gap-2 text-small text-text-muted"><LoaderCircle size={18} className="animate-spin text-primary" />Loading users...</div> : error ? <div className="flex min-h-48 items-center justify-center px-4 text-small font-medium text-accent">{error}</div> : <Table columns={columns} rows={tableRows} />}
          {!isLoading && !error && <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalUsers} pageSize={usersPerPage} currentItemCount={filteredUsers.length} itemLabel="users" onPageChange={setCurrentPage} />}
        </div>
      </div>
      {assigningUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4" role="dialog" aria-modal="true" aria-labelledby="assign-role-title">
          <div className="w-full max-w-md rounded-xl border border-border-soft bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div><h2 id="assign-role-title" className="m-0 text-body font-bold text-text">Assign Admin Role</h2><p className="mt-1 mb-0 text-small text-text-muted">Choose the admin role for {getDisplayName(assigningUser)}.</p></div>
              <button type="button" title="Close" onClick={closeRoleAssignment} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-primary-soft hover:text-primary"><X size={18} /></button>
            </div>
            {actionError && <p className="mb-3 rounded-lg bg-accent-soft px-3 py-2 text-tiny font-medium text-accent">{actionError}</p>}
            <label className="block"><span className="mb-1.5 block text-small font-semibold text-text">Admin role ({activeAssignableRoles.length} available)</span><select value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value)} disabled={isAssigningRole} className="h-10 w-full rounded-md border border-border bg-white px-3 text-small text-text outline-none focus:border-primary"><option value="">Select a role</option>{activeAssignableRoles.map((role) => <option key={role._id} value={role._id}>{role.name}</option>)}</select></label>
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={closeRoleAssignment} disabled={isAssigningRole} className="h-9 rounded-md border border-border bg-white px-4 text-small font-semibold text-text disabled:opacity-60">Cancel</button><button type="button" onClick={() => void assignRole()} disabled={!selectedRoleId || isAssigningRole} className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-small font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{isAssigningRole && <LoaderCircle size={16} className="animate-spin" />}Assign Role</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
