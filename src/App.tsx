import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Fragment } from 'react'
import './App.css'

type Page = 'home' | 'charts' | 'news' | 'story' | 'podcast' | 'contact' | 'story-tip' | 'kinyarwanda' | 'login' | 'dashboard'
type Route = { page: Page; section: string }
type SiteLanguage = 'en' | 'rw'
type StoryCategory = 'Local entertainment' | 'International' | 'Sports'
type StoryStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'published'
type UserRole = 'Admin' | 'Chief Editor' | 'Journalist'
type PodcastCategory = StoryCategory | 'Music' | 'Other'
type Story = {
  id: string
  authorId: string
  status: StoryStatus
  category: StoryCategory
  title: string
  summary: string
  body?: string
  image: string
  imageAlt: string
  youtubeUrl?: string
  createdAt?: string
  publishedAt?: string
  reviewedAt?: string
  reviewNote?: string
  href: string
}
type SiteSettings = {
  brandName: string
  motto: string
  contactEmail: string
  announcement: string
  headerKicker: string
  mastheadDescriptor: string
  homeStoriesEyebrow: string
  homeUpdatesEyebrow: string
  homeUpdatesTitle: string
  chartIntro: string
  podcastIntro: string
  contactIntro: string
  socialInstagram: string
  socialYouTube: string
  socialTikTok: string
  socialFacebook: string
  logoUrl: string
  headerAdLabel: string
  headerAdMedia: string
  sponsorLabel: string
  sponsorUrl: string
  seoTitle: string
  seoDescription: string
  adRevenue: string
}
type FeedbackMessage = {
  id: string
  storyId: string
  storyTitle: string
  authorId: string
  name: string
  email: string
  message: string
  received: string
}
type PodcastFeedback = {
  id: string
  episodeId: string
  episodeTitle: string
  name: string
  message: string
  received: string
}
type ViewerOpinion = {
  id: string
  name: string
  email: string
  message: string
  received: string
}
type StorySubmission = {
  id: string
  name: string
  email: string
  title: string
  category: StoryCategory
  details: string
  imageDataUrls: string[]
  videoLink: string
  localVideoKey?: string
  received: string
}
type PodcastEpisode = {
  id: string
  authorId: string
  status: StoryStatus
  isDemo?: boolean
  category?: PodcastCategory
  title: string
  summary: string
  thumbnail?: string
  youtubeUrl: string
  localVideoKey?: string
  createdAt: string
  publishedAt?: string
}
type HotPick = {
  id: string
  authorId: string
  status: StoryStatus
  isDemo?: boolean
  artist: string
  title: string
  genre: string
  cover: string
  link: string
  createdAt: string
}
type ChartEntryStatus = 'draft' | 'submitted' | 'published'
type ChartEntry = {
  id: string
  authorId: string
  status: ChartEntryStatus
  chartSlug: string
  artist: string
  title: string
  cover: string
  releaseDate: string
  createdAt: string
}
type ChartRow = { id?: string; artist: string; title: string; movement?: string; cover?: string; releaseDate?: string }
type DashboardUser = {
  id: string
  name: string
  username: string
  email: string
  role: UserRole
  passwordSalt: string
  passwordHash: string
}
type DashboardSession = { userId: string }
type AdminSetup = { name: string; username: string; email: string; password: string }
const COPYRIGHT_YEAR = new Date().getFullYear()
const defaultSettings: SiteSettings = {
  brandName: 'LEAF Entertainment',
  motto: 'Let ’Em All Fly.',
  contactEmail: 'hello@leafentertainment.com',
  announcement: 'New sounds. Big stories. Good energy.',
  headerKicker: 'A little more life in the mix',
  mastheadDescriptor: 'Culture, in motion',
  homeStoriesEyebrow: 'Stories to move you',
  homeUpdatesEyebrow: 'In the current',
  homeUpdatesTitle: 'Good things, just updated.',
  chartIntro: 'A snapshot of the songs and albums finding their way into repeat.',
  podcastIntro: 'Good conversations about the sounds, scenes and stories moving culture forward.',
  contactIntro: 'Share what you think, or send the LEAF editors a story worth checking out.',
  socialInstagram: 'https://www.instagram.com/',
  socialYouTube: 'https://www.youtube.com/',
  socialTikTok: 'https://www.tiktok.com/',
  socialFacebook: 'https://www.facebook.com/',
  logoUrl: '',
  headerAdLabel: 'Header banner · 728 × 60',
  headerAdMedia: '',
  sponsorLabel: 'Main sponsor placement',
  sponsorUrl: '',
  seoTitle: 'LEAF Entertainment | Let ’Em All Fly.',
  seoDescription: 'Entertainment, music, sport and culture from LEAF Entertainment.',
  adRevenue: '0',
}
const feedbackPlaceholders: FeedbackMessage[] = [
  { id: 'sample-1', storyId: 'local-voices', storyTitle: 'The new voices giving homegrown music its next big moment', authorId: 'seed-editor', name: 'Sample reader', email: 'reader@example.com', message: 'I would love to see more independent artists featured in the local charts.', received: 'Today, 09:42' },
  { id: 'sample-2', storyId: 'global-sound', storyTitle: 'Inside the records shaping this season’s global sound', authorId: 'seed-editor', name: 'LEAF Listener', email: 'listener@example.com', message: 'The latest podcast conversation gave me a new playlist for the week.', received: 'Yesterday, 16:18' },
  { id: 'sample-3', storyId: 'match-day', storyTitle: 'The soundtracks, rituals and rivalries behind match day', authorId: 'seed-editor', name: 'Example contributor', email: 'contributor@example.com', message: 'I have a story idea about a community music event coming up next month.', received: 'Sep 26, 2026' },
]
const storySubmissionPlaceholders: StorySubmission[] = []
const defaultPodcastEpisodes: PodcastEpisode[] = [
  {
    id: 'demo-podcast-1',
    authorId: 'seed-editor',
    status: 'published',
    isDemo: true,
    category: 'Music',
    title: 'The First Listen: Building a Song from a Small Idea',
    summary: 'A fictional host and guest talk through a melody, a rough recording and the choices that shape a new track.',
    thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=85',
    youtubeUrl: '',
    createdAt: '2026-11-18T08:00:00.000Z',
    publishedAt: '2026-11-18T08:00:00.000Z',
  },
  {
    id: 'demo-podcast-2',
    authorId: 'seed-editor',
    status: 'published',
    isDemo: true,
    category: 'Local entertainment',
    title: 'Behind the Set: A Conversation about Live Performance',
    summary: 'This sample episode explores stage preparation, audience connection and the details behind a fictional live set.',
    thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=85',
    youtubeUrl: '',
    createdAt: '2026-11-17T12:00:00.000Z',
    publishedAt: '2026-11-17T12:00:00.000Z',
  },
  {
    id: 'demo-podcast-3',
    authorId: 'seed-editor',
    status: 'published',
    isDemo: true,
    category: 'Music',
    title: 'New Voices: Finding Inspiration in Everyday Sounds',
    summary: 'A fictional artist shares how street rhythms, field recordings and studio experiments can spark a new idea.',
    thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=85',
    youtubeUrl: '',
    createdAt: '2026-11-16T10:00:00.000Z',
    publishedAt: '2026-11-16T10:00:00.000Z',
  },
]

const chartPages = [
  { slug: 'local-songs', label: 'Top 10 Local Songs' },
  { slug: 'local-albums', label: 'Top 10 Local Albums' },
  { slug: 'international-songs', label: 'International Charts' },
  { slug: 'international-albums', label: 'Top International Albums' },
]
const chartNavPages = [...chartPages, { slug: 'hot-picks', label: '🔥 LEAF Hot Picks' }]

const newsPages = [
  { slug: 'local', label: 'Local Entertainment' },
  { slug: 'international', label: 'International' },
  { slug: 'sports', label: 'Sports' },
]

const defaultStories: Story[] = [
  {
    id: 'local-voices',
    authorId: 'seed-editor',
    status: 'published',
    category: 'Local entertainment',
    title: 'The new voices giving homegrown music its next big moment',
    summary:
      'A generation of artists is building a sound that travels far beyond the places where it began.',
    image:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1500&q=85',
    imageAlt: 'A crowd gathered beneath the lights at a live music show',
    href: '#/news/local',
  },
  {
    id: 'global-sound',
    authorId: 'seed-editor',
    status: 'published',
    category: 'International',
    title: 'Inside the records shaping this season’s global sound',
    summary:
      'From unexpected collaborations to left-field production, the year’s most interesting releases share a restless spirit.',
    image:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1500&q=85',
    imageAlt: 'A singer performing into a microphone on stage',
    href: '#/news/international',
  },
  {
    id: 'match-day',
    authorId: 'seed-editor',
    status: 'published',
    category: 'Sports',
    title: 'The soundtracks, rituals and rivalries behind match day',
    summary:
      'Supporters are turning the walk to the stadium into an event of its own, one chant at a time.',
    image:
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1500&q=85',
    imageAlt: 'A football pitch ready for an evening match',
    href: '#/news/sports',
  },
]
const demoStories: Story[] = [
  {
    id: 'demo-news-local-1',
    authorId: 'seed-editor',
    status: 'published',
    category: 'Local entertainment',
    title: 'Kigali’s new listening room puts emerging artists center stage',
    summary: 'A fictional neighborhood venue is opening its doors to intimate sets, first releases and new creative collaborations.',
    body: 'Illustrative article content. The venue, artists and event details are fictional and should be replaced with verified reporting.',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1500&q=85',
    imageAlt: 'Audience enjoying a live music performance',
    createdAt: '2026-11-18T08:30:00.000Z',
    publishedAt: '2026-11-18T08:30:00.000Z',
    href: '#/news/local',
  },
  {
    id: 'demo-news-local-2',
    authorId: 'seed-editor',
    status: 'published',
    category: 'Local entertainment',
    title: 'A new generation of producers is shaping Rwanda’s next sound',
    summary: 'This sample feature follows fictional producers experimenting with live instruments, electronic textures and collaborative sessions.',
    body: 'Illustrative article content. Replace this fictional feature with reviewed, fact-checked reporting.',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1500&q=85',
    imageAlt: 'Music production equipment in a recording studio',
    createdAt: '2026-11-17T14:00:00.000Z',
    publishedAt: '2026-11-17T14:00:00.000Z',
    href: '#/news/local',
  },
  {
    id: 'demo-news-local-3',
    authorId: 'seed-editor',
    status: 'published',
    category: 'Local entertainment',
    title: 'Community arts weekend brings music, dance and makers together',
    summary: 'A fictional city arts weekend offers a preview of the workshops, performances and independent stalls in this layout sample.',
    body: 'Illustrative article content. Dates, organizers and event details are fictional.',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1500&q=85',
    imageAlt: 'Performer on stage at a community music event',
    createdAt: '2026-11-16T12:00:00.000Z',
    publishedAt: '2026-11-16T12:00:00.000Z',
    href: '#/news/local',
  },
  {
    id: 'demo-news-international-1',
    authorId: 'seed-editor',
    status: 'published',
    category: 'International',
    title: 'Independent labels find new audiences through cross-border sessions',
    summary: 'A fictional collaboration series pairs artists from different scenes for short recording sessions and shared releases.',
    body: 'Illustrative article content. Artists, labels and releases in this example are fictional.',
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1500&q=85',
    imageAlt: 'Crowd at an international music festival',
    createdAt: '2026-11-18T07:30:00.000Z',
    publishedAt: '2026-11-18T07:30:00.000Z',
    href: '#/news/international',
  },
  {
    id: 'demo-news-international-2',
    authorId: 'seed-editor',
    status: 'published',
    category: 'International',
    title: 'How intimate live sessions are changing the way new music is heard',
    summary: 'This fictional report looks at small-room performances, close-up video and the communities that form around them.',
    body: 'Illustrative article content. This is a fictional example, not a report on a real release or event.',
    image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=1500&q=85',
    imageAlt: 'Musicians performing together in a small venue',
    createdAt: '2026-11-17T13:00:00.000Z',
    publishedAt: '2026-11-17T13:00:00.000Z',
    href: '#/news/international',
  },
  {
    id: 'demo-news-international-3',
    authorId: 'seed-editor',
    status: 'published',
    category: 'International',
    title: 'Festival stages make room for fresh sounds and first-time performers',
    summary: 'A fictional festival preview shows how an editorial roundup can mix new names, performance imagery and short updates.',
    body: 'Illustrative article content. Performers and festival details are fictional.',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1500&q=85',
    imageAlt: 'Festival lights above a live music crowd',
    createdAt: '2026-11-16T11:00:00.000Z',
    publishedAt: '2026-11-16T11:00:00.000Z',
    href: '#/news/international',
  },
  {
    id: 'demo-news-sports-1',
    authorId: 'seed-editor',
    status: 'published',
    category: 'Sports',
    title: 'A community football program builds confidence beyond the pitch',
    summary: 'This fictional profile follows a local youth program using regular training and teamwork to bring neighbors together.',
    body: 'Illustrative article content. The team, program and participants are fictional.',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1500&q=85',
    imageAlt: 'Football pitch prepared for a community match',
    createdAt: '2026-11-18T06:30:00.000Z',
    publishedAt: '2026-11-18T06:30:00.000Z',
    href: '#/news/sports',
  },
  {
    id: 'demo-news-sports-2',
    authorId: 'seed-editor',
    status: 'published',
    category: 'Sports',
    title: 'Weekend running clubs turn city routes into shared training spaces',
    summary: 'A fictional sports brief shows how to present a community fitness story with a lead, image and recent timestamp.',
    body: 'Illustrative article content. The clubs and activities described here are fictional.',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1500&q=85',
    imageAlt: 'Runners training together on an outdoor route',
    createdAt: '2026-11-17T12:30:00.000Z',
    publishedAt: '2026-11-17T12:30:00.000Z',
    href: '#/news/sports',
  },
  {
    id: 'demo-news-sports-3',
    authorId: 'seed-editor',
    status: 'published',
    category: 'Sports',
    title: 'Young basketball players get a new place to practice together',
    summary: 'This fictional update previews a community court project and the kind of local sports coverage it could support.',
    body: 'Illustrative article content. The court, organizers and players are fictional.',
    image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1500&q=85',
    imageAlt: 'Basketball on an outdoor court',
    createdAt: '2026-11-16T10:00:00.000Z',
    publishedAt: '2026-11-16T10:00:00.000Z',
    href: '#/news/sports',
  },
]

function readStoredValue<T>(key: string, fallback: T): T {
  try {
    const storedValue = window.localStorage.getItem(key)
    return storedValue ? (JSON.parse(storedValue) as T) : fallback
  } catch {
    return fallback
  }
}

function readInitialChartEntries() {
  return readStoredValue<ChartEntry[]>('leaf-chart-entries', [])
}

function getTranslatableTextNodes(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      const text = node.nodeValue?.trim() ?? ''
      if (!parent || !text || !/\p{L}/u.test(text) || parent.closest('[data-translation-skip],script,style,noscript,svg,iframe,textarea,code,pre')) {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    },
  })
  const nodes: Text[] = []
  while (walker.nextNode()) {
    if (walker.currentNode instanceof Text) nodes.push(walker.currentNode)
  }
  return nodes
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function restoreTranslatedTextNodes(translatedNodes: Map<Text, { original: string; translated: string }>) {
  translatedNodes.forEach(({ original }, node) => {
    if (node.isConnected) node.nodeValue = original
  })
  translatedNodes.clear()
}

function readStoredOpinions(): ViewerOpinion[] {
  const storedOpinions = readStoredValue<ViewerOpinion[] | null>('leaf-viewer-opinions', null)
  if (storedOpinions) return storedOpinions
  const oldContactMessages = readStoredValue<Array<{ id?: string; name?: string; email?: string; message?: string; received?: string }>>('leaf-contact-messages', [])
  return oldContactMessages.map((message, index) => ({
    id: message.id || `migrated-opinion-${index}`,
    name: message.name || 'Viewer',
    email: message.email || '',
    message: message.message || '',
    received: message.received || 'Previously submitted',
  }))
}

function createStoryId() {
  return `story-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function generateTemporaryPassword(length = 10) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
  const values = new Uint32Array(length)
  window.crypto.getRandomValues(values)
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join('')
}

async function hashPassword(password: string, salt: string) {
  const encoder = new TextEncoder()
  const key = await window.crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const digest = await window.crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 120000, hash: 'SHA-256' }, key, 256)
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('')
}

function categorySlug(category: StoryCategory) {
  if (category === 'Local entertainment') return 'local'
  if (category === 'International') return 'international'
  return 'sports'
}

function storyPageHref(storyId: string) {
  return `#/story/${encodeURIComponent(storyId)}`
}

function formatStoryDate(date?: string) {
  if (!date) return 'September 29, 2026 at 12:00 PM'
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime())
    ? 'September 29, 2026 at 12:00 PM'
    : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(parsedDate)
}

function getYouTubeVideoId(value?: string) {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null
    const isYouTubeHost = url.hostname === 'youtube.com' || url.hostname.endsWith('.youtube.com')
    const isNoCookieHost = url.hostname === 'youtube-nocookie.com' || url.hostname.endsWith('.youtube-nocookie.com')
    if (isYouTubeHost || isNoCookieHost) {
      if (url.pathname === '/watch') return url.searchParams.get('v')
      const pathParts = url.pathname.split('/').filter(Boolean)
      if (['embed', 'shorts', 'live'].includes(pathParts[0])) return pathParts[1] ?? null
    }
  } catch {
    return null
  }
  return null
}

function getSafeExternalUrl(value?: string) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('The GIF file could not be read.'))
    }, { once: true })
    reader.addEventListener('error', () => reject(reader.error ?? new Error('The GIF file could not be read.')), { once: true })
    reader.readAsDataURL(file)
  })
}

async function optimizeStoryImage(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
  if (file.size > 8 * 1024 * 1024) throw new Error('Choose an image smaller than 8 MB.')
  const bitmap = await createImageBitmap(file)
  const maxDimension = 1600
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext('2d')
  if (!context) {
    bitmap.close()
    throw new Error('Could not process this image.')
  }
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.82)
}

function openLocalMediaDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open('leaf-local-media', 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore('videos', { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Could not open local media storage.'))
  })
}

async function saveLocalVideo(file: File) {
  if (!file.type.startsWith('video/')) throw new Error('Choose a video file.')
  const database = await openLocalMediaDatabase()
  const id = createStoryId()
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('videos', 'readwrite')
      transaction.objectStore('videos').put({ id, blob: file, name: file.name, type: file.type })
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error ?? new Error('Could not save this video locally.'))
      transaction.onabort = () => reject(transaction.error ?? new Error('Local video upload was cancelled.'))
    })
  } finally {
    database.close()
  }
  return id
}

async function loadLocalVideo(id: string) {
  const database = await openLocalMediaDatabase()
  let record: { blob: Blob; name?: string; type?: string } | undefined
  try {
    record = await new Promise<{ blob: Blob; name?: string; type?: string } | undefined>((resolve, reject) => {
      const request = database.transaction('videos', 'readonly').objectStore('videos').get(id)
      request.onsuccess = () => resolve(request.result as { blob: Blob; name?: string; type?: string } | undefined)
      request.onerror = () => reject(request.error ?? new Error('Could not load this local video.'))
    })
  } finally {
    database.close()
  }
  return record ?? null
}

