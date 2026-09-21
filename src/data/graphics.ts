import cardGuidedImg from '@/assets/images/card-guided.png'
import cardArtistDropImg from '@/assets/images/card-artist-drop.png'
import bannerHeroImg from '@/assets/images/banner-hero.png'

export interface GraphicItem {
  id: string
  name: string
  subtext: string
  img: string
  svgRaw: string
  symbol?: string
  club?: string
  category?: 'juventus' | 'artist-drop' | 'nature' | 'animals' | 'zodiac' | 'celebrations' | 'symbols'
}

// Helper to convert clean SVG content into an 8K-sharp SVG data URI
function createSvgDataUri(svgBody: string): string {
  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="4096" height="4096" viewBox="0 0 100 100" fill="white" shape-rendering="geometricPrecision">${svgBody}</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(fullSvg)}`
}

// ==========================================
// 1. ANIMALS & PETS SERIES
// ==========================================
export const animalsGraphics: GraphicItem[] = [
  {
    id: 'golden-retriever',
    name: 'Golden Retriever',
    subtext: 'Animals & Pets',
    symbol: '🐕',
    category: 'animals',
    svgRaw: `<path d="M22 36 C20 25 35 18 48 20 C58 21 68 28 72 38 C75 46 72 56 65 62 L66 76 C66 79 62 82 58 82 C54 82 52 78 52 75 L52 64 C46 66 38 65 32 60 C25 54 22 45 22 36 Z M30 38 C28 46 32 54 38 56 C44 58 52 56 56 50 C58 45 56 38 50 34 C44 30 34 32 30 38 Z" /><circle cx="42" cy="38" r="3.5" /><path d="M56 46 Q50 54 44 48" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'majestic-cat',
    name: 'Majestic Cat',
    subtext: 'Animals & Pets',
    symbol: '🐱',
    category: 'animals',
    svgRaw: `<path d="M20 25 L35 40 C45 36 55 36 65 40 L80 25 L75 50 C82 60 80 75 68 82 C58 88 42 88 32 82 C20 75 18 60 25 50 Z" /><circle cx="36" cy="55" r="3.5" /><circle cx="64" cy="55" r="3.5" /><polygon points="50,62 46,67 54,67" /><path d="M46 67 Q42 72 36 70 M54 67 Q58 72 64 70 M24 60 L10 58 M24 65 L12 68 M76 60 L90 58 M76 65 L88 68" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'bear-grizzly',
    name: 'Grizzly Bear',
    subtext: 'Animals & Pets',
    symbol: '🐻',
    category: 'animals',
    svgRaw: `<path d="M15 58 C15 50 20 44 26 42 C28 35 34 32 40 32 C46 32 50 35 55 34 C64 32 75 36 82 44 C88 50 88 62 82 72 C78 78 70 82 60 82 C52 82 46 80 40 82 C32 84 24 82 18 76 C15 72 15 64 15 58 Z M24 38 A4 4 0 1 0 24 30 A4 4 0 1 0 24 38 Z M45 30 A4 4 0 1 0 45 22 A4 4 0 1 0 45 30 Z" /><circle cx="72" cy="48" r="3" /><path d="M82 56 L76 54 L76 58 Z" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'wild-wolf',
    name: 'Wild Wolf',
    subtext: 'Animals & Pets',
    symbol: '🐺',
    category: 'animals',
    svgRaw: `<path d="M25 80 L35 60 C32 52 35 42 40 35 L45 18 L55 32 C65 32 75 38 80 48 L72 52 L78 62 L68 64 L72 80 C60 76 50 78 42 80 Z" /><path d="M52 42 L58 45 L50 48 Z" /><circle cx="58" cy="40" r="2.5" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'eagle-soar',
    name: 'Soaring Eagle',
    subtext: 'Animals & Pets',
    symbol: '🦅',
    category: 'animals',
    svgRaw: `<path d="M50 20 L58 35 L75 25 L70 42 L88 40 L76 55 L92 62 L74 68 L80 82 L62 76 L58 88 L50 75 L42 88 L38 76 L20 82 L26 68 L8 62 L24 55 L12 40 L30 42 L25 25 L42 35 Z" /><circle cx="50" cy="48" r="4" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'lion-king',
    name: 'Lion King',
    subtext: 'Animals & Pets',
    symbol: '🦁',
    category: 'animals',
    svgRaw: `<path d="M50 12 L56 22 L68 16 L70 28 L82 26 L78 38 L90 42 L82 52 L90 60 L78 66 L82 78 L70 76 L66 88 L54 80 L50 90 L46 80 L34 88 L30 76 L18 78 L22 66 L10 60 L18 52 L10 42 L22 38 L18 26 L30 28 L32 16 L44 22 Z M50 32 C40 32 34 40 34 50 C34 62 42 70 50 70 C58 70 66 62 66 50 C66 40 60 32 50 32 Z" /><circle cx="44" cy="48" r="2.5" /><circle cx="56" cy="48" r="2.5" /><polygon points="50,55 46,60 54,60" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'stag-antler',
    name: 'Majestic Stag',
    subtext: 'Animals & Pets',
    symbol: '🦌',
    category: 'animals',
    svgRaw: `<path d="M50 48 C42 48 38 56 38 66 C38 76 44 85 50 85 C56 85 62 76 62 66 C62 56 58 48 50 48 Z M38 52 L22 38 L15 42 L26 30 L18 22 L32 24 L35 12 L44 28 L38 48 M62 52 L78 38 L85 42 L74 30 L82 22 L68 24 L65 12 L56 28 L62 48" stroke="currentColor" stroke-width="3" stroke-linejoin="round" fill="none" /><circle cx="45" cy="62" r="2" /><circle cx="55" cy="62" r="2" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'fox-forest',
    name: 'Swift Fox',
    subtext: 'Animals & Pets',
    symbol: '🦊',
    category: 'animals',
    svgRaw: `<polygon points="50,78 28,45 32,20 45,35 55,35 68,20 72,45" /><polygon points="50,78 40,55 60,55" fill="#fff" opacity="0.9" /><circle cx="42" cy="48" r="2.5" /><circle cx="58" cy="48" r="2.5" /><circle cx="50" cy="74" r="3" fill="#000" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  }
]

// ==========================================
// 2. LANDSCAPE & NATURE SERIES
// ==========================================
export const natureGraphics: GraphicItem[] = [
  {
    id: 'mountain-peaks',
    name: 'Summit Peak',
    subtext: 'Outdoor Series',
    symbol: '🏔️',
    category: 'nature',
    svgRaw: `<polygon points="50,18 18,78 82,78" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" /><polygon points="50,18 42,36 50,42 58,34 50,18" /><polygon points="70,45 88,78 52,78" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" /><circle cx="28" cy="30" r="8" fill="currentColor" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'pine-forest',
    name: 'Forest Pines',
    subtext: 'Outdoor Series',
    symbol: '🌲',
    category: 'nature',
    svgRaw: `<polygon points="50,14 36,36 42,36 30,56 38,56 24,78 76,78 62,56 70,56 58,36 64,36" /><rect x="46" y="78" width="8" height="12" rx="1" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'campfire-wilderness',
    name: 'Campfire Glow',
    subtext: 'Outdoor Series',
    symbol: '🔥',
    category: 'nature',
    svgRaw: `<path d="M50 15 C55 30 70 38 70 55 C70 68 60 76 50 76 C40 76 30 68 30 55 C30 42 42 32 45 26 C46 35 52 40 54 46 C56 38 52 26 50 15 Z" /><line x1="20" y1="80" x2="80" y2="86" stroke="currentColor" stroke-width="5" stroke-linecap="round" /><line x1="20" y1="86" x2="80" y2="80" stroke="currentColor" stroke-width="5" stroke-linecap="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'compass-rose',
    name: 'Explorer Compass',
    subtext: 'Outdoor Series',
    symbol: '🧭',
    category: 'nature',
    svgRaw: `<circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="3" /><circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2,3" /><polygon points="50,12 55,45 50,50 45,45" /><polygon points="50,88 55,55 50,50 45,55" fill="none" stroke="currentColor" stroke-width="2" /><polygon points="88,50 55,55 50,50 55,45" /><polygon points="12,50 45,55 50,50 45,45" fill="none" stroke="currentColor" stroke-width="2" /><polygon points="76,24 54,46 50,50 46,54" fill="none" stroke="currentColor" stroke-width="1.5" /><polygon points="24,76 46,54 50,50 54,46" fill="none" stroke="currentColor" stroke-width="1.5" /><circle cx="50" cy="50" r="4" fill="currentColor" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'ocean-wave',
    name: 'River Rapids',
    subtext: 'Outdoor Series',
    symbol: '🌊',
    category: 'nature',
    svgRaw: `<path d="M12 75 C25 75 30 45 52 45 C68 45 74 60 88 52 C78 40 65 30 48 30 C32 30 22 50 12 75 Z M12 85 C30 85 45 68 62 68 C76 68 82 78 92 72 C85 64 74 58 60 58 C44 58 30 75 12 85 Z" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'crescent-moon',
    name: 'Crescent Night',
    subtext: 'Outdoor Series',
    symbol: '🌙',
    category: 'nature',
    svgRaw: `<path d="M65 18 C45 22 32 40 35 60 C38 78 54 90 72 85 C52 95 28 85 20 65 C12 45 25 22 48 15 C54 13 60 15 65 18 Z" /><polygon points="74,28 76,34 82,34 77,38 79,44 74,40 69,44 71,38 66,34 72,34" /><polygon points="60,48 61,52 65,52 62,55 63,59 60,56 57,59 58,55 55,52 59,52" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'oak-leaf',
    name: 'Oak Leaf',
    subtext: 'Outdoor Series',
    symbol: '🍁',
    category: 'nature',
    svgRaw: `<path d="M50 10 C56 22 72 20 68 34 C76 38 80 50 72 58 C78 68 68 78 56 78 L56 92 L44 92 L44 78 C32 78 22 68 28 58 C20 50 24 38 32 34 C28 20 44 22 50 10 Z" /><line x1="50" y1="18" x2="50" y2="78" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.8" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'desert-cactus',
    name: 'Desert Cactus',
    subtext: 'Outdoor Series',
    symbol: '🌵',
    category: 'nature',
    svgRaw: `<path d="M44 20 C44 14 56 14 56 20 L56 88 L44 88 Z M56 42 L68 42 C74 42 74 54 68 54 L56 54 M68 34 L68 46 M44 52 L32 52 C26 52 26 64 32 64 L44 64 M32 44 L32 56" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" /><line x1="15" y1="88" x2="85" y2="88" stroke="currentColor" stroke-width="3" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  }
]

// ==========================================
// 3. ZODIAC SERIES
// ==========================================
export const zodiacGraphics: GraphicItem[] = [
  {
    id: 'zodiac-aries',
    name: 'Aries Ram',
    subtext: 'Zodiac Series',
    symbol: '♈',
    category: 'zodiac',
    svgRaw: `<path d="M50 82 L50 40 M50 40 C45 25 22 25 22 40 C22 50 32 54 36 46 M50 40 C55 25 78 25 78 40 C78 50 68 54 64 46" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'zodiac-taurus',
    name: 'Taurus Bull',
    subtext: 'Zodiac Series',
    symbol: '♉',
    category: 'zodiac',
    svgRaw: `<circle cx="50" cy="62" r="22" fill="none" stroke="currentColor" stroke-width="6" /><path d="M22 25 C28 42 72 42 78 25" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'zodiac-gemini',
    name: 'Gemini Twins',
    subtext: 'Zodiac Series',
    symbol: '♊',
    category: 'zodiac',
    svgRaw: `<path d="M25 20 C42 28 58 28 75 20 M25 80 C42 72 58 72 75 80 M38 25 L38 75 M62 25 L62 75" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'zodiac-cancer',
    name: 'Cancer Crab',
    subtext: 'Zodiac Series',
    symbol: '♋',
    category: 'zodiac',
    svgRaw: `<circle cx="34" cy="40" r="10" /><path d="M34 30 C58 22 72 38 72 50" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" /><circle cx="66" cy="60" r="10" /><path d="M66 70 C42 78 28 62 28 50" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'zodiac-leo',
    name: 'Leo Lion',
    subtext: 'Zodiac Series',
    symbol: '♌',
    category: 'zodiac',
    svgRaw: `<circle cx="30" cy="62" r="9" fill="none" stroke="currentColor" stroke-width="5" /><path d="M36 56 C38 35 55 24 66 34 C76 44 65 65 72 75 C75 80 82 78 84 72" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'zodiac-virgo',
    name: 'Virgo Star',
    subtext: 'Zodiac Series',
    symbol: '♍',
    category: 'zodiac',
    svgRaw: `<path d="M22 28 L22 72 M22 38 C28 28 36 28 36 40 L36 72 M36 38 C42 28 50 28 50 40 L50 72 M50 38 C56 28 64 28 64 45 L64 78 C64 88 56 88 56 80 L76 56" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'zodiac-libra',
    name: 'Libra Scales',
    subtext: 'Zodiac Series',
    symbol: '♎',
    category: 'zodiac',
    svgRaw: `<line x1="20" y1="78" x2="80" y2="78" stroke="currentColor" stroke-width="5" stroke-linecap="round" /><path d="M20 54 L38 54 C38 42 44 34 50 34 C56 34 62 42 62 54 L80 54" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'zodiac-scorpio',
    name: 'Scorpio Stinger',
    subtext: 'Zodiac Series',
    symbol: '♏',
    category: 'zodiac',
    svgRaw: `<path d="M20 28 L20 68 M20 38 C26 28 34 28 34 40 L34 68 M34 38 C40 28 48 28 48 40 L48 68 M48 38 C54 28 62 28 62 42 L62 70 L74 70 L78 64 L70 64 L76 76" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'zodiac-sagittarius',
    name: 'Sagittarius Archer',
    subtext: 'Zodiac Series',
    symbol: '♐',
    category: 'zodiac',
    svgRaw: `<line x1="24" y1="76" x2="76" y2="24" stroke="currentColor" stroke-width="6" stroke-linecap="round" /><polyline points="52,24 76,24 76,48" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" /><line x1="38" y1="62" x2="62" y2="38" stroke="currentColor" stroke-width="6" stroke-linecap="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'zodiac-capricorn',
    name: 'Capricorn Goat',
    subtext: 'Zodiac Series',
    symbol: '♑',
    category: 'zodiac',
    svgRaw: `<path d="M22 28 L32 72 L44 38 C48 30 56 30 58 40 L58 64 C58 76 74 76 74 62 C74 52 64 52 64 62" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'zodiac-aquarius',
    name: 'Aquarius Waves',
    subtext: 'Zodiac Series',
    symbol: '♒',
    category: 'zodiac',
    svgRaw: `<polyline points="18,38 30,28 42,38 54,28 66,38 78,28" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" /><polyline points="18,62 30,52 42,62 54,52 66,62 78,52" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'zodiac-pisces',
    name: 'Pisces Twin Fish',
    subtext: 'Zodiac Series',
    symbol: '♓',
    category: 'zodiac',
    svgRaw: `<path d="M30 20 C42 38 42 62 30 80 M70 20 C58 38 58 62 70 80 M20 50 L80 50" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  }
]

// ==========================================
// 4. CELEBRATIONS SERIES
// ==========================================
export const celebrationsGraphics: GraphicItem[] = [
  {
    id: 'trophy-cup',
    name: 'Winner Trophy',
    subtext: 'Celebrations',
    symbol: '🏆',
    category: 'celebrations',
    svgRaw: `<path d="M30 22 L70 22 L68 50 C68 62 58 70 50 70 C42 70 32 62 32 50 Z" /><path d="M30 28 L20 28 C16 28 16 42 24 46 L31 46 M70 28 L80 28 C84 28 84 42 76 46 L69 46" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" /><rect x="46" y="70" width="8" height="12" /><rect x="34" y="82" width="32" height="8" rx="2" /><polygon points="50,34 52,40 58,40 53,44 55,50 50,46 45,50 47,44 42,40 48,40" fill="#fff" opacity="0.9" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'champagne-toast',
    name: 'Champagne Toast',
    subtext: 'Celebrations',
    symbol: '🥂',
    category: 'celebrations',
    svgRaw: `<path d="M36 20 L48 38 C50 42 46 48 40 48 L32 48 C26 48 22 42 24 38 Z" /><line x1="36" y1="48" x2="32" y2="76" stroke="currentColor" stroke-width="3" /><line x1="24" y1="76" x2="42" y2="76" stroke="currentColor" stroke-width="3" stroke-linecap="round" /><path d="M64 20 L52 38 C50 42 54 48 60 48 L68 48 C74 48 78 42 76 38 Z" /><line x1="64" y1="48" x2="68" y2="76" stroke="currentColor" stroke-width="3" /><line x1="58" y1="76" x2="76" y2="76" stroke="currentColor" stroke-width="3" stroke-linecap="round" /><circle cx="50" cy="18" r="2.5" /><circle cx="46" cy="12" r="2" /><circle cx="54" cy="10" r="1.5" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'birthday-cake',
    name: 'Birthday Cake',
    subtext: 'Celebrations',
    symbol: '🎂',
    category: 'celebrations',
    svgRaw: `<rect x="22" y="58" width="56" height="26" rx="3" /><rect x="30" y="40" width="40" height="18" rx="2" /><rect x="40" y="24" width="4" height="16" /><rect x="48" y="24" width="4" height="16" /><rect x="56" y="24" width="4" height="16" /><ellipse cx="42" cy="18" rx="2" ry="4" /><ellipse cx="50" cy="18" rx="2" ry="4" /><ellipse cx="58" cy="18" rx="2" ry="4" /><path d="M22 64 Q30 70 38 64 Q46 70 54 64 Q62 70 70 64 Q78 70 78 64" fill="none" stroke="#fff" stroke-width="3" opacity="0.8" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'party-popper',
    name: 'Party Popper',
    subtext: 'Celebrations',
    symbol: '🎉',
    category: 'celebrations',
    svgRaw: `<polygon points="20,80 44,68 32,44" fill="currentColor" /><circle cx="52" cy="38" r="3" /><circle cx="68" cy="46" r="2.5" /><circle cx="62" cy="24" r="3.5" /><polygon points="42,28 46,34 52,32 47,38 50,44 44,40 38,44 41,38 36,32 42,34" /><path d="M48 50 Q64 36 80 50 M56 34 Q70 18 84 30" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'gift-box',
    name: 'Surprise Gift',
    subtext: 'Celebrations',
    symbol: '🎁',
    category: 'celebrations',
    svgRaw: `<rect x="22" y="44" width="56" height="42" rx="3" /><rect x="18" y="34" width="64" height="12" rx="2" /><rect x="46" y="34" width="8" height="52" fill="#fff" opacity="0.9" /><path d="M50 34 C42 22 28 22 36 34 Z M50 34 C58 22 72 22 64 34 Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'fireworks-burst',
    name: 'Fireworks Burst',
    subtext: 'Celebrations',
    symbol: '🎆',
    category: 'celebrations',
    svgRaw: `<circle cx="50" cy="50" r="4" /><line x1="50" y1="15" x2="50" y2="35" stroke="currentColor" stroke-width="4" stroke-linecap="round" /><line x1="50" y1="65" x2="50" y2="85" stroke="currentColor" stroke-width="4" stroke-linecap="round" /><line x1="15" y1="50" x2="35" y2="50" stroke="currentColor" stroke-width="4" stroke-linecap="round" /><line x1="65" y1="50" x2="85" y2="50" stroke="currentColor" stroke-width="4" stroke-linecap="round" /><line x1="25" y1="25" x2="39" y2="39" stroke="currentColor" stroke-width="3" stroke-linecap="round" /><line x1="61" y1="61" x2="75" y2="75" stroke="currentColor" stroke-width="3" stroke-linecap="round" /><line x1="75" y1="25" x2="61" y2="39" stroke="currentColor" stroke-width="3" stroke-linecap="round" /><line x1="39" y1="61" x2="25" y2="75" stroke="currentColor" stroke-width="3" stroke-linecap="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'medal-honor',
    name: 'Honor Medal',
    subtext: 'Celebrations',
    symbol: '🏅',
    category: 'celebrations',
    svgRaw: `<polygon points="34,15 50,42 42,42 26,15" /><polygon points="66,15 50,42 58,42 74,15" /><circle cx="50" cy="62" r="22" fill="currentColor" /><circle cx="50" cy="62" r="16" fill="#fff" opacity="0.9" /><polygon points="50,52 53,58 60,59 55,64 57,71 50,67 43,71 45,64 40,59 47,58" fill="currentColor" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  }
]

