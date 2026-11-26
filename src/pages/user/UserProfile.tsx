import axios from 'axios'
import {
  ArrowLeft,
  CircleCheck,
  Clock3,
  Droplets,
  FileText,
  HeartPulse,
  LoaderCircle,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Table from '../../components/baseComponents/Table'
import ApiImage from '../../components/baseComponents/ApiImage'
import { apiUrls } from '../../config/api'
import type {
  AdminRole,
  TableColumn,
  TableRow,
  UserApiItem,
  UserApiResponse,
  UserProfileNavigationState,
  UserProfileRow,
  UserProfileProps,
  UserRole,
  UserStatus,
} from '../../types'
import { canViewUser, getCreatableRoles } from '../../utils/permissions'

const rolePermissions: Record<UserRole, readonly string[]> = {
  'Super Admin': ['Manage administrators', 'Manage reports', 'Manage content','View dashboard' ],
  Admin: ['Manage users', 'Manage reports', 'View dashboard'],
  'Content Admin': ['Manage safety content'],
  User: ['Submit accident reports', 'Send SOS alerts'],
}

const emergencyContactColumns: TableColumn[] = [
  { key: 'number', header: '#' },
  { key: 'name', header: 'Name' },
  { key: 'relationship', header: 'Relationship' },
  { key: 'phone', header: 'Phone Number' },
]

const formatDate = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value))
    : 'Not available'

const getUserRole = (user: UserApiItem): UserRole => {
  if (user.role.toLowerCase() !== 'admin') return 'User'
  const roleName = user.adminRole?.name.toLowerCase() ?? ''
  if (roleName === 'super admin') return 'Super Admin'
  if (roleName.includes('content')) return 'Content Admin'
  return 'Admin'
}

const mapApiUser = (user: UserApiItem): UserProfileRow => ({
  id: user.id,
  name: user.name?.trim() || user.email.split('@')[0],
  email: user.email,
  role: getUserRole(user),
  assignedRoleName:
    user.role.toLowerCase() === 'admin'
      ? (user.adminRole?.name ?? 'Admin')
      : 'User',
  profileImage: user.profileImage,
  phone: user.phone ?? 'Not available',
  status: user.isActive ? 'Active' : 'Inactive',
  createdOn: formatDate(user.createdAt),
  createdDate: user.createdAt.slice(0, 10),
  dateOfBirth: formatDate(user.personalInfo.dateOfBirth),
  gender: user.personalInfo.gender ?? 'Not available',
  address: user.personalInfo.address ?? 'Not available',
  city: user.personalInfo.city ?? 'Not available',
  state: user.personalInfo.state ?? 'Not available',
  bloodGroup: user.medicalInfo.bloodGroup ?? 'Not available',
  allergies: user.medicalInfo.allergies,
  medications: user.medicalInfo.medications,
  medicalConditions: user.medicalInfo.medicalConditions,
  emergencyNotes: user.medicalInfo.emergencyNotes ?? 'Not available',
  emergencyContact: {
    name: 'Not available',
    relationship: 'Not available',
    phone: 'Not available',
  },
  totalReports: 0,
})

