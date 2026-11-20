import { Bell, Menu, UserRound } from 'lucide-react'
import type { HeaderProps } from '../../types'

const Header = ({ onMenuClick, currentRole }: HeaderProps) => {
  return (
    <div className="fixed top-0 right-0 left-0 z-30 flex h-14 items-center border-b border-border justify-between bg-white px-3 lg:left-64 lg:px-5">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-9 w-9 items-center justify-center rounded-full text-text transition-colors hover:bg-accent-hover hover:text-accent focus-visible:outline-2 focus-visible:outline-accent lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        {currentRole !== 'Content Admin' && (
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-accent-hover hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full border border-white bg-accent" />
          </button>
        )}

        <div className="flex items-center gap-2 pl-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
            <UserRound size={19} strokeWidth={1.8} />
          </div>
          <div className="hidden sm:block">
            <p className="m-0 text-small font-semibold leading-4 text-text">Admin</p>
            <p className="m-0 text-small leading-4 text-text-muted">{currentRole}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
