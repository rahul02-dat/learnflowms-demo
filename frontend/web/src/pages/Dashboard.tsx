import { ActivityCalendar } from 'react-activity-calendar';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';

// Mock data for heatmap (last 365 days)
const generateActivityData = () => {
  const data = [];
  const today = new Date();
  for (let i = 365; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const count = Math.random() > 0.4 ? Math.floor(Math.random() * 5) : 0;
    data.push({
      date: d.toISOString().split('T')[0],
      count,
      level: count > 3 ? 4 : count
    });
  }
  return data;
};
const activityData = generateActivityData();

const weekData = [
  { name: 'Mon', hours: 2.5 },
  { name: 'Tue', hours: 4.0 },
  { name: 'Wed', hours: 3.2 },
  { name: 'Thu', hours: 1.5 },
  { name: 'Fri', hours: 6.0 },
  { name: 'Sat', hours: 0 },
  { name: 'Sun', hours: 1.0 },
];

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 700,
    marginBottom: '24px',
    letterSpacing: '-0.5px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  card: {
    backgroundColor: '#0A1220', 
    borderRadius: '12px',
    padding: '32px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  pill: {
    backgroundColor: 'rgba(3, 239, 98, 0.1)',
    color: '#03EF62',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 700,
  },
  statBig: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#03EF62',
  },
  statLabel: {
    fontSize: '12px',
    color: '#94A3B8',
    textTransform: 'uppercase' as const,
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
  statGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
  },
  statsRow: {
    display: 'flex',
    gap: '32px',
  },
  barChartContainer: {
    height: '180px',
    marginTop: '24px',
  },
  skillRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  skillName: {
    fontSize: '14px',
    color: '#F8FAFC',
    fontWeight: 500,
  },
  skillPct: {
    fontSize: '14px',
    fontWeight: 700,
  },
  progressBarBg: {
    height: '6px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '3px',
    marginBottom: '24px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
  }
};

const skills = [
  { name: 'JavaScript', pct: 78, color: '#EAB308' },
  { name: 'React', pct: 65, color: '#38BDF8' },
  { name: 'Python', pct: 52, color: '#A855F7' },
  { name: 'SQL', pct: 44, color: '#10B981' },
  { name: 'Docker', pct: 31, color: '#F97316' },
];

export default function Dashboard() {
  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Your Progress Report</h1>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>
            Learning Activity <span style={styles.pill}>2026</span>
          </div>
          <div style={styles.statsRow}>
            <div style={styles.statGroup}>
              <span style={styles.statBig}>755h</span>
              <span style={styles.statLabel}>Total Hours</span>
            </div>
            <div style={styles.statGroup}>
              <span style={styles.statBig}>236</span>
              <span style={styles.statLabel}>Active Days</span>
            </div>
            <div style={styles.statGroup}>
              <span style={styles.statBig}>0d</span>
              <span style={styles.statLabel}>Streak</span>
            </div>
          </div>
        </div>
        <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '40px', marginTop: '-12px' }}>
          Hours invested in learning — last 12 months
        </p>
        <div>
          <ActivityCalendar 
            data={activityData} 
            theme={{
              light: ['#1E293B', '#114a2c', '#0f7743', '#00ad58', '#03EF62'],
              dark: ['#1E293B', '#114a2c', '#0f7743', '#00ad58', '#03EF62']
            }}
            colorScheme="dark"
            labels={{
              months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
              weekdays: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
            }}
          />
        </div>
      </div>

      <div style={styles.row}>
        
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>This Week</div>
              <div style={{fontSize: '13px', color: '#94A3B8', marginTop:'4px'}}>Daily goal: 5h</div>
            </div>
            <div style={styles.statBig}>18.5<span style={{fontSize: '20px', color: '#94A3B8'}}>h</span></div>
          </div>
          <div style={styles.barChartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData}>
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {weekData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.hours >= 5 ? '#03EF62' : 'rgba(3, 239, 98, 0.15)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', padding: '0 12px' }}>
            {weekData.map(d => (
              <span key={d.name} style={{fontSize: '12px', color: '#94A3B8'}}>{d.name}</span>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <div style={{...styles.cardTitle, marginBottom: '32px'}}>Skill Mastery</div>
          
          {skills.map(s => (
            <div key={s.name}>
              <div style={styles.skillRow}>
                <span style={styles.skillName}>{s.name}</span>
                <span style={{...styles.skillPct, color: s.color}}>{s.pct}%</span>
              </div>
              <div style={styles.progressBarBg}>
                <div style={{...styles.progressBarFill, width: `${s.pct}%`, backgroundColor: s.color}} />
              </div>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}