async function downloadLocalVideo(id: string, fallbackName: string) {
  const record = await loadLocalVideo(id)
  if (!record) throw new Error('This submitted video is no longer available in this browser.')
  const objectUrl = URL.createObjectURL(record.blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = record.name || fallbackName
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}

function LocalVideoPlayer({ videoKey, title }: { videoKey: string; title: string }) {
  const [videoUrl, setVideoUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    let objectUrl = ''
    loadLocalVideo(videoKey).then((record) => {
      if (!active) return
      if (!record) {
        setError('This locally uploaded video is no longer available in this browser.')
        return
      }
      objectUrl = URL.createObjectURL(record.blob)
      setVideoUrl(objectUrl)
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Could not load this local video.')
    })
    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [videoKey])

  if (error) return <p className="media-error" role="alert">{error}</p>
  if (!videoUrl) return <div className="video-frame video-loading" role="status">Loading local video…</div>
  return <div className="video-frame"><video controls controlsList="nodownload" disablePictureInPicture playsInline src={videoUrl} aria-label={`Video: ${title}`} /></div>
}

function getPodcastVideoSource(episode: PodcastEpisode): 'local' | 'youtube' | 'preview' {
  if (episode.localVideoKey) return 'local'
  return getYouTubeVideoId(episode.youtubeUrl) ? 'youtube' : 'preview'
}

const podcastCategories: PodcastCategory[] = ['Local entertainment', 'International', 'Sports', 'Music', 'Other']

function getPodcastCategory(episode: PodcastEpisode): PodcastCategory {
  return episode.category ?? 'Local entertainment'
}

function PodcastSourceBadge({ episode }: { episode: PodcastEpisode }) {
  const source = getPodcastVideoSource(episode)
  const label = source === 'local' ? 'LEAF Exclusive · On-Site' : source === 'youtube' ? 'YouTube Video' : 'Sample Episode · No Video'
  return <span className={`podcast-source-badge is-${source}`}>{label}</span>
}

function normalizeStoredStories(stories: Story[]) {
  return stories.map((story) => ({
    ...story,
    body: story.body || story.summary,
    youtubeUrl: story.youtubeUrl || '',
    createdAt: story.createdAt || '2026-09-29T12:00:00.000Z',
    publishedAt: story.status === 'published' ? story.publishedAt || story.createdAt || '2026-09-29T12:00:00.000Z' : story.publishedAt,
  }))
}

function readInitialStories() {
  const migrationKey = 'leaf-news-demo-stories-v1'
  const storedStories = readStoredValue<Story[] | null>('leaf-stories', null)
  if (!Array.isArray(storedStories)) {
    window.localStorage.setItem(migrationKey, JSON.stringify(true))
    return normalizeStoredStories([...defaultStories, ...demoStories])
  }
  const cleanedStories = storedStories.map((story) => {
    const sampleStory = demoStories.find((item) => item.id === story.id)
    return sampleStory && story.body?.toLowerCase().includes('demo story for layout preview only')
      ? { ...story, body: sampleStory.body }
      : story
  })
  if (readStoredValue<boolean>(migrationKey, false)) return normalizeStoredStories(cleanedStories)

  const mergedStories = [
    ...cleanedStories,
    ...demoStories.filter((sample) => !cleanedStories.some((story) => story.id === sample.id)),
  ]
  window.localStorage.setItem(migrationKey, JSON.stringify(true))
  return normalizeStoredStories(mergedStories)
}

function readInitialPodcastEpisodes() {
  const migrationKey = 'leaf-podcast-demo-episodes-v1'
  const storedEpisodes = readStoredValue<PodcastEpisode[] | null>('leaf-podcast-episodes', null)
  if (!Array.isArray(storedEpisodes)) {
    window.localStorage.setItem(migrationKey, JSON.stringify(true))
    return defaultPodcastEpisodes
  }
  const updatedEpisodes = storedEpisodes.map((episode) => {
    const demo = defaultPodcastEpisodes.find((item) => item.id === episode.id && item.isDemo)
    return demo && episode.isDemo && !episode.thumbnail ? { ...episode, thumbnail: demo.thumbnail } : episode
  })
  if (readStoredValue<boolean>(migrationKey, false)) return updatedEpisodes

  const mergedEpisodes = [
    ...updatedEpisodes,
    ...defaultPodcastEpisodes.filter((demo) => !updatedEpisodes.some((episode) => episode.id === demo.id)),
  ]
  window.localStorage.setItem(migrationKey, JSON.stringify(true))
  return mergedEpisodes
}

function readInitialHotPicks() {
  const migrationKey = 'leaf-hot-pick-demo-content-v1'
  const storedPicks = readStoredValue<HotPick[] | null>('leaf-hot-picks', null)
  if (!Array.isArray(storedPicks)) {
    window.localStorage.setItem(migrationKey, JSON.stringify(true))
    return defaultHotPicks
  }
  const picksWithGenres = storedPicks.map((pick) => {
    const samplePick = defaultHotPicks.find((item) => item.id === pick.id)
    const hasOldDemoText = pick.artist.startsWith('Demo artist · ') || pick.title.includes('Demo track')
    return {
      ...pick,
      ...(samplePick && hasOldDemoText ? { artist: samplePick.artist, title: samplePick.title } : {}),
      genre: pick.genre?.trim() || samplePick?.genre || 'Genre not specified',
    }
  })
  if (readStoredValue<boolean>(migrationKey, false)) return picksWithGenres

  const migratedPicks = [...picksWithGenres]
  defaultHotPicks.filter((pick) => pick.isDemo).forEach((demoPick) => {
    const storedIndex = migratedPicks.findIndex((pick) => pick.id === demoPick.id)
    if (storedIndex >= 0) {
      const currentPick = migratedPicks[storedIndex]
      const template = hotPickTemplates.find((pick) => pick.id === demoPick.id)
      if (template && currentPick.artist === template.artist && currentPick.title === template.title) {
        migratedPicks[storedIndex] = demoPick
      }
    } else if (migratedPicks.length < 20) {
      migratedPicks.push(demoPick)
    }
  })
  window.localStorage.setItem(migrationKey, JSON.stringify(true))
  return migratedPicks
}

const updates = [
  {
    category: 'Local entertainment',
    title: 'The independent venues making room for the next wave',
    image:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80',
    href: '#/news/local',
  },
  {
    category: 'On the charts',
    title: 'Five records moving up the local top 100 this week',
    image:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
    href: '#/charts/local-songs',
  },
  {
    category: 'The LEAF XTRA Podcast',
    title: 'In the studio: the long way around to finding your sound',
    image:
      'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=900&q=80',
    href: '#/podcast',
  },
]

const chartData: Record<string, ChartRow[]> = {
  'local-songs': [
    { artist: 'ELEMENT EleéeH', title: 'My Dear', movement: '1' },
    { artist: 'Bruce Melodie', title: 'Irya 4', movement: '2' },
    { artist: 'Kevin Kade', title: 'So Close', movement: '3' },
    { artist: 'Utah Nice', title: 'Capable', movement: '4' },
    { artist: 'Kojo North', title: 'Slow Burn', movement: '+7' },
    { artist: 'Mira & The Good', title: 'Easy Does It', movement: '-2' },
    { artist: 'Sefa Bloom', title: 'After the Rain', movement: '+1' },
    { artist: 'June K', title: 'Anywhere Near You', movement: 'NEW' },
    { artist: 'The Sunday Club', title: 'Green Light', movement: '-3' },
    { artist: 'Esi Grey', title: 'Open Water', movement: '+5' },
  ],
  'local-albums': [
    { artist: 'Sample Artist 01', title: 'Homecoming', movement: '1' },
    { artist: 'Sample Artist 02', title: 'After Hours in Kigali', movement: '2' },
    { artist: 'Sample Artist 03', title: 'New Day', movement: '+2' },
    { artist: 'Sample Artist 04', title: 'Imizi', movement: '-1' },
    { artist: 'Sample Artist 05', title: 'City Lights', movement: 'NEW' },
    { artist: 'Sample Artist 06', title: 'Umutima', movement: '+1' },
    { artist: 'Sample Artist 07', title: 'Golden Hour', movement: '-2' },
    { artist: 'Sample Artist 08', title: 'The Long Way', movement: '+3' },
    { artist: 'Sample Artist 09', title: 'Good Company', movement: 'NEW' },
    { artist: 'Sample Artist 10', title: 'Sunday Songs', movement: '-3' },
  ],
  'international-albums': [
    { artist: 'The Marigold House', title: 'Soft Focus', movement: '+3' },
    { artist: 'Sundays', title: 'A Place to Land', movement: '-1' },
    { artist: 'Rae Solis', title: 'High Season', movement: '+6' },
    { artist: 'Milo Grey', title: 'Good Company', movement: 'NEW' },
    { artist: 'Northbound', title: 'All the Way Home', movement: '+2' },
    { artist: 'K. August', title: 'Late Bloom', movement: '-2' },
    { artist: 'Olive Street', title: 'Rooms We Keep', movement: '+1' },
    { artist: 'NOVA LANE', title: 'Somewhere Bright', movement: 'NEW' },
    { artist: 'The Slow Parade', title: 'Little Fires', movement: '-4' },
    { artist: 'Cleo Hart', title: 'The Long View', movement: '+8' },
  ],
  'international-songs': [
    { artist: 'Talia Rose', title: 'One More Time', movement: '+2' },
    { artist: 'Dayo Rivers', title: 'Parallel', movement: '+5' },
    { artist: 'Luca Venn', title: 'Anything But Quiet', movement: '-1' },
    { artist: 'Mina Blue', title: 'Satellite Heart', movement: 'NEW' },
    { artist: 'Orion West', title: 'On My Mind', movement: '+3' },
    { artist: 'Romy Vale', title: 'Bright Side', movement: '-2' },
    { artist: 'Ari North', title: 'Almost There', movement: '+1' },
    { artist: 'The New Ritual', title: 'Golden', movement: 'NEW' },
    { artist: 'Camila June', title: 'Wildflowers', movement: '-3' },
    { artist: 'Jules Park', title: 'Back to Life', movement: '+4' },
  ],
}
const hotPickTemplates = Array.from({ length: 20 }, (_, index) => ({
  id: `hot-pick-template-${index + 1}`,
  artist: `Upcoming artist ${String(index + 1).padStart(2, '0')}`,
  title: `Sample song title ${String(index + 1).padStart(2, '0')}`,
  genre: ['Afro-pop', 'Afrobeats', 'R&B', 'Hip-hop', 'Afro-fusion'][index % 5],
  link: '',
  cover: '',
}))
const hotPickDemoDetails = [
  { artist: 'Mwezi', title: 'Night Bloom', genre: 'Afro-pop', createdAt: '2026-11-18T09:00:00.000Z' },
  { artist: 'Kivu Blue', title: 'City Lights', genre: 'R&B', createdAt: '2026-11-17T11:00:00.000Z' },
  { artist: 'Nia Sol', title: 'New Day', genre: 'Afro-fusion', createdAt: '2026-11-16T09:00:00.000Z' },
]
const defaultHotPicks: HotPick[] = hotPickTemplates.map((pick, index) => ({
  ...pick,
  ...(hotPickDemoDetails[index] ? { ...hotPickDemoDetails[index], isDemo: true } : {}),
  authorId: 'seed-editor',
  status: 'published',
  createdAt: hotPickDemoDetails[index]?.createdAt || new Date(Date.UTC(2026, 8, 29 - index)).toISOString(),
}))

const pageHeadings: Record<string, { title: string; intro: string }> = {
  local: {
    title: 'Local Entertainment',
    intro: 'Stories, new voices and the moments moving culture close to home.',
  },
  international: {
    title: 'Around the world',
    intro: 'The people, releases and ideas travelling across borders right now.',
  },
  sports: {
    title: 'Beyond the whistle',
    intro: 'The characters, culture and sound that make sport bigger than the score.',
  },
}

function readRoute(): Route {
  const [page = 'home', section = ''] = window.location.hash
    .replace(/^#\/?/, '')
    .split('/')
  const validPages: Page[] = ['home', 'charts', 'news', 'story', 'podcast', 'contact', 'story-tip', 'kinyarwanda', 'login', 'dashboard']
  return {
    page: validPages.includes(page as Page) ? (page as Page) : 'home',
    section,
  }
}

function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  const [siteLanguage, setSiteLanguage] = useState<SiteLanguage>('en')
  const [translationStatus, setTranslationStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [translationError, setTranslationError] = useState('')
  const [translationRetry, setTranslationRetry] = useState(0)
  const translatedTextNodes = useRef(new Map<Text, { original: string; translated: string }>())
  const translationCache = useRef(new Map<string, string>())
  const [stories, setStories] = useState<Story[]>(readInitialStories)
  const [chartEntries, setChartEntries] = useState<ChartEntry[]>(readInitialChartEntries)
  const [podcastEpisodes, setPodcastEpisodes] = useState<PodcastEpisode[]>(readInitialPodcastEpisodes)
  const [hotPicks, setHotPicks] = useState<HotPick[]>(readInitialHotPicks)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => ({ ...defaultSettings, ...readStoredValue<Partial<SiteSettings>>('leaf-site-settings', {}) }))
  const [users, setUsers] = useState<DashboardUser[]>(() => readStoredValue('leaf-dashboard-users', []))
  const [session, setSession] = useState<DashboardSession | null>(() => readStoredValue('leaf-dashboard-session', null))
  const [storyFeedback, setStoryFeedback] = useState<FeedbackMessage[]>(() => readStoredValue<FeedbackMessage[]>('leaf-story-feedback', feedbackPlaceholders).map((item) => item.name === 'Demo listener' ? { ...item, name: 'LEAF Listener' } : item))
  const [storyViews, setStoryViews] = useState<Record<string, number>>(() => readStoredValue('leaf-story-views', {}))
  const [viewerOpinions, setViewerOpinions] = useState<ViewerOpinion[]>(readStoredOpinions)
  const [storySubmissions, setStorySubmissions] = useState<StorySubmission[]>(() => readStoredValue('leaf-story-submissions', storySubmissionPlaceholders))
  const [reviewedFeedbackIds, setReviewedFeedbackIds] = useState<string[]>(() => readStoredValue('leaf-reviewed-feedback', []))
  const [siteMetrics, setSiteMetrics] = useState(() => {
    const storedMetrics = readStoredValue('leaf-site-metrics', { pageViews: 0, adClicks: 0 })
    return { ...storedMetrics, pageViews: storedMetrics.pageViews + 1 }
  })
  const [newsSearchQuery, setNewsSearchQuery] = useState('')
  const [newsSearchDate, setNewsSearchDate] = useState('')
  const [newsSearchCategory, setNewsSearchCategory] = useState<'all' | StoryCategory>('all')
  const [podcastFeedback, setPodcastFeedback] = useState<PodcastFeedback[]>(() => readStoredValue('leaf-podcast-feedback', []))
  const [slideIndex, setSlideIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [noteSent, setNoteSent] = useState(false)
  const [activeEpisode, setActiveEpisode] = useState(0)

  useEffect(() => {
    const syncRoute = () => {
      restoreTranslatedTextNodes(translatedTextNodes.current)
      setRoute(readRoute())
      setTranslationError('')
      setTranslationStatus('idle')
      setSiteMetrics((current) => ({ ...current, pageViews: current.pageViews + 1 }))
      setMenuOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  useEffect(() => {
    window.localStorage.setItem('leaf-language', siteLanguage)
  }, [siteLanguage])

  useEffect(() => {
    const publicRoute = route.page !== 'dashboard' && route.page !== 'login'
    const shouldTranslate = siteLanguage === 'rw' && publicRoute && route.page !== 'kinyarwanda'
    document.documentElement.lang = shouldTranslate ? 'rw' : 'en'

    if (!shouldTranslate) {
      restoreTranslatedTextNodes(translatedTextNodes.current)
      return
    }

    let cancelled = false
    const controller = new AbortController()
    async function translatePublicPage() {
      const root = document.getElementById('root')
      if (!root) {
        setTranslationStatus('error')
        setTranslationError('The public page could not be translated.')
        return
      }

      const nodes = getTranslatableTextNodes(root)
      const originals = nodes.map((node) => {
        const current = node.nodeValue ?? ''
        const previous = translatedTextNodes.current.get(node)
        return previous && current.trim() === previous.translated ? previous.original : current
      })
      const texts = originals.map((text) => text.trim())
      const missing = [...new Set(texts.filter((text) => text && !translationCache.current.has(text)))]
      const batches: string[][] = []
      let batch: string[] = []
      let batchLength = 0

      for (const text of missing) {
        if (text.length > 25000) {
          setTranslationStatus('error')
          setTranslationError('A page item is too long to send for translation.')
          return
        }
        if (batch.length >= 128 || batchLength + text.length > 25000) {
          batches.push(batch)
          batch = []
          batchLength = 0
        }
        batch.push(text)
        batchLength += text.length
      }
      if (batch.length) batches.push(batch)

      try {
        for (const textsToTranslate of batches) {
          if (cancelled) return
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texts: textsToTranslate }),
            signal: controller.signal,
          })
          let result: { error?: string; translations?: unknown }
          try {
            result = await response.json() as { error?: string; translations?: unknown }
          } catch {
            throw new Error('The translation service is not available on this deployment.')
          }
          if (!response.ok) throw new Error(result.error || 'Kinyarwanda translation is unavailable.')
          const translations = result.translations
          if (!isStringArray(translations) || translations.length !== textsToTranslate.length) {
            throw new Error('The translation service returned an invalid response.')
          }
          textsToTranslate.forEach((text, index) => translationCache.current.set(text, translations[index]))
        }

        if (cancelled) return
        nodes.forEach((node, index) => {
          const original = originals[index]
          const text = texts[index]
          const translated = translationCache.current.get(text)
          if (!translated || !text) return
          translatedTextNodes.current.set(node, { original, translated })
          const leading = original.match(/^\s*/)?.[0] ?? ''
          const trailing = original.match(/\s*$/)?.[0] ?? ''
          node.nodeValue = `${leading}${translated}${trailing}`
        })
        setTranslationStatus('ready')
      } catch (error) {
        if (cancelled || (error instanceof DOMException && error.name === 'AbortError')) return
        setTranslationStatus('error')
        setTranslationError(error instanceof Error ? error.message : 'Kinyarwanda translation is unavailable.')
      }
    }

    void translatePublicPage()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [route, siteLanguage, translationRetry, slideIndex, activeEpisode])

  useEffect(() => {
    window.localStorage.setItem('leaf-stories', JSON.stringify(stories))
  }, [stories])

  useEffect(() => {
    window.localStorage.setItem('leaf-chart-entries', JSON.stringify(chartEntries))
  }, [chartEntries])

  useEffect(() => {
    window.localStorage.setItem('leaf-podcast-episodes', JSON.stringify(podcastEpisodes))
  }, [podcastEpisodes])

  useEffect(() => {
    window.localStorage.setItem('leaf-hot-picks', JSON.stringify(hotPicks))
  }, [hotPicks])

  useEffect(() => {
    window.localStorage.setItem('leaf-site-metrics', JSON.stringify(siteMetrics))
  }, [siteMetrics])

  useEffect(() => {
    window.localStorage.setItem('leaf-site-settings', JSON.stringify(siteSettings))
    document.title = siteSettings.seoTitle || `${siteSettings.brandName} | ${siteSettings.motto}`
    let description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!description) {
      description = document.createElement('meta')
      description.name = 'description'
      document.head.append(description)
    }
    description.content = siteSettings.seoDescription
  }, [siteSettings])

  useEffect(() => {
    window.localStorage.setItem('leaf-dashboard-users', JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (session) window.localStorage.setItem('leaf-dashboard-session', JSON.stringify(session))
    else window.localStorage.removeItem('leaf-dashboard-session')
  }, [session])

  useEffect(() => {
    window.localStorage.setItem('leaf-story-feedback', JSON.stringify(storyFeedback))
  }, [storyFeedback])

  useEffect(() => {
    window.localStorage.setItem('leaf-podcast-feedback', JSON.stringify(podcastFeedback))
  }, [podcastFeedback])

  useEffect(() => {
    window.localStorage.setItem('leaf-story-views', JSON.stringify(storyViews))
  }, [storyViews])

  useEffect(() => {
    window.localStorage.setItem('leaf-viewer-opinions', JSON.stringify(viewerOpinions))
  }, [viewerOpinions])

  useEffect(() => {
    window.localStorage.setItem('leaf-story-submissions', JSON.stringify(storySubmissions))
  }, [storySubmissions])

  useEffect(() => {
    window.localStorage.setItem('leaf-reviewed-feedback', JSON.stringify(reviewedFeedbackIds))
  }, [reviewedFeedbackIds])

  useEffect(() => {
    if (stories.length < 2) return
    const timer = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % stories.length)
    }, 7000)
    return () => window.clearInterval(timer)
  }, [stories.length])

  async function createAdminAccount(setup: AdminSetup) {
    const username = setup.username.trim().toLowerCase()
    if (users.some((user) => user.username === username)) return false
    const passwordSalt = generateTemporaryPassword(24)
    const passwordHash = await hashPassword(setup.password, passwordSalt)
    const admin: DashboardUser = {
      id: createStoryId(),
      name: setup.name.trim(),
      username,
      email: setup.email.trim().toLowerCase(),
      role: 'Admin',
      passwordSalt,
      passwordHash,
    }
    setUsers([admin])
    setSession({ userId: admin.id })
    window.location.hash = '#/dashboard/stories'
    return true
  }

  async function createEmployee(name: string, username: string, email: string, role: 'Chief Editor' | 'Journalist', password: string) {
    const normalizedUsername = username.trim().toLowerCase()
    const normalizedEmail = email.trim().toLowerCase()
    if (users.some((user) => user.username === normalizedUsername || user.email?.toLowerCase() === normalizedEmail)) return null
    const passwordSalt = generateTemporaryPassword(24)
    const passwordHash = await hashPassword(password, passwordSalt)
    const newUser: DashboardUser = {
      id: createStoryId(),
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      role,
      passwordSalt,
      passwordHash,
    }
    setUsers((currentUsers) => [...currentUsers, newUser])
    return true
  }

  function updateEmployee(userId: string, updates: Pick<DashboardUser, 'name' | 'username' | 'email' | 'role'>) {
    const normalizedUsername = updates.username.trim().toLowerCase()
    const normalizedEmail = updates.email.trim().toLowerCase()
    if (!/^[a-z0-9._-]+$/.test(normalizedUsername)) return false
    if (users.some((user) => user.id !== userId && (user.username === normalizedUsername || user.email?.toLowerCase() === normalizedEmail))) return false
    setUsers((currentUsers) => currentUsers.map((user) => user.id === userId ? { ...user, ...updates, username: normalizedUsername, email: normalizedEmail } : user))
    return true
  }

  async function setEmployeePassword(userId: string, password: string) {
    const employee = users.find((user) => user.id === userId)
    if (!employee) return false
    const passwordSalt = generateTemporaryPassword(24)
    const passwordHash = await hashPassword(password, passwordSalt)
    setUsers((currentUsers) => currentUsers.map((user) => user.id === userId ? { ...user, passwordSalt, passwordHash } : user))
    return true
  }

  function deleteEmployee(userId: string, replacementAuthorId: string) {
    setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId))
    setStories((currentStories) => currentStories.map((story) => story.authorId === userId ? { ...story, authorId: replacementAuthorId } : story))
    setStoryFeedback((currentFeedback) => currentFeedback.map((item) => item.authorId === userId ? { ...item, authorId: replacementAuthorId } : item))
  }

  async function changeOwnPassword(userId: string, currentPassword: string, newPassword: string) {
    const user = users.find((account) => account.id === userId)
    if (!user?.passwordHash) return false
    if (await hashPassword(currentPassword, user.passwordSalt) !== user.passwordHash) return false
    const passwordSalt = generateTemporaryPassword(24)
    const passwordHash = await hashPassword(newPassword, passwordSalt)
    setUsers((currentUsers) => currentUsers.map((account) => account.id === userId ? { ...account, passwordSalt, passwordHash } : account))
    return true
  }

  function signIn(user: DashboardUser) {
    if (!user.passwordHash) return false
    setSession({ userId: user.id })
    window.location.hash = '#/dashboard/stories'
    return true
  }

  function signOut() {
    setSession(null)
    window.location.hash = '#/login'
  }

  function getCurrentUser() {
    return session ? users.find((user) => user.id === session.userId) ?? null : null
  }

  function handleSaveStory(story: Story) {
    const activeUser = getCurrentUser()
    if (!activeUser) return
    const now = new Date().toISOString()
    setStories((currentStories) => {
      const existingStory = currentStories.find((currentStory) => currentStory.id === story.id)
      if (activeUser.role === 'Journalist') {
        const isOwnEditableStory = existingStory?.authorId === activeUser.id && ['draft', 'rejected'].includes(existingStory.status)
        const isNewOwnDraft = !existingStory && story.authorId === activeUser.id && story.status === 'draft'
        if (!isOwnEditableStory && !isNewOwnDraft) return currentStories
      }
      const savedStory = {
        ...story,
        authorId: existingStory?.authorId ?? activeUser.id,
        createdAt: existingStory?.createdAt || story.createdAt || now,
        publishedAt: story.status === 'published' ? existingStory?.publishedAt || story.publishedAt || now : story.publishedAt,
      }
      const exists = Boolean(existingStory)
      return exists
        ? currentStories.map((currentStory) => currentStory.id === story.id ? savedStory : currentStory)
        : [savedStory, ...currentStories]
    })
  }

  function handleDeleteStory(storyId: string) {
    if (getCurrentUser()?.role === 'Journalist') return
    const nextStories = stories.filter((story) => story.id !== storyId)
    if (nextStories.length === 0) return
    setStories(nextStories)
    setSlideIndex((currentIndex) => Math.min(currentIndex, nextStories.length - 1))
  }

  function handlePublishStory(storyId: string) {
    const publishedAt = new Date().toISOString()
    if (!getCurrentUser() || getCurrentUser()?.role === 'Journalist') return
    setStories((currentStories) => currentStories.map((story) => story.id === storyId && ['approved', 'draft'].includes(story.status) ? { ...story, status: 'published', publishedAt } : story))
  }

  function handleSubmitStoryForReview(storyId: string) {
    const activeUser = getCurrentUser()
    if (activeUser?.role !== 'Journalist') return
    setStories((currentStories) => currentStories.map((story) => story.id === storyId && story.authorId === activeUser.id && ['draft', 'rejected'].includes(story.status)
      ? { ...story, status: 'submitted', reviewNote: '', reviewedAt: undefined }
      : story))
  }

  function handleApproveStory(storyId: string) {
    if (!getCurrentUser() || getCurrentUser()?.role === 'Journalist') return
    const reviewedAt = new Date().toISOString()
    setStories((currentStories) => currentStories.map((story) => story.id === storyId && story.status === 'submitted'
      ? { ...story, status: 'approved', reviewedAt, reviewNote: '' }
      : story))
  }

  function handleRejectStory(storyId: string, reviewNote: string) {
    if (!getCurrentUser() || getCurrentUser()?.role === 'Journalist') return
    const reviewedAt = new Date().toISOString()
    setStories((currentStories) => currentStories.map((story) => story.id === storyId && story.status === 'submitted'
      ? { ...story, status: 'rejected', reviewedAt, reviewNote: reviewNote.trim() }
      : story))
  }

  function handleSaveChartEntry(entry: ChartEntry) {
    const activeUser = getCurrentUser()
    if (!activeUser) return
    const now = new Date().toISOString()
    setChartEntries((currentEntries) => {
      const existingEntry = currentEntries.find((item) => item.id === entry.id)
      if (activeUser.role === 'Journalist') {
        const isOwnDraft = existingEntry?.authorId === activeUser.id && existingEntry.status === 'draft'
        const isNewOwnDraft = !existingEntry && entry.authorId === activeUser.id && entry.status === 'draft'
        if (!isOwnDraft && !isNewOwnDraft) return currentEntries
      }
      const savedEntry = {
        ...entry,
        authorId: existingEntry?.authorId ?? activeUser.id,
        createdAt: existingEntry?.createdAt || entry.createdAt || now,
      }
      return existingEntry
        ? currentEntries.map((item) => item.id === entry.id ? savedEntry : item)
        : [savedEntry, ...currentEntries]
    })
  }

  function handleSubmitChartEntry(entryId: string) {
    const activeUser = getCurrentUser()
    if (activeUser?.role !== 'Journalist') return
    setChartEntries((currentEntries) => currentEntries.map((entry) => entry.id === entryId && entry.authorId === activeUser.id && entry.status === 'draft'
      ? { ...entry, status: 'submitted' }
      : entry))
  }

  function handlePublishChartEntry(entryId: string) {
    if (!getCurrentUser() || getCurrentUser()?.role === 'Journalist') return
    setChartEntries((currentEntries) => currentEntries.map((entry) => entry.id === entryId && ['draft', 'submitted'].includes(entry.status)
      ? { ...entry, status: 'published' }
      : entry))
  }

  function handleDeleteChartEntry(entryId: string) {
    if (!getCurrentUser() || getCurrentUser()?.role === 'Journalist') return
    setChartEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== entryId))
  }

  function handleSavePodcastEpisode(episode: PodcastEpisode) {
    const now = new Date().toISOString()
    setPodcastEpisodes((currentEpisodes) => {
      const existingEpisode = currentEpisodes.find((item) => item.id === episode.id)
      const savedEpisode = {
        ...episode,
        createdAt: existingEpisode?.createdAt || episode.createdAt || now,
        publishedAt: episode.status === 'published' ? existingEpisode?.publishedAt || episode.publishedAt || now : episode.publishedAt,
      }
      return existingEpisode
        ? currentEpisodes.map((item) => item.id === episode.id ? savedEpisode : item)
        : [savedEpisode, ...currentEpisodes]
    })
  }

  function handlePublishPodcastEpisode(episodeId: string) {
    const publishedAt = new Date().toISOString()
    setPodcastEpisodes((currentEpisodes) => currentEpisodes.map((episode) => episode.id === episodeId ? { ...episode, status: 'published', publishedAt } : episode))
  }

  function handleDeletePodcastEpisode(episodeId: string) {
    setPodcastEpisodes((currentEpisodes) => currentEpisodes.filter((episode) => episode.id !== episodeId))
    setActiveEpisode(0)
  }

  function handleSaveHotPick(hotPick: HotPick) {
    setHotPicks((current) => current.some((item) => item.id === hotPick.id)
      ? current.map((item) => item.id === hotPick.id ? hotPick : item)
      : [hotPick, ...current])
  }

  function handleDeleteHotPick(hotPickId: string) {
    setHotPicks((current) => current.filter((item) => item.id !== hotPickId))
  }

  function handlePublishHotPick(hotPickId: string) {
    setHotPicks((current) => current.map((item) => item.id === hotPickId ? { ...item, status: 'published' } : item))
  }

  function handleStoryFeedback(story: Story, name: string, email: string, message: string) {
    const feedback: FeedbackMessage = {
      id: createStoryId(),
      storyId: story.id,
      storyTitle: story.title,
      authorId: story.authorId,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      received: new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
    }
    setStoryFeedback((currentFeedback) => [feedback, ...currentFeedback])
  }

  function handlePodcastFeedback(episode: PodcastEpisode, name: string, message: string) {
    const feedback: PodcastFeedback = {
      id: createStoryId(),
      episodeId: episode.id,
      episodeTitle: episode.title,
      name: name.trim(),
      message: message.trim(),
      received: new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
    }
    setPodcastFeedback((currentFeedback) => [feedback, ...currentFeedback])
  }

  function handleDeleteStoryFeedback(feedbackId: string) {
    const currentUser = getCurrentUser()
    if (!currentUser || currentUser.role === 'Journalist') return
    setStoryFeedback((currentFeedback) => currentFeedback.filter((item) => item.id !== feedbackId))
    setReviewedFeedbackIds((currentIds) => currentIds.filter((id) => id !== feedbackId))
  }

  function handleNoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNoteSent(true)
    event.currentTarget.reset()
  }

  function handleHeaderSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNewsSearchDate('')
    setNewsSearchCategory('all')
    window.location.hash = '#/news/local'
  }

  const handleStoryView = useCallback((storyId: string) => {
    setStoryViews((current) => ({ ...current, [storyId]: (current[storyId] ?? 0) + 1 }))
  }, [])

  function handleOpinionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const opinion: ViewerOpinion = {
      id: createStoryId(),
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      message: String(formData.get('message') ?? '').trim(),
      received: new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
    }
    setViewerOpinions((current) => [opinion, ...current])
    event.currentTarget.reset()
  }

  async function handleStorySubmission(event: FormEvent<HTMLFormElement>, imageDataUrls: string[], videoFile: File | null) {
    event.preventDefault()
    const formElement = event.currentTarget
    const formData = new FormData(formElement)
    const localVideoKey = videoFile ? await saveLocalVideo(videoFile) : undefined
    const submission: StorySubmission = {
      id: createStoryId(),
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      title: String(formData.get('title') ?? '').trim(),
      category: String(formData.get('category') ?? 'Local entertainment') as StoryCategory,
      details: String(formData.get('details') ?? '').trim(),
      imageDataUrls,
      videoLink: String(formData.get('videoLink') ?? '').trim(),
      localVideoKey,
      received: new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
    }
    setStorySubmissions((current) => [submission, ...current])
    formElement.reset()
  }

  const currentUser = getCurrentUser()
  const publishedStories = stories
    .filter((story) => story.status === 'published')
    .sort((left, right) => Date.parse(right.publishedAt || right.createdAt || '') - Date.parse(left.publishedAt || left.createdAt || ''))
  const homeStories = newsPages.flatMap((category) => publishedStories.filter((story) => categorySlug(story.category) === category.slug).slice(0, 10))
  const currentStory = homeStories.length > 0 ? homeStories[slideIndex % homeStories.length] : defaultStories[0]
  const currentChart = chartPages.find((item) => item.slug === route.section) ?? chartPages[0]
  const chartRows = [
    ...chartEntries
      .filter((entry) => entry.status === 'published' && entry.chartSlug === currentChart.slug)
      .sort((left, right) => Date.parse(right.releaseDate) - Date.parse(left.releaseDate))
      .map((entry) => ({ id: entry.id, artist: entry.artist, title: entry.title, cover: entry.cover, releaseDate: entry.releaseDate })),
    ...chartData[currentChart.slug],
  ].slice(0, 10)
  const currentNews = pageHeadings[route.section] ? route.section : 'local'
  const brandNameParts = siteSettings.brandName.trim().split(/\s+/)
  const brandShortName = brandNameParts[0] || 'LEAF'
  const brandSubName = brandNameParts.slice(1).join(' ') || 'ENTERTAINMENT'

  return (
    <>
      <header className="site-header">
        <div className="masthead page-width">
          <a className="wordmark" href="#/home" aria-label={`${siteSettings.brandName} home`}>
            {siteSettings.logoUrl ? <img className="wordmark-logo" src={siteSettings.logoUrl} alt={siteSettings.brandName} /> : <><span className="wordmark-main">{brandShortName}</span><span className="wordmark-sub">{brandSubName}</span></>}
          </a>
          <div className="masthead-center">
            <span className="masthead-kicker">{siteSettings.headerKicker}</span>
            <span className="masthead-motto">{siteSettings.motto}</span>
          </div>
          <a className="masthead-issue" href="#/charts/local-songs">
            <span>{siteSettings.brandName.toUpperCase()} EDIT</span>
            <strong>{siteSettings.mastheadDescriptor}</strong>
          </a>
        </div>
        <div className={`header-ad${siteSettings.headerAdMedia ? ' has-media' : ''}`} aria-label="Advertisement placeholder">
          {siteSettings.headerAdMedia ? <img alt={siteSettings.headerAdLabel} src={siteSettings.headerAdMedia} /> : <span>{siteSettings.headerAdLabel}</span>}
          <small>ADVERTISEMENT</small>
        </div>
        <nav className="main-nav" aria-label="Main navigation">
          <div className="page-width nav-inner">
            <button
              className="menu-toggle"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="primary-links"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span>{menuOpen ? 'Close menu' : 'Menu'}</span>
            </button>
            <div className={`nav-links${menuOpen ? ' is-open' : ''}`} id="primary-links">
              <a className={route.page === 'home' ? 'is-active' : ''} href="#/home">Home</a>
              <a className={route.page === 'charts' ? 'is-active' : ''} href="#/charts/local-songs">Charts</a>
              <a className={route.page === 'news' ? 'is-active' : ''} href="#/news/local">News</a>
              <a className={route.page === 'podcast' ? 'is-active' : ''} href="#/podcast">Podcast</a>
              <a className={route.page === 'contact' ? 'is-active' : ''} href="#/contact">Contact us</a>
            </div>
            <div className="nav-actions">
              {route.page !== 'dashboard' && route.page !== 'login' && (
                <button
                  className="language-toggle"
                  type="button"
                  data-translation-skip
                  aria-label="Open the Kinyarwanda status page"
                  onClick={() => {
                    setTranslationError('')
                    setTranslationStatus('idle')
                    setSiteLanguage('en')
                    window.location.hash = '#/kinyarwanda'
                  }}
                >
                  Kinyarwanda
                </button>
              )}
              {translationStatus === 'error' && route.page !== 'dashboard' && route.page !== 'login' && (
                <button className="translation-retry" type="button" data-translation-skip onClick={() => {
                  setTranslationError('')
                  setTranslationStatus('loading')
                  setTranslationRetry((current) => current + 1)
                }}>Retry</button>
              )}
              {translationStatus === 'error' && route.page !== 'dashboard' && route.page !== 'login' && <span className="translation-feedback" role="alert">{translationError}</span>}
              <div className="nav-tip-search">
                <a className="nav-note nav-story-tip" href="#/story-tip">Submit a story tip <span>↗</span></a>
                <form className="header-search" role="search" onSubmit={handleHeaderSearch}>
                  <input aria-label="Search news by keyword" onChange={(event) => setNewsSearchQuery(event.target.value)} placeholder="Search news..." type="search" value={newsSearchQuery} />
                  <button type="submit">Search</button>
                </form>
              </div>
            </div>
          </div>
        </nav>
        <div className="ticker" aria-label="Latest updates">
          <div className="page-width ticker-inner">
            <span className="ticker-label">THE LATEST</span>
            <span className="ticker-copy">{siteSettings.announcement}</span>
            <span className="ticker-date">Independent voices, always.</span>
          </div>
        </div>
      </header>

      <main className="page-width main-content">
        {route.page === 'home' && (
          <HomePage
            story={currentStory}
            stories={publishedStories}
            users={users}
            hotPicks={hotPicks.filter((pick) => pick.status === 'published').sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))}
            podcastEpisodes={podcastEpisodes.filter((episode) => episode.status === 'published').sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))}
            chartEntries={chartEntries}
            settings={siteSettings}
            onAdClick={() => setSiteMetrics((current) => ({ ...current, adClicks: current.adClicks + 1 }))}
            storiesEyebrow={siteSettings.homeStoriesEyebrow}
            updatesEyebrow={siteSettings.homeUpdatesEyebrow}
            updatesTitle={siteSettings.homeUpdatesTitle}
            slideIndex={slideIndex}
            onSlideChange={setSlideIndex}
          />
        )}
        {route.page === 'charts' && (
          route.section === 'hot-picks'
            ? <HotPicksPage picks={hotPicks.filter((pick) => pick.status === 'published').sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))} settings={siteSettings} onAdClick={() => setSiteMetrics((current) => ({ ...current, adClicks: current.adClicks + 1 }))} />
            : <ChartsPage currentChart={currentChart} rows={chartRows} intro={siteSettings.chartIntro} />
        )}
        {route.page === 'news' && <NewsPage section={currentNews} stories={publishedStories} settings={siteSettings} onAdClick={() => setSiteMetrics((current) => ({ ...current, adClicks: current.adClicks + 1 }))} query={newsSearchQuery} onQueryChange={setNewsSearchQuery} publishDate={newsSearchDate} onPublishDateChange={setNewsSearchDate} category={newsSearchCategory} onCategoryChange={setNewsSearchCategory} />}
        {route.page === 'story' && <StoryDetailPage story={publishedStories.find((story) => story.id === route.section)} users={users} feedback={storyFeedback} onStoryFeedback={handleStoryFeedback} onStoryView={handleStoryView} />}
        {route.page === 'podcast' && (
          <PodcastPage episodes={podcastEpisodes.filter((episode) => episode.status === 'published').sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))} activeEpisode={activeEpisode} onEpisodeChange={setActiveEpisode} users={users} intro={siteSettings.podcastIntro} settings={siteSettings} onAdClick={() => setSiteMetrics((current) => ({ ...current, adClicks: current.adClicks + 1 }))} feedback={podcastFeedback} onFeedback={handlePodcastFeedback} />
        )}
        {route.page === 'kinyarwanda' && <KinyarwandaStatusPage />}
        {route.page === 'contact' && (
          <ContactPage onOpinionSubmit={handleOpinionSubmit} contactEmail={siteSettings.contactEmail} intro={siteSettings.contactIntro} />
        )}
        {route.page === 'story-tip' && <StoryTipPage onStorySubmit={handleStorySubmission} intro={siteSettings.contactIntro} />}
        {route.page === 'login' && <LoginPage users={users} onLogin={signIn} onCreateAdmin={createAdminAccount} />}
        {route.page === 'dashboard' && !currentUser && <LoginPage users={users} onLogin={signIn} onCreateAdmin={createAdminAccount} />}
        {route.page === 'dashboard' && currentUser && (
          <DashboardPage
            section={route.section || 'stories'}
            stories={stories}
            chartEntries={chartEntries}
            onSaveChartEntry={handleSaveChartEntry}
            onSubmitChartEntry={handleSubmitChartEntry}
            onPublishChartEntry={handlePublishChartEntry}
            onDeleteChartEntry={handleDeleteChartEntry}
            user={currentUser}
            users={users}
            onSaveStory={handleSaveStory}
            onDeleteStory={handleDeleteStory}
            onPublishStory={handlePublishStory}
            onSubmitStoryForReview={handleSubmitStoryForReview}
            onApproveStory={handleApproveStory}
            onRejectStory={handleRejectStory}
            podcastEpisodes={podcastEpisodes}
            onSavePodcastEpisode={handleSavePodcastEpisode}
            onPublishPodcastEpisode={handlePublishPodcastEpisode}
            onDeletePodcastEpisode={handleDeletePodcastEpisode}
            hotPicks={hotPicks}
            onSaveHotPick={handleSaveHotPick}
            onPublishHotPick={handlePublishHotPick}
            onDeleteHotPick={handleDeleteHotPick}
            settings={siteSettings}
            onSaveSettings={setSiteSettings}
            onCreateEmployee={createEmployee}
            onDeleteEmployee={(userId) => deleteEmployee(userId, currentUser.id)}
            onUpdateEmployee={updateEmployee}
            onSetEmployeePassword={setEmployeePassword}
            onLogout={signOut}
            onChangeOwnPassword={changeOwnPassword}
            feedback={storyFeedback}
            viewerOpinions={viewerOpinions}
            storySubmissions={storySubmissions}
            reviewedFeedbackIds={reviewedFeedbackIds}
            onReviewFeedback={(id) => setReviewedFeedbackIds((current) => current.includes(id) ? current : [...current, id])}
            onDeleteFeedback={handleDeleteStoryFeedback}
            siteMetrics={siteMetrics}
            storyViews={storyViews}
          />
        )}
        {route.page === 'home' && <section className="home-footer-sponsor" aria-label="Main sponsor placement before the footer"><SponsorBanner settings={siteSettings} onAdClick={() => setSiteMetrics((current) => ({ ...current, adClicks: current.adClicks + 1 }))} label="Sponsored placement · Home footer" /></section>}
        {route.page !== 'dashboard' && route.page !== 'login' && route.page !== 'home' && route.page !== 'news' && !(route.page === 'charts' && route.section === 'hot-picks') && <AdPlacements settings={siteSettings} onAdClick={() => setSiteMetrics((current) => ({ ...current, adClicks: current.adClicks + 1 }))} />}
      </main>

      <Footer noteSent={noteSent} onNoteSubmit={handleNoteSubmit} settings={siteSettings} />
    </>
  )
}

