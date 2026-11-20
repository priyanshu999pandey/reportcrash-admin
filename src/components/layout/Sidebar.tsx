import {
  Building2,
  FileWarning,
  LayoutDashboard,
  LogOut,
  PhoneCall,
  KeyRound,
  ShieldCheck,
  Siren,
  Users,
  X,
} from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import logo from '../../assets/Logo.svg'
import type { NavigationItem, SidebarProps } from '../../types'
import { allAdminRoles, fullAccessRoles, getHomeRoute, superAdminRoles } from '../../utils/permissions'

const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, allowedRoles: fullAccessRoles },
  { label: 'Accident Reports', path: '/accident-reports', icon: FileWarning, allowedRoles: fullAccessRoles },
  { label: 'SOS Alerts', path: '/sos-alerts', icon: Siren, allowedRoles: fullAccessRoles },
  { label: 'Users', path: '/users', icon: Users, allowedRoles: fullAccessRoles },
  { label: 'Hospitals', path: '/hospitals', icon: Building2, allowedRoles: fullAccessRoles },
  { label: 'Emergency Helpline', path: '/emergency-helplines', icon: PhoneCall, allowedRoles: fullAccessRoles },
  { label: 'Roles & Permissions', path: '/roles-permissions', icon: KeyRound, allowedRoles: superAdminRoles },
  { label: 'Safety & Tips', path: '/safety-tips', icon: ShieldCheck, allowedRoles: allAdminRoles },
]

const Sidebar = ({ isOpen, onClose, currentRole }: SidebarProps) => {
  const navigate = useNavigate()
  const visibleItems = navigationItems.filter((item) =>
    item.allowedRoles.includes(currentRole),
  )

  const handleLogout = () => {
    onClose()
    navigate('/login')
  }

  return (
    <>
      <button
        type="button"
        className={`fixed inset-0 z-40 bg-text-backdrop transition-opacity lg:hidden ${
          isOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-white text-text shadow-sm transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-5">
          <div>
           <Link to={getHomeRoute(currentRole)}>
            <img
              src={logo}
              alt="Report Crash"
              className="h-7 w-auto"
              width="136"
              height="28"
            />
           </Link>
          
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-accent-soft hover:text-accent focus-visible:outline-2 focus-visible:outline-accent lg:hidden"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 px-3 py-4">
          <ul className="m-0 space-y-1 p-0">
            {visibleItems.map(({ label, path, icon: Icon }) => (
              <li key={path} className="list-none">
                <NavLink
                  to={path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-small font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                      isActive
                        ? 'bg-accent text-white shadow-sm'
                        : 'text-text-muted hover:bg-accent-hover hover:text-accent'
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-small font-medium text-text-muted transition-colors hover:bg-accent-hover hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar
