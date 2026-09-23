import { useState, useEffect, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

/* ─── Schemas ─── */
const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['learner', 'instructor']),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

const otpSchema = z.object({
  otp: z.string()
    .transform((val) => val.replace(/[\s-]/g, ''))
    .pipe(z.string().length(6, 'Enter the complete 6-digit verification code')),
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;
type OTPFormValues = z.infer<typeof otpSchema>;

/* ─── Carousel Slides based on LearnFlow LMS Development Plan ─── */
interface CarouselSlide {
  id: number;
  eyebrow: string;
  badge: string;
  title: string;
  subtitle: string;
  quote: string;
  author: string;
  role: string;
}

const LEARNFLOW_SLIDES: CarouselSlide[] = [
  {
    id: 0,
    eyebrow: 'MASTERY-GATED PROGRESSION',
    badge: 'Sequential Flow',
    title: 'Learn with deep focus. Advance only when you master.',
    subtitle: 'Enforced sequential progression and gated assessments at every tier — chapter, sub-chapter, and section — ensuring genuine comprehension before moving forward.',
    quote: 'LearnFlow’s gated assessments stopped our students from passive skimming. True concept mastery doubled in the very first cohort.',
    author: 'Dr. Aris Thorne',
    role: 'Curriculum Director, DeepTech Academy',
  },
  {
    id: 1,
    eyebrow: 'POMODORO-FIRST ARCHITECTURE',
    badge: '20-Min Rule',
    title: 'Engineered for high retention with 20-minute focus blocks',
    subtitle: 'Every lesson is capped under 20 minutes with structured 5-minute restorative breaks, ambient soundscapes, and session tracking to prevent mental fatigue.',
    quote: 'The automatic Pomodoro breaks give my study sessions a productive rhythm. I can study for hours without feeling burnt out.',
    author: 'Maya Lin',
    role: 'Computer Science Fellow',
  },
  {
    id: 2,
    eyebrow: 'ZERO-DISTRACTION ENVIRONMENT',
    badge: 'Contextual Notes',
    title: 'Zero clutter. Contextual notes. Uncompromised focus.',
    subtitle: 'Persistent side-by-side rich notes with video timestamps, auto-saving, and an immersive focus mode that hides all extraneous UI chrome.',
    quote: 'Taking timestamped markdown notes alongside the video and exporting them as a course review guide is completely game-changing.',
    author: 'Rohan Patel',
    role: 'Senior Software Engineer',
  },
];



const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

export default function Auth() {
  const navigate = useNavigate();
  // Page mode: 'register' | 'login' | 'verify_otp'
  const [viewMode, setViewMode] = useState<'register' | 'login' | 'verify_otp'>('login');
  const [showPw, setShowPw] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  /* Carousel state */
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance carousel every 5.5s
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % LEARNFLOW_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % LEARNFLOW_SLIDES.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + LEARNFLOW_SLIDES.length) % LEARNFLOW_SLIDES.length);

  const {
    register: rs,
    handleSubmit: hs,
    formState: { errors: se },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'learner' },
  });


  const regMut = useMutation({
    mutationFn: async (d: RegisterFormValues) => {
      const res = await apiClient.post('/auth/register', {
        full_name: d.full_name,
        email: d.email,
        phone_number: d.phone_number,
        password: d.password,
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      setRegisteredEmail(variables.email);
      setViewMode('verify_otp');
      setShowPw(false);
    },
  });

  /* OTP Form */
  const {
    register: ro,
    handleSubmit: ho,
    formState: { errors: oe },
  } = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
  });

  const otpMut = useMutation({
    mutationFn: async (d: OTPFormValues) => {
      const res = await apiClient.post('/auth/verify-email', {
        email: registeredEmail,
        otp: d.otp,
      });
      return res.data;
    },
    onSuccess: () => {
      setVerifiedSuccess(true);
      setViewMode('login');
    },
  });

  /* Login Form */
  const {
    register: rl,
    handleSubmit: hl,
    formState: { errors: le },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const loginMut = useMutation({
    mutationFn: async (d: LoginFormValues) => {
      const form = new URLSearchParams();
      form.append('username', d.email);
      form.append('password', d.password);
      const res = await apiClient.post('/auth/token', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      return res.data;
    },
    onSuccess: (data) => {
      console.log('Login Response:', data);
      localStorage.setItem('token', data.access_token);
      localStorage.removeItem('full_name'); // Clear old name
      navigate('/dashboard');
    },
  });

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#2563EB';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.18)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = '#E2E8F0';
    e.currentTarget.style.boxShadow = 'none';
  };

  const current = LEARNFLOW_SLIDES[activeSlide];

  return (
    <div style={styles.pageWrapper}>
      {/* Top trial navigation bar */}
      <header style={styles.navBar}>
        <div style={styles.navContainer}>
          <div style={styles.logoRow}>
            <div style={styles.logoMark}>
              <span style={{ color: '#34E2E4', fontWeight: 900 }}>LF</span>
            </div>
            <span style={styles.logoText}>LearnFlow</span>
            <span style={styles.trialPill}>MASTERY LMS</span>
          </div>

          <div style={styles.navLinks}>
            <span style={styles.navSupportText}>Instructor or Enterprise?</span>
            <a href="#instructor" style={styles.navContactLink}>Course Builder Demo</a>
          </div>
        </div>
      </header>

      {/* Main split presentation */}
      <main style={styles.mainLayout}>
        {/* LEFT COLUMN: DataRobot-inspired Headline Carousel & LMS Overview */}
        <section
          style={styles.heroSection}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Eyebrow & Badges */}
          <div style={styles.eyebrowRow}>
            <div style={styles.eyebrowBadge}>
              <SparklesIcon />
              <span style={{ marginLeft: 6 }}>{current.eyebrow}</span>
            </div>
            <div style={styles.secondaryBadge}>{current.badge}</div>
          </div>

          {/* HEADLINE CAROUSEL */}
          <div style={styles.carouselFrame}>
            <div key={current.id} style={styles.slideContent}>
              <h1 style={styles.heroTitle}>{current.title}</h1>
              <p style={styles.heroSubtitle}>{current.subtitle}</p>

              {/* DataRobot signature segmented multi-color accent pattern */}
              <div style={styles.patternBar}>
                <div style={{ flex: '4', background: '#81FBA5', borderRadius: '3px' }} />
                <div style={{ flex: '3', background: '#86DAC0', borderRadius: '3px' }} />
                <div style={{ flex: '2.5', background: '#8AC2D5', borderRadius: '3px' }} />
                <div style={{ flex: '2', background: '#A6B0FF', borderRadius: '3px' }} />
                <div style={{ flex: '1', background: '#FFFF55', borderRadius: '3px' }} />
              </div>

              {/* Customer Story Quote Card */}
              <div style={styles.quoteCard}>
                <p style={styles.quoteText}>“{current.quote}”</p>
                <div style={styles.quoteAuthorRow}>
                  <div style={styles.authorAvatar}>
                    {current.author.charAt(0)}
                  </div>
                  <div>
                    <div style={styles.authorName}>{current.author}</div>
                    <div style={styles.authorRole}>{current.role}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Controls (Dots + Prev/Next Arrows) */}
          <div style={styles.carouselNavRow}>
            <div style={styles.dotNav}>
              {LEARNFLOW_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => setActiveSlide(idx)}
                  style={{
                    ...styles.dot,
                    width: activeSlide === idx ? '32px' : '10px',
                    background: activeSlide === idx ? '#34E2E4' : 'rgba(255, 255, 255, 0.25)',
                  }}
                />
              ))}
            </div>

            <div style={styles.arrowControls}>
              <button type="button" onClick={prevSlide} style={styles.arrowBtn} aria-label="Previous headline">
                <ChevronLeftIcon />
              </button>
              <button type="button" onClick={nextSlide} style={styles.arrowBtn} aria-label="Next headline">
                <ChevronRightIcon />
              </button>
            </div>
          </div>

          {/* LearnFlow LMS Core Pillars */}
          <div style={styles.trustRow}>
            <div style={styles.trustItem}>
              <span style={styles.trustMetric}>≤ 20 Min</span>
              <span style={styles.trustLabel}>Pomodoro Microlearning</span>
            </div>
            <div style={styles.trustDivider} />
            <div style={styles.trustItem}>
              <span style={styles.trustMetric}>100% Gated</span>
              <span style={styles.trustLabel}>Sequential Mastery Tests</span>
            </div>
            <div style={styles.trustDivider} />
            <div style={styles.trustItem}>
              <span style={styles.trustMetric}>Distraction-Free</span>
              <span style={styles.trustLabel}>Contextual Timestamped Notes</span>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Auth Card matching reference screenshot */}
        <section style={styles.authSection}>
          <div style={styles.authCard}>



            {/* 1. REGISTRATION VIEW */}
            {viewMode === 'register' && (
              <>
                <h2 style={styles.cardHeading}>Create Your Free Account</h2>
                <div style={{ marginBottom: '24px' }} />

                {regMut.isError && (
                  <div style={styles.errorBanner}>
                    {(regMut.error as any)?.response?.data?.detail ?? 'Registration failed. Please try again.'}
                  </div>
                )}

                <form onSubmit={hs((d) => regMut.mutate(d))} noValidate>


                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Full Name</label>
                    <input
                      {...rs('full_name')}
                      type="text"
                      placeholder="Full Name"
                      style={styles.input}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    {se.full_name && <p style={styles.errorText}>{se.full_name.message}</p>}
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Email Address</label>
                    <input
                      {...rs('email')}
                      type="email"
                      placeholder="Email Address"
                      style={styles.input}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    {se.email && <p style={styles.errorText}>{se.email.message}</p>}
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Phone Number</label>
                    <input
                      {...rs('phone_number')}
                      type="tel"
                      placeholder="Phone Number"
                      style={styles.input}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    {se.phone_number && <p style={styles.errorText}>{se.phone_number.message}</p>}
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Password</label>
                    <div style={styles.inputWrap}>
                      <input
                        {...rs('password')}
                        type={showPw ? 'text' : 'password'}
                        placeholder="Password (min. 8 chars)"
                        style={styles.inputIcon}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                      <button
                        type="button"
                        style={styles.eyeBtn}
                        onClick={() => setShowPw((v) => !v)}
                        aria-label="Toggle password visibility"
                      >
                        <EyeIcon open={showPw} />
                      </button>
                    </div>
                    {se.password && <p style={styles.errorText}>{se.password.message}</p>}
                  </div>

                  <p style={styles.termsNote}>
                    By creating an account, you agree to LearnFlow's Terms of Service and Privacy Policy.
                  </p>

                  <button
                    type="submit"
                    disabled={regMut.isPending}
                    style={{
                      ...styles.submitBtn,
                      background: btnHover && !regMut.isPending ? '#00D856' : '#03EF62',
                      opacity: regMut.isPending ? 0.75 : 1,
                    }}
                    onMouseEnter={() => setBtnHover(true)}
                    onMouseLeave={() => setBtnHover(false)}
                  >
                    {regMut.isPending ? 'Creating account…' : 'Create Free Account'}
                  </button>
                </form>

                <p style={styles.footerText}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    style={styles.footerLink}
                    onClick={() => { setViewMode('login'); setShowPw(false); }}
                  >
                    Sign in
                  </button>
                </p>
              </>
            )}

            {/* 2. OTP VERIFICATION VIEW */}
            {viewMode === 'verify_otp' && (
              <>
                <h2 style={styles.cardHeading}>Verify Email</h2>
                <p style={styles.cardSubtext}>
                  We sent a 6-digit code to <br />
                  <strong style={{ color: '#1E293B' }}>{registeredEmail}</strong>
                </p>

                {otpMut.isError && (
                  <div style={styles.errorBanner}>
                    {(otpMut.error as any)?.response?.data?.detail ?? 'Invalid or expired code.'}
                  </div>
                )}

                <form onSubmit={ho((d) => otpMut.mutate(d))} noValidate>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Verification Code</label>
                    <input
                      {...ro('otp')}
                      type="text"
                      maxLength={10}
                      placeholder="123456"
                      style={{
                        ...styles.input,
                        textAlign: 'center',
                        fontSize: '20px',
                        letterSpacing: '6px',
                        fontWeight: 700,
                      }}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    {oe.otp && <p style={styles.errorText}>{oe.otp.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={otpMut.isPending}
                    style={{
                      ...styles.submitBtn,
                      background: btnHover && !otpMut.isPending ? '#00D856' : '#03EF62',
                      opacity: otpMut.isPending ? 0.75 : 1,
                    }}
                    onMouseEnter={() => setBtnHover(true)}
                    onMouseLeave={() => setBtnHover(false)}
                  >
                    {otpMut.isPending ? 'Verifying…' : 'Verify & Continue'}
                  </button>
                </form>

                <p style={styles.footerText}>
                  Didn’t receive code?{' '}
                  <button
                    type="button"
                    style={styles.footerLink}
                    onClick={() => setViewMode('register')}
                  >
                    Re-enter email
                  </button>
                </p>
              </>
            )}

            {/* 3. SIGN IN VIEW */}
            {viewMode === 'login' && (
              <>
                <h2 style={styles.cardHeading}>Sign In</h2>
                <div style={{ marginBottom: '24px' }} />

                {verifiedSuccess && (
                  <div style={styles.successBanner}>
                    Email verified successfully! Please sign in with your credentials.
                  </div>
                )}

                {loginMut.isError && (
                  <div style={styles.errorBanner}>
                    {(loginMut.error as any)?.response?.data?.detail ?? 'Invalid email or password.'}
                  </div>
                )}

                {loginMut.isSuccess && (
                  <div style={styles.successBanner}>
                    Signed in successfully! Redirecting to your dashboard…
                  </div>
                )}

                <form onSubmit={hl((d) => loginMut.mutate(d))} noValidate>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Email</label>
                    <input
                      {...rl('email')}
                      type="email"
                      placeholder="Enter your email"
                      style={styles.input}
                      onFocus={onFocus}
                      onBlur={onBlur}
                    />
                    {le.email && <p style={styles.errorText}>{le.email.message}</p>}
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Password</label>
                    <div style={styles.inputWrap}>
                      <input
                        {...rl('password')}
                        type={showPw ? 'text' : 'password'}
                        placeholder="••••••••"
                        style={styles.inputIcon}
                        onFocus={onFocus}
                        onBlur={onBlur}
                      />
                      <button
                        type="button"
                        style={styles.eyeBtn}
                        onClick={() => setShowPw((v) => !v)}
                        aria-label="Toggle password visibility"
                      >
                        <EyeIcon open={showPw} />
                      </button>
                    </div>
                    {le.password && <p style={styles.errorText}>{le.password.message}</p>}
                  </div>

                  <div style={styles.rememberRow}>
                    <label style={styles.rememberLabel}>
                      <input type="checkbox" {...rl('remember')} style={styles.checkbox} />
                      Remember me
                    </label>
                    <a href="#forgot" style={styles.forgotLink}>Forgot password?</a>
                  </div>

                  <button
                    type="submit"
                    disabled={loginMut.isPending}
                    style={{
                      ...styles.submitBtn,
                      background: btnHover && !loginMut.isPending ? '#00D856' : '#03EF62',
                      opacity: loginMut.isPending ? 0.75 : 1,
                    }}
                    onMouseEnter={() => setBtnHover(true)}
                    onMouseLeave={() => setBtnHover(false)}
                  >
                    {loginMut.isPending ? 'Signing in…' : 'Sign in'}
                  </button>
                </form>

                <p style={styles.footerText}>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    style={styles.footerLink}
                    onClick={() => { setViewMode('register'); setShowPw(false); }}
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ─── Styles ─── */
const styles: Record<string, CSSProperties> = {
  pageWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#05192D',
    color: '#FFFFFF',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  navBar: {
    width: '100%',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(5, 25, 45, 0.85)',
    backdropFilter: 'blur(12px)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  navContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoMark: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #1C2233 0%, #293249 100%)',
    border: '1px solid rgba(52, 226, 228, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 800,
  },
  logoText: {
    fontSize: '18px',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: '#FFFFFF',
  },
  trialPill: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: '#34E2E4',
    background: 'rgba(52, 226, 228, 0.12)',
    border: '1px solid rgba(52, 226, 228, 0.3)',
    borderRadius: '9999px',
    padding: '3px 10px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  navSupportText: {
    fontSize: '13px',
    color: '#94A3B8',
  },
  navContactLink: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#03EF62',
    textDecoration: 'none',
  },
  mainLayout: {
    flex: 1,
    maxWidth: '1280px',
    margin: '0 auto',
    width: '100%',
    padding: '40px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '64px',
    flexWrap: 'wrap',
    boxSizing: 'border-box',
  },

  /* Left Column: Headline Carousel Showcase */
  heroSection: {
    flex: '1 1 540px',
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  eyebrowRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  eyebrowBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: '9999px',
    background: 'rgba(52, 226, 228, 0.12)',
    color: '#34E2E4',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    border: '1px solid rgba(52, 226, 228, 0.28)',
  },
  secondaryBadge: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#94A3B8',
    padding: '6px 12px',
    borderRadius: '9999px',
    background: 'rgba(255, 255, 255, 0.05)',
  },
  carouselFrame: {
    minHeight: '340px',
  },
  slideContent: {
    transition: 'all 0.35s ease-in-out',
  },
  heroTitle: {
    fontSize: '44px',
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    color: '#FFFFFF',
    margin: '0 0 16px 0',
  },
  heroSubtitle: {
    fontSize: '17px',
    lineHeight: 1.6,
    color: '#94A3B8',
    margin: '0 0 20px 0',
    maxWidth: '520px',
  },
  patternBar: {
    display: 'flex',
    height: '6px',
    width: '100%',
    maxWidth: '360px',
    gap: '4px',
    margin: '22px 0 28px 0',
  },
  quoteCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    padding: '20px 24px',
    maxWidth: '520px',
    backdropFilter: 'blur(8px)',
  },
  quoteText: {
    fontSize: '14px',
    fontStyle: 'italic',
    lineHeight: 1.6,
    color: '#E2E8F0',
    margin: '0 0 14px 0',
  },
  quoteAuthorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  authorAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4721FB, #AB1DFE)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '14px',
  },
  authorName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  authorRole: {
    fontSize: '12px',
    color: '#64748B',
  },
  carouselNavRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '520px',
    marginTop: '24px',
  },
  dotNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dot: {
    height: '8px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    transition: 'all 0.3s ease',
  },
  arrowControls: {
    display: 'flex',
    gap: '8px',
  },
  arrowBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    background: 'rgba(255, 255, 255, 0.04)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  trustRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    marginTop: '36px',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.07)',
    maxWidth: '520px',
  },
  trustItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  trustMetric: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#FFFFFF',
  },
  trustLabel: {
    fontSize: '12px',
    color: '#64748B',
  },
  trustDivider: {
    width: '1px',
    height: '28px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  /* Right Column: Pristine Reference Card */
  authSection: {
    flex: '1 1 420px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3), 0 0 1px rgba(0, 0, 0, 0.1)',
    padding: '32px',
    width: '100%',
    maxWidth: '380px',
    boxSizing: 'border-box',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },

  /* Tab Bar */
  tabContainer: {
    display: 'flex',
    background: '#F1F5F9',
    padding: '4px',
    borderRadius: '10px',
    marginBottom: '22px',
  },
  tabButton: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: 600,
    borderRadius: '7px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabButtonActive: {
    background: '#FFFFFF',
    color: '#1E293B',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  tabButtonInactive: {
    background: 'transparent',
    color: '#64748B',
  },

  /* Role Picker */
  rolePickerRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '16px',
  },
  roleOptionBtn: {
    flex: 1,
    padding: '8px 10px',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    background: '#F8FAFC',
    color: '#475569',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  roleOptionBtnActive: {
    border: '1.5px solid #2563EB',
    background: '#EFF6FF',
    color: '#1D4ED8',
  },

  iconWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  iconBox: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    backgroundColor: '#03EF62',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 16px -4px rgba(3, 239, 98, 0.35)',
  },
  cardHeading: {
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: 700,
    color: '#0F172A',
    margin: '0 0 6px 0',
    lineHeight: 1.25,
  },
  cardSubtext: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#64748B',
    margin: '0 0 22px 0',
    lineHeight: 1.45,
  },
  fieldGroup: {
    marginBottom: '10px',
  },
  label: {
    display: 'none',
  },
  input: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.15s ease',
  },
  inputWrap: {
    position: 'relative',
  },
  inputIcon: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 42px 10px 14px',
    fontSize: '14px',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.15s ease',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94A3B8',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
  errorText: {
    fontSize: '12px',
    color: '#EF4444',
    marginTop: '4px',
  },
  rememberRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '4px 0 20px 0',
  },
  rememberLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#334155',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#2563EB',
    cursor: 'pointer',
  },
  forgotLink: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#2563EB',
    textDecoration: 'none',
  },
  termsNote: {
    fontSize: '11px',
    color: '#94A3B8',
    lineHeight: 1.4,
    margin: '10px 0 16px 0',
    textAlign: 'center',
  },
  submitBtn: {
    width: '100%',
    padding: '11px',
    backgroundColor: '#03EF62',
    color: '#0F172A',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    boxShadow: '0 4px 12px rgba(3, 239, 98, 0.25)',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '13px',
    color: '#64748B',
  },
  footerLink: {
    color: '#2563EB',
    fontWeight: 600,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    padding: 0,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#EF4444',
    marginBottom: '16px',
    textAlign: 'center',
  },
  successBanner: {
    backgroundColor: '#F0FDF4',
    border: '1px solid #BBF7D0',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#16A34A',
    marginBottom: '16px',
    textAlign: 'center',
  },
};
