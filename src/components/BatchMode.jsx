import { useState } from 'react'
import {
  Plus, Trash2, Loader2, PlayCircle, Download,
  ChevronDown, ChevronRight, CheckCircle, XCircle, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import ResultDisplay from './ResultDisplay'
import { cn } from '@/lib/utils'

function createEssay(text = '') {
  return { id: crypto.randomUUID(), text, results: {} }
}

function getCombinations(tempLevels, topPLevels) {
  const combos = []
  for (const t of tempLevels) {
    if (!t.selected) continue
    for (const p of topPLevels) {
      if (!p.selected) continue
      combos.push({
        key: `t${t.value.toFixed(2)}_p${p.value.toFixed(2)}`,
        label: `T:${t.label} ${t.value.toFixed(2)} / P:${p.label} ${p.value.toFixed(2)}`,
        temperature: t.value,
        topP: p.value,
      })
    }
  }
  return combos
}

function escapeCsv(val) {
  if (val == null) return ''
  const s = String(val)
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? '"' + s.replace(/"/g, '""') + '"'
    : s
}

function downloadCSV(essays, combos) {
  const headers = ['Essay #', 'Combo', 'Temperature', 'Top-P', 'Essay', 'Result', 'Status', 'Processed At']
  const rows = []
  essays.forEach((essay, i) => {
    combos.forEach((combo) => {
      const r = essay.results[combo.key]
      rows.push([
        i + 1,
        combo.label,
        combo.temperature,
        combo.topP,
        essay.text,
        r?.result || r?.error || '',
        r?.status || 'pending',
        r?.timestamp || '',
      ])
    })
  })
  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `essays-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function ComboStatusIcon({ status }) {
  if (status === 'done')       return <CheckCircle className="h-3 w-3 text-emerald-400" />
  if (status === 'error')      return <XCircle className="h-3 w-3 text-destructive" />
  if (status === 'processing') return <Loader2 className="h-3 w-3 animate-spin text-yellow-400" />
  return <Clock className="h-3 w-3 text-muted-foreground/40" />
}

function EssayCard({ essay, idx, combos, onTextChange, onRemove, disabled }) {
  const [expanded, setExpanded] = useState(true)
  const [activeCombo, setActiveCombo] = useState(0)

  const hasAnyResult = combos.some((c) => essay.results[c.key]?.status === 'done')
  const doneCount = combos.filter((c) => essay.results[c.key]?.status === 'done').length
  const activeKey = combos[activeCombo]?.key
  const activeResult = activeKey ? essay.results[activeKey] : null

  return (
    <Card>
      <CardContent className="p-0">
        {/* Header row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <span className="text-sm font-medium text-muted-foreground w-6">#{idx + 1}</span>
          <span className="text-sm truncate flex-1 text-foreground/80">
            {essay.text.trim().slice(0, 60) || (
              <span className="text-muted-foreground italic">Empty</span>
            )}
          </span>
          {combos.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {doneCount}/{combos.length}
            </span>
          )}
          <Button
            variant="ghost" size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(essay.id)}
            disabled={disabled}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {expanded && (
          <>
            <Separator />
            <div className="p-4 space-y-3">
              {/* Essay input */}
              <Textarea
                value={essay.text}
                onChange={(e) => onTextChange(essay.id, e.target.value)}
                placeholder={`Essay #${idx + 1} — paste text here...`}
                className="min-h-[100px] text-sm"
                disabled={disabled}
              />

              {/* Results section */}
              {hasAnyResult && combos.length > 0 && (
                <div className="rounded-md border border-border overflow-hidden">
                  {/* Combo tabs */}
                  <div className="flex gap-0 border-b border-border overflow-x-auto bg-muted/30">
                    {combos.map((combo, ci) => {
                      const r = essay.results[combo.key]
                      return (
                        <button
                          key={combo.key}
                          onClick={() => setActiveCombo(ci)}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap border-r border-border transition-colors flex-shrink-0',
                            ci === activeCombo
                              ? 'bg-background text-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                          )}
                        >
                          <ComboStatusIcon status={r?.status} />
                          {combo.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Active combo result */}
                  <div className="p-3 bg-background">
                    {!activeResult || activeResult.status === 'processing' ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Analyzing…
                      </div>
                    ) : activeResult.status === 'error' ? (
                      <div className="text-xs text-destructive">{activeResult.error}</div>
                    ) : (
                      <ResultDisplay result={activeResult.result} />
                    )}
                  </div>
                </div>
              )}

              {/* Processing indicator for combos still running */}
              {!hasAnyResult && combos.some((c) => essay.results[c.key]?.status === 'processing') && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Processing combinations…
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function BatchMode({ settings }) {
  const [essays, setEssays] = useState([createEssay()])
  const [processing, setProcessing] = useState(false)

  const combos = getCombinations(settings.tempLevels, settings.topPLevels)

  function updateEssayText(id, text) {
    setEssays((prev) => prev.map((e) => e.id === id ? { ...e, text } : e))
  }

  function updateEssayResult(id, comboKey, patch) {
    setEssays((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, results: { ...e.results, [comboKey]: { ...e.results[comboKey], ...patch } } }
          : e
      )
    )
  }

  function addEssay() {
    setEssays((prev) => [...prev, createEssay()])
  }

  function removeEssay(id) {
    setEssays((prev) => prev.filter((e) => e.id !== id))
  }

  async function processOne(essay, combo) {
    updateEssayResult(essay.id, combo.key, { status: 'processing', result: null, error: null })
    try {
      const res = await fetch('/api/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essay: essay.text,
          temperature: combo.temperature,
          topP: combo.topP,
          model: settings.model,
          preprompt: settings.preprompt,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      updateEssayResult(essay.id, combo.key, {
        status: 'done',
        result: data.result,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      updateEssayResult(essay.id, combo.key, {
        status: 'error',
        error: err.message,
        timestamp: new Date().toISOString(),
      })
    }
  }

  async function processAll() {
    if (processing || combos.length === 0) return
    setProcessing(true)

    const pending = essays.filter((e) => e.text.trim())
    const tasks = pending.flatMap((essay) => combos.map((combo) => processOne(essay, combo)))
    await Promise.allSettled(tasks)

    setProcessing(false)
  }

  const totalDone = essays.reduce(
    (acc, e) => acc + Object.values(e.results).filter((r) => r.status === 'done').length,
    0
  )
  const hasResults = totalDone > 0
  const hasText = essays.some((e) => e.text.trim())

  return (
    <div className="space-y-4">
      {combos.length === 0 && (
        <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
          No combinations selected. Enable at least one Temperature and one Top-P level in Settings.
        </div>
      )}

      <div className="space-y-3">
        {essays.map((essay, idx) => (
          <EssayCard
            key={essay.id}
            essay={essay}
            idx={idx}
            combos={combos}
            onTextChange={updateEssayText}
            onRemove={removeEssay}
            disabled={processing}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <Button variant="outline" size="sm" onClick={addEssay} disabled={processing} className="gap-2">
          <Plus className="h-3.5 w-3.5" />
          Add Essay
        </Button>

        <div className="flex items-center gap-2">
          {hasResults && (
            <Button
              variant="outline" size="sm"
              onClick={() => downloadCSV(essays, combos)}
              className="gap-2"
            >
              <Download className="h-3.5 w-3.5" />
              Download CSV
              <span className="text-muted-foreground text-xs">({totalDone})</span>
            </Button>
          )}
          <Button
            onClick={processAll}
            disabled={processing || !hasText || combos.length === 0}
            className="gap-2"
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4" />
            )}
            {processing ? 'Processing…' : 'Process All'}
          </Button>
        </div>
      </div>

      {hasResults && (
        <p className="text-xs text-muted-foreground text-right">
          {totalDone} result{totalDone !== 1 ? 's' : ''} across {essays.length} essay{essays.length !== 1 ? 's' : ''} × {combos.length} combo{combos.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
