import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import ResultDisplay from './ResultDisplay'

export default function SingleMode({ settings }) {
  const [essay, setEssay] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleCorrect() {
    if (!essay.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essay,
          temperature: settings.temperature,
          topP: settings.topP,
          model: settings.model,
          preprompt: settings.preprompt,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setResult(data.result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Input */}
      <div className="space-y-2">
        <Textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="Paste your essay here..."
          className="min-h-[200px] text-sm leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {essay.trim().split(/\s+/).filter(Boolean).length} words
          </span>
          <Button
            onClick={handleCorrect}
            disabled={loading || !essay.trim()}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? 'Correcting…' : 'Correct Essay'}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <Card>
          <CardContent className="p-4">
            <ResultDisplay result={result} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
