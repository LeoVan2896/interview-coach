import Sidebar from './Sidebar'
import '../../styles/global.css'

// Shell wraps every page: persistent sidebar on the left, main content on the right.
export default function Shell({ children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {children}
      </div>
    </div>
  )
}
