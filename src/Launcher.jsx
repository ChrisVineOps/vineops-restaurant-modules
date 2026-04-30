import Logo from './Logo.jsx'
import { Link } from 'react-router-dom'
import {
  TrendingDown, BarChart3, GlassWater, Star, Archive,
  GraduationCap, ShoppingCart, Utensils, FileWarning, CalendarDays,
} from 'lucide-react'

const T = {
  burgundy:   '#6B1F2A',
  dark:       '#2E2E3E',
  terracotta: '#C6625E',
  gold:       '#C4A75E',
  cream:      '#F5F3EF',
  white:      '#FFFFFF',
  gray:       '#6B7280',
  grayBorder: '#E5E7EB',
  shadow:     '0 4px 24px rgba(107,31,42,0.10)',
  shadowSm:   '0 2px 8px rgba(107,31,42,0.06)',
  radiusCard: '12px',
  fontSerif:  'Playfair Display, Georgia, serif',
  fontSans:   'Inter, system-ui, sans-serif',
}

const APPS = [
  // Analytics & Intelligence
  {
    num: '01', title: 'Beverage Cost Monitor',
    desc: 'Track pour cost % by category against target thresholds — and get an AI action brief before the period closes.',
    icon: TrendingDown, category: 'analytics', route: '/app/01-beverage-cost-monitor',
    persona: 'Beverage Director / GM', ai: true,
  },
  {
    num: '02', title: 'Wine List Performance',
    desc: 'Sales velocity by SKU, slow mover alerts, and AI-generated list optimization — what to cut, add, and promote.',
    icon: BarChart3, category: 'analytics', route: '/app/02-wine-list-performance',
    persona: 'Sommelier / Beverage Director', ai: true,
  },
  {
    num: '03', title: 'By-the-Glass Profitability',
    desc: 'Per-glass margin breakdown with yield tracking. Find the stars and the drags in your BTG program instantly.',
    icon: GlassWater, category: 'analytics', route: '/app/03-btg-profitability',
    persona: 'Sommelier / Beverage Director', ai: true,
  },
  {
    num: '04', title: 'Vendor & Rep Scorecard',
    desc: 'Score every distributor rep on delivery, pricing, and responsiveness. Know who\'s earning your business.',
    icon: Star, category: 'analytics', route: '/app/04-vendor-scorecard',
    persona: 'Beverage Director / Purchasing', ai: true,
  },
  {
    num: '05', title: 'Cellar Inventory Dashboard',
    desc: 'Live cellar status by region and variety — drinking window alerts, reserve list revenue, and AI reorder memos.',
    icon: Archive, category: 'analytics', route: '/app/05-cellar-dashboard',
    persona: 'Sommelier / Cellar Manager', ai: true,
  },
  // Process Automation
  {
    num: '06', title: 'Staff Training Hub',
    desc: 'AI-generated tasting briefs, food pairings, and pre-shift quizzes — tailored to your wine list, not a textbook.',
    icon: GraduationCap, category: 'automation', route: '/app/06-staff-training-hub',
    persona: 'Sommelier / Service Director', ai: true,
  },
  {
    num: '07', title: 'Purchase Order Builder',
    desc: 'Inventory count to signed PO in minutes — par-level deltas, vendor routing, and AI anomaly review.',
    icon: ShoppingCart, category: 'automation', route: '/app/07-purchase-order-builder',
    persona: 'Sommelier / Purchasing', ai: true,
  },
  {
    num: '08', title: 'Wine & Menu Pairing Assistant',
    desc: 'Enter your tasting menu courses — AI generates per-course pairings with guest copy and staff talking points.',
    icon: Utensils, category: 'automation', route: '/app/08-pairing-assistant',
    persona: 'Sommelier + Chef', ai: true,
  },
  {
    num: '09', title: 'Comp & Variance Tracker',
    desc: 'Log comps, breakage, and over-pours. Generate the end-of-period variance memo for ownership automatically.',
    icon: FileWarning, category: 'automation', route: '/app/09-comp-variance-tracker',
    persona: 'Beverage Director / Ops', ai: true,
  },
  {
    num: '10', title: 'Wine Dinner & Event Planner',
    desc: 'Course builder, bottle calculator, per-head pricing, and AI-generated dinner narrative — one tool, complete package.',
    icon: CalendarDays, category: 'automation', route: '/app/10-event-planner',
    persona: 'Sommelier / Events Manager', ai: true,
  },
]

