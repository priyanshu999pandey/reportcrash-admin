import axios from 'axios'
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileWarning,
  KeyRound,
  LayoutDashboard,
  LoaderCircle,
  Pencil,
  PhoneCall,
  ShieldCheck,
  ShieldOff,
  Siren,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState, type SubmitEventHandler } from 'react'
import Button from '../../components/baseComponents/Button'
import FilterSelect from '../../components/baseComponents/FilterSelect'
import SearchBar from '../../components/baseComponents/SearchBar'
import StatisticCard from '../../components/baseComponents/StatisticCard'
import Table from '../../components/baseComponents/Table'
import { apiUrls } from '../../config/api'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  addRole,
  removeStoredRole,
  setRoles,
  setRolesPermissionsError,
  setRolesPermissionsLoading,
  updateStoredRole,
} from '../../store/rolePermissionSlice'
import type {
  AuthAdminRole,
  CreateRoleResponse,
  PermissionAction,
  PermissionModule,
  PermissionModuleKey,
  RoleManagementItem,
  RolePermissionSelection,
  RolesResponse,
  TableColumn,
  TableRow,
} from '../../types'

const permissionModules: PermissionModule[] = [
  { key: 'dashboard', label: 'Dashboard', description: 'View dashboard and overall statistics.', icon: LayoutDashboard, actions: ['view'] },
  { key: 'users', label: 'Users', description: 'View users and manage admin accounts.', icon: Users, actions: ['view', 'create', 'edit'] },
  { key: 'rolesPermissions', label: 'Roles & Permissions', description: 'Create roles and assign module permissions.', icon: KeyRound, actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'accidentReports', label: 'Accident Reports', description: 'View submitted accident reports.', icon: FileWarning, actions: ['view'] },
  { key: 'sosAlerts', label: 'SOS Alerts', description: 'View SOS alerts and emergency details.', icon: Siren, actions: ['view'] },
  { key: 'hospitals', label: 'Hospitals', description: 'View nearby hospitals and their details.', icon: Building2, actions: ['view'] },
  { key: 'safetyTips', label: 'Safety & Tips', description: 'Manage road and safety tips content.', icon: ShieldCheck, actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'emergencyHelplines', label: 'Emergency Helplines', description: 'Manage emergency helpline numbers.', icon: PhoneCall, actions: ['view', 'create', 'edit', 'delete'] },
]

const emptyPermissions: RolePermissionSelection = {
  dashboard: [], users: [], rolesPermissions: [], accidentReports: [], sosAlerts: [], hospitals: [], safetyTips: [], emergencyHelplines: [],
}

const columns: TableColumn[] = [
  { key: 'number', header: '#' }, { key: 'role', header: 'Role Name' }, { key: 'permissions', header: 'Permissions' }, { key: 'status', header: 'Status' }, { key: 'createdOn', header: 'Created On' }, { key: 'actions', header: 'Actions' },
]

const actionLabels: Record<PermissionAction, string> = { view: 'View', create: 'Create', edit: 'Edit', delete: 'Delete' }

const copyPermissions = (permissions: RolePermissionSelection): RolePermissionSelection => ({
  dashboard: [...permissions.dashboard], users: [...permissions.users], rolesPermissions: [...permissions.rolesPermissions], accidentReports: [...permissions.accidentReports], sosAlerts: [...permissions.sosAlerts], hospitals: [...permissions.hospitals], safetyTips: [...permissions.safetyTips], emergencyHelplines: [...permissions.emergencyHelplines],
})

const permissionModuleKeys: Record<string, PermissionModuleKey> = {
  dashboard: 'dashboard',
  users: 'users',
  roles: 'rolesPermissions',
  permissions: 'rolesPermissions',
  reports: 'accidentReports',
  'sos-alerts': 'sosAlerts',
  hospitals: 'hospitals',
  'safety-tips': 'safetyTips',
  blogs: 'safetyTips',
  helplines: 'emergencyHelplines',
  'emergency-contacts': 'emergencyHelplines',
}

const permissionActions: Record<string, PermissionAction> = {
  read: 'view',
  create: 'create',
  update: 'edit',
  delete: 'delete',
}

const backendPermissionKeys: Partial<
  Record<PermissionModuleKey, Partial<Record<PermissionAction, string>>>
