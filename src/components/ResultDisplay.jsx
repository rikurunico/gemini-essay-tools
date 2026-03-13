import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function renderMarkdown(text) {
  if (!text) return []
  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <pre key={i} className="bg-muted rounded-md p-3 text-sm font-mono overflow-x-auto my-2 text-foreground/90">
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      i++
      continue
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-base font-semibold mt-4 mb-1">{inlineFormat(line.slice(4))}</h3>)
      i++; continue
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-lg font-bold mt-5 mb-2">{inlineFormat(line.slice(3))}</h2>)
      i++; continue
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-xl font-bold mt-5 mb-2">{inlineFormat(line.slice(2))}</h1>)
      i++; continue
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      elements.push(<hr key={i} className="border-border my-3" />)
      i++; continue
    }

    // Bullet list
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={i} className="list-disc list-inside space-y-1 my-2 text-sm">
          {items.map((item, j) => (
            <li key={j} className="text-foreground/90">{inlineFormat(item)}</li>
          ))}
        </ul>
      )
      continue
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      elements.push(
        <ol key={i} className="list-decimal list-inside space-y-1 my-2 text-sm">
          {items.map((item, j) => (
            <li key={j} className="text-foreground/90">{inlineFormat(item)}</li>
          ))}
        </ol>
      )
      continue
    }

    // Empty line → spacer
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />)
      i++; continue
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-sm text-foreground/90 leading-relaxed">
        {inlineFormat(line)}
      </p>
    )
    i++
  }

  return elements
}

function inlineFormat(text) {
  // Split by bold/italic/code markers
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-primary">{part.slice(1, -1)}</code>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i} className="italic">{part.slice(1, -1)}</em>
    return part
  })
}

export default function ResultDisplay({ result, className }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('relative group', className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy result"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
      <div className="prose prose-invert max-w-none">
        {renderMarkdown(result)}
      </div>
    </div>
  )
}
