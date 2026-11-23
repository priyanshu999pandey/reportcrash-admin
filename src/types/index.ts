import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'blue' | 'red' | 'outline'
export type ButtonSize = 'tiny' | 'small' | 'medium'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean
  size?: ButtonSize
  variant?: ButtonVariant
}

export type HeaderProps = {
  onMenuClick: () => void
}

export type SidebarProps = {
  isOpen: boolean
  onClose: () => void
}

export type NavigationItem = {
  label: string
  path: string
  icon: LucideIcon
  permission: string
}

export type DateRange = {
  startDate: string
  endDate: string
}

export type DateRangePickerProps = {
  onChange?: (range: DateRange) => void
}

export type TableFilterOption = {
  label: string
  value: string
}

export type SearchBarProps = {
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

export type FilterSelectProps = {
  value: string
  options: readonly TableFilterOption[]
  onChange: (value: string) => void
}

export interface TableRow {
  key: string | number
  cells: Record<string, ReactNode>
}

export interface TableColumn {
  key: string
  header: string
}

export interface TableProps {
  columns: readonly TableColumn[]
  rows: readonly TableRow[]
}

export type StatisticCardProps = {
  id: string
  label: string
  value: number | string
  icon: LucideIcon
  tone?: 'primary' | 'accent' | 'amber' | 'green'
  compact?: boolean
}

export type TrendPeriod = 30 | 45 | 60

export type TrendPoint = {
  label: string
  reports: number
}

export type AccidentReportsTrendProps = {
  thirtyDaysData: readonly TrendPoint[]
  fortyFiveDaysData: readonly TrendPoint[]
  sixtyDaysData: readonly TrendPoint[]
}

export type AccidentTypeDistributionProps = {
  total: number
  multiVehicleCollision: number
  bikeAccident: number
  hitAndRun: number
  pedestrianAccident: number
  truckAccident: number
  vehicleOverturn: number
  others: number
}

export type AccidentReportRow = {
  reportId: string
  accidentType: string
  location: string
  date: string
  time: string
}

export type AccidentInjury = 'Critical' | 'Severe' | 'Normal'

export type AccidentReportStatus =
  | 'Under Review'
  | 'Resolved'
  | 'In Progress'
  | 'Rejected'

export interface AccidentLocation {
  address: string
  latitude: number
  longitude: number
}

export interface AccidentImage {
  id: string
  url: string
  title: string
}

export interface AccidentAudio {
  id: string
  url: string
  title: string
}

export interface AccidentReportMedia {
  images: readonly AccidentImage[]
  audio: AccidentAudio
}

export interface AccidentReportDetailsRow {
  reportId: string
  accidentType: string
  location: AccidentLocation
  date: string
  time: string
  user: string
  phone: string
  dateValue: string
  injury: AccidentInjury
  status: AccidentReportStatus
  description: string
  media: AccidentReportMedia
}

export type AccidentReportNavigationState = {
  report: AccidentReportDetailsRow
}

export interface AccidentReportApiLocation {
  latitude: number
  longitude: number
  address: string
  city: string
  state: string
}

export interface AccidentReportApiReporter {
  _id: string
  email: string
  name: string
  phone: string
}

export interface AccidentReportApiItem {
  _id: string
  location: AccidentReportApiLocation
  reportedBy: AccidentReportApiReporter
  accidentType: string
  injurySeverity?: string
  personsInvolved?: number
  anyoneTrapped: string
  additionalInformation: string
  photos: string[]
  videos: string[]
  voiceNote: string | null
  status: string
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AccidentReportsApiResponse {
  success: boolean
  message: string
  count: number
  data: AccidentReportApiItem[]
}

export interface AccidentReportApiResponse {
  success: boolean
  message: string
  data: AccidentReportApiItem
}

export interface DeleteAccidentReportResponse {
  success: boolean
  message: string
}

export interface AccidentReportsState {
  items: AccidentReportApiItem[]
  total: number
  selectedReport: AccidentReportApiItem | null
  isLoading: boolean
  error: string
  isDetailLoading: boolean
  detailError: string
}

export type SosAlertRow = {
  id: string
  user: string
  location: string
  date: string
  time: string
}

export interface SosAlertDetailsRow extends SosAlertRow {
  phone: string
  email: string
  dateValue: string
  userStatus: UserStatus
  coordinates: string
  message: string
  emergencyContact: EmergencyContact
}

export type AdminRole = 'Super Admin' | 'Admin' | 'Content Admin'
export type UserRole = AdminRole | 'User'

export interface AuthPermission {
  _id: string
  key: string
  module: string
  name: string
}

export interface AuthAdminRole {
  _id: string
  name: string
  slug: string
  description?: string
  permissions?: AuthPermission[]
  isSystem?: boolean
  isActive?: boolean
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
  createdBy?:
    | string
    | {
        _id: string
        email: string
        name: string
      }
}

export interface AuthUser {
  id: string
  email: string
  name?: string
  role: string
  adminRole?: AuthAdminRole | null
}

export interface SendOtpResponse {
  success: boolean
  message: string
  data: {
    email: string
    type: string
  }
}

export interface VerifyOtpResponse {
  success: boolean
  message: string
  data: {
    token: string
    type: string
    user: AuthUser
    adminRole?: AuthAdminRole | null
  }
}

export interface RolesResponse {
  success: boolean
  message: string
  data: AuthAdminRole[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CreateRoleResponse {
  success: boolean
  message: string
  data: AuthAdminRole
}

export interface RolesPermissionsState {
  roles: AuthAdminRole[]
  permissions: AuthPermission[]
  isLoading: boolean
  error: string
}

export interface AuthState {
  token: string | null
  user: AuthUser | null
  adminRole: AuthAdminRole | null
  isAuthenticated: boolean
}
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete'
export type PermissionModuleKey =
  | 'dashboard'
  | 'rolesPermissions'
  | 'accidentReports'
  | 'sosAlerts'
  | 'users'
  | 'hospitals'
  | 'safetyTips'
  | 'emergencyHelplines'

export interface PermissionModule {
  key: PermissionModuleKey
  label: string
  description: string
  icon: LucideIcon
  actions: PermissionAction[]
}

export type RolePermissionSelection = Record<
  PermissionModuleKey,
  PermissionAction[]
>

export interface RoleManagementItem {
  id: string
  name: string
  description: string
  permissionCount: number
  status: 'Active' | 'Inactive'
  createdOn: string
  permissions: RolePermissionSelection
}
export type UserStatus = 'Active' | 'Inactive'

export interface CreateAdminForm {
  name: string
  email: string
  role: AdminRole | ''
  password: string
  confirmPassword: string
}

export interface AdminUserRow {
  id: string
  name: string
  email: string
  role: UserRole | null
  status: UserStatus
  createdOn: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface UserProfileRow {
  id: string
  name: string
  email: string
  role: UserRole
  phone: string
  status: UserStatus
  createdOn: string
  createdDate: string
  dateOfBirth: string
  gender: string
  bloodGroup: string
  allergies: readonly string[]
  medicalConditions: readonly string[]
  emergencyContact: EmergencyContact
  totalReports: number
}

export interface UserProfileNavigationState {
  user: UserProfileRow
}

export interface UserProfileProps {
  mode?: 'view' | 'edit'
  currentRole: AdminRole
}

export interface UsersProps {
  currentRole: AdminRole
}

export interface CreateUserProps {
  currentRole: AdminRole
}

export interface ProtectedRouteProps {
  requiredPermission?: string
}

export interface SafetyTip {
  id: string
  slug?: string
  title: string
  description: string
  image: string
  readTime: number
  status: 'Published'
  views: number
  createdOn: string
  createdDate: string
}

export interface SafetyTipFormProps {
  mode?: 'create' | 'edit' | 'view'
}

export interface SafetyTipNavigationState {
  tip: SafetyTip
}

export interface SosAlertNavigationState {
  alert: SosAlertDetailsRow
}

export interface HospitalRow {
  id: string
  name: string
  distance: number
  distanceUnit: string
  travelTime: number | null
  travelMode: string
  address: string
  phone: string | null
  type: string
  isTraumaCentre: boolean | null
  is24x7: boolean | null
  totalBeds: number | null
  availableBeds: number | null
  totalICU: number | null
  availableICU: number | null
  latitude: number
  longitude: number
  navigationUrl: string
}

export interface NearbyHospitalsResponse {
  success: boolean
  message: string
  searchLocation: {
    latitude: number
    longitude: number
  }
  totalHospitals: number
  hospitals: HospitalRow[]
  attribution: string
}

export interface HospitalState {
  items: HospitalRow[]
  total: number
  searchLocation: {
    latitude: number
    longitude: number
  } | null
  attribution: string
  isLoading: boolean
  error: string
}

export interface HospitalNavigationState {
  hospital: HospitalRow
}

export interface BlogListItem {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string | null
  category: string
  readTime: number
  status?: string
  publishedAt: string | null
}

export interface BlogListResponse {
  success: boolean
  message: string
  data: BlogListItem[]
}

export interface BlogState {
  items: BlogListItem[]
  isLoading: boolean
  error: string
  lastCreatedBlog: CreateBlogResponse['data'] | null
}

export interface CreateBlogResponse {
  success: boolean
  message: string
  data: {
    _id: string
    title: string
    slug: string
    excerpt: string
    content: string
    coverImage: string | null
    category: string
    authorName: string
    createdBy: string
    readTime: number
    status: string
    publishedAt: string | null
    isDeleted: boolean
    createdAt: string
    updatedAt: string
    __v: number
  }
}

export type UpdateBlogResponse = CreateBlogResponse

export interface DeleteBlogResponse {
  success: boolean
  message: string
}

export interface EmergencyHelpline {
  _id: string
  name: string
  number: string
  category: string
  description: string
  isActive: boolean
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  __v: number
}

export interface EmergencyHelplineListResponse {
  success: boolean
  message: string
  count: number
  data: EmergencyHelpline[]
}

export interface EmergencyHelplineResponse {
  success: boolean
  message: string
  data: EmergencyHelpline
}

export interface EmergencyHelplinePayload {
  name: string
  number: string
  category: string
  description: string
  isActive: boolean
}

export interface EmergencyHelplineNavigationState {
  helpline: EmergencyHelpline
}

export interface EmergencyHelplineFormProps {
  mode: 'create' | 'edit'
}

export interface EmergencyHelplineState {
  items: EmergencyHelpline[]
  isLoading: boolean
  error: string
}




