import Logo from '../Logo.jsx'
import MarkdownRenderer from '../MarkdownRenderer.jsx'
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Anthropic from '@anthropic-ai/sdk'
import {
  ShoppingCart, ArrowLeft, Key, Eye, EyeOff, Sparkles,
  AlertTriangle, CheckCircle, Copy, Check,
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

const INVENTORY = [
  { id: 1, name: 'Rombauer Chardonnay', region: 'Napa Valley', vintage: 2022, par: 6, onHand: 2, casePrice: 252, btlPerCase: 6, rep: 'James Whitfield', dist: 'RNDC California' },
  { id: 2, name: 'Sonoma-Cutrer Chardonnay', region: 'Russian River', vintage: 2022, par: 4, onHand: 3, casePrice: 216, btlPerCase: 6, rep: 'James Whitfield', dist: 'RNDC California' },
  { id: 3, name: 'Cloudy Bay Sauvignon Blanc', region: 'Marlborough', vintage: 2023, par: 3, onHand: 1, casePrice: 174, btlPerCase: 6, rep: 'Maria Santos', dist: "Southern Glazer's" },
  { id: 4, name: 'Cakebread Sauvignon Blanc', region: 'Napa Valley', vintage: 2023, par: 3, onHand: 4, casePrice: 228, btlPerCase: 6, rep: 'James Whitfield', dist: 'RNDC California' },
  { id: 5, name: 'Caymus Cabernet Sauvignon', region: 'Napa Valley', vintage: 2021, par: 5, onHand: 1, casePrice: 534, btlPerCase: 6, rep: 'James Whitfield', dist: 'RNDC California' },
  { id: 6, name: 'Stag\'s Leap Artemis Cab', region: 'Napa Valley', vintage: 2020, par: 3, onHand: 2, casePrice: 408, btlPerCase: 6, rep: 'James Whitfield', dist: 'RNDC California' },
  { id: 7, name: 'Meiomi Pinot Noir', region: 'California', vintage: 2022, par: 4, onHand: 5, casePrice: 144, btlPerCase: 6, rep: 'James Whitfield', dist: 'RNDC California' },
  { id: 8, name: 'Duckhorn Merlot', region: 'Napa Valley', vintage: 2021, par: 3, onHand: 0, casePrice: 312, btlPerCase: 6, rep: 'James Whitfield', dist: 'RNDC California' },
  { id: 9, name: 'Brewer-Clifton Pinot Noir', region: 'Sta. Rita Hills', vintage: 2021, par: 2, onHand: 2, casePrice: 348, btlPerCase: 6, rep: 'James Whitfield', dist: 'RNDC California' },
  { id: 10, name: 'Louis Jadot Chambolle-Musigny', region: 'Burgundy', vintage: 2018, par: 3, onHand: 1, casePrice: 570, btlPerCase: 6, rep: 'Maria Santos', dist: "Southern Glazer's" },
  { id: 11, name: 'Schramsberg Blanc de Blancs', region: 'North Coast', vintage: 2019, par: 4, onHand: 2, casePrice: 264, btlPerCase: 6, rep: 'David Chen', dist: 'Empire Distributors' },
  { id: 12, name: 'Roederer Estate Brut', region: 'Anderson Valley', vintage: 'NV', par: 3, onHand: 3, casePrice: 216, btlPerCase: 6, rep: 'David Chen', dist: 'Empire Distributors' },
  { id: 13, name: 'Veuve Clicquot Yellow Label', region: 'Champagne', vintage: 'NV', par: 2, onHand: 0, casePrice: 372, btlPerCase: 6, rep: 'David Chen', dist: 'Empire Distributors' },
  { id: 14, name: 'Whispering Angel Rosé', region: 'Provence', vintage: 2023, par: 3, onHand: 1, casePrice: 204, btlPerCase: 6, rep: 'Sarah Kowalski', dist: 'VIP Wine & Spirits' },
  { id: 15, name: 'Gaja Barbaresco', region: 'Piedmont', vintage: 2018, par: 2, onHand: 1, casePrice: 1170, btlPerCase: 6, rep: 'Maria Santos', dist: "Southern Glazer's" },
  { id: 16, name: 'Sassicaia Bolgheri', region: 'Tuscany', vintage: 2018, par: 2, onHand: 2, casePrice: 1260, btlPerCase: 6, rep: 'Maria Santos', dist: "Southern Glazer's" },
  { id: 17, name: 'Egon Müller Spätlese', region: 'Mosel', vintage: 2018, par: 2, onHand: 3, casePrice: 720, btlPerCase: 6, rep: 'Maria Santos', dist: "Southern Glazer's" },
  { id: 18, name: 'Taylor Fladgate 20yr Tawny', region: 'Port', vintage: 'NV', par: 2, onHand: 1, casePrice: 288, btlPerCase: 6, rep: 'Angela Moore', dist: 'Republic National' },
  { id: 19, name: 'Eyrie South Block Pinot Noir', region: 'Willamette Valley', vintage: 2019, par: 2, onHand: 4, casePrice: 408, btlPerCase: 6, rep: 'Sarah Kowalski', dist: 'VIP Wine & Spirits' },
  { id: 20, name: 'Bonny Doon Vin Gris Rosé', region: 'Santa Cruz', vintage: 2022, par: 3, onHand: 0, casePrice: 132, btlPerCase: 6, rep: 'Sarah Kowalski', dist: 'VIP Wine & Spirits' },
]

export default function PurchaseOrderBuilder() {
  const [apiKey, setApiKey] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiStreaming, setAiStreaming] = useState(false)
  const [counts, setCounts] = useState({})
  const [showPO, setShowPO] = useState(false)
  const [copied, setCopied] = useState(false)

  function getCount(id) { return counts[id] !== undefined ? counts[id] : INVENTORY.find(i => i.id === id).onHand }
  function getNeeded(item) { return Math.max(0, item.par - getCount(item.id)) }
  function getCasesNeeded(item) { return Math.ceil(getNeeded(item) / item.btlPerCase) }

  const orderItems = useMemo(() =>
    INVENTORY.filter(item => getNeeded(item) > 0).map(item => ({
      ...item, needed: getNeeded(item), casesNeeded: getCasesNeeded(item),
      lineTotal: getCasesNeeded(item) * item.casePrice,
    })),
  [counts])

  const byDistributor = useMemo(() => {
    const groups = {}
    orderItems.forEach(item => {
      if (!groups[item.dist]) groups[item.dist] = { rep: item.rep, items: [], total: 0 }
      groups[item.dist].items.push(item)
      groups[item.dist].total += item.lineTotal
    })
    return groups
  }, [orderItems])

  const totalOrder = orderItems.reduce((s, i) => s + i.lineTotal, 0)
  const criticalItems = INVENTORY.filter(item => getCount(item.id) === 0)

  async function generateReview() {
    if (!apiKey) { setShowKeyModal(true); return }
    setAiText('')
    setAiStreaming(true)
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
    const large = orderItems.filter(i => i.casesNeeded >= 2)
    const zero = criticalItems
    let full = ''
    try {
      const stream = await client.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `Review this restaurant beverage purchase order and flag anomalies.

Total order: $${totalOrder.toLocaleString()} across ${Object.keys(byDistributor).length} distributors
Items at zero stock: ${zero.map(i => i.name).join(', ') || 'None'}
Large quantity orders (2+ cases): ${large.map(i => `${i.name} (${i.casesNeeded} cases, $${i.lineTotal})`).join(', ') || 'None'}
Total line items: ${orderItems.length}

Write 3 short bullets: 1) Flag any unusual quantities or spend, 2) Note the zero-stock urgency, 3) One cost optimization suggestion. No preamble, no headers.`,
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
    setShowPO(true)
  }

  function copyPO() {
    const lines = Object.entries(byDistributor).map(([dist, { rep, items, total }]) => {
      const itemLines = items.map(i => `  ${i.name} ${i.vintage} — ${i.casesNeeded} case(s) × $${i.casePrice} = $${i.lineTotal}`).join('\n')
      return `${dist} | Rep: ${rep}\n${itemLines}\n  Subtotal: $${total.toLocaleString()}`
    }).join('\n\n')
    navigator.clipboard.writeText(`PURCHASE ORDER — ${new Date().toLocaleDateString()}\nTotal: $${totalOrder.toLocaleString()}\n\n${lines}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: T.fontSerif }}>Purchase Order Builder</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>App 07 · AI-Augmented Automation · {INVENTORY.length} SKUs on Par List</div>
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
            <p style={{ fontSize: 13, color: T.gray, marginBottom: 16, lineHeight: 1.6 }}>Required for AI order review. Stays in-browser, never stored.</p>
            <div style={{ position: 'relative' }}>
              <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-..." style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 6, border: `1px solid ${T.grayBorder}`, fontSize: 13, fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none' }} />
              <button onClick={() => setShowKey(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.gray }}>{showKey ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowKeyModal(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: `1px solid ${T.grayBorder}`, backgroundColor: T.white, color: T.dark, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={() => { setShowKeyModal(false); generateReview() }} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: 'none', backgroundColor: T.burgundy, color: T.white, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>Save & Review</button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Items to Order', value: orderItems.length, sub: 'Below par', color: T.burgundy },
            { label: 'Zero Stock', value: criticalItems.length, sub: 'Order immediately', color: criticalItems.length > 0 ? T.error : T.success },
            { label: 'Est. Order Total', value: `$${totalOrder.toLocaleString()}`, sub: `${Object.keys(byDistributor).length} distributors`, color: T.dark },
            { label: 'On Par / Above', value: INVENTORY.length - orderItems.length, sub: 'No action needed', color: T.success },
          ].map(kpi => (
            <div key={kpi.label} style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '14px 16px', boxShadow: T.shadowSm }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.gray, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: kpi.color, fontFamily: T.fontSerif }}>{kpi.value}</div>
              <div style={{ fontSize: 11, color: T.gray, marginTop: 3 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Inventory count grid */}
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, overflow: 'hidden', boxShadow: T.shadowSm }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.grayBorder}` }}>
              <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark }}>Inventory Count Entry</div>
              <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>Adjust on-hand counts — order quantities recalculate automatically</div>
            </div>
            <div style={{ overflowX: 'auto', maxHeight: 420, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead style={{ position: 'sticky', top: 0 }}>
                  <tr style={{ backgroundColor: T.cream }}>
                    {['Wine', 'Par', 'On Hand', 'Needed', 'Rep'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.gray, borderBottom: `2px solid ${T.grayBorder}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INVENTORY.map((item, i) => {
                    const cur = getCount(item.id)
                    const needed = getNeeded(item)
                    return (
                      <tr key={item.id} style={{ backgroundColor: i % 2 === 0 ? T.white : T.cream }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: T.dark, maxWidth: 180 }}>
                          <div style={{ lineHeight: 1.3 }}>{item.name}</div>
                          <div style={{ fontSize: 10, color: T.gray, fontWeight: 400 }}>{item.vintage} · {item.region}</div>
                        </td>
                        <td style={{ padding: '8px 12px', color: T.gray, fontWeight: 600 }}>{item.par}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <input
                            type="number" min={0} max={24} value={cur}
                            onChange={e => setCounts(c => ({ ...c, [item.id]: Math.max(0, +e.target.value) }))}
                            style={{ width: 56, padding: '4px 8px', borderRadius: 5, border: `1px solid ${cur === 0 ? T.error : T.grayBorder}`, fontSize: 12, textAlign: 'center', color: cur === 0 ? T.error : T.dark, fontWeight: cur === 0 ? 700 : 400 }}
                          />
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          {needed > 0 ? (
                            <span style={{ fontWeight: 700, color: needed >= item.par ? T.error : T.warning }}>{needed} btl</span>
                          ) : (
                            <CheckCircle size={13} color={T.success} />
                          )}
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: 11, color: T.gray }}>{item.rep}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '14px 16px', boxShadow: T.shadowSm }}>
              <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark, marginBottom: 14 }}>Order by Distributor</div>
              {Object.keys(byDistributor).length === 0 ? (
                <div style={{ fontSize: 13, color: T.gray, fontStyle: 'italic' }}>All items on par — no order needed.</div>
              ) : Object.entries(byDistributor).map(([dist, { rep, items, total }]) => (
                <div key={dist} style={{ marginBottom: 12, padding: '10px 12px', backgroundColor: T.cream, borderRadius: 8, border: `1px solid ${T.grayBorder}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.dark }}>{dist}</div>
                  <div style={{ fontSize: 11, color: T.gray, marginBottom: 8 }}>Rep: {rep}</div>
                  {items.map(i => (
                    <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                      <span style={{ color: T.dark }}>{i.name} × {i.casesNeeded} cs</span>
                      <span style={{ fontWeight: 600, color: T.dark }}>${i.lineTotal.toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: `1px solid ${T.grayBorder}`, marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.gray }}>Subtotal</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.burgundy }}>${total.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {orderItems.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button onClick={generateReview} disabled={aiStreaming} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: T.burgundy, color: T.white, border: 'none', borderRadius: 6, padding: '9px 0', fontSize: 12, fontWeight: 700, cursor: aiStreaming ? 'default' : 'pointer', opacity: aiStreaming ? 0.7 : 1 }}>
                    <Sparkles size={12} /> {aiStreaming ? 'Reviewing…' : 'AI Review'}
                  </button>
                  <button onClick={copyPO} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: T.white, color: T.dark, border: `1px solid ${T.grayBorder}`, borderRadius: 6, padding: '9px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {copied ? <><Check size={12} color={T.success} /> Copied!</> : <><Copy size={12} /> Copy PO</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Review */}
        {(aiText || aiStreaming) && (
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, marginBottom: 12 }}>✨ AI Order Review</div>
            <div style={{ backgroundColor: '#FEFCE8', borderRadius: 8, padding: '14px 16px', border: `1px solid ${T.gold}44` }}>
              <MarkdownRenderer text={aiText} streaming={aiStreaming} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
