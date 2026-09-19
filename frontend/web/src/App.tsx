import { useState, CSSProperties } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from './lib/api';

/* ─── Schemas ─── */
const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

/* ─── Style tokens ─── */
const BLUE = '#4589FF';
const BLUE_HOVER = '#2F6FE0';
const GRAY_LABEL = '#374151';
const GRAY_MUTED = '#6B7280';
const BORDER = '#D1D5DB';
const ERROR = '#DC2626';

const S: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F2F5',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '24px',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 2px 24px 0 rgba(0,0,0,0.09)',
    padding: '40px 36px 32px',
    width: '100%',
    maxWidth: '400px',
    boxSizing: 'border-box',
  },
  iconWrap: { display: 'flex', justifyContent: 'center', marginBottom: '20px' },
  iconBox: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: BLUE,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { textAlign: 'center', fontSize: '22px', fontWeight: 700, color: '#111827', margin: '0 0 6px', lineHeight: 1.3 },
  subtext: { textAlign: 'center', fontSize: '14px', color: GRAY_MUTED, margin: '0 0 28px', lineHeight: 1.5 },
  fieldGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '14px', fontWeight: 500, color: GRAY_LABEL, marginBottom: '6px' },
  input: {
    display: 'block', width: '100%', boxSizing: 'border-box',
    padding: '10px 14px', fontSize: '14px', color: '#111827',
    background: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: '8px', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  inputWrap: { position: 'relative' },
  inputIcon: {
    display: 'block', width: '100%', boxSizing: 'border-box',
    padding: '10px 42px 10px 14px', fontSize: '14px', color: '#111827',
    background: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: '8px', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  eyeBtn: {
    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: GRAY_MUTED, display: 'flex', alignItems: 'center', padding: 0,
  },
  errorText: { fontSize: '12px', color: ERROR, marginTop: '4px' },
  rememberRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0 20px' },
  rememberLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: GRAY_LABEL, cursor: 'pointer' },
  checkbox: { width: '16px', height: '16px', accentColor: BLUE, cursor: 'pointer' },
  forgotLink: { fontSize: '14px', fontWeight: 600, color: BLUE, textDecoration: 'none' },
  submitBtn: {
    width: '100%', padding: '11px', background: BLUE, color: '#FFFFFF', border: 'none',
    borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    transition: 'background 0.15s', marginTop: '8px',
  },
  footer: { textAlign: 'center', marginTop: '22px', fontSize: '14px', color: GRAY_MUTED },
  footerLink: { color: BLUE, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: 0, marginLeft: '4px' },
  errorBanner: {
    background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px',
    padding: '10px 14px', fontSize: '13px', color: ERROR, marginBottom: '16px', textAlign: 'center',
  },
};

/* ─── SVG Icons ─── */
const LockIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

/* focus/blur helpers */
const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = BLUE;
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(69,137,255,0.18)';
};
const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = BORDER;
  e.currentTarget.style.boxShadow = 'none';
};