function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="section-heading">
      <span className="eyebrow"><span className="eyebrow-dot" />{eyebrow}</span>
      <h1>{title}</h1>
      {intro && <p>{intro}</p>}
    </div>
  )
}

function HomePage({
  story,
  stories,
  users,
  hotPicks,
  podcastEpisodes,
  chartEntries,
  settings,
  onAdClick,
  storiesEyebrow,
  updatesEyebrow,
  updatesTitle,
  slideIndex,
  onSlideChange,
}: {
  story: Story
  stories: Story[]
  users: DashboardUser[]
  hotPicks: HotPick[]
  podcastEpisodes: PodcastEpisode[]
  chartEntries: ChartEntry[]
  settings: SiteSettings
  onAdClick: () => void
  storiesEyebrow: string
  updatesEyebrow: string
  updatesTitle: string
  slideIndex: number
  onSlideChange: (index: number) => void
}) {
  const chartPreviews = chartPages.map((chart) => ({
    ...chart,
    rows: [
      ...chartEntries
        .filter((entry) => entry.status === 'published' && entry.chartSlug === chart.slug)
        .sort((left, right) => Date.parse(right.releaseDate) - Date.parse(left.releaseDate))
        .map((entry) => ({ artist: entry.artist, title: entry.title, cover: entry.cover, releaseDate: entry.releaseDate })),
      ...chartData[chart.slug],
    ].slice(0, 3),
  }))

  return (
    <div className="home-page">
      <div className="section-label-row">
        <span className="eyebrow"><span className="eyebrow-dot" />{storiesEyebrow}</span>
        <span className="section-date">Fresh from the LEAF desk</span>
      </div>
      <section className="feature-story" aria-label="Featured story">
        <a className="feature-image" href={stories.some((item) => item.id === story.id) ? storyPageHref(story.id) : story.href}>
          <img src={story.image} alt={story.imageAlt} />
          <span className="image-stamp">LEAF<br />PICK</span>
        </a>
        <div className="feature-copy">
          <span className="eyebrow"><span className="eyebrow-dot" />{story.category}{story.id.startsWith('demo-') && <span className="content-sample-label">SAMPLE STORY</span>}</span>
          <h1>{story.title}</h1>
          <p>{story.summary}</p>
          <p className="story-byline">By {users.find((user) => user.id === story.authorId)?.name ?? 'LEAF Editorial Desk'} <span>·</span> {formatStoryDate(story.publishedAt || story.createdAt)}</p>
          <a className="text-link" href={stories.some((item) => item.id === story.id) ? storyPageHref(story.id) : story.href}>Read the story <span>↗</span></a>
          <div className="carousel-controls" aria-label="Featured story controls">
            <span className="carousel-count">0{slideIndex + 1} <span>/</span> 0{stories.length}</span>
            <div className="carousel-dots">
              {stories.map((item, index) => (
                <button
                  aria-label={`Show story ${index + 1}: ${item.title}`}
                  aria-current={index === slideIndex ? 'true' : undefined}
                  className={index === slideIndex ? 'is-current' : ''}
                  key={item.title}
                  onClick={() => onSlideChange(index)}
                  type="button"
                />
              ))}
            </div>
            <div className="carousel-arrows">
              <button aria-label="Previous story" onClick={() => onSlideChange((slideIndex + stories.length - 1) % stories.length)} type="button">Prev</button>
              <button aria-label="Next story" onClick={() => onSlideChange((slideIndex + 1) % stories.length)} type="button">Next</button>
            </div>
          </div>
        </div>
      </section>

      <AdPlacements settings={settings} onAdClick={onAdClick} />

      <section className="updates-section">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">{updatesEyebrow}</span>
            <h2>{updatesTitle}</h2>
          </div>
          <a className="text-link" href="#/news/local">All the latest <span>↗</span></a>
        </div>
        <div className="update-grid">
          {updates.map((item, index) => (
            <a className="update-card" href={item.href} key={item.title}>
              <div className="update-image"><img src={item.image} alt="" /><span>0{index + 1}</span></div>
              <div className="update-copy">
                <span className="content-sample-label">SAMPLE CONTENT</span>
                <span className="eyebrow">{item.category}</span>
                <h3>{item.title}</h3>
                <span className="card-arrow" aria-hidden="true">↗</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <AdPlacements settings={settings} onAdClick={onAdClick} />

      <section className="home-content-section">
        <div className="section-title-row">
          <div><span className="eyebrow">The latest stories</span><h2>News By Category</h2></div>
          <a className="text-link" href="#/news/local">Explore News <span>↗</span></a>
        </div>
        <div className="home-news-categories">
          {newsPages.map((category) => {
            const categoryStories = stories.filter((item) => categorySlug(item.category) === category.slug).slice(0, 3)
            return <section className="home-news-category" key={category.slug}>
              <div className="home-category-heading"><h3>{category.label}</h3><a href={`#/news/${category.slug}`}>View all ↗</a></div>
              {categoryStories.map((item) => <a className="home-story-preview" href={storyPageHref(item.id)} key={item.id}>
                <strong>{item.title}</strong><span>{item.summary}</span>
              </a>)}
              {categoryStories.length === 0 && <p className="dashboard-empty">No published stories yet.</p>}
            </section>
          })}
        </div>
      </section>

      <AdPlacements settings={settings} onAdClick={onAdClick} />

      <section className="home-content-section home-chart-section">
        <div className="section-title-row">
          <div><span className="eyebrow">The LEAF charts</span><h2>Charts & New Releases</h2></div>
          <a className="text-link" href="#/charts/local-songs">All Charts <span>↗</span></a>
        </div>
        <div className="home-chart-grid">
          {chartPreviews.map((chart) => <a className="home-chart-card" href={`#/charts/${chart.slug}`} key={chart.slug}>
            <div className="home-chart-card-heading"><span>{chart.label}</span><b>↗</b></div>
            {chart.rows.map((row, index) => <div className="home-chart-row" key={`${chart.slug}-${row.artist}-${row.title}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>{row.cover && <img src={row.cover} alt="" />}<strong>{row.title}</strong><small>{row.artist}</small></div>
            </div>)}
          </a>)}
        </div>
      </section>

      <AdPlacements settings={settings} onAdClick={onAdClick} />

      <section className="home-content-section">
        <div className="section-title-row">
          <div><span className="eyebrow">🔥 LEAF Hot Picks</span><h2>Upcoming Artists</h2></div>
          <a className="text-link" href="#/charts/hot-picks">Explore Hot Picks <span>↗</span></a>
        </div>
        <div className="home-highlight-grid">
          {hotPicks.slice(0, 3).map((pick, index) => <a className="home-highlight-card" href="#/charts/hot-picks" key={pick.id}>
            <div className="home-highlight-image">{pick.cover ? <img src={pick.cover} alt="" /> : <span>HOT PICK {String(index + 1).padStart(2, '0')}</span>}</div>
            <span className="eyebrow">{pick.genre}</span><strong>{pick.title}</strong><small>{pick.artist}</small>
          </a>)}
          {hotPicks.length === 0 && <p className="dashboard-empty">No published Hot Picks yet.</p>}
        </div>
      </section>

      <AdPlacements settings={settings} onAdClick={onAdClick} />

      <section className="home-content-section">
        <div className="section-title-row">
          <div><span className="eyebrow">LEAF XTRA Podcast</span><h2>Watch The Latest Episodes</h2></div>
          <a className="text-link" href="#/podcast">All Podcast Episodes <span>↗</span></a>
        </div>
        <div className="home-highlight-grid home-podcast-grid">
          {podcastEpisodes.slice(0, 3).map((episode) => <a className="home-highlight-card" href="#/podcast" key={episode.id}>
            <div className="home-highlight-image">{episode.thumbnail ? <img src={episode.thumbnail} alt="" /> : <span>LEAF XTRA</span>}<b aria-hidden="true">▶</b></div>
            <PodcastSourceBadge episode={episode} /><strong>{episode.title}</strong><small>{episode.summary}</small>
          </a>)}
          {podcastEpisodes.length === 0 && <p className="dashboard-empty">No published Podcast episodes yet.</p>}
        </div>
      </section>

      <section className="home-bottom-band">
        <div>
          <span className="eyebrow">Set the tone</span>
          <h2>Find your next<br />favourite sound.</h2>
        </div>
        <p>Local favourites, global discoveries and the records bringing everyone into the same room.</p>
        <a className="light-link" href="#/charts/local-songs">Go to the charts <span>↗</span></a>
      </section>
    </div>
  )
}

function PageTabs({ items, current, base }: { items: { slug: string; label: string }[]; current: string; base: string }) {
  return (
    <nav className="page-tabs" aria-label={`${base} sections`}>
      {items.map((item) => (
        <a
          aria-current={item.slug === current ? 'page' : undefined}
          className={item.slug === current ? 'is-active' : ''}
          href={`#/${base}/${item.slug}`}
          key={item.slug}
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}

function ChartsPage({
  currentChart,
  rows,
  intro,
}: {
  currentChart: (typeof chartPages)[number]
  rows: ChartRow[]
  intro: string
}) {
  const isLocal = currentChart.slug.startsWith('local-')
  const isAlbum = currentChart.slug.endsWith('albums')

  return (
    <div className="inner-page charts-page">
      <SectionHeading eyebrow="The LEAF charts" title="Hear what’s next." intro={intro} />
      <PageTabs base="charts" current={currentChart.slug} items={chartNavPages} />
      <div className="chart-intro-row">
        <div>
          <span className="eyebrow">This week’s selection</span>
          <h2>{currentChart.label}</h2>
        </div>
        <span className="chart-week">TOP TEN <strong>{rows.slice(0, 10).length}</strong></span>
      </div>
      <div className="chart-layout">
        <div className="chart-list">
          <div className="chart-list-head"><span>POSITION</span><span>{isAlbum ? 'ALBUM / ARTIST' : 'TRACK / ARTIST'}</span><span>MOVE</span></div>
          {rows.slice(0, 10).map((row, index) => (
            <div className="chart-row" key={row.id ?? `${row.artist}-${row.title}`}>
              <span className="chart-rank">{String(index + 1).padStart(2, '0')}</span>
              <div className="chart-track">{row.cover && <img className="chart-cover-thumb" src={row.cover} alt={`Cover art for ${row.title}`} />}<strong>{row.title}</strong><span>{row.artist}{row.releaseDate ? ` · Released ${formatStoryDate(row.releaseDate)}` : ''}</span></div>
              <span className={`chart-movement${row.movement === 'NEW' ? ' is-new' : ''}`}>{row.movement ?? (row.releaseDate ? 'NEW' : '—')}</span>
            </div>
          ))}
          <p className="data-note">Chart rankings are editorial entries and layout samples. No music-platform data is linked or synchronized.</p>
        </div>
        <aside className="chart-aside">
          <span className="eyebrow">{isLocal ? 'Rwanda · Local Chart' : 'International · Editorial Chart'}</span>
          <h3>{isLocal ? 'Celebrating local releases.' : 'A selection of global releases.'}</h3>
          <p>Published chart entries are submitted by journalists and reviewed by an editor. The remaining rows are illustrative samples.</p>
          <div className="aside-rule" />
          <span className="aside-index">LEAF / CHARTS / 2026</span>
        </aside>
      </div>
    </div>
  )
}

function HotPicksPage({ picks, settings, onAdClick }: { picks: HotPick[]; settings: SiteSettings; onAdClick: () => void }) {
  const visiblePicks = picks.slice(0, 20)
  return (
    <div className="inner-page hot-picks-page">
      <SectionHeading eyebrow="🔥 LEAF HOT PICKS" title="Meet the next wave." intro="A spotlight for upcoming artists and new releases. Each feature can link directly to the song’s listening or video page." />
      <PageTabs base="charts" current="hot-picks" items={chartNavPages} />
      <div className="hot-picks-banner"><span>LEAF HOT PICKS</span><strong>20 songs. New voices. On repeat.</strong><small>Template preview · submissions are not endorsements</small></div>
      <div className="hot-picks-grid">
        {visiblePicks.map((pick, index) => (
          <Fragment key={pick.id}>
            <article className="hot-pick-card">
              <div className="hot-pick-cover">
                {pick.cover ? <img src={pick.cover} alt={`Cover art for ${pick.title}`} /> : <><span>LEAF</span><strong>{String(index + 1).padStart(2, '0')}</strong></>}
              </div>
              <div className="hot-pick-copy">{pick.isDemo && <span className="content-sample-label">SAMPLE PICK</span>}<span className="eyebrow">HOT PICK {String(index + 1).padStart(2, '0')}</span><h2>{pick.title}</h2><p>{pick.artist}</p><span className="hot-pick-genre">{pick.genre}</span>{pick.link ? <a className="text-link" href={pick.link} rel="noreferrer" target="_blank">Listen / watch <span>↗</span></a> : <span className="hot-pick-link-placeholder">Song link placeholder</span>}</div>
            </article>
            {(index + 1) < visiblePicks.length && (index + 1) % 4 === 0 && <AdPlacements settings={settings} onAdClick={onAdClick} />}
          </Fragment>
        ))}
        {visiblePicks.length === 0 && <p className="dashboard-empty">No published Hot Picks yet.</p>}
      </div>
      <p className="data-note">The artist names and song titles above are layout templates, not real recommendations.</p>
    </div>
  )
}

function SponsorBanner({ settings, onAdClick, label }: { settings: SiteSettings; onAdClick: () => void; label?: string }) {
  const sponsorUrl = getSafeExternalUrl(settings.sponsorUrl)
  return (
    <a className="sponsor-ad-placeholder" href={sponsorUrl ?? '#/contact'} onClick={onAdClick} rel={sponsorUrl ? 'noreferrer' : undefined} target={sponsorUrl ? '_blank' : undefined}>
      <span className="eyebrow">{label ?? 'Sponsored placement · template'}</span><strong>{settings.sponsorLabel}</strong><small>Primary horizontal banner · creative placeholder</small>{sponsorUrl && <small className="sponsor-ad-link-label">Visit sponsor ↗</small>}
    </a>
  )
}

function AdPlacements({ settings, onAdClick }: { settings: SiteSettings; onAdClick: () => void }) {
  return (
    <section className="ad-showcase" aria-label="Advertisement template placements">
      <div className="horizontal-ad-stack">
        <SponsorBanner settings={settings} onAdClick={onAdClick} />
        <a className="secondary-ad-placeholder" href="#/contact" onClick={onAdClick}>
          <span className="eyebrow">Advertisement · template</span><strong>Secondary banner placement</strong><small>Smaller horizontal creative placeholder</small>
        </a>
      </div>
      <div className="vertical-ad-grid">
        {['Right rail placement 01', 'Right rail placement 02'].map((label) => <a className="vertical-ad-placeholder" href="#/contact" key={label} onClick={onAdClick}><small>ADVERTISEMENT</small><strong>{label}</strong><span>Vertical banner template</span></a>)}
      </div>
      <p className="data-note">Advertisement designs are placeholders for preview; no advertiser, impression billing, or ad delivery service is connected.</p>
    </section>
  )
}

function NewsPage({ section, stories, settings, onAdClick, query, onQueryChange, publishDate, onPublishDateChange, category, onCategoryChange }: { section: string; stories: Story[]; settings: SiteSettings; onAdClick: () => void; query: string; onQueryChange: (value: string) => void; publishDate: string; onPublishDateChange: (value: string) => void; category: 'all' | StoryCategory; onCategoryChange: (value: 'all' | StoryCategory) => void }) {
  const heading = pageHeadings[section]
  const isSearching = Boolean(query.trim() || publishDate || category !== 'all')
  const keywords = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  const filteredStories = stories.filter((story) => {
    if (!isSearching) {
      return section === 'local'
        ? story.category === 'Local entertainment'
        : section === 'international'
          ? story.category === 'International'
          : story.category === 'Sports'
    }
    if (category !== 'all' && story.category !== category) return false
    if (publishDate && (story.publishedAt || story.createdAt || '').slice(0, 10) !== publishDate) return false
    const searchableText = `${story.title} ${story.summary} ${story.body ?? ''} ${story.category}`.toLocaleLowerCase()
    return keywords.every((keyword) => searchableText.includes(keyword))
  })

  return (
    <div className="inner-page news-page">
      <SectionHeading eyebrow="News and culture" title={heading.title} intro={heading.intro} />
      <PageTabs base="news" current={section} items={newsPages} />
      <form className="news-search-form" role="search" onSubmit={(event) => event.preventDefault()}>
        <div className="news-search-heading"><div><span className="eyebrow">Find A Story</span><strong>Search News</strong></div><span>Search by keyword, publication date, or category.</span></div>
        <label className="news-keyword-search">Keywords<input aria-label="Search stories by keyword" onChange={(event) => onQueryChange(event.target.value)} placeholder="Title, topic, or phrase" type="search" value={query} /></label>
        <label>Publication date<input aria-label="Filter stories by publication date" onChange={(event) => onPublishDateChange(event.target.value)} type="date" value={publishDate} /></label>
        <label>Category<select aria-label="Filter stories by category" onChange={(event) => onCategoryChange(event.target.value as 'all' | StoryCategory)} value={category}><option value="all">All categories</option><option value="Local entertainment">Local Entertainment</option><option value="International">International</option><option value="Sports">Sports</option></select></label>
        {isSearching && <button className="plain-button news-search-clear" onClick={() => { onQueryChange(''); onPublishDateChange(''); onCategoryChange('all') }} type="button">Clear filters</button>}
        <p className="news-search-count" aria-live="polite" role="status">{isSearching ? `${filteredStories.length} matching ${filteredStories.length === 1 ? 'story' : 'stories'}` : `${filteredStories.length} stories in ${heading.title}`}</p>
      </form>
      <div className="news-grid">
        {filteredStories.map((story, index) => (
          <Fragment key={story.id}>
              <a className={`news-card${index === 0 ? ' news-card-featured' : ''}`} href={storyPageHref(story.id)}>
                <div className="news-image"><img src={story.image} alt={story.imageAlt} /></div>
                <div className="news-card-copy">
                {story.id.startsWith('demo-') && <span className="content-sample-label">SAMPLE STORY</span>}
                <span className="eyebrow">{story.category} <span className="story-divider">/</span> LEAF desk</span>
                <h2>{story.title}</h2>
                <p>{story.summary}</p>
                  <span className="text-link">Read the full story <span>↗</span></span>
              </div>
              </a>
              {(index + 1) < filteredStories.length && (index + 1) % 3 === 0 && <AdPlacements settings={settings} onAdClick={onAdClick} />}
          </Fragment>
        ))}
        {isSearching && filteredStories.length === 0 && <p className="news-no-results">No published stories match these filters. Try another keyword, date, or category.</p>}
        <article className="news-note-card">
          <span className="eyebrow">Your culture, your voice</span>
          <h2>Have a story worth sharing?</h2>
          <p>We want to hear about the people, places and ideas shaping what comes next.</p>
          <a className="text-link" href="#/contact">Talk to the editors <span>↗</span></a>
        </article>
      </div>
    </div>
  )
}

function StoryDetailPage({ story, users, feedback, onStoryFeedback, onStoryView }: { story?: Story; users: DashboardUser[]; feedback: FeedbackMessage[]; onStoryFeedback: (story: Story, name: string, email: string, message: string) => void; onStoryView: (storyId: string) => void }) {
  const [sent, setSent] = useState(false)
  const countedStoryId = useRef<string | null>(null)

  useEffect(() => {
    if (story && countedStoryId.current !== story.id) {
      countedStoryId.current = story.id
      onStoryView(story.id)
    }
  }, [onStoryView, story])

  if (!story) {
    return <div className="inner-page"><SectionHeading eyebrow="Story not found" title="This story is unavailable." intro="It may have been removed or is no longer published." /><a className="text-link" href="#/news/local">Back to news <span>↗</span></a></div>
  }

  const storyFeedback = feedback.filter((item) => item.storyId === story.id)

  function submitStoryFeedback(event: FormEvent<HTMLFormElement>, currentStory: Story) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onStoryFeedback(currentStory, String(formData.get('name') ?? ''), String(formData.get('email') ?? ''), String(formData.get('message') ?? ''))
    setSent(true)
    event.currentTarget.reset()
  }

  return (
    <article className="inner-page story-detail-page">
      <a className="text-link" href={`#/news/${categorySlug(story.category)}`}>← Back to {story.category}</a>
      <header className="story-detail-heading">
        <span className="eyebrow">{story.category}{story.id.startsWith('demo-') && <span className="content-sample-label">SAMPLE STORY</span>}</span>
        <h1>{story.title}</h1>
        <p className="story-detail-lead">{story.summary}</p>
        <p className="story-byline">By {users.find((user) => user.id === story.authorId)?.name ?? 'LEAF Editorial Desk'} <span>·</span> {formatStoryDate(story.publishedAt || story.createdAt)}</p>
      </header>
      <div className="story-detail-image"><img src={story.image} alt={story.imageAlt} /></div>
      <div className="news-story-body">
        {(story.body || story.summary).split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={`${story.id}-paragraph-${index}`}>{paragraph}</p>)}
      </div>
      {getYouTubeVideoId(story.youtubeUrl) && <div className="video-frame news-video"><iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" src={`https://www.youtube-nocookie.com/embed/${getYouTubeVideoId(story.youtubeUrl)}?rel=0`} title={`YouTube video for ${story.title}`} /></div>}
      <section className="published-feedback" aria-labelledby="published-feedback-heading">
        <div className="section-title-row"><div><span className="eyebrow">Reader response</span><h2 id="published-feedback-heading">Feedback on this story</h2></div><span className="section-date">{storyFeedback.length} {storyFeedback.length === 1 ? 'response' : 'responses'}</span></div>
        {storyFeedback.length ? storyFeedback.map((item) => (
          <article className="published-feedback-item" key={item.id}>
            <div><strong>{item.name}</strong>{item.id.startsWith('sample-') && <span className="feedback-sample-tag">Sample response</span>}<time>{item.received}</time></div>
            <p>{item.message}</p>
          </article>
        )) : <p className="published-feedback-empty">No reader feedback yet. Share a thoughtful response below.</p>}
      </section>
      <details className="story-feedback">
        <summary>Leave feedback on this story</summary>
        <form onSubmit={(event) => submitStoryFeedback(event, story)}>
          <label>Your name<input autoComplete="name" name="name" required /></label>
          <label>Email (optional)<input autoComplete="email" name="email" type="email" /></label>
          <label>Your feedback<textarea name="message" required rows={3} /></label>
          <label className="story-feedback-consent"><input name="publicConsent" required type="checkbox" /> I understand my name and feedback will be shown publicly with this story. Do not include private or sensitive information.</label>
          <button className="green-button" type="submit">Send feedback <span>↗</span></button>
          {sent && <span className="form-success" role="status">Feedback saved for the story owner.</span>}
        </form>
      </details>
    </article>
  )
}

function PodcastPage({ episodes, activeEpisode, onEpisodeChange, users, intro, settings, onAdClick, feedback, onFeedback }: { episodes: PodcastEpisode[]; activeEpisode: number; onEpisodeChange: (index: number) => void; users: DashboardUser[]; intro: string; settings: SiteSettings; onAdClick: () => void; feedback: PodcastFeedback[]; onFeedback: (episode: PodcastEpisode, name: string, message: string) => void }) {
  const [categoryFilter, setCategoryFilter] = useState<'All' | PodcastCategory>('All')
  const visibleEpisodes = categoryFilter === 'All' ? episodes : episodes.filter((item) => getPodcastCategory(item) === categoryFilter)
  const activeEpisodeId = episodes[activeEpisode]?.id
  const episode = visibleEpisodes.find((item) => item.id === activeEpisodeId) ?? visibleEpisodes[0]
  const [playingEpisodeId, setPlayingEpisodeId] = useState<string | null>(null)
  const [feedbackSentFor, setFeedbackSentFor] = useState<string | null>(null)
  const [feedbackError, setFeedbackError] = useState('')
  const isPlaying = episode?.id === playingEpisodeId
  const exclusiveEpisodes = visibleEpisodes.filter((item) => getPodcastVideoSource(item) === 'local')
  const youtubeEpisodes = visibleEpisodes.filter((item) => getPodcastVideoSource(item) === 'youtube')
  const previewEpisodes = visibleEpisodes.filter((item) => getPodcastVideoSource(item) === 'preview')

  function renderEpisodeGroup(groupEpisodes: PodcastEpisode[], source: 'local' | 'youtube' | 'preview') {
    if (source === 'preview' && groupEpisodes.length === 0) return null
    const isExclusive = source === 'local'
    const sectionTitle = isExclusive ? 'Stream Exclusively on LEAF' : source === 'youtube' ? 'YouTube Episodes' : 'Preview Episodes'
    const sectionIntro = isExclusive ? 'Locally uploaded · plays on this site' : source === 'youtube' ? 'Hosted on YouTube' : 'Sample layout · no video attached'
    return <section className={`episode-section podcast-episode-group is-${source}`} key={source}>
      <div className="section-title-row">
        <div><span className="eyebrow">{isExclusive ? 'LEAF Exclusive' : source === 'youtube' ? 'Watch on YouTube' : 'Sample Content'}</span><h2>{sectionTitle}</h2></div>
        <span className="section-date">{sectionIntro}</span>
      </div>
      {isExclusive && <p className="podcast-local-storage-note">Exclusive episodes play in the LEAF player. In this prototype, uploaded video is stored in the browser used to add it.</p>}
      <table className="podcast-table">
          <thead><tr><th>THUMBNAIL</th><th>UPLOADED</th><th>EPISODE</th><th>DESCRIPTION</th><th>WATCH</th></tr></thead>
          <tbody>
          {groupEpisodes.length ? groupEpisodes.map((item) => {
            const episodeIndex = episodes.findIndex((candidate) => candidate.id === item.id)
            return <tr key={item.id}>
              <td>{item.thumbnail ? <img className="podcast-table-thumbnail" src={item.thumbnail} alt={`Thumbnail for ${item.title}`} /> : <span className="podcast-thumbnail-empty">LEAF XTRA</span>}</td>
              <td>{formatStoryDate(item.publishedAt || item.createdAt)}</td>
              <td><button className="podcast-table-title" onClick={() => onEpisodeChange(episodeIndex)} type="button"><PodcastSourceBadge episode={item} /><span className="podcast-category-label">{getPodcastCategory(item)}</span>{item.title}</button></td>
              <td>{item.summary}</td>
              <td>{source === 'preview' ? <span className="podcast-no-video">No video yet</span> : <button onClick={() => onEpisodeChange(episodeIndex)} type="button">{isExclusive ? 'Stream on LEAF' : 'Play episode'}</button>}</td>
            </tr>
          }) : <tr className="podcast-template-row">
            <td><span className="podcast-thumbnail-empty">SAMPLE</span></td>
            <td>Upload date</td>
            <td><div className="podcast-template-episode"><span className="content-sample-label">LAYOUT PREVIEW</span><strong>{isExclusive ? 'Exclusive episode title' : 'YouTube episode title'}</strong></div></td>
            <td>{isExclusive ? 'This preview shows how a locally uploaded exclusive episode will appear. No video is attached.' : 'This preview shows how a YouTube-hosted episode will appear. No YouTube link is attached.'}</td>
            <td><span className="podcast-no-video">No video attached</span></td>
          </tr>}
          </tbody>
        </table>
    </section>
  }

  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!episode || getPodcastVideoSource(episode) !== 'local') return
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const message = String(formData.get('message') ?? '').trim()
    if (!name || !message) {
      setFeedbackError('Enter your name and opinion before sharing.')
      return
    }
    onFeedback(episode, name, message)
    event.currentTarget.reset()
    setFeedbackError('')
    setFeedbackSentFor(episode.id)
  }

  const activeEpisodeFeedback = episode
    ? feedback.filter((item) => item.episodeId === episode.id)
    : []

  return (
    <div className="inner-page podcast-page">
      <SectionHeading eyebrow="Listen in" title="The LEAF XTRA Podcast" intro={intro} />
      <label className="podcast-category-filter">Browse by category<select aria-label="Filter podcast episodes by category" onChange={(event) => setCategoryFilter(event.target.value as 'All' | PodcastCategory)} value={categoryFilter}><option value="All">All categories</option>{podcastCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
      {episode ? <>
      <section className="podcast-feature">
        {!isPlaying ? <button aria-label={`Play ${episode.title}`} className="video-frame podcast-video-poster" onClick={() => setPlayingEpisodeId(episode.id)} type="button">
          {episode.thumbnail ? <img alt={`Thumbnail for ${episode.title}`} src={episode.thumbnail} /> : <span className="podcast-poster-placeholder">LEAF XTRA</span>}
          <span aria-hidden="true" className="podcast-play-button">▶</span>
          <span className="podcast-poster-label">Play Episode</span>
        </button> : episode.localVideoKey ? <LocalVideoPlayer videoKey={episode.localVideoKey} title={episode.title} /> : getYouTubeVideoId(episode.youtubeUrl) ? <div className="video-frame">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            src={`https://www.youtube-nocookie.com/embed/${getYouTubeVideoId(episode.youtubeUrl)}?rel=0&vq=hd1080`}
            title={`YouTube video: ${episode.title}`}
          />
        </div> : <div className="video-frame video-loading" role="status">No video is attached to this sample episode.</div>}
        <div className="podcast-copy">
          <span className="eyebrow"><span className="eyebrow-dot podcast-live-dot" />Now playing{episode.isDemo && <span className="content-sample-label">SAMPLE EPISODE</span>}</span>
          <PodcastSourceBadge episode={episode} />
          <h2>{episode.title}</h2>
          <p>{episode.summary}</p>
          <p className="story-byline">By {users.find((user) => user.id === episode.authorId)?.name ?? 'LEAF Editorial Desk'} <span>·</span> {formatStoryDate(episode.publishedAt || episode.createdAt)}</p>
          {!episode.localVideoKey && episode.youtubeUrl && <a className="text-link" href={episode.youtubeUrl} rel="noreferrer" target="_blank">Watch on YouTube <span>↗</span></a>}
        </div>
      </section>
      {episode && getPodcastVideoSource(episode) === 'local' && <section className="podcast-feedback" aria-labelledby="podcast-feedback-title">
        <div className="section-title-row"><div><span className="eyebrow">LEAF Exclusive</span><h2 id="podcast-feedback-title">Share Your Opinion</h2></div><span className="section-date">{activeEpisodeFeedback.length} {activeEpisodeFeedback.length === 1 ? 'message' : 'messages'}</span></div>
        <div className="podcast-feedback-list" aria-live="polite">
          {activeEpisodeFeedback.length ? activeEpisodeFeedback.map((item) => <article className="podcast-feedback-item" key={item.id}><div><strong>{item.name}</strong><time>{item.received}</time></div><p>{item.message}</p></article>) : <p className="podcast-group-empty">No opinions yet. Be the first to share yours.</p>}
        </div>
        <form className="podcast-feedback-form" onSubmit={submitFeedback}>
          <label>Your name<input autoComplete="name" maxLength={80} name="name" required /></label>
          <label>Your opinion<textarea maxLength={1200} name="message" required rows={3} /></label>
          <div className="editor-actions"><button className="green-button" type="submit">Share opinion <span>↗</span></button>{feedbackSentFor === episode.id && <span className="form-success" role="status">Your opinion is visible below.</span>}</div>
          {feedbackError && <p className="media-error" role="alert">{feedbackError}</p>}
          <p className="data-note">Messages are public and saved in this browser preview.</p>
        </form>
      </section>}
      {renderEpisodeGroup(exclusiveEpisodes, 'local')}
      <section className="podcast-sponsor-placement" aria-label="Main sponsor placement between Podcast sections">
        <SponsorBanner settings={settings} onAdClick={onAdClick} label="Sponsored placement · Podcast" />
      </section>
      {renderEpisodeGroup(youtubeEpisodes, 'youtube')}
      {renderEpisodeGroup(previewEpisodes, 'preview')}
      </> : <><div className="podcast-empty"><span className="eyebrow">{categoryFilter === 'All' ? 'Coming up' : categoryFilter}</span><h2>{categoryFilter === 'All' ? 'New conversations are on the way.' : `No ${categoryFilter} episodes yet.`}</h2><p>{categoryFilter === 'All' ? 'Check back for the latest from the LEAF XTRA Podcast. Episodes will appear newest first.' : 'Published episodes in this category will appear here, newest first.'}</p></div><div className="podcast-template"><span className="eyebrow">Podcast layout preview</span><strong>Episode title goes here</strong><span>Host / guest · Upload date</span><small>Local video or YouTube Full HD player appears in this space.</small></div></>}
    </div>
  )
}

function KinyarwandaStatusPage() {
  return (
    <section className="kinyarwanda-status-page" aria-labelledby="kinyarwanda-status-title">
      <span className="eyebrow">Kinyarwanda</span>
      <h1 id="kinyarwanda-status-title">Stay Patient.</h1>
      <p>Under construction.</p>
      <p>Enjoy LEAF Entertainment 😊</p>
    </section>
  )
}

function ContactPage({ onOpinionSubmit, contactEmail, intro }: { onOpinionSubmit: (event: FormEvent<HTMLFormElement>) => void; contactEmail: string; intro: string }) {
  const [opinionSent, setOpinionSent] = useState(false)

  function submitOpinion(event: FormEvent<HTMLFormElement>) {
    onOpinionSubmit(event)
    setOpinionSent(true)
  }

  return (
    <div className="inner-page contact-page">
      <SectionHeading eyebrow="Open inbox" title="Contact the LEAF team." intro={intro} />
      <div className="contact-layout">
        <div className="contact-aside">
          <span className="eyebrow">Say hello</span>
          <a className="contact-email" href={`mailto:${contactEmail}`}>{contactEmail}</a>
          <p>Viewer opinions and story tips go to separate inboxes for the editorial team to review. Submissions are saved in this browser preview only.</p>
          <div className="contact-faq">
            <span className="eyebrow">A few quick answers</span>
            <details><summary>How can I submit a story?</summary><p>Use the Submit a story tip button in the header to share details and supporting images or video. Editors review and verify submissions before publishing.</p></details>
            <details><summary>Can I share music with the charts team?</summary><p>Absolutely. Send the artist name, track link and the platform where it is available.</p></details>
            <details><summary>Do you feature independent creators?</summary><p>Yes. We are always interested in thoughtful work from independent artists and makers.</p></details>
          </div>
        </div>
        <div className="contact-submission-stack">
          <form className="contact-form" onSubmit={submitOpinion}>
            <div className="form-heading"><span className="eyebrow">Viewer opinion</span><span>For thoughts on a story, show or chart.</span></div>
            <label>Your name<input autoComplete="name" name="name" placeholder="Name" required /></label>
            <label>Email address (optional)<input autoComplete="email" name="email" placeholder="you@example.com" type="email" /></label>
            <label>Your opinion<textarea name="message" placeholder="Share your point of view..." required rows={4} /></label>
            <div className="form-submit-row"><button className="green-button" type="submit">Send opinion <span>↗</span></button>{opinionSent && <span className="form-success" role="status">Opinion added to the preview inbox.</span>}</div>
          </form>
        </div>
      </div>
    </div>
  )
}

function StoryTipPage({ onStorySubmit, intro }: { onStorySubmit: (event: FormEvent<HTMLFormElement>, images: string[], video: File | null) => Promise<void>; intro: string }) {
  const [storyImages, setStoryImages] = useState<string[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState('')
  const [storySent, setStorySent] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleStoryFiles(files: FileList | null) {
    if (!files) return
    setUploadError('')
    const selectedFiles = Array.from(files)
    if (selectedFiles.length > 4) {
      setUploadError('Upload up to 4 images per story submission.')
      return
    }
    try {
      const imageDataUrls = await Promise.all(selectedFiles.map(optimizeStoryImage))
      setStoryImages(imageDataUrls)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not process the selected images.')
    }
  }

  async function submitStory(event: FormEvent<HTMLFormElement>) {
    setSaving(true)
    setUploadError('')
    try {
      await onStorySubmit(event, storyImages, videoFile)
      setStoryImages([])
      setVideoFile(null)
      setStorySent(true)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not save this story submission.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="inner-page story-tip-page" id="story-tip">
      <SectionHeading eyebrow="Reader submissions" title="Submit a story tip." intro={intro} />
      <div className="story-tip-callout"><span className="eyebrow">A note for contributors</span><p>Submissions are reader-provided leads, not verified reporting. Editors review and verify each tip before publication.</p></div>
      <form className="contact-form story-tip-form" onSubmit={(event) => void submitStory(event)}>
        <div className="form-heading"><span className="eyebrow">Your story lead</span><span>Share supporting images, a video file, or a video link.</span></div>
        <label>Your name<input autoComplete="name" name="name" placeholder="Name" required /></label>
        <label>Email address<input autoComplete="email" name="email" placeholder="you@example.com" required type="email" /></label>
        <label>Story section<select defaultValue="Local entertainment" name="category"><option>Local entertainment</option><option>International</option><option>Sports</option></select></label>
        <label>Suggested title<input name="title" placeholder="What is the story about?" required /></label>
        <label>Story details<textarea name="details" placeholder="Who, what, where, when, and how can we verify it?" required rows={5} /></label>
        <label>Supporting images (up to 4)<input accept="image/*" multiple onChange={(event) => void handleStoryFiles(event.target.files)} type="file" /></label>
        <label>Video link (optional)<input name="videoLink" placeholder="YouTube or other video URL" type="url" /></label>
        <label>Upload a supporting video (optional)<input accept="video/*" onChange={(event) => { setVideoFile(event.target.files?.[0] ?? null); setUploadError('') }} type="file" /></label>
        {videoFile && <span className="submission-image-note">Selected local video: {videoFile.name} · saved in this browser only.</span>}
        <span className="submission-image-note">Supporting media is reader-provided evidence and does not verify claims by itself.</span>
        {uploadError && <span className="login-error" role="alert">{uploadError}</span>}
        {storyImages.length > 0 && <div className="submission-image-preview">{storyImages.map((image, index) => <img alt={`Story evidence ${index + 1}`} key={`story-evidence-${index}`} src={image} />)}</div>}
        <div className="form-submit-row"><button className="green-button" disabled={saving} type="submit">{saving ? 'Saving…' : 'Submit story tip'} <span>↗</span></button>{storySent && <span className="form-success" role="status">Story tip added to the local editorial inbox.</span>}</div>
      </form>
    </div>
  )
}

function LoginPage({ users, onLogin, onCreateAdmin }: { users: DashboardUser[]; onLogin: (user: DashboardUser) => void; onCreateAdmin: (setup: AdminSetup) => Promise<boolean> }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [error, setError] = useState('')
  const requiresAdminSetup = users.length === 0

  async function createFirstAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== passwordConfirm) {
      setError('The passwords do not match.')
      return
    }
    const created = await onCreateAdmin({ name, username, email, password })
    if (!created) setError('That username is already in use.')
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const user = users.find((account) => account.username === username.trim().toLowerCase() && account.role === role)
    if (!user || !role) {
      setError('No account matches that username and role.')
      return
    }
    if (!user.passwordHash) {
      setError('Ask the Admin to assign your initial password.')
      return
    }
    const passwordHash = await hashPassword(password, user.passwordSalt)
    if (passwordHash !== user.passwordHash) {
      setError('The password is incorrect.')
      return
    }
    onLogin(user)
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <span className="eyebrow"><span className="eyebrow-dot" />LEAF dashboard</span>
        {requiresAdminSetup ? (
          <>
            <h1>Set up your Admin account.</h1>
            <p className="login-intro">Create the first account. This Admin can generate credentials for the rest of the team.</p>
            <form className="login-form" onSubmit={createFirstAdmin}>
              <label>Admin name<input autoComplete="name" onChange={(event) => setName(event.target.value)} required value={name} /></label>
              <label>Username<input autoComplete="username" onChange={(event) => setUsername(event.target.value)} required value={username} /></label>
              <label>Email address<input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
              <label>Password<span className="password-input-wrap"><input autoComplete="new-password" minLength={10} onChange={(event) => setPassword(event.target.value)} required type={showPassword ? 'text' : 'password'} value={password} /><button aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)} type="button">{showPassword ? 'Hide' : 'Show'}</button></span></label>
              <label>Confirm password<span className="password-input-wrap"><input autoComplete="new-password" onChange={(event) => setPasswordConfirm(event.target.value)} required type={showPasswordConfirm ? 'text' : 'password'} value={passwordConfirm} /><button aria-label={showPasswordConfirm ? 'Hide confirmation password' : 'Show confirmation password'} aria-pressed={showPasswordConfirm} onClick={() => setShowPasswordConfirm((visible) => !visible)} type="button">{showPasswordConfirm ? 'Hide' : 'Show'}</button></span></label>
              {error && <p className="login-error" role="alert">{error}</p>}
              <button className="green-button" type="submit">Create Admin account <span>↗</span></button>
            </form>
          </>
        ) : (
          <>
            <h1>Welcome back.</h1>
            <p className="login-intro">Sign in with the role and credentials issued by your Admin.</p>
            <form className="login-form" onSubmit={submitLogin}>
              <label>Account type<select onChange={(event) => setRole(event.target.value as UserRole)} required value={role}><option disabled value="">Select your role</option><option>Admin</option><option>Chief Editor</option><option>Journalist</option></select></label>
              <label>Username<input autoComplete="username" onChange={(event) => setUsername(event.target.value)} required value={username} /></label>
              <label>Password<span className="password-input-wrap"><input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} required type={showPassword ? 'text' : 'password'} value={password} /><button aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)} type="button">{showPassword ? 'Hide' : 'Show'}</button></span></label>
              {error && <p className="login-error" role="alert">{error}</p>}
              <button className="green-button" type="submit">Sign in <span>↗</span></button>
            </form>
          </>
        )}
        <p className="login-security-note">Local preview only. Credentials are stored in this browser and do not provide production-grade access control.</p>
        <a className="text-link" href="#/home">Return to the public site <span>↗</span></a>
      </div>
      <aside className="login-aside"><span>LEAF / PEOPLE / STORIES</span><strong>Let ’Em All Fly.</strong></aside>
    </div>
  )
}

function PasswordChangePanel({ user, onChangePassword }: { user: DashboardUser; onChangePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean> }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSuccess(false)
    if (newPassword !== confirmation) {
      setMessage('New passwords do not match.')
      return
    }
    const changed = await onChangePassword(user.id, currentPassword, newPassword)
    if (!changed) {
      setMessage('Current password is incorrect.')
      return
    }
    setCurrentPassword('')
    setNewPassword('')
    setConfirmation('')
    setMessage('Your password has been updated.')
    setSuccess(true)
  }

  return (
    <section className="password-change-panel">
      <div className="dashboard-section-heading"><div><span className="eyebrow">Your account</span><h2>Change your password</h2><p>Only you can change your own password. Your current password is required.</p></div></div>
      <form className="password-change-form" onSubmit={submit}>
        <label>Current password<input autoComplete="current-password" onChange={(event) => setCurrentPassword(event.target.value)} required type="password" value={currentPassword} /></label>
        <label>New password<input autoComplete="new-password" minLength={10} onChange={(event) => setNewPassword(event.target.value)} required type="password" value={newPassword} /></label>
        <label>Confirm new password<input autoComplete="new-password" onChange={(event) => setConfirmation(event.target.value)} required type="password" value={confirmation} /></label>
        {message && <p className={success ? 'form-success' : 'login-error'} role="status">{message}</p>}
        <button className="green-button" type="submit">Update password <span>↗</span></button>
      </form>
    </section>
  )
}

function DashboardPage({
  section,
  stories,
  chartEntries,
  onSaveChartEntry,
  onSubmitChartEntry,
  onPublishChartEntry,
  onDeleteChartEntry,
  user,
  users,
  onSaveStory,
  onDeleteStory,
  onPublishStory,
  onSubmitStoryForReview,
  onApproveStory,
  onRejectStory,
  podcastEpisodes,
  onSavePodcastEpisode,
  onPublishPodcastEpisode,
  onDeletePodcastEpisode,
  hotPicks,
  onSaveHotPick,
  onPublishHotPick,
  onDeleteHotPick,
  settings,
  onSaveSettings,
  onCreateEmployee,
  onDeleteEmployee,
  onUpdateEmployee,
  onSetEmployeePassword,
  onLogout,
  onChangeOwnPassword,
  feedback,
  viewerOpinions,
  storySubmissions,
  reviewedFeedbackIds,
  onReviewFeedback,
  onDeleteFeedback,
  siteMetrics,
  storyViews,
}: {
  section: string
  stories: Story[]
  chartEntries: ChartEntry[]
  onSaveChartEntry: (entry: ChartEntry) => void
  onSubmitChartEntry: (entryId: string) => void
  onPublishChartEntry: (entryId: string) => void
  onDeleteChartEntry: (entryId: string) => void
  user: DashboardUser
  users: DashboardUser[]
  onSaveStory: (story: Story) => void
  onDeleteStory: (storyId: string) => void
  onPublishStory: (storyId: string) => void
  onSubmitStoryForReview: (storyId: string) => void
  onApproveStory: (storyId: string) => void
  onRejectStory: (storyId: string, reviewNote: string) => void
  podcastEpisodes: PodcastEpisode[]
  onSavePodcastEpisode: (episode: PodcastEpisode) => void
  onPublishPodcastEpisode: (episodeId: string) => void
  onDeletePodcastEpisode: (episodeId: string) => void
  hotPicks: HotPick[]
  onSaveHotPick: (hotPick: HotPick) => void
  onPublishHotPick: (hotPickId: string) => void
  onDeleteHotPick: (hotPickId: string) => void
  settings: SiteSettings
  onSaveSettings: (settings: SiteSettings) => void
  onCreateEmployee: (name: string, username: string, email: string, role: 'Chief Editor' | 'Journalist', password: string) => Promise<boolean | null>
  onDeleteEmployee: (userId: string) => void
  onUpdateEmployee: (userId: string, updates: Pick<DashboardUser, 'name' | 'username' | 'email' | 'role'>) => boolean
  onSetEmployeePassword: (userId: string, password: string) => Promise<boolean>
  onLogout: () => void
  onChangeOwnPassword: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean>
  feedback: FeedbackMessage[]
  viewerOpinions: ViewerOpinion[]
  storySubmissions: StorySubmission[]
  reviewedFeedbackIds: string[]
  onReviewFeedback: (id: string) => void
  onDeleteFeedback: (id: string) => void
  siteMetrics: { pageViews: number; adClicks: number }
  storyViews: Record<string, number>
}) {
  const isAdmin = user.role === 'Admin'
  const tabs = [
    { slug: 'stories', label: 'Stories' },
    { slug: 'charts', label: 'Charts' },
    { slug: 'podcast', label: 'Podcast' },
    { slug: 'hot-picks', label: 'Hot Picks' },
    { slug: 'feedback', label: user.role === 'Journalist' ? 'Your feedback' : 'Feedback inbox' },
    ...(user.role === 'Journalist' ? [{ slug: 'review-results', label: 'Review results' }] : []),
    { slug: 'account', label: 'My password' },
    ...(isAdmin ? [
      { slug: 'opinions', label: 'Viewer opinions' },
      { slug: 'submissions', label: 'Story submissions' },
      { slug: 'website', label: 'Website' },
      { slug: 'analytics', label: 'Analytics' },
      { slug: 'team', label: 'Team access' },
    ] : user.role === 'Chief Editor' ? [
      { slug: 'opinions', label: 'Viewer opinions' },
      { slug: 'submissions', label: 'Story submissions' },
      { slug: 'analytics', label: 'Story engagement' },
    ] : []),
  ]
  const accessDenied = !tabs.some((tab) => tab.slug === section)
  const activeSection = accessDenied ? 'stories' : section
  const dashboardStories = user.role === 'Journalist' ? stories.filter((story) => story.authorId === user.id) : stories
  const publishedCount = dashboardStories.filter((story) => story.status === 'published').length
  const draftCount = dashboardStories.filter((story) => story.status === 'draft').length
  const reviewCount = dashboardStories.filter((story) => story.status === 'submitted').length
  const feedbackCount = user.role === 'Journalist'
    ? feedback.filter((item) => item.authorId === user.id).length
    : feedback.length

  return (
    <div className="dashboard-page">
      <div className="dashboard-title-row">
        <div>
          <span className="eyebrow"><span className="eyebrow-dot" />{user.role} workspace</span>
          <h1>Dashboard</h1>
          <p>Signed in as {user.name} · {user.username}</p>
        </div>
        <div className="dashboard-title-actions"><a className="green-button dashboard-preview-link" href="#/home">View public site <span>↗</span></a><button className="plain-button" onClick={onLogout} type="button">Sign out</button></div>
      </div>
      <div className="dashboard-stats">
        <div><span>{user.role === 'Journalist' ? 'YOUR STORIES' : 'STORIES'}</span><strong>{dashboardStories.length}</strong><small>{publishedCount} published · {draftCount} drafts · {reviewCount} in review</small></div>
        <div><span>{isAdmin ? 'TEAM' : 'ROLE'}</span><strong>{isAdmin ? users.length : user.role}</strong><small>{isAdmin ? 'Accounts managed here' : 'Access based on your account'}</small></div>
        <div><span>FEEDBACK</span><strong>{feedbackCount}</strong><small>{user.role === 'Journalist' ? 'On your stories' : 'Across all stories'}</small></div>
      </div>
      <nav className="dashboard-tabs" aria-label="Dashboard sections">
        {tabs.map((tab) => (
          <a aria-current={activeSection === tab.slug ? 'page' : undefined} className={activeSection === tab.slug ? 'is-active' : ''} href={`#/dashboard/${tab.slug}`} key={tab.slug}>{tab.label}</a>
        ))}
      </nav>
      {accessDenied && <p className="dashboard-access-note" role="status">That section is not available to your account role.</p>}
      {activeSection === 'website' && <WebsiteSettingsPanel settings={settings} onSave={onSaveSettings} />}
      {activeSection === 'analytics' && <AnalyticsPanel stories={stories} feedback={feedback} opinions={viewerOpinions} submissions={storySubmissions} metrics={siteMetrics} adRevenue={settings.adRevenue} isAdmin={isAdmin} />}
      {activeSection === 'team' && <TeamManager users={users} currentUser={user} onCreateEmployee={onCreateEmployee} onDeleteEmployee={onDeleteEmployee} onUpdateEmployee={onUpdateEmployee} onSetEmployeePassword={onSetEmployeePassword} />}
      {activeSection === 'feedback' && <FeedbackPanel user={user} stories={stories} feedback={feedback} reviewedFeedbackIds={reviewedFeedbackIds} onReview={onReviewFeedback} onDelete={onDeleteFeedback} />}
      {activeSection === 'review-results' && user.role === 'Journalist' && <JournalistReviewPanel stories={stories.filter((story) => story.authorId === user.id)} feedback={feedback} storyViews={storyViews} />}
      {activeSection === 'charts' && <ChartEntryManager entries={chartEntries} user={user} onSave={onSaveChartEntry} onSubmit={onSubmitChartEntry} onPublish={onPublishChartEntry} onDelete={onDeleteChartEntry} />}
      {activeSection === 'podcast' && <PodcastManager episodes={podcastEpisodes} users={users} user={user} onSave={onSavePodcastEpisode} onPublish={onPublishPodcastEpisode} onDelete={onDeletePodcastEpisode} />}
      {activeSection === 'hot-picks' && <HotPickManager picks={hotPicks} user={user} onSave={onSaveHotPick} onPublish={onPublishHotPick} onDelete={onDeleteHotPick} />}
      {activeSection === 'opinions' && <OpinionInbox opinions={viewerOpinions} />}
      {activeSection === 'submissions' && <StorySubmissionInbox submissions={storySubmissions} canDownload={user.role === 'Admin' || user.role === 'Chief Editor'} />}
      {activeSection === 'account' && <PasswordChangePanel user={user} onChangePassword={onChangeOwnPassword} />}
      {activeSection === 'stories' && <StoryManager stories={stories} users={users} user={user} onSaveStory={onSaveStory} onDeleteStory={onDeleteStory} onPublishStory={onPublishStory} onSubmitStoryForReview={onSubmitStoryForReview} onApproveStory={onApproveStory} onRejectStory={onRejectStory} />}
      <p className="dashboard-local-note">Local preview only. Account and content changes stay in this browser and are not synced to a server.</p>
    </div>
  )
}

function JournalistReviewPanel({ stories, feedback, storyViews }: { stories: Story[]; feedback: FeedbackMessage[]; storyViews: Record<string, number> }) {
  const acceptedStories = stories.filter((story) => story.status === 'approved' || story.status === 'published')
  const rejectedStories = stories.filter((story) => story.status === 'rejected')
  const publishedStories = stories.filter((story) => story.status === 'published')
  const engagementCount = (storyId: string) => feedback.filter((item) => item.storyId === storyId).length

  return (
    <section className="journalist-review-panel">
      <div className="dashboard-section-heading"><div><span className="eyebrow">Editorial status</span><h2>Review results</h2><p>Your stories awaiting review are listed under Stories. Accepted stories are published by the Chief Editor or Admin.</p></div></div>
      <div className="journalist-status-tables">
        <section>
          <h3>Accepted stories</h3>
          <div className="journalist-table-scroll"><table className="journalist-story-table">
            <thead><tr><th>STORY</th><th>CATEGORY</th><th>STATUS</th><th>REVIEWED</th></tr></thead>
            <tbody>{acceptedStories.map((story) => <tr key={story.id}><td>{story.title}</td><td>{story.category}</td><td>{story.status === 'published' ? 'Published' : 'Accepted · awaiting publication'}</td><td>{formatStoryDate(story.reviewedAt || story.publishedAt)}</td></tr>)}
              {acceptedStories.length === 0 && <tr><td colSpan={4}>No accepted stories yet.</td></tr>}
            </tbody>
          </table></div>
        </section>
        <section>
          <h3>Rejected stories</h3>
          <div className="journalist-table-scroll"><table className="journalist-story-table">
            <thead><tr><th>STORY</th><th>CATEGORY</th><th>EDITOR FEEDBACK</th><th>REVIEWED</th></tr></thead>
            <tbody>{rejectedStories.map((story) => <tr key={story.id}><td>{story.title}</td><td>{story.category}</td><td>{story.reviewNote || 'No feedback note provided.'}</td><td>{formatStoryDate(story.reviewedAt)}</td></tr>)}
              {rejectedStories.length === 0 && <tr><td colSpan={4}>No rejected stories.</td></tr>}
            </tbody>
          </table></div>
        </section>
        <section>
          <h3>Published story stats</h3>
          <div className="journalist-table-scroll"><table className="journalist-story-table">
            <thead><tr><th>STORY</th><th>PUBLISHED</th><th>VIEWS</th><th>FEEDBACK</th><th>TOTAL ENGAGEMENTS</th></tr></thead>
            <tbody>{publishedStories.map((story) => {
              const storyFeedbackCount = engagementCount(story.id)
              const viewCount = storyViews[story.id] ?? 0
              return <tr key={story.id}><td>{story.title}</td><td>{formatStoryDate(story.publishedAt)}</td><td>{viewCount}</td><td>{storyFeedbackCount}</td><td>{viewCount + storyFeedbackCount}</td></tr>
            })}
              {publishedStories.length === 0 && <tr><td colSpan={5}>No published stories to report yet.</td></tr>}
            </tbody>
          </table></div>
          <p className="data-note">Views count when a reader scrolls a story into view. Feedback counts are tied to the story and its author.</p>
        </section>
      </div>
    </section>
  )
}

function StoryManager({ stories, users, user, onSaveStory, onDeleteStory, onPublishStory, onSubmitStoryForReview, onApproveStory, onRejectStory }: { stories: Story[]; users: DashboardUser[]; user: DashboardUser; onSaveStory: (story: Story) => void; onDeleteStory: (storyId: string) => void; onPublishStory: (storyId: string) => void; onSubmitStoryForReview: (storyId: string) => void; onApproveStory: (storyId: string) => void; onRejectStory: (storyId: string, reviewNote: string) => void }) {
  const [draft, setDraft] = useState<Story | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [rejectingStoryId, setRejectingStoryId] = useState<string | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const [imageError, setImageError] = useState('')
  const [activeCategory, setActiveCategory] = useState<'All' | StoryCategory>('All')
  const categoryFilters: Array<'All' | StoryCategory> = ['All', 'Local entertainment', 'International', 'Sports']
  const roleStories = user.role === 'Journalist' ? stories.filter((story) => story.authorId === user.id) : stories
  const visibleStories = activeCategory === 'All'
    ? roleStories
    : roleStories.filter((story) => story.category === activeCategory)

  function startNewStory() {
    const category = activeCategory === 'All' ? 'Local entertainment' : activeCategory
    setImageError('')
    setDraft({ id: '', authorId: user.id, status: 'draft', category, title: '', summary: '', body: '', image: '', imageAlt: '', youtubeUrl: '', createdAt: new Date().toISOString(), href: `#/news/${categorySlug(category)}` })
  }

  async function handleImageUpload(file?: File) {
    if (!file || !draft) return
    setImageError('')
    try {
      const image = await optimizeStoryImage(file)
      setDraft((currentDraft) => currentDraft ? { ...currentDraft, image } : currentDraft)
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Could not load this image.')
    }
  }

  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft) return
    if (!draft.image) {
      setImageError('Upload a story image or provide an image URL.')
      return
    }
    if (draft.youtubeUrl && !getYouTubeVideoId(draft.youtubeUrl)) {
      setImageError('Enter a valid YouTube video URL, or leave this field blank.')
      return
    }
    setImageError('')
    const savedStory: Story = {
      ...draft,
      id: draft.id || createStoryId(),
      createdAt: draft.createdAt || new Date().toISOString(),
      body: draft.body || '',
      youtubeUrl: draft.youtubeUrl || '',
      href: `#/news/${categorySlug(draft.category)}`,
    }
    onSaveStory(savedStory)
    setDraft(null)
  }

  return (
    <section className="story-manager" aria-label="Manage stories">
      <div className="dashboard-section-heading">
        <div><span className="eyebrow">Editorial desk</span><h2>Stories</h2><p>{user.role === 'Journalist' ? 'Write your stories and send them to the Chief Editor for review. Accepted stories are published by an editor.' : 'Review submitted stories, manage editorial content, and publish approved stories.'}</p></div>
        <button className="green-button" onClick={startNewStory} type="button">Add story <span>+</span></button>
      </div>
      <div className="story-category-filters" role="group" aria-label="Filter stories by category">
        {categoryFilters.map((category) => {
          const count = category === 'All' ? roleStories.length : roleStories.filter((story) => story.category === category).length
          return <button aria-pressed={activeCategory === category} className={activeCategory === category ? 'is-active' : ''} key={category} onClick={() => setActiveCategory(category)} type="button">{category}<span>{count}</span></button>
        })}
      </div>
      {draft && (
        <form className="dashboard-editor" onSubmit={saveDraft}>
          <div className="dashboard-editor-heading"><div><span className="eyebrow">{draft.id ? 'Edit story' : 'New story'}</span><h3>{draft.id ? 'Update the story details' : 'Add a story to the site'}</h3></div><button className="plain-button" onClick={() => setDraft(null)} type="button">Cancel</button></div>
          <label>Title<input autoFocus onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Story title" required value={draft.title} /></label>
          <label>Section<select onChange={(event) => setDraft({ ...draft, category: event.target.value as StoryCategory })} value={draft.category}><option>Local entertainment</option><option>International</option><option>Sports</option></select></label>
          <label className="editor-wide">Lead<textarea onChange={(event) => setDraft({ ...draft, summary: event.target.value })} placeholder="Write the story lead" required rows={3} value={draft.summary} /></label>
          <label className="editor-wide">Story body<textarea className="story-body-input" onChange={(event) => setDraft({ ...draft, body: event.target.value })} placeholder="Write the full story" required rows={10} value={draft.body ?? ''} /></label>
          <label className="editor-wide">YouTube video link (optional)<input onChange={(event) => setDraft({ ...draft, youtubeUrl: event.target.value })} placeholder="https://www.youtube.com/watch?v=..." type="url" value={draft.youtubeUrl ?? ''} /></label>
          <label className="editor-wide">Image URL<input onChange={(event) => setDraft({ ...draft, image: event.target.value })} placeholder="Paste an image URL or upload an image below" type="url" value={draft.image.startsWith('data:') ? '' : draft.image} /></label>
          <label className="editor-wide">Upload image<input accept="image/*" onChange={(event) => void handleImageUpload(event.target.files?.[0])} type="file" /></label>
          {imageError && <p className="login-error editor-wide" role="alert">{imageError}</p>}
          {draft.image && <div className="story-image-preview editor-wide"><img alt={draft.imageAlt || 'Story image preview'} src={draft.image} /><span>Story image preview</span></div>}
          <label className="editor-wide">Image description<input onChange={(event) => setDraft({ ...draft, imageAlt: event.target.value })} placeholder="Describe the image" required value={draft.imageAlt} /></label>
          <div className="editor-actions"><button className="green-button" type="submit">Save story <span>↗</span></button></div>
        </form>
      )}
      <div className="story-table-head"><span>STORY</span><span>SECTION</span><span>ACTIONS</span></div>
      <div className="story-table">
        {visibleStories.map((story) => (
          <article className="story-admin-row" key={story.id}>
            <div className="story-admin-main"><img src={story.image} alt="" /><div><strong>{story.title}</strong><span>{story.summary}</span><small>{users.find((editor) => editor.id === story.authorId)?.name ?? 'LEAF Editorial Desk'} · {formatStoryDate(story.publishedAt || story.createdAt)}</small></div></div>
            <span className="story-category-label">{story.category}<small className={`story-status is-${story.status}`}>{story.status === 'submitted' ? 'Awaiting editor review' : story.status === 'approved' ? 'Accepted · ready to publish' : story.status === 'rejected' ? 'Rejected · changes requested' : story.status === 'published' ? 'Published' : 'Draft'}</small>{story.status === 'rejected' && story.reviewNote && <small className="story-review-note">{story.reviewNote}</small>}</span>
            {pendingDeleteId === story.id ? (
              <div className="delete-confirm"><span>Remove this story?</span><button onClick={() => { onDeleteStory(story.id); setPendingDeleteId(null) }} type="button">Confirm</button><button onClick={() => setPendingDeleteId(null)} type="button">Keep</button></div>
            ) : (
              <div className="story-admin-actions">
                <button disabled={user.role === 'Journalist' && (story.authorId !== user.id || !['draft', 'rejected'].includes(story.status))} onClick={() => setDraft(story)} title={user.role === 'Journalist' ? 'Journalists can edit their own drafts and rejected stories' : 'Edit story'} type="button">Edit</button>
                {user.role === 'Journalist' && story.authorId === user.id && ['draft', 'rejected'].includes(story.status) && <button onClick={() => onSubmitStoryForReview(story.id)} type="button">Submit for review</button>}
                {user.role !== 'Journalist' && story.status === 'submitted' && <><button onClick={() => onApproveStory(story.id)} type="button">Accept</button><button onClick={() => { setRejectingStoryId(story.id); setReviewNote('') }} type="button">Reject</button></>}
                {user.role !== 'Journalist' && ['approved', 'draft'].includes(story.status) && <button onClick={() => onPublishStory(story.id)} type="button">{story.status === 'approved' ? 'Publish accepted story' : 'Publish'}</button>}
                {user.role !== 'Journalist' && <button disabled={stories.length === 1} onClick={() => setPendingDeleteId(story.id)} title={stories.length === 1 ? 'Keep at least one story for the Home carousel' : 'Delete story'} type="button">Delete</button>}
                {rejectingStoryId === story.id && <form className="story-rejection-form" onSubmit={(event) => { event.preventDefault(); onRejectStory(story.id, reviewNote); setRejectingStoryId(null); setReviewNote('') }}><label>Reason or requested changes<textarea onChange={(event) => setReviewNote(event.target.value)} placeholder="Tell the journalist what needs to change." rows={2} value={reviewNote} /></label><button type="submit">Confirm rejection</button><button onClick={() => setRejectingStoryId(null)} type="button">Cancel</button></form>}
              </div>
            )}
          </article>
        ))}
        {visibleStories.length === 0 && <p className="dashboard-empty">No stories in this category yet. Add a story to populate it.</p>}
      </div>
    </section>
  )
}

