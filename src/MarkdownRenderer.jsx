const T = {
  burgundy: '#6B1F2A',
  dark:     '#2E2E3E',
  cream:    '#F5F3EF',
  white:    '#FFFFFF',
  gray:     '#6B7280',
  grayBorder: '#E5E7EB',
  fontSerif: 'Playfair Display, Georgia, serif',
}

function renderInline(text) {
  const parts = []
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g
  let last = 0
  let match
  let key = 0
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={key++}>{text.slice(last, match.index)}</span>)
    const inner = match[0]
    if (inner.startsWith('**')) {
      parts.push(<strong key={key++} style={{ fontWeight: 700, color: T.dark }}>{inner.slice(2, -2)}</strong>)
    } else {
      parts.push(<em key={key++} style={{ fontStyle: 'italic' }}>{inner.slice(1, -1)}</em>)
    }
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(<span key={key++}>{text.slice(last)}</span>)
  return parts.length ? parts : text
}

export default function MarkdownRenderer({ text, streaming }) {
  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontFamily: T.fontSerif, fontSize: 18, fontWeight: 700, color: T.dark, marginBottom: 8, marginTop: elements.length ? 20 : 0, borderBottom: `1px solid ${T.grayBorder}`, paddingBottom: 6 }}>{line.slice(3)}</h2>)
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontFamily: T.fontSerif, fontSize: 15, fontWeight: 700, color: T.dark, marginBottom: 6, marginTop: 16 }}>{line.slice(4)}</h3>)
    } else if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      elements.push(<p key={i} style={{ fontSize: 13, fontWeight: 700, color: T.dark, marginBottom: 4 }}>{line.slice(2, -2)}</p>)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(<li key={i} style={{ fontSize: 13, color: T.dark, lineHeight: 1.7, marginBottom: 2 }}>{renderInline(lines[i].slice(2))}</li>)
        i++
      }
      elements.push(<ul key={`ul-${i}`} style={{ paddingLeft: 20, marginBottom: 12, marginTop: 4 }}>{items}</ul>)
      continue
    } else if (/^\d+\. /.test(line)) {
      const items = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={i} style={{ fontSize: 13, color: T.dark, lineHeight: 1.7, marginBottom: 2 }}>{renderInline(lines[i].replace(/^\d+\. /, ''))}</li>)
        i++
      }
      elements.push(<ol key={`ol-${i}`} style={{ paddingLeft: 20, marginBottom: 12, marginTop: 4 }}>{items}</ol>)
      continue
    } else if (line.startsWith('|') && lines[i + 1]?.match(/^\|[-| ]+\|/)) {
      const headers = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(h => h.trim())
      i += 2
      const rows = []
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(lines[i].split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim()))
        i++
      }
      elements.push(
        <div key={`table-${i}`} style={{ overflowX: 'auto', marginBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{headers.map((h, j) => <th key={j} style={{ textAlign: 'left', padding: '8px 12px', backgroundColor: T.burgundy + '0D', color: T.dark, fontWeight: 700, borderBottom: `2px solid ${T.burgundy}30` }}>{renderInline(h)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ backgroundColor: ri % 2 === 0 ? T.white : T.cream }}>
                  {row.map((cell, ci) => <td key={ci} style={{ padding: '8px 12px', borderBottom: `1px solid ${T.grayBorder}`, color: T.dark, lineHeight: 1.6 }}>{renderInline(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    } else if (line === '') {
      elements.push(<div key={i} style={{ height: 6 }} />)
    } else {
      elements.push(<p key={i} style={{ fontSize: 13, color: T.dark, lineHeight: 1.7, marginBottom: 6 }}>{renderInline(line)}</p>)
    }
    i++
  }

  return (
    <div>
      {elements}
      {streaming && <span style={{ display: 'inline-block', width: 2, height: 14, backgroundColor: T.burgundy, marginLeft: 2, animation: 'blink 0.7s infinite', verticalAlign: 'middle' }} />}
    </div>
  )
}
