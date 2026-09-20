import { useState } from 'react'

// ─── Data ────────────────────────────────────────────────────────────────────

function generateHeatmapData() {
  const weeks: { hours: number; date: Date }[][] = []
  const today = new Date()
  // Start 52 weeks back, from the last Sunday
  const start = new Date(today)
  start.setDate(start.getDate() - 364)
  // Align to Sunday
  start.setDate(start.getDate() - start.getDay())

  for (let w = 0; w < 53; w++) {
    const week: { hours: number; date: Date }[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(start)
      date.setDate(start.getDate() + w * 7 + d)
      if (date > today) {
        week.push({ hours: -1, date })
      } else {
        // Weighted random — makes recent weeks denser
        const recency = (w * 7 + d) / 365
        const base = Math.random()
        let hours = 0
        if (base > 0.35) {
          const h = Math.random() * 8 * (0.4 + recency * 0.8)
          hours = Math.min(8, Math.round(h * 10) / 10)
        }
        week.push({ hours, date })
      }
    }
    weeks.push(week)
  }
  return weeks
}

function getColor(hours: number) {
  if (hours < 0) return 'transparent'
  if (hours === 0) return '#161b22'
  if (hours < 2) return '#0e4429'
  if (hours < 4) return '#006d32'
  if (hours < 6) return '#26a641'
  return '#39d353'
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const FEATURED_COURSES = [
  {
    id: 1,
    title: 'Full-Stack Engineering: System Design & Architecture',
    instructor: 'Priya Mehta',
    level: 'Advanced',
    duration: '48h 30m',
    lessons: 112,
    rating: 4.9,
    students: '14.2k',
    tag: 'FEATURED',
    img: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&h=420&fit=crop&auto=format',
    topics: ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
    progress: 34,
  },
  {
    id: 2,
    title: 'Machine Learning Fundamentals with Python',
    instructor: 'James Abubakar',
    level: 'Intermediate',
    duration: '36h 15m',
    lessons: 89,
    rating: 4.8,
    students: '22.8k',
    tag: 'BESTSELLER',
    img: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=420&fit=crop&auto=format',
    topics: ['Python', 'NumPy', 'scikit-learn', 'PyTorch'],
    progress: 0,
  },
]

const RECOMMENDED_COURSES = [
  {
    id: 3,
    title: 'TypeScript Mastery: From Types to Generics',
    instructor: 'Lena Kravchuk',
    level: 'Intermediate',
    duration: '18h 45m',
    rating: 4.7,
    students: '9.1k',
    tag: 'NEW',
    img: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&h=340&fit=crop&auto=format',
    progress: 67,
  },
  {
    id: 4,
    title: 'Algorithms & Data Structures in Depth',
    instructor: 'Kwame Osei',
    level: 'Advanced',
    duration: '24h 10m',
    rating: 4.9,
    students: '18.5k',
    tag: 'TOP RATED',
    img: 'https://images.unsplash.com/photo-1628258334105-2a0b3d6efee1?w=600&h=340&fit=crop&auto=format',
    progress: 0,
  },
  {
    id: 5,
    title: 'React 19 & Server Components Deep Dive',
    instructor: 'Sofia Almeida',
    level: 'Intermediate',
    duration: '22h 00m',
    rating: 4.8,
    students: '11.3k',
    tag: 'POPULAR',
    img: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&h=340&fit=crop&auto=format',
    progress: 12,
  },
  {
    id: 6,
    title: 'Cloud Infrastructure: AWS & Terraform',
    instructor: 'Arjun Nair',
    level: 'Advanced',
    duration: '30h 20m',
    rating: 4.6,
    students: '7.4k',
    tag: 'NEW',
    img: 'https://images.unsplash.com/photo-1607706189992-eae578626c86?w=600&h=340&fit=crop&auto=format',
    progress: 0,
  },
]

// ─── Heatmap ─────────────────────────────────────────────────────────────────

const heatmapData = generateHeatmapData()

function getMonthLabels(weeks: { hours: number; date: Date }[][]) {
  const labels: { label: string; col: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, i) => {
    const m = week[0].date.getMonth()
    if (m !== lastMonth) {
      labels.push({ label: MONTHS[m], col: i })
      lastMonth = m
    }
  })
  return labels
}



