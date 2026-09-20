import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div style={{ background: '#0d1117', minHeight: '100vh', color: '#e6edf3' }}>
      {/* Nav */}
      <nav
        style={{
          background: 'rgba(13,17,23,0.9)',
          borderBottom: '1px solid #21262d',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ width: '100%', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center gap-3">
            <div style={{ width: '28px', height: '28px', background: '#39d353', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: '#0d1117', fontWeight: 700 }}>L</span>
            </div>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 600, color: '#e6edf3' }}>LearnOS</span>
          </div>
          <div className="flex items-center gap-6">
            {['Catalog', 'My Courses', 'Paths', 'Community'].map(item => (
              <a
                key={item}
                href="#"
                style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#8b949e', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e6edf3')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8b949e')}
              >
                {item}
              </a>
            ))}
            <div
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #26a641, #f59e0b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Fraunces, serif', fontSize: '14px', fontWeight: 700, color: '#0d1117',
                cursor: 'pointer',
              }}
            >
              A
            </div>
          </div>
        </div>
      </nav>

      <Outlet />
    </div>
  )
}
