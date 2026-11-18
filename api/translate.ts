const MAX_TEXTS = 128
const MAX_TOTAL_CHARACTERS = 25000

type GoogleTranslationResponse = {
  data?: {
    translations?: Array<{ translatedText?: string }>
  }
}

function jsonResponse(body: Record<string, unknown>, status: number, headers?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  })
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.length > 0)
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Use POST to request translation.' }, 405, { Allow: 'POST' })
    }

    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
    if (!apiKey) return jsonResponse({ error: 'Kinyarwanda translation is not configured on this deployment.' }, 503)

    let payload: unknown
    try {
      payload = await request.json()
    } catch {
      return jsonResponse({ error: 'The translation request must contain valid JSON.' }, 400)
    }

    if (typeof payload !== 'object' || payload === null || !('texts' in payload)) {
      return jsonResponse({ error: 'Provide a texts array to translate.' }, 400)
    }

    const texts = (payload as { texts?: unknown }).texts
    if (!isStringArray(texts) || texts.length === 0 || texts.length > MAX_TEXTS) {
      return jsonResponse({ error: `Provide between 1 and ${MAX_TEXTS} non-empty text items.` }, 400)
    }

    if (texts.some((text) => text.length > MAX_TOTAL_CHARACTERS) || texts.reduce((total, text) => total + text.length, 0) > MAX_TOTAL_CHARACTERS) {
      return jsonResponse({ error: `Keep each request under ${MAX_TOTAL_CHARACTERS} characters.` }, 413)
    }

    let upstream: Response
    try {
      upstream = await fetch('https://translation.googleapis.com/language/translate/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
        },
        body: JSON.stringify({ q: texts, source: 'en', target: 'rw', format: 'text' }),
      })
    } catch {
      console.error('Google Cloud Translation request could not be reached.')
      return jsonResponse({ error: 'The translation provider could not be reached. Please try again.' }, 502)
    }

    if (!upstream.ok) {
      console.error('Google Cloud Translation returned an error.', upstream.status)
      return jsonResponse({ error: 'The translation provider rejected the request. Check the API configuration and try again.' }, 502)
    }

    let result: GoogleTranslationResponse
    try {
      result = await upstream.json() as GoogleTranslationResponse
    } catch {
      console.error('Google Cloud Translation returned invalid JSON.')
      return jsonResponse({ error: 'The translation provider returned an invalid response.' }, 502)
    }

    const translations = result.data?.translations?.map((item) => item.translatedText)
    if (!translations || translations.length !== texts.length || translations.some((text) => typeof text !== 'string')) {
      console.error('Google Cloud Translation returned an incomplete response.')
      return jsonResponse({ error: 'The translation provider returned an incomplete response.' }, 502)
    }

    return jsonResponse({ translations }, 200)
  },
}
