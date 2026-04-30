import Logo from '../Logo.jsx'
import MarkdownRenderer from '../MarkdownRenderer.jsx'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Anthropic from '@anthropic-ai/sdk'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from 'recharts'
import {
  Star, TrendingUp, TrendingDown, ArrowLeft,
  Key, Eye, EyeOff, Sparkles, CheckCircle, XCircle, AlertTriangle,
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

const REPS = [
  {
    id: 'rndc-james', name: 'James Whitfield', distributor: 'RNDC California', portfolio: 'Domestic Reds, Napa Focus',
    pricing: 88, delivery: 92, invoiceAccuracy: 90, sampleResponsiveness: 82, newItemAlerts: 78,
    lastVisit: '2026-04-14', orderCount: 24, notes: 'Strong on Napa allocations; slow to flag pricing changes'
  },
  {
    id: 'sgs-maria', name: 'Maria Santos', distributor: "Southern Glazer's", portfolio: 'French & Italian Imports',
    pricing: 76, delivery: 84, invoiceAccuracy: 70, sampleResponsiveness: 90, newItemAlerts: 92,
    lastVisit: '2026-04-18', orderCount: 18, notes: 'Excellent on new arrivals; invoice errors need follow-up every order'
  },
  {
    id: 'empire-david', name: 'David Chen', distributor: 'Empire Distributors', portfolio: 'Sparkling & Champagne',
    pricing: 94, delivery: 88, invoiceAccuracy: 96, sampleResponsiveness: 86, newItemAlerts: 82,
    lastVisit: '2026-04-10', orderCount: 12, notes: 'Reliable; best Champagne allocations in region'
  },
  {
    id: 'vip-sarah', name: 'Sarah Kowalski', distributor: 'VIP Wine & Spirits', portfolio: 'West Coast Whites & Rosé',
    pricing: 82, delivery: 72, invoiceAccuracy: 84, sampleResponsiveness: 68, newItemAlerts: 74,
    lastVisit: '2026-03-28', orderCount: 10, notes: 'Delivery reliability declined last 6 weeks; follow up on route changes'
  },
  {
    id: 'republic-angela', name: 'Angela Moore', distributor: 'Republic National', portfolio: 'Spirits & Dessert Wines',
    pricing: 86, delivery: 90, invoiceAccuracy: 88, sampleResponsiveness: 94, newItemAlerts: 88,
    lastVisit: '2026-04-16', orderCount: 8, notes: 'Top performer — proactive, accurate, quick samples'
  },
  {
    id: 'heritage-kevin', name: 'Kevin Marsh', distributor: 'Heritage Wine Group', portfolio: 'Boutique & Cult Allocations',
    pricing: 72, delivery: 66, invoiceAccuracy: 74, sampleResponsiveness: 70, newItemAlerts: 96,
    lastVisit: '2026-04-02', orderCount: 6, notes: 'Best allocation access in region; delivery and pricing consistency issues'
  },
]

const METRICS = ['pricing', 'delivery', 'invoiceAccuracy', 'sampleResponsiveness', 'newItemAlerts']
const METRIC_LABELS = {
  pricing: 'Pricing Accuracy',
  delivery: 'Delivery Reliability',
  invoiceAccuracy: 'Invoice Accuracy',
  sampleResponsiveness: 'Sample Responsiveness',
  newItemAlerts: 'New Item Alerts',
}

function overallScore(rep) {
  return Math.round(METRICS.reduce((s, m) => s + rep[m], 0) / METRICS.length)
}

function scoreColor(s) {
  if (s >= 88) return T.success
  if (s >= 76) return T.warning
  return T.error
}

function recommendation(rep) {
  const score = overallScore(rep)
  if (score >= 88) return { label: 'Retain & Grow', color: T.success }
  if (score >= 76) return { label: 'Monitor', color: T.warning }
  return { label: 'Performance Review', color: T.error }
}

const AI_CACHE = {}

export default function VendorScorecard() {
  const [apiKey, setApiKey] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [aiTexts, setAiTexts] = useState({})
  const [aiStreaming, setAiStreaming] = useState(null)
  const [selectedRep, setSelectedRep] = useState(null)
  const [filterDist, setFilterDist] = useState('all')

  const distributors = ['all', ...new Set(REPS.map(r => r.distributor))]
  const filtered = filterDist === 'all' ? REPS : REPS.filter(r => r.distributor === filterDist)

  async function generateSummary(rep) {
    if (!apiKey) { setSelectedRep(rep); setShowKeyModal(true); return }
    setSelectedRep(rep)
    if (AI_CACHE[rep.id]) { setAiTexts(t => ({ ...t, [rep.id]: AI_CACHE[rep.id] })); return }
    setAiStreaming(rep.id)
    setAiTexts(t => ({ ...t, [rep.id]: '' }))
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
    const score = overallScore(rep)
    const low = METRICS.filter(m => rep[m] < 80).map(m => `${METRIC_LABELS[m]}: ${rep[m]}/100`)
    const high = METRICS.filter(m => rep[m] >= 88).map(m => `${METRIC_LABELS[m]}: ${rep[m]}/100`)
    let full = ''
    try {
      const stream = await client.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 280,
        messages: [{
          role: 'user',
          content: `Beverage director evaluating a distributor rep. Write a concise rep performance summary.

Rep: ${rep.name}, ${rep.distributor}
Portfolio: ${rep.portfolio}
Overall Score: ${score}/100
Strengths: ${high.join(', ') || 'None above 88'}
Weaknesses: ${low.join(', ') || 'None below 80'}
Notes: ${rep.notes}
Last visit: ${rep.lastVisit}

Write 3 bullets: what they do well, what needs improvement, and one specific ask for next meeting. No preamble, no headers.`,
        }],
      })
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
          full += chunk.delta.text
          setAiTexts(t => ({ ...t, [rep.id]: full }))
        }
      }
      AI_CACHE[rep.id] = full
    } catch { /* silent */ }
    setAiStreaming(null)
  }

  const sortedReps = [...filtered].sort((a, b) => overallScore(b) - overallScore(a))

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
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: T.fontSerif }}>Vendor & Rep Scorecard</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>App 04 · Analytics & Intelligence · 6 Active Reps</div>
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
            <p style={{ fontSize: 13, color: T.gray, marginBottom: 16, lineHeight: 1.6 }}>Required for AI rep summaries. Stays in-browser, never stored.</p>
            <div style={{ position: 'relative' }}>
              <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-..." style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 6, border: `1px solid ${T.grayBorder}`, fontSize: 13, fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none' }} />
              <button onClick={() => setShowKey(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.gray }}>{showKey ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowKeyModal(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: `1px solid ${T.grayBorder}`, backgroundColor: T.white, color: T.dark, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={() => { setShowKeyModal(false); if (selectedRep) generateSummary(selectedRep) }} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: 'none', backgroundColor: T.burgundy, color: T.white, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>Save & Generate</button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Active Reps', value: REPS.length, sub: 'Across distributors', color: T.burgundy },
            { label: 'Top Performers', value: REPS.filter(r => overallScore(r) >= 88).length, sub: 'Score ≥88', color: T.success },
            { label: 'Under Review', value: REPS.filter(r => overallScore(r) < 76).length, sub: 'Score <76', color: T.error },
            { label: 'Avg Score', value: Math.round(REPS.reduce((s, r) => s + overallScore(r), 0) / REPS.length), sub: 'All reps', color: T.dark },
          ].map(kpi => (
            <div key={kpi.label} style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '14px 16px', boxShadow: T.shadowSm }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.gray, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color, fontFamily: T.fontSerif }}>{kpi.value}</div>
              <div style={{ fontSize: 11, color: T.gray, marginTop: 3 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {distributors.map(d => (
            <button key={d} onClick={() => setFilterDist(d)} style={{ padding: '5px 12px', borderRadius: 99, border: `1px solid ${filterDist === d ? T.burgundy : T.grayBorder}`, backgroundColor: filterDist === d ? T.burgundy : T.white, color: filterDist === d ? T.white : T.dark, fontSize: 11, fontWeight: filterDist === d ? 700 : 400, cursor: 'pointer', textTransform: d === 'all' ? 'capitalize' : 'none' }}>
              {d === 'all' ? 'All Distributors' : d}
            </button>
          ))}
        </div>

        {/* Rep Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16, marginBottom: 20 }}>
          {sortedReps.map(rep => {
            const score = overallScore(rep)
            const rec = recommendation(rep)
            const radarData = METRICS.map(m => ({ metric: METRIC_LABELS[m].replace(' ', '\n'), value: rep[m] }))
            const isOpen = selectedRep?.id === rep.id

            return (
              <div key={rep.id} style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, overflow: 'hidden', boxShadow: T.shadowSm }}>
                {/* Rep header */}
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.grayBorder}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.dark, fontFamily: T.fontSerif }}>{rep.name}</div>
                    <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>{rep.distributor}</div>
                    <div style={{ fontSize: 11, color: T.gray }}>{rep.portfolio}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: scoreColor(score), fontFamily: T.fontSerif }}>{score}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, backgroundColor: rec.color + '18', color: rec.color }}>{rec.label}</span>
                  </div>
                </div>

                {/* Radar */}
                <div style={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                      <PolarGrid stroke={T.grayBorder} />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: T.gray }} />
                      <Radar dataKey="value" stroke={scoreColor(score)} fill={scoreColor(score)} fillOpacity={0.15} />
                      <Tooltip formatter={v => `${v}/100`} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Metric pills */}
                <div style={{ padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: 6, borderTop: `1px solid ${T.grayBorder}` }}>
                  {METRICS.map(m => (
                    <span key={m} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, backgroundColor: rep[m] >= 88 ? '#F0FDF4' : rep[m] >= 76 ? '#FFFBEB' : '#FEF2F2', color: rep[m] >= 88 ? T.success : rep[m] >= 76 ? T.warning : T.error }}>
                      {METRIC_LABELS[m].split(' ')[0]}: {rep[m]}
                    </span>
                  ))}
                </div>

                {/* Notes & AI */}
                <div style={{ padding: '10px 14px', borderTop: `1px solid ${T.grayBorder}` }}>
                  <div style={{ fontSize: 11, color: T.gray, marginBottom: 8 }}>{rep.notes}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: T.gray }}>Last visit: {rep.lastVisit}</span>
                    <button
                      onClick={() => generateSummary(rep)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: T.burgundy, color: T.white, border: 'none', borderRadius: 5, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                    >
                      <Sparkles size={10} /> {aiTexts[rep.id] ? 'Refresh' : 'AI Summary'}
                    </button>
                  </div>
                  {aiStreaming === rep.id || aiTexts[rep.id] ? (
                    <div style={{ marginTop: 10, backgroundColor: '#FEFCE8', borderRadius: 7, padding: '10px 12px', border: `1px solid ${T.gold}44` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.gold, marginBottom: 6 }}>✨ AI Rep Summary</div>
                      <MarkdownRenderer text={aiTexts[rep.id] || ''} streaming={aiStreaming === rep.id} />
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
