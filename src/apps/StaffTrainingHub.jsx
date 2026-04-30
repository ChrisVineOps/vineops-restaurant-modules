import Logo from '../Logo.jsx'
import MarkdownRenderer from '../MarkdownRenderer.jsx'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Anthropic from '@anthropic-ai/sdk'
import {
  GraduationCap, ArrowLeft, Key, Eye, EyeOff, Sparkles,
  ChevronRight, RotateCcw, CheckCircle, XCircle,
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

const TRAINING_WINES = [
  { id: 1, name: 'Rombauer Chardonnay', vintage: 2022, region: 'Napa Valley', variety: 'Chardonnay', price: 95, btg: true },
  { id: 2, name: 'Caymus Cabernet Sauvignon', vintage: 2021, region: 'Napa Valley', variety: 'Cabernet Sauvignon', price: 185, btg: false },
  { id: 3, name: 'Sonoma-Cutrer Chardonnay', vintage: 2022, region: 'Russian River Valley', variety: 'Chardonnay', price: 85, btg: true },
  { id: 4, name: 'Veuve Clicquot Yellow Label', vintage: 'NV', region: 'Champagne', variety: 'Champagne Blend', price: 135, btg: false },
  { id: 5, name: 'Schramsberg Blanc de Blancs', vintage: 2019, region: 'North Coast', variety: 'Chardonnay', price: 98, btg: true },
  { id: 6, name: 'Louis Jadot Chambolle-Musigny 1er Cru', vintage: 2018, region: 'Burgundy', variety: 'Pinot Noir', price: 210, btg: false },
  { id: 7, name: 'Duckhorn Merlot', vintage: 2021, region: 'Napa Valley', variety: 'Merlot', price: 115, btg: false },
  { id: 8, name: 'Whispering Angel Rosé', vintage: 2023, region: 'Provence', variety: 'Grenache Rosé', price: 72, btg: true },
  { id: 9, name: 'Gaja Barbaresco', vintage: 2018, region: 'Piedmont', variety: 'Nebbiolo', price: 385, btg: false },
  { id: 10, name: 'Egon Müller Scharzhofberger Spätlese', vintage: 2018, region: 'Mosel', variety: 'Riesling', price: 245, btg: false },
  { id: 11, name: 'Cloudy Bay Sauvignon Blanc', vintage: 2023, region: 'Marlborough', variety: 'Sauvignon Blanc', price: 68, btg: true },
  { id: 12, name: 'Dom Pérignon', vintage: 2013, region: 'Champagne', variety: 'Champagne Blend', price: 420, btg: false },
]

export default function StaffTrainingHub() {
  const [apiKey, setApiKey] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [selectedWine, setSelectedWine] = useState(null)
  const [trainingBrief, setTrainingBrief] = useState('')
  const [briefStreaming, setBriefStreaming] = useState(false)
  const [mode, setMode] = useState('brief') // 'brief' | 'quiz'
  const [quiz, setQuiz] = useState(null)
  const [quizStreaming, setQuizStreaming] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [filterBTG, setFilterBTG] = useState(false)

  function handleKeySubmit(action) {
    setShowKeyModal(false)
    if (action === 'brief') generateBrief()
    if (action === 'quiz') generateQuiz()
  }

  async function generateBrief() {
    if (!apiKey) { setShowKeyModal(true); return }
    if (!selectedWine) return
    setTrainingBrief('')
    setBriefStreaming(true)
    setMode('brief')
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
    let full = ''
    try {
      const stream = await client.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Create a pre-shift training brief for front-of-house staff at a fine-dining restaurant.

Wine: ${selectedWine.name} ${selectedWine.vintage}
Region: ${selectedWine.region}
Variety: ${selectedWine.variety}
Price: $${selectedWine.price}
${selectedWine.btg ? 'Available by the glass' : 'Bottle only'}

Write 4 sections using markdown headers:
## Tasting Profile (3-4 flavor descriptors, body, finish — use evocative language)
## The Story (producer, region, why it\'s special — 2 sentences max)
## Food Pairings (3 specific dishes, ideally from a fine-dining context)
## Table Talk (1 sentence a server can say when recommending this wine)

Be specific, elegant, and guest-facing. No preamble.`,
        }],
      })
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
          full += chunk.delta.text
          setTrainingBrief(full)
        }
      }
    } catch { /* silent */ }
    setBriefStreaming(false)
  }

  async function generateQuiz() {
    if (!apiKey) { setShowKeyModal(true); return }
    if (!selectedWine) return
    setQuiz(null)
    setQuizStreaming(true)
    setMode('quiz')
    setAnswers({})
    setSubmitted(false)
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
    let full = ''
    try {
      const stream = await client.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `Create 4 multiple-choice quiz questions for ${selectedWine.name} ${selectedWine.vintage} (${selectedWine.variety}, ${selectedWine.region}, $${selectedWine.price}).

Return ONLY valid JSON — no markdown, no explanation:
{
  "questions": [
    {
      "q": "question text",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "answer": "A"
    }
  ]
}

Topics: region facts, variety characteristics, food pairings, service temperature or glassware. Make 2 options clearly wrong, 1 plausible, 1 correct.`,
        }],
      })
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
          full += chunk.delta.text
        }
      }
      try {
        const parsed = JSON.parse(full.trim())
        setQuiz(parsed)
      } catch { /* silent */ }
    } catch { /* silent */ }
    setQuizStreaming(false)
  }

  const displayWines = filterBTG ? TRAINING_WINES.filter(w => w.btg) : TRAINING_WINES
  const score = submitted && quiz ? quiz.questions.filter((q, i) => answers[i]?.startsWith(q.answer)).length : null

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
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: T.fontSerif }}>Staff Training Hub</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>App 06 · AI-Augmented Automation · {TRAINING_WINES.length} Wines on List</div>
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
            <p style={{ fontSize: 13, color: T.gray, marginBottom: 16, lineHeight: 1.6 }}>Required for AI training content. Stays in-browser, never stored.</p>
            <div style={{ position: 'relative' }}>
              <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-..." style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 6, border: `1px solid ${T.grayBorder}`, fontSize: 13, fontFamily: 'monospace', boxSizing: 'border-box', outline: 'none' }} />
              <button onClick={() => setShowKey(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.gray }}>{showKey ? <EyeOff size={15} /> : <Eye size={15} />}</button>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowKeyModal(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: `1px solid ${T.grayBorder}`, backgroundColor: T.white, color: T.dark, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={() => handleKeySubmit(mode)} style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: 'none', backgroundColor: T.burgundy, color: T.white, fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>Save & Continue</button>
            </div>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>

          {/* Wine selector */}
          <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '14px 16px', boxShadow: T.shadowSm, alignSelf: 'start' }}>
            <div style={{ fontFamily: T.fontSerif, fontSize: 14, fontWeight: 700, color: T.dark, marginBottom: 12 }}>Select a Wine</div>
            <button onClick={() => setFilterBTG(v => !v)} style={{ marginBottom: 10, padding: '4px 10px', borderRadius: 99, border: `1px solid ${filterBTG ? T.burgundy : T.grayBorder}`, backgroundColor: filterBTG ? T.burgundy : T.white, color: filterBTG ? T.white : T.dark, fontSize: 11, fontWeight: filterBTG ? 700 : 400, cursor: 'pointer', width: '100%' }}>
              {filterBTG ? '✓ BTG Only' : 'Show BTG Only'}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {displayWines.map(w => (
                <button
                  key={w.id}
                  onClick={() => { setSelectedWine(w); setTrainingBrief(''); setQuiz(null); setMode('brief') }}
                  style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${selectedWine?.id === w.id ? T.burgundy : T.grayBorder}`, backgroundColor: selectedWine?.id === w.id ? T.burgundy + '10' : T.white, textAlign: 'left', cursor: 'pointer', transition: 'border 0.1s' }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: selectedWine?.id === w.id ? T.burgundy : T.dark, lineHeight: 1.3 }}>{w.name}</div>
                  <div style={{ fontSize: 10, color: T.gray, marginTop: 2 }}>{w.vintage} · {w.variety}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: T.gray }}>{w.region}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.burgundy }}>${w.price}</span>
                  </div>
                  {w.btg && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 99, backgroundColor: T.burgundy + '18', color: T.burgundy, marginTop: 3, display: 'inline-block' }}>BTG</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {!selectedWine ? (
              <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '40px 24px', textAlign: 'center', boxShadow: T.shadowSm }}>
                <GraduationCap size={40} color={T.grayBorder} style={{ margin: '0 auto 16px' }} />
                <div style={{ fontFamily: T.fontSerif, fontSize: 18, color: T.dark, marginBottom: 8 }}>Select a wine to begin</div>
                <div style={{ fontSize: 13, color: T.gray }}>Choose any wine from the list to generate a training brief or launch a quiz for your team.</div>
              </div>
            ) : (
              <>
                {/* Wine header + mode toggle */}
                <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '14px 18px', boxShadow: T.shadowSm }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontFamily: T.fontSerif, fontSize: 18, fontWeight: 700, color: T.dark }}>{selectedWine.name} {selectedWine.vintage}</div>
                      <div style={{ fontSize: 13, color: T.gray, marginTop: 2 }}>{selectedWine.variety} · {selectedWine.region} · ${selectedWine.price}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={generateBrief}
                        disabled={briefStreaming}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: T.burgundy, color: T.white, border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: briefStreaming ? 'default' : 'pointer', opacity: briefStreaming ? 0.7 : 1 }}
                      >
                        <Sparkles size={12} /> {briefStreaming ? 'Generating…' : 'Training Brief'}
                      </button>
                      <button
                        onClick={generateQuiz}
                        disabled={quizStreaming}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: T.gold, color: '#7C4700', border: 'none', borderRadius: 6, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: quizStreaming ? 'default' : 'pointer', opacity: quizStreaming ? 0.7 : 1 }}
                      >
                        <GraduationCap size={12} /> {quizStreaming ? 'Building…' : 'Quiz Mode'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Training brief */}
                {mode === 'brief' && (
                  <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, marginBottom: 12 }}>✨ AI Training Brief</div>
                    {trainingBrief ? (
                      <div style={{ backgroundColor: '#FEFCE8', borderRadius: 8, padding: '14px 16px', border: `1px solid ${T.gold}44` }}>
                        <MarkdownRenderer text={trainingBrief} streaming={briefStreaming} />
                      </div>
                    ) : (
                      <div style={{ padding: '24px 0', textAlign: 'center', color: T.gray, fontSize: 13 }}>
                        Click "Training Brief" to generate tasting notes, food pairings, and table talk for this wine.
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz mode */}
                {mode === 'quiz' && (
                  <div style={{ backgroundColor: T.white, borderRadius: T.radiusCard, border: `1px solid ${T.grayBorder}`, padding: '16px 18px', boxShadow: T.shadowSm }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, marginBottom: 12 }}>✨ AI Pre-Shift Quiz</div>
                    {quizStreaming && <div style={{ fontSize: 13, color: T.gray }}>Building quiz…</div>}
                    {!quizStreaming && !quiz && (
                      <div style={{ padding: '24px 0', textAlign: 'center', color: T.gray, fontSize: 13 }}>
                        Click "Quiz Mode" to generate a 4-question knowledge check for your team.
                      </div>
                    )}
                    {quiz && (
                      <div>
                        {submitted && (
                          <div style={{ marginBottom: 16, padding: '12px 16px', backgroundColor: score >= 3 ? '#F0FDF4' : '#FEF2F2', borderRadius: 8, border: `1px solid ${score >= 3 ? T.success : T.error}44` }}>
                            <span style={{ fontWeight: 700, color: score >= 3 ? T.success : T.error, fontSize: 14 }}>{score}/{quiz.questions.length} correct</span>
                            <span style={{ color: T.gray, fontSize: 12, marginLeft: 8 }}>{score >= 3 ? '— Great work!' : '— Review the brief and try again'}</span>
                          </div>
                        )}
                        {quiz.questions.map((q, qi) => {
                          const sel = answers[qi]
                          const correct = q.answer
                          return (
                            <div key={qi} style={{ marginBottom: 20 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 8 }}>{qi + 1}. {q.q}</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {q.options.map((opt, oi) => {
                                  const letter = opt[0]
                                  const isSelected = sel === opt
                                  const isCorrect = letter === correct
                                  let bg = T.white, border = T.grayBorder, color = T.dark
                                  if (submitted) {
                                    if (isCorrect) { bg = '#F0FDF4'; border = T.success; color = T.success }
                                    else if (isSelected) { bg = '#FEF2F2'; border = T.error; color = T.error }
                                  } else if (isSelected) {
                                    bg = T.burgundy + '10'; border = T.burgundy; color = T.burgundy
                                  }
                                  return (
                                    <button
                                      key={oi}
                                      disabled={submitted}
                                      onClick={() => setAnswers(a => ({ ...a, [qi]: opt }))}
                                      style={{ padding: '9px 12px', borderRadius: 7, border: `1px solid ${border}`, backgroundColor: bg, textAlign: 'left', fontSize: 12, color, cursor: submitted ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                                    >
                                      {submitted && isCorrect && <CheckCircle size={13} color={T.success} />}
                                      {submitted && isSelected && !isCorrect && <XCircle size={13} color={T.error} />}
                                      {opt}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                        <div style={{ display: 'flex', gap: 10 }}>
                          {!submitted ? (
                            <button
                              onClick={() => setSubmitted(true)}
                              disabled={Object.keys(answers).length < quiz.questions.length}
                              style={{ padding: '9px 20px', borderRadius: 6, border: 'none', backgroundColor: T.burgundy, color: T.white, fontSize: 13, fontWeight: 700, cursor: Object.keys(answers).length < quiz.questions.length ? 'default' : 'pointer', opacity: Object.keys(answers).length < quiz.questions.length ? 0.5 : 1 }}
                            >
                              Submit Answers
                            </button>
                          ) : (
                            <button
                              onClick={() => { setAnswers({}); setSubmitted(false); generateQuiz() }}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 6, border: `1px solid ${T.grayBorder}`, backgroundColor: T.white, color: T.dark, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                            >
                              <RotateCcw size={13} /> New Quiz
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
