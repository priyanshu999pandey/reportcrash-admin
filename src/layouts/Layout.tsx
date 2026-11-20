import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <Header
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      <div className="min-h-screen pt-14 lg:pl-64">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout
