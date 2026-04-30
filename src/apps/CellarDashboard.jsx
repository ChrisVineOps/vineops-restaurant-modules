import Logo from '../Logo.jsx'
import MarkdownRenderer from '../MarkdownRenderer.jsx'
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Anthropic from '@anthropic-ai/sdk'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  Archive, AlertTriangle, CheckCircle, Clock, ArrowLeft,
  Key, Eye, EyeOff, Sparkles, Filter,
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

const NOW_YEAR = 2026

const CELLAR = [
  // Napa Cabernet
  { id: 1, name: 'Caymus Special Selection Cabernet', region: 'Napa Valley', variety: 'Cabernet Sauvignon', vintage: 2019, qty: 6, costPerBottle: 180, reservePrice: 380, windowStart: 2022, windowEnd: 2034 },
  { id: 2, name: 'Opus One', region: 'Napa Valley', variety: 'Cabernet Sauvignon', vintage: 2018, qty: 3, costPerBottle: 340, reservePrice: 650, windowStart: 2023, windowEnd: 2038 },
  { id: 3, name: 'Stag\'s Leap Wine Cellars Cask 23', region: 'Napa Valley', variety: 'Cabernet Sauvignon', vintage: 2017, qty: 4, costPerBottle: 220, reservePrice: 450, windowStart: 2022, windowEnd: 2032 },
  { id: 4, name: 'Heitz Martha\'s Vineyard Cab', region: 'Napa Valley', variety: 'Cabernet Sauvignon', vintage: 2016, qty: 2, costPerBottle: 165, reservePrice: 340, windowStart: 2021, windowEnd: 2031 },
  { id: 5, name: 'Beringer Private Reserve Cab', region: 'Napa Valley', variety: 'Cabernet Sauvignon', vintage: 2020, qty: 8, costPerBottle: 95, reservePrice: 195, windowStart: 2024, windowEnd: 2035 },
  // Burgundy
  { id: 6, name: 'Domaine de la Romanée-Conti La Tâche', region: 'Burgundy', variety: 'Pinot Noir', vintage: 2015, qty: 1, costPerBottle: 3200, reservePrice: 6500, windowStart: 2025, windowEnd: 2045 },
  { id: 7, name: 'Louis Jadot Chambolle-Musigny 1er', region: 'Burgundy', variety: 'Pinot Noir', vintage: 2018, qty: 6, costPerBottle: 95, reservePrice: 210, windowStart: 2024, windowEnd: 2033 },
  { id: 8, name: 'Faiveley Gevrey-Chambertin', region: 'Burgundy', variety: 'Pinot Noir', vintage: 2017, qty: 4, costPerBottle: 78, reservePrice: 165, windowStart: 2022, windowEnd: 2030 },
  { id: 9, name: 'Domaine Leflaive Puligny-Montrachet', region: 'Burgundy', variety: 'Chardonnay', vintage: 2019, qty: 5, costPerBottle: 145, reservePrice: 295, windowStart: 2024, windowEnd: 2032 },
  // Bordeaux
  { id: 10, name: 'Château Margaux', region: 'Bordeaux', variety: 'Cabernet Sauvignon Blend', vintage: 2015, qty: 2, costPerBottle: 580, reservePrice: 1100, windowStart: 2025, windowEnd: 2055 },
  { id: 11, name: 'Château Lynch-Bages', region: 'Bordeaux', variety: 'Cabernet Sauvignon Blend', vintage: 2016, qty: 4, costPerBottle: 140, reservePrice: 295, windowStart: 2024, windowEnd: 2040 },
  { id: 12, name: 'Château Léoville-Barton', region: 'Bordeaux', variety: 'Cabernet Sauvignon Blend', vintage: 2017, qty: 6, costPerBottle: 88, reservePrice: 185, windowStart: 2025, windowEnd: 2038 },
  // Italy
  { id: 13, name: 'Gaja Barbaresco', region: 'Piedmont', variety: 'Nebbiolo', vintage: 2016, qty: 3, costPerBottle: 195, reservePrice: 385, windowStart: 2023, windowEnd: 2038 },
  { id: 14, name: 'Sassicaia Bolgheri', region: 'Tuscany', variety: 'Cabernet Sauvignon Blend', vintage: 2018, qty: 4, costPerBottle: 210, reservePrice: 420, windowStart: 2024, windowEnd: 2040 },
  { id: 15, name: 'Brunello di Montalcino Biondi-Santi', region: 'Tuscany', variety: 'Sangiovese', vintage: 2016, qty: 3, costPerBottle: 180, reservePrice: 360, windowStart: 2025, windowEnd: 2045 },
  { id: 16, name: 'Barolo Giacomo Conterno', region: 'Piedmont', variety: 'Nebbiolo', vintage: 2015, qty: 2, costPerBottle: 220, reservePrice: 450, windowStart: 2022, windowEnd: 2042 },
  // Champagne
  { id: 17, name: 'Dom Pérignon', region: 'Champagne', variety: 'Champagne Blend', vintage: 2013, qty: 8, costPerBottle: 210, reservePrice: 420, windowStart: 2022, windowEnd: 2033 },
  { id: 18, name: 'Krug Grande Cuvée 170th', region: 'Champagne', variety: 'Champagne Blend', vintage: 'NV', qty: 4, costPerBottle: 185, reservePrice: 370, windowStart: 2022, windowEnd: 2030 },
  { id: 19, name: 'Salon Blanc de Blancs', region: 'Champagne', variety: 'Chardonnay', vintage: 2012, qty: 2, costPerBottle: 450, reservePrice: 880, windowStart: 2024, windowEnd: 2040 },
  // Rhône
  { id: 20, name: 'Château Rayas Châteauneuf-du-Pape', region: 'Rhône Valley', variety: 'Grenache', vintage: 2017, qty: 2, costPerBottle: 320, reservePrice: 640, windowStart: 2025, windowEnd: 2040 },
  { id: 21, name: 'E. Guigal La Mouline', region: 'Rhône Valley', variety: 'Syrah', vintage: 2016, qty: 3, costPerBottle: 225, reservePrice: 460, windowStart: 2023, windowEnd: 2038 },
  // California White
  { id: 22, name: 'Kistler Vineyard Chardonnay', region: 'Sonoma', variety: 'Chardonnay', vintage: 2020, qty: 6, costPerBottle: 72, reservePrice: 155, windowStart: 2023, windowEnd: 2030 },
  { id: 23, name: 'Peter Michael Mon Plaisir Chard', region: 'Sonoma', variety: 'Chardonnay', vintage: 2019, qty: 4, costPerBottle: 95, reservePrice: 200, windowStart: 2022, windowEnd: 2029 },
  // Dessert
  { id: 24, name: 'Ch. d\'Yquem Sauternes', region: 'Sauternes', variety: 'Sémillon Blend', vintage: 2016, qty: 3, costPerBottle: 380, reservePrice: 720, windowStart: 2024, windowEnd: 2060 },
  // Oregon Pinot
  { id: 25, name: 'Eyrie Vineyards South Block Pinot', region: 'Willamette Valley', variety: 'Pinot Noir', vintage: 2019, qty: 6, costPerBottle: 68, reservePrice: 145, windowStart: 2023, windowEnd: 2032 },
  { id: 26, name: 'Adelsheim Bryan Creek Pinot Noir', region: 'Willamette Valley', variety: 'Pinot Noir', vintage: 2020, qty: 8, costPerBottle: 48, reservePrice: 105, windowStart: 2024, windowEnd: 2033 },
  // Spain
  { id: 27, name: 'Vega Sicilia Único', region: 'Ribera del Duero', variety: 'Tempranillo Blend', vintage: 2011, qty: 2, costPerBottle: 280, reservePrice: 560, windowStart: 2021, windowEnd: 2045 },
  { id: 28, name: 'Muga Prado Enea Gran Reserva', region: 'Rioja', variety: 'Tempranillo Blend', vintage: 2015, qty: 4, costPerBottle: 68, reservePrice: 145, windowStart: 2022, windowEnd: 2035 },
  // Germany
  { id: 29, name: 'Egon Müller Scharzhofberger Spätlese', region: 'Mosel', variety: 'Riesling', vintage: 2018, qty: 5, costPerBottle: 120, reservePrice: 245, windowStart: 2023, windowEnd: 2038 },
  // Australia
  { id: 30, name: 'Penfolds Grange', region: 'South Australia', variety: 'Shiraz Blend', vintage: 2017, qty: 3, costPerBottle: 290, reservePrice: 580, windowStart: 2025, windowEnd: 2045 },
]

