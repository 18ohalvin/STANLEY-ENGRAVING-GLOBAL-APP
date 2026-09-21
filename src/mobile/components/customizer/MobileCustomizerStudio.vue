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
  SlidersHorizontal
} from 'lucide-vue-next'
import type { Product, ProductColor } from '@/data/catalog'
import { PRODUCTS, getEngravingProfile } from '@/data/catalog'
import {
  type GraphicItem,
  type GraphicCampaign,
  graphicCampaigns,
  topGraphics as top5Graphics,
  juventusGraphics,
  liunicGraphics,
  natureGraphics,
  symbolsGraphics,
  animalsGraphics,
  zodiacGraphics,
  celebrationsGraphics,
  uniqueGraphics,
  getGraphicById,
  getGraphicImage
} from '@/data/graphics'

// Blank tumbler stage images
import blankIceflowImg from '@/assets/images/artist-drop-iceflow.png'
import quencherGreenBlankImg from '@/assets/products/quencher-green-blank.png'

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
const activeCategoryTab = ref<'all' | 'animals' | 'nature' | 'zodiac' | 'celebrations' | 'symbols'>('all')
const engravingText = ref('')
const selectedFont = ref<string | null>(null)
const selectedArtwork = ref<string | null>(props.initialArtwork || null)
const selectedPlacement = ref<'center' | 'top' | 'bottom' | 'left' | 'right' | null>('center')
const textOrientation = ref<'vertical' | 'horizontal'>('horizontal')
const selectedFontSize = ref<'S' | 'M' | 'L' | 'XL'>('M')
const stackOrder = ref<'graphic-top' | 'text-top'>('graphic-top')
const uploadedFileName = ref<string | null>(null)
const showDiscardModal = ref(false)
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

const getAvailableTextHeight = () => {
  const totalZoneHeight = 280
  const hasGraphic = Boolean(appliedState.value.artwork || selectedArtwork.value || appliedState.value.uploadedFile)
  if (!hasGraphic) return totalZoneHeight
  
  const placement = appliedState.value.graphicPlacement || draftGraphicPlacement.value || 'center'
  const gSize = appliedState.value.graphicSize || draftGraphicSize.value || 'M'
  const gHeight = gSize === 'L' ? 150 : gSize === 'S' ? 70 : 100

  if (placement === 'top' || placement === 'bottom') {
    return Math.max(30, totalZoneHeight - gHeight - 8)
  }
  // center placement
  return Math.max(30, Math.floor((totalZoneHeight - gHeight) / 2) - 8)
}

const checkTextFits = (testText: string): boolean => {
  if (!testText) return true
  const el = textMeasureBoxRef.value
  if (!el) return true
  
  const maxH = getAvailableTextHeight()
  const maxW = 191
  
  if (draftOrientation.value === 'vertical') {
    el.style.maxWidth = `${maxH}px`
    el.style.width = 'auto'
    el.style.maxHeight = `${maxW}px`
    el.style.height = 'auto'
    el.textContent = testText
    const scrollW = el.scrollWidth
    const scrollH = el.scrollHeight
    return scrollW <= maxH + 4 && scrollH <= maxW + 5
  } else {
    el.style.maxHeight = `${maxH}px`
    el.style.height = 'auto'
    el.style.maxWidth = `${maxW}px`
    el.style.width = `${maxW}px`
  }
  
  el.textContent = testText
  
  const scrollH = el.scrollHeight
  const scrollW = el.scrollWidth
  
  return scrollH <= maxH + 4 && scrollW <= maxW + 5
}

