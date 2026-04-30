import Logo from '../Logo.jsx'
import MarkdownRenderer from '../MarkdownRenderer.jsx'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Anthropic from '@anthropic-ai/sdk'
import {
  Utensils, ArrowLeft, Key, Eye, EyeOff, Sparkles,
  Plus, Trash2, Copy, Check,
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

const SAMPLE_MENU = [
  { id: 1, course: 'Amuse-Bouche', dish: 'Dungeness crab brandade, caviar, crème fraîche on pommes gaufrettes' },
  { id: 2, course: 'First Course', dish: 'Pan-seared Hudson Valley foie gras, Sauternes gelée, brioche toast, pickled fig' },
  { id: 3, course: 'Fish Course', dish: 'Halibut en croûte, beurre blanc, spring peas, morel mushroom cream' },
  { id: 4, course: 'Meat Course', dish: 'Wagyu A5 striploin, bone marrow butter, roasted garlic jus, truffle potato purée' },
  { id: 5, course: 'Cheese Course', dish: 'Artisan cheese selection — Époisses, Comté, Rogue River Blue, honeycomb, candied walnuts' },
]

const WINE_POOL = [
  'Rombauer Chardonnay 2022 (Napa Valley)',
  'Caymus Cabernet Sauvignon 2021 (Napa Valley)',
  'Louis Jadot Chambolle-Musigny 1er Cru 2018 (Burgundy)',
  'Gaja Barbaresco 2018 (Piedmont)',
  'Schramsberg Blanc de Blancs 2019 (North Coast)',
  'Veuve Clicquot Yellow Label NV (Champagne)',
  'Dom Pérignon 2013 (Champagne)',
  'Château d\'Yquem 2016 (Sauternes)',
  'Egon Müller Scharzhofberger Spätlese 2018 (Mosel)',
  'Duckhorn Merlot 2021 (Napa Valley)',
  'Whispering Angel Rosé 2023 (Provence)',
  'Stag\'s Leap Artemis Cab 2020 (Napa Valley)',
  'Kistler Vineyard Chardonnay 2020 (Sonoma)',
  'Taylor Fladgate 20yr Tawny Port NV',
  'Meiomi Pinot Noir 2022 (California)',
]

export default function PairingAssistant() {
  const [apiKey, setApiKey] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [courses, setCourses] = useState(SAMPLE_MENU)
  const [aiText, setAiText] = useState('')
  const [aiStreaming, setAiStreaming] = useState(false)
  const [viewMode, setViewMode] = useState('guest') // 'guest' | 'staff'
  const [copied, setCopied] = useState(false)

  function addCourse() {
    setCourses(c => [...c, { id: Date.now(), course: `Course ${c.length + 1}`, dish: '' }])
  }

  function removeCourse(id) {
    setCourses(c => c.filter(x => x.id !== id))
  }

  function updateCourse(id, field, val) {
    setCourses(c => c.map(x => x.id === id ? { ...x, [field]: val } : x))
  }

  async function generatePairings() {
    if (!apiKey) { setShowKeyModal(true); return }
    setAiText('')
    setAiStreaming(true)
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
    const courseList = courses.filter(c => c.dish).map(c => `${c.course}: ${c.dish}`).join('\n')
    let full = ''
    try {
      const stream = await client.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 700,
        messages: [{
          role: 'user',
          content: `You are an expert sommelier at a fine-dining restaurant. Generate wine pairing recommendations for each course.

Available wine list:
${WINE_POOL.join('\n')}

Tasting menu courses:
${courseList}

For each course, provide:
- The wine pairing (from the list above)
- A guest-facing pairing note (1-2 elegant sentences, sensory language)
- A staff talking point (1 sentence — what to say when pouring)

Format as:
## [Course Name]
**Pairing:** [wine name]
**Guest Note:** [guest-facing copy]
**Staff:** [talking point]

Be specific, use evocative language. No preamble.`,
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

  function copyOutput() {
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
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: T.fontSerif }}>Wine & Menu Pairing Assistant</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>App 08 · AI-Augmented Automation · Tasting Menu Pairings</div>
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
            <p style={{ fontSize: 13, color: T.gray, marginBottom: 16, lineHeight: 1.6 }}>Required for AI pairing generation. Stays in-browser, never stored.</p>
            <div style={{ position: 'relative' }}>
              <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-..." style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 6, border: `1px solid ${T.grayBorder}`, fontSize: 13, fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none' }} />
              <button onClick={() => setShowKey(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.gray }}>{showKey ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowKeyModal(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: `1px solid ${T.grayBorder}`, backgroundColor: T.white, color: T.dark, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={() => { setShowKeyModal(false); generatePairings() }} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: 'none', backgroundColor: T.burgundy, color: T.white, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>Save & Generate</button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>

          {/* Course builder */}
          <div>
            <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, overflow: 'hidden', boxShadow: T.shadowSm, marginBottom: 16 }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.grayBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark }}>Tasting Menu Courses</div>
                  <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>Enter each course to generate pairings from your list</div>
                </div>
                <button onClick={addCourse} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: `1px solid ${T.grayBorder}`, backgroundColor: T.white, color: T.dark, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                  <Plus size={13} /> Add Course
                </button>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {courses.map((c, i) => (
                  <div key={c.id} style={{ backgroundColor: T.cream, borderRadius: 8, padding: '12px', border: `1px solid ${T.grayBorder}` }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                      <input
                        value={c.course} onChange={e => updateCourse(c.id, 'course', e.target.value)}
                        style={{ flex: 1, padding: '6px 10px', borderRadius: 5, border: `1px solid ${T.grayBorder}`, fontSize: 12, fontWeight: 700, color: T.dark }}
                      />
                      <button onClick={() => removeCourse(c.id)} style={{ padding: 5, background: 'none', border: 'none', cursor: 'pointer', color: T.gray }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <textarea
                      value={c.dish} onChange={e => updateCourse(c.id, 'dish', e.target.value)}
                      placeholder="Describe the dish…"
                      rows={2}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: 5, border: `1px solid ${T.grayBorder}`, fontSize: 12, color: T.dark, resize: 'vertical', boxSizing: 'border-box', fontFamily: T.fontSans }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={generatePairings}
              disabled={aiStreaming || courses.filter(c => c.dish).length === 0}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: T.burgundy, color: T.white, border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 13, fontWeight: 700, cursor: aiStreaming ? 'default' : 'pointer', opacity: aiStreaming ? 0.7 : 1 }}
            >
              <Sparkles size={14} /> {aiStreaming ? 'Generating Pairings…' : 'Generate Wine Pairings'}
            </button>

            {/* Wine pool reference */}
            <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '14px 16px', boxShadow: T.shadowSm, marginTop: 16 }}>
              <div style={{ fontFamily: T.fontSerif, fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 10 }}>Current Wine Pool ({WINE_POOL.length} options)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {WINE_POOL.map((w, i) => (
                  <div key={i} style={{ fontSize: 11, color: T.gray, padding: '3px 0', borderBottom: i < WINE_POOL.length - 1 ? `1px solid ${T.grayBorder}` : 'none' }}>{w}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Pairings output */}
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, overflow: 'hidden', boxShadow: T.shadowSm }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.grayBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark }}>AI Pairing Recommendations</div>
                <div style={{ fontSize: 11, color: T.gold, marginTop: 2 }}>✨ AI · Guest copy + staff talking points</div>
              </div>
              {aiText && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={copyOutput} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: `1px solid ${T.grayBorder}`, backgroundColor: T.white, color: T.dark, fontSize: 11, cursor: 'pointer' }}>
                    {copied ? <><Check size={11} color={T.success} /> Copied</> : <><Copy size={11} /> Copy</>}
                  </button>
                </div>
              )}
            </div>
            <div style={{ padding: '16px 18px', minHeight: 300 }}>
              {aiText ? (
                <div style={{ backgroundColor: '#FEFCE8', borderRadius: 8, padding: '14px 16px', border: `1px solid ${T.gold}44` }}>
                  <MarkdownRenderer text={aiText} streaming={aiStreaming} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 280, gap: 12 }}>
                  <Utensils size={40} color={T.grayBorder} />
                  <div style={{ fontFamily: T.fontSerif, fontSize: 16, color: T.dark }}>Ready to pair</div>
                  <div style={{ fontSize: 13, color: T.gray, textAlign: 'center', maxWidth: 280 }}>
                    Enter your tasting menu courses and click "Generate Wine Pairings" — AI will suggest wines from your list with guest copy and staff talking points.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