> = {
  dashboard: { view: 'dashboard:read' },
  users: {
    view: 'users:read',
    create: 'users:create',
    edit: 'users:update',
  },
  rolesPermissions: {
    view: 'roles:read',
    create: 'roles:create',
    edit: 'roles:update',
    delete: 'roles:delete',
  },
  accidentReports: { view: 'reports:read' },
  sosAlerts: { view: 'sos-alerts:read' },
  hospitals: { view: 'hospitals:read' },
  safetyTips: {
    view: 'safety-tips:read',
    create: 'safety-tips:create',
    edit: 'safety-tips:update',
    delete: 'safety-tips:delete',
  },
  emergencyHelplines: {
    view: 'helplines:read',
    create: 'helplines:create',
    edit: 'helplines:update',
    delete: 'helplines:delete',
  },
}

const mapRolePermissions = (role: AuthAdminRole) => {
  const mappedPermissions = copyPermissions(emptyPermissions)

  role.permissions?.forEach((permission) => {
    const [moduleName, actionName] = permission.key.split(':')
    const moduleKey = permissionModuleKeys[moduleName]
    const action = permissionActions[actionName]
    if (!moduleKey || !action) return
    if (!mappedPermissions[moduleKey].includes(action)) {
      mappedPermissions[moduleKey].push(action)
    }
  })

  return mappedPermissions
}

const mapApiRole = (role: AuthAdminRole): RoleManagementItem => ({
  id: role._id,
  name: role.name,
  description: role.description || 'No role description available.',
  permissionCount: role.permissions?.length ?? 0,
  status: role.isActive === false ? 'Inactive' : 'Active',
  createdOn: role.createdAt || role.updatedAt
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(role.createdAt ?? role.updatedAt))
    : 'Not available',
  permissions: mapRolePermissions(role),
})

