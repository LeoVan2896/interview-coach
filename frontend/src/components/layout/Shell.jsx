import Sidebar from './Sidebar'
import '../../styles/global.css'
import '../../styles/dashboard.css'

export default function Shell({ children }) {
  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-content">
        {children}
      </div>
    </div>
  )
}