function ChartEntryManager({ entries, user, onSave, onSubmit, onPublish, onDelete }: { entries: ChartEntry[]; user: DashboardUser; onSave: (entry: ChartEntry) => void; onSubmit: (entryId: string) => void; onPublish: (entryId: string) => void; onDelete: (entryId: string) => void }) {
  const [draft, setDraft] = useState<ChartEntry | null>(null)
  const [error, setError] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const isEditor = user.role !== 'Journalist'
  const visibleEntries = (isEditor ? entries : entries.filter((entry) => entry.authorId === user.id))
    .slice()
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))

  function startNewEntry() {
    setError('')
    setCoverFile(null)
    setDraft({ id: '', authorId: user.id, status: 'draft', chartSlug: chartPages[0].slug, artist: '', title: '', cover: '', releaseDate: '', createdAt: new Date().toISOString() })
  }

  async function uploadCover(file: File | undefined) {
    if (!file || !draft) return
    setError('')
    try {
      const cover = await optimizeStoryImage(file)
      setDraft((current) => current ? { ...current, cover } : current)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not process this cover image.')
    }
  }

  function saveEntry(submitForReview = false) {
    if (!draft) return
    if (!draft.title.trim() || !draft.artist.trim()) {
      setError('Enter both the release title and artist name.')
      return
    }
    if (!draft.cover.trim()) {
      setError('Add a cover image using an image URL or upload.')
      return
    }
    if (!draft.releaseDate) {
      setError('Select the release date.')
      return
    }
    if (!draft.cover.startsWith('data:')) {
      try {
        const coverUrl = new URL(draft.cover)
        if (!['http:', 'https:'].includes(coverUrl.protocol)) throw new Error('Invalid image URL.')
      } catch {
        setError('Enter a valid cover image URL or upload an image.')
        return
      }
    }
    const entryId = draft.id || createStoryId()
    onSave({ ...draft, id: entryId, authorId: draft.authorId || user.id, artist: draft.artist.trim(), title: draft.title.trim() })
    if (submitForReview && user.role === 'Journalist') onSubmit(entryId)
    setDraft(null)
    setCoverFile(null)
    setError('')
  }

  return (
    <section className="chart-entry-manager">
      <div className="dashboard-section-heading"><div><span className="eyebrow">Editorial charts</span><h2>Chart Entries</h2><p>{isEditor ? 'Review submitted entries, publish chart rows and manage published rankings.' : 'Add chart entries with cover art and release dates. Editors review entries before publication.'}</p></div><button className="green-button" onClick={startNewEntry} type="button">Add Chart Entry <span>+</span></button></div>
      {draft && <form className="dashboard-editor chart-entry-editor" onSubmit={(event) => { event.preventDefault(); saveEntry() }}>
        <div className="dashboard-editor-heading"><div><span className="eyebrow">{draft.id ? 'Edit chart entry' : 'New chart entry'}</span><h3>{draft.id ? 'Update entry details' : 'Add a release to the charts'}</h3></div><button className="plain-button" onClick={() => setDraft(null)} type="button">Cancel</button></div>
        <label>Chart<select onChange={(event) => setDraft({ ...draft, chartSlug: event.target.value })} value={draft.chartSlug}>{chartPages.map((chart) => <option key={chart.slug} value={chart.slug}>{chart.label}</option>)}</select></label>
        <label>Title<input autoFocus onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Song or album title" required value={draft.title} /></label>
        <label>Artist<input onChange={(event) => setDraft({ ...draft, artist: event.target.value })} placeholder="Artist name" required value={draft.artist} /></label>
        <label>Release date<input onChange={(event) => setDraft({ ...draft, releaseDate: event.target.value })} required type="date" value={draft.releaseDate} /></label>
        <label className="editor-wide">Cover image URL<input onChange={(event) => setDraft({ ...draft, cover: event.target.value })} placeholder="https://…" type="url" value={draft.cover.startsWith('data:') ? '' : draft.cover} /></label>
        <label className="editor-wide">Upload cover image<input accept="image/*" onChange={(event) => { setCoverFile(event.target.files?.[0] ?? null); void uploadCover(event.target.files?.[0]) }} type="file" /></label>
        {draft.cover && <div className="story-image-preview editor-wide"><img src={draft.cover} alt={`Cover preview for ${draft.title || 'chart entry'}`} /><span>Cover preview · saved in this browser</span><button className="plain-button" onClick={() => { setDraft({ ...draft, cover: '' }); setCoverFile(null) }} type="button">Remove cover</button></div>}
        {coverFile && <span className="submission-image-note editor-wide">Selected: {coverFile.name}</span>}
        {error && <p className="login-error" role="alert">{error}</p>}
        <div className="editor-actions"><button className="green-button" type="submit">Save Draft <span>↗</span></button>{user.role === 'Journalist' && <button className="plain-button" onClick={() => saveEntry(true)} type="button">Submit for Review</button>}<span className="form-success">{isEditor ? 'Published entries appear on the public chart.' : 'A Chief Editor or Admin must publish your submission.'}</span></div>
      </form>}
      <div className="chart-entry-list">
        {visibleEntries.map((entry) => {
          const canEdit = isEditor || (entry.authorId === user.id && entry.status === 'draft')
          return <article className="chart-entry-row" key={entry.id}>
            {entry.cover && <img className="chart-entry-cover" src={entry.cover} alt={`Cover art for ${entry.title}`} />}
            <div className="chart-entry-copy"><span className={`story-status${entry.status === 'published' ? ' is-published' : ''}`}>{entry.status === 'submitted' ? 'Submitted for review' : entry.status}</span><h3>{entry.title}</h3><p>{entry.artist} · {chartPages.find((chart) => chart.slug === entry.chartSlug)?.label} · Released {formatStoryDate(entry.releaseDate)}</p></div>
            <div className="chart-entry-actions">
              {canEdit && <button className="plain-button" onClick={() => { setDraft(entry); setError(''); setCoverFile(null) }} type="button">Edit</button>}
              {user.role === 'Journalist' && entry.status === 'draft' && <button className="plain-button" onClick={() => onSubmit(entry.id)} type="button">Submit for Review</button>}
              {isEditor && entry.status !== 'published' && <button className="plain-button" onClick={() => onPublish(entry.id)} type="button">Publish</button>}
              {isEditor && <button className="plain-button danger-button" onClick={() => onDelete(entry.id)} type="button">Delete</button>}
            </div>
          </article>
        })}
        {visibleEntries.length === 0 && <p className="dashboard-empty">No chart entries yet. Add one to start building an editorial chart.</p>}
      </div>
    </section>
  )
}