const fitTextToAvailableSpace = (text: string): string => {
  if (!text) return ''
  if (checkTextFits(text)) return text
  
  let low = 0
  let high = text.length
  let best = ''
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    const candidate = text.slice(0, mid)
    if (checkTextFits(candidate)) {
      best = candidate
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return best
}

watch([draftFontSize, draftFont, draftOrientation, draftGraphicSize, draftGraphicPlacement], () => {
  if (draftText.value) {
    const fitted = fitTextToAvailableSpace(draftText.value)
    if (fitted !== draftText.value) {
      draftText.value = fitted
    }
  }
})

const formattedDraftVerticalLines = computed(() => {
  if (!draftText.value) return []
  return draftText.value.split('\n')
})

const formattedAppliedVerticalLines = computed(() => {
  if (!appliedState.value.text) return []
  return appliedState.value.text.split('\n')
})

// Figma Node 5699:7177 8 Curated Fonts
const fontOptions = [
  { name: 'Stanley Favorite', line1: 'Stanley', line2: 'Favorite', class: "font-['Stanley_Favorit',sans-serif] font-medium", caseMode: 'universal' as const },
  { name: 'Dancing Script', line1: 'Dancing', line2: 'Script', class: "font-['Dancing_Script',cursive]", caseMode: 'universal' as const },
  { name: 'Space Mono', line1: 'Space', line2: 'Mono', class: "font-['Space_Mono',monospace]", caseMode: 'universal' as const },
  { name: 'Gasoek One', line1: 'Gasoek', line2: 'One', class: "font-['Gasoek_One',sans-serif]", caseMode: 'universal' as const },
  { name: 'Caveat', singleLine: 'Caveat', class: "font-['Caveat',cursive]", caseMode: 'universal' as const },
  { name: 'Cinzel', singleLine: 'Cinzel', class: "font-['Cinzel',serif]", caseMode: 'uppercase' as const },
  { name: 'Playfair Display', line1: 'Playfair', line2: 'Display', class: "font-['Playfair_Display',serif]", caseMode: 'universal' as const },
  { name: 'Bebas Neue', singleLine: 'BEBAS NEUE', class: "font-['Bebas_Neue',sans-serif] tracking-wider", caseMode: 'uppercase' as const },
]

const isFontUppercase = (fontNameOrClass: string | null | undefined): boolean => {
  if (!fontNameOrClass) return false
  const font = fontOptions.find(f => f.name === fontNameOrClass || f.class === fontNameOrClass)
  return font?.caseMode === 'uppercase'
}

const availableSizes = computed(() => {
  return ['30 oz', '40 oz', '50 oz', '64 oz']
})

const activeBlankImage = computed(() => {
  return selectedColor.value?.blankImage || blankIceflowImg
})

const hasPersonalization = computed(() => {
  return Boolean(appliedState.value.text.trim() || appliedState.value.artwork || appliedState.value.uploadedFile)
})

const isApplyActive = computed(() => {
  return draftText.value.trim().length > 0
})

const allSpecialGraphics = computed(() => uniqueGraphics)

const currentTabGraphics = computed(() => {
  if (activeSpecialTab.value === 'juventus') return juventusGraphics
  if (activeSpecialTab.value === 'outdoor') return natureGraphics
  return liunicGraphics
})

const currentCategoryTabGraphics = computed(() => {
  if (activeCategoryTab.value === 'animals') return animalsGraphics
  if (activeCategoryTab.value === 'nature') return natureGraphics
  if (activeCategoryTab.value === 'zodiac') return zodiacGraphics
  if (activeCategoryTab.value === 'celebrations') return celebrationsGraphics
  if (activeCategoryTab.value === 'symbols') return symbolsGraphics
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
  return (
    item.category === 'juventus' ||
    item.category === 'artist-drop' ||
    item.club === 'Juventus FC' ||
    juventusGraphics.some(g => g.id === id) ||
    liunicGraphics.some(g => g.id === id)
  )
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
    return (
      draftText.value !== appliedState.value.text ||
      draftFont.value !== (appliedState.value.font || fontOptions[0].class) ||
      draftFontSize.value !== appliedState.value.fontSize ||
      draftPlacement.value !== (appliedState.value.placement || 'center') ||
      draftOrientation.value !== appliedState.value.orientation
    )
  }
  if (selectedSubCategory.value === 'gallery') {
    return selectedArtwork.value !== appliedState.value.artwork
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

const handleSetOrientation = (val: 'horizontal' | 'vertical') => {
  appliedState.value.orientation = val
  draftOrientation.value = val
  if (val === 'vertical') {
    appliedState.value.placement = 'center'
    draftPlacement.value = 'center'
  } else {
    if (!appliedState.value.placement || appliedState.value.placement === 'left' || appliedState.value.placement === 'right') {
      appliedState.value.placement = 'center'
      draftPlacement.value = 'center'
    }
  }
}

const handleSetPlacement = (val: 'top' | 'bottom' | 'center' | 'left' | 'right') => {
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
  const placement = appliedState.value.graphicPlacement || 'center'
  if (placement === 'top') return { position: 'absolute', top: '0px', left: '0px', right: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  if (placement === 'bottom') return { position: 'absolute', bottom: '0px', left: '0px', right: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  return { position: 'absolute', top: '50%', left: '0px', right: '0px', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
})

const dynamicAppliedTextContainerStyle = computed(() => {
  const hasGraphic = Boolean(appliedState.value.artwork || appliedState.value.uploadedFile)
  if (!hasGraphic) {
    return { position: 'absolute', inset: '0px' }
  }
  const placement = appliedState.value.graphicPlacement || 'center'
  const gSize = appliedState.value.graphicSize || 'M'
  const gHeight = gSize === 'L' ? 130 : gSize === 'S' ? 60 : 90
  
  if (placement === 'top') return { position: 'absolute', left: '0px', right: '0px', bottom: '0px', top: `${gHeight + 4}px` }
  if (placement === 'bottom') return { position: 'absolute', left: '0px', right: '0px', top: '0px', bottom: `${gHeight + 4}px` }
  if (appliedState.value.stackOrder === 'text-top') {
    return { position: 'absolute', left: '0px', right: '0px', top: '0px', bottom: `calc(50% + ${gHeight / 2 + 4}px)` }
  } else {
    return { position: 'absolute', left: '0px', right: '0px', bottom: '0px', top: `calc(50% + ${gHeight / 2 + 4}px)` }
  }
})

const dynamicDraftGraphicContainerStyle = computed(() => {
  const placement = appliedState.value.graphicPlacement || draftGraphicPlacement.value || 'center'
  if (placement === 'top') return { position: 'absolute', top: '0px', left: '0px', right: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  if (placement === 'bottom') return { position: 'absolute', bottom: '0px', left: '0px', right: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  return { position: 'absolute', top: '50%', left: '0px', right: '0px', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
})

const dynamicDraftTextContainerStyle = computed(() => {
  const hasGraphic = Boolean(appliedState.value.artwork || appliedState.value.uploadedFile)
  if (!hasGraphic) {
    return { position: 'absolute', inset: '0px' }
  }
  const placement = appliedState.value.graphicPlacement || draftGraphicPlacement.value || 'center'
  const gSize = appliedState.value.graphicSize || draftGraphicSize.value || 'M'
  const gHeight = gSize === 'L' ? 130 : gSize === 'S' ? 60 : 90
  
  if (placement === 'top') return { position: 'absolute', left: '0px', right: '0px', bottom: '0px', top: `${gHeight + 4}px` }
  if (placement === 'bottom') return { position: 'absolute', left: '0px', right: '0px', top: '0px', bottom: `${gHeight + 4}px` }
  if (appliedState.value.stackOrder === 'text-top') {
    return { position: 'absolute', left: '0px', right: '0px', top: '0px', bottom: `calc(50% + ${gHeight / 2 + 4}px)` }
  } else {
    return { position: 'absolute', left: '0px', right: '0px', bottom: '0px', top: `calc(50% + ${gHeight / 2 + 4}px)` }
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
  if (!selectedArtwork.value) {
    selectedArtwork.value = 'viking-juve'
  }
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
  selectedArtwork.value = appliedState.value.artwork
  galleryView.value = 'menu'
  selectedSubCategory.value = 'gallery'
}

const openSpecialGraphicView = () => {
  galleryView.value = 'special-graphic'
  if (!selectedArtwork.value) {
    selectedArtwork.value = 'viking-juve'
  }
  triggerFloatingButtonsAutoExpand()
}

const openTop5View = () => {
  galleryView.value = 'top5'
  if (!selectedArtwork.value) {
    selectedArtwork.value = 'viking-juve'
  }
  triggerFloatingButtonsAutoExpand()
}

const openCategoriesView = () => {
  galleryView.value = 'categories'
  if (!selectedArtwork.value) {
    selectedArtwork.value = 'viking-juve'
  }
  triggerFloatingButtonsAutoExpand()
}

const handleCancelGallery = () => {
  if (galleryView.value !== 'menu') {
    selectedArtwork.value = appliedState.value.artwork
    galleryView.value = 'menu'
  } else {
    selectedSubCategory.value = null
  }
}

const handleApplyGallery = () => {
  appliedState.value.artwork = selectedArtwork.value
  appliedState.value.graphicPlacement = draftGraphicPlacement.value || appliedState.value.graphicPlacement || 'center'
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
  rawDraftText.value = appliedState.value.text
  draftText.value = appliedState.value.text
  draftFont.value = appliedState.value.font || fontOptions[0].class
  draftFontSize.value = appliedState.value.fontSize || 'M'
  draftPlacement.value = appliedState.value.placement || 'center'
  draftOrientation.value = appliedState.value.orientation || 'horizontal'

  // If graphic is present, automatically configure text under or upper based on graphic placement
  if (appliedState.value.artwork || selectedArtwork.value || appliedState.value.uploadedFile) {
    const gPlacement = appliedState.value.graphicPlacement || draftGraphicPlacement.value || 'center'
    if (gPlacement === 'bottom' || gPlacement === 'right') {
      appliedState.value.stackOrder = 'text-top'
      stackOrder.value = 'text-top'
    } else {
      appliedState.value.stackOrder = 'graphic-top'
      stackOrder.value = 'graphic-top'
    }
  }

  textActiveTab.value = 'style'
  isTextFocused.value = true
  selectedSubCategory.value = 'text'
  nextTick(() => {
    textInputRef.value?.focus()
  })
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
  const fitted = fitTextToAvailableSpace(candidate)
  rawDraftText.value = candidate
  draftText.value = fitted
  if (target.value !== fitted) {
    target.value = fitted
  }
}

const handleAttemptClose = () => {
  if (hasUnsavedEdits.value) {
    showDiscardModal.value = true
  } else {
    emit('close')
  }
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

  selectedArtwork.value = appliedState.value.artwork
  uploadedFileName.value = appliedState.value.uploadedFile
  stackOrder.value = appliedState.value.stackOrder
  showDiscardModal.value = false
  selectedSubCategory.value = null
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
          
          <!-- 1. Header (Figma Node 5654:2011 / 5655:7301 - 60% Opacity Overlay) -->
          <header class="absolute top-0 left-0 right-0 z-30 bg-white/60 backdrop-blur-md px-[16px] h-[64px] flex items-center justify-between border-b border-neutral-100/60" data-node-id="5655:7301" data-name="Title Text">
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
              <div class="relative h-full w-full flex items-center justify-center pointer-events-none overflow-hidden" data-node-id="5256:8578" data-name="Iceflow copy 1">
                <img
                  :src="currentStep >= 2 ? activeBlankImage : (selectedColor?.image || product.defaultImage)"
                  :alt="product.name"
                  class="max-h-full max-w-full object-contain filter drop-shadow-lg transition-all duration-300 transform-gpu"
                  :class="currentStep >= 2 ? 'scale-[1.95] sm:scale-[2.0] translate-y-7 sm:translate-y-8' : 'scale-100'"
                />

                <!-- Scaled Engraving Canvas Wrapper (Exact same alignment and scale as Browse Gallery) -->
                <div
                  v-if="currentStep >= 2"
                  class="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div class="relative origin-center transform-gpu scale-[1.10] sm:scale-[1.12] pointer-events-auto">
                    <!-- Dashed Bounding Box (w-[191px] h-[280px]) placed squarely inside green area under lid -->
                    <div
                      class="w-[191px] h-[280px] border border-dashed rounded-[8px] flex p-0 pointer-events-auto transition-all overflow-hidden no-scrollbar relative"
                      :class="[
                        isProductColorLight ? 'border-neutral-800/80' : 'border-white/80',
                        'flex-col items-center justify-between',
                        currentStep === 2 ? 'cursor-pointer' : 'pointer-events-none'
                      ]"
                      @click="currentStep === 2 ? openTextEditor() : null"
                    >
                      <!-- If user haven't set any text/graphic (blank live preview with helper text) -->
                      <div
                        v-if="!appliedState.text && !appliedState.artwork && !appliedState.uploadedFile"
                        class="w-full h-full flex flex-col items-center justify-center text-center p-0 select-none"
                      >
                        <p
                          class="font-['Stanley_Favorit',sans-serif] text-[13px] sm:text-[14px] font-medium leading-tight tracking-tight max-w-[150px]"
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
                          <div
                            class="laser-engraved-mask transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                            :style="{
                              ...dynamicAppliedGraphicStyle,
                              maskImage: `url('${getArtworkImage(appliedState.artwork)}')`,
                              WebkitMaskImage: `url('${getArtworkImage(appliedState.artwork)}')`,
                            }"
                          ></div>
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
                          class="absolute flex flex-col items-center transition-all duration-200 pointer-events-none overflow-hidden"
                          :style="dynamicAppliedTextContainerStyle"
                          :class="[
                            appliedState.orientation === 'vertical'
                              ? 'justify-center items-center'
                              : (appliedState.placement === 'top' ? 'justify-start' : appliedState.placement === 'bottom' ? 'justify-end' : 'justify-center')
                          ]"
                        >
                          <div
                            class="text-white font-bold opacity-95 select-none whitespace-pre-wrap transition-all drop-shadow-xs"
                            :class="[
                              appliedState.font || fontOptions[0].class,
                              isFontUppercase(appliedState.font) ? 'uppercase' : '',
                              (appliedState.graphicSize === 'L' && appliedState.artwork)
                                ? (appliedState.fontSize === 'S'
                                    ? 'text-[19px] leading-[1.2]'
                                    : appliedState.fontSize === 'M'
                                    ? 'text-[24px] leading-[1.15]'
                                    : appliedState.fontSize === 'L'
                                    ? 'text-[29px] leading-[1.1]'
                                    : 'text-[36px] leading-[1.05]')
                                : (appliedState.fontSize === 'S'
                                    ? 'text-[24px] leading-[1.2]'
                                    : appliedState.fontSize === 'M'
                                    ? 'text-[36px] leading-[1.1]'
                                    : appliedState.fontSize === 'L'
                                    ? 'text-[48px] leading-[1.05]'
                                    : 'text-[60px] leading-[1.0]'),
                              appliedState.orientation === 'vertical'
                                ? '-rotate-90 transform-gpu whitespace-nowrap flex flex-col items-center justify-center text-center tracking-wider'
                                : 'text-center w-full max-w-full break-words tracking-wider'
                            ]"
                          >
                            <template v-if="appliedState.orientation === 'vertical'">
                              <div
                                v-for="(line, idx) in formattedAppliedVerticalLines"
                                :key="idx"
                                class="whitespace-nowrap text-center leading-tight"
                                :class="idx > 0 ? 'mt-1' : ''"
                              >
                                {{ line }}
                              </div>
                            </template>
                            <template v-else>
                              {{ appliedState.text }}
                            </template>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Floating Action Buttons on Step 2 Stage (If user has made changes) -->
                <div
                  v-if="currentStep === 2 && hasPersonalization"
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

                  <!-- Button 2: Adjust -->
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
              <!-- 1. Header (Figma Node 5699:7338 - 60% Opacity Overlay) -->
              <header class="absolute top-0 left-0 right-0 h-[64px] px-[16px] flex items-center justify-between border-b border-neutral-100/60 bg-white/60 backdrop-blur-md z-30" data-node-id="5699:7338">
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
                          <div
                            class="laser-engraved-mask transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                            :style="{
                              ...dynamicDraftGraphicStyle,
                              maskImage: `url('${getArtworkImage(appliedState.artwork)}')`,
                              WebkitMaskImage: `url('${getArtworkImage(appliedState.artwork)}')`,
                            }"
                          ></div>
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
                          class="absolute flex flex-col items-center transition-all duration-200 pointer-events-none overflow-hidden"
                          :style="dynamicDraftTextContainerStyle"
                          :class="[
                            draftOrientation === 'vertical'
                              ? 'justify-center items-center'
                              : (draftPlacement === 'top' ? 'justify-start' : draftPlacement === 'bottom' ? 'justify-end' : 'justify-center')
                          ]"
                        >
                          <div
                            class="select-none whitespace-pre-wrap transition-all"
                            :class="[
                              isProductColorLight ? 'text-neutral-800' : 'text-white drop-shadow-xs',
                              draftText
                                ? [
                                    draftFont,
                                    'font-bold opacity-95',
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
                                  ]
                                : 'font-[\'Stanley_Favorit\',sans-serif] font-medium text-[13px] sm:text-[14px]',
                              draftOrientation === 'vertical'
                                ? '-rotate-90 transform-gpu whitespace-nowrap flex flex-col items-center justify-center text-center tracking-wider'
                                : 'text-center w-full max-w-full break-words tracking-wider'
                            ]"
                          >
                            <template v-if="draftText">
                              <template v-if="draftOrientation === 'vertical'">
                                <div
                                  v-for="(line, idx) in formattedDraftVerticalLines"
                                  :key="idx"
                                  class="whitespace-nowrap text-center leading-tight"
                                  :class="idx > 0 ? 'mt-1' : ''"
                                >
                                  {{ line }}
                                </div>
                              </template>
                              <template v-else>
                                <span>{{ draftText }}</span>
                              </template>
                              <!-- Blinking cursor during focus -->
                              <span
                                v-if="isTextFocused"
                                class="inline-block bg-white animate-pulse"
                                :class="draftOrientation === 'vertical' ? 'w-[2px] h-[1em] ml-0.5 align-middle' : 'w-[2px] h-[1em] ml-0.5 align-middle'"
                              ></span>
                            </template>
                            <span
                              v-else
                              class="font-['Stanley_Favorit',sans-serif] font-medium text-[13px] sm:text-[14px]"
                              :class="[
                                isProductColorLight ? 'text-neutral-700/80' : 'text-white/80',
                                draftOrientation === 'vertical' ? '-rotate-90 transform-gpu whitespace-nowrap text-center tracking-wider' : ''
                              ]"
                            >
                              Your text will appear here
                            </span>
                          </div>
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
              </div>

              <!-- 3. Bottom Menu Panel (Figma Node 5699:7177 - Options Container) -->
              <div
                class="bg-[#f9f9f9] flex flex-col gap-[24px] items-start py-[24px] pb-[32px] relative rounded-tl-[8px] rounded-tr-[8px] w-full shrink-0"
                data-node-id="5699:7177"
                data-name="Options Container"
              >

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
              <!-- 1. Header (60% Opacity Overlay - Figma Node 5660:1282 / 5673:8235) -->
              
              <!-- 1A: Main Browse Gallery Header (Figma Node 5660:1282) -->
              <header
                v-if="galleryView === 'menu'"
                class="absolute top-0 left-0 right-0 h-[64px] px-[16px] flex items-center justify-between border-b border-neutral-100/60 bg-white/60 backdrop-blur-md z-30"
                data-node-id="5660:1282"
              >
                <div class="flex items-center" data-node-id="5660:1283" data-name="Heading Text">
                  <div class="flex flex-col font-['Stanley_Favorit',sans-serif] font-medium text-[20px] text-black tracking-[-0.6px] leading-[normal]" data-node-id="5660:1285">
                    Browse Gallery
                  </div>
                </div>

                <button
                  type="button"
                  @click="selectedSubCategory = null"
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
                class="absolute top-0 left-0 right-0 h-[64px] px-[16px] flex items-center justify-between border-b border-neutral-100/60 bg-white/60 backdrop-blur-md z-30"
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
                            class="font-['Stanley_Favorit',sans-serif] text-[13px] sm:text-[14px] font-medium leading-tight tracking-tight max-w-[150px]"
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
                        <div
                          class="laser-engraved-mask transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                          :style="{
                            ...dynamicAppliedGraphicStyle,
                            maskImage: `url('${getArtworkImage(selectedArtwork)}')`,
                            WebkitMaskImage: `url('${getArtworkImage(selectedArtwork)}')`,
                          }"
                        ></div>
                      </div>

                      <!-- Rendered Applied Text if exists (Positioned in allocated space without shifting graphic) -->
                      <div
                        v-if="appliedState.text"
                        class="absolute flex flex-col items-center transition-all duration-200 pointer-events-none overflow-hidden"
                        :style="dynamicAppliedTextContainerStyle"
                        :class="[
                          appliedState.orientation === 'vertical'
                            ? 'justify-center items-center'
                            : (appliedState.placement === 'top' ? 'justify-start' : appliedState.placement === 'bottom' ? 'justify-end' : 'justify-center')
                        ]"
                      >
                        <div
                          class="text-white font-bold opacity-95 select-none whitespace-pre-wrap transition-all drop-shadow-xs"
                          :class="[
                            appliedState.font || fontOptions[0].class,
                            isFontUppercase(appliedState.font) ? 'uppercase' : '',
                            (appliedState.graphicSize === 'L' && (selectedArtwork || appliedState.artwork))
                              ? (appliedState.fontSize === 'S'
                                  ? 'text-[19px] leading-[1.2]'
                                  : appliedState.fontSize === 'M'
                                  ? 'text-[24px] leading-[1.15]'
                                  : appliedState.fontSize === 'L'
                                  ? 'text-[29px] leading-[1.1]'
                                  : 'text-[36px] leading-[1.05]')
                              : (appliedState.fontSize === 'S'
                                  ? 'text-[24px] leading-[1.2]'
                                  : appliedState.fontSize === 'M'
                                  ? 'text-[36px] leading-[1.1]'
                                  : appliedState.fontSize === 'L'
                                  ? 'text-[48px] leading-[1.05]'
                                  : 'text-[60px] leading-[1.0]'),
                            appliedState.orientation === 'vertical'
                              ? '-rotate-90 transform-gpu whitespace-nowrap flex flex-col items-center justify-center text-center tracking-wider'
                              : 'text-center w-full max-w-full break-words tracking-wider'
                          ]"
                        >
                          <template v-if="appliedState.orientation === 'vertical'">
                            <div
                              v-for="(line, idx) in formattedAppliedVerticalLines"
                              :key="idx"
                              class="whitespace-nowrap text-center leading-tight"
                              :class="idx > 0 ? 'mt-1' : ''"
                            >
                              {{ line }}
                            </div>
                          </template>
                          <template v-else>
                            <span>{{ appliedState.text }}</span>
                          </template>
                        </div>
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
                        @click="selectedArtwork = item.id"
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
                      @click="selectedArtwork = item.id"
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
                      @click="activeCategoryTab = 'animals'"
                      class="font-['Stanley_Favorit',sans-serif] text-[14px] tracking-[-0.3px] transition-all cursor-pointer pb-1 whitespace-nowrap select-none border-b-[1.5px]"
                      :class="activeCategoryTab === 'animals' ? 'font-medium text-black border-black' : 'font-normal text-neutral-500 border-transparent hover:text-black'"
                    >
                      Animals & Pets
                    </button>
                    <button
                      type="button"
                      @click="activeCategoryTab = 'nature'"
                      class="font-['Stanley_Favorit',sans-serif] text-[14px] tracking-[-0.3px] transition-all cursor-pointer pb-1 whitespace-nowrap select-none border-b-[1.5px]"
                      :class="activeCategoryTab === 'nature' ? 'font-medium text-black border-black' : 'font-normal text-neutral-500 border-transparent hover:text-black'"
                    >
                      Landscape & Nature
                    </button>
                    <button
                      type="button"
                      @click="activeCategoryTab = 'zodiac'"
                      class="font-['Stanley_Favorit',sans-serif] text-[14px] tracking-[-0.3px] transition-all cursor-pointer pb-1 whitespace-nowrap select-none border-b-[1.5px]"
                      :class="activeCategoryTab === 'zodiac' ? 'font-medium text-black border-black' : 'font-normal text-neutral-500 border-transparent hover:text-black'"
                    >
                      Zodiac
                    </button>
                    <button
                      type="button"
                      @click="activeCategoryTab = 'celebrations'"
                      class="font-['Stanley_Favorit',sans-serif] text-[14px] tracking-[-0.3px] transition-all cursor-pointer pb-1 whitespace-nowrap select-none border-b-[1.5px]"
                      :class="activeCategoryTab === 'celebrations' ? 'font-medium text-black border-black' : 'font-normal text-neutral-500 border-transparent hover:text-black'"
                    >
                      Celebrations
                    </button>
                    <button
                      type="button"
                      @click="activeCategoryTab = 'symbols'"
                      class="font-['Stanley_Favorit',sans-serif] text-[14px] tracking-[-0.3px] transition-all cursor-pointer pb-1 whitespace-nowrap select-none border-b-[1.5px]"
                      :class="activeCategoryTab === 'symbols' ? 'font-medium text-black border-black' : 'font-normal text-neutral-500 border-transparent hover:text-black'"
                    >
                      Symbols & Crests
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
                        @click="selectedArtwork = item.id"
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
              <!-- Drawer Header (60% Opacity) -->
              <header class="absolute top-0 left-0 right-0 h-[64px] px-[16px] border-b border-neutral-100/60 flex items-center justify-between bg-white/60 backdrop-blur-md z-30 flex-none">
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
                            class="font-['Stanley_Favorit',sans-serif] text-[13px] sm:text-[14px] font-medium leading-tight tracking-tight max-w-[150px]"
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
                class="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
              >
                <div class="bg-white rounded-t-[20px] sm:rounded-2xl p-6 max-w-full sm:max-w-xs w-full flex flex-col gap-4 text-center bottom-sheet-content">
                  <h3 class="font-bold text-lg text-black">Discard Unsaved Changes?</h3>
                  <p class="text-xs text-neutral-600">
                    You have unsaved edits in your personalization. Discarding will revert to your last saved state.
                  </p>
                  <div class="flex flex-col gap-2 pt-2">
                    <button
                      @click="confirmDiscard"
                      class="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors cursor-pointer"
                    >
                      Discard Changes
                    </button>
                    <button
                      @click="showDiscardModal = false"
                      class="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black rounded-lg font-medium text-sm transition-colors cursor-pointer"
                    >
                      Keep Editing
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

                  <!-- Section 2: Set Position (Only visible when orientation is horizontal or when setting graphic only) -->
                  <div
                    v-if="activeOrientation === 'horizontal' || (!hasTextPresent && hasGraphicPresent)"
                    class="flex flex-col gap-[12px] w-full"
                    data-node-id="5695:9120"
                  >
                    <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[15px] text-black tracking-[-0.48px]">
                      Set Position
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

                  <!-- Section 3: Graphic Placement (Graphic Top / Text Top) - Only appears if BOTH Graphic and Text are present -->
                  <div
                    v-if="hasBothPresent"
                    class="flex flex-col gap-[12px] w-full"
                    data-node-id="5695:9113"
                  >
                    <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[15px] text-black tracking-[-0.48px]">
                      Graphic Placement
                    </span>
                    <div class="border border-black rounded-[8px] flex h-[45px] overflow-hidden bg-white">
                      <button
                        type="button"
                        @click="handleSetStackOrder('graphic-top')"
                        class="flex-1 h-full flex items-center justify-center font-['Stanley_Favorit',sans-serif] text-[13px] tracking-[-0.36px] transition-colors cursor-pointer select-none"
                        :class="appliedState.stackOrder === 'graphic-top' ? 'bg-black text-white font-medium' : 'bg-transparent text-black hover:bg-black/5'"
                      >
                        Graphic Top
                      </button>
                      <button
                        type="button"
                        @click="handleSetStackOrder('text-top')"
                        class="flex-1 h-full flex items-center justify-center font-['Stanley_Favorit',sans-serif] text-[13px] tracking-[-0.36px] transition-colors cursor-pointer select-none"
                        :class="appliedState.stackOrder === 'text-top' ? 'bg-black text-white font-medium' : 'bg-transparent text-black hover:bg-black/5'"
                      >
                        Text Top
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