function Heatmap() {
  const [tooltip, setTooltip] = useState<{ cell: { hours: number; date: Date }; x: number; y: number } | null>(null)
  const monthLabels = getMonthLabels(heatmapData)

  const totalHours = heatmapData.flat().reduce((s, c) => s + (c.hours > 0 ? c.hours : 0), 0)
  const activeDays = heatmapData.flat().filter(c => c.hours > 0).length
  const currentStreak = (() => {
    const flat = heatmapData.flat().filter(c => c.hours >= 0).reverse()
    let streak = 0
    for (const c of flat) {
      if (c.hours > 0) streak++
      else break
    }
    return streak
  })()

  return (
    <section
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '28px 32px 24px',
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2
              style={{ fontFamily: 'Fraunces, serif', fontSize: '22px', fontWeight: 600, color: '#e6edf3' }}
            >
              Learning Activity
            </h2>
            <span className="badge" style={{ background: '#0e4429', color: '#39d353', border: '1px solid #006d32' }}>
              {new Date().getFullYear()}
            </span>
          </div>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#8b949e' }}>
            Hours invested in learning — last 12 months
          </p>
        </div>

        {/* Stats row */}
        <div className="flex gap-6 flex-wrap">
          {[
            { label: 'Total Hours', value: totalHours.toFixed(0) + 'h' },
            { label: 'Active Days', value: activeDays },
            { label: 'Streak', value: currentStreak + 'd' },
          ].map(stat => (
            <div key={stat.label} className="text-right">
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 700, color: '#39d353', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#8b949e', marginTop: '2px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          {/* Month labels */}
          <div style={{ display: 'flex', marginLeft: '28px', marginBottom: '4px', position: 'relative', height: '16px' }}>
            {monthLabels.map(({ label, col }) => (
              <div
                key={`${label}-${col}`}
                style={{
                  position: 'absolute',
                  left: col * 13 + 'px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px',
                  color: '#8b949e',
                }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Day labels + grid */}
          <div style={{ display: 'flex', gap: '0' }}>
            {/* Day labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '4px', paddingTop: '0' }}>
              {DAYS.map((day, i) => (
                <div
                  key={day}
                  style={{
                    height: '11px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '9px',
                    color: i % 2 === 0 ? '#8b949e' : 'transparent',
                    lineHeight: '11px',
                    width: '24px',
                    textAlign: 'right',
                  }}
                >
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div style={{ display: 'flex', gap: '2px' }}>
              {heatmapData.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {week.map((cell, di) => (
                    <div
                      key={di}
                      className="heatmap-cell"
                      style={{ background: getColor(cell.hours) }}
                      onMouseEnter={e => {
                        const r = (e.target as HTMLElement).getBoundingClientRect()
                        setTooltip({ cell, x: r.left, y: r.top - 32 })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4" style={{ marginLeft: '28px' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#8b949e' }}>Less</span>
            {['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'].map(c => (
              <div key={c} className="heatmap-cell" style={{ background: c, flexShrink: 0 }} />
            ))}
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#8b949e' }}>More</span>
          </div>
        </div>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            zIndex: 9999,
            background: '#1c2128',
            border: '1px solid #30363d',
            borderRadius: '4px',
            padding: '4px 10px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            color: '#e6edf3',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          }}
        >
          {tooltip.cell.hours === 0
            ? 'No study time'
            : `${tooltip.cell.hours}h studied`}{' '}
          · {tooltip.cell.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      )}
    </section>
  )
}

// ─── Weekly Progress Bar ──────────────────────────────────────────────────────

function WeeklyProgress() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = [3.5, 2, 4.5, 1, 5, 0, 2.5]
  const goal = 5

  return (
    <section
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '24px 28px',
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 600, color: '#e6edf3' }}>
            This Week
          </h3>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#8b949e', marginTop: '2px' }}>
            Daily goal: {goal}h
          </p>
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: '24px', fontWeight: 700, color: '#39d353' }}>
          {hours.reduce((a, b) => a + b, 0).toFixed(1)}
          <span style={{ fontSize: '13px', color: '#8b949e', fontFamily: 'JetBrains Mono, monospace', fontWeight: 400 }}>h</span>
        </div>
      </div>

      <div className="flex items-end gap-2" style={{ height: '72px' }}>
        {days.map((day, i) => {
          const pct = Math.min(100, (hours[i] / goal) * 100)
          const isToday = i === 4
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div
                style={{
                  width: '100%',
                  background: '#0d1117',
                  borderRadius: '2px',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  overflow: 'hidden',
                  border: isToday ? '1px solid #30363d' : 'none',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${pct}%`,
                    background: pct >= 100 ? '#39d353' : pct > 60 ? '#26a641' : pct > 30 ? '#006d32' : '#0e4429',
                    borderRadius: '2px 2px 0 0',
                    transition: 'height 0.6s ease',
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '9px',
                  color: isToday ? '#39d353' : '#8b949e',
                }}
              >
                {day}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── Skill Progress ───────────────────────────────────────────────────────────

const SKILLS = [
  { name: 'JavaScript', pct: 78, color: '#f59e0b' },
  { name: 'React', pct: 65, color: '#38bdf8' },
  { name: 'Python', pct: 52, color: '#a78bfa' },
  { name: 'SQL', pct: 44, color: '#34d399' },
  { name: 'Docker', pct: 31, color: '#fb923c' },
]

function SkillProgress() {
  return (
    <section
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '24px 28px',
      }}
    >
      <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 600, color: '#e6edf3', marginBottom: '20px' }}>
        Skill Mastery
      </h3>
      <div className="flex flex-col gap-4">
        {SKILLS.map(skill => (
          <div key={skill.name}>
            <div className="flex justify-between mb-1">
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#c9d1d9' }}>{skill.name}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: skill.color }}>{skill.pct}%</span>
            </div>
            <div style={{ height: '4px', background: '#0d1117', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${skill.pct}%`,
                  background: skill.color,
                  borderRadius: '2px',
                  opacity: 0.85,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Course Cards ─────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))} {rating}
    </span>
  )
}

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Beginner: '#34d399',
    Intermediate: '#38bdf8',
    Advanced: '#f472b6',
  }
  return (
    <span
      className="badge"
      style={{ background: 'transparent', color: colors[level] ?? '#8b949e', border: `1px solid ${colors[level] ?? '#30363d'}` }}
    >
      {level.toUpperCase()}
    </span>
  )
}

function TagBadge({ tag }: { tag: string }) {
  const tagColors: Record<string, { bg: string; color: string; border: string }> = {
    FEATURED: { bg: '#78350f', color: '#fcd34d', border: '#92400e' },
    BESTSELLER: { bg: '#0e4429', color: '#39d353', border: '#006d32' },
    NEW: { bg: '#1e3a5f', color: '#93c5fd', border: '#2563eb' },
    POPULAR: { bg: '#3b0764', color: '#d8b4fe', border: '#7c3aed' },
    'TOP RATED': { bg: '#78350f', color: '#fcd34d', border: '#b45309' },
  }
  const style = tagColors[tag] ?? { bg: '#1c2128', color: '#8b949e', border: '#30363d' }
  return (
    <span className="badge" style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
      {tag}
    </span>
  )
}

function FeaturedCourseCard({ course }: { course: typeof FEATURED_COURSES[0] }) {
  return (
    <div
      className="card-hover"
      style={{
        background: '#161b22',
        border: '1px solid #21262d',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr 1.4fr',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', background: '#0d1117', minHeight: '220px' }}>
        <img
          src={course.img}
          alt={course.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.85 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(13,17,23,0.3) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
          <TagBadge tag={course.tag} />
        </div>
        {course.progress > 0 && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)' }}>
              <div style={{ height: '100%', width: `${course.progress}%`, background: '#39d353' }} />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '28px 28px 24px' }}>
        <div className="flex items-center gap-2 mb-3">
          <LevelBadge level={course.level} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#8b949e' }}>
            {course.lessons} lessons · {course.duration}
          </span>
        </div>
        <h3
          style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 600, color: '#e6edf3', lineHeight: 1.3, marginBottom: '8px' }}
        >
          {course.title}
        </h3>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#8b949e', marginBottom: '16px' }}>
          by {course.instructor}
        </p>

        {/* Topics */}
        <div className="flex flex-wrap gap-2 mb-5">
          {course.topics.map(t => (
            <span
              key={t}
              className="badge"
              style={{ background: '#0d1117', color: '#8b949e', border: '1px solid #30363d' }}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <StarRating rating={course.rating} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#8b949e' }}>
              {course.students} students enrolled
            </span>
          </div>
          <button
            style={{
              background: course.progress > 0 ? 'transparent' : '#238636',
              color: course.progress > 0 ? '#39d353' : '#e6edf3',
              border: course.progress > 0 ? '1px solid #39d353' : 'none',
              borderRadius: '6px',
              padding: '8px 20px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {course.progress > 0 ? `Resume · ${course.progress}%` : 'Enroll Now'}
          </button>
        </div>
      </div>
    </div>
  )
}

function RecommendedCourseCard({ course }: { course: typeof RECOMMENDED_COURSES[0] }) {
  return (
    <div
      className="card-hover"
      style={{
        background: '#161b22',
        border: '1px solid #21262d',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative', background: '#0d1117', height: '160px' }}>
        <img
          src={course.img}
          alt={course.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.8 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(22,27,34,0.9) 100%)' }} />
        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <TagBadge tag={course.tag} />
        </div>
        {course.progress > 0 && (
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)' }}>
              <div style={{ height: '100%', width: `${course.progress}%`, background: '#39d353' }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="flex items-center gap-2 mb-2">
          <LevelBadge level={course.level} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#8b949e' }}>{course.duration}</span>
        </div>
        <h4
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '16px',
            fontWeight: 600,
            color: '#e6edf3',
            lineHeight: 1.3,
            marginBottom: '6px',
            flex: 1,
          }}
        >
          {course.title}
        </h4>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: '#8b949e', marginBottom: '14px' }}>
          {course.instructor}
        </p>

        <div className="flex items-center justify-between">
          <StarRating rating={course.rating} />
          <button
            style={{
              background: 'transparent',
              color: course.progress > 0 ? '#39d353' : '#8b949e',
              border: `1px solid ${course.progress > 0 ? '#39d353' : '#30363d'}`,
              borderRadius: '4px',
              padding: '5px 12px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#39d353'
              e.currentTarget.style.color = '#39d353'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = course.progress > 0 ? '#39d353' : '#30363d'
              e.currentTarget.style.color = course.progress > 0 ? '#39d353' : '#8b949e'
            }}
          >
            {course.progress > 0 ? `${course.progress}%` : 'View'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'featured' | 'recommended'>('featured')

  return (
      <main style={{ width: '100%', padding: '40px 24px 80px' }}>
        {/* Hero greeting */}
        <div className="mb-8">
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#39d353', marginBottom: '6px' }}>
            Good morning, Aryan —
          </p>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '36px', fontWeight: 600, color: '#e6edf3', lineHeight: 1.15 }}>
            Your Progress Report
          </h1>
        </div>

        {/* Progress section */}
        <div className="mb-5">
          <Heatmap />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '56px',
          }}
        >
          <WeeklyProgress />
          <SkillProgress />
        </div>

        {/* Courses section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 600, color: '#e6edf3' }}>
              Courses
            </h2>
            <div
              className="flex"
              style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '6px', padding: '3px' }}
            >
              {(['featured', 'recommended'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: activeTab === tab ? '#238636' : 'transparent',
                    color: activeTab === tab ? '#e6edf3' : '#8b949e',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 16px',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s',
                  }}
                >
                  {tab === 'featured' ? 'Featured' : 'Recommended'}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'featured' ? (
            <div className="flex flex-col gap-4">
              {FEATURED_COURSES.map(course => (
                <FeaturedCourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '16px',
              }}
            >
              {RECOMMENDED_COURSES.map(course => (
                <RecommendedCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </main>
  )
}
