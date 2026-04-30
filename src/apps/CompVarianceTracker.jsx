import Logo from '../Logo.jsx'
import MarkdownRenderer from '../MarkdownRenderer.jsx'
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Anthropic from '@anthropic-ai/sdk'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  FileWarning, Plus, ArrowLeft, Key, Eye, EyeOff, Sparkles, Trash2,
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

const COMP_TYPES = ['Manager Comp', 'Staff Tasting', 'Bottle Breakage', 'Over-Pour', 'Return/Refused', 'Event Sample']
const SERVERS = ['Alex R.', 'Maria L.', 'James T.', 'Sophie K.', 'Chris M.', 'Dana H.', 'Tyler W.', 'Priya S.']
const WINES_LIST = [
  'Rombauer Chardonnay', 'Caymus Cabernet', 'Veuve Clicquot', 'Meiomi Pinot Noir',
  'Whispering Angel Rosé', 'Duckhorn Merlot', 'Schramsberg Blanc de Blancs',
  'Cloudy Bay Sauvignon Blanc', 'Louis Jadot Chambolle-Musigny', 'Sonoma-Cutrer Chardonnay',
]

function randomDate(daysAgo) {
  const d = new Date(2026, 3, 30)
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo))
  return d.toISOString().slice(0, 10)
}

const SEED_LOG = [
  { id: 1, date: '2026-04-30', type: 'Manager Comp', item: 'Rombauer Chardonnay', qty: 1, cost: 42, server: 'Alex R.', reason: 'Anniversary couple, VIP guests' },
  { id: 2, date: '2026-04-30', type: 'Staff Tasting', item: 'Veuve Clicquot', qty: 1, cost: 62, server: 'Maria L.', reason: 'New staff onboarding tasting' },
  { id: 3, date: '2026-04-29', type: 'Bottle Breakage', item: 'Caymus Cabernet', qty: 1, cost: 89, server: 'James T.', reason: 'Dropped during service' },
  { id: 4, date: '2026-04-29', type: 'Manager Comp', item: 'Schramsberg Blanc de Blancs', qty: 1, cost: 44, server: 'Sophie K.', reason: '30-min table wait apology' },
  { id: 5, date: '2026-04-28', type: 'Over-Pour', item: 'Meiomi Pinot Noir', qty: 2, cost: 24, server: 'Alex R.', reason: 'Estimated over-pour on BTG' },
  { id: 6, date: '2026-04-28', type: 'Return/Refused', item: 'Louis Jadot Chambolle-Musigny', qty: 1, cost: 95, server: 'Chris M.', reason: 'Guest refused: believed corked' },
  { id: 7, date: '2026-04-27', type: 'Manager Comp', item: 'Whispering Angel Rosé', qty: 1, cost: 34, server: 'Dana H.', reason: 'Incorrect order — kitchen error' },
  { id: 8, date: '2026-04-27', type: 'Staff Tasting', item: 'Cloudy Bay Sauvignon Blanc', qty: 2, cost: 29, server: 'Tyler W.', reason: 'Monthly BTG program training' },
  { id: 9, date: '2026-04-26', type: 'Event Sample', item: 'Duckhorn Merlot', qty: 2, cost: 52, server: 'Priya S.', reason: 'Wine dinner preview tasting' },
  { id: 10, date: '2026-04-26', type: 'Manager Comp', item: 'Caymus Cabernet', qty: 1, cost: 89, server: 'James T.', reason: 'Birthday celebration guests' },
  { id: 11, date: '2026-04-25', type: 'Over-Pour', item: 'Rombauer Chardonnay', qty: 3, cost: 42, server: 'Maria L.', reason: 'BTG over-pour estimate' },
  { id: 12, date: '2026-04-25', type: 'Bottle Breakage', item: 'Sonoma-Cutrer Chardonnay', qty: 1, cost: 36, server: 'Sophie K.', reason: 'Storage accident — cellar' },
  { id: 13, date: '2026-04-24', type: 'Manager Comp', item: 'Veuve Clicquot', qty: 1, cost: 62, server: 'Chris M.', reason: 'Wedding proposal — house policy' },
  { id: 14, date: '2026-04-24', type: 'Staff Tasting', item: 'Schramsberg Blanc de Blancs', qty: 1, cost: 44, server: 'Dana H.', reason: 'New BTG addition training' },
  { id: 15, date: '2026-04-23', type: 'Return/Refused', item: 'Meiomi Pinot Noir', qty: 1, cost: 24, server: 'Alex R.', reason: 'Guest changed mind after pour' },
  { id: 16, date: '2026-04-23', type: 'Event Sample', item: 'Rombauer Chardonnay', qty: 2, cost: 42, server: 'Tyler W.', reason: 'Private dining room demo' },
  { id: 17, date: '2026-04-22', type: 'Manager Comp', item: 'Whispering Angel Rosé', qty: 1, cost: 34, server: 'Priya S.', reason: 'Long wait during POS outage' },
  { id: 18, date: '2026-04-22', type: 'Over-Pour', item: 'Cloudy Bay Sauvignon Blanc', qty: 4, cost: 29, server: 'James T.', reason: 'Estimated from inventory count variance' },
  { id: 19, date: '2026-04-21', type: 'Bottle Breakage', item: 'Duckhorn Merlot', qty: 1, cost: 52, server: 'Maria L.', reason: 'Ice bucket accident' },
  { id: 20, date: '2026-04-21', type: 'Manager Comp', item: 'Caymus Cabernet', qty: 1, cost: 89, server: 'Sophie K.', reason: 'Regular VIP guest recognition' },
]

