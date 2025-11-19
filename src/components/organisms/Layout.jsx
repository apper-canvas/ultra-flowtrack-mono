import { Outlet } from 'react-router-dom'
import { useAuth } from '@/layouts/Root'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

function Layout() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="ListChecks" className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">FlowTrack</h1>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <ApperIcon name="LogOut" className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout