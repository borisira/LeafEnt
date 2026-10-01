import { useEffect, useState, type FormEvent } from 'react'
import './App.css'

type Page = 'home' | 'charts' | 'news' | 'podcast' | 'contact' | 'login' | 'dashboard'
type Route = { page: Page; section: string }
type StoryCategory = 'Local entertainment' | 'International' | 'Sports'
type StoryStatus = 'draft' | 'published'
type UserRole = 'Admin' | 'Chief Editor' | 'Journalist'
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
  received: string
}
type PodcastEpisode = {
  id: string
  authorId: string
  status: StoryStatus
  title: string
  summary: string
  youtubeUrl: string
  createdAt: string
  publishedAt?: string
}
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
}
const feedbackPlaceholders: FeedbackMessage[] = [
  { id: 'sample-1', storyId: 'local-voices', storyTitle: 'The new voices giving homegrown music its next big moment', authorId: 'seed-editor', name: 'Sample reader', email: 'reader@example.com', message: 'I would love to see more independent artists featured in the local charts.', received: 'Today, 09:42' },
  { id: 'sample-2', storyId: 'global-sound', storyTitle: 'Inside the records shaping this season’s global sound', authorId: 'seed-editor', name: 'Demo listener', email: 'listener@example.com', message: 'The latest podcast conversation gave me a new playlist for the week.', received: 'Yesterday, 16:18' },
  { id: 'sample-3', storyId: 'match-day', storyTitle: 'The soundtracks, rituals and rivalries behind match day', authorId: 'seed-editor', name: 'Example contributor', email: 'contributor@example.com', message: 'I have a story idea about a community music event coming up next month.', received: 'Sep 26, 2026' },
]
const storySubmissionPlaceholders: StorySubmission[] = []
const defaultPodcastEpisodes: PodcastEpisode[] = []

const chartPages = [
  { slug: 'local-songs', label: 'Rwanda Top 10 songs' },
  { slug: 'global-albums', label: 'Top 10 global albums' },
  { slug: 'international-songs', label: 'International Top 10 songs' },
]

