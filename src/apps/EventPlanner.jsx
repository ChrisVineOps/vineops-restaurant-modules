import Logo from '../Logo.jsx'
import MarkdownRenderer from '../MarkdownRenderer.jsx'
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Anthropic from '@anthropic-ai/sdk'
import {
  CalendarDays, ArrowLeft, Key, Eye, EyeOff, Sparkles,
  Plus, Trash2, Copy, Check, Users, DollarSign,
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

const CELLAR_WINES = [
  { name: 'Schramsberg Blanc de Blancs 2019', cost: 44, menu: 98, pours: 6 },
  { name: 'Domaine Leflaive Puligny-Montrachet 2019', cost: 145, menu: 295, pours: 5 },
  { name: 'Kistler Vineyard Chardonnay 2020', cost: 72, menu: 155, pours: 5 },
  { name: 'Louis Jadot Chambolle-Musigny 1er 2018', cost: 95, menu: 210, pours: 5 },
  { name: 'Sassicaia Bolgheri 2018', cost: 210, menu: 420, pours: 5 },
  { name: 'Gaja Barbaresco 2018', cost: 195, menu: 385, pours: 5 },
  { name: 'Caymus Special Selection Cabernet 2019', cost: 180, menu: 380, pours: 5 },
  { name: 'Dom Pérignon 2013', cost: 210, menu: 420, pours: 6 },
  { name: 'Château d\'Yquem Sauternes 2016', cost: 380, menu: 720, pours: 7 },
  { name: 'Taylor Fladgate 20yr Tawny Port NV', cost: 48, menu: 95, pours: 8 },
]

const SAMPLE_EVENT = {
  name: 'Spring Cellar Dinner',
  date: '2026-05-15',
  guests: 12,
  foodCostPerHead: 95,
  targetPricePerHead: 285,
  courses: [
    { id: 1, course: 'Reception', dish: 'Canapés — smoked salmon, caviar blinis, gougères', wine: 'Schramsberg Blanc de Blancs 2019', poursPerGuest: 2 },
    { id: 2, course: 'First Course', dish: 'Pan-seared Hudson Valley foie gras, Sauternes gelée, brioche', wine: 'Château d\'Yquem Sauternes 2016', poursPerGuest: 1 },
    { id: 3, course: 'Fish Course', dish: 'Halibut, morel cream, spring peas, beurre blanc', wine: 'Domaine Leflaive Puligny-Montrachet 2019', poursPerGuest: 2 },
    { id: 4, course: 'Meat Course', dish: 'Wagyu A5 striploin, truffle jus, potato purée', wine: 'Gaja Barbaresco 2018', poursPerGuest: 2 },
    { id: 5, course: 'Dessert', dish: 'Chocolate fondant, salted caramel, vanilla ice cream', wine: 'Taylor Fladgate 20yr Tawny Port NV', poursPerGuest: 1 },
  ],
}

export default function EventPlanner() {
  const [apiKey, setApiKey] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiStreaming, setAiStreaming] = useState(false)
  const [event, setEvent] = useState(SAMPLE_EVENT)
  const [copied, setCopied] = useState(false)

  function updateEvent(field, val) { setEvent(e => ({ ...e, [field]: val })) }

  function updateCourse(id, field, val) {
    setEvent(e => ({ ...e, courses: e.courses.map(c => c.id === id ? { ...c, [field]: val } : c) }))
  }

  function addCourse() {
    setEvent(e => ({ ...e, courses: [...e.courses, { id: Date.now(), course: `Course ${e.courses.length + 1}`, dish: '', wine: CELLAR_WINES[0].name, poursPerGuest: 1 }] }))
  }

  function removeCourse(id) { setEvent(e => ({ ...e, courses: e.courses.filter(c => c.id !== id) })) }

  const calc = useMemo(() => {
    const guests = +event.guests || 0
    let totalBottles = 0
    let totalWineCost = 0
    let totalWineRevenue = 0

    const courseCalc = event.courses.map(c => {
      const wine = CELLAR_WINES.find(w => w.name === c.wine) || CELLAR_WINES[0]
      const totalPours = guests * (+c.poursPerGuest || 1)
      const bottles = Math.ceil(totalPours / wine.pours)
      const cost = bottles * wine.cost
      const revenue = bottles * wine.menu
      totalBottles += bottles
      totalWineCost += cost
      totalWineRevenue += revenue
      return { ...c, wine, totalPours, bottles, cost, revenue }
    })

    const foodCost = guests * (+event.foodCostPerHead || 0)
    const totalCost = totalWineCost + foodCost
    const targetRevenue = guests * (+event.targetPricePerHead || 0)
    const grossProfit = targetRevenue - totalCost
    const profitMargin = targetRevenue > 0 ? Math.round((grossProfit / targetRevenue) * 100) : 0
    const breakEvenPerHead = guests > 0 ? Math.round(totalCost / guests) : 0

    return { courseCalc, totalBottles, totalWineCost, totalWineRevenue, foodCost, totalCost, targetRevenue, grossProfit, profitMargin, breakEvenPerHead }
  }, [event])

  async function generateNarrative() {
    if (!apiKey) { setShowKeyModal(true); return }
    setAiText('')
    setAiStreaming(true)
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
    const courseList = calc.courseCalc.map(c => `${c.course}: ${c.dish} paired with ${c.wine}`).join('\n')
    let full = ''
    try {
      const stream = await client.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `Write an elegant wine dinner narrative for a fine-dining restaurant event.

Event: ${event.name}
Date: ${event.date}
Guests: ${event.guests}

Course & pairing menu:
${courseList}

Write:
## Evening Introduction (2 sentences — welcoming guests, setting the tone)
## Course Notes (one 2-sentence evocative description for each course + pairing, in order)
## Closing Toast (one sentence)

Use elegant, sensory language appropriate for a sophisticated wine dinner host. No preamble.`,
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

  function copyNarrative() {
    navigator.clipboard.writeText(aiText)
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
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: T.fontSerif }}>Wine Dinner & Event Planner</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>App 10 · AI-Augmented Automation · Course Builder & Pricing</div>
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
            <p style={{ fontSize: 13, color: T.gray, marginBottom: 16, lineHeight: 1.6 }}>Required for AI dinner narrative. Stays in-browser, never stored.</p>
            <div style={{ position: 'relative' }}>
              <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-..." style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 6, border: `1px solid ${T.grayBorder}`, fontSize: 13, fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none' }} />
              <button onClick={() => setShowKey(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.gray }}>{showKey ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowKeyModal(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: `1px solid ${T.grayBorder}`, backgroundColor: T.white, color: T.dark, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={() => { setShowKeyModal(false); generateNarrative() }} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: 'none', backgroundColor: T.burgundy, color: T.white, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>Save & Generate</button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* Event setup */}
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm, marginBottom: 20 }}>
          <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark, marginBottom: 14 }}>Event Setup</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {[
              ['Event Name', 'name', 'text'],
              ['Date', 'date', 'date'],
              ['Guest Count', 'guests', 'number'],
              ['Food Cost/Head $', 'foodCostPerHead', 'number'],
              ['Target Price/Head $', 'targetPricePerHead', 'number'],
            ].map(([label, field, type]) => (
              <div key={field}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.gray, marginBottom: 4 }}>{label}</div>
                <input type={type} value={event[field]} onChange={e => updateEvent(field, e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: `1px solid ${T.grayBorder}`, fontSize: 12, color: T.dark, boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Financial summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Total Bottles', value: calc.totalBottles, sub: 'All courses', color: T.burgundy },
            { label: 'Wine Cost', value: `$${calc.totalWineCost.toLocaleString()}`, sub: `Food: $${calc.foodCost.toLocaleString()}`, color: T.dark },
            { label: 'Total Cost', value: `$${calc.totalCost.toLocaleString()}`, sub: `$${calc.breakEvenPerHead}/head breakeven`, color: T.warning },
            { label: 'Target Revenue', value: `$${calc.targetRevenue.toLocaleString()}`, sub: `$${event.targetPricePerHead}/head`, color: T.dark },
            { label: 'Gross Profit', value: `$${calc.grossProfit.toLocaleString()}`, sub: `${calc.profitMargin}% margin`, color: calc.profitMargin >= 35 ? T.success : T.error },
          ].map(kpi => (
            <div key={kpi.label} style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '12px 14px', boxShadow: T.shadowSm }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.gray, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{kpi.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: kpi.color, fontFamily: T.fontSerif }}>{kpi.value}</div>
              <div style={{ fontSize: 10, color: T.gray, marginTop: 2 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Course builder */}
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, overflow: 'hidden', boxShadow: T.shadowSm }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.grayBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark }}>Course Builder</div>
              <button onClick={addCourse} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6, border: `1px solid ${T.grayBorder}`, backgroundColor: T.white, color: T.dark, fontSize: 11, cursor: 'pointer' }}>
                <Plus size={12} /> Add Course
              </button>
            </div>
            <div style={{ padding: '12px 14px', maxHeight: 480, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {event.courses.map(c => (
                <div key={c.id} style={{ backgroundColor: T.cream, borderRadius: 8, padding: '12px', border: `1px solid ${T.grayBorder}` }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input value={c.course} onChange={e => updateCourse(c.id, 'course', e.target.value)} style={{ flex: 1, padding: '5px 8px', borderRadius: 5, border: `1px solid ${T.grayBorder}`, fontSize: 12, fontWeight: 700 }} />
                    <button onClick={() => removeCourse(c.id)} style={{ padding: 5, background: 'none', border: 'none', cursor: 'pointer', color: T.gray }}><Trash2 size={12} /></button>
                  </div>
                  <textarea value={c.dish} onChange={e => updateCourse(c.id, 'dish', e.target.value)} placeholder="Dish description…" rows={2} style={{ width: '100%', padding: '5px 8px', borderRadius: 5, border: `1px solid ${T.grayBorder}`, fontSize: 11, marginBottom: 8, resize: 'vertical', boxSizing: 'border-box', fontFamily: T.fontSans }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
                    <select value={c.wine} onChange={e => updateCourse(c.id, 'wine', e.target.value)} style={{ padding: '5px 8px', borderRadius: 5, border: `1px solid ${T.grayBorder}`, fontSize: 11 }}>
                      {CELLAR_WINES.map(w => <option key={w.name}>{w.name}</option>)}
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, color: T.gray, whiteSpace: 'nowrap' }}>Pours/guest:</span>
                      <input type="number" min={1} max={4} value={c.poursPerGuest} onChange={e => updateCourse(c.id, 'poursPerGuest', +e.target.value)} style={{ width: 44, padding: '5px 6px', borderRadius: 5, border: `1px solid ${T.grayBorder}`, fontSize: 12, textAlign: 'center' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottle calculator */}
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, overflow: 'hidden', boxShadow: T.shadowSm }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.grayBorder}` }}>
              <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark }}>Bottle Calculator</div>
              <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>{event.guests} guests · auto-calculated from pours/guest</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ backgroundColor: T.cream }}>
                    {['Course', 'Wine', 'Pours', 'Bottles', 'Cost', 'Menu $'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: T.gray, borderBottom: `2px solid ${T.grayBorder}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calc.courseCalc.map((c, i) => (
                    <tr key={c.id} style={{ backgroundColor: i % 2 === 0 ? T.white : T.cream }}>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: T.dark, whiteSpace: 'nowrap' }}>{c.course}</td>
                      <td style={{ padding: '8px 12px', color: T.gray, maxWidth: 150, fontSize: 11 }}>{c.wine.split(' ').slice(0, 3).join(' ')}</td>
                      <td style={{ padding: '8px 12px', color: T.dark }}>{c.totalPours}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: T.burgundy }}>{c.bottles}</td>
                      <td style={{ padding: '8px 12px', color: T.gray }}>${c.cost.toLocaleString()}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: T.dark }}>${c.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: T.burgundy + '10', fontWeight: 700 }}>
                    <td colSpan={3} style={{ padding: '9px 12px', fontWeight: 700, color: T.dark, fontSize: 12 }}>Totals</td>
                    <td style={{ padding: '9px 12px', fontWeight: 700, color: T.burgundy }}>{calc.totalBottles}</td>
                    <td style={{ padding: '9px 12px', fontWeight: 700, color: T.dark }}>${calc.totalWineCost.toLocaleString()}</td>
                    <td style={{ padding: '9px 12px', fontWeight: 700, color: T.dark }}>${calc.totalWineRevenue.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* AI Narrative */}
        <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark }}>AI Dinner Narrative</div>
              <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>✨ AI · Introduction, course notes, and closing toast — ready for the host</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {aiText && (
                <button onClick={copyNarrative} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 6, border: `1px solid ${T.grayBorder}`, backgroundColor: T.white, color: T.dark, fontSize: 12, cursor: 'pointer' }}>
                  {copied ? <><Check size={11} color={T.success} /> Copied</> : <><Copy size={11} /> Copy</>}
                </button>
              )}
              <button onClick={generateNarrative} disabled={aiStreaming} style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: T.burgundy, color: T.white, border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: aiStreaming ? 'default' : 'pointer', opacity: aiStreaming ? 0.7 : 1 }}>
                <Sparkles size={13} /> {aiStreaming ? 'Generating…' : aiText ? 'Regenerate' : 'Generate Narrative'}
              </button>
            </div>
          </div>
          {aiText ? (
            <div style={{ backgroundColor: '#FEFCE8', borderRadius: 8, padding: '14px 16px', border: `1px solid ${T.gold}44` }}>
              <MarkdownRenderer text={aiText} streaming={aiStreaming} />
            </div>
          ) : (
            <div style={{ padding: '24px 0', textAlign: 'center', color: T.gray, fontSize: 13 }}>
              Click "Generate Narrative" — AI will write an elegant dinner introduction, per-course pairing notes, and a closing toast for the host.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