function PodcastManager({ episodes, users, user, onSave, onPublish, onDelete }: { episodes: PodcastEpisode[]; users: DashboardUser[]; user: DashboardUser; onSave: (episode: PodcastEpisode) => void; onPublish: (episodeId: string) => void; onDelete: (episodeId: string) => void }) {
  const [draft, setDraft] = useState<PodcastEpisode | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoSource, setVideoSource] = useState<'local' | 'youtube'>('youtube')
  const [error, setError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const isEditor = user.role !== 'Journalist'
  const visibleEpisodes = isEditor ? episodes : episodes.filter((episode) => episode.authorId === user.id)

  function startNewEpisode() {
    setError('')
    setVideoFile(null)
    setVideoSource('youtube')
    setDraft({ id: '', authorId: user.id, status: 'draft', category: 'Local entertainment', title: '', summary: '', youtubeUrl: '', createdAt: new Date().toISOString() })
  }

  function changeVideoSource(source: 'local' | 'youtube') {
    setVideoSource(source)
    setVideoFile(null)
    setError('')
    setDraft((current) => current ? {
      ...current,
      youtubeUrl: source === 'local' ? '' : current.youtubeUrl,
      localVideoKey: source === 'youtube' ? undefined : current.localVideoKey,
    } : current)
  }

  async function uploadThumbnail(file: File | undefined) {
    if (!file || !draft) return
    setError('')
    try {
      const thumbnail = await optimizeStoryImage(file)
      setDraft((current) => current ? { ...current, thumbnail } : current)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not process this thumbnail.')
    }
  }

  async function saveEpisode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft) return
    if (videoSource === 'youtube' && !getYouTubeVideoId(draft.youtubeUrl)) {
      setError('Add a valid YouTube video link.')
      return
    }
    if (videoSource === 'local' && !videoFile && !draft.localVideoKey) {
      setError('Upload a local video for this LEAF Exclusive episode.')
      return
    }
    try {
      const localVideoKey = videoSource === 'local' ? videoFile ? await saveLocalVideo(videoFile) : draft.localVideoKey : undefined
      onSave({
        ...draft,
        id: draft.id || createStoryId(),
        youtubeUrl: videoSource === 'youtube' ? draft.youtubeUrl : '',
        localVideoKey,
      })
      setDraft(null)
      setVideoFile(null)
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save this episode.')
    }
  }

  function editEpisode(episode: PodcastEpisode) {
    setDraft(episode)
    setVideoSource(episode.localVideoKey ? 'local' : 'youtube')
    setVideoFile(null)
    setError('')
  }

  function renderEpisodeGroup(groupEpisodes: PodcastEpisode[], source: 'local' | 'youtube' | 'preview') {
    if (groupEpisodes.length === 0) return null
    const isExclusive = source === 'local'
    const groupTitle = isExclusive ? 'LEAF Exclusive · Local Uploads' : source === 'youtube' ? 'YouTube Episodes' : 'Sample Episodes · No Video'
    const groupDescription = isExclusive
      ? 'Played inside the LEAF site. This prototype stores video in the current browser and does not deliver it to other devices.'
      : source === 'youtube' ? 'Hosted on YouTube and embedded on the site.' : 'Sample episodes for layout preview; no video source is attached.'
    return <section className={`podcast-admin-group is-${source}`} key={source}>
      <div className="podcast-admin-group-heading"><div><h3>{groupTitle}</h3><p>{groupDescription}</p></div><span className={`podcast-source-badge is-${source}`}>{isExclusive ? 'LEAF Exclusive' : source === 'youtube' ? 'YouTube' : 'Preview'}</span></div>
      <div className="podcast-admin-list">
        {groupEpisodes.map((episode) => (
          <article className="podcast-admin-row" key={episode.id}>
            <div className="podcast-admin-copy">{episode.thumbnail && <img className="podcast-admin-thumbnail" src={episode.thumbnail} alt={`Thumbnail for ${episode.title}`} />}<span className={`story-status${episode.status === 'published' ? ' is-published' : ''}`}>{episode.status === 'published' ? 'Published' : 'Draft'}</span><PodcastSourceBadge episode={episode} /><span className="podcast-category-label">{getPodcastCategory(episode)}</span><h3>{episode.title}</h3><p>{episode.summary}</p><span className="podcast-admin-meta">By {users.find((editor) => editor.id === episode.authorId)?.name ?? 'LEAF Editorial Desk'} · {formatStoryDate(episode.publishedAt || episode.createdAt)}</span></div>
            <div className="podcast-admin-actions">
              {episode.localVideoKey ? <LocalVideoPlayer videoKey={episode.localVideoKey} title={episode.title} /> : getPodcastVideoSource(episode) === 'youtube' ? <a className="plain-button podcast-watch-link" href={episode.youtubeUrl} rel="noreferrer" target="_blank">Preview on YouTube ↗</a> : <span className="podcast-no-video">No video attached</span>}
              <button className="plain-button" disabled={user.role === 'Journalist' && (episode.authorId !== user.id || episode.status === 'published')} onClick={() => editEpisode(episode)} type="button">Edit</button>
              {isEditor && episode.status === 'draft' && <button className="plain-button" onClick={() => onPublish(episode.id)} type="button">Publish</button>}
              {isEditor && <button className="plain-button danger-button" onClick={() => setPendingDeleteId(episode.id)} type="button">Delete</button>}
              {pendingDeleteId === episode.id && <div className="podcast-delete-confirm"><span>Delete this episode?</span><button onClick={() => { onDelete(episode.id); setPendingDeleteId(null) }} type="button">Confirm</button><button onClick={() => setPendingDeleteId(null)} type="button">Cancel</button></div>}
            </div>
          </article>
        ))}
      </div>
    </section>
  }

  return (
    <section className="podcast-manager">
      <div className="dashboard-section-heading"><div><span className="eyebrow">Episode desk</span><h2>LEAF XTRA Podcast episodes</h2><p>{isEditor ? 'Review, publish and manage LEAF XTRA Podcast episodes.' : 'Add an episode draft with a title, summary and local or YouTube video.'}</p></div><button className="green-button" onClick={startNewEpisode} type="button">Add episode <span>+</span></button></div>
      {draft && <form className="dashboard-editor podcast-editor" onSubmit={saveEpisode}>
        <div className="dashboard-editor-heading"><div><span className="eyebrow">{draft.id ? 'Edit episode' : 'New episode'}</span><h3>{draft.id ? 'Update episode details' : 'Add a podcast episode'}</h3></div><button className="plain-button" onClick={() => setDraft(null)} type="button">Cancel</button></div>
        <label className="editor-wide">Title<input autoFocus onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Episode title" required value={draft.title} /></label>
        <label className="editor-wide">Summary<textarea onChange={(event) => setDraft({ ...draft, summary: event.target.value })} placeholder="What will listeners hear about?" required rows={4} value={draft.summary} /></label>
        <label className="editor-wide">Category<select onChange={(event) => setDraft({ ...draft, category: event.target.value as PodcastCategory })} value={draft.category ?? 'Local entertainment'}>{podcastCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
        <label className="editor-wide">Thumbnail image URL (optional)<input onChange={(event) => setDraft({ ...draft, thumbnail: event.target.value })} placeholder="https://…" type="url" value={draft.thumbnail?.startsWith('data:') ? '' : draft.thumbnail ?? ''} /></label>
        <label className="editor-wide">Upload thumbnail image (optional)<input accept="image/*" onChange={(event) => { void uploadThumbnail(event.target.files?.[0]) }} type="file" /></label>
        {draft.thumbnail && <div className="story-image-preview editor-wide"><img src={draft.thumbnail} alt={`Thumbnail preview for ${draft.title || 'new episode'}`} /><span>Thumbnail preview · saved with the episode in this browser</span><button className="plain-button" onClick={() => setDraft({ ...draft, thumbnail: '' })} type="button">Remove thumbnail</button></div>}
        <label className="editor-wide">Video source<select onChange={(event) => changeVideoSource(event.target.value as 'local' | 'youtube')} value={videoSource}><option value="youtube">YouTube link · YouTube-hosted</option><option value="local">Local upload · LEAF Exclusive</option></select></label>
        {videoSource === 'youtube'
          ? <label className="editor-wide">YouTube video link<input onChange={(event) => setDraft({ ...draft, youtubeUrl: event.target.value })} placeholder="https://www.youtube.com/watch?v=..." required type="url" value={draft.youtubeUrl} /></label>
          : <label className="editor-wide">Upload local video · LEAF Exclusive<input accept="video/*" onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)} required={!draft.localVideoKey} type="file" /></label>}
        {videoSource === 'local' && videoFile && <span className="submission-image-note editor-wide">Selected: {videoFile.name} · stored in this browser’s IndexedDB and streamed in the LEAF player.</span>}
        {videoSource === 'local' && draft.localVideoKey && !videoFile && <span className="submission-image-note editor-wide">A LEAF Exclusive local video is already attached. Select another file to replace it.</span>}
        {videoSource === 'local' && <p className="podcast-local-storage-note editor-wide">Local uploads are marked LEAF Exclusive and play only inside this site. This prototype stores video in this browser, so server storage is required for delivery to other devices.</p>}
        {error && <p className="login-error" role="alert">{error}</p>}
        <div className="editor-actions"><button className="green-button" type="submit">Save episode <span>↗</span></button><span className="form-success">{isEditor ? 'Saved episodes remain drafts until published.' : 'Your episode will be a draft until an editor publishes it.'}</span></div>
      </form>}
      {visibleEpisodes.length === 0 ? <p className="dashboard-empty">No podcast episodes here yet. Add an episode to start the conversation.</p> : <>
        {renderEpisodeGroup(visibleEpisodes.filter((episode) => getPodcastVideoSource(episode) === 'local'), 'local')}
        {renderEpisodeGroup(visibleEpisodes.filter((episode) => getPodcastVideoSource(episode) === 'youtube'), 'youtube')}
        {renderEpisodeGroup(visibleEpisodes.filter((episode) => getPodcastVideoSource(episode) === 'preview'), 'preview')}
      </>}
    </section>
  )
}

