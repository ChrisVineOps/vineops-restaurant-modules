import Logo from '../Logo.jsx'
import MarkdownRenderer from '../MarkdownRenderer.jsx'
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Anthropic from '@anthropic-ai/sdk'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'
import {
  GlassWater, TrendingUp, TrendingDown, ArrowLeft,
  Key, Eye, EyeOff, Sparkles, Star,
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

const BTG_WINES = [
  { id: 1, name: 'Rombauer Chardonnay', region: 'Napa Valley', category: 'White', bottlePrice: 42, glassPrice: 22, poursPerBottle: 5, yieldPct: 88, poursPerWeek: 34 },
  { id: 2, name: 'Sonoma-Cutrer Chardonnay', region: 'Russian River', category: 'White', bottlePrice: 36, glassPrice: 18, poursPerBottle: 5, yieldPct: 86, poursPerWeek: 28 },
  { id: 3, name: 'Cloudy Bay Sauvignon Blanc', region: 'Marlborough', category: 'White', bottlePrice: 29, glassPrice: 16, poursPerBottle: 5, yieldPct: 90, poursPerWeek: 22 },
  { id: 4, name: 'Meiomi Pinot Noir', region: 'California', category: 'Red', bottlePrice: 24, glassPrice: 14, poursPerBottle: 5, yieldPct: 84, poursPerWeek: 18 },
  { id: 5, name: 'Duckhorn Merlot', region: 'Napa Valley', category: 'Red', bottlePrice: 52, glassPrice: 26, poursPerBottle: 5, yieldPct: 82, poursPerWeek: 12 },
  { id: 6, name: 'DAOU Soul of a Lion Cab', region: 'Paso Robles', category: 'Red', bottlePrice: 48, glassPrice: 24, poursPerBottle: 5, yieldPct: 80, poursPerWeek: 10 },
  { id: 7, name: 'Schramsberg Blanc de Blancs', region: 'North Coast', category: 'Sparkling', bottlePrice: 44, glassPrice: 24, poursPerBottle: 6, yieldPct: 91, poursPerWeek: 16 },
  { id: 8, name: 'Roederer Estate Brut', region: 'Anderson Valley', category: 'Sparkling', bottlePrice: 36, glassPrice: 18, poursPerBottle: 6, yieldPct: 88, poursPerWeek: 20 },
  { id: 9, name: "Bonny Doon Vin Gris", region: 'Santa Cruz', category: 'Rosé', bottlePrice: 22, glassPrice: 13, poursPerBottle: 5, yieldPct: 92, poursPerWeek: 14 },
  { id: 10, name: 'Whispering Angel Rosé', region: 'Provence', category: 'Rosé', bottlePrice: 34, glassPrice: 17, poursPerBottle: 5, yieldPct: 86, poursPerWeek: 24 },
]

function enrichBTG(w, yieldOverride) {
  const effectiveYield = yieldOverride !== undefined ? yieldOverride : w.yieldPct
  const effectivePours = w.poursPerBottle * (effectiveYield / 100)
  const costPerGlass = w.bottlePrice / effectivePours
  const marginPerGlass = w.glassPrice - costPerGlass
  const marginPct = Math.round((marginPerGlass / w.glassPrice) * 100)
  const weeklyRevenue = w.poursPerWeek * w.glassPrice
  const weeklyProfit = w.poursPerWeek * marginPerGlass
  return { ...w, yieldPct: effectiveYield, effectivePours: +effectivePours.toFixed(2), costPerGlass: +costPerGlass.toFixed(2), marginPerGlass: +marginPerGlass.toFixed(2), marginPct, weeklyRevenue: +weeklyRevenue.toFixed(0), weeklyProfit: +weeklyProfit.toFixed(0) }
}

export default function BTGProfitability() {
  const [apiKey, setApiKey] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiStreaming, setAiStreaming] = useState(false)
  const [yieldOverrides, setYieldOverrides] = useState({})

  const enriched = useMemo(() => BTG_WINES.map(w => enrichBTG(w, yieldOverrides[w.id])), [yieldOverrides])

  const totalWeeklyRevenue = enriched.reduce((s, w) => s + w.weeklyRevenue, 0)
  const totalWeeklyProfit = enriched.reduce((s, w) => s + w.weeklyProfit, 0)
  const avgMargin = Math.round(enriched.reduce((s, w) => s + w.marginPct, 0) / enriched.length)
  const stars = enriched.filter(w => w.marginPct >= 60 && w.poursPerWeek >= 15)
  const drags = enriched.filter(w => w.marginPct < 52)

  const chartData = [...enriched].sort((a, b) => b.marginPct - a.marginPct).map(w => ({
    name: w.name.split(' ').slice(0, 2).join(' '),
    margin: w.marginPct,
    profit: w.weeklyProfit,
  }))

  async function generateOptimization() {
    if (!apiKey) { setShowKeyModal(true); return }
    setAiText('')
    setAiStreaming(true)
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
    const drags = enriched.filter(w => w.marginPct < 52)
    const stars = enriched.filter(w => w.marginPct >= 60 && w.poursPerWeek >= 15)
    let full = ''
    try {
      const stream = await client.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 350,
        messages: [{
          role: 'user',
          content: `Fine-dining BTG program analysis. Provide actionable optimization recommendations.

Stars (high margin + volume): ${stars.map(w => `${w.name} (${w.marginPct}% margin, ${w.poursPerWeek} pours/wk)`).join(', ')}
Drags (low margin): ${drags.map(w => `${w.name} (${w.marginPct}% margin, $${w.costPerGlass.toFixed(2)} cost/glass, $${w.glassPrice} menu)`).join(', ')}
Total BTG revenue: $${totalWeeklyRevenue.toLocaleString()}/wk
Average BTG margin: ${avgMargin}%

Write 3 sections: ## Stars to Feature (why & how), ## Drags to Fix (price adjustment or drop), ## Pour Standard Audit (yield improvement tip). 2-3 bullets each. No preamble.`,
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
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: T.fontSerif }}>By-the-Glass Profitability</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>App 03 · Analytics & Intelligence · 10 BTG Selections</div>
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
            <p style={{ fontSize: 13, color: T.gray, marginBottom: 16, lineHeight: 1.6 }}>Required for AI BTG optimization. Stays in-browser, never stored.</p>
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
            { label: 'BTG Selections', value: BTG_WINES.length, sub: 'Active pours', color: T.burgundy },
            { label: 'Weekly BTG Revenue', value: `$${totalWeeklyRevenue.toLocaleString()}`, sub: 'All pours', color: T.success },
            { label: 'Weekly BTG Profit', value: `$${totalWeeklyProfit.toLocaleString()}`, sub: 'After cost', color: T.dark },
            { label: 'Avg BTG Margin', value: `${avgMargin}%`, sub: 'Across selections', color: avgMargin >= 58 ? T.success : T.warning },
          ].map(kpi => (
            <div key={kpi.label} style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '14px 16px', boxShadow: T.shadowSm }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.gray, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color, fontFamily: T.fontSerif }}>{kpi.value}</div>
              <div style={{ fontSize: 11, color: T.gray, marginTop: 3 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Margin chart */}
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm, marginBottom: 20 }}>
          <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark, marginBottom: 14 }}>Gross Margin % by Pour</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.grayBorder} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.gray }} />
              <YAxis tick={{ fontSize: 10, fill: T.gray }} unit="%" domain={[40, 80]} />
              <Tooltip formatter={(v, n) => [n === 'margin' ? `${v}%` : `$${v}`, n === 'margin' ? 'Margin' : 'Wkly Profit']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="margin" name="margin" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.margin >= 60 ? T.success : entry.margin >= 52 ? T.warning : T.error} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* BTG Table with yield slider */}
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, overflow: 'hidden', boxShadow: T.shadowSm, marginBottom: 20 }}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.grayBorder}` }}>
            <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark }}>Pour-by-Pour Breakdown</div>
            <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>Adjust yield % with the slider to model different pour standards</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: T.cream }}>
                  {['', 'Wine', 'Category', 'Glass $', 'Bottle $', 'Yield %', 'Cost/Glass', 'Margin/Glass', 'Margin %', 'Pours/Wk', 'Wkly Profit'].map(h => (
                    <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.gray, borderBottom: `2px solid ${T.grayBorder}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enriched.map((w, i) => {
                  const isStar = w.marginPct >= 60 && w.poursPerWeek >= 15
                  const isDrag = w.marginPct < 52
                  const statusColor = isStar ? T.success : isDrag ? T.error : T.dark
                  return (
                    <tr key={w.id} style={{ backgroundColor: i % 2 === 0 ? T.white : T.cream }}>
                      <td style={{ padding: '10px 12px' }}>
                        {isStar && <Star size={13} color={T.gold} fill={T.gold} />}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: T.dark }}>{w.name}</td>
                      <td style={{ padding: '10px 12px', color: T.gray }}>{w.category}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>${w.glassPrice}</td>
                      <td style={{ padding: '10px 12px', color: T.gray }}>${w.bottlePrice}</td>
                      <td style={{ padding: '10px 12px', minWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input
                            type="range" min={70} max={100} step={1}
                            value={yieldOverrides[w.id] ?? w.yieldPct}
                            onChange={e => setYieldOverrides(p => ({ ...p, [w.id]: +e.target.value }))}
                            style={{ width: 80, accentColor: T.burgundy }}
                          />
                          <span style={{ fontWeight: 700, color: (yieldOverrides[w.id] ?? w.yieldPct) < 82 ? T.error : T.dark, minWidth: 36 }}>{yieldOverrides[w.id] ?? w.yieldPct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', color: T.gray }}>${w.costPerGlass}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: statusColor }}>${w.marginPerGlass.toFixed(2)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontWeight: 700, color: statusColor, fontSize: 13 }}>{w.marginPct}%</span>
                      </td>
                      <td style={{ padding: '10px 12px', color: T.dark }}>{w.poursPerWeek}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: T.dark }}>${w.weeklyProfit.toLocaleString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stars & Drags */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {[
            { title: '⭐ Stars', items: enriched.filter(w => w.marginPct >= 60 && w.poursPerWeek >= 15), color: T.success, bg: '#F0FDF4', label: 'High margin + high volume — feature these' },
            { title: '⚠ Drags', items: enriched.filter(w => w.marginPct < 52), color: T.error, bg: '#FEF2F2', label: 'Low margin — raise price or drop from BTG' },
          ].map(({ title, items, color, bg, label }) => (
            <div key={title} style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '14px 16px', boxShadow: T.shadowSm }}>
              <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 11, color: T.gray, marginBottom: 12 }}>{label}</div>
              {items.length === 0 ? (
                <div style={{ fontSize: 12, color: T.gray, fontStyle: 'italic' }}>None currently — adjust yield sliders to model changes</div>
              ) : items.map(w => (
                <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: bg, borderRadius: 7, marginBottom: 7, border: `1px solid ${color}33` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.dark }}>{w.name}</div>
                  <span style={{ fontWeight: 700, color, fontSize: 13 }}>{w.marginPct}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* AI Optimization */}
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark }}>AI BTG Optimization Brief</div>
              <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>✨ AI · Stars to feature, drags to fix, pour standard audit</div>
            </div>
            <button onClick={generateOptimization} disabled={aiStreaming} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: T.burgundy, color: T.white, border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: aiStreaming ? 'default' : 'pointer', opacity: aiStreaming ? 0.7 : 1 }}>
              <Sparkles size={13} /> {aiStreaming ? 'Analyzing…' : aiText ? 'Refresh' : 'Optimize BTG'}
            </button>
          </div>
          {aiText ? (
            <div style={{ backgroundColor: '#FEFCE8', borderRadius: 8, padding: '14px 16px', border: `1px solid ${T.gold}44` }}>
              <MarkdownRenderer text={aiText} streaming={aiStreaming} />
            </div>
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: T.gray, fontSize: 13 }}>
              Click "Optimize BTG" to get AI recommendations on your by-the-glass program.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
