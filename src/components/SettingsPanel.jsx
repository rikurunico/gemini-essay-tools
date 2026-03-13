import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const PRESETS = [
  { name: 'Precise',  temperature: 0.1,  topP: 0.8  },
  { name: 'Balanced', temperature: 0.3,  topP: 0.9  },
  { name: 'Creative', temperature: 0.8,  topP: 0.95 },
]

function LevelControls({ label, levels, onLevelsChange, min, max, step }) {
  const selectedCount = levels.filter((l) => l.selected).length

  function toggleLevel(key) {
    if (selectedCount === 1 && levels.find((l) => l.key === key)?.selected) return // must keep ≥1
    onLevelsChange(levels.map((l) => l.key === key ? { ...l, selected: !l.selected } : l))
  }

  function updateValue(key, raw) {
    const parsed = parseFloat(raw)
    if (!isFinite(parsed)) return
    const clamped = Math.min(max, Math.max(min, Math.round(parsed / step) * step))
    onLevelsChange(levels.map((l) => l.key === key ? { ...l, value: clamped } : l))
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1.5">
        {levels.map((level) => (
          <button
            key={level.key}
            onClick={() => toggleLevel(level.key)}
            className={cn(
              'flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors',
              level.selected
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            {level.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {levels.map((level) => (
          <div key={level.key} className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground">{level.label}</span>
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={level.value.toFixed(2)}
              onChange={(e) => updateValue(level.key, e.target.value)}
              className={cn(
                'w-full h-7 rounded border bg-input px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring text-foreground',
                !level.selected && 'opacity-40'
              )}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SettingsPanel({
  mode,
  models,
  selectedModel, onModelChange,
  temperature, onTemperatureChange,
  topP, onTopPChange,
  tempLevels, onTempLevelsChange,
  topPLevels, onTopPLevelsChange,
}) {
  const [collapsed, setCollapsed] = useState(false)

  function applyPreset(preset) {
    onTemperatureChange(preset.temperature)
    onTopPChange(preset.topP)
  }

  const activePreset = PRESETS.find(
    (p) => p.temperature === temperature && p.topP === topP
  )

  const selectedTempCount = tempLevels?.filter((l) => l.selected).length ?? 0
  const selectedTopPCount = topPLevels?.filter((l) => l.selected).length ?? 0
  const comboCount = selectedTempCount * selectedTopPCount

  return (
    <div className="border border-border rounded-lg bg-card">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-accent/50 transition-colors rounded-lg"
      >
        <span className="flex items-center gap-2">
          Settings
          {mode === 'single' && activePreset && (
            <span className="text-xs text-muted-foreground font-normal">— {activePreset.name}</span>
          )}
        </span>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-4">
          <Separator />

          {/* Model */}
          <div className="space-y-1.5">
            <Label>Model</Label>
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-input px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {models.length === 0 && (
                <option value="gemini-2.0-flash">gemini-2.0-flash (loading…)</option>
              )}
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.displayName || m.id}</option>
              ))}
            </select>
          </div>

          <Separator />

          {mode === 'single' ? (
            <>
              {/* Presets */}
              <div className="space-y-1.5">
                <Label>Presets</Label>
                <div className="flex gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => applyPreset(p)}
                      className={cn(
                        'flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors',
                        activePreset?.name === p.name
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-secondary text-secondary-foreground hover:bg-accent'
                      )}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Temperature</Label>
                  <span className="text-xs text-muted-foreground font-mono">{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range" min={0} max={2} step={0.01} value={temperature}
                  onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 appearance-none bg-border rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
              </div>

              {/* Top-P */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Top-P</Label>
                  <span className="text-xs text-muted-foreground font-mono">{topP.toFixed(2)}</span>
                </div>
                <input
                  type="range" min={0} max={1} step={0.01} value={topP}
                  onChange={(e) => onTopPChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 appearance-none bg-border rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                />
              </div>
            </>
          ) : (
            <>
              {/* Batch mode: level controls */}
              <LevelControls
                label="Temperature Levels"
                levels={tempLevels}
                onLevelsChange={onTempLevelsChange}
                min={0} max={2} step={0.01}
              />

              <Separator />

              <LevelControls
                label="Top-P Levels"
                levels={topPLevels}
                onLevelsChange={onTopPLevelsChange}
                min={0} max={1} step={0.01}
              />

              <Separator />

              {/* Combo count */}
              <div className="flex items-center justify-between rounded-md bg-primary/10 border border-primary/20 px-3 py-2">
                <span className="text-xs text-muted-foreground">Combinations per essay</span>
                <span className="text-sm font-bold text-primary">{comboCount}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