const CATEGORIES = {
  analytics: { label: 'Analytics & Intelligence', color: T.burgundy },
  automation: { label: 'AI-Augmented Process Automation', color: T.terracotta },
}

export default function Launcher() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.cream, fontFamily: T.fontSans }}>

      {/* Header */}
      <header style={{ backgroundColor: T.burgundy, color: T.white, padding: '20px 24px', boxShadow: '0 2px 16px rgba(107,31,42,0.25)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 8, padding: '5px 12px', display: 'inline-flex', alignItems: 'center' }}><Logo height={34} /></div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Restaurant Suite</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>Beverage Program Intelligence & Automation</div>
          </div>
        </div>
      </header>

      {/* Hero strip */}
      <div style={{ backgroundColor: T.dark, padding: '20px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7, maxWidth: 700 }}>
            10 tools built for independent fine-dining restaurants — from beverage cost control to cellar management to wine dinner planning.
            AI-powered, designed for sommeliers and beverage directors who want the intelligence without the spreadsheet overhead.
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 16px 60px' }}>
        {Object.entries(CATEGORIES).map(([key, { label, color }]) => {
          const catApps = APPS.filter(a => a.category === key)
          return (
            <section key={key} style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ height: 3, width: 28, backgroundColor: color, borderRadius: 99 }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color }}>
                  {label}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {catApps.map(app => {
                  const Icon = app.icon
                  const card = (
                    <div
                      style={{
                        backgroundColor: T.white,
                        borderRadius: T.radiusCard,
                        boxShadow: T.shadow,
                        border: `2px solid ${T.burgundy}22`,
                        padding: '22px 20px',
                        cursor: 'pointer',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        position: 'relative',
                        fontFamily: T.fontSans,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-3px)'
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(107,31,42,0.18)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = T.shadow
                      }}
                    >
                      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 5, alignItems: 'center' }}>
                        {app.ai && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, backgroundColor: '#FEF3C7', color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.08em' }}>✨ AI</span>
                        )}
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, backgroundColor: T.burgundy + '18', color: T.burgundy, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live</span>
                      </div>

                      <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: T.burgundy + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                        <Icon size={20} color={T.burgundy} />
                      </div>

                      <div style={{ fontSize: 10, fontWeight: 700, color: T.gold, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
                        App {app.num}
                      </div>

                      <h3 style={{ fontFamily: T.fontSerif, fontSize: 16, fontWeight: 700, color: T.dark, marginBottom: 8, lineHeight: 1.3 }}>
                        {app.title}
                      </h3>

                      <p style={{ fontSize: 13, color: T.gray, lineHeight: 1.6, marginBottom: 14 }}>
                        {app.desc}
                      </p>

                      <div style={{ fontSize: 11, color: T.burgundy, fontWeight: 600 }}>
                        Persona: {app.persona}
                      </div>
                    </div>
                  )

                  return (
                    <Link key={app.num} to={app.route} style={{ textDecoration: 'none' }}>{card}</Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </main>

      <footer style={{ backgroundColor: T.dark, padding: '28px 16px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>© 2026 VineOps · An Oakling Systems Solution</p>
        <p style={{ marginTop: 8, fontSize: 13 }}>
          <a href="https://oaklingsystems.com/assessment?vertical=restaurant" style={{ color: T.gold }}>
            Get Your Free Beverage Program Assessment →
          </a>
        </p>
      </footer>
    </div>
  )
}
