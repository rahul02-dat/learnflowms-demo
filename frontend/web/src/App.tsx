import { ArrowRight, BookOpen, Brain, Shield, Play, Lock, LayoutDashboard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from './lib/api';

function App() {
  const { data: healthData, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiClient.get('/health');
      return response.data;
    },
    retry: false
  });

  return (
    <div className="app-wrapper">
      {/* HEADER */}
      <header className="header glass">
        <div className="container header-inner">
          <div className="logo" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            Learn<span className="text-gradient">Flow</span>
            <span style={{ 
              fontSize: '0.6rem', 
              marginLeft: '0.5rem', 
              padding: '0.2rem 0.4rem', 
              borderRadius: '1rem', 
              background: isLoading ? '#444' : isError ? 'red' : 'green',
              color: 'white',
              verticalAlign: 'middle'
            }}>
              API: {isLoading ? '...' : isError ? 'ERR' : 'OK'}
            </span>
          </div>
          <nav>
            <ul className="nav-links">
              <li><a href="#platform">Platform</a></li>
              <li><a href="#solutions">Solutions</a></li>
              <li><a href="#resources">Resources</a></li>
              <li><a href="#pricing">Pricing</a></li>
            </ul>
          </nav>
          <div className="header-actions" style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline">Sign In</button>
            <button className="btn btn-primary">Get Demo</button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero">
          <div className="container">
            <h1 style={{ letterSpacing: '-0.04em' }}>
              Unified <span className="text-gradient">Agentic Learning</span> Platform for Enterprise
            </h1>
            <p>
              Deliver the industry-leading learning and mastery applications that maximize impact and minimize risk for your organization. Build, operate, and govern knowledge at scale.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary">
                Start Learning <ArrowRight style={{ marginLeft: '0.5rem', width: '18px' }} />
              </button>
              <button className="btn btn-outline">View Courses</button>
            </div>
          </div>
        </section>

        {/* LOGO MARQUEE */}
        <div className="marquee-wrapper" style={{ padding: '4rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="marquee-content">
            {/* Repeated for effect */}
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#444' }}>ACME CORP</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#444' }}>GLOBEX</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#444' }}>SOYLENT</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#444' }}>INITECH</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#444' }}>UMBRELLA</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#444' }}>STARK IND</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#444' }}>ACME CORP</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#444' }}>GLOBEX</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#444' }}>SOYLENT</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#444' }}>INITECH</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#444' }}>UMBRELLA</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#444' }}>STARK IND</span>
          </div>
        </div>

        {/* CAPABILITY GRID */}
        <section className="features-section container" id="platform">
          <div className="section-header">
            <h2 style={{ letterSpacing: '-0.02em' }}>Platform <span className="text-gradient">Capabilities</span></h2>
            <p>Everything you need to deploy enterprise-grade learning operations securely and reliably.</p>
          </div>
          
          <div className="grid-3">
            <div className="card">
              <div className="glow-icon">
                <Brain />
              </div>
              <h3>Mastery Gating</h3>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Ensure comprehension with configurable, assessment-driven progression. No more skipping ahead.</p>
            </div>
            
            <div className="card">
              <div className="glow-icon">
                <LayoutDashboard />
              </div>
              <h3>Pomodoro Focus</h3>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Built-in focus timers and proprietary break intervals to optimize cognitive retention.</p>
            </div>

            <div className="card">
              <div className="glow-icon">
                <Shield />
              </div>
              <h3>Enterprise Security</h3>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>Role-based access control, SSO, and complete audit logging for regulatory compliance.</p>
            </div>
          </div>
        </section>

        {/* ALTERNATING FEATURES */}
        <section className="container">
          <div className="feature-split">
            <div className="content">
              <h3 style={{ letterSpacing: '-0.02em' }}>Architected for <span className="text-gradient">Deep Focus</span></h3>
              <p>LearnFlow's proprietary video delivery integrates directly with Pomodoro sessions. Videos are automatically chunked into optimized 20-minute cognitive sprints.</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Play size={20} className="text-gradient" /> Automatic silence-based video splitting</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Play size={20} className="text-gradient" /> Mandatory break enforcement</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Play size={20} className="text-gradient" /> Cross-device session continuity</li>
              </ul>
            </div>
            <div className="media">
              <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.5)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                <h4 style={{ color: 'var(--color-accent-1)', marginBottom: '0.5rem' }}>FOCUS SESSION</h4>
                <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'monospace' }}>14:59</div>
              </div>
            </div>
          </div>

          <div className="feature-split">
            <div className="content">
              <h3 style={{ letterSpacing: '-0.02em' }}>Rigorous <span className="text-gradient">Verification</span></h3>
              <p>Knowledge is tested, not assumed. From section-level micro-quizzes to comprehensive chapter exams, every step requires proven mastery.</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Lock size={20} className="text-gradient" /> Sequential section gating</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Lock size={20} className="text-gradient" /> Configurable passing thresholds</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Lock size={20} className="text-gradient" /> Automated retake cooldowns</li>
              </ul>
            </div>
            <div className="media">
              <BookOpen size={80} style={{ color: 'var(--color-accent-3)', opacity: 0.8 }} />
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="logo" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                Learn<span className="text-gradient">Flow</span>
              </div>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '300px' }}>
                The agentic workforce learning platform designed for maximum impact and retention.
              </p>
            </div>
            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><a href="#">Agentic AI</a></li>
                <li><a href="#">Mastery Gating</a></li>
                <li><a href="#">Pomodoro Engine</a></li>
                <li><a href="#">Analytics</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Solutions</h4>
              <ul>
                <li><a href="#">Enterprise</a></li>
                <li><a href="#">Government</a></li>
                <li><a href="#">Life Sciences</a></li>
                <li><a href="#">Financial Services</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} LearnFlow Inc. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