// ==========================================
// 5. SYMBOLS & CRESTS
// ==========================================
export const symbolsGraphics: GraphicItem[] = [
  {
    id: 'stanley-bear-crest',
    name: 'Stanley Bear Crest',
    subtext: 'Stanley1913 Heritage',
    symbol: '👑',
    category: 'symbols',
    svgRaw: `<path d="M50 14 L56 26 L68 20 L64 34 L78 36 L70 48 L82 56 L70 64 L78 76 L64 78 L68 90 L54 84 L50 94 L46 84 L32 90 L36 78 L22 76 L30 64 L18 56 L30 48 L22 36 L36 34 L32 20 L44 26 Z" /><path d="M40 38 C40 32 60 32 60 38 L60 62 C60 70 40 70 40 62 Z" fill="#fff" opacity="0.9" /><polygon points="50,42 44,52 56,52" fill="currentColor" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'northern-star',
    name: 'Northern Star',
    subtext: 'Symbols & Crests',
    symbol: '✦',
    category: 'symbols',
    svgRaw: `<polygon points="50,10 55,42 88,50 55,58 50,90 45,58 12,50 45,42" /><polygon points="50,28 53,47 72,50 53,53 50,72 47,53 28,50 47,47" fill="#fff" opacity="0.9" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'heraldic-shield',
    name: 'Heraldic Shield',
    subtext: 'Symbols & Crests',
    symbol: '🛡️',
    category: 'symbols',
    svgRaw: `<path d="M22 20 L78 20 L78 50 C78 70 50 86 50 86 C50 86 22 70 22 50 Z" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" /><line x1="50" y1="20" x2="50" y2="84" stroke="currentColor" stroke-width="4" /><line x1="22" y1="46" x2="78" y2="46" stroke="currentColor" stroke-width="4" /><circle cx="36" cy="33" r="4" /><circle cx="64" cy="62" r="4" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'royal-crown',
    name: 'Royal Crown',
    subtext: 'Symbols & Crests',
    symbol: '👑',
    category: 'symbols',
    svgRaw: `<path d="M18 72 L82 72 L88 38 L68 54 L50 24 L32 54 L12 38 Z" /><circle cx="12" cy="34" r="3" /><circle cx="32" cy="50" r="3" /><circle cx="50" cy="20" r="3.5" /><circle cx="68" cy="50" r="3" /><circle cx="88" cy="34" r="3" /><rect x="18" y="76" width="64" height="8" rx="2" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'diamond-facet',
    name: 'Facet Diamond',
    subtext: 'Symbols & Crests',
    symbol: '💎',
    category: 'symbols',
    svgRaw: `<polygon points="30,22 70,22 88,44 50,85 12,44" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" /><polyline points="12,44 88,44" stroke="currentColor" stroke-width="4" /><polyline points="30,22 42,44 50,85 58,44 70,22" stroke="currentColor" stroke-width="3" fill="none" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'infinity-mark',
    name: 'Infinity Mark',
    subtext: 'Symbols & Crests',
    symbol: '♾️',
    category: 'symbols',
    svgRaw: `<path d="M32 34 C18 34 18 66 32 66 C42 66 50 50 50 50 C50 50 58 34 68 34 C82 34 82 66 68 66 C58 66 50 50 50 50 C50 50 42 34 32 34 Z" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'nautical-anchor',
    name: 'Nautical Anchor',
    subtext: 'Symbols & Crests',
    symbol: '⚓',
    category: 'symbols',
    svgRaw: `<circle cx="50" cy="22" r="8" fill="none" stroke="currentColor" stroke-width="4" /><line x1="50" y1="30" x2="50" y2="82" stroke="currentColor" stroke-width="6" /><line x1="32" y1="42" x2="68" y2="42" stroke="currentColor" stroke-width="5" stroke-linecap="round" /><path d="M22 58 C22 80 78 80 78 58" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" /><polygon points="22,54 16,62 28,62" /><polygon points="78,54 72,62 84,62" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'sacred-heart',
    name: 'Geometric Heart',
    subtext: 'Symbols & Crests',
    symbol: '❤️',
    category: 'symbols',
    svgRaw: `<path d="M50 82 L20 48 C10 36 20 18 36 22 C44 24 48 30 50 34 C52 30 56 24 64 22 C80 18 90 36 80 48 Z" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  }
]