/* ─── App ─── */
export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  const { register: rl, handleSubmit: hl, formState: { errors: le } } =
    useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const loginMut = useMutation({
    mutationFn: async (d: LoginFormValues) => (await apiClient.post('/auth/login', d)).data,
  });

  const { register: rs, handleSubmit: hs, formState: { errors: se } } =
    useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const regMut = useMutation({
    mutationFn: async (d: RegisterFormValues) => (await apiClient.post('/auth/register', d)).data,
    onSuccess: () => { setIsLogin(true); setShowPw(false); },
  });

  const btnStyle = (pending: boolean): CSSProperties => ({
    ...S.submitBtn,
    background: btnHover && !pending ? BLUE_HOVER : BLUE,
    opacity: pending ? 0.72 : 1,
  });

  return (
    <div style={S.page}>
      <div style={S.card}>

        <div style={S.iconWrap}>
          <div style={S.iconBox}><LockIcon /></div>
        </div>

        {isLogin ? (
          <>
            <h1 style={S.heading}>Welcome back</h1>
            <p style={S.subtext}>Please enter your details to sign in.</p>

            {loginMut.isError && (
              <div style={S.errorBanner}>
                {(loginMut.error as any)?.response?.data?.detail ?? 'Invalid credentials.'}
              </div>
            )}

            <form onSubmit={hl((d) => loginMut.mutate(d))} noValidate>
              <div style={S.fieldGroup}>
                <label style={S.label}>Email</label>
                <input {...rl('email')} type="email" placeholder="Enter your email" style={S.input} onFocus={onFocus} onBlur={onBlur} />
                {le.email && <p style={S.errorText}>{le.email.message}</p>}
              </div>

              <div style={S.fieldGroup}>
                <label style={S.label}>Password</label>
                <div style={S.inputWrap}>
                  <input {...rl('password')} type={showPw ? 'text' : 'password'} placeholder="••••••••" style={S.inputIcon} onFocus={onFocus} onBlur={onBlur} />
                  <button type="button" style={S.eyeBtn} onClick={() => setShowPw((v) => !v)}><EyeIcon open={showPw} /></button>
                </div>
                {le.password && <p style={S.errorText}>{le.password.message}</p>}
              </div>

              <div style={S.rememberRow}>
                <label style={S.rememberLabel}>
                  <input type="checkbox" {...rl('remember')} style={S.checkbox} />
                  Remember me
                </label>
                <a href="#" style={S.forgotLink}>Forgot password?</a>
              </div>

              <button type="submit" disabled={loginMut.isPending} style={btnStyle(loginMut.isPending)}
                onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}>
                {loginMut.isPending ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p style={S.footer}>
              Don't have an account?
              <button type="button" style={S.footerLink} onClick={() => { setIsLogin(false); setShowPw(false); }}>Sign up</button>
            </p>
          </>
        ) : (
          <>
            <h1 style={S.heading}>Create account</h1>
            <p style={S.subtext}>Please fill in the details to sign up.</p>

            {regMut.isError && (
              <div style={S.errorBanner}>
                {(regMut.error as any)?.response?.data?.detail ?? 'Registration failed.'}
              </div>
            )}

            <form onSubmit={hs((d) => regMut.mutate(d))} noValidate>
              <div style={S.fieldGroup}>
                <label style={S.label}>Full Name</label>
                <input {...rs('full_name')} type="text" placeholder="John Doe" style={S.input} onFocus={onFocus} onBlur={onBlur} />
                {se.full_name && <p style={S.errorText}>{se.full_name.message}</p>}
              </div>

              <div style={S.fieldGroup}>
                <label style={S.label}>Email Address</label>
                <input {...rs('email')} type="email" placeholder="john@example.com" style={S.input} onFocus={onFocus} onBlur={onBlur} />
                {se.email && <p style={S.errorText}>{se.email.message}</p>}
              </div>

              <div style={S.fieldGroup}>
                <label style={S.label}>Phone Number</label>
                <input {...rs('phone_number')} type="tel" placeholder="+1 (555) 000-0000" style={S.input} onFocus={onFocus} onBlur={onBlur} />
                {se.phone_number && <p style={S.errorText}>{se.phone_number.message}</p>}
              </div>

              <div style={S.fieldGroup}>
                <label style={S.label}>Password</label>
                <div style={S.inputWrap}>
                  <input {...rs('password')} type={showPw ? 'text' : 'password'} placeholder="••••••••" style={S.inputIcon} onFocus={onFocus} onBlur={onBlur} />
                  <button type="button" style={S.eyeBtn} onClick={() => setShowPw((v) => !v)}><EyeIcon open={showPw} /></button>
                </div>
                {se.password && <p style={S.errorText}>{se.password.message}</p>}
              </div>

              <button type="submit" disabled={regMut.isPending} style={btnStyle(regMut.isPending)}
                onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}>
                {regMut.isPending ? 'Creating account…' : 'Sign up'}
              </button>
            </form>

            <p style={S.footer}>
              Already have an account?
              <button type="button" style={S.footerLink} onClick={() => { setIsLogin(true); setShowPw(false); }}>Sign in</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
