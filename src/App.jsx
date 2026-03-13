import { useState, useEffect } from 'react'
import { PenLine, LayoutList } from 'lucide-react'
import { cn } from '@/lib/utils'
import PrepromptDialog, { DEFAULT_PREPROMPT } from './components/PrepromptDialog'
import SettingsPanel from './components/SettingsPanel'
import SingleMode from './components/SingleMode'
import BatchMode from './components/BatchMode'

const STORAGE_KEY = 'essay-corrector-preprompt'

const DEFAULT_TEMP_LEVELS = [
  { key: 'low',  label: 'Low',  value: 0.10, selected: true },
  { key: 'mid',  label: 'Mid',  value: 0.30, selected: true },
  { key: 'high', label: 'High', value: 0.70, selected: true },
]

const DEFAULT_TOPP_LEVELS = [
  { key: 'low',  label: 'Low',  value: 0.85, selected: true },
  { key: 'mid',  label: 'Mid',  value: 0.90, selected: true },
  { key: 'high', label: 'High', value: 0.95, selected: true },
]

export default function App() {
  const [mode, setMode] = useState('single')
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash')
  const [temperature, setTemperature] = useState(0.3)
  const [topP, setTopP] = useState(0.9)
  const [tempLevels, setTempLevels] = useState(DEFAULT_TEMP_LEVELS)
  const [topPLevels, setTopPLevels] = useState(DEFAULT_TOPP_LEVELS)
  const [preprompt, setPreprompt] = useState(
    () => localStorage.getItem(STORAGE_KEY) || DEFAULT_PREPROMPT
  )

  useEffect(() => {
    fetch('/api/models')
      .then((r) => r.json())
      .then((data) => {
        if (data.models?.length) {
          setModels(data.models)
          const flash = data.models.find((m) => m.id.includes('flash'))
          if (flash) setSelectedModel(flash.id)
        }
      })
      .catch(() => {})
  }, [])

  function handlePrepromptChange(value) {
    setPreprompt(value)
    localStorage.setItem(STORAGE_KEY, value)
  }

  const settings = { model: selectedModel, temperature, topP, preprompt, tempLevels, topPLevels }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <PenLine className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-none">Essay Corrector</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Powered by Gemini AI</p>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="ml-6 flex gap-1 bg-secondary rounded-lg p-1">
          <button
            onClick={() => setMode('single')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              mode === 'single'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <PenLine className="h-3.5 w-3.5" />
            Single
          </button>
          <button
            onClick={() => setMode('batch')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              mode === 'batch'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <LayoutList className="h-3.5 w-3.5" />
            Batch
          </button>
        </div>

        <div className="ml-auto">
          <PrepromptDialog preprompt={preprompt} onChange={handlePrepromptChange} />
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — Settings */}
        <aside className="w-64 border-r border-border p-4 flex-shrink-0 overflow-y-auto">
          <SettingsPanel
            mode={mode}
            models={models}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            temperature={temperature}
            onTemperatureChange={setTemperature}
            topP={topP}
            onTopPChange={setTopP}
            tempLevels={tempLevels}
            onTempLevelsChange={setTempLevels}
            topPLevels={topPLevels}
            onTopPLevelsChange={setTopPLevels}
          />
        </aside>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            {mode === 'single' ? (
              <SingleMode settings={settings} />
            ) : (
              <BatchMode settings={settings} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