const UserProfile = ({ mode = 'view', currentRole: viewerRole }: UserProfileProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { userId } = useParams<{ userId: string }>()
  const navigationUser = (location.state as UserProfileNavigationState | null)?.user
  const [user, setUser] = useState<UserProfileRow | null>(navigationUser ?? null)
  const [isLoading, setIsLoading] = useState(!navigationUser)
  const [loadError, setLoadError] = useState('')
  const isEditMode = mode === 'edit'
  const [currentName, setCurrentName] = useState(navigationUser?.name ?? '')
  const [currentRole, setCurrentRole] = useState<UserRole>(navigationUser?.role ?? 'User')
  const [currentStatus, setCurrentStatus] = useState<UserStatus>(navigationUser?.status ?? 'Inactive')
  const isUserProfile = user?.role === 'User'

  useEffect(() => {
    if (!userId) return
    const controller = new AbortController()

    const loadUser = async () => {
      setIsLoading(true)
      setLoadError('')

      try {
        const response = await axios.get(apiUrls.userById(userId), {
          signal: controller.signal,
        })
        const result = response.data as UserApiResponse
        if (!result.success) {
          setLoadError(result.message || 'Unable to load user.')
          return
        }
        const profile = mapApiUser(result.data)
        setUser(profile)
        setCurrentName(profile.name)
        setCurrentRole(profile.role)
        setCurrentStatus(profile.status)
      } catch (requestError: unknown) {
        if (axios.isCancel(requestError)) return
        setLoadError(
          axios.isAxiosError(requestError)
            ? (requestError.response?.data?.message ?? requestError.message)
            : 'Unable to load user.',
        )
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadUser()
    return () => controller.abort()
  }, [userId])

  if (isLoading && !user) {
    return <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center gap-2 bg-primary-page text-small text-text-muted"><LoaderCircle size={20} className="animate-spin text-primary" />Loading user profile...</div>
  }

  if (!user || user.id !== userId || !canViewUser(viewerRole, user)) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
        <div className="mx-auto max-w-2xl rounded-xl border border-border bg-white p-6 text-center shadow-sm">
          <h1 className="m-0 text-title font-bold text-text">User not found</h1>
          {loadError && <p className="mt-2 mb-0 text-small text-accent">{loadError}</p>}
          <button type="button" onClick={() => navigate('/users')} className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-small font-semibold text-white">
            <ArrowLeft size={16} /> Back to Users
          </button>
        </div>
      </div>
    )
  }

  const permissions = rolePermissions[currentRole]

  const saveProfile = () => {
    navigate(`/users/view/${user.id}`, {
      replace: true,
      state: {
        user: {
          ...user,
          name: isUserProfile ? user.name : currentName,
          role: isUserProfile ? 'User' : currentRole,
          status: currentStatus,
        },
      },
    })
  }

  const cancelEditing = () => {
    navigate(`/users/view/${user.id}`, { replace: true, state: { user } })
  }

  if (user) {
    const emergencyContacts =
      user.emergencyContact.phone === 'Not available'
        ? []
        : [user.emergencyContact]
    const resolvedReports = Math.max(user.totalReports - 1, 0)
    const inProgressReports = user.totalReports > 0 ? 1 : 0
    const emergencyContactRows: TableRow[] = emergencyContacts.map((contact, index) => ({
      key: `${contact.phone}-${index}`,
      cells: {
        number: index + 1,
        name: <span className="font-semibold text-text">{contact.name}</span>,
        relationship: contact.relationship,
        phone: contact.phone,
      },
    }))

    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
        <div className="mx-auto max-w-[1440px]">
          <button type="button" onClick={() => navigate('/users')} className="mb-4 inline-flex items-center gap-2 text-small font-semibold text-text-muted transition-colors hover:text-primary">
            <ArrowLeft size={16} /> Users <span>/</span>
            <strong className="text-text">{isEditMode ? 'Edit Profile' : 'Profile Details'}</strong>
          </button>

          {loadError && <p className="mb-4 rounded-lg bg-accent-soft px-4 py-2.5 text-tiny font-medium text-accent">{loadError}</p>}

          <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="rounded-xl border border-border-soft bg-white p-5 text-center shadow-sm">
                <ApiImage src={user.profileImage} alt={`${user.name} profile`} className="mx-auto h-24 w-24 rounded-full border-4 border-primary-soft object-cover shadow-sm" fallback={<span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary-soft bg-primary-soft text-primary"><UserRound size={42} /></span>} />
                <h1 className="mt-4 mb-0 text-body font-bold text-text">{user.name}</h1>
                <p className="mt-1 mb-0 break-all text-tiny text-text-muted">{user.email}</p>
                <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-tiny font-semibold ${currentStatus === 'Active' ? 'bg-chart-green-soft text-chart-green-dark' : 'bg-accent-soft text-accent'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${currentStatus === 'Active' ? 'bg-chart-green-dark' : 'bg-accent'}`} />
                  {currentStatus}
                </span>
                <div className="mt-5 border-t border-border pt-4 text-left">
                  <p className="m-0 text-tiny text-text-muted">User ID</p><p className="mt-1 mb-0 break-all text-tiny font-semibold leading-5 text-text">{user.id}</p>
                </div>
              </div>

              {isEditMode && (
                <div className="rounded-xl border border-border-soft bg-white p-4 shadow-sm">
                  <h2 className="mt-0 mb-3 text-small font-bold text-text">Account Status</h2>
                  <select value={currentStatus} onChange={(event) => setCurrentStatus(event.target.value as UserStatus)} className="h-9 w-full rounded-md border border-border bg-white px-3 text-small text-text outline-none focus:border-primary">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" onClick={cancelEditing} className="h-9 rounded-full border border-primary-border bg-white px-3 text-tiny font-semibold text-primary">Cancel</button>
                    <button type="button" onClick={saveProfile} className="h-9 rounded-full bg-primary px-3 text-tiny font-semibold text-white">Save</button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary"><UserRound size={18} /></span>
                  <div><h2 className="m-0 text-body font-bold text-text">Personal Information</h2><p className="mt-1 mb-0 text-tiny text-text-muted">Basic account and contact information.</p></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div><p className="m-0 text-tiny text-text-muted">Full Name</p><p className="mt-1 mb-0 text-small font-semibold text-text">{user.name}</p></div>
                  <div><p className="m-0 text-tiny text-text-muted">Email Address</p><p className="mt-1 mb-0 break-all text-small font-semibold text-text">{user.email}</p></div>
                  <div><p className="m-0 text-tiny text-text-muted">Phone Number</p><p className="mt-1 mb-0 text-small font-semibold text-text">{user.phone}</p></div>
                  <div><p className="m-0 text-tiny text-text-muted">Date of Birth</p><p className="mt-1 mb-0 text-small font-semibold text-text">{user.dateOfBirth}</p></div>
                  <div><p className="m-0 text-tiny text-text-muted">Gender</p><p className="mt-1 mb-0 text-small font-semibold text-text">{user.gender}</p></div>
                  <div><p className="m-0 text-tiny text-text-muted">Role</p><p className="mt-1 mb-0 text-small font-semibold text-primary">{user.assignedRoleName ?? user.role}</p></div>
                  <div><p className="m-0 text-tiny text-text-muted">Joined On</p><p className="mt-1 mb-0 text-small font-semibold text-text">{user.createdOn}</p></div>
                  <div><p className="m-0 text-tiny text-text-muted">Address</p><p className="mt-1 mb-0 text-small font-semibold text-text">{user.address}</p></div>
                  <div><p className="m-0 text-tiny text-text-muted">City</p><p className="mt-1 mb-0 text-small font-semibold text-text">{user.city}</p></div>
                  <div><p className="m-0 text-tiny text-text-muted">State</p><p className="mt-1 mb-0 text-small font-semibold text-text">{user.state}</p></div>
                </div>
              </div>

              <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary"><HeartPulse size={18} /></span>
                  <div><h2 className="m-0 text-body font-bold text-text">Medical Information</h2><p className="mt-1 mb-0 text-tiny text-text-muted">Medical details available for emergency assistance.</p></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-lg bg-primary-faint p-4"><Droplets size={17} className="text-primary" /><p className="mt-3 mb-0 text-tiny text-text-muted">Blood Group</p><p className="mt-1 mb-0 text-small font-semibold text-text">{user.bloodGroup}</p></div>
                  <div className="rounded-lg bg-primary-faint p-4"><HeartPulse size={17} className="text-primary" /><p className="mt-3 mb-0 text-tiny text-text-muted">Allergies</p><p className="mt-1 mb-0 text-small font-semibold text-text">{user.allergies.length > 0 ? user.allergies.join(', ') : 'None reported'}</p></div>
                  <div className="rounded-lg bg-primary-faint p-4"><FileText size={17} className="text-primary" /><p className="mt-3 mb-0 text-tiny text-text-muted">Medical Conditions</p><p className="mt-1 mb-0 text-small font-semibold text-text">{user.medicalConditions.length > 0 ? user.medicalConditions.join(', ') : 'None reported'}</p></div>
                  <div className="rounded-lg bg-primary-faint p-4"><FileText size={17} className="text-primary" /><p className="mt-3 mb-0 text-tiny text-text-muted">Medications</p><p className="mt-1 mb-0 text-small font-semibold text-text">{user.medications && user.medications.length > 0 ? user.medications.join(', ') : 'None reported'}</p></div>
                  <div className="rounded-lg bg-primary-faint p-4 sm:col-span-2"><FileText size={17} className="text-primary" /><p className="mt-3 mb-0 text-tiny text-text-muted">Emergency Notes</p><p className="mt-1 mb-0 text-small font-semibold text-text">{user.emergencyNotes}</p></div>
                </div>
              </div>

              <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary"><UsersRound size={18} /></span>
                  <div><h2 className="m-0 text-body font-bold text-text">Emergency Contacts</h2><p className="mt-1 mb-0 text-tiny text-text-muted">People to contact during an emergency.</p></div>
                </div>
                {emergencyContactRows.length > 0 ? <Table columns={emergencyContactColumns} rows={emergencyContactRows} /> : <p className="m-0 rounded-lg bg-primary-faint p-4 text-small text-text-muted">Emergency contacts are not included in this user response.</p>}
              </div>

              <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary"><FileText size={18} /></span>
                  <div><h2 className="m-0 text-body font-bold text-text">My Reports</h2><p className="mt-1 mb-0 text-tiny text-text-muted">Accident reports submitted by this user.</p></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-lg bg-primary-faint p-4"><FileText size={20} className="text-primary" /><div><p className="m-0 text-tiny text-text-muted">Total Reports</p><p className="mt-1 mb-0 text-body font-bold text-text">{user.totalReports}</p></div></div>
                  <div className="flex items-center gap-3 rounded-lg bg-chart-green-soft p-4"><CircleCheck size={20} className="text-chart-green-dark" /><div><p className="m-0 text-tiny text-text-muted">Resolved</p><p className="mt-1 mb-0 text-body font-bold text-text">{resolvedReports}</p></div></div>
                  <div className="flex items-center gap-3 rounded-lg bg-chart-amber-soft p-4"><Clock3 size={20} className="text-chart-amber-dark" /><div><p className="m-0 text-tiny text-text-muted">In Progress</p><p className="mt-1 mb-0 text-body font-bold text-text">{inProgressReports}</p></div></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1440px]">
        <button type="button" onClick={() => navigate('/users')} className="mb-4 inline-flex items-center gap-2 text-small font-semibold text-text-muted transition-colors hover:text-primary">
          <ArrowLeft size={16} /> Users <span>/</span>
          <strong className="text-text">
            {isEditMode
              ? isUserProfile ? 'Edit User Profile' : 'Edit Admin Profile'
              : isUserProfile ? 'User Profile' : 'Admin Profile'}
          </strong>
        </button>

        <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <div className="rounded-xl border border-border-soft bg-white p-5 text-center shadow-sm">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary"><UserRound size={38} /></span>
            <h1 className="mt-4 mb-0 text-body font-bold text-text">{currentName}</h1>
            <p className="mt-1 mb-0 break-all text-tiny text-text-muted">{user.email}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-tiny font-semibold text-primary"><ShieldCheck size={14} />{currentRole}</span>
          </div>

          <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary"><UserRound size={18} /></span>
              <div>
                <h2 className="m-0 text-body font-bold text-text">Personal Information</h2>
                <p className="mt-1 mb-0 text-tiny text-text-muted">Administrator account and access information.</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="m-0 text-tiny text-text-muted">Full Name</p>
                {isEditMode && !isUserProfile ? (
                  <input type="text" value={currentName} onChange={(event) => setCurrentName(event.target.value)} className="mt-2 h-9 w-full rounded-md border border-border bg-white px-3 text-small text-text outline-none focus:border-primary" />
                ) : (
                  <p className="mt-1 mb-0 text-small font-semibold text-text">{currentName}</p>
                )}
              </div>
              <div>
                <p className="m-0 text-tiny text-text-muted">Email Address</p>
                <p className="mt-1 mb-0 break-all text-small font-semibold text-text">{user.email}</p>
              </div>
              <div>
                <p className="m-0 text-tiny text-text-muted">Role</p>
                {isEditMode && !isUserProfile ? (
                  <select value={currentRole} onChange={(event) => setCurrentRole(event.target.value as AdminRole)} className="mt-2 h-9 w-full rounded-md border border-border bg-white px-3 text-small text-text outline-none focus:border-primary">
                    {getCreatableRoles(viewerRole).map((role) => <option key={role} value={role}>{role}</option>)}
                  </select>
                ) : (
                  <p className="mt-1 mb-0 text-small font-semibold text-primary">{currentRole}</p>
                )}
              </div>
              <div>
                <p className="m-0 text-tiny text-text-muted">Account Status</p>
                {isEditMode ? (
                  <select value={currentStatus} onChange={(event) => setCurrentStatus(event.target.value as UserStatus)} className="mt-2 h-9 w-full rounded-md border border-border bg-white px-3 text-small text-text outline-none focus:border-primary">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                ) : (
                  <p className="mt-1 mb-0 text-small font-semibold text-text">{currentStatus}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <p className="m-0 text-tiny text-text-muted">Permissions</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {permissions.map((permission) => <span key={permission} className="inline-flex rounded-full bg-primary-soft px-3 py-1.5 text-tiny font-semibold text-primary">{permission}</span>)}
                </div>
              </div>
            </div>

            {isEditMode && (
              <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                <button type="button" onClick={cancelEditing} className="h-9 rounded-full border border-primary-border bg-white px-4 text-small font-semibold text-primary">Cancel</button>
                <button type="button" onClick={saveProfile} disabled={!currentName.trim()} className="h-9 rounded-full bg-primary px-4 text-small font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">Save Changes</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
