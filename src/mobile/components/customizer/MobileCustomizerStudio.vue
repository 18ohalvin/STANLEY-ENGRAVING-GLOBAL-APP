<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  X,
  Snowflake,
  Box,
  ArrowLeftRight,
  ArrowRight,
  ArrowLeft,
  Check,
  Type,
  LayoutGrid,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  ChevronRight,
  UploadCloud,
  Layers,
  RotateCcw,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
  Info,
  SlidersHorizontal,
  AlertCircle
} from 'lucide-vue-next'
import type { Product, ProductColor } from '@/data/catalog'
import { PRODUCTS, getEngravingProfile } from '@/data/catalog'
import {
  type GraphicItem,
  type GraphicCampaign,
  graphicCampaigns,
  topGraphics as top5Graphics,
  celebrationsGraphics,
  familyGraphics,
  holidayGraphics,
  petNatureGraphics,
  sportsGraphics,
  zodiacGraphics,
  uniqueGraphics,
  getGraphicById,
  getGraphicImage
} from '@/data/graphics'

// Blank tumbler stage images
import blankIceflowImg from '@/assets/images/artist-drop-iceflow.png'
import quencherGreenBlankImg from '@/assets/products/quencher-green-blank.png'
import LaserPreview from '@/components/customizer/LaserPreview.vue'

const props = defineProps<{
  product: Product
  initialColor?: ProductColor
  initialArtwork?: string
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'swap-products'): void
  (e: 'add-to-cart', payload: any): void
}>()

// Stepper state (1: Base Model, 2: Personalize, 3: Review)
const currentStep = ref<1 | 2 | 3>(1)

// Selection State (Synced with desktop backend logic)
const selectedColor = ref<ProductColor>(props.initialColor || props.product.colors[0])
const selectedSize = ref<'30 oz' | '40 oz' | '50 oz' | '64 oz'>('30 oz')

// Auto-hide Floating Sticky Button State on Scroll
const isScrollHidden = ref(false)
let lastScrollTop = 0

// Step 2 Personalization State (Desktop-Equivalent Global Logic)
const selectedSubCategory = ref<'gallery' | 'upload' | 'text' | null>(null)
const galleryCategory = ref<'special' | 'top5' | 'all'>('special')
const galleryView = ref<'menu' | 'special-graphic' | 'top5' | 'categories'>('menu')
const activeSpecialTab = ref<'juventus' | 'liunic' | 'outdoor'>('juventus')
const activeCategoryTab = ref<'all' | 'celebration' | 'family' | 'holiday' | 'pet-nature' | 'sports' | 'zodiac'>('all')
const engravingText = ref('')
const selectedFont = ref<string | null>(null)
const selectedArtwork = ref<string | null>(props.initialArtwork || null)
const selectedPlacement = ref<'center' | 'top' | 'bottom' | 'left' | 'right' | null>('center')
const textOrientation = ref<'vertical' | 'horizontal'>('horizontal')
const selectedFontSize = ref<'S' | 'M' | 'L' | 'XL'>('M')
const stackOrder = ref<'graphic-top' | 'text-top'>('graphic-top')
const uploadedFileName = ref<string | null>(null)
const showDiscardModal = ref(false)
const showCloseConfirmModal = ref(false)
const activeCampaignId = ref<string>('juventus')

// Special Graphic Auto-slide Hero Banner Popup (Figma Node 5660:1148)
const showSpecialGraphicPopup = ref(false)
const specialSlideIndex = ref(0)
let specialBannerInterval: ReturnType<typeof setInterval> | null = null
const touchStartX = ref(0)

// Special Graphic Floating Buttons (Figma Node 5711:7608)
const isSpecialFloatingExpanded = ref(false)
let specialFloatingTimer1: ReturnType<typeof setTimeout> | null = null
let specialFloatingTimer2: ReturnType<typeof setTimeout> | null = null
const isPositionDrawerOpen = ref(false)

// Draft state for Text Customizer view (Figma Node 5256:9060 & 5699:7177)
const firstCustomizationType = ref<'text' | 'graphic' | null>(null)
const rawDraftText = ref('')
const draftText = ref('')
const draftFont = ref<string>("font-['Stanley_Favorit',sans-serif] font-medium")
const draftFontSize = ref<'S' | 'M' | 'L' | 'XL'>('M')
const draftGraphicSize = ref<'S' | 'M' | 'L'>('M')
const draftGraphicPlacement = ref<'center' | 'top' | 'bottom' | 'left' | 'right'>('center')
const draftPlacement = ref<'center' | 'top' | 'bottom' | 'left' | 'right'>('center')
const draftOrientation = ref<'vertical' | 'horizontal'>('horizontal')
const textActiveTab = ref<'style' | 'size'>('style')
const isTextFocused = ref(false)
const textInputRef = ref<HTMLTextAreaElement | null>(null)
const textMeasureBoxRef = ref<HTMLElement | null>(null)

// Snapshot of applied personalization state (used for revert on discard)
const appliedState = ref({
  text: '',
  font: null as string | null,
  fontSize: 'M' as 'S' | 'M' | 'L' | 'XL',
  graphicSize: 'M' as 'S' | 'M' | 'L',
  artwork: props.initialArtwork || null as string | null,
  graphicPlacement: 'center' as 'center' | 'top' | 'bottom' | 'left' | 'right',
  placement: 'center' as 'center' | 'top' | 'bottom' | 'left' | 'right' | null,
  orientation: 'horizontal' as 'vertical' | 'horizontal',
  stackOrder: 'graphic-top' as 'graphic-top' | 'text-top',
  uploadedFile: null as string | null
})

watch(() => props.initialArtwork, (newArt) => {
  if (newArt) {
    selectedArtwork.value = newArt
    appliedState.value.artwork = newArt
  }
})

watch(() => props.isOpen, (open) => {
  if (open) {
    currentStep.value = 1
    selectedSubCategory.value = null
    if (props.initialArtwork) {
      selectedArtwork.value = props.initialArtwork
      appliedState.value.artwork = props.initialArtwork
    }
  }
})

watch(() => currentStep.value, (newStep) => {
  if (newStep === 2 && (selectedArtwork.value || appliedState.value.artwork || props.initialArtwork)) {
    openGraphicGallery()
  }
})

const isLightColor = (hex?: string): boolean => {
  if (!hex) return false
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.62
}

const isProductColorLight = computed(() => {
  return isLightColor(selectedColor.value?.hex)
})

const productProfile = computed(() => getEngravingProfile(props.product))

const isTextLimitReached = ref(false)

const getAvailableTextHeight = () => {
  const totalZoneHeight = 280
  const hasGraphic = Boolean(appliedState.value.artwork || selectedArtwork.value || appliedState.value.uploadedFile)
  if (!hasGraphic) return totalZoneHeight
  
  const gPlacement = draftGraphicPlacement.value || appliedState.value.graphicPlacement || 'center'
  const gSize = draftGraphicSize.value || appliedState.value.graphicSize || 'M'
  const gHeight = gSize === 'L' ? (productProfile.value?.largeGraphicHeight || 182) : gSize === 'S' ? (productProfile.value?.smallGraphicHeight || 100) : (productProfile.value?.standardGraphicHeight || 135)
  
  if (gPlacement === 'center') {
    return Math.max(35, Math.floor((totalZoneHeight - gHeight) / 2))
  }
  return Math.max(40, totalZoneHeight - gHeight)
}

const fontOptions = [
  { name: 'Stanley Favorite', line1: 'Stanley', line2: 'Favorite', class: "font-['Stanley_Favorit',sans-serif] font-medium", caseMode: 'universal' as const },
  { name: 'Dancing Script', line1: 'Dancing', line2: 'Script', class: "font-['Dancing_Script',cursive]", caseMode: 'universal' as const },
  { name: 'Space Mono', line1: 'Space', line2: 'Mono', class: "font-['Space_Mono',monospace]", caseMode: 'universal' as const },
  { name: 'Gasoek One', line1: 'Gasoek', line2: 'One', class: "font-['Gasoek_One',sans-serif]", caseMode: 'universal' as const },
  { name: 'Caveat', singleLine: 'Caveat', class: "font-['Caveat',cursive]", caseMode: 'universal' as const },
  { name: 'Cinzel', singleLine: 'Cinzel', class: "font-['Cinzel',serif]", caseMode: 'uppercase' as const },
  { name: 'Playfair Display', line1: 'Playfair', line2: 'Display', class: "font-['Playfair_Display',serif]", caseMode: 'universal' as const },
  { name: 'Bebas Neue', singleLine: 'BEBAS NEUE', class: "font-['Bebas_Neue',sans-serif] tracking-wider", caseMode: 'uppercase' as const },
  { name: 'Great Vibes', line1: 'Great', line2: 'Vibes', class: "font-['Great_Vibes',cursive]", caseMode: 'universal' as const },
  { name: 'Pacifico', singleLine: 'Pacifico', class: "font-['Pacifico',cursive]", caseMode: 'universal' as const },
  { name: 'Permanent Marker', line1: 'Permanent', line2: 'Marker', class: "font-['Permanent_Marker',cursive]", caseMode: 'universal' as const },
  { name: 'Righteous', singleLine: 'Righteous', class: "font-['Righteous',sans-serif]", caseMode: 'universal' as const },
  { name: 'Montserrat', singleLine: 'Montserrat', class: "font-['Montserrat',sans-serif] font-bold", caseMode: 'universal' as const },
  { name: 'Oswald', singleLine: 'OSWALD', class: "font-['Oswald',sans-serif] font-semibold tracking-wide", caseMode: 'uppercase' as const },
  { name: 'Abril Fatface', line1: 'Abril', line2: 'Fatface', class: "font-['Abril_Fatface',serif]", caseMode: 'universal' as const },
  { name: 'Alfa Slab One', line1: 'Alfa Slab', line2: 'One', class: "font-['Alfa_Slab_One',serif]", caseMode: 'universal' as const },
]

const getFontClass = (fontName: string | null | undefined): string => {
  if (!fontName) return "font-['Stanley_Favorit',sans-serif] font-medium"
  const f = fontOptions.find(opt => opt.name === fontName || opt.class === fontName)
  return f ? f.class : (fontName.startsWith('font-') ? fontName : "font-['Stanley_Favorit',sans-serif] font-medium")
}

const isFontUppercase = (fontNameOrClass: string | null | undefined): boolean => {
  if (!fontNameOrClass) return false
  const font = fontOptions.find(f => f.name === fontNameOrClass || f.class === fontNameOrClass)
  if (font) return font.caseMode === 'uppercase'
  return fontNameOrClass.includes('uppercase') || fontNameOrClass.includes('Cinzel') || fontNameOrClass.includes('Bebas') || fontNameOrClass.includes('Oswald')
}

const getFontFamilyString = (fontNameOrClass: string | null | undefined): string => {
  const str = fontNameOrClass || ''
  if (str.includes('Dancing_Script') || str.includes('Dancing Script') || str.includes('Dancing')) return "'Dancing Script', 'Dancing_Script', cursive"
  if (str.includes('Space_Mono') || str.includes('Space Mono') || str.includes('Space')) return "'Space Mono', 'Space_Mono', monospace"
  if (str.includes('Gasoek_One') || str.includes('Gasoek One') || str.includes('Gasoek')) return "'Gasoek One', 'Gasoek_One', sans-serif"
  if (str.includes('Caveat')) return "'Caveat', cursive"
  if (str.includes('Cinzel')) return "'Cinzel', serif"
  if (str.includes('Playfair_Display') || str.includes('Playfair Display') || str.includes('Playfair')) return "'Playfair Display', 'Playfair_Display', serif"
  if (str.includes('Bebas_Neue') || str.includes('Bebas Neue') || str.includes('Bebas')) return "'Bebas Neue', 'Bebas_Neue', sans-serif"
  if (str.includes('Great_Vibes') || str.includes('Great Vibes') || str.includes('Great')) return "'Great Vibes', 'Great_Vibes', cursive"
  if (str.includes('Pacifico')) return "'Pacifico', cursive"
  if (str.includes('Permanent_Marker') || str.includes('Permanent Marker') || str.includes('Permanent')) return "'Permanent Marker', 'Permanent_Marker', cursive"
  if (str.includes('Righteous')) return "'Righteous', sans-serif"
  if (str.includes('Montserrat')) return "'Montserrat', sans-serif"
  if (str.includes('Oswald')) return "'Oswald', sans-serif"
  if (str.includes('Abril_Fatface') || str.includes('Abril Fatface') || str.includes('Abril')) return "'Abril Fatface', 'Abril_Fatface', serif"
  if (str.includes('Alfa_Slab_One') || str.includes('Alfa Slab One') || str.includes('Alfa Slab') || str.includes('Alfa')) return "'Alfa Slab One', 'Alfa_Slab_One', serif"
  if (str.includes('serif')) return 'Georgia, Cambria, serif'
  if (str.includes('mono')) return 'Menlo, Monaco, Consolas, monospace'
  return "'Stanley_Favorit', sans-serif"
}

// Characteristic width ratio per font family (ratio of average character width to fontPx)
const getFontCharWidthRatio = (fontNameOrClass: string | null | undefined, isUpper: boolean): number => {
  const str = fontNameOrClass || ''
  if (str.includes('Bebas')) return 0.38
  if (str.includes('Oswald')) return 0.39
  if (str.includes('Space')) return 0.60
  if (str.includes('Caveat')) return isUpper ? 0.44 : 0.39
  if (str.includes('Dancing')) return isUpper ? 0.48 : 0.41
  if (str.includes('Great')) return isUpper ? 0.50 : 0.42
  if (str.includes('Pacifico')) return isUpper ? 0.52 : 0.46
  if (str.includes('Permanent')) return isUpper ? 0.55 : 0.48
  if (str.includes('Righteous')) return 0.52
  if (str.includes('Montserrat')) return isUpper ? 0.58 : 0.50
  if (str.includes('Abril')) return isUpper ? 0.60 : 0.50
  if (str.includes('Alfa')) return isUpper ? 0.62 : 0.54
  if (str.includes('Cinzel')) return 0.54
  if (str.includes('Gasoek')) return 0.55
  if (str.includes('Playfair')) return isUpper ? 0.56 : 0.47
  return isUpper ? 0.55 : 0.49
}

let measureCanvas: HTMLCanvasElement | null = null
let measureCtx: CanvasRenderingContext2D | null = null

const getCanvasContext = () => {
  if (typeof document === 'undefined') return null
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas')
    measureCtx = measureCanvas.getContext('2d')
  }
  return measureCtx
}

const measureTextWidth = (
  text: string,
  fontNameOrClass: string | null | undefined,
  fontPx: number,
  isVertical: boolean
): number => {
  if (!text) return 0
  const isUpper = isFontUppercase(fontNameOrClass)
  const transformed = isUpper ? text.toUpperCase() : text
  const family = getFontFamilyString(fontNameOrClass)
  
  const ctx = getCanvasContext()
  let measured = 0
  if (ctx) {
    ctx.font = `bold ${fontPx}px ${family}`
    measured = ctx.measureText(transformed).width
  }
  
  const ratio = getFontCharWidthRatio(fontNameOrClass, isUpper)
  const estimatedFallback = transformed.length * (fontPx * ratio)
  
  // Use canvas measurement if valid and reasonable, otherwise fallback
  const width = (measured > 0 && measured < estimatedFallback * 2.5 && measured > estimatedFallback * 0.4)
    ? measured
    : estimatedFallback
    
  // Add letter-spacing (matching LaserPreview parsedLetterSpacing)
  const isBebas = (fontNameOrClass || '').includes('Bebas')
  const letterSpacingEm = isBebas ? 0.08 : (isVertical ? 0.08 : 0.02)
  const spacingTotal = Math.max(0, transformed.length - 1) * (fontPx * letterSpacingEm)
  
  return width + spacingTotal
}

const getFontSizePx = (): number => {
  const hasGraphic = Boolean(appliedState.value.artwork || selectedArtwork.value || appliedState.value.uploadedFile)
  const gSize = draftGraphicSize.value || appliedState.value.graphicSize || 'M'
  const fontSize = draftFontSize.value
  
  if (gSize === 'L' && hasGraphic) {
    return fontSize === 'S' ? 22 : fontSize === 'M' ? 26 : fontSize === 'L' ? 31 : 41
  } else {
    return fontSize === 'S' ? 24 : fontSize === 'M' ? 34 : fontSize === 'L' ? 43 : 55
  }
}

const checkSingleLineFits = (lineText: string, currentFont?: string | null): boolean => {
  if (!lineText) return true
  
  const activeFont = currentFont !== undefined ? currentFont : draftFont.value
  const fontPx = getFontSizePx()
  const availableHeight = getAvailableTextHeight()
  const availableWidth = 180
  const isVertical = draftOrientation.value === 'vertical'
  
  const measuredWidth = measureTextWidth(lineText, activeFont, fontPx, isVertical)
  
  if (isVertical) {
    return measuredWidth <= availableHeight
  } else {
    return measuredWidth <= availableWidth
  }
}

const getMaxAllowedLines = (): number => {
  const isVertical = draftOrientation.value === 'vertical'
  const fontPx = getFontSizePx()
  
  if (isVertical) {
    // Vertical text columns expand horizontally across the engraving width (~180px)
    const availableWidth = 180
    const colWidth = Math.max(18, fontPx * 1.0)
    return Math.max(1, Math.floor(availableWidth / colWidth))
  } else {
    // Horizontal text lines stack vertically in the available text height
    const availableHeight = getAvailableTextHeight()
    const lineHeight = Math.max(18, fontPx * 0.94)
    return Math.max(1, Math.floor(availableHeight / lineHeight))
  }
}

