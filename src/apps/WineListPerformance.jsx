import Logo from '../Logo.jsx'
import MarkdownRenderer from '../MarkdownRenderer.jsx'
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Anthropic from '@anthropic-ai/sdk'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'
import {
  BarChart3, TrendingDown, TrendingUp, ArrowLeft,
  Key, Eye, EyeOff, Sparkles, Filter, AlertCircle,
} from 'lucide-react'

const T = {
  burgundy:   '#6B1F2A',
  dark:       '#2E2E3E',
  terracotta: '#C6625E',
  gold:       '#C4A75E',
  cream:      '#F5F3EF',
  white:      '#FFFFFF',
  gray:       '#6B7280',
  grayLight:  '#F3F4F6',
  grayBorder: '#E5E7EB',
  success:    '#16A34A',
  warning:    '#D97706',
  error:      '#DC2626',
  shadow:     '0 4px 24px rgba(107,31,42,0.10)',
  shadowSm:   '0 2px 8px rgba(107,31,42,0.06)',
  radiusCard: '12px',
  fontSerif:  'Playfair Display, Georgia, serif',
  fontSans:   'Inter, system-ui, sans-serif',
}

const WINES = [
  { id: 1, name: "Caymus Cabernet Sauvignon", region: "Napa Valley", vintage: 2021, category: 'red', bottlePrice: 89, menuPrice: 185, coversPerWeek: 14, weeksActive: 12, btg: false },
  { id: 2, name: "Opus One", region: "Napa Valley", vintage: 2019, category: 'red', bottlePrice: 340, menuPrice: 650, coversPerWeek: 2, weeksActive: 12, btg: false },
  { id: 3, name: "Duckhorn Merlot", region: "Napa Valley", vintage: 2021, category: 'red', bottlePrice: 52, menuPrice: 115, coversPerWeek: 8, weeksActive: 12, btg: false },
  { id: 4, name: "Stag's Leap Artemis Cab", region: "Napa Valley", vintage: 2020, category: 'red', bottlePrice: 68, menuPrice: 145, coversPerWeek: 11, weeksActive: 12, btg: false },
  { id: 5, name: "Meiomi Pinot Noir", region: "California", vintage: 2022, category: 'red', bottlePrice: 24, menuPrice: 58, coversPerWeek: 6, weeksActive: 12, btg: true },
  { id: 6, name: "Prisoners Red Blend", region: "California", vintage: 2022, category: 'red', bottlePrice: 28, menuPrice: 65, coversPerWeek: 4, weeksActive: 12, btg: false },
  { id: 7, name: "Luce della Vite", region: "Tuscany", vintage: 2019, category: 'red', bottlePrice: 95, menuPrice: 195, coversPerWeek: 3, weeksActive: 8, btg: false },
  { id: 8, name: "Gaja Barbaresco", region: "Piedmont", vintage: 2018, category: 'red', bottlePrice: 195, menuPrice: 385, coversPerWeek: 1, weeksActive: 12, btg: false },
  { id: 9, name: "Sonoma-Cutrer Chardonnay", region: "Russian River", vintage: 2022, category: 'white', bottlePrice: 36, menuPrice: 85, coversPerWeek: 16, weeksActive: 12, btg: true },
  { id: 10, name: "Rombauer Chardonnay", region: "Napa Valley", vintage: 2022, category: 'white', bottlePrice: 42, menuPrice: 95, coversPerWeek: 18, weeksActive: 12, btg: true },
  { id: 11, name: "Cakebread Sauvignon Blanc", region: "Napa Valley", vintage: 2023, category: 'white', bottlePrice: 38, menuPrice: 88, coversPerWeek: 10, weeksActive: 12, btg: false },
  { id: 12, name: "Cloudy Bay Sauvignon Blanc", region: "Marlborough", vintage: 2023, category: 'white', bottlePrice: 29, menuPrice: 68, coversPerWeek: 7, weeksActive: 10, btg: true },
  { id: 13, name: "Domaine Weinbach Riesling", region: "Alsace", vintage: 2021, category: 'white', bottlePrice: 48, menuPrice: 105, coversPerWeek: 2, weeksActive: 8, btg: false },
  { id: 14, name: "Stony Hill Chardonnay", region: "Napa Valley", vintage: 2019, category: 'white', bottlePrice: 72, menuPrice: 155, coversPerWeek: 1, weeksActive: 12, btg: false },
  { id: 15, name: "Schramsberg Blanc de Blancs", region: "North Coast", vintage: 2019, category: 'sparkling', bottlePrice: 44, menuPrice: 98, coversPerWeek: 9, weeksActive: 12, btg: true },
  { id: 16, name: "Roederer Estate Brut", region: "Anderson Valley", vintage: 'NV', category: 'sparkling', bottlePrice: 36, menuPrice: 82, coversPerWeek: 7, weeksActive: 12, btg: true },
  { id: 17, name: "Veuve Clicquot Yellow Label", region: "Champagne", vintage: 'NV', category: 'sparkling', bottlePrice: 62, menuPrice: 135, coversPerWeek: 5, weeksActive: 12, btg: false },
  { id: 18, name: "Dom Pérignon", region: "Champagne", vintage: 2013, category: 'sparkling', bottlePrice: 210, menuPrice: 420, coversPerWeek: 1, weeksActive: 12, btg: false },
  { id: 19, name: "Frog's Leap Zinfandel", region: "Napa Valley", vintage: 2021, category: 'red', bottlePrice: 34, menuPrice: 78, coversPerWeek: 2, weeksActive: 6, btg: false },
  { id: 20, name: "Brewer-Clifton Pinot Noir", region: "Sta. Rita Hills", vintage: 2021, category: 'red', bottlePrice: 58, menuPrice: 125, coversPerWeek: 3, weeksActive: 12, btg: false },
  { id: 21, name: "Talbott Sleepy Hollow Chard", region: "Santa Lucia", vintage: 2021, category: 'white', bottlePrice: 45, menuPrice: 98, coversPerWeek: 2, weeksActive: 4, btg: false },
  { id: 22, name: "Darioush Signature Viognier", region: "Napa Valley", vintage: 2022, category: 'white', bottlePrice: 52, menuPrice: 115, coversPerWeek: 1, weeksActive: 8, btg: false },
  { id: 23, name: "Sauternes Ch. d'Yquem (375ml)", region: "Sauternes", vintage: 2016, category: 'dessert', bottlePrice: 180, menuPrice: 340, coversPerWeek: 1, weeksActive: 12, btg: false },
  { id: 24, name: "Taylor Fladgate 20yr Tawny", region: "Port", vintage: 'NV', category: 'dessert', bottlePrice: 48, menuPrice: 95, coversPerWeek: 2, weeksActive: 12, btg: false },
]