// ==========================================
// 6. STANLEY x JUVENTUS COLLABORATION
// ==========================================
export const juventusGraphics: GraphicItem[] = [
  {
    id: 'viking-juve',
    name: 'Juventus Crest Mark',
    subtext: 'Juventus FC',
    club: 'Juventus FC',
    symbol: '✦',
    category: 'juventus',
    svgRaw: `<path d="M26 18 L74 18 L74 58 C74 76 50 88 50 88 C50 88 26 76 26 58 Z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round" /><path d="M42 28 L42 66 C42 72 36 72 36 72 M58 28 L58 66 C58 72 64 72 64 72" stroke="currentColor" stroke-width="7" stroke-linecap="round" fill="none" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'classic-juve',
    name: 'Classic Juve Crest',
    subtext: 'Juventus FC',
    club: 'Juventus FC',
    symbol: '𐂂',
    category: 'juventus',
    svgRaw: `<ellipse cx="50" cy="50" rx="30" ry="40" fill="none" stroke="currentColor" stroke-width="5" /><line x1="42" y1="12" x2="42" y2="88" stroke="currentColor" stroke-width="4" /><line x1="58" y1="12" x2="58" y2="88" stroke="currentColor" stroke-width="4" /><polygon points="50,22 46,30 54,30" /><circle cx="50" cy="65" r="8" fill="currentColor" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'wait-and-see',
    name: 'Wait and See',
    subtext: 'Juventus FC',
    club: 'Juventus FC',
    symbol: '▲',
    category: 'juventus',
    svgRaw: `<polygon points="50,15 18,80 82,80" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round" /><line x1="50" y1="36" x2="50" y2="58" stroke="currentColor" stroke-width="5" stroke-linecap="round" /><circle cx="50" cy="68" r="3.5" fill="currentColor" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'sweet-and-sweet',
    name: 'Sweet and Sweet',
    subtext: 'Juventus FC',
    club: 'Juventus FC',
    symbol: '☼',
    category: 'juventus',
    svgRaw: `<circle cx="50" cy="50" r="20" /><path d="M50 12 L50 24 M50 76 L50 88 M12 50 L24 50 M76 50 L88 50 M23 23 L32 32 M68 68 L77 77 M77 23 L68 32 M32 68 L23 77" stroke="currentColor" stroke-width="5" stroke-linecap="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'be-nice',
    name: 'Be Nice Graphic',
    subtext: 'Juventus FC',
    club: 'Juventus FC',
    symbol: '✛',
    category: 'juventus',
    svgRaw: `<rect x="42" y="16" width="16" height="68" rx="4" /><rect x="16" y="42" width="68" height="16" rx="4" /><circle cx="50" cy="50" r="5" fill="#fff" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  }
]

// ==========================================
// 7. STANLEY x LIUNIC ON THINGS (ARTIST DROP)
// ==========================================
export const liunicGraphics: GraphicItem[] = [
  {
    id: 'artist-doodle-sun',
    name: 'Retro Sunburst',
    subtext: 'Artist Drop',
    symbol: '☼',
    category: 'artist-drop',
    svgRaw: `<circle cx="50" cy="50" r="18" /><circle cx="44" cy="48" r="2.5" fill="#fff" /><circle cx="56" cy="48" r="2.5" fill="#fff" /><path d="M44 55 Q50 60 56 55" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" /><path d="M50 14 C48 24 52 24 50 30 M50 70 C48 76 52 76 50 86 M14 50 C24 48 24 52 30 50 M70 50 C76 48 76 52 86 50 M25 25 C32 30 30 34 36 36 M64 64 C70 66 68 70 75 75 M75 25 C70 32 66 30 64 36 M36 64 C30 68 32 70 25 75" stroke="currentColor" stroke-width="4" stroke-linecap="round" fill="none" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'artist-wild-flower',
    name: 'Wild Daisy Bloom',
    subtext: 'Artist Drop',
    symbol: '🌸',
    category: 'artist-drop',
    svgRaw: `<circle cx="50" cy="50" r="12" /><ellipse cx="50" cy="22" rx="8" ry="14" /><ellipse cx="50" cy="78" rx="8" ry="14" /><ellipse cx="22" cy="50" rx="14" ry="8" /><ellipse cx="78" cy="50" rx="14" ry="8" /><ellipse cx="30" cy="30" rx="12" ry="8" transform="rotate(-45 30 30)" /><ellipse cx="70" cy="70" rx="12" ry="8" transform="rotate(-45 70 70)" /><ellipse cx="70" cy="30" rx="12" ry="8" transform="rotate(45 70 30)" /><ellipse cx="30" cy="70" rx="12" ry="8" transform="rotate(45 30 70)" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'artist-peace-hands',
    name: 'Groovy Peace Sign',
    subtext: 'Artist Drop',
    symbol: '✌️',
    category: 'artist-drop',
    svgRaw: `<path d="M38 78 L38 48 C38 42 46 42 46 48 L46 78 M46 48 L46 25 C46 19 54 19 54 25 L54 62 M54 38 C54 32 62 32 62 38 L62 62 M62 46 C62 40 70 40 70 46 L70 66 C70 82 54 90 38 88 L30 78 C25 72 28 64 34 68 L38 72" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'artist-magic-shroom',
    name: 'Magic Shroom Duo',
    subtext: 'Artist Drop',
    symbol: '🍄',
    category: 'artist-drop',
    svgRaw: `<path d="M20 54 C20 30 80 30 80 54 Z" /><rect x="42" y="54" width="16" height="32" rx="4" /><circle cx="36" cy="42" r="4" fill="#fff" /><circle cx="62" cy="40" r="5" fill="#fff" /><circle cx="48" cy="34" r="3" fill="#fff" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'artist-cosmic-planet',
    name: 'Cosmic Planet',
    subtext: 'Artist Drop',
    symbol: '🪐',
    category: 'artist-drop',
    svgRaw: `<circle cx="50" cy="50" r="22" /><ellipse cx="50" cy="50" rx="44" ry="12" fill="none" stroke="currentColor" stroke-width="5" transform="rotate(-25 50 50)" stroke-linecap="round" /><circle cx="78" cy="24" r="3" /><polygon points="24,24 26,28 30,28 27,31 28,35 24,33 20,35 21,31 18,28 22,28" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  },
  {
    id: 'artist-wired-heart',
    name: 'Wired Line Heart',
    subtext: 'Artist Drop',
    symbol: '❤️',
    category: 'artist-drop',
    svgRaw: `<path d="M50 78 C20 52 12 32 30 20 C42 12 48 22 50 26 C52 22 58 12 70 20 C88 32 80 52 50 78 Z" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />`,
    get img() { return createSvgDataUri(this.svgRaw) }
  }
]