function getWindowStatus(wine) {
  const v = parseInt(wine.vintage) || NOW_YEAR
  if (NOW_YEAR < wine.windowStart) return 'young'
  if (NOW_YEAR > wine.windowEnd) return 'past'
  return 'ready'
}

const REGIONS = ['All', 'Napa Valley', 'Burgundy', 'Bordeaux', 'Tuscany', 'Piedmont', 'Champagne', 'Rhône Valley', 'Willamette Valley', 'Sonoma', 'Other']

export default function CellarDashboard() {
  const [apiKey, setApiKey] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiStreaming, setAiStreaming] = useState(false)
  const [filterRegion, setFilterRegion] = useState('All')
  const [filterStatus, setFilterStatus] = useState('all')

  const enriched = useMemo(() => CELLAR.map(w => ({ ...w, status: getWindowStatus(w), reserveValue: w.reservePrice * w.qty, costValue: w.costPerBottle * w.qty })), [])

  const filtered = useMemo(() => {
    let base = enriched
    if (filterStatus !== 'all') base = base.filter(w => w.status === filterStatus)
    if (filterRegion !== 'All') {
      const knownRegions = ['Napa Valley', 'Burgundy', 'Bordeaux', 'Tuscany', 'Piedmont', 'Champagne', 'Rhône Valley', 'Willamette Valley', 'Sonoma']
      base = filterRegion === 'Other'
        ? base.filter(w => !knownRegions.includes(w.region))
        : base.filter(w => w.region === filterRegion)
    }
    return base
  }, [enriched, filterRegion, filterStatus])

  const totalBottles = enriched.reduce((s, w) => s + w.qty, 0)
  const totalCostValue = enriched.reduce((s, w) => s + w.costValue, 0)
  const totalReserveValue = enriched.reduce((s, w) => s + w.reserveValue, 0)
  const readyNow = enriched.filter(w => w.status === 'ready').reduce((s, w) => s + w.qty, 0)
  const pastPeak = enriched.filter(w => w.status === 'past')

  const regionData = [...new Set(enriched.map(w => w.region))].map(r => ({
    name: r.length > 14 ? r.slice(0, 14) + '…' : r,
    bottles: enriched.filter(w => w.region === r).reduce((s, w) => s + w.qty, 0),
    value: enriched.filter(w => w.region === r).reduce((s, w) => s + w.reserveValue, 0),
  })).sort((a, b) => b.value - a.value).slice(0, 8)

  async function generateMemo() {
    if (!apiKey) { setShowKeyModal(true); return }
    setAiText('')
    setAiStreaming(true)
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
    const ready = enriched.filter(w => w.status === 'ready').slice(0, 6)
    const needReorder = enriched.filter(w => w.qty <= 2 && w.status === 'ready')
    let full = ''
    try {
      const stream = await client.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `Fine-dining sommelier cellar review. Generate a concise cellar management memo.

Cellar summary: ${totalBottles} bottles, $${totalCostValue.toLocaleString()} cost value, $${totalReserveValue.toLocaleString()} reserve list value
In drinking window now: ${readyNow} bottles
Past peak (act now): ${pastPeak.map(w => w.name).join(', ') || 'None'}
Low stock (≤2 btl) in window: ${needReorder.map(w => `${w.name} (${w.qty} left)`).join(', ') || 'None'}
Featured ready bottles: ${ready.map(w => `${w.name} ${w.vintage}`).join(', ')}

Write: ## Sell Now (past peak), ## Feature This Month (ready & high value), ## Reorder Priority. 2-3 bullets each. No preamble.`,
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

  const statusColors = { ready: T.success, young: '#2563EB', past: T.error }
  const statusLabels = { ready: 'In Window', young: 'Too Young', past: 'Past Peak' }

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
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: T.fontSerif }}>Cellar Inventory Dashboard</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>App 05 · Analytics & Intelligence · {totalBottles} Bottles · {CELLAR.length} SKUs</div>
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
            <p style={{ fontSize: 13, color: T.gray, marginBottom: 16, lineHeight: 1.6 }}>Required for AI cellar memo. Stays in-browser, never stored.</p>
            <div style={{ position: 'relative' }}>
              <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-..." style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 6, border: `1px solid ${T.grayBorder}`, fontSize: 13, fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none' }} />
              <button onClick={() => setShowKey(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.gray }}>{showKey ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowKeyModal(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: `1px solid ${T.grayBorder}`, backgroundColor: T.white, color: T.dark, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={() => { setShowKeyModal(false); generateMemo() }} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: 'none', backgroundColor: T.burgundy, color: T.white, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>Save & Generate</button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Total Bottles', value: totalBottles, sub: `${CELLAR.length} SKUs`, color: T.burgundy },
            { label: 'Reserve List Value', value: `$${(totalReserveValue / 1000).toFixed(0)}K`, sub: 'At menu price', color: T.success },
            { label: 'Cellar Cost', value: `$${(totalCostValue / 1000).toFixed(0)}K`, sub: 'At landed cost', color: T.dark },
            { label: 'Past Peak', value: pastPeak.length, sub: 'SKUs — sell now', color: pastPeak.length > 0 ? T.error : T.gray },
          ].map(kpi => (
            <div key={kpi.label} style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '14px 16px', boxShadow: T.shadowSm }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.gray, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color, fontFamily: T.fontSerif }}>{kpi.value}</div>
              <div style={{ fontSize: 11, color: T.gray, marginTop: 3 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Region chart */}
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm }}>
            <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark, marginBottom: 14 }}>Reserve List Value by Region (Top 8)</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={regionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={T.grayBorder} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: T.gray }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: T.gray }} width={90} />
                <Tooltip formatter={v => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" name="Reserve Value" fill={T.burgundy} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Past peak alert */}
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm }}>
            <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark, marginBottom: 14 }}>
              {pastPeak.length > 0 ? '⚠ Past Peak — Sell Now' : '✓ No Past-Peak Wines'}
            </div>
            {pastPeak.length === 0 ? (
              <div style={{ fontSize: 13, color: T.gray, fontStyle: 'italic' }}>All cellar wines are within or before their drinking window.</div>
            ) : pastPeak.map(w => (
              <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', backgroundColor: '#FEF2F2', borderRadius: 7, marginBottom: 8, border: `1px solid ${T.error}33` }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.dark }}>{w.name}</div>
                  <div style={{ fontSize: 10, color: T.gray }}>{w.vintage} · {w.qty} btl · window closed {w.windowEnd}</div>
                </div>
                <span style={{ fontWeight: 700, color: T.error, fontSize: 13 }}>${w.reservePrice}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters + Table */}
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, overflow: 'hidden', boxShadow: T.shadowSm, marginBottom: 20 }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.grayBorder}`, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={13} color={T.gray} />
            {['all', 'ready', 'young', 'past'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '4px 10px', borderRadius: 99, border: `1px solid ${filterStatus === s ? T.burgundy : T.grayBorder}`, backgroundColor: filterStatus === s ? T.burgundy : T.white, color: filterStatus === s ? T.white : T.dark, fontSize: 11, fontWeight: filterStatus === s ? 700 : 400, cursor: 'pointer', textTransform: 'capitalize' }}>
                {s === 'all' ? 'All' : statusLabels[s]}
              </button>
            ))}
            <div style={{ width: 1, height: 20, backgroundColor: T.grayBorder, margin: '0 4px' }} />
            {['All', 'Napa Valley', 'Burgundy', 'Bordeaux', 'Champagne', 'Tuscany', 'Other'].map(r => (
              <button key={r} onClick={() => setFilterRegion(r)} style={{ padding: '4px 10px', borderRadius: 99, border: `1px solid ${filterRegion === r ? T.gold : T.grayBorder}`, backgroundColor: filterRegion === r ? T.gold : T.white, color: filterRegion === r ? '#7C4700' : T.dark, fontSize: 11, cursor: 'pointer' }}>
                {r}
              </button>
            ))}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: T.cream }}>
                  {['', 'Wine', 'Region', 'Variety', 'Vintage', 'Qty', 'Cost/Btl', 'Reserve $', 'Window', 'Status'].map(h => (
                    <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.gray, borderBottom: `2px solid ${T.grayBorder}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((w, i) => {
                  const sc = statusColors[w.status]
                  return (
                    <tr key={w.id} style={{ backgroundColor: i % 2 === 0 ? T.white : T.cream }}>
                      <td style={{ padding: '9px 12px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: sc }} />
                      </td>
                      <td style={{ padding: '9px 12px', fontWeight: 700, color: T.dark, maxWidth: 220 }}>{w.name}</td>
                      <td style={{ padding: '9px 12px', color: T.gray, whiteSpace: 'nowrap' }}>{w.region}</td>
                      <td style={{ padding: '9px 12px', color: T.gray }}>{w.variety}</td>
                      <td style={{ padding: '9px 12px', color: T.dark, fontWeight: 600 }}>{w.vintage}</td>
                      <td style={{ padding: '9px 12px' }}>
                        <span style={{ fontWeight: 700, color: w.qty <= 2 ? T.error : T.dark }}>{w.qty}</span>
                      </td>
                      <td style={{ padding: '9px 12px', color: T.gray }}>${w.costPerBottle.toLocaleString()}</td>
                      <td style={{ padding: '9px 12px', fontWeight: 700, color: T.dark }}>${w.reservePrice.toLocaleString()}</td>
                      <td style={{ padding: '9px 12px', color: T.gray, fontSize: 11 }}>{w.windowStart}–{w.windowEnd}</td>
                      <td style={{ padding: '9px 12px' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, backgroundColor: sc + '18', color: sc }}>
                          {statusLabels[w.status]}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Memo */}
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark }}>AI Cellar Memo</div>
              <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>✨ AI · Sell now, feature this month, reorder priority</div>
            </div>
            <button onClick={generateMemo} disabled={aiStreaming} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: T.burgundy, color: T.white, border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: aiStreaming ? 'default' : 'pointer', opacity: aiStreaming ? 0.7 : 1 }}>
              <Sparkles size={13} /> {aiStreaming ? 'Generating…' : aiText ? 'Refresh' : 'Generate Memo'}
            </button>
          </div>
          {aiText ? (
            <div style={{ backgroundColor: '#FEFCE8', borderRadius: 8, padding: '14px 16px', border: `1px solid ${T.gold}44` }}>
              <MarkdownRenderer text={aiText} streaming={aiStreaming} />
            </div>
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: T.gray, fontSize: 13 }}>
              Click "Generate Memo" for a cellar management action brief — what to sell now, feature this month, and reorder.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