function HotPickManager({ picks, user, onSave, onPublish, onDelete }: { picks: HotPick[]; user: DashboardUser; onSave: (pick: HotPick) => void; onPublish: (id: string) => void; onDelete: (id: string) => void }) {
  const [draft, setDraft] = useState<HotPick | null>(null)
  const [error, setError] = useState('')
  const isEditor = user.role !== 'Journalist'
  const visiblePicks = isEditor ? picks : picks.filter((pick) => pick.authorId === user.id)

  function startNew() {
    setError('')
    setDraft({ id: '', authorId: user.id, status: 'draft', artist: '', title: '', genre: '', cover: '', link: '', createdAt: new Date().toISOString() })
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft) return
    if (!draft.genre.trim()) {
      setError('Enter the song genre.')
      return
    }
    try {
      if (draft.link && !new URL(draft.link)) throw new Error('Provide a valid song URL.')
    } catch {
      setError('Provide a valid song URL or leave the link blank.')
      return
    }
    onSave({ ...draft, genre: draft.genre.trim(), id: draft.id || createStoryId() })
    setDraft(null)
  }

  return (
    <section className="hot-pick-manager">
      <div className="dashboard-section-heading"><div><span className="eyebrow">Artist spotlight</span><h2>LEAF HOT PICKS</h2><p>{isEditor ? 'Review and publish upcoming artist features.' : 'Create and edit your own Hot Picks drafts; an editor publishes them.'}</p></div><button className="green-button" onClick={startNew} type="button">Add Hot Pick <span>+</span></button></div>
      {draft && <form className="dashboard-editor" onSubmit={save}>
        <div className="dashboard-editor-heading"><div><span className="eyebrow">{draft.id ? 'Edit Hot Pick' : 'New Hot Pick'}</span><h3>Song and artist details</h3></div><button className="plain-button" onClick={() => setDraft(null)} type="button">Cancel</button></div>
        <label>Song title<input onChange={(event) => setDraft({ ...draft, title: event.target.value })} required value={draft.title} /></label>
        <label>Artist name<input onChange={(event) => setDraft({ ...draft, artist: event.target.value })} required value={draft.artist} /></label>
        <label>Genre<input onChange={(event) => setDraft({ ...draft, genre: event.target.value })} placeholder="e.g. Afro-pop, R&B, Hip-hop" required value={draft.genre} /></label>
        <label className="editor-wide">Cover image URL<input onChange={(event) => setDraft({ ...draft, cover: event.target.value })} placeholder="https://…" type="url" value={draft.cover} /></label>
        <label className="editor-wide">Song or video link<input onChange={(event) => setDraft({ ...draft, link: event.target.value })} placeholder="YouTube, Audiomack, or another platform link" type="url" value={draft.link} /></label>
        {error && <p className="login-error editor-wide" role="alert">{error}</p>}
        <div className="editor-actions"><button className="green-button" type="submit">Save Hot Pick <span>↗</span></button><span className="form-success">{isEditor ? 'New items remain drafts until published.' : 'An editor must publish your draft.'}</span></div>
      </form>}
      <div className="hot-pick-admin-list">
        {visiblePicks.map((pick) => <article className="hot-pick-admin-row" key={pick.id}>
          <div className="hot-pick-admin-cover">{pick.cover ? <img src={pick.cover} alt="" /> : <span>LEAF PICK</span>}</div>
          <div><span className={`story-status${pick.status === 'published' ? ' is-published' : ''}`}>{pick.status === 'published' ? 'Published' : 'Draft'}</span><h3>{pick.title}</h3><p>{pick.artist} · {pick.genre}</p></div>
          <div className="podcast-admin-actions">
            <button className="plain-button" disabled={user.role === 'Journalist' && (pick.authorId !== user.id || pick.status === 'published')} onClick={() => { setDraft(pick); setError('') }} type="button">Edit</button>
            {isEditor && pick.status === 'draft' && <button className="plain-button" onClick={() => onPublish(pick.id)} type="button">Publish</button>}
            {isEditor && <button className="plain-button danger-button" onClick={() => onDelete(pick.id)} type="button">Delete</button>}
          </div>
        </article>)}
        {visiblePicks.length === 0 && <p className="dashboard-empty">No Hot Picks available. Add a song to start an editorial draft.</p>}
      </div>
    </section>
  )
}