// ==========================================
// 8. TOP 5 MOST USED / TRENDING GRAPHICS
// ==========================================
export const topGraphics: GraphicItem[] = [
  symbolsGraphics[0], // stanley-bear-crest
  natureGraphics[0],  // mountain-peaks
  natureGraphics[3],  // compass-rose
  juventusGraphics[0],// viking-juve
  liunicGraphics[0],  // artist-doodle-sun
]

// ==========================================
// 9. UNIFIED MASTER GRAPHICS REGISTRY
// ==========================================
export const allGraphics: GraphicItem[] = [
  ...topGraphics,
  ...animalsGraphics,
  ...natureGraphics,
  ...zodiacGraphics,
  ...celebrationsGraphics,
  ...symbolsGraphics,
  ...juventusGraphics,
  ...liunicGraphics,
]

// Unique map of all graphics by ID
export const graphicsMap = new Map<string, GraphicItem>()
allGraphics.forEach(item => {
  if (!graphicsMap.has(item.id)) {
    graphicsMap.set(item.id, item)
  }
})

export const uniqueGraphics: GraphicItem[] = Array.from(graphicsMap.values())

// ==========================================
// 10. GRAPHIC CAMPAIGNS
// ==========================================
export interface GraphicCampaign {
  id: string
  title: string
  subtitle: string
  bannerImg: string
  description: string
  graphics: GraphicItem[]
}

