import { Outlet } from 'react-router-dom';

const styles = {
  layout: {
    minHeight: '100vh',
    backgroundColor: '#05192D',
    color: '#FFFFFF',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 40px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(5, 25, 45, 0.95)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 50,
  },
  leftNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    backgroundColor: '#03EF62',
    color: '#0F172A',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '18px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 700,
    letterSpacing: '-0.5px',
  },
  navLinks: {
    display: 'flex',
    gap: '24px',
  },
  navItem: {
    color: '#94A3B8',
    fontSize: '14px',
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#EAB308', // Yellow matching screenshot
    color: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '14px',
    cursor: 'pointer',
  },
  main: {
    padding: '40px',
  }
};

export default function DashboardLayout() {
  return (
    <div style={styles.layout}>
      <header style={styles.header}>
        <div style={styles.leftNav}>
          <div style={styles.logoGroup}>
            <div style={styles.logoIcon}>L</div>
            <div style={styles.logoText}>LearnOS</div>
          </div>
          
          <div style={styles.navLinks}>
            <span style={{...styles.navItem, color: '#fff'}}>Catalog</span>
            <span style={styles.navItem}>My Courses</span>
            <span style={styles.navItem}>Paths</span>
            <span style={styles.navItem}>Community</span>
          </div>
        </div>

        <div>
          <div style={styles.avatar}>A</div>
        </div>
      </header>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