function AnalyticsPanel({ stories, feedback, opinions, submissions, metrics, adRevenue, isAdmin }: { stories: Story[]; feedback: FeedbackMessage[]; opinions: ViewerOpinion[]; submissions: StorySubmission[]; metrics: { pageViews: number; adClicks: number }; adRevenue: string; isAdmin: boolean }) {
  const published = stories.filter((story) => story.status === 'published').length
  const engagementCount = feedback.length + opinions.length + submissions.length
  return (
    <section className="analytics-panel">
      <div className="dashboard-section-heading"><div><span className="eyebrow">Admin overview</span><h2>Website analytics</h2><p>Prototype counters stored in this browser; ad revenue is entered manually and is not connected to an ad network.</p></div></div>
      <div className={`analytics-grid${isAdmin ? '' : ' is-editor-view'}`}>
        {isAdmin && <><article><span>PAGE VIEWS</span><strong>{metrics.pageViews}</strong><small>Local route visits</small></article><article><span>AD CLICKS</span><strong>{metrics.adClicks}</strong><small>Template placement clicks</small></article></>}
        <article><span>STORY ENGAGEMENTS</span><strong>{engagementCount}</strong><small>Feedback, opinions, and story tips</small></article>
        {isAdmin && <article><span>AD REVENUE</span><strong>{Number(adRevenue || 0).toLocaleString('en', { style: 'currency', currency: 'USD' })}</strong><small>Manual estimate · USD</small></article>}
      </div>
      <div className="analytics-table">
        <div><span>Published stories</span><strong>{published} / {stories.length}</strong></div>
        <div><span>Podcast episodes</span><strong>See Podcast management</strong></div>
        <div><span>Team accounts</span><strong>See Team access</strong></div>
        <div><span>Reader feedback / opinions / tips</span><strong>{feedback.length} / {opinions.length} / {submissions.length}</strong></div>
      </div>
    </section>
  )
}