const newsPages = [
  { slug: 'local', label: 'Local entertainment' },
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

function readStoredValue<T>(key: string, fallback: T): T {
  try {
    const storedValue = window.localStorage.getItem(key)
    return storedValue ? (JSON.parse(storedValue) as T) : fallback
  } catch {
    return fallback
  }
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

function normalizeStoredStories(stories: Story[]) {
  return stories.map((story) => ({
    ...story,
    body: story.body || story.summary,
    youtubeUrl: story.youtubeUrl || '',
    createdAt: story.createdAt || '2026-09-29T12:00:00.000Z',
    publishedAt: story.status === 'published' ? story.publishedAt || story.createdAt || '2026-09-29T12:00:00.000Z' : story.publishedAt,
  }))
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

const chartData: Record<string, { artist: string; title: string; movement: string }[]> = {
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
  'global-albums': [
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

const pageHeadings: Record<string, { title: string; intro: string }> = {
  local: {
    title: 'Local entertainment',
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
  const validPages: Page[] = ['home', 'charts', 'news', 'podcast', 'contact', 'login', 'dashboard']
  return {
    page: validPages.includes(page as Page) ? (page as Page) : 'home',
    section,
  }
}

function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  const [stories, setStories] = useState<Story[]>(() => normalizeStoredStories(readStoredValue('leaf-stories', defaultStories)))
  const [podcastEpisodes, setPodcastEpisodes] = useState<PodcastEpisode[]>(() => readStoredValue('leaf-podcast-episodes', defaultPodcastEpisodes))
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => ({ ...defaultSettings, ...readStoredValue<Partial<SiteSettings>>('leaf-site-settings', {}) }))
  const [users, setUsers] = useState<DashboardUser[]>(() => readStoredValue('leaf-dashboard-users', []))
  const [session, setSession] = useState<DashboardSession | null>(() => readStoredValue('leaf-dashboard-session', null))
  const [storyFeedback, setStoryFeedback] = useState<FeedbackMessage[]>(() => readStoredValue('leaf-story-feedback', feedbackPlaceholders))
  const [viewerOpinions, setViewerOpinions] = useState<ViewerOpinion[]>(readStoredOpinions)
  const [storySubmissions, setStorySubmissions] = useState<StorySubmission[]>(() => readStoredValue('leaf-story-submissions', storySubmissionPlaceholders))
  const [reviewedFeedbackIds, setReviewedFeedbackIds] = useState<string[]>(() => readStoredValue('leaf-reviewed-feedback', []))
  const [slideIndex, setSlideIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [noteSent, setNoteSent] = useState(false)
  const [activeEpisode, setActiveEpisode] = useState(0)
  const [siteLanguage, setSiteLanguage] = useState<'en' | 'rw' | ''>(() => {
    const savedLanguage = window.localStorage.getItem('leaf-language')
    return savedLanguage === 'en' || savedLanguage === 'rw' ? savedLanguage : ''
  })

  useEffect(() => {
    const syncRoute = () => {
      setRoute(readRoute())
      setMenuOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  useEffect(() => {
    window.localStorage.setItem('leaf-stories', JSON.stringify(stories))
  }, [stories])

  useEffect(() => {
    window.localStorage.setItem('leaf-podcast-episodes', JSON.stringify(podcastEpisodes))
  }, [podcastEpisodes])

  useEffect(() => {
    window.localStorage.setItem('leaf-site-settings', JSON.stringify(siteSettings))
    document.title = `${siteSettings.brandName} | ${siteSettings.motto}`
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

  function handleSaveStory(story: Story) {
    const now = new Date().toISOString()
    setStories((currentStories) => {
      const existingStory = currentStories.find((currentStory) => currentStory.id === story.id)
      const savedStory = {
        ...story,
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
    const nextStories = stories.filter((story) => story.id !== storyId)
    if (nextStories.length === 0) return
    setStories(nextStories)
    setSlideIndex((currentIndex) => Math.min(currentIndex, nextStories.length - 1))
  }

  function handlePublishStory(storyId: string) {
    const publishedAt = new Date().toISOString()
    setStories((currentStories) => currentStories.map((story) => story.id === storyId ? { ...story, status: 'published', publishedAt } : story))
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

  function handleNoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNoteSent(true)
    event.currentTarget.reset()
  }

  function changeSiteLanguage(language: 'en' | 'rw') {
    setSiteLanguage(language)
    window.localStorage.setItem('leaf-language', language)
    const originalUrl = window.localStorage.getItem('leaf-original-language-url')
    if (language === 'rw') {
      const url = `${window.location.origin}${window.location.pathname}${window.location.hash}`
      window.localStorage.setItem('leaf-original-language-url', url)
      window.location.assign(`https://translate.google.com/translate?sl=en&tl=rw&u=${encodeURIComponent(url)}`)
      return
    }
    window.localStorage.removeItem('leaf-original-language-url')
    if (originalUrl) window.location.assign(originalUrl)
  }

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

  function handleStorySubmission(event: FormEvent<HTMLFormElement>, imageDataUrls: string[]) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const submission: StorySubmission = {
      id: createStoryId(),
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      title: String(formData.get('title') ?? '').trim(),
      category: String(formData.get('category') ?? 'Local entertainment') as StoryCategory,
      details: String(formData.get('details') ?? '').trim(),
      imageDataUrls,
      received: new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
    }
    setStorySubmissions((current) => [submission, ...current])
    event.currentTarget.reset()
  }

  const currentUser = session ? users.find((user) => user.id === session.userId) ?? null : null
  const publishedStories = stories.filter((story) => story.status === 'published')
  const homeStories = newsPages.flatMap((category) => publishedStories.filter((story) => categorySlug(story.category) === category.slug).slice(0, 10))
  const currentStory = homeStories.length > 0 ? homeStories[slideIndex % homeStories.length] : defaultStories[0]
  const currentChart = chartPages.find((item) => item.slug === route.section) ?? chartPages[0]
  const chartRows = chartData[currentChart.slug]
  const currentNews = pageHeadings[route.section] ? route.section : 'local'
  const brandNameParts = siteSettings.brandName.trim().split(/\s+/)
  const brandShortName = brandNameParts[0] || 'LEAF'
  const brandSubName = brandNameParts.slice(1).join(' ') || 'ENTERTAINMENT'

  return (
    <>
      <header className="site-header">
        <div className="masthead page-width">
          <a className="wordmark" href="#/home" aria-label={`${siteSettings.brandName} home`}>
            <span className="wordmark-main">{brandShortName}</span>
            <span className="wordmark-sub">{brandSubName}</span>
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
              <a className={route.page === 'dashboard' || route.page === 'login' ? 'is-active' : ''} href={currentUser ? '#/dashboard/stories' : '#/login'}>Dashboard</a>
            </div>
            <a className="nav-note" href="#/contact">Have a story? Tell us <span>+</span></a>
            <label className="language-picker"><span className="visually-hidden">Website language</span><select aria-label="Website language" onChange={(event) => changeSiteLanguage(event.target.value as 'en' | 'rw')} value={siteLanguage}><option disabled value="">Choose language</option><option value="en">English</option><option value="rw">Kinyarwanda</option></select></label>
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
            storiesEyebrow={siteSettings.homeStoriesEyebrow}
            updatesEyebrow={siteSettings.homeUpdatesEyebrow}
            updatesTitle={siteSettings.homeUpdatesTitle}
            slideIndex={slideIndex}
            onSlideChange={setSlideIndex}
          />
        )}
        {route.page === 'charts' && (
          <ChartsPage currentChart={currentChart} rows={chartRows} intro={siteSettings.chartIntro} />
        )}
        {route.page === 'news' && <NewsPage section={currentNews} stories={publishedStories} users={users} onStoryFeedback={handleStoryFeedback} />}
        {route.page === 'podcast' && (
          <PodcastPage episodes={podcastEpisodes.filter((episode) => episode.status === 'published')} activeEpisode={activeEpisode} onEpisodeChange={setActiveEpisode} users={users} intro={siteSettings.podcastIntro} />
        )}
        {route.page === 'contact' && (
          <ContactPage onOpinionSubmit={handleOpinionSubmit} onStorySubmit={handleStorySubmission} contactEmail={siteSettings.contactEmail} intro={siteSettings.contactIntro} />
        )}
        {route.page === 'login' && <LoginPage users={users} onLogin={signIn} onCreateAdmin={createAdminAccount} />}
        {route.page === 'dashboard' && !currentUser && <LoginPage users={users} onLogin={signIn} onCreateAdmin={createAdminAccount} />}
        {route.page === 'dashboard' && currentUser && (
          <DashboardPage
            section={route.section || 'stories'}
            stories={stories}
            user={currentUser}
            users={users}
            onSaveStory={handleSaveStory}
            onDeleteStory={handleDeleteStory}
            onPublishStory={handlePublishStory}
            podcastEpisodes={podcastEpisodes}
            onSavePodcastEpisode={handleSavePodcastEpisode}
            onPublishPodcastEpisode={handlePublishPodcastEpisode}
            onDeletePodcastEpisode={handleDeletePodcastEpisode}
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
          />
        )}
      </main>

      <Footer noteSent={noteSent} onNoteSubmit={handleNoteSubmit} settings={siteSettings} />
      {!siteLanguage && <LanguageChoice onChoose={changeSiteLanguage} />}
    </>
  )
}

function LanguageChoice({ onChoose }: { onChoose: (language: 'en' | 'rw') => void }) {
  const [language, setLanguage] = useState<'en' | 'rw' | ''>('')
  return (
    <div className="language-gate" role="dialog" aria-modal="true" aria-labelledby="language-gate-title">
      <form className="language-gate-panel" onSubmit={(event) => { event.preventDefault(); if (language) onChoose(language) }}>
        <span className="eyebrow"><span className="eyebrow-dot" />LEAF Entertainment</span>
        <h2 id="language-gate-title">Choose your language.</h2>
        <p>English or Kinyarwanda. You can change this choice from the menu.</p>
        <div className="language-choice-options" role="group" aria-label="Choose website language">
          <button aria-pressed={language === 'en'} className={language === 'en' ? 'is-selected' : ''} onClick={() => setLanguage('en')} type="button">English</button>
          <button aria-pressed={language === 'rw'} className={language === 'rw' ? 'is-selected' : ''} onClick={() => setLanguage('rw')} type="button">Kinyarwanda</button>
        </div>
        <button className="green-button" disabled={!language} type="submit">Continue <span>↗</span></button>
        {language === 'rw' && <span className="language-translation-note">Kinyarwanda translation opens with Google Translate.</span>}
      </form>
    </div>
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
  storiesEyebrow,
  updatesEyebrow,
  updatesTitle,
  slideIndex,
  onSlideChange,
}: {
  story: Story
  stories: Story[]
  users: DashboardUser[]
  storiesEyebrow: string
  updatesEyebrow: string
  updatesTitle: string
  slideIndex: number
  onSlideChange: (index: number) => void
}) {
  return (
    <div className="home-page">
      <div className="section-label-row">
        <span className="eyebrow"><span className="eyebrow-dot" />{storiesEyebrow}</span>
        <span className="section-date">Fresh from the LEAF desk</span>
      </div>
      <section className="feature-story" aria-label="Featured story">
        <a className="feature-image" href={story.href}>
          <img src={story.image} alt={story.imageAlt} />
          <span className="image-stamp">LEAF<br />PICK</span>
        </a>
        <div className="feature-copy">
          <span className="eyebrow"><span className="eyebrow-dot" />{story.category}</span>
          <h1>{story.title}</h1>
          <p>{story.summary}</p>
          <p className="story-byline">By {users.find((user) => user.id === story.authorId)?.name ?? 'LEAF Editorial Desk'} <span>·</span> {formatStoryDate(story.publishedAt || story.createdAt)}</p>
          <a className="text-link" href={story.href}>Read the story <span>↗</span></a>
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
                <span className="eyebrow">{item.category}</span>
                <h3>{item.title}</h3>
                <span className="card-arrow" aria-hidden="true">↗</span>
              </div>
            </a>
          ))}
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
  rows: (typeof chartData)[string]
  intro: string
}) {
  const sourceLinks = currentChart.slug === 'global-albums'
    ? [{ label: 'Billboard 200', href: 'https://www.billboard.com/charts/billboard-200/' }, { label: 'Audiomack', href: 'https://audiomack.com/' }]
    : currentChart.slug === 'international-songs'
      ? [{ label: 'Billboard Hot 100', href: 'https://www.billboard.com/charts/hot-100/' }, { label: 'Audiomack charts', href: 'https://audiomack.com/' }]
      : [{ label: 'Rwanda Top Songs on Audiomack', href: 'https://audiomack.com/charts' }]

  return (
    <div className="inner-page charts-page">
      <SectionHeading eyebrow="The LEAF charts" title="Hear what’s next." intro={intro} />
      <PageTabs base="charts" current={currentChart.slug} items={chartPages} />
      <div className="chart-intro-row">
        <div>
          <span className="eyebrow">This week’s selection</span>
          <h2>{currentChart.label}</h2>
        </div>
        <span className="chart-week">TOP TEN <strong>{rows.slice(0, 10).length}</strong></span>
      </div>
      <div className="chart-layout">
        <div className="chart-list">
          <div className="chart-list-head"><span>POSITION</span><span>{currentChart.slug === 'global-albums' ? 'ALBUM / ARTIST' : 'TRACK / ARTIST'}</span><span>MOVE</span></div>
          {rows.slice(0, 10).map((row, index) => (
            <div className="chart-row" key={`${row.artist}-${row.title}`}>
              <span className="chart-rank">{String(index + 1).padStart(2, '0')}</span>
              <div className="chart-track"><strong>{row.title}</strong><span>{row.artist}</span></div>
              <span className={`chart-movement${row.movement === 'NEW' ? ' is-new' : ''}`}>{row.movement}</span>
            </div>
          ))}
          <p className="data-note">Positions 1–4 reflect Audiomack Rwanda Top Songs. Remaining entries are editorial samples; live chart syncing is not connected.</p>
        </div>
        <aside className="chart-aside">
          <span className="eyebrow">Rwanda · Audiomack</span>
          <h3>Explore Rwanda’s chart.</h3>
          <p>Open the Rwanda Top Songs chart on Audiomack for the current platform rankings.</p>
          <div className="source-links">
            {sourceLinks.map((source) => <a href={source.href} key={source.label} rel="noreferrer" target="_blank">{source.label}<span>↗</span></a>)}
          </div>
          <div className="aside-rule" />
          <span className="aside-index">LEAF / CHARTS / 2026</span>
        </aside>
      </div>
    </div>
  )
}

function NewsPage({ section, stories, users, onStoryFeedback }: { section: string; stories: Story[]; users: DashboardUser[]; onStoryFeedback: (story: Story, name: string, email: string, message: string) => void }) {
  const [sentStoryIds, setSentStoryIds] = useState<string[]>([])
  const heading = pageHeadings[section]
  const filteredStories = section === 'local'
    ? stories.filter((story) => story.category === 'Local entertainment')
    : section === 'international'
      ? stories.filter((story) => story.category === 'International')
      : stories.filter((story) => story.category === 'Sports')

  function submitStoryFeedback(event: FormEvent<HTMLFormElement>, story: Story) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    onStoryFeedback(story, String(formData.get('name') ?? ''), String(formData.get('email') ?? ''), String(formData.get('message') ?? ''))
    setSentStoryIds((currentIds) => currentIds.includes(story.id) ? currentIds : [...currentIds, story.id])
    event.currentTarget.reset()
  }

  return (
    <div className="inner-page news-page">
      <SectionHeading eyebrow="News and culture" title={heading.title} intro={heading.intro} />
      <PageTabs base="news" current={section} items={newsPages} />
      <div className="news-grid">
        {filteredStories.map((story, index) => (
          <article className={`news-card${index === 0 ? ' news-card-featured' : ''}`} key={story.title}>
            <div className="news-image"><img src={story.image} alt={story.imageAlt} /></div>
            <div className="news-card-copy">
              <span className="eyebrow">{story.category} <span className="story-divider">/</span> LEAF desk</span>
              <h2>{story.title}</h2>
              <p className="story-byline">By {users.find((user) => user.id === story.authorId)?.name ?? 'LEAF Editorial Desk'} <span>·</span> {formatStoryDate(story.publishedAt || story.createdAt)}</p>
              <p>{story.summary}</p>
              {story.body && <div className="news-story-body">{story.body.split(/\n\s*\n/).filter(Boolean).map((paragraph, paragraphIndex) => <p key={`${story.id}-paragraph-${paragraphIndex}`}>{paragraph}</p>)}</div>}
              {getYouTubeVideoId(story.youtubeUrl) && <div className="video-frame news-video"><iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" src={`https://www.youtube-nocookie.com/embed/${getYouTubeVideoId(story.youtubeUrl)}?rel=0`} title={`YouTube video for ${story.title}`} /></div>}
              <a className="text-link" href="#/contact">Send us your take <span>↗</span></a>
              <details className="story-feedback">
                <summary>Leave feedback on this story</summary>
                <form onSubmit={(event) => submitStoryFeedback(event, story)}>
                  <label>Your name<input autoComplete="name" name="name" required /></label>
                  <label>Email (optional)<input autoComplete="email" name="email" type="email" /></label>
                  <label>Your feedback<textarea name="message" required rows={3} /></label>
                  <button className="green-button" type="submit">Send feedback <span>↗</span></button>
                  {sentStoryIds.includes(story.id) && <span className="form-success" role="status">Feedback saved for the story owner.</span>}
                </form>
              </details>
            </div>
          </article>
        ))}
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

function PodcastPage({ episodes, activeEpisode, onEpisodeChange, users, intro }: { episodes: PodcastEpisode[]; activeEpisode: number; onEpisodeChange: (index: number) => void; users: DashboardUser[]; intro: string }) {
  const selectedEpisodeIndex = episodes.length ? Math.min(activeEpisode, episodes.length - 1) : 0
  const episode = episodes[selectedEpisodeIndex]
  const recommendedEpisodes = episodes.filter((_, index) => index !== selectedEpisodeIndex).slice(0, 10)
  return (
    <div className="inner-page podcast-page">
      <SectionHeading eyebrow="Listen in" title="The LEAF XTRA Podcast" intro={intro} />
      {episode ? <>
      <section className="podcast-feature">
        <div className="video-frame">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            src={`https://www.youtube-nocookie.com/embed/${getYouTubeVideoId(episode.youtubeUrl)}?rel=0`}
            title={`YouTube video: ${episode.title}`}
          />
        </div>
        <div className="podcast-copy">
          <span className="eyebrow"><span className="eyebrow-dot" />Now playing</span>
          <h2>{episode.title}</h2>
          <p>{episode.summary}</p>
          <p className="story-byline">By {users.find((user) => user.id === episode.authorId)?.name ?? 'LEAF Editorial Desk'} <span>·</span> {formatStoryDate(episode.publishedAt || episode.createdAt)}</p>
          <a className="text-link" href={episode.youtubeUrl} rel="noreferrer" target="_blank">Watch on YouTube <span>↗</span></a>
        </div>
      </section>
      {recommendedEpisodes.length > 0 && <section className="episode-section">
        <div className="section-title-row">
          <div><span className="eyebrow">Recommended</span><h2>More to watch.</h2></div>
          <span className="section-date">More LEAF XTRA Podcast videos</span>
        </div>
        <div className="episode-list">
          {recommendedEpisodes.map((item) => {
            const episodeIndex = episodes.findIndex((candidate) => candidate.id === item.id)
            return <button className="episode-row" key={item.id} onClick={() => onEpisodeChange(episodeIndex)} type="button">
              <span className="episode-number">{String(episodeIndex + 1).padStart(2, '0')}</span><span className="episode-title">{item.title}<small>{item.summary}</small></span><span className="episode-action">Watch episode</span>
            </button>
          })}
        </div>
      </section>}
      </> : <div className="podcast-empty"><span className="eyebrow">Coming up</span><h2>New conversations are on the way.</h2><p>Check back for the latest from the LEAF XTRA Podcast.</p></div>}
    </div>
  )
}

function ContactPage({ onOpinionSubmit, onStorySubmit, contactEmail, intro }: { onOpinionSubmit: (event: FormEvent<HTMLFormElement>) => void; onStorySubmit: (event: FormEvent<HTMLFormElement>, images: string[]) => void; contactEmail: string; intro: string }) {
  const [storyImages, setStoryImages] = useState<string[]>([])
  const [uploadError, setUploadError] = useState('')
  const [opinionSent, setOpinionSent] = useState(false)
  const [storySent, setStorySent] = useState(false)

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

  function submitStory(event: FormEvent<HTMLFormElement>) {
    onStorySubmit(event, storyImages)
    setStoryImages([])
    setStorySent(true)
  }

  function submitOpinion(event: FormEvent<HTMLFormElement>) {
    onOpinionSubmit(event)
    setOpinionSent(true)
  }

  return (
    <div className="inner-page contact-page">
      <SectionHeading eyebrow="Open inbox" title="Opinions & story tips." intro={intro} />
      <div className="contact-layout">
        <div className="contact-aside">
          <span className="eyebrow">Say hello</span>
          <a className="contact-email" href={`mailto:${contactEmail}`}>{contactEmail}</a>
          <p>Viewer opinions and story tips go to separate inboxes for the editorial team to review. Submissions are saved in this browser preview only.</p>
          <div className="contact-faq">
            <span className="eyebrow">A few quick answers</span>
            <details><summary>How can I submit a story?</summary><p>Use Submit a story tip to share the details and supporting images. Editors review and verify submissions before publishing.</p></details>
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

          <form className="contact-form story-tip-form" onSubmit={submitStory}>
            <div className="form-heading"><span className="eyebrow">Submit a story tip</span><span>Share supporting images so editors can review your lead.</span></div>
            <label>Your name<input autoComplete="name" name="name" placeholder="Name" required /></label>
            <label>Email address<input autoComplete="email" name="email" placeholder="you@example.com" required type="email" /></label>
            <label>Story section<select defaultValue="Local entertainment" name="category"><option>Local entertainment</option><option>International</option><option>Sports</option></select></label>
            <label>Suggested title<input name="title" placeholder="What is the story about?" required /></label>
            <label>Story details<textarea name="details" placeholder="Who, what, where, when, and how can we verify it?" required rows={5} /></label>
            <label>Supporting images (up to 4)<input accept="image/*" multiple onChange={(event) => void handleStoryFiles(event.target.files)} type="file" /></label>
            <span className="submission-image-note">Images help editors review a story tip; they do not verify its claims on their own.</span>
            {uploadError && <span className="login-error" role="alert">{uploadError}</span>}
            {storyImages.length > 0 && <div className="submission-image-preview">{storyImages.map((image, index) => <img alt={`Story evidence ${index + 1}`} key={`story-evidence-${index}`} src={image} />)}</div>}
            <div className="form-submit-row"><button className="green-button" type="submit">Submit story tip <span>↗</span></button>{storySent && <span className="form-success" role="status">Story tip added to the editorial inbox.</span>}</div>
          </form>
        </div>
      </div>
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
  user,
  users,
  onSaveStory,
  onDeleteStory,
  onPublishStory,
  podcastEpisodes,
  onSavePodcastEpisode,
  onPublishPodcastEpisode,
  onDeletePodcastEpisode,
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
}: {
  section: string
  stories: Story[]
  user: DashboardUser
  users: DashboardUser[]
  onSaveStory: (story: Story) => void
  onDeleteStory: (storyId: string) => void
  onPublishStory: (storyId: string) => void
  podcastEpisodes: PodcastEpisode[]
  onSavePodcastEpisode: (episode: PodcastEpisode) => void
  onPublishPodcastEpisode: (episodeId: string) => void
  onDeletePodcastEpisode: (episodeId: string) => void
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
}) {
  const isAdmin = user.role === 'Admin'
  const tabs = [
    { slug: 'stories', label: 'Stories' },
    { slug: 'podcast', label: 'Podcast' },
    { slug: 'feedback', label: user.role === 'Journalist' ? 'Your feedback' : 'Feedback inbox' },
    { slug: 'account', label: 'My password' },
    ...(isAdmin ? [
      { slug: 'opinions', label: 'Viewer opinions' },
      { slug: 'submissions', label: 'Story submissions' },
      { slug: 'website', label: 'Website' },
      { slug: 'team', label: 'Team access' },
    ] : user.role === 'Chief Editor' ? [
      { slug: 'opinions', label: 'Viewer opinions' },
      { slug: 'submissions', label: 'Story submissions' },
    ] : []),
  ]
  const accessDenied = !tabs.some((tab) => tab.slug === section)
  const activeSection = accessDenied ? 'stories' : section
  const publishedCount = stories.filter((story) => story.status === 'published').length
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
        <div><span>STORIES</span><strong>{stories.length}</strong><small>{publishedCount} published · {stories.length - publishedCount} drafts</small></div>
        <div><span>{isAdmin ? 'TEAM' : 'ROLE'}</span><strong>{isAdmin ? users.length : user.role}</strong><small>{isAdmin ? 'Accounts managed here' : 'Access based on your account'}</small></div>
        <div><span>FEEDBACK</span><strong>{feedbackCount}</strong><small>{user.role === 'Journalist' ? 'On your stories' : 'Across all stories'}</small></div>
      </div>
      <nav className="dashboard-tabs" aria-label="Dashboard sections">
        {tabs.map((tab) => (
          <a aria-current={activeSection === tab.slug ? 'page' : undefined} className={activeSection === tab.slug ? 'is-active' : ''} href={`#/dashboard/${tab.slug}`} key={tab.slug}>{tab.label}</a>
        ))}
      </nav>
      {accessDenied && <p className="dashboard-access-note" role="status">That section is available to Admin accounts only.</p>}
      {activeSection === 'website' && <WebsiteSettingsPanel settings={settings} onSave={onSaveSettings} />}
      {activeSection === 'team' && <TeamManager users={users} currentUser={user} onCreateEmployee={onCreateEmployee} onDeleteEmployee={onDeleteEmployee} onUpdateEmployee={onUpdateEmployee} onSetEmployeePassword={onSetEmployeePassword} />}
      {activeSection === 'feedback' && <FeedbackPanel user={user} stories={stories} feedback={feedback} reviewedFeedbackIds={reviewedFeedbackIds} onReview={onReviewFeedback} />}
      {activeSection === 'podcast' && <PodcastManager episodes={podcastEpisodes} users={users} user={user} onSave={onSavePodcastEpisode} onPublish={onPublishPodcastEpisode} onDelete={onDeletePodcastEpisode} />}
      {activeSection === 'opinions' && <OpinionInbox opinions={viewerOpinions} />}
      {activeSection === 'submissions' && <StorySubmissionInbox submissions={storySubmissions} />}
      {activeSection === 'account' && <PasswordChangePanel user={user} onChangePassword={onChangeOwnPassword} />}
      {activeSection === 'stories' && <StoryManager stories={stories} users={users} user={user} onSaveStory={onSaveStory} onDeleteStory={onDeleteStory} onPublishStory={onPublishStory} />}
      <p className="dashboard-local-note">Local preview only. Account and content changes stay in this browser and are not synced to a server.</p>
    </div>
  )
}

function StoryManager({ stories, users, user, onSaveStory, onDeleteStory, onPublishStory }: { stories: Story[]; users: DashboardUser[]; user: DashboardUser; onSaveStory: (story: Story) => void; onDeleteStory: (storyId: string) => void; onPublishStory: (storyId: string) => void }) {
  const [draft, setDraft] = useState<Story | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')
  const [activeCategory, setActiveCategory] = useState<'All' | StoryCategory>('All')
  const categoryFilters: Array<'All' | StoryCategory> = ['All', 'Local entertainment', 'International', 'Sports']
  const visibleStories = activeCategory === 'All'
    ? stories
    : stories.filter((story) => story.category === activeCategory)

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
        <div><span className="eyebrow">Editorial desk</span><h2>Stories</h2><p>Create, edit or remove stories shown on Home and in their News section.</p></div>
        <button className="green-button" onClick={startNewStory} type="button">Add story <span>+</span></button>
      </div>
      <div className="story-category-filters" role="group" aria-label="Filter stories by category">
        {categoryFilters.map((category) => {
          const count = category === 'All' ? stories.length : stories.filter((story) => story.category === category).length
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
            <span className="story-category-label">{story.category}<small className={`story-status${story.status === 'published' ? ' is-published' : ''}`}>{story.status === 'published' ? 'Published' : 'Draft · needs review'}</small></span>
            {pendingDeleteId === story.id ? (
              <div className="delete-confirm"><span>Remove this story?</span><button onClick={() => { onDeleteStory(story.id); setPendingDeleteId(null) }} type="button">Confirm</button><button onClick={() => setPendingDeleteId(null)} type="button">Keep</button></div>
            ) : (
              <div className="story-admin-actions">
                <button disabled={user.role === 'Journalist' && (story.authorId !== user.id || story.status === 'published')} onClick={() => setDraft(story)} title={user.role === 'Journalist' ? 'Journalists can edit their own drafts' : 'Edit story'} type="button">Edit</button>
                {user.role !== 'Journalist' && story.status === 'draft' && <button onClick={() => onPublishStory(story.id)} type="button">Publish</button>}
                {user.role !== 'Journalist' && <button disabled={stories.length === 1} onClick={() => setPendingDeleteId(story.id)} title={stories.length === 1 ? 'Keep at least one story for the Home carousel' : 'Delete story'} type="button">Delete</button>}
              </div>
            )}
          </article>
        ))}
        {visibleStories.length === 0 && <p className="dashboard-empty">No stories in this category yet. Add a story to populate it.</p>}
      </div>
    </section>
  )
}

function PodcastManager({ episodes, users, user, onSave, onPublish, onDelete }: { episodes: PodcastEpisode[]; users: DashboardUser[]; user: DashboardUser; onSave: (episode: PodcastEpisode) => void; onPublish: (episodeId: string) => void; onDelete: (episodeId: string) => void }) {
  const [draft, setDraft] = useState<PodcastEpisode | null>(null)
  const [error, setError] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const isEditor = user.role !== 'Journalist'
  const visibleEpisodes = isEditor ? episodes : episodes.filter((episode) => episode.authorId === user.id)

  function startNewEpisode() {
    setError('')
    setDraft({ id: '', authorId: user.id, status: 'draft', title: '', summary: '', youtubeUrl: '', createdAt: new Date().toISOString() })
  }

  function saveEpisode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft) return
    if (!getYouTubeVideoId(draft.youtubeUrl)) {
      setError('Enter a valid YouTube video link.')
      return
    }
    onSave({ ...draft, id: draft.id || createStoryId() })
    setDraft(null)
    setError('')
  }

  return (
    <section className="podcast-manager">
      <div className="dashboard-section-heading"><div><span className="eyebrow">Episode desk</span><h2>LEAF XTRA Podcast episodes</h2><p>{isEditor ? 'Review, publish and manage LEAF XTRA Podcast episodes.' : 'Add an episode draft with a title, summary and YouTube video.'}</p></div><button className="green-button" onClick={startNewEpisode} type="button">Add episode <span>+</span></button></div>
      {draft && <form className="dashboard-editor podcast-editor" onSubmit={saveEpisode}>
        <div className="dashboard-editor-heading"><div><span className="eyebrow">{draft.id ? 'Edit episode' : 'New episode'}</span><h3>{draft.id ? 'Update episode details' : 'Add a podcast episode'}</h3></div><button className="plain-button" onClick={() => setDraft(null)} type="button">Cancel</button></div>
        <label className="editor-wide">Title<input autoFocus onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Episode title" required value={draft.title} /></label>
        <label className="editor-wide">Summary<textarea onChange={(event) => setDraft({ ...draft, summary: event.target.value })} placeholder="What will listeners hear about?" required rows={4} value={draft.summary} /></label>
        <label className="editor-wide">YouTube video link<input onChange={(event) => setDraft({ ...draft, youtubeUrl: event.target.value })} placeholder="https://www.youtube.com/watch?v=..." required type="url" value={draft.youtubeUrl} /></label>
        {error && <p className="login-error" role="alert">{error}</p>}
        <div className="editor-actions"><button className="green-button" type="submit">Save episode <span>↗</span></button><span className="form-success">{isEditor ? 'Saved episodes remain drafts until published.' : 'Your episode will be a draft until an editor publishes it.'}</span></div>
      </form>}
      <div className="podcast-admin-list">
        {visibleEpisodes.map((episode) => (
          <article className="podcast-admin-row" key={episode.id}>
            <div className="podcast-admin-copy"><span className={`story-status${episode.status === 'published' ? ' is-published' : ''}`}>{episode.status === 'published' ? 'Published' : 'Draft'}</span><h3>{episode.title}</h3><p>{episode.summary}</p><span className="podcast-admin-meta">By {users.find((editor) => editor.id === episode.authorId)?.name ?? 'LEAF Editorial Desk'} · {formatStoryDate(episode.publishedAt || episode.createdAt)}</span></div>
            <div className="podcast-admin-actions">
              <a className="plain-button podcast-watch-link" href={episode.youtubeUrl} rel="noreferrer" target="_blank">Preview video ↗</a>
              <button className="plain-button" disabled={user.role === 'Journalist' && (episode.authorId !== user.id || episode.status === 'published')} onClick={() => { setDraft(episode); setError('') }} type="button">Edit</button>
              {isEditor && episode.status === 'draft' && <button className="plain-button" onClick={() => onPublish(episode.id)} type="button">Publish</button>}
              {isEditor && <button className="plain-button danger-button" onClick={() => setPendingDeleteId(episode.id)} type="button">Delete</button>}
              {pendingDeleteId === episode.id && <div className="podcast-delete-confirm"><span>Delete this episode?</span><button onClick={() => { onDelete(episode.id); setPendingDeleteId(null) }} type="button">Confirm</button><button onClick={() => setPendingDeleteId(null)} type="button">Cancel</button></div>}
            </div>
          </article>
        ))}
        {visibleEpisodes.length === 0 && <p className="dashboard-empty">No podcast episodes here yet. Add an episode to start the conversation.</p>}
      </div>
    </section>
  )
}

function WebsiteSettingsPanel({ settings, onSave }: { settings: SiteSettings; onSave: (settings: SiteSettings) => void }) {
  const [draft, setDraft] = useState(settings)
  const [saved, setSaved] = useState(false)

  function updateField(field: keyof SiteSettings, value: string) {
    setDraft((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave(draft)
    setSaved(true)
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

function FeedbackPanel({ user, stories, feedback, reviewedFeedbackIds, onReview }: { user: DashboardUser; stories: Story[]; feedback: FeedbackMessage[]; reviewedFeedbackIds: string[]; onReview: (id: string) => void }) {
  const visibleFeedback = user.role === 'Journalist'
    ? feedback.filter((item) => item.authorId === user.id)
    : feedback

  return (
    <section className="feedback-manager">
      <div className="dashboard-section-heading"><div><span className="eyebrow">{user.role === 'Journalist' ? 'Your stories' : 'Reader response'}</span><h2>{user.role === 'Journalist' ? 'Feedback on your stories' : 'Feedback messages'}</h2><p>{user.role === 'Journalist' ? 'Only feedback linked to stories you authored appears here.' : 'Chief Editors and Admins can see feedback across every story.'} Reader feedback is saved in this browser preview.</p></div></div>
      <div className="feedback-list">
        {visibleFeedback.map((item) => {
          const reviewed = reviewedFeedbackIds.includes(item.id)
          const example = item.id.startsWith('sample-')
          return (
            <article className="feedback-row" key={item.id}>
              <div className="feedback-row-top"><div><span className={`feedback-status${reviewed ? ' is-reviewed' : ''}`}>{reviewed ? 'Reviewed' : example ? 'Example' : 'New'}</span><span className="feedback-time">{item.received}</span></div><button disabled={reviewed} onClick={() => onReview(item.id)} type="button">{reviewed ? 'Reviewed' : 'Mark reviewed'}</button></div>
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

function StorySubmissionInbox({ submissions }: { submissions: StorySubmission[] }) {
  return (
    <section className="feedback-manager">
      <div className="dashboard-section-heading"><div><span className="eyebrow">Community leads</span><h2>Story submissions</h2><p>Reader-submitted story tips and their supporting image evidence. Review and verify before assigning coverage.</p></div></div>
      <div className="feedback-list">
        {submissions.map((submission) => (
          <article className="feedback-row submission-row" key={submission.id}>
            <div className="feedback-row-top"><span className="feedback-status">Story tip · {submission.category}</span><span className="feedback-time">{submission.received}</span></div>
            <h3>{submission.title}</h3><div className="submission-sender"><span>{submission.name}</span><a href={`mailto:${submission.email}`}>{submission.email}</a></div>
            <p>{submission.details}</p>
            {submission.imageDataUrls.length > 0 ? <div className="submission-gallery">{submission.imageDataUrls.map((image, index) => <a href={image} key={`${submission.id}-evidence-${index}`} rel="noreferrer" target="_blank"><img alt={`Supporting evidence ${index + 1} for ${submission.title}`} src={image} /><span>Evidence {index + 1}</span></a>)}</div> : <p className="submission-no-images">No supporting images were included.</p>}
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
        <div className="footer-nav-group"><span className="footer-label">Explore</span><a href="#/home">Home</a><a href="#/charts/local-songs">Charts overview</a><a href="#/news/local">News overview</a><a href="#/podcast">Podcast</a><a href="#/contact">Contact us</a><a href="#/dashboard/stories">Dashboard</a></div>
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
