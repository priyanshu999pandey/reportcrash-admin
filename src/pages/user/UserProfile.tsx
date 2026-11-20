import {
  ArrowLeft,
  CircleCheck,
  Clock3,
  Droplets,
  FileText,
  HeartPulse,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Table from '../../components/baseComponents/Table'
import type {
  AdminRole,
  TableColumn,
  TableRow,
  UserProfileNavigationState,
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

const UserProfile = ({ mode = 'view', currentRole: viewerRole }: UserProfileProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { userId } = useParams<{ userId: string }>()
  const user = (location.state as UserProfileNavigationState | null)?.user
  const isEditMode = mode === 'edit'
  const [currentName, setCurrentName] = useState(user?.name ?? '')
  const [currentRole, setCurrentRole] = useState<UserRole>(user?.role ?? 'User')
  const [currentStatus, setCurrentStatus] = useState<UserStatus>(user?.status ?? 'Inactive')
  const isUserProfile = user?.role === 'User'

  if (!user || user.id !== userId || !canViewUser(viewerRole, user)) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-4 sm:p-5 lg:p-6">
        <div className="mx-auto max-w-2xl rounded-xl border border-border bg-white p-6 text-center shadow-sm">
          <h1 className="m-0 text-title font-bold text-text">Admin not found</h1>
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

  if (isUserProfile) {
    const emergencyContacts = [
      user.emergencyContact,
      { name: 'Anjali Sharma', relationship: 'Sister', phone: '98745 63121' },
      { name: 'Rajesh Sharma', relationship: 'Father', phone: '98745 63122' },
      { name: 'Sunita Sharma', relationship: 'Mother', phone: '98745 63123' },
      { name: 'Vivek Sharma', relationship: 'Friend', phone: '98745 63124' },
    ]
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
            <strong className="text-text">{isEditMode ? 'Edit User Profile' : 'User Profile'}</strong>
          </button>

          <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="rounded-xl border border-border-soft bg-white p-5 text-center shadow-sm">
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary"><UserRound size={38} /></span>
                <h1 className="mt-4 mb-0 text-body font-bold text-text">{user.name}</h1>
                <p className="mt-1 mb-0 break-all text-tiny text-text-muted">{user.email}</p>
                <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-tiny font-semibold ${currentStatus === 'Active' ? 'bg-chart-green-soft text-chart-green-dark' : 'bg-accent-soft text-accent'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${currentStatus === 'Active' ? 'bg-chart-green-dark' : 'bg-accent'}`} />
                  {currentStatus}
                </span>
                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-4 text-left">
                  <div><p className="m-0 text-tiny text-text-muted">User ID</p><p className="mt-1 mb-0 text-tiny font-semibold text-text">{user.id}</p></div>
                  <div><p className="m-0 text-tiny text-text-muted">Joined On</p><p className="mt-1 mb-0 text-tiny font-semibold text-text">{user.createdOn}</p></div>
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
                  <div><p className="m-0 text-tiny text-text-muted">Role</p><p className="mt-1 mb-0 text-small font-semibold text-primary">{user.role}</p></div>
                </div>
              </div>

              <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary"><HeartPulse size={18} /></span>
                  <div><h2 className="m-0 text-body font-bold text-text">Medical Information</h2><p className="mt-1 mb-0 text-tiny text-text-muted">Medical details available for emergency assistance.</p></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-primary-faint p-4"><Droplets size={17} className="text-primary" /><p className="mt-3 mb-0 text-tiny text-text-muted">Blood Group</p><p className="mt-1 mb-0 text-small font-semibold text-text">{user.bloodGroup}</p></div>
                  <div className="rounded-lg bg-primary-faint p-4"><HeartPulse size={17} className="text-primary" /><p className="mt-3 mb-0 text-tiny text-text-muted">Allergies</p><p className="mt-1 mb-0 text-small font-semibold text-text">{user.allergies.length > 0 ? user.allergies.join(', ') : 'None reported'}</p></div>
                  <div className="rounded-lg bg-primary-faint p-4"><FileText size={17} className="text-primary" /><p className="mt-3 mb-0 text-tiny text-text-muted">Medical Conditions</p><p className="mt-1 mb-0 text-small font-semibold text-text">{user.medicalConditions.length > 0 ? user.medicalConditions.join(', ') : 'None reported'}</p></div>
                </div>
              </div>

              <div className="rounded-xl border border-border-soft bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary"><UsersRound size={18} /></span>
                  <div><h2 className="m-0 text-body font-bold text-text">Emergency Contacts</h2><p className="mt-1 mb-0 text-tiny text-text-muted">People to contact during an emergency.</p></div>
                </div>
                <Table columns={emergencyContactColumns} rows={emergencyContactRows} />
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
