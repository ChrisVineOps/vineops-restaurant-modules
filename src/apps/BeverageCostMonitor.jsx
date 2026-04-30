import Logo from '../Logo.jsx'
import MarkdownRenderer from '../MarkdownRenderer.jsx'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Anthropic from '@anthropic-ai/sdk'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from 'recharts'
import {
  TrendingDown, TrendingUp, AlertTriangle, ArrowLeft,
  Key, Eye, EyeOff, Sparkles, CheckCircle,
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

const CATEGORIES = [
  { id: 'red',       label: 'Red Wine',     target: 32, color: '#7C2D12' },
  { id: 'white',     label: 'White Wine',   target: 30, color: '#92400E' },
  { id: 'sparkling', label: 'Sparkling',    target: 28, color: '#C4A75E' },
  { id: 'spirits',   label: 'Spirits',      target: 22, color: '#1D4ED8' },
  { id: 'beer',      label: 'Beer',         target: 25, color: '#15803D' },
]

// 8 weeks of pour cost % data
const WEEKS = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Wk 8']

const WEEKLY_DATA = [
  { week: 'Wk 1', red: 30.2, white: 28.8, sparkling: 26.1, spirits: 20.4, beer: 24.1 },
  { week: 'Wk 2', red: 31.0, white: 29.4, sparkling: 26.8, spirits: 21.0, beer: 23.8 },
  { week: 'Wk 3', red: 30.8, white: 30.1, sparkling: 27.5, spirits: 21.8, beer: 24.5 },
  { week: 'Wk 4', red: 32.4, white: 30.6, sparkling: 27.1, spirits: 22.1, beer: 25.2 },
  { week: 'Wk 5', red: 33.1, white: 31.2, sparkling: 28.4, spirits: 22.8, beer: 25.0 },
  { week: 'Wk 6', red: 34.2, white: 31.8, sparkling: 29.0, spirits: 23.4, beer: 24.8 },
  { week: 'Wk 7', red: 35.0, white: 32.4, sparkling: 28.7, spirits: 23.0, beer: 25.6 },
  { week: 'Wk 8', red: 36.1, white: 33.0, sparkling: 27.9, spirits: 22.6, beer: 26.2 },
]

function getCurrentCost(catId) {
  return WEEKLY_DATA[WEEKLY_DATA.length - 1][catId]
}

function getStatus(catId) {
  const cat = CATEGORIES.find(c => c.id === catId)
  const cur = getCurrentCost(catId)
  if (cur <= cat.target) return 'ok'
  if (cur <= cat.target * 1.06) return 'warn'
  return 'over'
}

export default function BeverageCostMonitor() {
  const [apiKey, setApiKey] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiStreaming, setAiStreaming] = useState(false)
  const [selectedCat, setSelectedCat] = useState('red')

  async function generateBrief() {
    if (!apiKey) { setShowKeyModal(true); return }
    setAiText('')
    setAiStreaming(true)
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
    const overTarget = CATEGORIES.filter(c => getStatus(c.id) !== 'ok')
    let full = ''
    try {
      const stream = await client.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 350,
        messages: [{
          role: 'user',
          content: `You are a beverage consultant for an independent fine-dining restaurant. The beverage director needs a concise action brief.

Categories over target this week:
${overTarget.map(c => `- ${c.label}: actual ${getCurrentCost(c.id).toFixed(1)}% vs target ${c.target}%`).join('\n')}

Categories on target: ${CATEGORIES.filter(c => getStatus(c.id) === 'ok').map(c => c.label).join(', ')}

Write a 3-section brief: ## What's Driving It, ## Immediate Actions (3 bullets), ## This Week's Priority. Be specific, practical, and direct. No preamble.`,
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

  const catData = CATEGORIES.map(c => ({
    label: c.label,
    actual: getCurrentCost(c.id),
    target: c.target,
    status: getStatus(c.id),
    color: c.color,
  }))

  const overCount = CATEGORIES.filter(c => getStatus(c.id) === 'over').length
  const warnCount = CATEGORIES.filter(c => getStatus(c.id) === 'warn').length
  const okCount = CATEGORIES.filter(c => getStatus(c.id) === 'ok').length
  const selectedCatObj = CATEGORIES.find(c => c.id === selectedCat)

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
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: T.fontSerif }}>Beverage Cost Monitor</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>App 01 · Analytics & Intelligence · Week of Apr 20, 2026</div>
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
            <p style={{ fontSize: 13, color: T.gray, marginBottom: 16, lineHeight: 1.6 }}>Required for AI-generated action briefs. Stays in-browser, never stored.</p>
            <div style={{ position: 'relative' }}>
              <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-..." style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 6, border: `1px solid ${T.grayBorder}`, fontSize: 13, fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none' }} />
              <button onClick={() => setShowKey(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.gray }}>{showKey ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowKeyModal(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: `1px solid ${T.grayBorder}`, backgroundColor: T.white, color: T.dark, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={() => { setShowKeyModal(false); generateBrief() }} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: 'none', backgroundColor: T.burgundy, color: T.white, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>Save & Generate</button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Over Target', value: overCount, sub: 'Categories', color: T.error },
            { label: 'Watch List', value: warnCount, sub: 'Near threshold', color: T.warning },
            { label: 'On Target', value: okCount, sub: 'Categories', color: T.success },
            { label: 'Red Wine Cost', value: `${getCurrentCost('red').toFixed(1)}%`, sub: `Target: ${CATEGORIES[0].target}%`, color: getCurrentCost('red') > CATEGORIES[0].target ? T.error : T.success },
          ].map(kpi => (
            <div key={kpi.label} style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '14px 16px', boxShadow: T.shadowSm }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.gray, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color, fontFamily: T.fontSerif }}>{kpi.value}</div>
              <div style={{ fontSize: 11, color: T.gray, marginTop: 3 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Bar chart: actual vs target */}
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm }}>
            <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark, marginBottom: 14 }}>Current Week — Actual vs Target Pour Cost %</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.grayBorder} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: T.gray }} />
                <YAxis tick={{ fontSize: 10, fill: T.gray }} unit="%" domain={[0, 42]} />
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="target" name="Target" fill={T.grayBorder} radius={[3, 3, 0, 0]} />
                <Bar dataKey="actual" name="Actual" radius={[3, 3, 0, 0]}>
                  {catData.map((entry, i) => (
                    <Bar key={i} fill={entry.status === 'ok' ? T.success : entry.status === 'warn' ? T.warning : T.error} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status cards */}
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm }}>
            <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark, marginBottom: 14 }}>Category Status</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CATEGORIES.map(cat => {
                const cur = getCurrentCost(cat.id)
                const status = getStatus(cat.id)
                const delta = (cur - cat.target).toFixed(1)
                const statusColor = status === 'ok' ? T.success : status === 'warn' ? T.warning : T.error
                return (
                  <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', backgroundColor: T.cream, borderRadius: 8, border: `1px solid ${statusColor}33` }}>
                    {status === 'ok' ? <CheckCircle size={14} color={T.success} /> : <AlertTriangle size={14} color={statusColor} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.dark }}>{cat.label}</div>
                      <div style={{ fontSize: 11, color: T.gray }}>Target: {cat.target}%</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: statusColor }}>{cur.toFixed(1)}%</div>
                      <div style={{ fontSize: 10, color: statusColor, fontWeight: 600 }}>{delta > 0 ? `+${delta}` : delta}pp</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Trend chart */}
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark }}>8-Week Trend</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCat(cat.id)} style={{ padding: '4px 10px', borderRadius: 99, border: `1px solid ${selectedCat === cat.id ? cat.color : T.grayBorder}`, backgroundColor: selectedCat === cat.id ? cat.color : T.white, color: selectedCat === cat.id ? T.white : T.dark, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={WEEKLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.grayBorder} vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: T.gray }} />
              <YAxis tick={{ fontSize: 10, fill: T.gray }} unit="%" domain={['auto', 'auto']} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <ReferenceLine y={selectedCatObj.target} stroke={T.success} strokeDasharray="4 4" label={{ value: 'Target', fontSize: 10, fill: T.success }} />
              <Line type="monotone" dataKey={selectedCat} stroke={selectedCatObj.color} strokeWidth={2.5} dot={{ r: 3 }} name={selectedCatObj.label} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI Brief */}
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark }}>AI Action Brief</div>
              <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>✨ AI · Generated from current period data</div>
            </div>
            <button onClick={generateBrief} disabled={aiStreaming} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: T.burgundy, color: T.white, border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: aiStreaming ? 'default' : 'pointer', opacity: aiStreaming ? 0.7 : 1 }}>
              <Sparkles size={13} /> {aiStreaming ? 'Generating…' : aiText ? 'Regenerate' : 'Generate Brief'}
            </button>
          </div>
          {aiText ? (
            <div style={{ backgroundColor: '#FEFCE8', borderRadius: 8, padding: '14px 16px', border: `1px solid ${T.gold}44` }}>
              <MarkdownRenderer text={aiText} streaming={aiStreaming} />
            </div>
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: T.gray, fontSize: 13 }}>
              Click "Generate Brief" to get AI-powered cost reduction recommendations for this period.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