function enrichWine(w) {
  const margin = w.menuPrice - w.bottlePrice
  const marginPct = Math.round(margin / w.menuPrice * 100)
  const totalRevenue = w.menuPrice * w.coversPerWeek * w.weeksActive
  const weeklyRevenue = w.menuPrice * w.coversPerWeek
  const velocity = w.coversPerWeek
  const score = velocity * marginPct / 100
  return { ...w, margin, marginPct, totalRevenue, weeklyRevenue, velocity, score }
}

const CATEGORIES_LIST = ['all', 'red', 'white', 'sparkling', 'dessert']

export default function WineListPerformance() {
  const [apiKey, setApiKey] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiStreaming, setAiStreaming] = useState(false)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('revenue')

  const enriched = useMemo(() => WINES.map(enrichWine), [])

  const filtered = useMemo(() => {
    const base = filter === 'all' ? enriched : enriched.filter(w => w.category === filter)
    return [...base].sort((a, b) => {
      if (sortBy === 'revenue') return b.weeklyRevenue - a.weeklyRevenue
      if (sortBy === 'velocity') return b.velocity - a.velocity
      if (sortBy === 'margin') return b.marginPct - a.marginPct
      return b.score - a.score
    })
  }, [enriched, filter, sortBy])

  const slowMovers = enriched.filter(w => w.coversPerWeek <= 2)
  const topByRevenue = [...enriched].sort((a, b) => b.weeklyRevenue - a.weeklyRevenue).slice(0, 6)

  async function generateOptimization() {
    if (!apiKey) { setShowKeyModal(true); return }
    setAiText('')
    setAiStreaming(true)
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
    const slow = slowMovers.map(w => `${w.name} (${w.coversPerWeek} covers/wk, ${w.marginPct}% margin)`).join(', ')
    const top = topByRevenue.map(w => `${w.name} ($${w.weeklyRevenue}/wk)`).join(', ')
    let full = ''
    try {
      const stream = await client.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `You are a beverage consultant analyzing a fine-dining wine list. Provide a concise optimization brief.

Top performers by weekly revenue: ${top}
Slow movers (≤2 covers/week): ${slow}
Total SKUs on list: ${WINES.length}

Write 3 sections: ## What to Cut (2-3 specific wines with reason), ## What to Promote BTG (2-3 suggestions), ## Quick Wins (2 bullets). Be specific and direct. No preamble.`,
        }],
      })
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
          full += chunk.delta.text
          setAiText(full)
        }
      }
    } catch { /* silent */ }
    setAiStreaming(false)
  }

  const catBreakdown = ['red', 'white', 'sparkling', 'dessert'].map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    revenue: enriched.filter(w => w.category === cat).reduce((s, w) => s + w.weeklyRevenue, 0),
    skus: enriched.filter(w => w.category === cat).length,
  }))

  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.cream, fontFamily: T.fontSans }}>
      <header style={{ backgroundColor: T.burgundy, color: T.white, padding: '14px 24px', boxShadow: '0 2px 16px rgba(107,31,42,0.25)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
              <ArrowLeft size={16} /> Back
            </Link>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 6, padding: '3px 8px', display: 'inline-flex', alignItems: 'center' }}><Logo height={26} /></div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: T.fontSerif }}>Wine List Performance</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>App 02 · Analytics & Intelligence · 24 SKUs · 12-Week View</div>
            </div>
          </div>
          <button onClick={() => setShowKeyModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: T.white, borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
            <Key size={13} /> {apiKey ? 'API Key Set ✓' : 'Set API Key'}
          </button>
        </div>
      </header>

      {showKeyModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontFamily: T.fontSerif, fontSize: 18, color: T.dark, marginBottom: 8 }}>Anthropic API Key</h2>
            <p style={{ fontSize: 13, color: T.gray, marginBottom: 16, lineHeight: 1.6 }}>Required for AI list optimization. Stays in-browser, never stored.</p>
            <div style={{ position: 'relative' }}>
              <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-..." style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 6, border: `1px solid ${T.grayBorder}`, fontSize: 13, fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none' }} />
              <button onClick={() => setShowKey(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.gray }}>{showKey ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowKeyModal(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: `1px solid ${T.grayBorder}`, backgroundColor: T.white, color: T.dark, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={() => { setShowKeyModal(false); generateOptimization() }} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: 'none', backgroundColor: T.burgundy, color: T.white, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>Save & Optimize</button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Total SKUs', value: WINES.length, sub: 'On current list', color: T.burgundy },
            { label: 'Slow Movers', value: slowMovers.length, sub: '≤2 covers/week', color: T.warning },
            { label: 'Weekly Revenue', value: `$${enriched.reduce((s, w) => s + w.weeklyRevenue, 0).toLocaleString()}`, sub: 'All categories', color: T.success },
            { label: 'Avg Margin', value: `${Math.round(enriched.reduce((s, w) => s + w.marginPct, 0) / enriched.length)}%`, sub: 'Across list', color: T.dark },
          ].map(kpi => (
            <div key={kpi.label} style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '14px 16px', boxShadow: T.shadowSm }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.gray, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color, fontFamily: T.fontSerif }}>{kpi.value}</div>
              <div style={{ fontSize: 11, color: T.gray, marginTop: 3 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Category Revenue Bar */}
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm }}>
            <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark, marginBottom: 14 }}>Weekly Revenue by Category</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.grayBorder} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: T.gray }} />
                <YAxis tick={{ fontSize: 10, fill: T.gray }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="revenue" name="Weekly Revenue" fill={T.burgundy} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Slow movers alert */}
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm }}>
            <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark, marginBottom: 14 }}>Slow Movers — Review & Cut</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {slowMovers.slice(0, 7).map(w => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', backgroundColor: '#FEF2F2', borderRadius: 7, border: `1px solid ${T.error}33` }}>
                  <AlertCircle size={13} color={T.error} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.dark, lineHeight: 1.3 }}>{w.name}</div>
                    <div style={{ fontSize: 10, color: T.gray }}>{w.vintage} · {w.region}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.error }}>{w.coversPerWeek}/wk</div>
                    <div style={{ fontSize: 10, color: T.gray }}>${w.menuPrice}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wine list table */}
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, overflow: 'hidden', boxShadow: T.shadowSm, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: `1px solid ${T.grayBorder}` }}>
            <Filter size={14} color={T.gray} />
            {CATEGORIES_LIST.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} style={{ padding: '4px 10px', borderRadius: 99, border: `1px solid ${filter === cat ? T.burgundy : T.grayBorder}`, backgroundColor: filter === cat ? T.burgundy : T.white, color: filter === cat ? T.white : T.dark, fontSize: 11, fontWeight: filter === cat ? 700 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>
                {cat}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: T.gray }}>Sort:</span>
              {[['revenue', 'Revenue'], ['velocity', 'Velocity'], ['margin', 'Margin']].map(([val, label]) => (
                <button key={val} onClick={() => setSortBy(val)} style={{ padding: '4px 10px', borderRadius: 99, border: `1px solid ${sortBy === val ? T.gold : T.grayBorder}`, backgroundColor: sortBy === val ? T.gold : T.white, color: sortBy === val ? '#7C4700' : T.dark, fontSize: 11, cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: T.cream }}>
                  {['Wine', 'Region', 'Vintage', 'Menu $', 'Cost $', 'Margin %', 'Covers/Wk', 'Wkly Rev', 'BTG', 'Status'].map(h => (
                    <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.gray, borderBottom: `2px solid ${T.grayBorder}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((w, i) => {
                  const isSlowMover = w.coversPerWeek <= 2
                  const isTop = w.coversPerWeek >= 10
                  return (
                    <tr key={w.id} style={{ backgroundColor: i % 2 === 0 ? T.white : T.cream }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: T.dark, maxWidth: 220 }}>{w.name}</td>
                      <td style={{ padding: '10px 12px', color: T.gray, whiteSpace: 'nowrap' }}>{w.region}</td>
                      <td style={{ padding: '10px 12px', color: T.dark }}>{w.vintage}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: T.dark }}>${w.menuPrice}</td>
                      <td style={{ padding: '10px 12px', color: T.gray }}>${w.bottlePrice}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontWeight: 700, color: w.marginPct >= 60 ? T.success : w.marginPct >= 50 ? T.warning : T.error }}>{w.marginPct}%</span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {isTop ? <TrendingUp size={11} color={T.success} /> : isSlowMover ? <TrendingDown size={11} color={T.error} /> : null}
                          <span style={{ fontWeight: 700, color: isTop ? T.success : isSlowMover ? T.error : T.dark }}>{w.coversPerWeek}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: T.dark }}>${w.weeklyRevenue.toLocaleString()}</td>
                      <td style={{ padding: '10px 12px' }}>
                        {w.btg && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, backgroundColor: T.burgundy + '18', color: T.burgundy }}>BTG</span>}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, backgroundColor: isSlowMover ? '#FEF2F2' : isTop ? '#F0FDF4' : T.grayLight, color: isSlowMover ? T.error : isTop ? T.success : T.gray }}>
                          {isSlowMover ? 'Review' : isTop ? 'Star' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Optimization */}
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark }}>AI List Optimization</div>
              <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>✨ AI · What to cut, promote BTG, and quick wins</div>
            </div>
            <button onClick={generateOptimization} disabled={aiStreaming} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: T.burgundy, color: T.white, border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: aiStreaming ? 'default' : 'pointer', opacity: aiStreaming ? 0.7 : 1 }}>
              <Sparkles size={13} /> {aiStreaming ? 'Analyzing…' : aiText ? 'Refresh' : 'Optimize List'}
            </button>
          </div>
          {aiText ? (
            <div style={{ backgroundColor: '#FEFCE8', borderRadius: 8, padding: '14px 16px', border: `1px solid ${T.gold}44` }}>
              <MarkdownRenderer text={aiText} streaming={aiStreaming} />
            </div>
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: T.gray, fontSize: 13 }}>
              Click "Optimize List" to get AI recommendations on what to cut, add to BTG, and feature.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
