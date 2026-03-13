import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

const DEFAULT_PREPROMPT = `You are an automated writing evaluation system. Correct errors inline, number them, and provide detailed explanations below. List all errors and type of errors.

Here is the essay to analyze:

{{essay}}`

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'dist')))

app.get('/api/models', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' })
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    )

    if (!response.ok) {
      const errData = await response.json()
      return res.status(response.status).json({
        error: errData?.error?.message || 'Failed to fetch models.',
      })
    }

    const data = await response.json()
    const models = (data.models || [])
      .filter(
        (m) =>
          m.name.toLowerCase().includes('gemini') &&
          m.supportedGenerationMethods?.includes('generateContent')
      )
      .map((m) => ({
        id: m.name.replace('models/', ''),
        displayName: m.displayName,
        description: m.description,
      }))

    res.json({ models })
  } catch (err) {
    console.error('Error fetching models:', err)
    res.status(500).json({ error: 'Internal server error.' })
  }
})

app.post('/api/correct', async (req, res) => {
  const { essay, temperature, topP, model, preprompt } = req.body

  if (!essay || essay.trim() === '') {
    return res.status(400).json({ error: 'Essay text is required.' })
  }

  const selectedModel =
    typeof model === 'string' && model.trim() ? model.trim() : 'gemini-2.0-flash'
  const safeTemperature = Number.isFinite(parseFloat(temperature)) ? parseFloat(temperature) : 0.3
  const safeTopP = Number.isFinite(parseFloat(topP)) ? parseFloat(topP) : 0.9

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' })
  }

  const template =
    typeof preprompt === 'string' && preprompt.trim() ? preprompt : DEFAULT_PREPROMPT
  const prompt = template.replace('{{essay}}', essay)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: safeTemperature,
            topP: safeTopP,
            maxOutputTokens: 4096,
          },
        }),
      }
    )

    if (!response.ok) {
      const errData = await response.json()
      return res.status(response.status).json({
        error: errData?.error?.message || 'Gemini API request failed.',
      })
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return res.status(500).json({ error: 'No response from Gemini API.' })
    }

    res.json({ result: text })
  } catch (err) {
    console.error('Error calling Gemini API:', err)
    res.status(500).json({ error: 'Internal server error.' })
  }
})

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