function WebsiteSettingsPanel({ settings, onSave }: { settings: SiteSettings; onSave: (settings: SiteSettings) => void }) {
  const [draft, setDraft] = useState(settings)
  const [saved, setSaved] = useState(false)
  const [headerAdUploadError, setHeaderAdUploadError] = useState('')

  function updateField(field: keyof SiteSettings, value: string) {
    setDraft((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave(draft)
    setSaved(true)
  }

  async function handleHeaderAdUpload(file?: File) {
    if (!file) return
    setHeaderAdUploadError('')
    if (file.type !== 'image/gif' && !file.name.toLowerCase().endsWith('.gif')) {
      setHeaderAdUploadError('Choose an animated GIF file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setHeaderAdUploadError('Choose a GIF smaller than 2 MB.')
      return
    }
    try {
      updateField('headerAdMedia', await readFileAsDataUrl(file))
    } catch (error) {
      setHeaderAdUploadError(error instanceof Error ? error.message : 'The GIF file could not be read.')
    }
  }

  return (
    <section className="website-manager">
      <div className="dashboard-section-heading"><div><span className="eyebrow">Public identity</span><h2>Website settings</h2><p>These details are reflected in the public header, footer and contact page.</p></div></div>
      <form className="website-settings-form" onSubmit={saveSettings}>
        <label>Website name<input onChange={(event) => updateField('brandName', event.target.value)} required value={draft.brandName} /></label>
        <label>Company motto<input onChange={(event) => updateField('motto', event.target.value)} required value={draft.motto} /></label>
        <label>Public contact email<input onChange={(event) => updateField('contactEmail', event.target.value)} required type="email" value={draft.contactEmail} /></label>
        <label>Header announcement<input onChange={(event) => updateField('announcement', event.target.value)} required value={draft.announcement} /></label>
        <label>Header supporting line<input onChange={(event) => updateField('headerKicker', event.target.value)} required value={draft.headerKicker} /></label>
        <label>Masthead descriptor<input onChange={(event) => updateField('mastheadDescriptor', event.target.value)} required value={draft.mastheadDescriptor} /></label>
        <label>Home feature label<input onChange={(event) => updateField('homeStoriesEyebrow', event.target.value)} required value={draft.homeStoriesEyebrow} /></label>
        <label>Home updates label<input onChange={(event) => updateField('homeUpdatesEyebrow', event.target.value)} required value={draft.homeUpdatesEyebrow} /></label>
        <label>Home updates heading<input onChange={(event) => updateField('homeUpdatesTitle', event.target.value)} required value={draft.homeUpdatesTitle} /></label>
        <label>Charts introduction<textarea onChange={(event) => updateField('chartIntro', event.target.value)} required rows={2} value={draft.chartIntro} /></label>
        <label>Podcast introduction<textarea onChange={(event) => updateField('podcastIntro', event.target.value)} required rows={2} value={draft.podcastIntro} /></label>
        <label>Contact introduction<textarea onChange={(event) => updateField('contactIntro', event.target.value)} required rows={2} value={draft.contactIntro} /></label>
        <label>Instagram URL<input onChange={(event) => updateField('socialInstagram', event.target.value)} required type="url" value={draft.socialInstagram} /></label>
        <label>YouTube URL<input onChange={(event) => updateField('socialYouTube', event.target.value)} required type="url" value={draft.socialYouTube} /></label>
        <label>TikTok URL<input onChange={(event) => updateField('socialTikTok', event.target.value)} required type="url" value={draft.socialTikTok} /></label>
        <label>Facebook URL<input onChange={(event) => updateField('socialFacebook', event.target.value)} required type="url" value={draft.socialFacebook} /></label>
        <label>Logo image URL<input onChange={(event) => updateField('logoUrl', event.target.value)} placeholder="Leave blank to use the text logo" type="url" value={draft.logoUrl} /></label>
        <label>Header ad placeholder label<input onChange={(event) => updateField('headerAdLabel', event.target.value)} required value={draft.headerAdLabel} /></label>
        <label className="settings-wide">Animated header ad (GIF, up to 2 MB)<input accept="image/gif,.gif" onChange={(event) => void handleHeaderAdUpload(event.target.files?.[0])} type="file" /></label>
        {headerAdUploadError && <p className="media-error settings-wide" role="alert">{headerAdUploadError}</p>}
        {draft.headerAdMedia && <div className="header-ad-settings-preview settings-wide"><img alt="Animated header banner preview" src={draft.headerAdMedia} /><button className="plain-button" onClick={() => updateField('headerAdMedia', '')} type="button">Remove GIF</button></div>}
        <p className="data-note settings-wide">The GIF is stored in this browser and displays at full header width. Keep the file under 2 MB to fit the prototype's local storage.</p>
        <label>Main sponsor ad label<input onChange={(event) => updateField('sponsorLabel', event.target.value)} required value={draft.sponsorLabel} /></label>
        <label>Sponsor website or social link<input onChange={(event) => updateField('sponsorUrl', event.target.value)} placeholder="https://example.com or social profile" type="url" value={draft.sponsorUrl} /></label>
        <label>Manual ad revenue estimate (USD)<input min="0" onChange={(event) => updateField('adRevenue', event.target.value)} step="0.01" type="number" value={draft.adRevenue} /></label>
        <label>SEO page title<input onChange={(event) => updateField('seoTitle', event.target.value)} required value={draft.seoTitle} /></label>
        <label className="settings-wide">SEO meta description<textarea onChange={(event) => updateField('seoDescription', event.target.value)} required rows={3} value={draft.seoDescription} /></label>
        <div className="editor-actions"><button className="green-button" type="submit">Save website settings <span>↗</span></button>{saved && <span className="form-success" role="status">Saved in this browser.</span>}</div>
      </form>
    </section>
  )
}

function TeamManager({ users, currentUser, onCreateEmployee, onDeleteEmployee, onUpdateEmployee, onSetEmployeePassword }: { users: DashboardUser[]; currentUser: DashboardUser; onCreateEmployee: (name: string, username: string, email: string, role: 'Chief Editor' | 'Journalist', password: string) => Promise<boolean | null>; onDeleteEmployee: (userId: string) => void; onUpdateEmployee: (userId: string, updates: Pick<DashboardUser, 'name' | 'username' | 'email' | 'role'>) => boolean; onSetEmployeePassword: (userId: string, password: string) => Promise<boolean> }) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'Chief Editor' | 'Journalist'>('Journalist')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showInitialPassword, setShowInitialPassword] = useState(false)
  const [showInitialPasswordConfirm, setShowInitialPasswordConfirm] = useState(false)
  const [editingUser, setEditingUser] = useState<DashboardUser | null>(null)
  const [editingPassword, setEditingPassword] = useState('')
  const [editingPasswordConfirm, setEditingPasswordConfirm] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function addEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    const normalizedUsername = username.trim().toLowerCase()
    if (!/^[a-z0-9._-]+$/.test(normalizedUsername)) {
      setError('Use letters, numbers, dots, underscores or hyphens in the username.')
      return
    }
    if (password.length < 10) {
      setError('Passwords must be at least 10 characters.')
      return
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match.')
      return
    }
    const normalizedEmail = email.trim().toLowerCase()
    if (users.some((user) => user.username === normalizedUsername || user.email?.toLowerCase() === normalizedEmail)) {
      setError('That username or email is already in use.')
      return
    }
    const created = await onCreateEmployee(name, normalizedUsername, normalizedEmail, role, password)
    if (!created) {
      setError('That username or email is already in use.')
      return
    }
    setNotice(`Account created for ${name.trim()}. Give the employee their username and initial password directly.`)
    setName('')
    setUsername('')
    setEmail('')
    setPassword('')
    setPasswordConfirm('')
  }

  async function saveEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingUser) return
    setError('')
    const formData = new FormData(event.currentTarget)
    if (editingPassword || editingPasswordConfirm) {
      if (editingPassword.length < 10) {
        setError('Passwords must be at least 10 characters.')
        return
      }
      if (editingPassword !== editingPasswordConfirm) {
        setError('Passwords do not match.')
        return
      }
    }
    const updated = onUpdateEmployee(editingUser.id, {
      name: String(formData.get('edit-name') ?? ''),
      username: String(formData.get('edit-username') ?? ''),
      email: String(formData.get('edit-email') ?? ''),
      role: String(formData.get('edit-role')) as UserRole,
    })
    if (!updated) {
      setError('That username or email is already in use.')
      return
    }
    if (editingPassword && !(await onSetEmployeePassword(editingUser.id, editingPassword))) {
      setError('Could not update this employee password.')
      return
    }
    setEditingUser(null)
    setEditingPassword('')
    setEditingPasswordConfirm('')
    setNotice('Employee account updated.')
  }

  return (
    <section className="team-manager">
      <div className="dashboard-section-heading"><div><span className="eyebrow">Admin controls</span><h2>Team access</h2><p>Create employee accounts and assign their initial passwords. Employees can change their own passwords later.</p></div></div>
      <form className="team-create-form" onSubmit={addEmployee}>
        <label>Employee name<input autoComplete="off" onChange={(event) => setName(event.target.value)} required value={name} /></label>
        <label>Username<input autoComplete="off" onChange={(event) => setUsername(event.target.value)} required value={username} /></label>
        <label>Email address<input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
        <label>Role<select onChange={(event) => setRole(event.target.value as 'Chief Editor' | 'Journalist')} value={role}><option>Journalist</option><option>Chief Editor</option></select></label>
        <label>Initial password<span className="password-input-wrap"><input autoComplete="new-password" minLength={10} onChange={(event) => setPassword(event.target.value)} required type={showInitialPassword ? 'text' : 'password'} value={password} /><button aria-label={showInitialPassword ? 'Hide initial password' : 'Show initial password'} aria-pressed={showInitialPassword} onClick={() => setShowInitialPassword((visible) => !visible)} type="button">{showInitialPassword ? 'Hide' : 'Show'}</button></span></label>
        <label>Confirm initial password<span className="password-input-wrap"><input autoComplete="new-password" onChange={(event) => setPasswordConfirm(event.target.value)} required type={showInitialPasswordConfirm ? 'text' : 'password'} value={passwordConfirm} /><button aria-label={showInitialPasswordConfirm ? 'Hide initial password confirmation' : 'Show initial password confirmation'} aria-pressed={showInitialPasswordConfirm} onClick={() => setShowInitialPasswordConfirm((visible) => !visible)} type="button">{showInitialPasswordConfirm ? 'Hide' : 'Show'}</button></span></label>
        {error && <p className="login-error" role="alert">{error}</p>}
        {notice && <p className="form-success" role="status">{notice}</p>}
        <button className="green-button" type="submit">Create employee <span>↗</span></button>
      </form>
      {editingUser && <form className="team-edit-form" onSubmit={saveEmployee}><div className="team-edit-heading"><h3>Edit employee account</h3><button className="plain-button" onClick={() => { setEditingUser(null); setEditingPassword(''); setEditingPasswordConfirm('') }} type="button">Cancel</button></div><label>Employee name<input name="edit-name" required defaultValue={editingUser.name} /></label><label>Username<input name="edit-username" required defaultValue={editingUser.username} /></label><label>Email address<input autoComplete="email" name="edit-email" required type="email" defaultValue={editingUser.email ?? ''} /></label><label>Role<select name="edit-role" defaultValue={editingUser.role}><option>Journalist</option><option>Chief Editor</option></select></label><label>New password (optional)<input autoComplete="new-password" minLength={editingPassword ? 10 : undefined} onChange={(event) => setEditingPassword(event.target.value)} type="password" value={editingPassword} /></label><label>Confirm new password<input autoComplete="new-password" onChange={(event) => setEditingPasswordConfirm(event.target.value)} type="password" value={editingPasswordConfirm} /></label>{error && <p className="login-error" role="alert">{error}</p>}<button className="green-button" type="submit">Save account <span>↗</span></button></form>}
      <div className="team-list-head"><span>EMPLOYEE</span><span>ROLE</span><span>ACCOUNT</span><span>ADMIN ACTIONS</span></div>
      <div className="team-list">
        {users.map((user) => (
          <div className="team-row" key={user.id}><div className="team-identity"><strong>{user.name}</strong><span>@{user.username}</span><span>{user.email || 'Email not set'}</span></div><span className="team-role">{user.role}</span><span className="team-account-status">{user.passwordHash ? 'Password assigned' : 'Password required'}</span><div className="team-actions">{user.id === currentUser.id ? <span>Current account</span> : <><button onClick={() => { setEditingUser(user); setError('') }} type="button">Edit details</button>{pendingDeleteId === user.id ? <><span>Delete this account?</span><button onClick={() => { onDeleteEmployee(user.id); setPendingDeleteId(null); setNotice(`${user.name} account deleted. Their stories remain assigned to you.`) }} type="button">Confirm delete</button><button onClick={() => setPendingDeleteId(null)} type="button">Cancel</button></> : <button onClick={() => setPendingDeleteId(user.id)} type="button">Delete employee</button>}</>}</div></div>
        ))}
      </div>
    </section>
  )
}

function FeedbackPanel({ user, stories, feedback, reviewedFeedbackIds, onReview, onDelete }: { user: DashboardUser; stories: Story[]; feedback: FeedbackMessage[]; reviewedFeedbackIds: string[]; onReview: (id: string) => void; onDelete: (id: string) => void }) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const canDelete = user.role !== 'Journalist'
  const visibleFeedback = user.role === 'Journalist'
    ? feedback.filter((item) => item.authorId === user.id)
    : feedback

  return (
    <section className="feedback-manager">
      <div className="dashboard-section-heading"><div><span className="eyebrow">{user.role === 'Journalist' ? 'Your stories' : 'Reader response'}</span><h2>{user.role === 'Journalist' ? 'Feedback on your stories' : 'Feedback messages'}</h2><p>{user.role === 'Journalist' ? 'Only feedback linked to stories you authored appears here.' : 'Chief Editors and Admins can see feedback across every story and delete sensitive or inappropriate messages from public view.'} Reader feedback is saved in this browser preview.</p></div></div>
      <div className="feedback-list">
        {visibleFeedback.map((item) => {
          const reviewed = reviewedFeedbackIds.includes(item.id)
          const example = item.id.startsWith('sample-')
          return (
            <article className="feedback-row" key={item.id}>
              <div className="feedback-row-top">
                <div><span className={`feedback-status${reviewed ? ' is-reviewed' : ''}`}>{reviewed ? 'Reviewed' : example ? 'Example' : 'New'}</span><span className="feedback-time">{item.received}</span></div>
                <div className="feedback-row-actions">
                  <button disabled={reviewed} onClick={() => onReview(item.id)} type="button">{reviewed ? 'Reviewed' : 'Mark reviewed'}</button>
                  {canDelete && (pendingDeleteId === item.id
                    ? <><span className="feedback-delete-prompt">Delete this public feedback?</span><button className="danger-button" onClick={() => { onDelete(item.id); setPendingDeleteId(null) }} type="button">Confirm delete</button><button onClick={() => setPendingDeleteId(null)} type="button">Cancel</button></>
                    : <button className="danger-button" onClick={() => setPendingDeleteId(item.id)} type="button">Delete sensitive feedback</button>)}
                </div>
              </div>
              <h3>{item.name}</h3><span className="feedback-email">{item.email || 'No email provided'}</span><p className="feedback-story-title">On: {item.storyTitle || stories.find((story) => story.id === item.storyId)?.title || 'Story no longer available'}</p><p>{item.message}</p>
            </article>
          )
        })}
        {visibleFeedback.length === 0 && <p className="dashboard-empty">No reader feedback on your stories yet.</p>}
      </div>
    </section>
  )
}

function OpinionInbox({ opinions }: { opinions: ViewerOpinion[] }) {
  return (
    <section className="feedback-manager">
      <div className="dashboard-section-heading"><div><span className="eyebrow">Viewer messages</span><h2>Opinions</h2><p>Viewer responses and points of view, separate from story pitches.</p></div></div>
      <div className="feedback-list">
        {opinions.map((opinion) => (
          <article className="feedback-row" key={opinion.id}>
            <div className="feedback-row-top"><span className="feedback-status">Opinion</span><span className="feedback-time">{opinion.received}</span></div>
            <h3>{opinion.name}</h3><span className="feedback-email">{opinion.email || 'No email provided'}</span><p>{opinion.message}</p>
          </article>
        ))}
        {opinions.length === 0 && <p className="dashboard-empty">No viewer opinions have been submitted yet.</p>}
      </div>
    </section>
  )
}

function StorySubmissionInbox({ submissions, canDownload }: { submissions: StorySubmission[]; canDownload: boolean }) {
  const [downloadErrors, setDownloadErrors] = useState<Record<string, string>>({})

  async function handleVideoDownload(submission: StorySubmission) {
    if (!canDownload || !submission.localVideoKey) return
    setDownloadErrors((current) => ({ ...current, [submission.id]: '' }))
    try {
      await downloadLocalVideo(submission.localVideoKey, `${submission.title}-supporting-video`)
    } catch (reason) {
      setDownloadErrors((current) => ({ ...current, [submission.id]: reason instanceof Error ? reason.message : 'Could not download the submitted video.' }))
    }
  }

  return (
    <section className="feedback-manager">
      <div className="dashboard-section-heading"><div><span className="eyebrow">Community leads</span><h2>Story submissions</h2><p>Reader-submitted story tips and their supporting image evidence. Review and verify before assigning coverage.</p></div></div>
      <div className="feedback-list">
        {submissions.map((submission) => (
          <article className="feedback-row submission-row" key={submission.id}>
            <div className="feedback-row-top"><span className="feedback-status">Story tip · {submission.category}</span><span className="feedback-time">{submission.received}</span></div>
            <h3>{submission.title}</h3><div className="submission-sender"><span>{submission.name}</span><a href={`mailto:${submission.email}`}>{submission.email}</a></div>
            <p>{submission.details}</p>
            {submission.imageDataUrls.length > 0 ? <div className="submission-gallery">{submission.imageDataUrls.map((image, index) => <div className="submission-evidence-item" key={`${submission.id}-evidence-${index}`}><a href={image} rel="noreferrer" target="_blank"><img alt={`Supporting evidence ${index + 1} for ${submission.title}`} src={image} /><span>Evidence {index + 1}</span></a>{canDownload && <a className="plain-button" download={`${submission.title}-evidence-${index + 1}.jpg`} href={image}>Download image</a>}</div>)}</div> : <p className="submission-no-images">No supporting images were included.</p>}
            {submission.videoLink && <p><a className="text-link" href={submission.videoLink} rel="noreferrer" target="_blank">Open submitted video link ↗</a></p>}
            {submission.localVideoKey && <><LocalVideoPlayer videoKey={submission.localVideoKey} title={`Supporting video for ${submission.title}`} />{canDownload && <button className="plain-button" onClick={() => void handleVideoDownload(submission)} type="button">Download submitted video</button>}</>}
            {downloadErrors[submission.id] && <p className="media-error" role="alert">{downloadErrors[submission.id]}</p>}
          </article>
        ))}
        {submissions.length === 0 && <p className="dashboard-empty">No story submissions have been received yet.</p>}
      </div>
    </section>
  )
}

function Footer({ noteSent, onNoteSubmit, settings }: { noteSent: boolean; onNoteSubmit: (event: FormEvent<HTMLFormElement>) => void; settings: SiteSettings }) {
  return (
    <footer className="site-footer">
      <div className="page-width footer-main">
        <div className="footer-brand-block">
          <a className="footer-wordmark" href="#/home">{settings.brandName}<span>ENTERTAINMENT</span></a>
          <p>Good stories travel.<br />{settings.motto}</p>
          <div className="social-links" aria-label="Social media">
            <a aria-label="Instagram" href={settings.socialInstagram} rel="noreferrer" target="_blank" title="Instagram"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle className="social-icon-dot" cx="17.7" cy="6.7" r="1"/></svg></a>
            <a aria-label="YouTube" href={settings.socialYouTube} rel="noreferrer" target="_blank" title="YouTube"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M21 7.2a2.8 2.8 0 0 0-2-2C17.2 4.7 12 4.7 12 4.7s-5.2 0-7 .5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.5 12 29 29 0 0 0 3 16.8a2.8 2.8 0 0 0 2 2c1.8.5 7 .5 7 .5s5.2 0 7-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-4.8 29 29 0 0 0-.5-4.8Z"/><path className="social-icon-fill" d="m10 15.5 5-3.5-5-3.5z"/></svg></a>
            <a aria-label="TikTok" href={settings.socialTikTok} rel="noreferrer" target="_blank" title="TikTok"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 3v11.2a4 4 0 1 1-3.4-4v3.2a1 1 0 1 0 .4.8V3h3c.2 2.6 1.7 4 4 4.2v3.1A8 8 0 0 1 14 8.8"/></svg></a>
            <a aria-label="Facebook" href={settings.socialFacebook} rel="noreferrer" target="_blank" title="Facebook"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 21v-8h2.7l.4-3.1H14v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H8v3.1h2.6v8z"/></svg></a>
          </div>
        </div>
        <div className="footer-nav-group"><span className="footer-label">Explore</span><a href="#/home">Home</a><a href="#/charts/local-songs">Charts overview</a><a href="#/charts/hot-picks">🔥 LEAF HOT PICKS</a><a href="#/news/local">News overview</a><a href="#/podcast">Podcast</a><a href="#/contact">Contact us</a><a href="#/dashboard/stories">Dashboard</a></div>
        <div className="footer-nav-group"><span className="footer-label">Charts</span>{chartPages.map((item) => <a href={`#/charts/${item.slug}`} key={item.slug}>{item.label}</a>)}</div>
        <div className="footer-nav-group"><span className="footer-label">News & help</span>{newsPages.map((item) => <a href={`#/news/${item.slug}`} key={item.slug}>{item.label}</a>)}<a href="#/contact">Frequently asked questions</a></div>
        <div className="footer-note-block">
          <span className="footer-label">A note from you</span>
          <p>Quick-note preview; delivery service not connected.</p>
          <form className="footer-note-form" onSubmit={onNoteSubmit}>
            <label className="visually-hidden" htmlFor="footer-note">Your note</label>
            <input id="footer-note" name="note" placeholder="Write us a little note..." required />
            <button aria-label="Send your note" type="submit">Send <span>↗</span></button>
          </form>
          {noteSent && <span className="footer-success" role="status">Preview only: your note was not sent.</span>}
          <a className="footer-email" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
        </div>
      </div>
      <div className="page-width footer-bottom"><span>© {COPYRIGHT_YEAR} {settings.brandName}</span><span>{settings.motto}</span><a href="#/contact">FAQ & contact <span>↗</span></a></div>
    </footer>
  )
}

export default App