const splitIntoFittingLines = (rawLine: string, currentFont?: string | null): string[] => {
  const activeFont = currentFont !== undefined ? currentFont : draftFont.value
  if (checkSingleLineFits(rawLine, activeFont)) return [rawLine]
  
  const result: string[] = []
  let remaining = rawLine
  
  while (remaining.length > 0) {
    if (checkSingleLineFits(remaining, activeFont)) {
      result.push(remaining)
      break
    }
    
    // Binary search for largest slice of `remaining` that fits on one line
    let low = 1
    let high = remaining.length
    let maxFittingLen = 1
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      if (checkSingleLineFits(remaining.slice(0, mid), activeFont)) {
        maxFittingLen = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
    
    // Check if there is a space within remaining[0 ... maxFittingLen]
    const slice = remaining.slice(0, maxFittingLen)
    const lastSpaceIdx = slice.lastIndexOf(' ')
    if (lastSpaceIdx > 0) {
      result.push(remaining.slice(0, lastSpaceIdx))
      remaining = remaining.slice(lastSpaceIdx + 1).trimStart()
    } else {
      // Hard break characters so word wraps into next line (e.g. STAN -> LEY)
      const breakIdx = Math.max(1, maxFittingLen)
      result.push(remaining.slice(0, breakIdx))
      remaining = remaining.slice(breakIdx).trimStart()
    }
  }
  
  return result
}

const getWrappedLines = (text: string, currentFont?: string | null): string[] => {
  if (!text) return []
  const activeFont = currentFont !== undefined ? currentFont : draftFont.value
  const rawParagraphs = text.split('\n')
  const wrappedLines: string[] = []
  
  for (const p of rawParagraphs) {
    if (p === '') {
      wrappedLines.push('')
    } else {
      wrappedLines.push(...splitIntoFittingLines(p, activeFont))
    }
  }
  return wrappedLines
}

const fitRawTextToCapacity = (rawText: string, currentFont?: string | null): { fittedText: string; isLimitReached: boolean } => {
  if (!rawText) {
    return { fittedText: '', isLimitReached: false }
  }
  
  const activeFont = currentFont !== undefined ? currentFont : draftFont.value
  const maxLines = getMaxAllowedLines()
  const wrapped = getWrappedLines(rawText, activeFont)
  
  if (wrapped.length <= maxLines) {
    return { fittedText: rawText, isLimitReached: false }
  }
  
  // Truncate rawText character-by-character from the end until it fits within maxLines on the tumbler
  let low = 0
  let high = rawText.length
  let bestFit = ''
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const candidate = rawText.slice(0, mid)
    if (getWrappedLines(candidate, activeFont).length <= maxLines) {
      bestFit = candidate
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  
  return {
    fittedText: bestFit,
    isLimitReached: true
  }
}

const previewDraftText = computed(() => {
  const font = draftFont.value
  const text = draftText.value
  if (!text) return ''
  const wrapped = getWrappedLines(text, font)
  const maxLines = getMaxAllowedLines()
  return wrapped.slice(0, maxLines).join('\n')
})

const previewAppliedText = computed(() => {
  const font = appliedState.value.font
  const text = appliedState.value.text
  if (!text) return ''
  const wrapped = getWrappedLines(text, font)
  const maxLines = getMaxAllowedLines()
  return wrapped.slice(0, maxLines).join('\n')
})

watch([draftFontSize, draftFont, draftOrientation, draftGraphicSize, draftGraphicPlacement], () => {
  const baseText = rawDraftText.value || draftText.value
  if (baseText) {
    const { fittedText, isLimitReached } = fitRawTextToCapacity(baseText, draftFont.value)
    draftText.value = fittedText
    isTextLimitReached.value = isLimitReached
  }
})

const formattedDraftVerticalLines = computed(() => {
  if (!previewDraftText.value) return []
  return previewDraftText.value.split('\n')
})

const formattedAppliedVerticalLines = computed(() => {
  if (!previewAppliedText.value) return []
  return previewAppliedText.value.split('\n')
})

const availableSizes = computed(() => {
  return ['30 oz', '40 oz', '50 oz', '64 oz']
})

const activeBlankImage = computed(() => {
  if (selectedColor.value?.blankImage) return selectedColor.value.blankImage
  if (props.product.id === 'iceflow-flip-straw' || props.product.handle?.includes('iceflow')) {
    return blankIceflowImg
  }
  return quencherGreenBlankImg
})

const hasPersonalization = computed(() => {
  return Boolean(appliedState.value.text.trim() || appliedState.value.artwork || appliedState.value.uploadedFile)
})

const isApplyActive = computed(() => {
  return draftText.value.trim().length > 0
})

const allSpecialGraphics = computed(() => uniqueGraphics)

const currentTabGraphics = computed(() => {
  if (activeSpecialTab.value === 'juventus') return sportsGraphics
  if (activeSpecialTab.value === 'outdoor') return petNatureGraphics
  return celebrationsGraphics
})

const currentCategoryTabGraphics = computed(() => {
  if (activeCategoryTab.value === 'celebration') return celebrationsGraphics
  if (activeCategoryTab.value === 'family') return familyGraphics
  if (activeCategoryTab.value === 'holiday') return holidayGraphics
  if (activeCategoryTab.value === 'pet-nature') return petNatureGraphics
  if (activeCategoryTab.value === 'sports') return sportsGraphics
  if (activeCategoryTab.value === 'zodiac') return zodiacGraphics
  return uniqueGraphics
})

// Collab Info Bottom Modal (Figma Node 5711:7623)
const isCollabInfoModalOpen = ref(false)

const openCollabInfoModal = () => {
  isCollabInfoModalOpen.value = true
}

const closeCollabInfoModal = () => {
  isCollabInfoModalOpen.value = false
}

const currentCollabCampaign = computed(() => {
  const currentArt = selectedArtwork.value || appliedState.value.artwork
  if (currentArt) {
    const item = getGraphicById(currentArt)
    if (item?.category === 'artist-drop' || liunicGraphics.some(g => g.id === currentArt)) {
      return graphicCampaigns.find(c => c.id === 'artist-drop') || graphicCampaigns[0]
    }
    if (item?.category === 'outdoor' || natureGraphics.some(g => g.id === currentArt)) {
      return graphicCampaigns.find(c => c.id === 'outdoor') || graphicCampaigns[0]
    }
  }
  if (activeSpecialTab.value === 'liunic') {
    return graphicCampaigns.find(c => c.id === 'artist-drop') || graphicCampaigns[0]
  }
  return graphicCampaigns[0] // Default Juventus
})

const selectedArtworkObj = computed(() => {
  if (!selectedArtwork.value) return null
  return getGraphicById(selectedArtwork.value)
})

const currentSelectedArtworkName = computed(() => {
  if (selectedArtworkObj.value?.name) return selectedArtworkObj.value.name
  if (galleryView.value === 'top5') return 'Top 5 Most Used Graphics'
  if (galleryView.value === 'categories') return 'Artwork Categories'
  return activeSpecialTab.value === 'juventus' ? 'Juventus' : 'Liunic on Things'
})

const currentSelectedArtworkSubtext = computed(() => {
  return selectedArtworkObj.value?.subtext || 'Stanley1913'
})

const getArtworkImage = (id: string | null) => getGraphicImage(id)

const isSpecialGraphic = (id: string | null) => {
  if (!id) return false
  const item = getGraphicById(id)
  if (!item) return false
  return Boolean(item.category)
}

const selectedFontName = computed(() => {
  const fontObj = fontOptions.find(f => f.class === appliedState.value.font)
  return fontObj ? fontObj.name : 'Stanley Favorite'
})

const placementSummaryText = computed(() => {
  const place = (appliedState.value.placement || 'center')
  const capitalizedPlace = place.charAt(0).toUpperCase() + place.slice(1)
  
  if (appliedState.value.text && (appliedState.value.artwork || appliedState.value.uploadedFile)) {
    const stackText = appliedState.value.stackOrder === 'graphic-top' ? 'Graphic Above Text' : 'Text Above Graphic'
    return `${capitalizedPlace} — ${stackText}`
  } else if (appliedState.value.text) {
    const orientText = appliedState.value.orientation === 'vertical' ? 'Vertical Text' : 'Horizontal Text'
    return `${capitalizedPlace} — ${orientText}`
  } else if (appliedState.value.artwork) {
    return `${capitalizedPlace} — Custom Graphic`
  } else if (appliedState.value.uploadedFile) {
    return `${capitalizedPlace} — Uploaded Logo`
  }
  return `${capitalizedPlace}`
})

const hasUnsavedEdits = computed(() => {
  if (selectedSubCategory.value === 'text') {
    const currentText = (draftText.value || '').trim()
    const appliedText = (appliedState.value.text || '').trim()
    if (currentText !== appliedText) return true
    if (draftFont.value !== (appliedState.value.font || fontOptions[0].class)) return true
    if (draftFontSize.value !== appliedState.value.fontSize) return true
    if (draftPlacement.value !== (appliedState.value.placement || 'center')) return true
    if (draftOrientation.value !== appliedState.value.orientation) return true
    return false
  }
  if (selectedSubCategory.value === 'gallery') {
    const currentArt = selectedArtwork.value || null
    const appliedArt = appliedState.value.artwork || null
    if (currentArt !== appliedArt) return true
    if (draftGraphicSize.value !== (appliedState.value.graphicSize || 'M')) return true
    if (draftGraphicPlacement.value !== (appliedState.value.graphicPlacement || 'center')) return true
    return false
  }
  if (selectedSubCategory.value === 'upload') {
    return uploadedFileName.value !== appliedState.value.uploadedFile
  }
  return false
})

// Floating Action Buttons Timers & Watchers
const clearSpecialFloatingTimers = () => {
  if (specialFloatingTimer1) {
    clearTimeout(specialFloatingTimer1)
    specialFloatingTimer1 = null
  }
  if (specialFloatingTimer2) {
    clearTimeout(specialFloatingTimer2)
    specialFloatingTimer2 = null
  }
}

const triggerFloatingButtonsAutoExpand = () => {
  clearSpecialFloatingTimers()
  // Step 1: Start at default collapsed state (Variant 1) for 2 seconds
  isSpecialFloatingExpanded.value = false

  specialFloatingTimer1 = setTimeout(() => {
    // Step 2: Expand to Variant 2 for 2 seconds
    isSpecialFloatingExpanded.value = true

    specialFloatingTimer2 = setTimeout(() => {
      // Step 3: Return to default collapsed state (Variant 1)
      isSpecialFloatingExpanded.value = false
    }, 2000)
  }, 2000)
}

const activeOrientation = computed(() => {
  if (selectedSubCategory.value === 'text') return draftOrientation.value
  return appliedState.value.orientation
})

const activePlacement = computed(() => {
  if (selectedSubCategory.value === 'gallery' || (!hasTextPresent.value && hasGraphicPresent.value)) {
    return appliedState.value.graphicPlacement || draftGraphicPlacement.value || 'center'
  }
  if (selectedSubCategory.value === 'text') return draftPlacement.value
  return appliedState.value.placement || 'center'
})

const hasTextPresent = computed(() => {
  return Boolean(appliedState.value.text.trim() || draftText.value.trim() || selectedSubCategory.value === 'text')
})

const hasGraphicPresent = computed(() => {
  return Boolean(appliedState.value.artwork || selectedArtwork.value || appliedState.value.uploadedFile)
})

const hasBothPresent = computed(() => {
  const hasTxt = Boolean(appliedState.value.text.trim() || draftText.value.trim())
  const hasArt = Boolean(appliedState.value.artwork || selectedArtwork.value || appliedState.value.uploadedFile)
  return hasTxt && hasArt
})

const hasBothApplied = computed(() => {
  const hasTxt = Boolean(appliedState.value.text.trim())
  const hasArt = Boolean(appliedState.value.artwork || appliedState.value.uploadedFile)
  return hasTxt && hasArt
})

const isTextFullZone = computed(() => {
  const text = (draftText.value || appliedState.value.text || '').trim()
  if (!text) return false
  if (activeOrientation.value === 'vertical') return true
  const maxLines = getMaxAllowedLines()
  const font = draftFont.value || appliedState.value.font
  const wrapped = getWrappedLines(text, font)
  return wrapped.length >= Math.min(4, maxLines)
})

const handleSetOrientation = (val: 'horizontal' | 'vertical') => {
  appliedState.value.orientation = val
  draftOrientation.value = val
}

const handleSetPlacement = (val: 'top' | 'bottom' | 'center' | 'left' | 'right') => {
  if (hasBothPresent.value) {
    appliedState.value.graphicPlacement = val
    draftGraphicPlacement.value = val
    if (val === 'top') {
      appliedState.value.stackOrder = 'graphic-top'
      stackOrder.value = 'graphic-top'
    } else if (val === 'bottom') {
      appliedState.value.stackOrder = 'text-top'
      stackOrder.value = 'text-top'
    }
    return
  }
  if (selectedSubCategory.value === 'gallery' || (!hasTextPresent.value && hasGraphicPresent.value)) {
    appliedState.value.graphicPlacement = val
    draftGraphicPlacement.value = val
  } else {
    appliedState.value.placement = val
    draftPlacement.value = val
  }
}

const handleSetStackOrder = (val: 'graphic-top' | 'text-top') => {
  appliedState.value.stackOrder = val
  stackOrder.value = val
  const gPos = val === 'graphic-top' ? 'top' : 'bottom'
  appliedState.value.graphicPlacement = gPos
  draftGraphicPlacement.value = gPos
}

const handleSetGraphicSize = (val: 'S' | 'M' | 'L') => {
  appliedState.value.graphicSize = val
  draftGraphicSize.value = val
}

const isFontSizeDisabled = (_size: 'S' | 'M' | 'L' | 'XL') => {
  return false
}

const handleSelectFontSize = (size: 'S' | 'M' | 'L' | 'XL') => {
  draftFontSize.value = size
}

const getDynamicGraphicSize = (
  _text: string,
  _orientation: 'horizontal' | 'vertical',
  _fontSize: 'S' | 'M' | 'L' | 'XL',
  graphicSize: 'S' | 'M' | 'L' = 'M'
) => {
  const profile = productProfile.value

  const fixedSize =
    graphicSize === 'S'
      ? profile.smallGraphicHeight
      : graphicSize === 'L'
      ? profile.largeGraphicHeight
      : profile.standardGraphicHeight

  return {
    width: `${fixedSize}px`,
    height: `${fixedSize}px`,
    maxWidth: '100%',
    maxHeight: '100%',
  }
}

const dynamicAppliedGraphicStyle = computed(() => {
  return getDynamicGraphicSize(
    appliedState.value.text,
    appliedState.value.orientation,
    appliedState.value.fontSize,
    appliedState.value.graphicSize
  )
})

const dynamicDraftGraphicStyle = computed(() => {
  return getDynamicGraphicSize(
    draftText.value,
    draftOrientation.value,
    draftFontSize.value,
    appliedState.value.graphicSize || draftGraphicSize.value
  )
})

const dynamicAppliedGraphicContainerStyle = computed(() => {
  const gPlacement = appliedState.value.graphicPlacement || 'center'
  const gSize = appliedState.value.graphicSize || 'M'
  const gHeight = gSize === 'L' ? (productProfile.value?.largeGraphicHeight || 182) : gSize === 'S' ? (productProfile.value?.smallGraphicHeight || 100) : (productProfile.value?.standardGraphicHeight || 135)

  // The graphic placement is strictly fixed based on user input on graphic setting (0 inner padding)
  if (gPlacement === 'top') {
    return { position: 'absolute', top: '0px', left: '0px', right: '0px', height: `${gHeight}px`, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }
  }
  if (gPlacement === 'bottom') {
    return { position: 'absolute', bottom: '0px', left: '0px', right: '0px', height: `${gHeight}px`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }
  }
  return { position: 'absolute', top: '50%', left: '0px', right: '0px', height: `${gHeight}px`, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
})

const dynamicAppliedTextContainerStyle = computed(() => {
  const hasGraphic = Boolean(appliedState.value.artwork || appliedState.value.uploadedFile)
  const gPlacement = appliedState.value.graphicPlacement || 'center'
  const gSize = appliedState.value.graphicSize || 'M'
  const gHeight = gSize === 'L' ? (productProfile.value?.largeGraphicHeight || 182) : gSize === 'S' ? (productProfile.value?.smallGraphicHeight || 100) : (productProfile.value?.standardGraphicHeight || 135)
  const placement = appliedState.value.placement || 'center'
  
  if (!hasGraphic) {
    return { position: 'absolute', top: '0px', bottom: '0px', left: '0px', right: '0px' }
  }

  // Graphic at top: text fills remaining space below graphic (0 gap, 0 inner padding)
  if (gPlacement === 'top') {
    return { position: 'absolute', top: `${gHeight}px`, bottom: '0px', left: '0px', right: '0px' }
  }

  // Graphic at bottom: text fills remaining space above graphic (0 gap, 0 inner padding)
  if (gPlacement === 'bottom') {
    return { position: 'absolute', top: '0px', bottom: `${gHeight}px`, left: '0px', right: '0px' }
  }

  // Graphic at center:
  if (placement === 'top') {
    return { position: 'absolute', top: '0px', bottom: `calc(50% + ${Math.round(gHeight / 2)}px)`, left: '0px', right: '0px' }
  } else {
    return { position: 'absolute', top: `calc(50% + ${Math.round(gHeight / 2)}px)`, bottom: '0px', left: '0px', right: '0px' }
  }
})

const dynamicDraftGraphicContainerStyle = computed(() => {
  const gPlacement = draftGraphicPlacement.value || appliedState.value.graphicPlacement || 'center'
  const gSize = draftGraphicSize.value || appliedState.value.graphicSize || 'M'
  const gHeight = gSize === 'L' ? (productProfile.value?.largeGraphicHeight || 182) : gSize === 'S' ? (productProfile.value?.smallGraphicHeight || 100) : (productProfile.value?.standardGraphicHeight || 135)

  // The graphic placement is strictly fixed based on user input on graphic setting (0 inner padding)
  if (gPlacement === 'top') {
    return { position: 'absolute', top: '0px', left: '0px', right: '0px', height: `${gHeight}px`, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }
  }
  if (gPlacement === 'bottom') {
    return { position: 'absolute', bottom: '0px', left: '0px', right: '0px', height: `${gHeight}px`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }
  }
  return { position: 'absolute', top: '50%', left: '0px', right: '0px', height: `${gHeight}px`, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
})

const dynamicDraftTextContainerStyle = computed(() => {
  const hasGraphic = Boolean(appliedState.value.artwork || appliedState.value.uploadedFile || selectedArtwork.value)
  const gPlacement = draftGraphicPlacement.value || appliedState.value.graphicPlacement || 'center'
  const gSize = draftGraphicSize.value || appliedState.value.graphicSize || 'M'
  const gHeight = gSize === 'L' ? (productProfile.value?.largeGraphicHeight || 182) : gSize === 'S' ? (productProfile.value?.smallGraphicHeight || 100) : (productProfile.value?.standardGraphicHeight || 135)
  const placement = draftPlacement.value || appliedState.value.placement || 'center'
  
  if (!hasGraphic) {
    return { position: 'absolute', top: '0px', bottom: '0px', left: '0px', right: '0px' }
  }

  // Graphic at top: text fills remaining space below graphic (0 gap, 0 inner padding)
  if (gPlacement === 'top') {
    return { position: 'absolute', top: `${gHeight}px`, bottom: '0px', left: '0px', right: '0px' }
  }

  // Graphic at bottom: text fills remaining space above graphic (0 gap, 0 inner padding)
  if (gPlacement === 'bottom') {
    return { position: 'absolute', top: '0px', bottom: `${gHeight}px`, left: '0px', right: '0px' }
  }

  // Graphic at center:
  if (placement === 'top') {
    return { position: 'absolute', top: '0px', bottom: `calc(50% + ${Math.round(gHeight / 2)}px)`, left: '0px', right: '0px' }
  } else {
    return { position: 'absolute', top: `calc(50% + ${Math.round(gHeight / 2)}px)`, bottom: '0px', left: '0px', right: '0px' }
  }
})

watch([galleryView, () => currentStep.value, () => selectedSubCategory.value], ([newGalleryView, newStep, newSubCat]) => {
  if (newSubCat === 'text') {
    triggerFloatingButtonsAutoExpand()
  } else if (newSubCat === 'gallery' && (newGalleryView === 'special-graphic' || newGalleryView === 'top5' || newGalleryView === 'categories')) {
    triggerFloatingButtonsAutoExpand()
  } else if (!newSubCat && newStep === 2 && hasPersonalization.value) {
    triggerFloatingButtonsAutoExpand()
  } else {
    clearSpecialFloatingTimers()
    isSpecialFloatingExpanded.value = false
  }
})

watch(hasPersonalization, (hasPers) => {
  if (currentStep.value === 2 && !selectedSubCategory.value && hasPers) {
    triggerFloatingButtonsAutoExpand()
  }
})

watch(() => props.product, (newProduct) => {
  if (newProduct && newProduct.colors?.length) {
    selectedColor.value = props.initialColor || newProduct.colors[0]
    if (newProduct.sizes?.length) {
      selectedSize.value = newProduct.sizes[0] as any
    }
  }
})

watch(() => props.initialColor, (newColor) => {
  if (newColor) {
    selectedColor.value = newColor
  }
})

const handleMainScroll = (e: Event) => {
  const target = e.target as HTMLElement
  if (!target) return

  const currentScrollTop = target.scrollTop
  const scrollDelta = currentScrollTop - lastScrollTop

  // At top of scroll
  if (currentScrollTop <= 15) {
    isScrollHidden.value = false
  } else if (scrollDelta > 6 && currentScrollTop > 30) {
    // Scrolling DOWN -> hide sticky bottom button
    isScrollHidden.value = true
  } else if (scrollDelta < -6) {
    // Scrolling UP -> show sticky bottom button
    isScrollHidden.value = false
  }

  // If reached bottom of content -> show button
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 25) {
    isScrollHidden.value = false
  }

  lastScrollTop = currentScrollTop
}

const startSpecialBannerAutoplay = () => {
  stopSpecialBannerAutoplay()
  specialBannerInterval = setInterval(() => {
    if (showSpecialGraphicPopup.value) {
      specialSlideIndex.value = (specialSlideIndex.value + 1) % graphicCampaigns.length
    }
  }, 3500)
}

const stopSpecialBannerAutoplay = () => {
  if (specialBannerInterval) {
    clearInterval(specialBannerInterval)
    specialBannerInterval = null
  }
}

const openSpecialGraphicPopup = () => {
  specialSlideIndex.value = 0
  showSpecialGraphicPopup.value = true
  startSpecialBannerAutoplay()
}

const closeSpecialGraphicPopup = () => {
  showSpecialGraphicPopup.value = false
  stopSpecialBannerAutoplay()
  // Send user directly to Special Graphic sub-menu
  selectedSubCategory.value = 'gallery'
  galleryView.value = 'special-graphic'
}

const handlePopupTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
}

const handlePopupTouchEnd = (e: TouchEvent) => {
  const touchEndX = e.changedTouches[0].clientX
  const diff = touchStartX.value - touchEndX
  if (diff > 35) {
    // Swipe left -> next slide
    specialSlideIndex.value = (specialSlideIndex.value + 1) % graphicCampaigns.length
  } else if (diff < -35) {
    // Swipe right -> previous slide
    specialSlideIndex.value = (specialSlideIndex.value - 1 + graphicCampaigns.length) % graphicCampaigns.length
  }
}

const exploreCampaign = (campaignId: string) => {
  closeSpecialGraphicPopup()
  if (campaignId === 'juventus') {
    activeSpecialTab.value = 'juventus'
    openSpecialGraphicView()
  } else if (campaignId === 'artist-drop') {
    activeSpecialTab.value = 'liunic'
    openSpecialGraphicView()
  } else if (campaignId === 'outdoor') {
    activeCategoryTab.value = 'nature'
    openCategoriesView()
  } else {
    openSpecialGraphicView()
  }
}

const openGalleryModal = () => {
  if (firstCustomizationType.value === null && !appliedState.value.text.trim() && !draftText.value.trim()) {
    firstCustomizationType.value = 'graphic'
  }
  selectedArtwork.value = appliedState.value.artwork
  draftGraphicSize.value = appliedState.value.graphicSize || 'M'
  draftGraphicPlacement.value = appliedState.value.graphicPlacement || 'center'
  galleryView.value = 'menu'
  selectedSubCategory.value = 'gallery'
}

const openSpecialGraphicView = () => {
  galleryView.value = 'special-graphic'
  triggerFloatingButtonsAutoExpand()
}

const openTop5View = () => {
  galleryView.value = 'top5'
  triggerFloatingButtonsAutoExpand()
}

const openCategoriesView = () => {
  galleryView.value = 'categories'
  triggerFloatingButtonsAutoExpand()
}

const handleCancelGallery = () => {
  if (hasUnsavedEdits.value) {
    showDiscardModal.value = true
  } else {
    confirmDiscard()
  }
}

const handleApplyGallery = () => {
  appliedState.value.artwork = selectedArtwork.value
  appliedState.value.graphicPlacement = draftGraphicPlacement.value || appliedState.value.graphicPlacement || 'center'
  appliedState.value.graphicSize = draftGraphicSize.value || appliedState.value.graphicSize || 'M'
  selectedSubCategory.value = null
  galleryView.value = 'menu'
}

const setOrientation = (val: 'horizontal' | 'vertical') => {
  if (draftOrientation.value === val) return
  draftOrientation.value = val
  if (val === 'vertical') {
    draftPlacement.value = 'center'
  } else {
    if (!draftPlacement.value || draftPlacement.value === 'left' || draftPlacement.value === 'right') {
      draftPlacement.value = 'center'
    }
  }
}

const openTextEditor = () => {
  if (firstCustomizationType.value === null && !appliedState.value.artwork && !appliedState.value.uploadedFile && !selectedArtwork.value) {
    firstCustomizationType.value = 'text'
  }
  rawDraftText.value = appliedState.value.text
  draftText.value = appliedState.value.text
  draftFont.value = appliedState.value.font || fontOptions[0].class
  draftFontSize.value = appliedState.value.fontSize || 'M'
  draftPlacement.value = appliedState.value.placement || 'center'
  draftOrientation.value = appliedState.value.orientation || 'horizontal'

  textActiveTab.value = 'style'
  isTextFocused.value = true
  selectedSubCategory.value = 'text'
  nextTick(() => {
    textInputRef.value?.focus()
  })
}

const showSpaceModal = ref(false)
const pendingArtwork = ref<string | null>(null)

const canFitGraphicWithCurrentText = (targetGraphicSize?: 'S' | 'M' | 'L'): boolean => {
  const text = draftText.value || appliedState.value.text
  if (!text) return true
  
  const gSize = targetGraphicSize || draftGraphicSize.value || appliedState.value.graphicSize || 'M'
  const totalZoneHeight = 280
  const gHeight = gSize === 'L' ? (productProfile.value?.largeGraphicHeight || 182) : gSize === 'S' ? (productProfile.value?.smallGraphicHeight || 100) : (productProfile.value?.standardGraphicHeight || 135)
  const availableHeightWithGraphic = Math.max(40, totalZoneHeight - gHeight)
  
  const fontSize = draftFontSize.value
  const fontPx = gSize === 'L'
    ? (fontSize === 'S' ? 22 : fontSize === 'M' ? 26 : fontSize === 'L' ? 31 : 41)
    : (fontSize === 'S' ? 24 : fontSize === 'M' ? 34 : fontSize === 'L' ? 43 : 55)
    
  if (draftOrientation.value === 'vertical') {
    const wrapped = getWrappedLines(text, draftFont.value)
    for (const col of wrapped) {
      const colLen = measureTextWidth(col, draftFont.value, fontPx, true)
      if (colLen > availableHeightWithGraphic) {
        return false
      }
    }
    return true
  } else {
    const lineHeight = Math.max(18, fontPx * 0.94)
    const maxLinesWithGraphic = Math.max(1, Math.floor(availableHeightWithGraphic / lineHeight))
    const wrapped = getWrappedLines(text, draftFont.value)
    return wrapped.length <= maxLinesWithGraphic
  }
}

const canFitGraphic = computed(() => canFitGraphicWithCurrentText())

const handleSelectArtwork = (artId: string) => {
  if (selectedArtwork.value === artId) {
    selectedArtwork.value = null
    return
  }
  
  if (!canFitGraphicWithCurrentText()) {
    pendingArtwork.value = artId
    showSpaceModal.value = true
    return
  }
  
  selectedArtwork.value = artId
}

const openMobileTextToAdjust = () => {
  showSpaceModal.value = false
  openTextEditor()
}

const openGraphicGallery = () => {
  appliedState.value.text = draftText.value
  appliedState.value.font = draftFont.value
  appliedState.value.fontSize = draftFontSize.value
  appliedState.value.orientation = draftOrientation.value
  appliedState.value.placement = draftPlacement.value

  // Position graphic cleanly in the open slot without shifting text
  if (draftPlacement.value === 'top') {
    draftGraphicPlacement.value = 'bottom'
    appliedState.value.graphicPlacement = 'bottom'
    stackOrder.value = 'text-top'
    appliedState.value.stackOrder = 'text-top'
  } else if (draftPlacement.value === 'bottom') {
    draftGraphicPlacement.value = 'top'
    appliedState.value.graphicPlacement = 'top'
    stackOrder.value = 'graphic-top'
    appliedState.value.stackOrder = 'graphic-top'
  }

  const targetArtId = pendingArtwork.value || appliedState.value.artwork || selectedArtwork.value || props.initialArtwork
  if (targetArtId) {
    selectedArtwork.value = targetArtId
    appliedState.value.artwork = targetArtId
    pendingArtwork.value = null

    if (celebrationsGraphics.some(g => g.id === targetArtId)) {
      activeCategoryTab.value = 'celebration'
      galleryView.value = 'categories'
    } else if (familyGraphics.some(g => g.id === targetArtId)) {
      activeCategoryTab.value = 'family'
      galleryView.value = 'categories'
    } else if (holidayGraphics.some(g => g.id === targetArtId)) {
      activeCategoryTab.value = 'holiday'
      galleryView.value = 'categories'
    } else if (petNatureGraphics.some(g => g.id === targetArtId)) {
      activeCategoryTab.value = 'pet-nature'
      galleryView.value = 'categories'
    } else if (sportsGraphics.some(g => g.id === targetArtId)) {
      activeCategoryTab.value = 'sports'
      galleryView.value = 'categories'
    } else if (zodiacGraphics.some(g => g.id === targetArtId)) {
      activeCategoryTab.value = 'zodiac'
      galleryView.value = 'categories'
    } else {
      activeCategoryTab.value = 'all'
      galleryView.value = 'categories'
    }
  }

  selectedSubCategory.value = 'gallery'
}

const applyPendingArtworkAndCloseText = () => {
  openGraphicGallery()
}

const cancelTextEdits = () => {
  if (hasUnsavedEdits.value) {
    showDiscardModal.value = true
  } else {
    selectedSubCategory.value = null
  }
}

const applyTextEdits = () => {
  if (!isApplyActive.value) return
  appliedState.value.text = draftText.value
  appliedState.value.font = draftFont.value
  appliedState.value.fontSize = draftFontSize.value
  appliedState.value.placement = draftPlacement.value
  appliedState.value.orientation = draftOrientation.value
  selectedSubCategory.value = null
}

const handleTextInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  if (!target) return
  const candidate = target.value
  rawDraftText.value = candidate
  const { fittedText, isLimitReached } = fitRawTextToCapacity(candidate, draftFont.value)
  draftText.value = fittedText
  isTextLimitReached.value = isLimitReached
  if (target.value !== fittedText) {
    target.value = fittedText
  }
}

const handleAttemptClose = () => {
  showCloseConfirmModal.value = true
}

const confirmStudioExit = () => {
  showCloseConfirmModal.value = false
  emit('close')
}

const applyEdits = () => {
  appliedState.value.artwork = selectedArtwork.value
  appliedState.value.uploadedFile = uploadedFileName.value
  appliedState.value.stackOrder = stackOrder.value
  selectedSubCategory.value = null
}

const confirmDiscard = () => {
  // Revert all draft fields back to applied state snapshot
  rawDraftText.value = appliedState.value.text
  draftText.value = appliedState.value.text
  draftFont.value = appliedState.value.font || fontOptions[0].class
  draftFontSize.value = appliedState.value.fontSize || 'M'
  draftPlacement.value = appliedState.value.placement || 'center'
  draftOrientation.value = appliedState.value.orientation || 'horizontal'
  draftGraphicSize.value = appliedState.value.graphicSize || 'M'
  draftGraphicPlacement.value = appliedState.value.graphicPlacement || 'center'

  selectedArtwork.value = appliedState.value.artwork
  uploadedFileName.value = appliedState.value.uploadedFile
  stackOrder.value = appliedState.value.stackOrder
  showDiscardModal.value = false
  selectedSubCategory.value = null
  galleryView.value = 'menu'
}

const handleRemoveArtwork = (e?: Event) => {
  if (e) e.stopPropagation()
  selectedArtwork.value = null
  appliedState.value.artwork = null
}

const handleRemoveText = (e?: Event) => {
  if (e) e.stopPropagation()
  engravingText.value = ''
  selectedFont.value = null
  appliedState.value.text = ''
  appliedState.value.font = null
}

const handleRemoveUpload = (e?: Event) => {
  if (e) e.stopPropagation()
  uploadedFileName.value = null
  appliedState.value.uploadedFile = null
}

const handleSimulatedUpload = () => {
  uploadedFileName.value = 'custom_logo_vector.svg'
}

onUnmounted(() => {
  stopSpecialBannerAutoplay()
  clearSpecialFloatingTimers()
})

const handleAddToCart = () => {
  emit('add-to-cart', {
    product: props.product,
    color: selectedColor.value,
    size: selectedSize.value,
    engravingText: appliedState.value.text,
    font: appliedState.value.font,
    fontSize: appliedState.value.fontSize,
    graphicSize: appliedState.value.graphicSize,
    artwork: appliedState.value.artwork,
    orientation: appliedState.value.orientation,
    placement: appliedState.value.placement,
    stackOrder: appliedState.value.stackOrder,
    uploadedFile: appliedState.value.uploadedFile
  })
}

const handleNextStep = () => {
  if (currentStep.value === 1) {
    currentStep.value = 2
    if (selectedArtwork.value) {
      openGraphicGallery()
    }
    return
  }
  if (currentStep.value === 2 && !hasPersonalization.value) {
    return
  }
  if (currentStep.value < 3) {
    currentStep.value++
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="slide-modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-[#f4f4f4] flex justify-center font-['Stanley_Favorit',sans-serif] select-none overflow-hidden"
        :data-node-id="currentStep === 1 ? '5238:8417' : '5256:8575'"
        :data-name="currentStep === 1 ? 'Design Studio - Step 1' : 'Design Studio - Step 2'"
      >
        <div class="w-full max-w-[430px] bg-white h-full max-h-[100dvh] flex flex-col shadow-2xl relative overflow-hidden">
          
          <!-- 1. Header (75% Opacity with Backdrop Blur Style - No Border Line) -->
          <header class="absolute top-0 left-0 right-0 z-30 bg-white/75 backdrop-blur-md px-[16px] h-[64px] flex items-center justify-between" data-node-id="5655:7301" data-name="Title Text">
            <div class="flex items-center" data-node-id="5655:7302" data-name="Header Container">
              <div class="flex flex-col font-['Stanley_Favorit',sans-serif] font-medium text-[20px] text-black tracking-[-0.6px] leading-[normal]" data-node-id="5655:7304">
                <span v-if="currentStep === 1">Step 1: Setup your base model</span>
                <span v-else-if="currentStep === 2">Step 2: Personalize</span>
                <span v-else>Step 3: Review your custom</span>
              </div>
            </div>

            <!-- Close Button (Figma Node 5655:7305) -->
            <button
              @click="handleAttemptClose"
              class="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 active:scale-90 text-neutral-800 hover:text-black flex items-center justify-center transition-all cursor-pointer flex-none"
              data-node-id="5655:7305"
              data-name="lets-icons:close-round-duotone"
              aria-label="Close customizer"
            >
              <X :size="18" :stroke-width="2" />
            </button>
          </header>

          <!-- 2. Main Scrollable Container with Auto-hide Scroll Listener (Starts from top behind 80% header overlay) -->
          <main
            @scroll.passive="handleMainScroll"
            class="flex-1 overflow-y-auto overscroll-contain flex flex-col pb-28"
            :class="selectedSubCategory ? 'overflow-hidden pointer-events-none' : ''"
            data-node-id="5256:8576"
            data-name="Container"
          >
            
            <!-- 2.1 Banner Image Stage (Exact Same Port and Container as Browse Gallery) -->
            <div class="h-[520px] sm:h-[560px] flex items-center justify-center relative flex-none bg-[#fafafa] border-b border-neutral-100/80 overflow-hidden" data-node-id="5256:8577" data-name="Banner Image Container">
              
              <!-- Tumbler Model Visual (Scaled up 30% larger on Step 2) -->
              <div
                class="relative h-full w-full flex items-center justify-center pointer-events-none overflow-hidden transition-all duration-300"
                :class="currentStep === 1 ? 'pt-[64px] pb-[20px] px-[20px]' : ''"
                data-node-id="5256:8578"
                data-name="Iceflow copy 1"
              >
                <img
                  :src="currentStep >= 2 ? activeBlankImage : (selectedColor?.image || product.defaultImage)"
                  :alt="product.name"
                  class="max-h-full max-w-full object-contain filter drop-shadow-lg transition-all duration-300 transform-gpu"
                  :class="currentStep === 2 ? 'scale-[1.95] sm:scale-[2.0] translate-y-7 sm:translate-y-8' : 'scale-100'"
                />

                <!-- Scaled Engraving Canvas Wrapper (Exact same alignment and scale as Browse Gallery) -->
                <div
                  v-if="currentStep >= 2"
                  class="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div
                    class="relative origin-center transform-gpu pointer-events-auto transition-all duration-300"
                    :class="currentStep === 2 ? 'scale-[1.10] sm:scale-[1.12]' : 'scale-[0.564]'"
                  >
                    <!-- Dashed Bounding Box (w-[191px] h-[280px]) placed squarely inside green area under lid -->
                    <div
                      class="w-[191px] h-[280px] rounded-[8px] flex p-0 pointer-events-auto transition-all overflow-hidden no-scrollbar relative"
                      :class="[
                        currentStep === 2
                          ? (isProductColorLight ? 'border border-dashed border-neutral-800/80 cursor-pointer' : 'border border-dashed border-white/80 cursor-pointer')
                          : 'border border-transparent pointer-events-none',
                        'flex-col items-center justify-between'
                      ]"
                      @click="currentStep === 2 ? openTextEditor() : null"
                    >
                      <!-- If user haven't set any text/graphic (blank live preview with helper text) -->
                      <div
                        v-if="!appliedState.text && !appliedState.artwork && !appliedState.uploadedFile"
                        class="w-full h-full flex flex-col items-center justify-center text-center p-0 select-none"
                      >
                        <p
                          class="font-['Stanley_Favorit',sans-serif] text-[14px] font-medium leading-normal tracking-tight whitespace-nowrap"
                          :class="isProductColorLight ? 'text-neutral-800/80' : 'text-white/90 drop-shadow-xs'"
                        >
                          Your design will appear here
                        </p>
                      </div>

                      <!-- Applied Graphic / Text if already customized -->
                      <div
                        v-else
                        class="relative transition-all overflow-hidden no-scrollbar w-full h-full p-0"
                      >
                        <!-- Graphic Layer (Fixed coordinates based on Browse Gallery setup) -->
                        <div
                          v-if="appliedState.artwork"
                          class="absolute transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 flex items-center justify-center pointer-events-none"
                          :style="dynamicAppliedGraphicContainerStyle"
                        >
                          <LaserPreview
                            type="image"
                            :image-src="getArtworkImage(appliedState.artwork)"
                            :image-style="dynamicAppliedGraphicStyle"
                            :placement="appliedState.graphicPlacement || 'center'"
                            :is-light-tumbler="isProductColorLight"
                          />
                        </div>

                        <!-- Uploaded Graphic Layer (if present) -->
                        <div
                          v-if="appliedState.uploadedFile"
                          class="absolute transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 flex items-center justify-center pointer-events-none"
                          :style="dynamicAppliedGraphicContainerStyle"
                        >
                          <div class="w-[70px] h-[70px] flex items-center justify-center opacity-85 mix-blend-multiply border border-dashed border-neutral-700 rounded-lg p-2">
                            <UploadCloud :size="32" class="text-neutral-800" />
                          </div>
                        </div>

                        <!-- Text Layer (Positioned in allocated space without shifting graphic) -->
                        <div
                          v-if="appliedState.text"
                          class="absolute flex flex-col items-center transition-all duration-200 pointer-events-none overflow-visible"
                          :style="dynamicAppliedTextContainerStyle"
                          :class="[
                            appliedState.orientation === 'vertical'
                              ? 'justify-center items-center'
                              : (appliedState.placement === 'top' ? 'justify-start' : appliedState.placement === 'bottom' ? 'justify-end' : 'justify-center')
                          ]"
                        >
                          <LaserPreview
                            type="text"
                            :text="previewAppliedText"
                            :font-class="[appliedState.font || fontOptions[0].class, isFontUppercase(appliedState.font) ? 'uppercase' : ''].join(' ')"
                            :font-size-class="(appliedState.graphicSize === 'L' && appliedState.artwork)
                              ? (appliedState.fontSize === 'S'
                                  ? 'text-[19px]'
                                  : appliedState.fontSize === 'M'
                                  ? 'text-[24px]'
                                  : appliedState.fontSize === 'L'
                                  ? 'text-[29px]'
                                  : 'text-[36px]')
                              : (appliedState.fontSize === 'S'
                                  ? 'text-[24px]'
                                  : appliedState.fontSize === 'M'
                                  ? 'text-[36px]'
                                  : appliedState.fontSize === 'L'
                                  ? 'text-[48px]'
                                  : 'text-[60px]')"
                            :orientation="appliedState.orientation"
                            :vertical-lines="formattedAppliedVerticalLines"
                            :placement="appliedState.placement || 'center'"
                            :is-light-tumbler="isProductColorLight"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Floating Action Buttons on Step 2 Stage (If user has made changes) -->
                <div
                  v-if="currentStep === 2 && hasPersonalization && (isSpecialGraphic(appliedState.artwork) || !hasBothApplied)"
                  class="absolute left-[16px] bottom-[24px] z-20 flex flex-col gap-[8px] items-start pointer-events-auto"
                  data-node-id="5711:7608"
                  data-name="Floating Controls"
                >
                  <!-- Button 1: Info / Special Graphic Campaign (If applied artwork is tagged as special) -->
                  <button
                    v-if="isSpecialGraphic(appliedState.artwork)"
                    type="button"
                    @click="openCollabInfoModal"
                    class="h-[40px] rounded-[9px] backdrop-blur-[6px] bg-white/90 border border-black/10 shadow-[0px_2px_8px_rgba(0,0,0,0.08)] flex items-center transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer text-black hover:bg-white active:scale-95 select-none overflow-hidden transform-gpu"
                    :class="[
                      isSpecialFloatingExpanded ? 'w-[155px] pr-[12px]' : 'w-[40px] pr-0'
                    ]"
                    data-node-id="5711:7605"
                    data-name="Info Button Container"
                    title="Special Graphic Info"
                    aria-label="Special Graphic Info"
                  >
                    <div class="w-[40px] h-[40px] flex items-center justify-center shrink-0">
                      <Info :size="18" class="text-black shrink-0" />
                    </div>
                    <div
                      class="transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden flex items-center shrink-0"
                      :class="[
                        isSpecialFloatingExpanded
                          ? 'max-w-[110px] opacity-100'
                          : 'max-w-0 opacity-0 pointer-events-none'
                      ]"
                    >
                      <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[13px] whitespace-nowrap leading-none text-black pr-1">
                        Special Graphic
                      </span>
                    </div>
                  </button>

                  <!-- Button 2: Adjust (Hidden when both graphic + text are setup and applied) -->
                  <button
                    v-if="!hasBothApplied"
                    type="button"
                    @click="isPositionDrawerOpen = true"
                    class="h-[40px] rounded-[9px] backdrop-blur-[6px] bg-white/90 border border-black/10 shadow-[0px_2px_8px_rgba(0,0,0,0.08)] flex items-center transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer text-black hover:bg-white active:scale-95 select-none overflow-hidden transform-gpu"
                    :class="[
                      isSpecialFloatingExpanded ? 'w-[115px] pr-[12px]' : 'w-[40px] pr-0'
                    ]"
                    data-node-id="5711:7584"
                    data-name="Adjust Button Container"
                    title="Adjust"
                    aria-label="Adjust"
                  >
                    <div class="w-[40px] h-[40px] flex items-center justify-center shrink-0">
                      <SlidersHorizontal :size="18" class="text-black shrink-0" />
                    </div>
                    <div
                      class="transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden flex items-center shrink-0"
                      :class="[
                        isSpecialFloatingExpanded
                          ? 'max-w-[70px] opacity-100'
                          : 'max-w-0 opacity-0 pointer-events-none'
                      ]"
                    >
                      <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[13px] whitespace-nowrap leading-none text-black pr-1">
                        Adjust
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Product Texts Container (Shared by Step 1 and Step 2 matching Figma) -->
            <div class="px-[16px] pt-[20px] flex flex-col gap-[16px]" data-node-id="5256:8579" data-name="Title Text">
              <div class="flex flex-col gap-[16px] items-start w-full" data-node-id="5256:8907" data-name="Product Texts Container">
                
                <!-- Product Title Container with Swap Product Button (Figma Node 5659:7370) -->
                <div class="flex items-center justify-between w-full gap-3" data-node-id="5659:7370" data-name="Product Title Container">
                  <div class="font-['Stanley_Favorit',sans-serif] font-bold text-[20px] text-black leading-tight" data-node-id="5659:7371">
                    <p class="mb-0">{{ product.name.split(' ')[0] }} {{ product.name.split(' ')[1] }}</p>
                    <p>{{ product.name.split(' ').slice(2).join(' ') || 'Flowstate™ Tumbler' }}</p>
                  </div>

                  <!-- Change / Swap Stanley Button (Figma Node 5659:7372) -->
                  <button
                    @click="emit('swap-products')"
                    class="w-[33px] h-[33px] rounded-full bg-white/95 backdrop-blur-[6.6px] border border-[#e5e7eb] shadow-[0px_3.3px_4.95px_0px_rgba(0,0,0,0.08)] flex items-center justify-center active:scale-90 hover:bg-neutral-50 transition-all cursor-pointer flex-none"
                    data-node-id="5659:7372"
                    data-name="Button"
                    title="Change Stanley Model"
                    aria-label="Change product"
                  >
                    <ArrowLeftRight :size="15" class="text-neutral-800" />
                  </button>
                </div>

                <!-- Durations Badge (Figma Node 5256:8914) -->
                <div class="bg-[#f5f5f5] flex items-center gap-[17px] px-[16px] py-[8px] rounded-[8px]" data-node-id="5256:8914" data-name="Durations">
                  <!-- Cold Duration -->
                  <div class="flex items-center gap-[8px]" data-node-id="5256:8915" data-name="Duration">
                    <Snowflake :size="16" class="text-neutral-800" />
                    <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[14px] text-black" data-node-id="5256:8918">
                      11 Hours
                    </span>
                  </div>

                  <!-- Vertical Divider Line -->
                  <div class="h-[21px] w-px bg-neutral-300" data-node-id="5256:8919"></div>

                  <!-- Hot / Ice Cube Duration -->
                  <div class="flex items-center gap-[8px]" data-node-id="5256:8920" data-name="Duration">
                    <Box :size="16" class="text-neutral-800" />
                    <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[14px] text-black" data-node-id="5256:8923">
                      2 Hours
                    </span>
                  </div>
                </div>

                <!-- Price & Free Customization (Figma Node 5256:8925) -->
                <div class="flex items-center gap-[16px] font-['Stanley_Favorit',sans-serif] font-normal text-[14px] text-black" data-node-id="5256:8925" data-name="Price and Customization">
                  <span data-node-id="5256:8926">{{ product.priceFormatted || 'IDR 800.000' }}</span>
                  <span data-node-id="5256:8927" class="text-neutral-700">Free Standard Customization</span>
                </div>
              </div>
            </div>

            <!-- STEP CONTENT WRAPPER WITH FLUID TRANSITION -->
            <Transition name="step-fade" mode="out-in">
              <!-- STEP 1: SETUP BASE MODEL (Figma Node 5238:8417) -->
              <div v-if="currentStep === 1" key="step-1" class="flex flex-col gap-[28px] pt-[20px]">
              
              <!-- Colors and Sizes Section (Figma Node 5256:8542) -->
              <div class="px-[16px] flex flex-col gap-[20px]" data-node-id="5256:8542" data-name="Colors and Sizes">
                
                <!-- Colors Picker (Figma Node 5256:8543) -->
                <div class="flex flex-col gap-[12px]" data-node-id="5256:8543" data-name="Colors Container">
                  <div class="flex items-center gap-[8px] font-['Stanley_Favorit',sans-serif] text-[14px] text-black" data-node-id="5256:8545">
                    <span class="font-normal" data-node-id="5256:8546">Colors:</span>
                    <span class="font-bold" data-node-id="5256:8547">{{ selectedColor.name }}</span>
                  </div>

                  <!-- Color Swatches Grid (Figma Node 5256:8548) -->
                  <div class="flex flex-wrap gap-[12px] items-center" data-node-id="5256:8548" data-name="Color Options">
                    <button
                      v-for="(col, idx) in product.colors"
                      :key="idx"
                      @click="selectedColor = col"
                      class="relative w-[30.33px] h-[30.33px] rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90"
                      :title="col.name"
                      aria-label="Select color"
                    >
                      <!-- Active Outer Ring (Figma Node 5256:8560) -->
                      <span
                        v-if="selectedColor.name === col.name"
                        class="absolute -inset-[3px] rounded-full border border-black pointer-events-none transition-transform"
                      ></span>

                      <!-- Inner Swatch Circle -->
                      <span
                        class="w-full h-full rounded-full border border-black/15 shadow-xs block"
                        :style="{ backgroundColor: col.hex }"
                      ></span>
                    </button>
                  </div>
                </div>

                <!-- Sizes Selector (Figma Node 5256:8563) -->
                <div class="flex flex-col gap-[12px]" data-node-id="5256:8563" data-name="Sizes Container">
                  <div class="font-['Stanley_Favorit',sans-serif] font-normal text-[14px] text-black" data-node-id="5256:8564">
                    Size
                  </div>

                  <!-- Size Pills (Figma Node 5256:8565) -->
                  <div class="flex flex-wrap gap-[12px]" data-node-id="5256:8565" data-name="Size Options">
                    <button
                      v-for="s in availableSizes"
                      :key="s"
                      @click="selectedSize = (s as any)"
                      class="h-[40px] px-[16px] py-[8px] rounded-[4px] font-['Stanley_Favorit',sans-serif] font-normal text-[14px] transition-all cursor-pointer active:scale-95 select-none"
                      :class="[
                        selectedSize === s
                          ? 'bg-black text-white border border-black'
                          : 'bg-white text-black border border-black hover:bg-neutral-50'
                      ]"
                    >
                      {{ s }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 2: PERSONALIZE (Figma Node 5105:1287 & Desktop Exact Alignment) -->
            <div v-else-if="currentStep === 2" key="step-2" class="flex flex-col gap-[8px] px-[16px] pt-[20px]" data-node-id="5256:8689" data-name="Editor Menu Container">
              
              <!-- Card 1: Browse Gallery -->
              <button
                @click="openGalleryModal"
                class="bg-[#f9f9f9] rounded-[8px] p-[20px] flex items-start gap-[20px] text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.99] cursor-pointer w-full group"
                data-node-id="5256:8690"
              >
                <div class="w-6 h-6 flex items-center justify-center text-black flex-none mt-0.5 group-hover:scale-110 transition-transform">
                  <LayoutGrid :size="24" class="stroke-[1.5]" />
                </div>
                <div class="flex flex-col gap-[6px] flex-1">
                  <div class="flex items-center justify-between w-full">
                    <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] text-black leading-none">
                      Browse Gallery
                    </span>
                    <button
                      v-if="appliedState.artwork !== null"
                      type="button"
                      @click.stop="handleRemoveArtwork"
                      class="text-[13px] font-medium text-neutral-500 hover:text-black underline underline-offset-4 hover:bg-neutral-200/60 px-2 py-0.5 rounded transition-all cursor-pointer z-10 shrink-0"
                      title="Remove applied artwork"
                    >
                      Remove
                    </button>
                  </div>
                  <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[12px] text-neutral-600 leading-[16px]">
                    Choose from our curated collection of Stanley graphics.
                  </span>
                </div>
              </button>

              <!-- Card 2: Personalize with Text (Official Ss Vector Icon) -->
              <button
                @click="openTextEditor"
                class="bg-[#f9f9f9] rounded-[8px] p-[20px] flex items-start gap-[20px] text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.99] cursor-pointer w-full group"
                data-node-id="5256:8891"
              >
                <div class="w-6 h-6 flex items-center justify-center text-black flex-none mt-0.5 group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 35 29.2726" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-6 h-auto max-h-6">
                    <g id="Icon Container">
                      <path id="Vector" d="M11.1805 29.2726C4.47219 29.2726 0.203281 26.02 0 19.7183H4.06563C4.06563 23.5807 7.0742 25.6135 11.3431 25.6135H11.7497C15.5714 25.6135 17.6448 23.7026 17.6448 21.3446C17.6448 19.0272 16.1812 17.6855 13.1726 17.0757L8.61914 16.1406C4.06563 15.2055 1.42297 12.6441 1.42297 8.13128C1.42297 3.65909 5.44794 1.88351e-05 11.587 1.88351e-05C17.8888 1.88351e-05 21.9137 3.45581 22.117 8.94441H18.0514C17.8481 5.6919 15.2461 3.65909 11.7903 3.65909H11.3838C7.84667 3.65909 5.4886 5.56993 5.4886 8.09062C5.4886 10.2861 6.99288 11.5871 9.39161 12.0749L13.9451 12.9694C18.8645 13.9451 21.7105 16.5471 21.7105 21.182C21.7105 26.1827 17.4822 29.2726 11.1805 29.2726Z" fill="currentColor"/>
                      <path id="Vector_2" d="M29.8671 28.205C26.4876 28.205 24.6581 26.4262 24.6581 24.0123H27.072C27.1991 25.5369 28.3934 26.1721 29.8926 26.1721H30.0958C31.4172 26.1721 32.459 25.5369 32.459 24.5205C32.459 23.7074 32.0016 23.1483 30.7311 22.8942L28.8761 22.5385C26.8179 22.1319 25.1663 21.0647 25.1663 18.9048C25.1663 16.3638 27.4278 14.9917 29.9688 14.9917C33.2975 14.9917 35 16.7704 35 19.1843H32.586C32.459 18.0409 31.7475 17.0245 30.0958 17.0245H29.8926C28.4696 17.0245 27.5802 17.7614 27.5802 18.6507C27.5802 19.5401 28.0884 20.0229 29.3589 20.277L31.3663 20.6835C33.2975 21.0647 34.873 22.1065 34.873 24.3934C34.873 26.6803 32.8147 28.205 29.8671 28.205Z" fill="currentColor"/>
                    </g>
                  </svg>
                </div>
                <div class="flex flex-col gap-[6px] flex-1">
                  <div class="flex items-center justify-between w-full">
                    <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] text-black leading-none">
                      Personalize with Text
                    </span>
                    <button
                      v-if="appliedState.text.trim().length > 0"
                      type="button"
                      @click.stop="handleRemoveText"
                      class="text-[13px] font-medium text-neutral-500 hover:text-black underline underline-offset-4 hover:bg-neutral-200/60 px-2 py-0.5 rounded transition-all cursor-pointer z-10 shrink-0"
                      title="Remove applied text"
                    >
                      Remove
                    </button>
                  </div>
                  <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[12px] text-neutral-600 leading-[16px]">
                    Add a monogram, name, or custom text.
                  </span>
                </div>
              </button>

              <!-- Card 3: Upload Your Own Design (Disabled / Coming Soon) -->
              <div
                class="relative bg-[#f9f9f9] rounded-[8px] p-[20px] flex items-start gap-[20px] text-left pointer-events-none cursor-not-allowed w-full select-none"
                data-node-id="5256:8872"
              >
                <div class="w-6 h-6 flex items-center justify-center text-black flex-none mt-0.5 opacity-20">
                  <Upload :size="24" class="stroke-[1.5]" />
                </div>
                <div class="flex flex-col gap-[6px] flex-1">
                  <div class="flex items-center justify-between w-full">
                    <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] text-black leading-none opacity-20">
                      Upload Your Own Design
                    </span>
                    <span class="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase opacity-100 shadow-xs">
                      Coming Soon
                    </span>
                  </div>
                  <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[12px] text-neutral-600 leading-[16px] opacity-20">
                    Bring your own logo or vector artwork to life.
                  </span>
                </div>
              </div>
            </div>

            <!-- STEP 3: REVIEW (Strictly Figma Node 5649:4371) -->
            <div v-else-if="currentStep === 3" key="step-3" class="flex flex-col gap-[14px] px-[16px] pt-[20px] pb-[16px]">
              <div class="bg-[#f5f5f5] flex flex-col gap-[14px] items-start p-[16px] rounded-[10px] w-full" data-node-id="5649:4371" data-name="Container">
                
                <!-- Top Summary Row: Color & Size Selected (Figma Node 5649:4372) -->
                <div class="flex items-center text-[12px] font-['Stanley_Favorit',sans-serif] leading-normal w-full" data-node-id="5649:4372" data-name="SummaryRow">
                  <span class="text-black font-normal" data-node-id="5649:4373">Color & Size Selected</span>
                  <span class="text-[#555] font-normal ml-1" data-node-id="5649:4374">
                    : {{ selectedSize }} - {{ selectedColor.name }}
                  </span>
                </div>

                <!-- Divider (Figma Node 5649:4375) -->
                <div class="bg-[#e0e0e0] h-px w-full shrink-0" data-node-id="5649:4375" data-name="Container"></div>

                <!-- Section Title: Personalized Items (Figma Node 5649:4376) -->
                <div class="flex flex-col items-start w-full" data-node-id="5649:4376" data-name="Container">
                  <p class="font-['Stanley_Favorit',sans-serif] font-bold text-[12px] text-black mb-0" data-node-id="5649:4377">
                    Personalized Items
                  </p>
                </div>

                <!-- Box 1: Text Card (Figma Node 5649:4378) -->
                <div
                  v-if="appliedState.text"
                  class="border-[0.615px] border-black border-solid flex flex-col gap-[6px] items-start px-[14px] py-[12px] rounded-[8px] shrink-0 w-full bg-transparent"
                  data-node-id="5649:4378"
                  data-name="Container"
                >
                  <div class="flex flex-col items-start w-full" data-node-id="5649:4379">
                    <p class="font-['Stanley_Favorit',sans-serif] font-bold text-[13px] text-black mb-0" data-node-id="5649:4380">
                      Text
                    </p>
                  </div>
                  <div class="flex items-center text-[12px] font-['Stanley_Favorit',sans-serif] leading-normal w-full" data-node-id="5649:4381" data-name="SummaryRow">
                    <span class="text-black font-normal" data-node-id="5649:4382">Text</span>
                    <span class="text-[#555] font-normal ml-1" data-node-id="5649:4383">: "{{ appliedState.text }}"</span>
                  </div>
                  <div class="flex flex-col gap-[6px] text-[12px] font-['Stanley_Favorit',sans-serif] leading-normal w-full" data-node-id="5649:4384">
                    <div class="flex items-center w-full" data-node-id="5649:4385" data-name="SummaryRow">
                      <span class="text-black font-normal" data-node-id="5649:4386">Font Selected</span>
                      <span class="text-[#555] font-normal ml-1" data-node-id="5649:4387">: {{ selectedFontName }}</span>
                    </div>
                    <div class="flex items-center w-full" data-name="SummaryRow">
                      <span class="text-black font-normal">Font Size</span>
                      <span class="text-[#555] font-normal ml-1">: {{ appliedState.fontSize || 'M' }}</span>
                    </div>
                    <div class="flex items-center w-full" data-node-id="5649:4388" data-name="SummaryRow">
                      <span class="text-black font-normal" data-node-id="5649:4389">Orientation</span>
                      <span class="text-[#555] font-normal ml-1" data-node-id="5649:4390">: {{ appliedState.orientation === 'vertical' ? 'Vertical' : 'Horizontal' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Box 2: Graphic Card (Figma Node 5649:4391) -->
                <div
                  v-if="appliedState.artwork"
                  class="border-[0.615px] border-black border-solid flex flex-col gap-[6px] items-start px-[14px] py-[12px] rounded-[8px] shrink-0 w-full bg-transparent"
                  data-node-id="5649:4391"
                  data-name="Container"
                >
                  <div class="flex flex-col items-start w-full" data-node-id="5649:4392">
                    <p class="font-['Stanley_Favorit',sans-serif] font-bold text-[13px] text-black mb-0" data-node-id="5649:4393">
                      Graphic
                    </p>
                  </div>
                  <div class="flex items-center text-[12px] font-['Stanley_Favorit',sans-serif] leading-normal w-full" data-node-id="5649:4394" data-name="SummaryRow">
                    <span class="text-black font-normal" data-node-id="5649:4395">Artwork Name</span>
                    <span class="text-[#555] font-normal ml-1" data-node-id="5649:4396">: "{{ selectedArtworkObj?.name || 'Selected Artwork' }}"</span>
                  </div>
                  <div class="flex items-center text-[12px] font-['Stanley_Favorit',sans-serif] leading-normal w-full" data-node-id="5649:4397" data-name="SummaryRow">
                    <span class="text-black font-normal" data-node-id="5649:4398">Artist Name</span>
                    <span class="text-[#555] font-normal ml-1" data-node-id="5649:4399">: {{ selectedArtworkObj?.subtext || 'Stanley Indonesia' }}</span>
                  </div>
                  <div class="flex items-center text-[12px] font-['Stanley_Favorit',sans-serif] leading-normal w-full" data-name="SummaryRow">
                    <span class="text-black font-normal">Graphic Size</span>
                    <span class="text-[#555] font-normal ml-1">: {{ appliedState.graphicSize === 'S' ? 'Small' : appliedState.graphicSize === 'L' ? 'Large' : 'Standard' }}</span>
                  </div>
                </div>

                <!-- Box 3: Uploaded File Card (If user uploaded design) -->
                <div
                  v-if="appliedState.uploadedFile"
                  class="border-[0.615px] border-black border-solid flex flex-col gap-[6px] items-start px-[14px] py-[12px] rounded-[8px] shrink-0 w-full bg-transparent"
                >
                  <div class="flex flex-col items-start w-full">
                    <p class="font-['Stanley_Favorit',sans-serif] font-bold text-[13px] text-black mb-0">
                      Uploaded Design
                    </p>
                  </div>
                  <div class="flex items-center text-[12px] font-['Stanley_Favorit',sans-serif] leading-normal w-full">
                    <span class="text-black font-normal">File Name</span>
                    <span class="text-[#555] font-normal ml-1">: "{{ uploadedFileName || 'Custom Vector Design' }}"</span>
                  </div>
                </div>

                <!-- Placement Note (Figma Node 5649:4400) -->
                <div class="flex flex-col items-start w-full" data-node-id="5649:4400" data-name="Container">
                  <p class="font-['Stanley_Favorit',sans-serif] text-[#555] text-[12px] mb-0" data-node-id="5649:4401">
                    Placement: {{ placementSummaryText }}
                  </p>
                </div>
              </div>
            </div>
            </Transition>
          </main>

          <!-- 3. Auto-Hide Sticky Bottom Action Button Container (Figma Node 5087:8510 / 5256:8718 Desktop Aligned) -->
          <footer
            class="p-[16px] bg-white/95 backdrop-blur-md border-t border-neutral-100 absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 transform-gpu flex items-center gap-3"
            :class="{
              'translate-y-[110%] opacity-0 pointer-events-none': isScrollHidden,
              'translate-y-0 opacity-100': !isScrollHidden
            }"
            data-node-id="5655:7313"
            data-name="Footer"
          >
            <!-- Back Button (Step 2 & Step 3) matching desktop style -->
            <button
              v-if="currentStep > 1"
              @click="currentStep = (currentStep - 1 as any)"
              class="px-5 h-[48px] border border-black rounded-[8px] font-bold text-[14px] text-black hover:bg-neutral-50 active:scale-[0.97] transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 select-none shadow-xs"
              title="Go back to previous step"
            >
              <ArrowLeft :size="16" />
              <span>Back</span>
            </button>

            <!-- Step 1 & Step 2 Action Button: Next Step -->
            <button
              v-if="currentStep < 3"
              @click="handleNextStep"
              :disabled="currentStep === 2 && !hasPersonalization"
              class="flex-1 w-full h-[48px] font-['Stanley_Favorit',sans-serif] font-bold text-[14px] rounded-[8px] flex items-center justify-center transition-all select-none"
              :class="[
                currentStep === 2 && !hasPersonalization
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-60'
                  : 'bg-black text-white hover:bg-neutral-900 active:scale-[0.99] cursor-pointer shadow-md'
              ]"
              data-node-id="5655:7314"
              data-name="CTA Button"
            >
              <span data-node-id="5655:7315">{{ currentStep === 1 ? 'Next: Personalize' : 'Next Step' }}</span>
            </button>

            <!-- Step 3: Add to Cart Action Button -->
            <button
              v-else
              @click="handleAddToCart"
              class="flex-1 w-full h-[48px] bg-black text-white font-['Stanley_Favorit',sans-serif] font-bold text-[14px] rounded-[8px] flex items-center justify-center hover:bg-neutral-900 active:scale-[0.99] transition-all cursor-pointer shadow-md select-none"
            >
              Add to Cart • {{ product.priceFormatted || 'IDR 800.000' }}
            </button>
          </footer>

          <!-- FULL-SCREEN TEXT CUSTOMIZER VIEW (Figma Node 5256:9060 & 5699:7177) -->
          <Transition name="drawer-up">
            <div
              v-if="selectedSubCategory === 'text'"
              class="fixed inset-0 z-50 h-[100dvh] w-full bg-white flex flex-col font-['Stanley_Favorit',sans-serif] select-none overflow-hidden overscroll-none"
              data-node-id="5256:9060"
              data-name="Personalize with text customizer menu"
            >
              <!-- 1. Header (75% Opacity with Backdrop Blur Style - No Border Line) -->
              <header class="absolute top-0 left-0 right-0 h-[64px] px-[16px] flex items-center justify-between bg-white/75 backdrop-blur-md z-30" data-node-id="5699:7338">
                <!-- Cancel Button -->
                <button
                  @click="cancelTextEdits"
                  class="font-['Stanley_Favorit',sans-serif] font-normal text-[16px] text-black hover:opacity-70 active:scale-95 transition-all cursor-pointer select-none"
                >
                  Cancel
                </button>

                <!-- Apply Button (Clickable only when user types characters) -->
                <button
                  @click="applyTextEdits"
                  :disabled="!isApplyActive"
                  class="font-['Stanley_Favorit',sans-serif] font-bold text-[12px] px-[16px] py-[8px] rounded-[4px] transition-all select-none"
                  :class="[
                    isApplyActive
                      ? 'bg-black text-white hover:bg-neutral-900 active:scale-95 cursor-pointer shadow-xs'
                      : 'bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-60'
                  ]"
                >
                  Apply
                </button>
              </header>

              <!-- 2. Tumbler Stage & Dashed Bounding Box (Figma Node 5658:2248 - Closeup Blank Tumbler) -->
              <div
                @click="textInputRef?.blur()"
                class="flex-1 flex flex-col items-center justify-center relative bg-[#fafafa] overflow-hidden"
                data-node-id="5658:2248"
              >
                <!-- Floating Action Button for Move / Set Position (24px above bottom options) -->
                <div
                  class="absolute left-[16px] bottom-[24px] z-20 flex flex-col gap-[8px] items-start pointer-events-auto"
                  data-node-id="5711:7608"
                  data-name="Floating Controls"
                >
                  <!-- Adjust Button -->
                  <button
                    type="button"
                    @click.stop="isPositionDrawerOpen = true"
                    class="h-[40px] rounded-[9px] backdrop-blur-[6px] bg-white/90 border border-black/10 shadow-[0px_2px_8px_rgba(0,0,0,0.08)] flex items-center transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer text-black hover:bg-white active:scale-95 select-none overflow-hidden transform-gpu"
                    :class="[
                      isSpecialFloatingExpanded ? 'w-[115px] pr-[12px]' : 'w-[40px] pr-0'
                    ]"
                    data-node-id="5711:7584"
                    title="Adjust"
                    aria-label="Adjust"
                  >
                    <div class="w-[40px] h-[40px] flex items-center justify-center shrink-0">
                      <SlidersHorizontal :size="18" class="text-black shrink-0" />
                    </div>
                    <div
                      class="transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden flex items-center shrink-0"
                      :class="[
                        isSpecialFloatingExpanded
                          ? 'max-w-[70px] opacity-100'
                          : 'max-w-0 opacity-0 pointer-events-none'
                      ]"
                    >
                      <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[13px] whitespace-nowrap leading-none text-black pr-1">
                        Adjust
                      </span>
                    </div>
                  </button>
                </div>

                <!-- Tumbler Visual Container (Unified Proportional Engraving Canvas Stage) -->
                <div class="relative h-full w-full flex items-center justify-center pointer-events-none overflow-hidden">
                  <img
                    :src="activeBlankImage"
                    :alt="product.name"
                    class="max-h-full max-w-full object-contain filter drop-shadow-lg transition-all duration-300 transform-gpu scale-[1.95] sm:scale-[2.0] translate-y-7 sm:translate-y-8"
                  />

                  <!-- Scaled Engraving Canvas Wrapper (Exact same alignment and scale as main studio stage) -->
                  <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div class="relative origin-center transform-gpu scale-[1.10] sm:scale-[1.12] pointer-events-auto">
                      <!-- Dashed Bounding Box (w-[191px] h-[280px]) placed squarely on tumbler engraving area -->
                      <div
                        class="w-[191px] h-[280px] border border-dashed rounded-[8px] pointer-events-auto transition-all overflow-hidden no-scrollbar cursor-text relative p-0"
                        @click.stop="textInputRef?.focus()"
                        :class="[
                          isProductColorLight ? 'border-neutral-800/80' : 'border-white/80'
                        ]"
                      >
                        <!-- Hidden Measure Box for boundary calculation -->
                        <div
                          ref="textMeasureBoxRef"
                          class="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none whitespace-pre-wrap select-none"
                          :class="[
                            draftFont,
                            isFontUppercase(draftFont) ? 'uppercase' : '',
                            ((appliedState.graphicSize || draftGraphicSize) === 'L' && (selectedArtwork || appliedState.artwork))
                              ? (draftFontSize === 'S'
                                  ? 'text-[19px] leading-[1.2]'
                                  : draftFontSize === 'M'
                                  ? 'text-[24px] leading-[1.15]'
                                  : draftFontSize === 'L'
                                  ? 'text-[29px] leading-[1.1]'
                                  : 'text-[36px] leading-[1.05]')
                              : (draftFontSize === 'S'
                                  ? 'text-[24px] leading-[1.2]'
                                  : draftFontSize === 'M'
                                  ? 'text-[36px] leading-[1.1]'
                                  : draftFontSize === 'L'
                                  ? 'text-[48px] leading-[1.05]'
                                  : 'text-[60px] leading-[1.0]'),
                            draftOrientation === 'vertical' ? 'whitespace-nowrap tracking-wider' : 'w-[191px] break-words tracking-wider'
                          ]"
                        ></div>

                        <!-- Graphic Layer (Fixed coordinates based on Browse Gallery setup) -->
                        <div
                          v-if="appliedState.artwork"
                          class="absolute transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 flex items-center justify-center pointer-events-none"
                          :style="dynamicDraftGraphicContainerStyle"
                        >
                          <LaserPreview
                            type="image"
                            :image-src="getArtworkImage(appliedState.artwork)"
                            :image-style="dynamicDraftGraphicStyle"
                            :placement="draftGraphicPlacement || appliedState.graphicPlacement || 'center'"
                            :is-light-tumbler="isProductColorLight"
                          />
                        </div>

                        <!-- Uploaded Graphic Layer (if present) -->
                        <div
                          v-if="appliedState.uploadedFile"
                          class="absolute transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 flex items-center justify-center pointer-events-none"
                          :style="dynamicDraftGraphicContainerStyle"
                        >
                          <div class="w-[70px] h-[70px] flex items-center justify-center opacity-85 mix-blend-multiply border border-dashed border-neutral-700 rounded-lg p-2">
                            <UploadCloud :size="32" class="text-neutral-800" />
                          </div>
                        </div>

                        <!-- Text Layer (Positioned in allocated space without shifting graphic) -->
                        <div
                          class="absolute flex flex-col items-center transition-all duration-200 pointer-events-none overflow-visible"
                          :style="dynamicDraftTextContainerStyle"
                          :class="[
                            draftOrientation === 'vertical'
                              ? 'justify-center items-center'
                              : (draftPlacement === 'top' ? 'justify-start' : draftPlacement === 'bottom' ? 'justify-end' : 'justify-center')
                          ]"
                        >
                          <LaserPreview
                            v-if="draftText"
                            type="text"
                            :text="previewDraftText"
                            :font-class="[draftFont, isFontUppercase(draftFont) ? 'uppercase' : ''].join(' ')"
                            :font-size-class="((appliedState.graphicSize || draftGraphicSize) === 'L' && (selectedArtwork || appliedState.artwork))
                              ? (draftFontSize === 'S'
                                  ? 'text-[19px]'
                                  : draftFontSize === 'M'
                                  ? 'text-[24px]'
                                  : draftFontSize === 'L'
                                  ? 'text-[29px]'
                                  : 'text-[36px]')
                              : (draftFontSize === 'S'
                                  ? 'text-[24px]'
                                  : draftFontSize === 'M'
                                  ? 'text-[36px]'
                                  : draftFontSize === 'L'
                                  ? 'text-[48px]'
                                  : 'text-[60px]')"
                            :orientation="draftOrientation"
                            :vertical-lines="formattedDraftVerticalLines"
                            :placement="draftPlacement || 'center'"
                            :is-light-tumbler="isProductColorLight"
                          />
                          <p
                            v-else
                            class="font-['Stanley_Favorit',sans-serif] text-[14px] font-medium leading-normal tracking-tight whitespace-nowrap select-none pointer-events-none"
                            :class="[
                              isProductColorLight ? 'text-neutral-800/80' : 'text-white/90 drop-shadow-xs',
                              draftOrientation === 'vertical' ? '-rotate-90 transform-gpu text-center' : 'text-center'
                            ]"
                          >
                            Your text will appear here
                          </p>
                        </div>

                        <!-- Seamless Transparent Textarea covering bounding box for keyboard / touch input -->
                        <textarea
                          ref="textInputRef"
                          :value="draftText"
                          @input="handleTextInput"
                          @focus="isTextFocused = true"
                          @blur="isTextFocused = false"
                          rows="1"
                          placeholder=""
                          class="absolute inset-0 w-full h-full opacity-0 resize-none overflow-hidden cursor-text z-10"
                          aria-label="Engraving text input"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Text capacity limit reached indicator -->
                <Transition name="fade">
                  <div
                    v-if="isTextLimitReached"
                    class="absolute bottom-[20px] left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200/90 text-amber-800 text-[11px] font-medium rounded-full shadow-md backdrop-blur-sm pointer-events-none whitespace-nowrap"
                  >
                    <AlertCircle :size="13" class="text-amber-600 shrink-0" />
                    <span>Text limit reached for this font size</span>
                  </div>
                </Transition>
              </div>

              <!-- 3. Bottom Menu Panel (Figma Node 5699:7177 - Options Container) -->
              <div
                class="bg-[#f9f9f9] flex flex-col gap-[20px] items-start py-[20px] pb-[32px] relative rounded-tl-[8px] rounded-tr-[8px] w-full shrink-0"
                data-node-id="5699:7177"
                data-name="Options Container"
              >
                <!-- Live Space for Graphic Indicator (Only shown if user chose Text first) -->
                <div
                  v-if="(draftText || appliedState.text) && firstCustomizationType === 'text'"
                  class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] sm:text-[12px] px-3.5 py-2 rounded-[6px] bg-[#f4f4f4] border border-black/10 mx-4 w-[calc(100%-32px)] transition-all select-none"
                >
                  <!-- CASE 1: Text is centered -> Guide user to position on Top or Bottom -->
                  <template v-if="draftPlacement === 'center' || !draftPlacement">
                    <div class="flex items-center gap-1.5 font-['Stanley_Favorit',sans-serif]">
                      <span class="inline-block size-2 rounded-full shrink-0 bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]"></span>
                      <span class="font-normal text-neutral-700 tracking-[-0.2px]">Position text on Top or Bottom to add a graphic</span>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        @click="draftPlacement = 'top'"
                        class="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium border border-black/20 hover:border-black bg-white hover:bg-black hover:text-white transition-all cursor-pointer shadow-2xs"
                      >
                        Set to Top
                      </button>
                      <button
                        type="button"
                        @click="draftPlacement = 'bottom'"
                        class="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium border border-black/20 hover:border-black bg-white hover:bg-black hover:text-white transition-all cursor-pointer shadow-2xs"
                      >
                        Set to Bottom
                      </button>
                    </div>
                  </template>

                  <!-- CASE 2: Text is at Top or Bottom -> Space is available for Graphic in the other slot -->
                  <template v-else>
                    <div class="flex items-center gap-1.5 font-['Stanley_Favorit',sans-serif]">
                      <span
                        class="inline-block size-2 rounded-full shrink-0"
                        :class="canFitGraphic ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.4)]'"
                      ></span>
                      <span v-if="canFitGraphic" class="font-medium text-black tracking-[-0.2px]">
                        Space for graphic: Available ({{ draftPlacement === 'top' ? 'Bottom slot' : 'Top slot' }})
                      </span>
                      <span v-else class="font-normal text-neutral-600 tracking-[-0.2px]">
                        Space for graphic: Full (Reduce text to add graphic)
                      </span>
                    </div>
                    <button
                      v-if="canFitGraphic"
                      type="button"
                      @click="openGraphicGallery"
                      class="text-[11px] sm:text-[12px] font-bold font-['Stanley_Favorit',sans-serif] text-black underline hover:text-neutral-600 transition-colors cursor-pointer flex items-center gap-1 shrink-0 ml-2"
                    >
                      Add Graphic &rarr;
                    </button>
                  </template>
                </div>

                <!-- Options Header (Tabs: Font Style & Font Size) -->
                <div
                  class="flex gap-[32px] items-center justify-center text-[16px] text-black text-center tracking-[-0.48px] w-full whitespace-nowrap leading-[32px]"
                  data-name="Options Header"
                >
                  <button
                    type="button"
                    @click="textActiveTab = 'style'"
                    class="cursor-pointer select-none transition-all font-['Stanley_Favorit',sans-serif]"
                    :class="textActiveTab === 'style' ? 'font-bold' : 'font-normal'"
                  >
                    Font Style
                  </button>
                  <button
                    type="button"
                    @click="textActiveTab = 'size'"
                    class="cursor-pointer select-none transition-all font-['Stanley_Favorit',sans-serif]"
                    :class="textActiveTab === 'size' ? 'font-bold' : 'font-normal'"
                  >
                    Font Size
                  </button>
                </div>

                <!-- Tab Contents (h-[50px] for zero layout jitter) -->
                <div class="h-[50px] w-full relative">
                  <Transition name="tab-fade" mode="out-in">
                    <!-- Variant 1: Font Style (Node 5699:7158) -->
                    <div
                      v-if="textActiveTab === 'style'"
                      key="tab-style"
                      class="flex items-center px-[16px] relative shrink-0 w-full overflow-x-auto no-scrollbar gap-[8px]"
                      data-node-id="5699:7158"
                    >
                      <button
                        v-for="font in fontOptions"
                        :key="font.name"
                        type="button"
                        @click="draftFont = font.class"
                        class="border border-black border-solid rounded-[4px] shrink-0 w-[88px] h-[48px] flex items-center justify-center cursor-pointer select-none transition-colors"
                        :class="[
                          draftFont === font.class
                            ? 'bg-black text-white'
                            : 'bg-white text-black'
                        ]"
                      >
                        <div
                          v-if="font.singleLine"
                          class="text-[12px] text-center tracking-[-0.36px] w-[88px] flex flex-col justify-center h-[48px]"
                          :class="font.class"
                        >
                          <p class="leading-[32px]">{{ font.singleLine }}</p>
                        </div>
                        <div
                          v-else
                          class="text-[12px] text-center tracking-[-0.36px] w-[88px] flex flex-col justify-center h-[48px]"
                          :class="font.class"
                        >
                          <p class="leading-[14px] mb-0">{{ font.line1 }}</p>
                          <p class="leading-[14px]">{{ font.line2 }}</p>
                        </div>
                      </button>
                    </div>

                    <!-- Variant 2: Font Size (Node 5699:7255) -->
                    <div
                      v-else-if="textActiveTab === 'size'"
                      key="tab-size"
                      class="flex flex-col px-[16px] relative shrink-0 w-full"
                      data-node-id="5699:7255"
                    >
                      <div class="border border-black border-solid flex-1 flex items-center h-[48px] overflow-hidden">
                        <button
                          v-for="size in (['S', 'M', 'L', 'XL'] as const)"
                          :key="size"
                          type="button"
                          :disabled="isFontSizeDisabled(size)"
                          @click="handleSelectFontSize(size)"
                          class="flex-1 h-[48px] flex items-center justify-center text-[14px] font-bold font-['Stanley_Favorit',sans-serif] select-none transition-colors rounded-none"
                          :class="[
                            isFontSizeDisabled(size)
                              ? 'opacity-30 cursor-not-allowed text-neutral-400 bg-neutral-100'
                              : draftFontSize === size
                              ? 'bg-black text-white cursor-pointer'
                              : 'bg-transparent text-black hover:bg-black/5 cursor-pointer'
                          ]"
                        >
                          <p class="leading-[14px]">{{ size }}</p>
                        </button>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </Transition>

          <!-- SUB-DRAWER: GRAPHICS GALLERY (Figma Node 5660:1265 & 5673:8186) -->
          <Transition name="slide-up">
            <div
              v-if="selectedSubCategory === 'gallery'"
              class="fixed inset-0 z-50 h-[100dvh] w-full bg-white flex flex-col font-['Stanley_Favorit',sans-serif] overflow-hidden overscroll-none"
              :data-node-id="galleryView === 'special-graphic' ? '5673:8186' : '5660:1265'"
              :data-name="galleryView === 'special-graphic' ? 'Special Graphic Menu' : 'Browse Gallery'"
            >
              <!-- 1. Header (75% Opacity Backdrop Blur Style - No Border Line) -->
              
              <!-- 1A: Main Browse Gallery Header (Figma Node 5660:1282) -->
              <header
                v-if="galleryView === 'menu'"
                class="absolute top-0 left-0 right-0 h-[64px] px-[16px] flex items-center justify-between bg-white/75 backdrop-blur-md z-30"
                data-node-id="5660:1282"
              >
                <div class="flex items-center" data-node-id="5660:1283" data-name="Heading Text">
                  <div class="flex flex-col font-['Stanley_Favorit',sans-serif] font-medium text-[20px] text-black tracking-[-0.6px] leading-[normal]" data-node-id="5660:1285">
                    Browse Gallery
                  </div>
                </div>

                <button
                  type="button"
                  @click="handleCancelGallery"
                  class="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 active:scale-90 text-neutral-800 hover:text-black flex items-center justify-center transition-all cursor-pointer flex-none"
                  data-node-id="5660:1286"
                  data-name="lets-icons:close-round-duotone"
                  aria-label="Close browse gallery"
                >
                  <X :size="18" />
                </button>
              </header>

              <!-- 1B: Sub-menu Header for Special Graphic / Top 5 / Categories (Figma Node 5673:8235 - Absolute Centered with fixed dimensions to eliminate jitter) -->
              <header
                v-else
                class="absolute top-0 left-0 right-0 h-[64px] px-[16px] flex items-center justify-between bg-white/75 backdrop-blur-md z-30"
                data-node-id="5673:8235"
              >
                <!-- Cancel Button -->
                <button
                  type="button"
                  @click="handleCancelGallery"
                  class="font-['Stanley_Favorit',sans-serif] font-normal text-[16px] text-black hover:opacity-70 active:scale-95 transition-all cursor-pointer select-none z-10"
                  data-node-id="5673:8238"
                >
                  Cancel
                </button>

                <!-- Center Title & Subtitle (Absolute Centered with fixed dimensions to prevent any jitter on title/subtext change) -->
                <div class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center w-[240px] h-[44px] pointer-events-none overflow-hidden select-none" data-node-id="5673:8240">
                  <div class="h-[22px] flex items-center justify-center w-full overflow-hidden">
                    <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] text-black tracking-[-0.48px] leading-tight truncate w-full" data-node-id="5673:8241">
                      {{ currentSelectedArtworkName }}
                    </span>
                  </div>
                  <div class="h-[18px] flex items-center justify-center w-full overflow-hidden">
                    <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[12px] text-neutral-600 tracking-[-0.36px] leading-tight truncate w-full" data-node-id="5673:8242">
                      {{ currentSelectedArtworkSubtext }}
                    </span>
                  </div>
                </div>

                <!-- Apply Button -->
                <button
                  type="button"
                  @click="handleApplyGallery"
                  class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] text-black hover:opacity-70 active:scale-95 transition-all cursor-pointer select-none z-10"
                  data-node-id="5673:8244"
                >
                  Apply
                </button>
              </header>

              <!-- 2. Tumbler Stage & Dashed Bounding Box (Exact Same Port as Personalize with Text) -->
              <div
                class="flex-1 flex flex-col items-center justify-center relative bg-[#fafafa] overflow-hidden"
                data-node-id="5660:1268"
              >
                <!-- Floating Action Buttons on Gallery Sub-Menus (Special Graphic, Top 5, Categories - 24px above gallery panel) -->
                <div
                  v-if="galleryView === 'special-graphic' || galleryView === 'top5' || galleryView === 'categories'"
                  class="absolute left-[16px] bottom-[24px] z-20 flex flex-col gap-[8px] items-start pointer-events-auto"
                  data-node-id="5711:7608"
                  data-name="Floating Controls"
                >
                  <!-- Button 1: Info / Special Graphic Campaign (If in special graphic view OR selected artwork is tagged as special graphic) -->
                  <button
                    v-if="galleryView === 'special-graphic' || isSpecialGraphic(selectedArtwork)"
                    type="button"
                    @click="openCollabInfoModal"
                    class="h-[40px] rounded-[9px] backdrop-blur-[6px] bg-white/90 border border-black/10 shadow-[0px_2px_8px_rgba(0,0,0,0.08)] flex items-center transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer text-black hover:bg-white active:scale-95 select-none overflow-hidden transform-gpu"
                    :class="[
                      isSpecialFloatingExpanded ? 'w-[155px] pr-[12px]' : 'w-[40px] pr-0'
                    ]"
                    data-node-id="5711:7605"
                    data-name="Info Button Container"
                    title="Special Graphic Info"
                    aria-label="Special Graphic Info"
                  >
                    <div class="w-[40px] h-[40px] flex items-center justify-center shrink-0">
                      <Info :size="18" class="text-black shrink-0" />
                    </div>
                    <div
                      class="transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden flex items-center shrink-0"
                      :class="[
                        isSpecialFloatingExpanded
                          ? 'max-w-[110px] opacity-100'
                          : 'max-w-0 opacity-0 pointer-events-none'
                      ]"
                    >
                      <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[13px] whitespace-nowrap leading-none text-black pr-1">
                        Special Graphic
                      </span>
                    </div>
                  </button>

                  <!-- Button 2: Adjust (Figma Node 5711:7584) -->
                  <button
                    type="button"
                    @click="isPositionDrawerOpen = true"
                    class="h-[40px] rounded-[9px] backdrop-blur-[6px] bg-white/90 border border-black/10 shadow-[0px_2px_8px_rgba(0,0,0,0.08)] flex items-center transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer text-black hover:bg-white active:scale-95 select-none overflow-hidden transform-gpu"
                    :class="[
                      isSpecialFloatingExpanded ? 'w-[115px] pr-[12px]' : 'w-[40px] pr-0'
                    ]"
                    data-node-id="5711:7584"
                    data-name="Adjust Button Container"
                    title="Adjust"
                    aria-label="Adjust"
                  >
                    <div class="w-[40px] h-[40px] flex items-center justify-center shrink-0">
                      <SlidersHorizontal :size="18" class="text-black shrink-0" />
                    </div>
                    <div
                      class="transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden flex items-center shrink-0"
                      :class="[
                        isSpecialFloatingExpanded
                          ? 'max-w-[70px] opacity-100'
                          : 'max-w-0 opacity-0 pointer-events-none'
                      ]"
                    >
                      <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[13px] whitespace-nowrap leading-none text-black pr-1">
                        Adjust
                      </span>
                    </div>
                  </button>
                </div>

                <!-- Tumbler Visual Container (Unified Proportional Engraving Canvas Stage) -->
                <div class="relative h-full w-full flex items-center justify-center pointer-events-none overflow-hidden">
                  <img
                    :src="activeBlankImage"
                    :alt="product.name"
                    class="max-h-full max-w-full object-contain filter drop-shadow-lg transition-all duration-300 transform-gpu scale-[1.95] sm:scale-[2.0] translate-y-7 sm:translate-y-8"
                  />

                  <!-- Scaled Engraving Canvas Wrapper (Exact same alignment and scale as main studio stage) -->
                  <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div class="relative origin-center transform-gpu scale-[1.10] sm:scale-[1.12] pointer-events-auto">
                      <!-- Dashed Bounding Box (w-[191px] h-[280px]) placed squarely inside green area under lid -->
                      <div
                        class="w-[191px] h-[280px] border border-dashed rounded-[8px] flex p-0 pointer-events-auto transition-all overflow-hidden no-scrollbar relative"
                        :class="[
                          isProductColorLight ? 'border-neutral-800/80' : 'border-white/80',
                          'flex-col items-center justify-between'
                        ]"
                      >
                        <!-- If user haven't set any text/graphic (blank live preview with helper text) -->
                        <div
                          v-if="!selectedArtwork && !appliedState.text && !appliedState.artwork"
                          class="w-full h-full flex flex-col items-center justify-center text-center p-0 select-none"
                        >
                          <p
                            class="font-['Stanley_Favorit',sans-serif] text-[14px] font-medium leading-normal tracking-tight whitespace-nowrap"
                            :class="isProductColorLight ? 'text-neutral-800/80' : 'text-white/90 drop-shadow-xs'"
                          >
                            Your design will appear here
                          </p>
                        </div>

                        <!-- Content Container (Graphic + Applied Text if any) -->
                        <div
                          v-else
                          class="relative transition-all overflow-hidden no-scrollbar w-full h-full p-0"
                        >
                      <!-- Graphic Layer (Fixed coordinates based on Browse Gallery setup) -->
                      <div
                        v-if="selectedArtwork"
                        class="absolute transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 flex items-center justify-center pointer-events-none"
                        :style="dynamicAppliedGraphicContainerStyle"
                      >
                        <LaserPreview
                          type="image"
                          :image-src="getArtworkImage(selectedArtwork)"
                          :image-style="dynamicAppliedGraphicStyle"
                          :placement="appliedState.graphicPlacement || 'center'"
                          :is-light-tumbler="isProductColorLight"
                        />
                      </div>

                      <!-- Rendered Applied Text if exists (Positioned in allocated space without shifting graphic) -->
                      <div
                        v-if="appliedState.text"
                        class="absolute flex flex-col items-center transition-all duration-200 pointer-events-none overflow-visible"
                        :style="dynamicAppliedTextContainerStyle"
                        :class="[
                          appliedState.orientation === 'vertical'
                            ? 'justify-center items-center'
                            : (appliedState.placement === 'top' ? 'justify-start' : appliedState.placement === 'bottom' ? 'justify-end' : 'justify-center')
                        ]"
                      >
                        <LaserPreview
                          type="text"
                          :text="previewAppliedText"
                          :font-class="[appliedState.font || fontOptions[0].class, isFontUppercase(appliedState.font) ? 'uppercase' : ''].join(' ')"
                          :font-size-class="(appliedState.graphicSize === 'L' && (selectedArtwork || appliedState.artwork))
                            ? (appliedState.fontSize === 'S'
                                ? 'text-[19px]'
                                : appliedState.fontSize === 'M'
                                ? 'text-[24px]'
                                : appliedState.fontSize === 'L'
                                ? 'text-[29px]'
                                : 'text-[36px]')
                            : (appliedState.fontSize === 'S'
                                ? 'text-[24px]'
                                : appliedState.fontSize === 'M'
                                ? 'text-[36px]'
                                : appliedState.fontSize === 'L'
                                ? 'text-[48px]'
                                : 'text-[60px]')"
                          :orientation="appliedState.orientation"
                          :vertical-lines="formattedAppliedVerticalLines"
                          :placement="appliedState.placement || 'center'"
                          :is-light-tumbler="isProductColorLight"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

              <!-- 3. Bottom Options Container with Fluid Transition -->
              <Transition name="panel-fade" mode="out-in">
                <!-- 3A: Main Browse Gallery Menu (Strictly Figma Node 5660:1272) -->
                <div
                  v-if="galleryView === 'menu'"
                  key="gallery-menu"
                  class="bg-[#f9f9f9] flex flex-col h-[222px] p-[16px] rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full flex-none"
                  data-node-id="5660:1272"
                  data-name="Options Container"
                >
                  <!-- 3 Category Buttons (Figma Node 5660:1314) -->
                  <div class="flex gap-[8px] h-[132px] items-start w-full" data-node-id="5660:1314" data-name="Option">
                    <!-- Option 1: Special Graphic (Node 5708:7469) -->
                    <div
                      @click="openSpecialGraphicPopup"
                      class="bg-[#f2f2f2] flex flex-1 flex-col gap-[16px] items-center justify-center min-w-px p-[16px] rounded-[4px] self-stretch cursor-pointer select-none transition-all hover:bg-neutral-200/70 active:scale-[0.98]"
                      data-node-id="5708:7469"
                      data-name="Option Container"
                    >
                      <div class="size-[52px] shrink-0 flex items-center justify-center text-black" data-node-id="5708:7479" data-name="arcticons:questionnaire-star">
                        <svg class="size-10 stroke-[1.25]" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M24 4.5l5.87 11.89 13.13 1.91-9.5 9.26 2.24 13.07L24 34.46l-11.74 6.17 2.24-13.07-9.5-9.26 13.13-1.91L24 4.5z" />
                          <path d="M24 10.5l3.91 7.93 8.75 1.27-6.33 6.17 1.49 8.71L24 30.47l-7.82 4.11 1.49-8.71-6.33-6.17 8.75-1.27L24 10.5z" />
                        </svg>
                      </div>
                      <div class="flex flex-col font-['Stanley_Favorit',sans-serif] font-medium h-[32px] justify-center text-[12px] text-black text-center tracking-[-0.36px] w-[78px]" data-node-id="5708:7471">
                        <p class="leading-[16px] m-0">Special Graphic</p>
                      </div>
                    </div>

                    <!-- Option 2: Top 5 Most Used Graphics (Node 5660:1310) -->
                    <div
                      @click="openTop5View"
                      class="bg-[#f2f2f2] flex flex-1 flex-col gap-[12px] sm:gap-[16px] items-center justify-center min-w-px p-[12px] sm:p-[16px] rounded-[4px] self-stretch cursor-pointer select-none transition-all hover:bg-neutral-200/70 active:scale-[0.98]"
                      data-node-id="5660:1310"
                      data-name="Option Container"
                    >
                      <div class="size-[48px] sm:size-[52px] shrink-0 flex items-center justify-center text-black" data-node-id="5708:7466" data-name="ix:trophy-filled">
                        <svg class="size-9 sm:size-10 stroke-[1.25]" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 8h24v12a12 12 0 01-24 0V8z" />
                          <path d="M12 12H6a4 4 0 00-4 4v2a6 6 0 006 6h4" />
                          <path d="M36 12h6a4 4 0 014 4v2a6 6 0 01-6 6h-4" />
                          <path d="M24 32v8" />
                          <path d="M14 40h20" />
                        </svg>
                      </div>
                      <div class="flex flex-col font-['Stanley_Favorit',sans-serif] font-medium h-[32px] justify-center text-[11px] sm:text-[12px] text-black text-center tracking-[-0.36px] w-full" data-node-id="5660:1312">
                        <p class="leading-[14px] sm:leading-[16px] m-0">Top 5 Most Used Graphics</p>
                      </div>
                    </div>

                    <!-- Option 3: Artwork Categories (Node 5660:1315) -->
                    <div
                      @click="openCategoriesView"
                      class="bg-[#f2f2f2] flex flex-1 flex-col gap-[12px] sm:gap-[16px] items-center justify-center min-w-px p-[12px] sm:p-[16px] rounded-[4px] self-stretch cursor-pointer select-none transition-all hover:bg-neutral-200/70 active:scale-[0.98]"
                      data-node-id="5660:1315"
                      data-name="Option Container"
                    >
                      <div class="size-[48px] sm:size-[52px] shrink-0 flex items-center justify-center text-black" data-node-id="5708:7473" data-name="arcticons:google-ai-edge-gallery">
                        <svg class="size-9 sm:size-10 stroke-[1.25]" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="14" cy="14" r="7" />
                          <rect x="27" y="7" width="14" height="14" rx="3" />
                          <polygon points="14,27 21,39 7,39" />
                          <path d="M27 34c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7-7-3.13-7-7z" />
                        </svg>
                      </div>
                      <div class="flex flex-col font-['Stanley_Favorit',sans-serif] font-medium h-[32px] justify-center text-[11px] sm:text-[12px] text-black text-center tracking-[-0.36px] w-full" data-node-id="5660:1317">
                        <p class="leading-[14px] sm:leading-[16px] m-0">Artwork Categories</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 3B: Special Graphic Sub-Menu Options (Strictly Figma Node 5673:8193) -->
                <div
                  v-else-if="galleryView === 'special-graphic'"
                  key="gallery-special"
                  class="bg-[#f9f9f9] flex flex-col gap-[14px] h-[273px] p-[16px] rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full flex-none overflow-hidden"
                  data-node-id="5673:8193"
                  data-name="Options Container"
                >
                  <!-- Category Tabs (Node 5673:8194) -->
                  <div class="flex gap-[20px] items-center justify-center w-full flex-none overflow-x-auto no-scrollbar" data-node-id="5673:8194">
                    <button
                      type="button"
                      @click="activeSpecialTab = 'juventus'"
                      class="font-['Stanley_Favorit',sans-serif] text-[15px] tracking-[-0.48px] transition-all cursor-pointer pb-1 whitespace-nowrap select-none border-b-[1.5px]"
                      :class="activeSpecialTab === 'juventus' ? 'font-medium text-black border-black' : 'font-normal text-neutral-500 border-transparent hover:text-black'"
                      data-node-id="5673:8196"
                    >
                      Juventus
                    </button>
                    <button
                      type="button"
                      @click="activeSpecialTab = 'liunic'"
                      class="font-['Stanley_Favorit',sans-serif] text-[15px] tracking-[-0.48px] transition-all cursor-pointer pb-1 whitespace-nowrap select-none border-b-[1.5px]"
                      :class="activeSpecialTab === 'liunic' ? 'font-medium text-black border-black' : 'font-normal text-neutral-500 border-transparent hover:text-black'"
                      data-node-id="5673:8197"
                    >
                      Artist Drop
                    </button>
                    <button
                      type="button"
                      @click="activeSpecialTab = 'outdoor'"
                      class="font-['Stanley_Favorit',sans-serif] text-[15px] tracking-[-0.48px] transition-all cursor-pointer pb-1 whitespace-nowrap select-none border-b-[1.5px]"
                      :class="activeSpecialTab === 'outdoor' ? 'font-medium text-black border-black' : 'font-normal text-neutral-500 border-transparent hover:text-black'"
                    >
                      Outdoor Series
                    </button>
                  </div>

                  <!-- 5-Column Grid of Graphics (Node 5673:8198 - Scrollable multi-row) -->
                  <Transition name="grid-fade" mode="out-in">
                    <div
                      :key="activeSpecialTab"
                      class="grid grid-cols-5 gap-[8px] w-full flex-1 overflow-y-auto overscroll-contain no-scrollbar py-1 pr-0.5"
                      data-node-id="5673:8198"
                    >
                      <div
                        v-for="item in currentTabGraphics"
                        :key="item.id"
                        @click="handleSelectArtwork(item.id)"
                        class="aspect-[1/1] sm:aspect-[89/119] rounded-[8px] p-2 flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 bg-[#f5f5f5]"
                        :class="[
                          selectedArtwork === item.id
                            ? 'border border-black bg-white shadow-2xs'
                            : 'border border-transparent hover:border-neutral-300'
                        ]"
                      >
                        <img
                          :src="item.img"
                          :alt="item.name"
                          class="max-h-full max-w-full object-contain filter grayscale contrast-150 pointer-events-none"
                        />
                      </div>
                    </div>
                  </Transition>
                </div>

                <!-- 3C: Top 5 Graphics Sub-Menu Options (Strictly 5 items in a single row) -->
                <div
                  v-else-if="galleryView === 'top5'"
                  key="gallery-top5"
                  class="bg-[#f9f9f9] flex flex-col gap-[14px] h-[273px] p-[16px] rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full flex-none overflow-hidden"
                >
                  <div class="flex items-center justify-center w-full flex-none">
                    <span class="font-['Stanley_Favorit',sans-serif] text-[16px] tracking-[-0.48px] font-medium text-black border-b-[1.5px] border-black pb-1 select-none">
                      Top 5 Most Used Graphics
                    </span>
                  </div>
                  <!-- 5-Column Grid of Graphics (Strictly 5 items matching desktop) -->
                  <div class="grid grid-cols-5 gap-[8px] w-full py-1">
                    <div
                      v-for="item in top5Graphics"
                      :key="item.id"
                      @click="handleSelectArtwork(item.id)"
                      class="aspect-[1/1] sm:aspect-[89/119] rounded-[8px] p-2 flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 bg-[#f5f5f5]"
                      :class="[
                        selectedArtwork === item.id
                          ? 'border border-black bg-white shadow-2xs'
                          : 'border border-transparent hover:border-neutral-300'
                      ]"
                    >
                      <img
                        :src="item.img"
                        :alt="item.name"
                        class="max-h-full max-w-full object-contain filter grayscale contrast-150 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                <!-- 3D: Browse Categories Sub-Menu Options -->
                <div
                  v-else
                  key="gallery-categories"
                  class="bg-[#f9f9f9] flex flex-col gap-[12px] h-[273px] p-[16px] rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full flex-none overflow-hidden"
                >
                  <!-- Category Horizontal Tabs -->
                  <div class="flex gap-[16px] items-center overflow-x-auto no-scrollbar w-full flex-none py-1">
                    <button
                      type="button"
                      @click="activeCategoryTab = 'all'"
                      class="font-['Stanley_Favorit',sans-serif] text-[14px] tracking-[-0.3px] transition-all cursor-pointer pb-1 whitespace-nowrap select-none border-b-[1.5px]"
                      :class="activeCategoryTab === 'all' ? 'font-medium text-black border-black' : 'font-normal text-neutral-500 border-transparent hover:text-black'"
                    >
                      All Graphics
                    </button>
                    <button
                      type="button"
                      @click="activeCategoryTab = 'celebration'"
                      class="font-['Stanley_Favorit',sans-serif] text-[14px] tracking-[-0.3px] transition-all cursor-pointer pb-1 whitespace-nowrap select-none border-b-[1.5px]"
                      :class="activeCategoryTab === 'celebration' ? 'font-medium text-black border-black' : 'font-normal text-neutral-500 border-transparent hover:text-black'"
                    >
                      Celebration
                    </button>
                    <button
                      type="button"
                      @click="activeCategoryTab = 'family'"
                      class="font-['Stanley_Favorit',sans-serif] text-[14px] tracking-[-0.3px] transition-all cursor-pointer pb-1 whitespace-nowrap select-none border-b-[1.5px]"
                      :class="activeCategoryTab === 'family' ? 'font-medium text-black border-black' : 'font-normal text-neutral-500 border-transparent hover:text-black'"
                    >
                      Family
                    </button>
                    <button
                      type="button"
                      @click="activeCategoryTab = 'holiday'"
                      class="font-['Stanley_Favorit',sans-serif] text-[14px] tracking-[-0.3px] transition-all cursor-pointer pb-1 whitespace-nowrap select-none border-b-[1.5px]"
                      :class="activeCategoryTab === 'holiday' ? 'font-medium text-black border-black' : 'font-normal text-neutral-500 border-transparent hover:text-black'"
                    >
                      Holiday
                    </button>
                    <button
                      type="button"
                      @click="activeCategoryTab = 'pet-nature'"
                      class="font-['Stanley_Favorit',sans-serif] text-[14px] tracking-[-0.3px] transition-all cursor-pointer pb-1 whitespace-nowrap select-none border-b-[1.5px]"
                      :class="activeCategoryTab === 'pet-nature' ? 'font-medium text-black border-black' : 'font-normal text-neutral-500 border-transparent hover:text-black'"
                    >
                      Pet & Nature
                    </button>
                    <button
                      type="button"
                      @click="activeCategoryTab = 'sports'"
                      class="font-['Stanley_Favorit',sans-serif] text-[14px] tracking-[-0.3px] transition-all cursor-pointer pb-1 whitespace-nowrap select-none border-b-[1.5px]"
                      :class="activeCategoryTab === 'sports' ? 'font-medium text-black border-black' : 'font-normal text-neutral-500 border-transparent hover:text-black'"
                    >
                      Sports
                    </button>
                    <button
                      type="button"
                      @click="activeCategoryTab = 'zodiac'"
                      class="font-['Stanley_Favorit',sans-serif] text-[14px] tracking-[-0.3px] transition-all cursor-pointer pb-1 whitespace-nowrap select-none border-b-[1.5px]"
                      :class="activeCategoryTab === 'zodiac' ? 'font-medium text-black border-black' : 'font-normal text-neutral-500 border-transparent hover:text-black'"
                    >
                      Zodiac
                    </button>
                  </div>

                  <!-- 5-Column Grid of Graphics (Scrollable multi-row) -->
                  <Transition name="grid-fade" mode="out-in">
                    <div
                      :key="activeCategoryTab"
                      class="grid grid-cols-5 gap-[8px] w-full flex-1 overflow-y-auto overscroll-contain no-scrollbar py-1 pr-0.5"
                    >
                      <div
                        v-for="item in currentCategoryTabGraphics"
                        :key="item.id"
                        @click="handleSelectArtwork(item.id)"
                        class="aspect-[1/1] sm:aspect-[89/119] rounded-[8px] p-2 flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 bg-[#f5f5f5]"
                        :class="[
                          selectedArtwork === item.id
                            ? 'border border-black bg-white shadow-2xs'
                            : 'border border-transparent hover:border-neutral-300'
                        ]"
                      >
                        <img
                          :src="item.img"
                          :alt="item.name"
                          class="max-h-full max-w-full object-contain filter grayscale contrast-150 pointer-events-none"
                        />
                      </div>
                    </div>
                  </Transition>
                </div>
              </Transition>
            </div>
          </Transition>

          <!-- SUB-DRAWER: UPLOAD OWN DESIGN -->
          <Transition name="drawer-up">
            <div
              v-if="selectedSubCategory === 'upload'"
              class="fixed inset-0 z-50 h-[100dvh] w-full bg-white flex flex-col font-['Stanley_Favorit',sans-serif] overflow-hidden overscroll-none"
            >
              <!-- Drawer Header (75% Opacity with Backdrop Blur Style - No Border Line) -->
              <header class="absolute top-0 left-0 right-0 h-[64px] px-[16px] flex items-center justify-between bg-white/75 backdrop-blur-md z-30 flex-none">
                <button
                  type="button"
                  @click="selectedSubCategory = null"
                  class="font-['Stanley_Favorit',sans-serif] font-normal text-[16px] text-black hover:opacity-70 active:scale-95 transition-all cursor-pointer select-none"
                >
                  Cancel
                </button>
                <div class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] text-black tracking-[-0.48px]">
                  Upload Your Own Design
                </div>
                <button
                  type="button"
                  @click="applyEdits"
                  class="font-['Stanley_Favorit',sans-serif] font-bold text-[12px] px-[16px] py-[8px] rounded-[4px] bg-black text-white hover:bg-neutral-900 active:scale-95 transition-all cursor-pointer select-none shadow-xs"
                >
                  Apply
                </button>
              </header>

              <!-- Live Tumbler Preview Stage -->
              <div
                class="flex-1 flex flex-col items-center justify-center relative bg-[#fafafa] overflow-hidden"
              >
                <div class="relative h-full w-full flex items-center justify-center pointer-events-none overflow-hidden">
                  <img
                    :src="activeBlankImage"
                    :alt="product.name"
                    class="max-h-full max-w-full object-contain filter drop-shadow-lg transition-all duration-300 transform-gpu scale-[1.95] sm:scale-[2.0] translate-y-7 sm:translate-y-8"
                  />

                  <!-- Scaled Engraving Canvas Wrapper -->
                  <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div class="relative origin-center transform-gpu scale-[1.10] sm:scale-[1.12] pointer-events-auto">
                      <div
                        class="w-[191px] h-[280px] border border-dashed rounded-[8px] flex p-0 pointer-events-auto transition-all overflow-hidden no-scrollbar relative flex-col items-center justify-center"
                        :class="[
                          isProductColorLight ? 'border-neutral-800/80' : 'border-white/80'
                        ]"
                      >
                        <!-- If uploaded file present -->
                        <div
                          v-if="uploadedFileName"
                          class="w-[85px] h-[85px] flex items-center justify-center opacity-90 mix-blend-multiply border border-dashed border-neutral-700 rounded-lg p-2"
                        >
                          <UploadCloud :size="40" class="text-neutral-800" />
                        </div>
                        <div
                          v-else
                          class="w-full h-full flex flex-col items-center justify-center text-center p-0 select-none"
                        >
                          <p
                            class="font-['Stanley_Favorit',sans-serif] text-[14px] font-medium leading-normal tracking-tight whitespace-nowrap"
                            :class="isProductColorLight ? 'text-neutral-800/80' : 'text-white/90 drop-shadow-xs'"
                          >
                            Your design will appear here
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Bottom Upload Controls Panel -->
              <div class="bg-[#f9f9f9] p-4 flex flex-col gap-3 border-t border-neutral-100 flex-none rounded-t-[12px]">
                <div
                  @click="handleSimulatedUpload"
                  class="border-2 border-dashed border-neutral-300 hover:border-black rounded-xl p-4 flex items-center justify-center text-center gap-3 bg-white cursor-pointer transition-colors active:scale-[0.99]"
                >
                  <UploadCloud :size="24" class="text-neutral-500 shrink-0" />
                  <div class="flex flex-col text-left">
                    <div class="font-bold text-xs text-black">
                      {{ uploadedFileName ? `Uploaded: ${uploadedFileName}` : 'Tap to upload vector logo' }}
                    </div>
                    <div class="text-[10px] text-neutral-500">Supports SVG, PNG, EPS (Max 10MB)</div>
                  </div>
                </div>

                <div v-if="uploadedFileName" class="flex justify-between items-center px-1">
                  <span class="text-xs text-neutral-600 truncate max-w-[200px]">{{ uploadedFileName }}</span>
                  <button @click="handleRemoveUpload" class="text-xs text-red-600 font-medium hover:underline cursor-pointer">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </Transition>

          <!-- DISCARD CHANGES MODAL -->
          <Teleport to="body">
            <Transition name="bottom-drawer">
              <div
                v-if="showDiscardModal"
                class="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none"
              >
                <div class="bg-white rounded-t-[20px] sm:rounded-2xl p-6 sm:p-8 max-w-full sm:max-w-sm w-full flex flex-col gap-6 bottom-sheet-content border border-[#d9d9d9] shadow-2xl">
                  <div class="flex flex-col gap-2 w-full text-left">
                    <h3 class="font-['Stanley_Favorit',sans-serif] font-medium text-[20px] sm:text-[22px] text-black leading-tight">
                      Discard your design?
                    </h3>
                    <p class="font-['Stanley_Favorit',sans-serif] font-normal text-[13px] text-neutral-600 leading-[18px] mb-0">
                      You haven't applied your latest edits. If you close this now, your progress will be lost.
                    </p>
                  </div>
                  <div class="flex gap-3 w-full">
                    <button
                      type="button"
                      @click="confirmDiscard"
                      class="flex-1 border border-black hover:bg-neutral-100 text-black font-['Stanley_Favorit',sans-serif] font-normal text-[14px] py-[10px] px-[16px] rounded-[8px] transition-colors cursor-pointer text-center"
                    >
                      Discard
                    </button>
                    <button
                      type="button"
                      @click="showDiscardModal = false"
                      class="flex-1 bg-black hover:bg-neutral-800 text-white font-['Stanley_Favorit',sans-serif] font-normal text-[14px] py-[10px] px-[16px] rounded-[8px] transition-colors cursor-pointer text-center"
                    >
                      Keep Editing
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </Teleport>

          <!-- CLOSE STUDIO CONFIRMATION MODAL -->
          <Teleport to="body">
            <Transition name="bottom-drawer">
              <div
                v-if="showCloseConfirmModal"
                class="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none"
              >
                <div class="bg-white rounded-t-[20px] sm:rounded-2xl p-6 sm:p-8 max-w-full sm:max-w-sm w-full flex flex-col gap-6 bottom-sheet-content border border-[#d9d9d9] shadow-2xl">
                  <div class="flex flex-col gap-2 w-full text-left">
                    <h3 class="font-['Stanley_Favorit',sans-serif] font-medium text-[20px] sm:text-[22px] text-black leading-tight">
                      Leave Design Studio?
                    </h3>
                    <p class="font-['Stanley_Favorit',sans-serif] font-normal text-[13px] text-neutral-600 leading-[18px] mb-0">
                      You will exit the customizer studio and your current customization may not be saved.
                    </p>
                  </div>
                  <div class="flex gap-3 w-full">
                    <button
                      type="button"
                      @click="confirmStudioExit"
                      class="flex-1 border border-black hover:bg-neutral-100 text-black font-['Stanley_Favorit',sans-serif] font-normal text-[14px] py-[10px] px-[16px] rounded-[8px] transition-colors cursor-pointer text-center"
                    >
                      Leave Studio
                    </button>
                    <button
                      type="button"
                      @click="showCloseConfirmModal = false"
                      class="flex-1 bg-black hover:bg-neutral-800 text-white font-['Stanley_Favorit',sans-serif] font-normal text-[14px] py-[10px] px-[16px] rounded-[8px] transition-colors cursor-pointer text-center"
                    >
                      Keep Customizing
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </Teleport>

          <!-- INSUFFICIENT SPACE FOR GRAPHIC MODAL -->
          <Teleport to="body">
            <Transition name="bottom-drawer">
              <div
                v-if="showSpaceModal"
                class="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none"
              >
                <div class="bg-white rounded-t-[20px] sm:rounded-2xl p-6 max-w-full sm:max-w-xs w-full flex flex-col gap-4 text-center bottom-sheet-content">
                  <h3 class="font-bold text-lg text-black">Not Enough Space for Graphic</h3>
                  <p class="text-xs text-neutral-600 leading-relaxed">
                    Your current text fills the engraving zone. Shorten your text or reduce font size to make room for a graphic.
                  </p>
                  <div class="flex flex-col gap-2 pt-2">
                    <button
                      @click="openMobileTextToAdjust"
                      class="w-full py-2.5 bg-black hover:bg-neutral-800 text-white rounded-lg font-bold text-sm transition-colors cursor-pointer"
                    >
                      Adjust Text
                    </button>
                    <button
                      @click="showSpaceModal = false"
                      class="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black rounded-lg font-medium text-sm transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </Teleport>

          <!-- SPECIAL GRAPHIC HERO SLIDER POPUP MODAL (Figma Node 5660:1148) -->
          <Teleport to="body">
            <Transition name="fade">
              <div
                v-if="showSpecialGraphicPopup"
                @click="closeSpecialGraphicPopup"
                class="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none"
                data-node-id="5660:1148"
                data-name="Special Graphic Hero Popup"
              >
                <div
                  @click.stop
                  @touchstart="handlePopupTouchStart"
                  @touchend="handlePopupTouchEnd"
                  class="relative w-[320px] sm:w-[340px] h-[450px] rounded-[8px] overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10"
                  data-node-id="5660:1148"
                >
                  <!-- Background Image Carousel (Figma Node 5710:7528) -->
                  <Transition name="fade" mode="out-in">
                    <img
                      :key="graphicCampaigns[specialSlideIndex].id"
                      :src="graphicCampaigns[specialSlideIndex].bannerImg"
                      :alt="graphicCampaigns[specialSlideIndex].title"
                      class="absolute inset-0 w-full h-full object-cover pointer-events-none transform-gpu"
                      data-node-id="5710:7528"
                    />
                  </Transition>

                  <!-- Dark Vignette Gradient -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20 pointer-events-none" />

                  <!-- Top Right Close Button (Figma Node 5710:7546) -->
                  <button
                    type="button"
                    @click="closeSpecialGraphicPopup"
                    class="absolute top-[11px] right-[11px] size-[32px] rounded-full bg-white text-black flex items-center justify-center shadow-md hover:bg-neutral-100 active:scale-90 transition-all cursor-pointer z-30"
                    data-node-id="5710:7546"
                    data-name="Close Button"
                    aria-label="Close special graphic popup"
                  >
                    <X :size="18" :stroke-width="2.2" />
                  </button>

                  <!-- Bottom Hero Content Container (Figma Node 5710:7530) -->
                  <div
                    class="absolute left-0 right-0 bottom-0 p-[21px] flex flex-col gap-[16px] z-20"
                    data-node-id="5710:7530"
                    data-name="Hero Content Container"
                  >
                    <!-- Campaign Title & Subtitle (Figma Node 5710:7531) -->
                    <div class="flex flex-col font-['Stanley_Favorit',sans-serif] font-bold text-[17.5px] leading-[21px] text-white tracking-[-0.5px] select-none" data-node-id="5710:7531">
                      <p class="m-0">{{ graphicCampaigns[specialSlideIndex].title }}</p>
                      <p class="m-0 text-white/95">{{ graphicCampaigns[specialSlideIndex].subtitle }}</p>
                    </div>

                    <!-- Button & Pagination Row (Figma Node 5710:7532) -->
                    <div class="flex items-center justify-between w-full" data-node-id="5710:7532">
                      <!-- Explore Graphics Button (Figma Node 5710:7533) -->
                      <button
                        type="button"
                        @click="exploreCampaign(graphicCampaigns[specialSlideIndex].id)"
                        class="bg-[#f5f5f5] hover:bg-white text-black h-[35px] px-[14px] py-[8px] rounded-[8px] font-['Stanley_Favorit',sans-serif] font-bold text-[10.5px] flex items-center gap-[7px] transition-all cursor-pointer active:scale-95 shadow-sm shrink-0 select-none"
                        data-node-id="5710:7533"
                      >
                        <span>Explore Graphics</span>
                        <div class="size-[14px] rounded-full bg-neutral-400 flex items-center justify-center shrink-0">
                          <svg class="size-[9px] text-white stroke-[2.5]" viewBox="0 0 12 12" fill="none" stroke="currentColor">
                            <path d="M6 2.5v7M2.5 6h7" stroke-linecap="round" />
                          </svg>
                        </div>
                      </button>

                      <!-- Pagination Dots (Figma Node 5710:7534) -->
                      <div class="flex items-center gap-[6px]" data-node-id="5710:7534">
                        <button
                          v-for="(camp, idx) in graphicCampaigns"
                          :key="camp.id"
                          type="button"
                          @click.stop="specialSlideIndex = idx"
                          class="size-[7px] rounded-full transition-all duration-300 cursor-pointer p-0 border-0"
                          :class="specialSlideIndex === idx ? 'bg-white opacity-100' : 'bg-white/50 opacity-60 hover:opacity-90'"
                          :aria-label="`Go to slide ${idx + 1}`"
                        ></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </Teleport>

          <!-- COLLAB INFO BOTTOM MODAL (Figma Node 5711:7623) -->
          <Teleport to="body">
            <Transition name="bottom-drawer">
              <div
                v-if="isCollabInfoModalOpen"
                @click="closeCollabInfoModal"
                class="fixed inset-0 z-[130] bg-black/50 backdrop-blur-xs flex items-end justify-center font-['Stanley_Favorit',sans-serif]"
              >
                <div
                  @click.stop
                  class="w-full max-w-[430px] bg-[#fafafa] rounded-tl-[20px] rounded-tr-[20px] p-[20px] pb-[32px] flex flex-col gap-[20px] shadow-2xl relative bottom-sheet-content"
                  data-node-id="5711:7623"
                  data-name="Design Container"
                >
                  <!-- CTA / Content Container (Figma Node 5711:7626) -->
                  <div class="flex flex-col gap-[20px] items-start justify-center relative shrink-0 w-full" data-node-id="5711:7626" data-name="CTA">
                    <!-- Header Text Container (Figma Node 5711:7627) -->
                    <div class="flex items-center justify-between relative shrink-0 w-full" data-node-id="5711:7627" data-name="Header Text Container">
                      <div class="flex flex-col font-['Stanley_Favorit',sans-serif] font-medium justify-center text-[20px] text-black leading-tight" data-node-id="5711:7628">
                        <p class="leading-[normal] m-0">{{ currentCollabCampaign.title.replace(/\.$/, '') }}</p>
                      </div>
                      <button
                        type="button"
                        @click="closeCollabInfoModal"
                        class="w-7 h-7 rounded-full bg-neutral-200/70 hover:bg-neutral-300 active:scale-90 text-neutral-800 flex items-center justify-center transition-all cursor-pointer"
                        aria-label="Close collab info"
                      >
                        <X :size="16" />
                      </button>
                    </div>

                    <!-- Add artwork / Hero & Description (Figma Node 5711:7629) -->
                    <div class="flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-node-id="5711:7629" data-name="Add artwork">
                      <!-- Hero Image (Figma Node 5711:7630) -->
                      <div class="h-[161px] relative rounded-[8px] overflow-hidden shrink-0 w-full shadow-xs" data-node-id="5711:7630" data-name="Hero Image">
                        <img
                          :src="currentCollabCampaign.bannerImg"
                          :alt="currentCollabCampaign.title"
                          class="absolute inset-0 w-full h-full object-cover rounded-[8px]"
                        />
                        <div class="absolute inset-0 bg-black/10 rounded-[8px] pointer-events-none"></div>
                      </div>

                      <!-- Description (Figma Node 5711:7631) -->
                      <div class="flex flex-col font-['Stanley_Favorit',sans-serif] justify-center text-[14px] text-black w-full" data-node-id="5711:7631">
                        <p class="leading-[20px] m-0">{{ currentCollabCampaign.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </Teleport>

          <!-- SET POSITION DRAWER (Figma Node 5695:9100) -->
          <Teleport to="body">
            <Transition name="bottom-drawer">
              <div
                v-if="isPositionDrawerOpen"
                @click="isPositionDrawerOpen = false"
                class="fixed inset-0 z-[60] bg-transparent flex items-end justify-center font-['Stanley_Favorit',sans-serif]"
              >
                <div
                  @click.stop
                  class="w-full max-w-[430px] bg-[#fafafa] rounded-tl-[20px] rounded-tr-[20px] p-[20px] pb-[32px] flex flex-col gap-[20px] shadow-2xl relative bottom-sheet-content"
                  data-node-id="5695:9100"
                  data-name="Design Container"
                >
                  <!-- Header Container (Node 5695:9104) -->
                  <div class="flex items-center justify-between w-full">
                    <h3 class="font-['Stanley_Favorit',sans-serif] font-medium text-[20px] text-black tracking-[-0.6px] leading-tight m-0">
                      Adjust
                    </h3>
                    <button
                      type="button"
                      @click="isPositionDrawerOpen = false"
                      class="w-8 h-8 rounded-full bg-neutral-200/70 hover:bg-neutral-300 active:scale-90 text-neutral-800 flex items-center justify-center transition-all cursor-pointer"
                      aria-label="Close position drawer"
                    >
                      <X :size="18" />
                    </button>
                  </div>

                  <!-- Section 1: Orientation (Horizontal / Vertical) - Appears if text is present -->
                  <div
                    v-if="hasTextPresent"
                    class="flex flex-col gap-[12px] w-full"
                    data-node-id="5695:9110"
                  >
                    <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[15px] text-black tracking-[-0.48px]">
                      Orientation
                    </span>
                    <div class="border border-black rounded-[8px] flex h-[45px] overflow-hidden bg-white">
                      <button
                        type="button"
                        @click="handleSetOrientation('horizontal')"
                        class="flex-1 h-full flex items-center justify-center font-['Stanley_Favorit',sans-serif] text-[13px] tracking-[-0.36px] transition-colors cursor-pointer select-none"
                        :class="activeOrientation === 'horizontal' ? 'bg-black text-white font-medium' : 'bg-transparent text-black hover:bg-black/5'"
                      >
                        Horizontal
                      </button>
                      <button
                        type="button"
                        @click="handleSetOrientation('vertical')"
                        class="flex-1 h-full flex items-center justify-center font-['Stanley_Favorit',sans-serif] text-[13px] tracking-[-0.36px] transition-colors cursor-pointer select-none"
                        :class="activeOrientation === 'vertical' ? 'bg-black text-white font-medium' : 'bg-transparent text-black hover:bg-black/5'"
                      >
                        Vertical
                      </button>
                    </div>
                  </div>

                  <!-- Section 2: Set Position (Hidden on Vertical orientation or when text is full zone) -->
                  <div
                    v-if="activeOrientation === 'horizontal' && !(hasTextPresent && !hasGraphicPresent && isTextFullZone)"
                    class="flex flex-col gap-[12px] w-full"
                    data-node-id="5695:9120"
                  >
                    <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[15px] text-black tracking-[-0.48px]">
                      {{ hasBothPresent ? 'Graphic Position' : 'Set Position' }}
                    </span>
                    <div class="border border-black rounded-[8px] flex h-[45px] overflow-hidden bg-white">
                      <button
                        type="button"
                        @click="handleSetPlacement('top')"
                        class="flex-1 h-full flex items-center justify-center font-['Stanley_Favorit',sans-serif] text-[13px] tracking-[-0.36px] transition-colors cursor-pointer select-none"
                        :class="activePlacement === 'top' ? 'bg-black text-white font-medium' : 'bg-transparent text-black hover:bg-black/5'"
                      >
                        Top
                      </button>
                      <button
                        type="button"
                        @click="handleSetPlacement('center')"
                        class="flex-1 h-full flex items-center justify-center font-['Stanley_Favorit',sans-serif] text-[13px] tracking-[-0.36px] transition-colors cursor-pointer select-none"
                        :class="activePlacement === 'center' ? 'bg-black text-white font-medium' : 'bg-transparent text-black hover:bg-black/5'"
                      >
                        Center
                      </button>
                      <button
                        type="button"
                        @click="handleSetPlacement('bottom')"
                        class="flex-1 h-full flex items-center justify-center font-['Stanley_Favorit',sans-serif] text-[13px] tracking-[-0.36px] transition-colors cursor-pointer select-none"
                        :class="activePlacement === 'bottom' ? 'bg-black text-white font-medium' : 'bg-transparent text-black hover:bg-black/5'"
                      >
                        Bottom
                      </button>
                    </div>
                  </div>

                  <!-- Section: Graphic Size (S / M / L) - Appears if Graphic is present -->
                  <div
                    v-if="hasGraphicPresent"
                    class="flex flex-col gap-[12px] w-full"
                    data-name="Graphic Size Container"
                  >
                    <div class="flex items-center justify-between">
                      <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[15px] text-black tracking-[-0.48px]">
                        Graphic Size
                      </span>
                      <span class="text-[12px] text-neutral-500 font-['Stanley_Favorit',sans-serif]">
                        {{ appliedState.graphicSize === 'S' ? 'Small (Smaller)' : appliedState.graphicSize === 'L' ? 'Large (Fill Zone)' : 'Standard (Proportional)' }}
                      </span>
                    </div>
                    <div class="border border-black rounded-[8px] flex h-[45px] overflow-hidden bg-white">
                      <button
                        type="button"
                        @click="handleSetGraphicSize('S')"
                        class="flex-1 h-full flex items-center justify-center font-['Stanley_Favorit',sans-serif] text-[13px] tracking-[-0.36px] transition-colors cursor-pointer select-none"
                        :class="appliedState.graphicSize === 'S' ? 'bg-black text-white font-medium' : 'bg-transparent text-black hover:bg-black/5'"
                      >
                        Small
                      </button>
                      <button
                        type="button"
                        @click="handleSetGraphicSize('M')"
                        class="flex-1 h-full flex items-center justify-center font-['Stanley_Favorit',sans-serif] text-[13px] tracking-[-0.36px] transition-colors cursor-pointer select-none"
                        :class="appliedState.graphicSize === 'M' ? 'bg-black text-white font-medium' : 'bg-transparent text-black hover:bg-black/5'"
                      >
                        Standard
                      </button>
                      <button
                        type="button"
                        @click="handleSetGraphicSize('L')"
                        class="flex-1 h-full flex items-center justify-center font-['Stanley_Favorit',sans-serif] text-[13px] tracking-[-0.36px] transition-colors cursor-pointer select-none"
                        :class="appliedState.graphicSize === 'L' ? 'bg-black text-white font-medium' : 'bg-transparent text-black hover:bg-black/5'"
                      >
                        Large
                      </button>
                    </div>
                  </div>

                  <!-- Done CTA Button -->
                  <button
                    type="button"
                    @click="isPositionDrawerOpen = false"
                    class="w-full h-[46px] bg-black text-white rounded-[8px] font-['Stanley_Favorit',sans-serif] font-bold text-[14px] flex items-center justify-center hover:bg-neutral-900 active:scale-[0.99] transition-all cursor-pointer shadow-md mt-2"
                  >
                    Done
                  </button>
                </div>
              </div>
            </Transition>
          </Teleport>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Writing mode vertical helper (Left-to-Right columns so 1st line is left, 2nd line is right) */
.writing-vertical {
  writing-mode: vertical-lr;
  text-orientation: mixed;
  word-break: break-word;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

/* 1. Full Screen Slide Modal Transition */
.slide-modal-enter-active,
.slide-modal-leave-active {
  transition: transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
}
.slide-modal-enter-from,
.slide-modal-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* 2. Full-Screen Sub-Drawers Transition (Text Customizer & Browse Gallery) */
.drawer-up-enter-active,
.drawer-up-leave-active,
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease;
}
.drawer-up-enter-from,
.drawer-up-leave-to,
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0.8;
}

/* 3. Step Switching Transition (Step 1 -> Step 2 -> Step 3) */
.step-fade-enter-active,
.step-fade-leave-active {
  transition: opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1), transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}
.step-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.step-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 4. Sub-Menu & Bottom Options Transition */
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.panel-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* 5. Text Customizer Tabs (Font Style, Size, Placement) */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 6. Graphics Grid Tabs Transition (Categories & Special Graphics) */
.grid-fade-enter-active,
.grid-fade-leave-active {
  transition: opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}
.grid-fade-enter-from {
  opacity: 0;
  transform: scale(0.98);
}
.grid-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* 7. General Fade / Backdrop Overlay Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Bottom Drawer / Sticky Popups Transition (Slide-up from bottom) */
.bottom-drawer-enter-active,
.bottom-drawer-leave-active {
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.bottom-drawer-enter-active .bottom-sheet-content,
.bottom-drawer-leave-active .bottom-sheet-content {
  transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}
.bottom-drawer-enter-from,
.bottom-drawer-leave-to {
  opacity: 0;
}
.bottom-drawer-enter-from .bottom-sheet-content,
.bottom-drawer-leave-to .bottom-sheet-content {
  transform: translateY(100%);
}

/* Scale Up Animation for Modals & Badges */
@keyframes scaleUp {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-scale-up {
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Blinking Cursor Animation */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.animate-blink {
  animation: blink 1s infinite;
}
</style>