const RolesPermissions = () => {
  const dispatch = useAppDispatch()
  const {
    roles: storedRoles,
    permissions: storedPermissions,
    isLoading,
    error: loadError,
  } = useAppSelector((state) => state.rolesPermissions)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedRoleId, setSelectedRoleId] = useState('')
  const [roleName, setRoleName] = useState('')
  const [description, setDescription] = useState('')
  const [permissions, setPermissions] = useState<RolePermissionSelection>(copyPermissions(emptyPermissions))
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const roles = useMemo(() => storedRoles.map(mapApiRole), [storedRoles])
  const permissionIdsByKey = useMemo(
    () =>
      Object.fromEntries(
        storedPermissions.map((permission) => [
          permission.key,
          permission._id,
        ]),
      ),
    [storedPermissions],
  )

  useEffect(() => {
    const controller = new AbortController()

    const loadRoles = async () => {
      dispatch(setRolesPermissionsLoading(true))
      dispatch(setRolesPermissionsError(''))

      try {
        const response = await axios.get(apiUrls.roles, {
          signal: controller.signal,
          params: { page: 1, limit: 100 },
        })
        const result = response.data as RolesResponse
        dispatch(setRoles(result.data))
      } catch (requestError: unknown) {
        if (axios.isCancel(requestError)) return
        dispatch(setRolesPermissionsError(
          axios.isAxiosError(requestError)
            ? (requestError.response?.data?.message ?? requestError.message)
            : 'Unable to load roles.',
        ))
      } finally {
        if (!controller.signal.aborted) {
          dispatch(setRolesPermissionsLoading(false))
        }
      }
    }

    void loadRoles()
    return () => controller.abort()
  }, [dispatch])

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase()
    return roles.filter((role) => {
      const matchesSearch = !query || role.name.toLowerCase().includes(query) || role.description.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || role.status.toLowerCase() === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [roles, search, statusFilter])

  const resetForm = () => {
    setFormMode('create')
    setSelectedRoleId('')
    setRoleName('')
    setDescription('')
    setPermissions(copyPermissions(emptyPermissions))
    setError('')
  }

  const openRole = (role: RoleManagementItem, mode: 'edit' | 'view') => {
    setFormMode(mode)
    setSelectedRoleId(role.id)
    setRoleName(role.name)
    setDescription(role.description)
    setPermissions(copyPermissions(role.permissions))
    setError('')
  }

  const deleteRole = (role: RoleManagementItem) => {
    if (role.name === 'Super Admin' || !window.confirm(`Delete ${role.name}?`)) return
    dispatch(removeStoredRole(role.id))
    if (selectedRoleId === role.id) resetForm()
  }

  const togglePermission = (moduleKey: PermissionModuleKey, action: PermissionAction) => {
    if (formMode === 'view') return
    setPermissions((currentPermissions) => {
      const modulePermissions = currentPermissions[moduleKey]
      return {
        ...currentPermissions,
        [moduleKey]: modulePermissions.includes(action)
          ? modulePermissions.filter((currentAction) => currentAction !== action)
          : [...modulePermissions, action],
      }
    })
  }

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    if (formMode === 'view') return
    if (!roleName.trim()) {
      setError('Role name is required.')
      return
    }
    if (!Object.values(permissions).some((actions) => actions.length > 0)) {
      setError('Select at least one permission.')
      return
    }

    if (formMode === 'edit') {
      const selectedRole = storedRoles.find((role) => role._id === selectedRoleId)
      if (selectedRole) {
        const selectedPermissionKeys = permissionModules.flatMap((module) =>
          permissions[module.key]
            .map((action) => backendPermissionKeys[module.key]?.[action])
            .filter((key): key is string => Boolean(key)),
        )
        dispatch(updateStoredRole({
          ...selectedRole,
          name: roleName.trim(),
          description: description.trim(),
          permissions: storedPermissions.filter((permission) =>
            selectedPermissionKeys.includes(permission.key),
          ),
        }))
      }
      resetForm()
      return
    }

    const selectedPermissionKeys = permissionModules.flatMap((module) =>
      permissions[module.key]
        .map((action) => backendPermissionKeys[module.key]?.[action])
        .filter((key): key is string => Boolean(key)),
    )
    const missingPermission = selectedPermissionKeys.find(
      (key) => !permissionIdsByKey[key],
    )

    if (missingPermission) {
      setError(`Permission ${missingPermission} is unavailable.`)
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      const response = await axios.post(apiUrls.createRole, {
        name: roleName.trim(),
        description: description.trim(),
        permissions: selectedPermissionKeys.map(
          (key) => permissionIdsByKey[key],
        ),
      })
      const result = response.data as CreateRoleResponse

      if (!result.success) {
        setError(result.message || 'Unable to create role.')
        return
      }

      dispatch(addRole(result.data))
      resetForm()
    } catch (requestError: unknown) {
      setError(
        axios.isAxiosError(requestError)
          ? (requestError.response?.data?.message ?? requestError.message)
          : 'Unable to create role.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const tableRows: TableRow[] = filteredRoles.map((role, index) => ({
    key: role.id,
    cells: {
      number: index + 1,
      role: <div><span className="block font-semibold text-text">{role.name}</span><span className="mt-1 block max-w-52 text-tiny leading-5 text-text-muted">{role.description}</span></div>,
      permissions: role.permissionCount,
      status: <span className="inline-flex items-center gap-1.5 rounded-full bg-chart-green-soft px-2.5 py-1 font-semibold text-chart-green-dark"><span className="h-1.5 w-1.5 rounded-full bg-chart-green-dark" />{role.status}</span>,
      createdOn: role.createdOn,
      actions: <div className="flex items-center gap-1"><button type="button" title="View role" onClick={() => openRole(role, 'view')} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary"><Eye size={17} /></button><button type="button" title="Edit role" onClick={() => openRole(role, 'edit')} className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary-soft hover:text-primary"><Pencil size={16} /></button><button type="button" title="Delete role" disabled={role.name === 'Super Admin'} onClick={() => deleteRole(role)} className="flex h-8 w-8 items-center justify-center rounded-full text-primary transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-35"><Trash2 size={16} /></button></div>,
    },
  }))

  const activeRoles = roles.filter((role) => role.status === 'Active').length
  const inactiveRoles = roles.length - activeRoles
  const isViewMode = formMode === 'view'
  const formTitle = formMode === 'create' ? 'Create Role' : formMode === 'edit' ? 'Edit Role' : 'View Role'

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-primary-page p-3 sm:p-4">
      <div className="mx-auto grid max-w-[1440px] items-start gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="mb-4"><h1 className="m-0 text-title font-bold tracking-tight text-text">Roles &amp; Permissions</h1><p className="mt-1 mb-0 text-tiny text-text-muted">Create and manage admin roles and assign module-wise permissions.</p></div>
          <div className="mb-4 grid gap-2 sm:grid-cols-3"><StatisticCard id="total-roles" label="Total Roles" value={roles.length} icon={UserRound} tone="accent" compact /><StatisticCard id="active-roles" label="Active Roles" value={activeRoles} icon={CheckCircle2} tone="green" compact /><StatisticCard id="inactive-roles" label="Inactive Roles" value={inactiveRoles} icon={ShieldOff} tone="amber" compact /></div>

          <div className="overflow-visible rounded-xl border border-border-soft bg-white shadow-sm">
            <div className="border-b border-border p-3">
              <div className="mb-3"><h2 className="m-0 text-body font-bold text-text">Roles</h2><p className="mt-1 mb-0 text-tiny text-text-muted">List of all roles with their details and status.</p></div>
              <div className="grid gap-2 sm:grid-cols-[1fr_9rem]"><SearchBar value={search} placeholder="Search by role name..." onChange={setSearch} /><FilterSelect value={statusFilter} options={[{ label: 'All Status', value: 'all' }, { label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} onChange={setStatusFilter} /></div>
            </div>
            {loadError && <p className="m-3 rounded-lg bg-accent-soft px-3 py-2 text-tiny font-medium text-accent">{loadError}</p>}
            {isLoading ? <div className="flex min-h-40 items-center justify-center gap-2 text-small text-text-muted"><LoaderCircle size={18} className="animate-spin text-primary" />Loading roles...</div> : <Table columns={columns} rows={tableRows} />}
            <div className="flex items-center justify-between gap-3 border-t border-border p-3"><p className="m-0 text-tiny font-semibold text-text-muted">Showing {filteredRoles.length === 0 ? 0 : 1} – {filteredRoles.length} of {filteredRoles.length} roles</p><div className="flex items-center gap-1"><button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted"><ChevronLeft size={15} /></button><span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-primary px-2 text-tiny font-semibold text-white">1</span><button type="button" className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-muted"><ChevronRight size={15} /></button></div></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border-soft bg-white shadow-sm md:min-h-[calc(100vh-5.5rem)]">
          <div className="p-3 pb-2"><h2 className="m-0 text-title font-bold text-text">{formTitle}</h2><p className="mt-1 mb-0 text-tiny text-text-muted">{isViewMode ? 'Review the role and assigned permissions.' : 'Define a role and assign permissions for project modules.'}</p></div>
          <div className="flex-1 space-y-3 p-3 pt-1">
            <label className="block"><span className="mb-1 block text-small font-semibold text-text">Role Name <span className="text-primary">*</span></span><input type="text" value={roleName} onChange={(event) => setRoleName(event.target.value)} readOnly={isViewMode} placeholder="Enter role name (e.g., Admin, Content Admin)" className="h-8 w-full rounded-md border border-border bg-white px-3 text-tiny text-text outline-none transition-colors focus:border-primary" /></label>
            <label className="block"><span className="mb-1 block text-small font-semibold text-text">Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} readOnly={isViewMode} rows={2} placeholder="Enter role description (optional)" className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-tiny text-text outline-none transition-colors focus:border-primary" /></label>
            <div className="border-t border-border pt-3">
              <h3 className="m-0 text-body font-bold text-text">Assign Permissions <span className="text-primary">*</span></h3><p className="mt-1 mb-3 text-tiny text-text-muted">Select the project modules and actions this role can perform.</p>
              <div className="space-y-2">
                {permissionModules.map((module) => {
                  const Icon = module.icon
                  return <div key={module.key} className="grid gap-2 rounded-lg border border-border-soft p-2 sm:grid-cols-[minmax(9rem,1fr)_auto] sm:items-center"><div className="flex min-w-0 items-start gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary"><Icon size={15} /></span><div className="min-w-0"><p className="m-0 text-tiny font-bold text-text">{module.label}</p><p className="mt-0.5 mb-0 text-tiny leading-4 text-text-muted">{module.description}</p></div></div><div className="flex flex-wrap gap-x-2 gap-y-1 sm:justify-end">{module.actions.map((action) => { const permissionKey = backendPermissionKeys[module.key]?.[action]; const isUnavailable = formMode === 'create' && (!permissionKey || !permissionIdsByKey[permissionKey]); return <label key={action} className={`inline-flex items-center gap-1 text-tiny font-medium text-text ${isViewMode || isUnavailable ? 'cursor-default opacity-50' : 'cursor-pointer'}`}><input type="checkbox" checked={permissions[module.key].includes(action)} disabled={isViewMode || isUnavailable} onChange={() => togglePermission(module.key, action)} className="h-4 w-4 accent-primary" />{actionLabels[action]}</label> })}</div></div>
                })}
              </div>
            </div>
            {error && <p className="m-0 rounded-lg bg-accent-soft px-3 py-2 text-tiny font-medium text-accent">{error}</p>}
          </div>
          <div className="flex justify-end gap-2 border-t border-border p-3"><Button variant="outline" size="small" onClick={resetForm}>{isViewMode ? 'Close' : 'Cancel'}</Button>{!isViewMode && <Button type="submit" variant="red" size="small" disabled={isSubmitting} className="gap-2">{isSubmitting && <LoaderCircle size={15} className="animate-spin" />}{isSubmitting ? 'Creating...' : formMode === 'edit' ? 'Save Changes' : 'Create Role'}</Button>}</div>
        </form>
      </div>
    </div>
  )
}

export default RolesPermissions