const TYPE_COLORS = {
  'Manager Comp':   '#6B1F2A',
  'Staff Tasting':  '#C4A75E',
  'Bottle Breakage':'#DC2626',
  'Over-Pour':      '#D97706',
  'Return/Refused': '#2563EB',
  'Event Sample':   '#16A34A',
}

export default function CompVarianceTracker() {
  const [apiKey, setApiKey] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiStreaming, setAiStreaming] = useState(false)
  const [log, setLog] = useState(SEED_LOG)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ date: '2026-04-30', type: COMP_TYPES[0], item: WINES_LIST[0], qty: 1, cost: 0, server: SERVERS[0], reason: '' })

  function addEntry() {
    if (!form.reason) return
    setLog(l => [{ ...form, id: Date.now(), cost: +form.cost, qty: +form.qty }, ...l])
    setShowForm(false)
    setForm({ date: '2026-04-30', type: COMP_TYPES[0], item: WINES_LIST[0], qty: 1, cost: 0, server: SERVERS[0], reason: '' })
  }

  function removeEntry(id) { setLog(l => l.filter(x => x.id !== id)) }

  const totalCost = useMemo(() => log.reduce((s, e) => s + e.cost * e.qty, 0), [log])
  const byType = useMemo(() => COMP_TYPES.map(t => ({ name: t, value: log.filter(e => e.type === t).reduce((s, e) => s + e.cost * e.qty, 0) })).filter(x => x.value > 0), [log])
  const byServer = useMemo(() => {
    const m = {}
    log.forEach(e => { m[e.server] = (m[e.server] || 0) + e.cost * e.qty })
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }, [log])

  async function generateMemo() {
    if (!apiKey) { setShowKeyModal(true); return }
    setAiText('')
    setAiStreaming(true)
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
    const topServer = byServer[0]
    const topType = [...byType].sort((a, b) => b.value - a.value)[0]
    let full = ''
    try {
      const stream = await client.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 350,
        messages: [{
          role: 'user',
          content: `Write an end-of-period beverage variance memo for restaurant ownership.

Period: April 2026 (30 days)
Total variance cost: $${totalCost.toLocaleString()}
Total entries: ${log.length}
Largest cost category: ${topType?.name} ($${topType?.value.toLocaleString()})
Highest comp server: ${topServer?.[0]} ($${topServer?.[1].toLocaleString()})
Category breakdown: ${byType.map(t => `${t.name}: $${t.value}`).join(', ')}

Write 3 sections: ## Period Summary (2 sentences, factual), ## Areas of Concern (2 bullets), ## Recommended Policy Actions (2 bullets). Professional tone, no preamble.`,
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
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: T.fontSerif }}>Comp & Variance Tracker</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>App 09 · AI-Augmented Automation · 30-Day Rolling Log</div>
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
            <p style={{ fontSize: 13, color: T.gray, marginBottom: 16, lineHeight: 1.6 }}>Required for AI variance memo. Stays in-browser, never stored.</p>
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
            { label: 'Total Variance Cost', value: `$${totalCost.toLocaleString()}`, sub: '30-day period', color: totalCost > 1500 ? T.error : T.warning },
            { label: 'Log Entries', value: log.length, sub: 'Across all types', color: T.dark },
            { label: 'Manager Comps', value: log.filter(e => e.type === 'Manager Comp').length, sub: `$${log.filter(e => e.type === 'Manager Comp').reduce((s, e) => s + e.cost * e.qty, 0).toLocaleString()} cost`, color: T.burgundy },
            { label: 'Breakage / Loss', value: `$${log.filter(e => ['Bottle Breakage', 'Return/Refused'].includes(e.type)).reduce((s, e) => s + e.cost * e.qty, 0).toLocaleString()}`, sub: 'Breakage + returns', color: T.error },
          ].map(kpi => (
            <div key={kpi.label} style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '14px 16px', boxShadow: T.shadowSm }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.gray, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color, fontFamily: T.fontSerif }}>{kpi.value}</div>
              <div style={{ fontSize: 11, color: T.gray, marginTop: 3 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Donut */}
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '14px 16px', boxShadow: T.shadowSm }}>
            <div style={{ fontFamily: T.fontSerif, fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 10 }}>By Type</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {byType.map((entry, i) => <Cell key={i} fill={TYPE_COLORS[entry.name] || T.gray} />)}
                </Pie>
                <Tooltip formatter={v => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* By server */}
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '14px 16px', boxShadow: T.shadowSm }}>
            <div style={{ fontFamily: T.fontSerif, fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 10 }}>By Server</div>
            {byServer.map(([server, cost]) => (
              <div key={server} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: T.dark }}>{server}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 60, height: 5, backgroundColor: T.grayBorder, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${(cost / byServer[0][1]) * 100}%`, height: '100%', backgroundColor: T.burgundy, borderRadius: 99 }} />
                  </div>
                  <span style={{ fontWeight: 700, color: T.dark, fontSize: 12, minWidth: 36 }}>${cost}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add entry */}
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '14px 16px', boxShadow: T.shadowSm }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontFamily: T.fontSerif, fontSize: 13, fontWeight: 700, color: T.dark }}>Log Entry</div>
              <button onClick={() => setShowForm(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: `1px solid ${T.grayBorder}`, backgroundColor: T.white, color: T.dark, fontSize: 11, cursor: 'pointer' }}>
                <Plus size={12} /> {showForm ? 'Cancel' : 'New Entry'}
              </button>
            </div>
            {showForm ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['date', 'date', 'Date'],
                  ['type', 'select', 'Type', COMP_TYPES],
                  ['item', 'select', 'Item', WINES_LIST],
                  ['qty', 'number', 'Qty'],
                  ['cost', 'number', 'Bottle Cost $'],
                  ['server', 'select', 'Server', SERVERS],
                ].map(([field, type, label, opts]) => (
                  <div key={field}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.gray, marginBottom: 3 }}>{label}</div>
                    {type === 'select' ? (
                      <select value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} style={{ width: '100%', padding: '5px 8px', borderRadius: 5, border: `1px solid ${T.grayBorder}`, fontSize: 11, color: T.dark }}>
                        {opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} style={{ width: '100%', padding: '5px 8px', borderRadius: 5, border: `1px solid ${T.grayBorder}`, fontSize: 11, boxSizing: 'border-box' }} />
                    )}
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.gray, marginBottom: 3 }}>Reason</div>
                  <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Brief reason…" style={{ width: '100%', padding: '5px 8px', borderRadius: 5, border: `1px solid ${T.grayBorder}`, fontSize: 11, boxSizing: 'border-box' }} />
                </div>
                <button onClick={addEntry} style={{ padding: '7px 0', borderRadius: 6, border: 'none', backgroundColor: T.burgundy, color: T.white, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Add to Log</button>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: T.gray }}>Click "New Entry" to log a comp, breakage, or variance event.</div>
            )}
          </div>
        </div>

        {/* Log table */}
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, overflow: 'hidden', boxShadow: T.shadowSm, marginBottom: 20 }}>
          <div style={{ overflowX: 'auto', maxHeight: 340, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead style={{ position: 'sticky', top: 0 }}>
                <tr style={{ backgroundColor: T.cream }}>
                  {['Date', 'Type', 'Item', 'Qty', 'Cost/Btl', 'Total', 'Server', 'Reason', ''].map(h => (
                    <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.gray, borderBottom: `2px solid ${T.grayBorder}`, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {log.map((e, i) => (
                  <tr key={e.id} style={{ backgroundColor: i % 2 === 0 ? T.white : T.cream }}>
                    <td style={{ padding: '9px 12px', color: T.gray, whiteSpace: 'nowrap' }}>{e.date}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, backgroundColor: (TYPE_COLORS[e.type] || T.gray) + '18', color: TYPE_COLORS[e.type] || T.gray }}>{e.type}</span>
                    </td>
                    <td style={{ padding: '9px 12px', fontWeight: 600, color: T.dark }}>{e.item}</td>
                    <td style={{ padding: '9px 12px', color: T.dark }}>{e.qty}</td>
                    <td style={{ padding: '9px 12px', color: T.gray }}>${e.cost}</td>
                    <td style={{ padding: '9px 12px', fontWeight: 700, color: T.dark }}>${(e.cost * e.qty).toLocaleString()}</td>
                    <td style={{ padding: '9px 12px', color: T.gray }}>{e.server}</td>
                    <td style={{ padding: '9px 12px', color: T.gray, maxWidth: 200 }}>{e.reason}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <button onClick={() => removeEntry(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.gray, padding: 2 }}><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Memo */}
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark }}>AI Variance Memo</div>
              <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>✨ AI · Period summary, areas of concern, policy actions</div>
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
              Click "Generate Memo" to create an end-of-period variance report for ownership.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