export const graphicCampaigns: GraphicCampaign[] = [
  {
    id: 'juventus',
    title: 'Stanley1913 x Juventus.',
    subtitle: 'Limited Edition Engravings',
    bannerImg: cardGuidedImg,
    description: 'Celebrate the legacy of Juventus with exclusive crests and typographic marks. Engineered for precision laser engraving on your Quencher.',
    graphics: juventusGraphics
  },
  {
    id: 'artist-drop',
    title: 'Stanley1913 x Artist Drop.',
    subtitle: 'Curated Artwork Collection',
    bannerImg: cardArtistDropImg,
    description: 'Exclusive artistic illustrations and patterns created by world-renowned creators for custom laser engraving.',
    graphics: liunicGraphics
  },
  {
    id: 'outdoor',
    title: 'Stanley1913 x Outdoor Series.',
    subtitle: 'Explore Nature & Wilderness',
    bannerImg: bannerHeroImg,
    description: 'Embrace the great outdoors with rugged mountain ridges, trail badges, and compass marks.',
    graphics: natureGraphics
  }
]

// ==========================================
// 11. CATEGORY DETAILS STRUCTURE
// ==========================================
export interface CategoryDetail {
  name: string
  symbol: string
  graphics: GraphicItem[]
}

export const categoryDetails: Record<string, CategoryDetail> = {
  'Animals & Pets': {
    name: 'Animals & Pets',
    symbol: '🐕',
    graphics: animalsGraphics,
  },
  'Animals and Pets': {
    name: 'Animals & Pets',
    symbol: '🐕',
    graphics: animalsGraphics,
  },
  'Landscape & Nature': {
    name: 'Landscape & Nature',
    symbol: '🏔️',
    graphics: natureGraphics,
  },
  'Zodiac': {
    name: 'Zodiac',
    symbol: '☸️',
    graphics: zodiacGraphics,
  },
  'Celebrations': {
    name: 'Celebrations',
    symbol: '🎉',
    graphics: celebrationsGraphics,
  },
  'Symbols & Crests': {
    name: 'Symbols & Crests',
    symbol: '👑',
    graphics: symbolsGraphics,
  }
}

export const artworkCategories = [
  { name: 'Animals & Pets', symbol: '🐕' },
  { name: 'Landscape & Nature', symbol: '🏔️' },
  { name: 'Zodiac', symbol: '☸️' },
  { name: 'Celebrations', symbol: '🎉' },
  { name: 'Symbols & Crests', symbol: '👑' },
]

// ==========================================
// 12. HELPER LOOKUP FUNCTIONS
// ==========================================
export const getGraphicById = (id: string | null): GraphicItem | null => {
  if (!id) return null
  return graphicsMap.get(id) || null
}

export const getGraphicImage = (id: string | null): string => {
  if (!id) return ''
  const graphic = getGraphicById(id)
  if (graphic?.img) return graphic.img
  return topGraphics[0].img
}
