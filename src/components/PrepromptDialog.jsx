import { useState, useEffect } from 'react'
import { SlidersHorizontal, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'

export const DEFAULT_PREPROMPT = `You are an automated writing evaluation system. Correct errors inline, number them, and provide detailed explanations below. List all errors and type of errors.

Here is the essay to analyze:

{{essay}}`

export default function PrepromptDialog({ preprompt, onChange }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(preprompt)

  useEffect(() => {
    if (open) setDraft(preprompt)
  }, [open, preprompt])

  function handleSave() {
    onChange(draft)
    setOpen(false)
  }

  function handleReset() {
    setDraft(DEFAULT_PREPROMPT)
  }

  const hasPlaceholder = draft.includes('{{essay}}')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Preprompt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>System Preprompt</DialogTitle>
          <DialogDescription>
            Customize the instruction sent to Gemini. Use{' '}
            <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-primary">
              {'{{essay}}'}
            </code>{' '}
            as placeholder for the essay content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-[280px] font-mono text-sm"
            placeholder="Enter your system prompt here..."
          />
          {!hasPlaceholder && (
            <p className="text-xs text-destructive">
              Warning: missing{' '}
              <code className="font-mono">{'{{essay}}'}</code> — the essay will not be inserted.
            </p>
          )}
        </div>

        <DialogFooter className="flex-row items-center justify-between sm:justify-between">
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!hasPlaceholder}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
