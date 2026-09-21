<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { X, Sparkles, Snowflake, Box, Check, ArrowRight, ArrowLeft, LayoutGrid, Upload, Type, ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next'
import type { Product, ProductColor } from '@/data/catalog'
import { getEngravingProfile } from '@/data/catalog'
import stanleyLogo from '@/assets/images/stanley-logo.png'
import quencherGreenBlankImg from '@/assets/products/quencher-green-blank.png'
import blankIceflowImg from '@/assets/images/artist-drop-iceflow.png'
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

// Stepper state (1: Your Base, 2: Personalize, 3: Review)
const currentStep = ref<1 | 2 | 3>(1)

// Selection State
const selectedColor = ref<ProductColor>(props.initialColor || props.product.colors[0])
const selectedSize = ref<'30 oz' | '40 oz' | '50 oz' | '64 oz'>('30 oz')

// Personalization Category State (Step 2 - Figma Node 5105:1287)
const selectedSubCategory = ref<'gallery' | 'upload' | 'text' | null>(null)
const activeCampaign = ref<GraphicCampaign | null>(null)
const activeCategory = ref<CategoryDetail | null>(null)

// Personalization Content State
const activeTab = ref<'text' | 'artwork' | 'monogram'>('text')
const selectedArtwork = ref<string | null>(props.initialArtwork || null)
const rawEngravingText = ref('')
const engravingText = ref('')
const selectedFont = ref<string | null>(null)
const selectedFontSize = ref<'S' | 'M' | 'L' | 'XL'>('M')
const selectedGraphicSize = ref<'S' | 'M' | 'L'>('M')
const selectedGraphicPlacement = ref<'center' | 'top' | 'bottom' | 'left' | 'right'>('center')
const selectedPlacement = ref<'center' | 'top' | 'bottom' | 'left' | 'right' | null>('center')
const textOrientation = ref<'vertical' | 'horizontal'>('horizontal')
const stackOrder = ref<'graphic-top' | 'text-top'>('graphic-top')
const uploadedFileName = ref<string | null>(null)
const isAdded = ref(false)
const showDiscardModal = ref(false)
const textInputRef = ref<HTMLInputElement | null>(null)

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

const textMeasureBoxRef = ref<HTMLElement | null>(null)

const getAvailableTextHeight = () => {
  const totalZoneHeight = 280
  const hasGraphic = Boolean(selectedArtwork.value || uploadedFileName.value)
  if (!hasGraphic) return totalZoneHeight
  
  const placement = selectedGraphicPlacement.value || 'center'
  const gSize = selectedGraphicSize.value || 'M'
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
  const maxW = 190
  
  if (textOrientation.value === 'vertical') {
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

const formattedVerticalLines = computed(() => {
  if (!engravingText.value) return []
  return engravingText.value.split('\n')
})

const handleTextInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement | HTMLInputElement
  if (!target) return
  const candidate = target.value
  const fitted = fitTextToAvailableSpace(candidate)
  rawEngravingText.value = candidate
  engravingText.value = fitted
  if (target.value !== fitted) {
    target.value = fitted
  }
}

watch([selectedFontSize, selectedFont, textOrientation, selectedGraphicSize, selectedGraphicPlacement, selectedArtwork], () => {
  if (engravingText.value) {
    const fitted = fitTextToAvailableSpace(engravingText.value)
    if (fitted !== engravingText.value) {
      engravingText.value = fitted
    }
  }
})

const fontSizeOptions: ('S' | 'M' | 'L' | 'XL')[] = ['S', 'M', 'L', 'XL']

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

const getFontClass = (fontName: string | null) => {
  if (!fontName) return "font-['Stanley_Favorit',sans-serif] font-medium"
  const f = fontOptions.find(opt => opt.name === fontName || opt.class === fontName)
  return f ? f.class : "font-['Stanley_Favorit',sans-serif] font-medium"
}

const isFontUppercase = (fontNameOrClass: string | null | undefined): boolean => {
  if (!fontNameOrClass) return false
  const font = fontOptions.find(f => f.name === fontNameOrClass || f.class === fontNameOrClass)
  return font?.caseMode === 'uppercase'
}

const setOrientation = (val: 'horizontal' | 'vertical') => {
  if (textOrientation.value === val) return
  textOrientation.value = val
  if (val === 'vertical') {
    selectedPlacement.value = 'center'
  } else {
    if (!selectedPlacement.value || selectedPlacement.value === 'left' || selectedPlacement.value === 'right') {
      selectedPlacement.value = 'center'
    }
  }
}

// Floating Apply Button Scroll & Visibility State
const isScrollHidden = ref(false)
let lastScrollTop = 0
let scrollIdleTimer: ReturnType<typeof setTimeout> | null = null

const handleDrawerScroll = (e: Event) => {
  const target = e.target as HTMLElement
  if (!target) return

  const currentScrollTop = target.scrollTop

  if (currentScrollTop > lastScrollTop + 6) {
    // Scrolling down -> hide floating apply button
    isScrollHidden.value = true
  } else if (currentScrollTop < lastScrollTop - 6) {
    // Scrolling up -> show floating apply button
    isScrollHidden.value = false
  }

  // Clear previous timer and set idle timer (stops scrolling -> show button)
  if (scrollIdleTimer) clearTimeout(scrollIdleTimer)
  scrollIdleTimer = setTimeout(() => {
    isScrollHidden.value = false
  }, 250)

  lastScrollTop = currentScrollTop
}



// Check if current draft differs from applied state snapshot
const hasUnsavedEdits = computed(() => {
  if (selectedSubCategory.value === 'text') {
    return (
      engravingText.value !== appliedState.value.text ||
      selectedFont.value !== appliedState.value.font ||
      selectedFontSize.value !== appliedState.value.fontSize ||
      selectedPlacement.value !== appliedState.value.placement ||
      textOrientation.value !== appliedState.value.orientation
    )
  }
  if (selectedSubCategory.value === 'gallery') {
    return selectedArtwork.value !== appliedState.value.artwork
  }
  return false
})

const handleAttemptClose = () => {
  if (hasUnsavedEdits.value) {
    showDiscardModal.value = true
  } else {
    confirmDiscard()
  }
}

const applyEdits = () => {
  appliedState.value = {
    text: engravingText.value,
    font: selectedFont.value,
    fontSize: selectedFontSize.value,
    graphicSize: selectedGraphicSize.value,
    artwork: selectedArtwork.value,
    graphicPlacement: selectedGraphicPlacement.value,
    placement: selectedPlacement.value,
    orientation: textOrientation.value,
    stackOrder: stackOrder.value,
    uploadedFile: uploadedFileName.value,
  }
  selectedSubCategory.value = null
}

const confirmDiscard = () => {
  // Revert all draft fields back to applied state snapshot
  rawEngravingText.value = appliedState.value.text
  engravingText.value = appliedState.value.text
  selectedFont.value = appliedState.value.font
  selectedFontSize.value = appliedState.value.fontSize
  selectedGraphicSize.value = appliedState.value.graphicSize || 'M'
  selectedArtwork.value = appliedState.value.artwork
  selectedGraphicPlacement.value = appliedState.value.graphicPlacement || 'center'
  selectedPlacement.value = appliedState.value.placement
  textOrientation.value = appliedState.value.orientation
  stackOrder.value = appliedState.value.stackOrder

  showDiscardModal.value = false
  selectedSubCategory.value = null
  activeCampaign.value = null
  activeCategory.value = null
}

const handleRemoveArtwork = (e?: Event) => {
  if (e) e.stopPropagation()
  selectedArtwork.value = null
  appliedState.value.artwork = null
}

const handleRemoveText = (e?: Event) => {
  if (e) e.stopPropagation()
  rawEngravingText.value = ''
  engravingText.value = ''
  selectedFont.value = null
  selectedFontSize.value = 'M'
  appliedState.value.text = ''
  appliedState.value.font = null
  appliedState.value.fontSize = 'M'
}

const openTextPersonalization = () => {
  if (selectedArtwork.value || appliedState.value.artwork) {
    const gPlacement = selectedGraphicPlacement.value || appliedState.value.graphicPlacement || 'center'
    if (gPlacement === 'bottom' || gPlacement === 'right') {
      stackOrder.value = 'text-top'
      appliedState.value.stackOrder = 'text-top'
    } else {
      stackOrder.value = 'graphic-top'
      appliedState.value.stackOrder = 'graphic-top'
    }
  }
  selectedSubCategory.value = 'text'
}

const handleRemoveUpload = (e?: Event) => {
  if (e) e.stopPropagation()
  uploadedFileName.value = null
}

// Record snapshot when sidebar opens & auto-focus text field
watch(selectedSubCategory, (newVal) => {
  if (newVal) {
    appliedState.value = {
      text: engravingText.value,
      font: selectedFont.value,
      fontSize: selectedFontSize.value,
      artwork: selectedArtwork.value,
      placement: selectedPlacement.value,
      orientation: textOrientation.value,
      stackOrder: stackOrder.value,
    }
  }
  if (newVal === 'text') {
    rawEngravingText.value = appliedState.value.text || engravingText.value
    if (!selectedFont.value) {
      selectedFont.value = fontOptions[0].name
    }
    nextTick(() => {
      textInputRef.value?.focus()
    })
    setTimeout(() => {
      textInputRef.value?.focus()
    }, 50)
    setTimeout(() => {
      textInputRef.value?.focus()
    }, 150)
  }
})

const handleCanvasClick = () => {
  if (currentStep.value === 2) {
    if (selectedSubCategory.value !== 'text') {
      selectedSubCategory.value = 'text'
    }
    nextTick(() => {
      textInputRef.value?.focus()
    })
    setTimeout(() => {
      textInputRef.value?.focus()
    }, 50)
  }
}

const handleGlobalKeyDown = (e: KeyboardEvent) => {
  if (currentStep.value !== 2) return
  if (e.metaKey || e.ctrlKey || e.altKey) return
  if (e.key === 'Escape' || e.key === 'Tab') return
  if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== 'Enter') return

  const activeEl = document.activeElement
  const isInputActive = activeEl && (
    activeEl.tagName === 'INPUT' ||
    activeEl.tagName === 'TEXTAREA' ||
    activeEl.getAttribute('contenteditable') === 'true'
  )

  if (!isInputActive) {
    if (selectedSubCategory.value !== 'text') {
      selectedSubCategory.value = 'text'
    }
    nextTick(() => {
      textInputRef.value?.focus()
    })
  }
}

const sizes = ['30 oz', '40 oz', '50 oz', '64 oz'] as const

import {
  type GraphicItem,
  type GraphicCampaign,
  type CategoryDetail,
  topGraphics,
  juventusGraphics,
  liunicGraphics,
  natureGraphics,
  symbolsGraphics,
  animalsGraphics,
  zodiacGraphics,
  celebrationsGraphics,
  categoryDetails,
  artworkCategories,
  graphicCampaigns,
  uniqueGraphics,
  getGraphicById,
  getGraphicImage
} from '@/data/graphics'

const currentSlideIndex = ref(0)
let bannerInterval: ReturnType<typeof setInterval> | null = null

const startBannerAutoplay = () => {
  stopBannerAutoplay()
  bannerInterval = setInterval(() => {
    if (selectedSubCategory.value === 'gallery' && !activeCampaign.value) {
      currentSlideIndex.value = (currentSlideIndex.value + 1) % graphicCampaigns.length
    }
  }, 3000)
}

const stopBannerAutoplay = () => {
  if (bannerInterval) {
    clearInterval(bannerInterval)
    bannerInterval = null
  }
}

onMounted(() => {
  startBannerAutoplay()
  window.addEventListener('keydown', handleGlobalKeyDown)
})

onUnmounted(() => {
  stopBannerAutoplay()
  window.removeEventListener('popstate', handlePopState)
  window.removeEventListener('keydown', handleGlobalKeyDown)
})

const categoryPageIndex = ref(0)
const itemsPerPage = 6

const totalCategoryPages = computed(() => {
  if (!activeCategory.value) return 1
  return Math.ceil(activeCategory.value.graphics.length / itemsPerPage) || 1
})

const categoryPages = computed(() => {
  if (!activeCategory.value) return []
  const graphics = activeCategory.value.graphics
  const pages: (typeof graphics)[] = []
  for (let i = 0; i < graphics.length; i += itemsPerPage) {
    pages.push(graphics.slice(i, i + itemsPerPage))
  }
  return pages
})

const prevCategoryPage = () => {
  if (categoryPageIndex.value > 0) {
    categoryPageIndex.value--
  }
}

const nextCategoryPage = () => {
  if (categoryPageIndex.value < totalCategoryPages.value - 1) {
    categoryPageIndex.value++
  }
}

watch(activeCategory, () => {
  categoryPageIndex.value = 0
})

let wheelTimeout: ReturnType<typeof setTimeout> | null = null
const handleCategoryWheel = (e: WheelEvent) => {
  e.preventDefault()
  e.stopPropagation()
  if (wheelTimeout) return
  const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
  if (Math.abs(delta) > 10) {
    if (delta > 0) {
      nextCategoryPage()
    } else {
      prevCategoryPage()
    }
    wheelTimeout = setTimeout(() => {
      wheelTimeout = null
    }, 350)
  }
}

let categoryTouchStartX = 0
const handleCategoryTouchStart = (e: TouchEvent) => {
  categoryTouchStartX = e.changedTouches[0].screenX
}
const handleCategoryTouchEnd = (e: TouchEvent) => {
  const touchEndX = e.changedTouches[0].screenX
  const diffX = touchEndX - categoryTouchStartX
  if (Math.abs(diffX) > 40) {
    if (diffX < 0) {
      nextCategoryPage()
    } else {
      prevCategoryPage()
    }
  }
}

const artworkOptions = uniqueGraphics

watch(() => props.initialArtwork, (val) => {
  if (val) {
    selectedArtwork.value = val
  }
})

const activeArtwork = computed(() => {
  return getGraphicById(selectedArtwork.value)
})

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

const dynamicGraphicStyle = computed(() => {
  return getDynamicGraphicSize(
    engravingText.value,
    textOrientation.value,
    selectedFontSize.value,
    selectedGraphicSize.value
  )
})

const graphicContainerStyle = computed(() => {
  const placement = selectedGraphicPlacement.value || appliedState.value.graphicPlacement || 'center'
  if (placement === 'top') return { position: 'absolute', top: '0px', left: '0px', right: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  if (placement === 'bottom') return { position: 'absolute', bottom: '0px', left: '0px', right: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  return { position: 'absolute', top: '50%', left: '0px', right: '0px', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
})

const textContainerStyle = computed(() => {
  const hasGraphic = Boolean(selectedArtwork.value || appliedState.value.artwork || uploadedFileName.value)
  if (!hasGraphic) {
    return { position: 'absolute', inset: '0px' }
  }
  const placement = selectedGraphicPlacement.value || appliedState.value.graphicPlacement || 'center'
  const gSize = selectedGraphicSize.value || appliedState.value.graphicSize || 'M'
  const gHeight = gSize === 'L' ? 150 : gSize === 'S' ? 70 : 100
  
  if (placement === 'top') return { position: 'absolute', left: '0px', right: '0px', bottom: '0px', top: `${gHeight + 4}px` }
  if (placement === 'bottom') return { position: 'absolute', left: '0px', right: '0px', top: '0px', bottom: `${gHeight + 4}px` }
  
  // center
  if (stackOrder.value === 'text-top') {
    return { position: 'absolute', left: '0px', right: '0px', top: '0px', bottom: `calc(50% + ${gHeight / 2 + 4}px)` }
  } else {
    return { position: 'absolute', left: '0px', right: '0px', bottom: '0px', top: `calc(50% + ${gHeight / 2 + 4}px)` }
  }
})

const isFontSizeDisabled = (_size: 'S' | 'M' | 'L' | 'XL') => {
  return false
}

const handleSelectFontSize = (size: 'S' | 'M' | 'L' | 'XL') => {
  selectedFontSize.value = size
}

const handleSetGraphicSize = (size: 'S' | 'M' | 'L') => {
  selectedGraphicSize.value = size
  appliedState.value.graphicSize = size
}

watch(selectedArtwork, (newVal) => {
  if (newVal) {
    isScrollHidden.value = false
  }
})
const topGraphicsRef = ref<HTMLDivElement | null>(null)
const artworkCategoriesRef = ref<HTMLDivElement | null>(null)

const scrollSection = (section: 'topGraphics' | 'categories', direction: 'left' | 'right') => {
  const el = section === 'topGraphics' ? topGraphicsRef.value : artworkCategoriesRef.value
  if (el) {
    const scrollAmount = direction === 'left' ? -280 : 280
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}

const isGraphicComplete = computed(() => {
  return selectedArtwork.value !== null
})

const activeImage = computed(() => {
  return selectedColor.value.image || props.product.defaultImage
})

const activeBlankImage = computed(() => {
  if (selectedColor.value?.blankImage) return selectedColor.value.blankImage
  if (props.product.id === 'iceflow-flip-straw' || props.product.handle?.includes('iceflow')) {
    return blankIceflowImg
  }
  return quencherGreenBlankImg
})

const isFocusedZoom = computed(() => {
  return currentStep.value === 2 && selectedSubCategory.value !== null
})

const isTextComplete = computed(() => {
  return engravingText.value.trim().length > 0
})

const hasBothPersonalizations = computed(() => {
  const hasText = engravingText.value.trim().length > 0
  const hasGraphic = selectedArtwork.value !== null || uploadedFileName.value !== null
  return hasText && hasGraphic
})

const hasPersonalization = computed(() => {
  return (
    engravingText.value.trim().length > 0 ||
    selectedArtwork.value !== null ||
    uploadedFileName.value !== null
  )
})

const isPersonalizedState = computed(() => {
  return isFocusedZoom.value || hasPersonalization.value
})

const maxStepReached = ref<number>(1)

const handleNextStep = () => {
  if (currentStep.value === 2 && !hasPersonalization.value) {
    return
  }
  if (currentStep.value < 3) {
    currentStep.value++ as 1 | 2 | 3
    if (currentStep.value > maxStepReached.value) {
      maxStepReached.value = currentStep.value
    }
  }
}

const handlePrevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value-- as 1 | 2 | 3
  }
}

const handleAddToCart = () => {
  const payload = {
    id: props.product.id,
    handle: props.product.handle,
    name: props.product.name,
    color: selectedColor.value.name,
    size: selectedSize.value,
    price: props.product.priceAmount,
    priceFormatted: props.product.priceFormatted,
    properties: {
      _engraving_text: engravingText.value,
      _engraving_font: selectedFont.value,
      _engraving_font_size: selectedFontSize.value,
      _engraving_orientation: textOrientation.value,
      _engraving_placement: selectedPlacement.value,
      _engraving_artwork: selectedArtwork.value || 'None',
      _engraving_color_hex: selectedColor.value.hex,
    },
  }

  emit('add-to-cart', payload)
  isAdded.value = true
  setTimeout(() => {
    isAdded.value = false
    emit('close')
  }, 2000)
}

// Browser and Mobile Back Navigation Handler
const pushStudioHistoryState = () => {
  if (!window.history.state?.studioActive) {
    window.history.pushState({ studioActive: true }, '')
  }
}

const handlePopState = (_e: PopStateEvent) => {
  if (!props.isOpen) return

  // Level 4: Inside Category Detail view
  if (activeCategory.value !== null) {
    activeCategory.value = null
    pushStudioHistoryState()
    return
  }

  // Level 4: Inside Campaign Detail view
  if (activeCampaign.value !== null) {
    activeCampaign.value = null
    pushStudioHistoryState()
    return
  }

  // Level 3: Inside a Sub-Category drawer (e.g. Text or Gallery)
  if (selectedSubCategory.value !== null) {
    handleAttemptClose()
    pushStudioHistoryState()
    return
  }

  // Level 2: Inside Step 2 or Step 3
  if (currentStep.value > 1) {
    handlePrevStep()
    pushStudioHistoryState()
    return
  }

  // Level 1: At Step 1 base level, close the customizer studio
  emit('close')
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      pushStudioHistoryState()
      window.addEventListener('popstate', handlePopState)
    } else {
      window.removeEventListener('popstate', handlePopState)
    }
  },
  { immediate: true }
)

watch(
  [currentStep, selectedSubCategory, activeCampaign, activeCategory],
  () => {
    if (props.isOpen) {
      pushStudioHistoryState()
    }
  }
)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto lg:overflow-hidden select-none gpu-accelerated animate-fade-in"
    >
      <!-- Studio Header (Figma Node 5120:1477 - Clean without border-b) -->
      <header class="w-full bg-white px-6 sm:px-10 py-4 flex items-center justify-between z-20 flex-none max-w-[1512px] mx-auto">
        <!-- Logo and Title (Node 5120:1478) -->
        <div class="flex items-end gap-4 sm:gap-5">
          <img
            :src="stanleyLogo"
            alt="Stanley 1913"
            class="h-[28px] sm:h-[30px] w-auto object-contain opacity-90"
          />
          <span class="font-['Stanley_Favorit',sans-serif] font-bold text-[14px] text-black uppercase tracking-normal opacity-90 leading-none pb-[1px]">
            DESIGN STUDIO
          </span>
        </div>

        <!-- Right Header Actions (Swap Products? & Close X) -->
        <div class="flex items-center gap-6">
          <button
            @click="emit('swap-products')"
            class="flex items-center gap-2 text-[14px] font-['Stanley_Favorit',sans-serif] font-normal text-black hover:opacity-75 transition-opacity cursor-pointer"
          >
            <span>Swap Products?</span>
            <span class="text-[11px] border border-black/30 rounded px-1.5 py-0.5">⇄</span>
          </button>

          <button
            @click="emit('close')"
            class="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer text-black"
            aria-label="Close studio"
          >
            <X :size="20" />
          </button>
        </div>
      </header>

      <!-- Main Studio Workspace (2 Columns layout matching Figma Node 5087:8510) -->
      <div class="flex-1 w-full max-w-[1512px] mx-auto flex flex-col lg:flex-row h-full overflow-hidden">
        
        <!-- Left Column: Product Image Canvas Stage (Figma Node 5087:8541) -->
        <div class="w-full lg:w-3/5 p-4 lg:p-8 flex flex-col items-center justify-center relative bg-white min-h-[500px] lg:min-h-full overflow-hidden">
          <!-- Main Tumbler Product Image Render Stage (Lowered position & scaled up by 30% more) -->
          <div
            class="relative w-full max-w-3xl h-[620px] sm:h-[840px] lg:h-[900px] flex items-center justify-center transition-transform duration-700 ease-out transform-gpu will-change-transform"
            :class="[
              isFocusedZoom ? 'scale-[1.15] sm:scale-[1.2] translate-y-2 sm:translate-y-4' : 'scale-100 translate-y-8 sm:translate-y-12'
            ]"
          >
            <!-- Default Tumbler Image with Logo (Step 1) / Blank Image for Customization (Step 2 & 3) -->
            <img
              :src="currentStep >= 2 ? activeBlankImage : activeImage"
              :alt="product.name"
              class="max-h-[620px] sm:max-h-[850px] lg:max-h-[880px] w-auto object-contain filter drop-shadow-xl transition-opacity duration-700 ease-out transform-gpu opacity-100"
            />

            <!-- UNIFIED ENGRAVABLE AREA CANVAS BOX (Shared by Live Editing & Applied State) -->
            <div
              v-if="currentStep >= 2"
              class="absolute z-20 w-[180px] sm:w-[200px] h-[264px] sm:h-[293px] rounded-[8px] transition-all top-[48%] -translate-y-1/2 overflow-hidden no-scrollbar p-0"
              @click="handleCanvasClick"
              :class="[
                (currentStep === 2 || selectedSubCategory === 'text')
                  ? (isProductColorLight ? 'border border-dashed border-neutral-800/80 cursor-text pointer-events-auto' : 'border border-dashed border-white/80 cursor-text pointer-events-auto')
                  : 'border border-transparent pointer-events-none'
              ]"
            >
              <!-- Graphic Layer (Fixed coordinates based on Browse Gallery setup) -->
              <div
                v-if="selectedArtwork"
                class="absolute transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 flex items-center justify-center pointer-events-none"
                :style="graphicContainerStyle"
              >
                <LaserPreview
                  v-if="activeArtwork?.img"
                  type="image"
                  :image-src="activeArtwork.img"
                  :image-style="dynamicGraphicStyle"
                  :is-light-tumbler="isProductColorLight"
                />
                <LaserPreview
                  v-else-if="activeArtwork?.symbol"
                  type="text"
                  :text="activeArtwork.symbol"
                  font-class="text-4xl"
                  :is-light-tumbler="isProductColorLight"
                />
              </div>

              <!-- Uploaded Artwork Layer (if present) -->
              <div
                v-if="uploadedFileName"
                class="absolute transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 flex items-center justify-center pointer-events-none"
                :style="graphicContainerStyle"
              >
                <div class="w-[70px] h-[70px] flex items-center justify-center opacity-85 mix-blend-multiply border border-dashed border-neutral-700 rounded-lg p-2">
                  <UploadCloud :size="32" class="text-neutral-800" />
                </div>
              </div>

              <!-- Hidden Measure Box for boundary calculation -->
              <div
                ref="textMeasureBoxRef"
                class="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none whitespace-pre-wrap select-none"
                :class="[
                  getFontClass(selectedFont),
                  isFontUppercase(selectedFont) ? 'uppercase' : '',
                  selectedGraphicSize === 'L' && selectedArtwork
                    ? (selectedFontSize === 'S'
                        ? 'text-[19px] sm:text-[22px] leading-[1.15]'
                        : selectedFontSize === 'M'
                        ? 'text-[24px] sm:text-[26px] leading-[1.12]'
                        : selectedFontSize === 'L'
                        ? 'text-[29px] sm:text-[31px] leading-[1.1]'
                        : 'text-[36px] sm:text-[41px] leading-[1.05]')
                    : (selectedFontSize === 'S'
                        ? 'text-[22px] sm:text-[24px] leading-[1.15]'
                        : selectedFontSize === 'M'
                        ? 'text-[29px] sm:text-[34px] leading-[1.1]'
                        : selectedFontSize === 'L'
                        ? 'text-[36px] sm:text-[43px] leading-[1.05]'
                        : 'text-[46px] sm:text-[55px] leading-[1.0]'),
                  textOrientation === 'vertical' ? 'whitespace-nowrap tracking-wider' : 'w-[190px] break-words tracking-wider'
                ]"
              ></div>

              <!-- Text Layer (Positioned in allocated space without shifting graphic) -->
              <div
                v-if="engravingText || selectedSubCategory === 'text'"
                class="absolute flex flex-col items-center transition-all duration-200 pointer-events-none overflow-hidden"
                :style="textContainerStyle"
                :class="[
                  textOrientation === 'vertical'
                    ? 'justify-center items-center'
                    : (selectedPlacement === 'top' ? 'justify-start' : selectedPlacement === 'bottom' ? 'justify-end' : 'justify-center')
                ]"
              >
                <LaserPreview
                  v-if="engravingText"
                  type="text"
                  :text="engravingText"
                  :font-class="[getFontClass(selectedFont), isFontUppercase(selectedFont) ? 'uppercase' : ''].join(' ')"
                  :font-size-class="selectedGraphicSize === 'L' && selectedArtwork
                    ? (selectedFontSize === 'S'
                        ? 'text-[19px] sm:text-[22px]'
                        : selectedFontSize === 'M'
                        ? 'text-[24px] sm:text-[26px]'
                        : selectedFontSize === 'L'
                        ? 'text-[29px] sm:text-[31px]'
                        : 'text-[36px] sm:text-[41px]')
                    : (selectedFontSize === 'S'
                        ? 'text-[22px] sm:text-[24px]'
                        : selectedFontSize === 'M'
                        ? 'text-[29px] sm:text-[34px]'
                        : selectedFontSize === 'L'
                        ? 'text-[36px] sm:text-[43px]'
                        : 'text-[46px] sm:text-[55px]')"
                  :orientation="textOrientation"
                  :vertical-lines="formattedVerticalLines"
                  :is-light-tumbler="isProductColorLight"
                />
                <!-- Placeholder during active text editing if text is empty -->
                <div
                  v-else-if="selectedSubCategory === 'text'"
                  class="font-['Stanley_Favorit',sans-serif] font-medium text-[13px] sm:text-[14px] select-none transition-all duration-200"
                  :class="[
                    isProductColorLight ? 'text-neutral-700/80' : 'text-white/90 drop-shadow-xs',
                    textOrientation === 'vertical'
                      ? '-rotate-90 transform-gpu whitespace-nowrap text-center tracking-wider'
                      : 'text-center w-full max-w-full tracking-wider'
                  ]"
                >
                  Your text will appear here
                </div>
              </div>

              <!-- Placeholder when in Step 2 with no personalization yet -->
              <div
                v-else-if="currentStep === 2 && !selectedArtwork && !uploadedFileName"
                class="w-full h-full flex flex-col items-center justify-center text-center p-0 select-none pointer-events-none"
              >
                <p
                  class="font-['Stanley_Favorit',sans-serif] text-[14px] sm:text-[15px] font-medium leading-tight tracking-tight max-w-[160px]"
                  :class="isProductColorLight ? 'text-neutral-800/80' : 'text-white/90 drop-shadow-xs'"
                >
                  Your design will appear here
                </p>
              </div>
            </div>
          </div>

          <!-- Bottom Floating Control Buttons for Browse Gallery / Upload (Position & Size) -->
          <div
            v-if="currentStep === 2 && (selectedSubCategory === 'gallery' || selectedSubCategory === 'upload') && (selectedArtwork || uploadedFileName)"
            class="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-30 pointer-events-auto"
          >
            <!-- Toggle 1: Position Toggle (Top / Center / Bottom) -->
            <div
              class="bg-[#f9f9f9]/80 backdrop-blur-md rounded-[8px] flex items-center p-0 border border-black/10 shadow-sm w-[270px] sm:w-[300px]"
            >
              <div class="relative flex items-center p-0 rounded-[8px] overflow-hidden w-full">
                <div
                  class="absolute inset-y-0 left-0 w-1/3 border border-black bg-transparent rounded-[8px] pointer-events-none transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu z-10"
                  :style="{
                    transform: `translateX(${
                      selectedGraphicPlacement === 'top' ? 0 : selectedGraphicPlacement === 'bottom' ? 200 : 100
                    }%)`
                  }"
                ></div>

                <button
                  type="button"
                  @click.stop="selectedGraphicPlacement = 'top'"
                  class="relative z-20 w-1/3 py-2.5 text-[12px] font-['Stanley_Favorit',sans-serif] text-center tracking-[-0.36px] transition-colors duration-200 cursor-pointer select-none"
                  :class="[
                    selectedGraphicPlacement === 'top'
                      ? 'text-black font-medium'
                      : 'text-black/60 font-normal hover:text-black'
                  ]"
                >
                  Top
                </button>

                <button
                  type="button"
                  @click.stop="selectedGraphicPlacement = 'center'"
                  class="relative z-20 w-1/3 py-2.5 text-[12px] font-['Stanley_Favorit',sans-serif] text-center tracking-[-0.36px] transition-colors duration-200 cursor-pointer select-none"
                  :class="[
                    (selectedGraphicPlacement || 'center') === 'center'
                      ? 'text-black font-medium'
                      : 'text-black/60 font-normal hover:text-black'
                  ]"
                >
                  Center
                </button>

                <button
                  type="button"
                  @click.stop="selectedGraphicPlacement = 'bottom'"
                  class="relative z-20 w-1/3 py-2.5 text-[12px] font-['Stanley_Favorit',sans-serif] text-center tracking-[-0.36px] transition-colors duration-200 cursor-pointer select-none"
                  :class="[
                    selectedGraphicPlacement === 'bottom'
                      ? 'text-black font-medium'
                      : 'text-black/60 font-normal hover:text-black'
                  ]"
                >
                  Bottom
                </button>
              </div>
            </div>

            <!-- Toggle 2: Graphic Size Toggle (Appears when Graphic is active) -->
            <div
              v-if="selectedArtwork"
              class="bg-[#f9f9f9]/80 backdrop-blur-md rounded-[8px] flex items-center p-0 border border-black/10 shadow-sm w-[270px] sm:w-[300px]"
            >
              <div class="relative flex items-center p-0 rounded-[8px] overflow-hidden w-full">
                <div
                  class="absolute inset-y-0 left-0 w-1/3 border border-black bg-transparent rounded-[8px] pointer-events-none transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu z-10"
                  :style="{
                    transform: `translateX(${selectedGraphicSize === 'S' ? 0 : selectedGraphicSize === 'M' ? 100 : 200}%)`
                  }"
                ></div>

                <button
                  type="button"
                  @click.stop="handleSetGraphicSize('S')"
                  class="relative z-20 w-1/3 py-2.5 text-[12px] font-['Stanley_Favorit',sans-serif] text-center tracking-[-0.36px] transition-colors duration-200 cursor-pointer select-none"
                  :class="[
                    selectedGraphicSize === 'S'
                      ? 'text-black font-medium'
                      : 'text-black/60 font-normal hover:text-black'
                  ]"
                >
                  Small
                </button>

                <button
                  type="button"
                  @click.stop="handleSetGraphicSize('M')"
                  class="relative z-20 w-1/3 py-2.5 text-[12px] font-['Stanley_Favorit',sans-serif] text-center tracking-[-0.36px] transition-colors duration-200 cursor-pointer select-none"
                  :class="[
                    selectedGraphicSize === 'M'
                      ? 'text-black font-medium'
                      : 'text-black/60 font-normal hover:text-black'
                  ]"
                >
                  Standard
                </button>

                <button
                  type="button"
                  @click.stop="handleSetGraphicSize('L')"
                  class="relative z-20 w-1/3 py-2.5 text-[12px] font-['Stanley_Favorit',sans-serif] text-center tracking-[-0.36px] transition-colors duration-200 cursor-pointer select-none"
                  :class="[
                    selectedGraphicSize === 'L'
                      ? 'text-black font-medium'
                      : 'text-black/60 font-normal hover:text-black'
                  ]"
                >
                  Large
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Step Controls & Details (Figma Node 5093:8868 - Clean without border-l) -->
        <div class="w-full lg:w-2/5 bg-white p-6 lg:p-10 flex flex-col justify-between overflow-y-auto">
          
          <div class="space-y-7">
            <!-- Product Info (Figma Node 5117:1434) -->
            <div class="space-y-4">
              <!-- Title (32px, Stanley Favorit) -->
              <h1 class="font-['Stanley_Favorit',sans-serif] font-normal text-2xl sm:text-3xl lg:text-[32px] text-black leading-tight">
                {{ product.name }}
              </h1>

              <!-- Product Features Badges & Pricing (Node 5117:1436) -->
              <div class="space-y-4">
                <!-- Durations Pill -->
                <div class="inline-flex items-center gap-4 bg-[#f5f5f5] px-4 py-2 rounded-lg">
                  <div class="flex items-center gap-2 text-[14px] text-black">
                    <Snowflake :size="15" class="text-neutral-700" />
                    <span>11 Hours</span>
                  </div>
                  <div class="h-4 w-px bg-neutral-300"></div>
                  <div class="flex items-center gap-2 text-[14px] text-black">
                    <Box :size="15" class="text-neutral-700" />
                    <span>2 Hours</span>
                  </div>
                </div>

                <!-- Price and Customization Offer -->
                <div class="flex items-center gap-4 text-[14px] text-black font-['Stanley_Favorit',sans-serif]">
                  <span class="font-bold">{{ product.priceFormatted }}</span>
                  <span class="text-neutral-600 font-normal">Free Standard Customization</span>
                </div>
              </div>
            </div>

            <!-- 3-Step Header Container (Figma Node 5105:1378 - Clean border layering) -->
            <div class="relative flex items-center h-[56px] w-full rounded-[8px] border border-[#ededed] bg-white p-0">
              <!-- Step 1 -->
              <button
                @click="currentStep = 1"
                class="flex-1 h-full px-4 flex items-center justify-center cursor-pointer transition-all relative rounded-[8px]"
                :class="[
                  currentStep === 1
                    ? 'border border-black bg-white text-black z-10 shadow-2xs'
                    : 'border border-transparent text-black hover:opacity-80'
                ]"
              >
                <div class="flex flex-col items-start text-left">
                  <span class="text-[10px] text-neutral-500 font-normal leading-tight">Step 1</span>
                  <span class="text-[14px] text-black font-normal leading-tight whitespace-nowrap">Your Base</span>
                </div>
              </button>

              <div v-if="currentStep !== 1 && currentStep !== 2" class="h-6 w-px bg-neutral-200 flex-none"></div>

              <!-- Step 2 (Can only be accessed via Next button at the beginning) -->
              <button
                @click="maxStepReached >= 2 && (currentStep = 2)"
                :disabled="maxStepReached < 2"
                class="flex-1 h-full px-4 flex items-center justify-center transition-all relative rounded-[8px] select-none"
                :class="[
                  currentStep === 2
                    ? 'border border-black bg-white text-black z-10 shadow-2xs cursor-pointer'
                    : maxStepReached >= 2
                      ? 'border border-transparent text-black opacity-100 cursor-pointer hover:opacity-80'
                      : 'border border-transparent opacity-20 text-black cursor-not-allowed'
                ]"
              >
                <div class="flex flex-col items-start text-left">
                  <span class="text-[10px] text-neutral-500 font-normal leading-tight">Step 2</span>
                  <span class="text-[14px] text-black font-normal leading-tight whitespace-nowrap">Personalize</span>
                </div>
              </button>

              <div v-if="currentStep !== 2 && currentStep !== 3" class="h-6 w-px bg-neutral-200 flex-none"></div>

              <!-- Step 3 (Blocked until Step 2 has at least one applied personalization) -->
              <button
                @click="hasPersonalization && (currentStep = 3)"
                :disabled="!hasPersonalization"
                class="flex-1 h-full px-4 flex items-center justify-center transition-all relative rounded-[8px] select-none"
                :class="[
                  currentStep === 3
                    ? 'border border-black bg-white text-black z-10 shadow-2xs cursor-pointer'
                    : hasPersonalization
                      ? 'border border-transparent text-black opacity-100 cursor-pointer hover:opacity-80'
                      : 'border border-transparent opacity-20 text-black cursor-not-allowed'
                ]"
              >
                <div class="flex flex-col items-start text-left">
                  <span class="text-[10px] text-neutral-500 font-normal leading-tight">Step 3</span>
                  <span class="text-[14px] text-black font-normal leading-tight whitespace-nowrap">Review</span>
                </div>
              </button>
            </div>

            <!-- 3-Step Content Panels with Smooth Vue Step-Fade Transition -->
            <transition name="step-fade" mode="out-in">
              <!-- STEP 1 CONTENT: Colors and Sizes (Figma Node 5093:8874) -->
              <div v-if="currentStep === 1" key="step1" class="space-y-8">
                <!-- Colors Swatches Section (Node 5093:8875) -->
                <div class="space-y-4">
                  <div class="flex items-center gap-2 text-[14px] text-black font-['Stanley_Favorit',sans-serif]">
                    <span class="font-normal">Colors:</span>
                    <span class="font-bold">{{ selectedColor.name }}</span>
                  </div>

                  <!-- Color Option Grid (Node 5093:8878 - 30.333px circular swatches, gap 12px) -->
                  <div class="flex flex-wrap gap-[12px] items-center">
                    <button
                      v-for="col in product.colors"
                      :key="col.name"
                      @click="selectedColor = col"
                      :title="col.name"
                      class="relative w-[30.33px] h-[30.33px] rounded-full transition-all duration-200 cursor-pointer flex-none flex items-center justify-center hover:scale-115 active:scale-95 transform-gpu shadow-xs"
                      :style="{ backgroundColor: col.hex }"
                    >
                      <!-- Active O-Ring Border (Node 5105:74) -->
                      <span
                        v-if="selectedColor.name === col.name"
                        class="absolute -inset-[3px] rounded-full border border-black pointer-events-none animate-pop-in"
                      ></span>
                    </button>
                  </div>
                </div>

                <!-- Sizes Section (Node 5093:8891) -->
                <div class="space-y-4">
                  <label class="block text-[14px] font-normal text-black font-['Stanley_Favorit',sans-serif]">
                    Size
                  </label>
                  <!-- Size Options (Node 5093:8893 - border border-black rounded-[4px] h-[40px]) -->
                  <div class="flex flex-wrap gap-[12px] items-center">
                    <button
                      v-for="sizeOption in sizes"
                      :key="sizeOption"
                      @click="selectedSize = sizeOption"
                      class="h-[40px] px-[16px] py-[8px] rounded-[4px] border border-black border-solid text-[14px] font-['Stanley_Favorit',sans-serif] font-normal transition-all duration-200 cursor-pointer flex items-center justify-center hover:scale-[1.03] active:scale-[0.97]"
                      :class="[
                        selectedSize === sizeOption
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-white text-black hover:bg-neutral-50'
                      ]"
                    >
                      {{ sizeOption }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- STEP 2 CONTENT: Personalization Controls (Figma Node 5105:1287) -->
              <div v-else-if="currentStep === 2" key="step2" class="space-y-4">
                <!-- STATE A: Category Selection Menu (3 Cards matching Figma Node 5105:1287) -->
                <div v-if="!selectedSubCategory" class="flex flex-col gap-[8px] w-full">
                  <!-- Card 1: Browse Gallery -->
                  <button
                    @click="selectedSubCategory = 'gallery'"
                    class="bg-[#f9f9f9] rounded-[8px] p-[24px] flex items-start gap-[24px] text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md active:scale-[0.99] cursor-pointer w-full group"
                  >
                    <div class="w-6 h-6 flex items-center justify-center text-black flex-none mt-0.5 group-hover:scale-110 transition-transform">
                      <LayoutGrid :size="24" class="stroke-[1.5]" />
                    </div>
                    <div class="flex flex-col gap-[8px] flex-1">
                      <div class="flex items-center justify-between w-full">
                        <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] text-black leading-none">
                          Browse Gallery
                        </span>
                        <button
                          v-if="selectedArtwork !== null"
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

                  <!-- Card 2: Personalize with Text (Figma Node 5148:6118 Official Ss Vector Icon) -->
                  <button
                    @click="openTextPersonalization"
                    class="bg-[#f9f9f9] rounded-[8px] p-[24px] flex items-start gap-[24px] text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-md active:scale-[0.99] cursor-pointer w-full group"
                  >
                    <div class="w-6 h-6 flex items-center justify-center text-black flex-none mt-0.5 group-hover:scale-110 transition-transform">
                      <svg viewBox="0 0 35 29.2726" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-6 h-auto max-h-6">
                        <g id="Icon Container">
                          <path id="Vector" d="M11.1805 29.2726C4.47219 29.2726 0.203281 26.02 0 19.7183H4.06563C4.06563 23.5807 7.0742 25.6135 11.3431 25.6135H11.7497C15.5714 25.6135 17.6448 23.7026 17.6448 21.3446C17.6448 19.0272 16.1812 17.6855 13.1726 17.0757L8.61914 16.1406C4.06563 15.2055 1.42297 12.6441 1.42297 8.13128C1.42297 3.65909 5.44794 1.88351e-05 11.587 1.88351e-05C17.8888 1.88351e-05 21.9137 3.45581 22.117 8.94441H18.0514C17.8481 5.6919 15.2461 3.65909 11.7903 3.65909H11.3838C7.84667 3.65909 5.4886 5.56993 5.4886 8.09062C5.4886 10.2861 6.99288 11.5871 9.39161 12.0749L13.9451 12.9694C18.8645 13.9451 21.7105 16.5471 21.7105 21.182C21.7105 26.1827 17.4822 29.2726 11.1805 29.2726Z" fill="currentColor"/>
                          <path id="Vector_2" d="M29.8671 28.205C26.4876 28.205 24.6581 26.4262 24.6581 24.0123H27.072C27.1991 25.5369 28.3934 26.1721 29.8926 26.1721H30.0958C31.4172 26.1721 32.459 25.5369 32.459 24.5205C32.459 23.7074 32.0016 23.1483 30.7311 22.8942L28.8761 22.5385C26.8179 22.1319 25.1663 21.0647 25.1663 18.9048C25.1663 16.3638 27.4278 14.9917 29.9688 14.9917C33.2975 14.9917 35 16.7704 35 19.1843H32.586C32.459 18.0409 31.7475 17.0245 30.0958 17.0245H29.8926C28.4696 17.0245 27.5802 17.7614 27.5802 18.6507C27.5802 19.5401 28.0884 20.0229 29.3589 20.277L31.3663 20.6835C33.2975 21.0647 34.873 22.1065 34.873 24.3934C34.873 26.6803 32.8147 28.205 29.8671 28.205Z" fill="currentColor"/>
                        </g>
                      </svg>
                    </div>
                    <div class="flex flex-col gap-[8px] flex-1">
                      <div class="flex items-center justify-between w-full">
                        <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] text-black leading-none">
                          Personalize with Text
                        </span>
                        <button
                          v-if="isTextComplete"
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

                  <!-- Card 3: Upload Your Own Design (3rd position - Unclickable, content 20% opacity, Coming Soon label 100% opacity) -->
                  <div
                    class="relative bg-[#f9f9f9] rounded-[8px] p-[24px] flex items-start gap-[24px] text-left pointer-events-none cursor-not-allowed w-full select-none"
                  >
                    <div class="w-6 h-6 flex items-center justify-center text-black flex-none mt-0.5 opacity-20">
                      <Upload :size="24" class="stroke-[1.5]" />
                    </div>
                    <div class="flex flex-col gap-[8px] flex-1">
                      <div class="flex items-center justify-between w-full">
                        <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] text-black leading-none opacity-20">
                          Upload Your Own Design
                        </span>
                        <button
                          v-if="uploadedFileName !== null"
                          type="button"
                          @click.stop="handleRemoveUpload"
                          class="pointer-events-auto text-[13px] font-medium text-neutral-500 hover:text-black underline underline-offset-4 hover:bg-neutral-200/60 px-2 py-0.5 rounded transition-all cursor-pointer z-10 shrink-0 opacity-100"
                          title="Remove uploaded design"
                        >
                          Remove
                        </button>
                        <span v-else class="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase opacity-100 shadow-xs">
                          Coming Soon
                        </span>
                      </div>
                      <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[12px] text-neutral-600 leading-[16px] opacity-20">
                        Bring your own logo or vector artwork to life.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- STEP 3 CONTENT: Review Details (Figma Node 5177:7945 Updated) -->
              <div v-else-if="currentStep === 3" key="step3" class="space-y-[32px] animate-slide-up-fade flex-1">
                <!-- Header & Disclaimer Container (Figma Node 5177:7958) -->
                <div class="flex flex-col gap-[8px] w-full">
                  <h2 class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] text-black leading-tight">
                    Please double check your details.
                  </h2>
                  <p class="font-['Stanley_Favorit',sans-serif] font-medium text-[12px] text-black leading-[20px] mb-0">
                    By continuing, you have double-checked your spelling and layout. You understand that custom engravings are permanent, and all sales are final.
                  </p>
                </div>

                <!-- Main Grey Card Container (Figma Node 5255:4661) -->
                <div class="bg-[#f9f9f9] rounded-[8px] p-[24px] flex flex-col gap-[12px] w-full">
                  <!-- Color & Size Selected Row (Figma Node 5255:4732) -->
                  <div class="flex items-center gap-[8px] text-[12px] text-black leading-normal">
                    <span class="font-['Stanley_Favorit',sans-serif] font-medium">Color & Size Selected</span>
                    <span class="font-['Stanley_Favorit',sans-serif] font-medium">:</span>
                    <span class="font-['Stanley_Favorit',sans-serif] font-normal">{{ selectedSize }} - {{ selectedColor.name }}</span>
                  </div>

                  <!-- Personalized Items Section (Figma Node 5177:7965) -->
                  <div class="flex flex-col gap-[8px] w-full">
                    <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[12px] text-black">
                      Personalized Items
                    </span>

                    <!-- Text Customization Card (Figma Node 5255:4685) -->
                    <div
                      v-if="engravingText.trim().length > 0"
                      class="border border-black border-solid rounded-[8px] p-[16px] bg-white flex flex-col gap-[8px] w-full shadow-2xs"
                    >
                      <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] text-black leading-normal">
                        Text
                      </span>
                      <!-- Row 1: Text -->
                      <div class="flex items-center gap-[8px] text-[12px] font-['Stanley_Favorit',sans-serif] text-black">
                        <span class="w-[80px] shrink-0 font-normal">Text</span>
                        <span>:</span>
                        <span class="font-normal truncate">“{{ engravingText }}”</span>
                      </div>
                      <!-- Row 2: Font Selected, Size & Orientation -->
                      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full text-[12px] font-['Stanley_Favorit',sans-serif] text-black">
                        <div class="flex items-center gap-[8px]">
                          <span class="w-[80px] shrink-0 font-normal">Font Selected</span>
                          <span>:</span>
                          <span class="font-normal truncate">{{ selectedFont || 'Stanley Favorite' }}</span>
                        </div>
                        <div class="flex items-center gap-[8px]">
                          <span class="w-[80px] sm:w-auto shrink-0 font-normal">Size</span>
                          <span>:</span>
                          <span class="font-normal">{{ selectedFontSize }}</span>
                        </div>
                        <div class="flex items-center gap-[8px]">
                          <span class="w-[80px] sm:w-auto shrink-0 font-normal">Orientation</span>
                          <span>:</span>
                          <span class="font-normal">{{ textOrientation === 'vertical' ? 'Vertical' : 'Horizontal' }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Graphic Customization Card (Figma Node 5255:4701) -->
                    <div
                      v-if="selectedArtwork !== null || uploadedFileName !== null"
                      class="border border-black border-solid rounded-[8px] p-[16px] bg-white flex flex-col gap-[8px] w-full shadow-2xs"
                    >
                      <span class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] text-black leading-normal">
                        Graphic
                      </span>
                      <!-- Row 1: Artwork Name -->
                      <div class="flex items-center gap-[8px] text-[12px] font-['Stanley_Favorit',sans-serif] text-black">
                        <span class="w-[80px] shrink-0 font-normal">Artwork Name</span>
                        <span>:</span>
                        <span class="font-normal truncate">“{{ artworkOptions.find(a => a.id === selectedArtwork)?.name || uploadedFileName || 'Juventus Emblem' }}”</span>
                      </div>
                      <!-- Row 2: Artist Name -->
                      <div class="flex items-center gap-[8px] text-[12px] font-['Stanley_Favorit',sans-serif] text-black">
                        <span class="w-[80px] shrink-0 font-normal">Artist Name</span>
                        <span>:</span>
                        <span class="font-normal truncate">{{ activeCampaign ? activeCampaign.title.replace('.', '') : 'Stanley Favorite' }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Placement Line (Figma Node 5255:4740) -->
                  <div class="font-['Stanley_Favorit',sans-serif] font-medium text-[12px] text-black pt-1">
                    Placement: {{ (selectedPlacement || 'Center').charAt(0).toUpperCase() + (selectedPlacement || 'Center').slice(1) }}{{ hasBothPersonalizations ? (stackOrder === 'graphic-top' ? ' — Graphic Above Text' : ' — Text Above Graphic') : '' }}
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <!-- Bottom Action Buttons (Figma Node 5087:8510 Full-Width Next Step CTA - Clean without border-t) -->
          <div class="pt-6 flex items-center gap-4">
            <button
              v-if="currentStep > 1"
              @click="handlePrevStep"
              class="px-6 h-[48px] border border-black rounded-[8px] font-bold text-[14px] text-black hover:bg-neutral-50 active:scale-[0.97] transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 select-none shadow-xs"
            >
              <ArrowLeft :size="16" />
              <span>Back</span>
            </button>

            <!-- Step 1 & 2 Action Button: Full-Width Next Step (Figma Node 5087:8510) -->
            <button
              v-if="currentStep < 3"
              @click="handleNextStep"
              :disabled="currentStep === 2 && !hasPersonalization"
              class="w-full flex-1 h-[48px] font-['Stanley_Favorit',sans-serif] font-bold text-[14px] rounded-[8px] transition-all duration-200 flex items-center justify-center select-none"
              :class="[
                currentStep === 2 && !hasPersonalization
                  ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-60'
                  : 'bg-black text-white hover:bg-neutral-800 btn-shimmer hover:scale-[1.01] active:scale-[0.98] cursor-pointer shadow-sm hover:shadow-md'
              ]"
            >
              <span>{{ currentStep === 1 ? 'Next: Personalize' : 'Next Step' }}</span>
            </button>

            <!-- Step 3 Action Button: Full-Width Add to Cart -->
            <button
              v-else
              @click="handleAddToCart"
              :disabled="isAdded"
              class="w-full flex-1 h-[48px] bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-['Stanley_Favorit',sans-serif] font-bold text-[14px] rounded-[8px] transition-all duration-200 btn-shimmer hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 shadow-sm hover:shadow-md"
            >
              <Check v-if="isAdded" :size="18" class="animate-pop-in" />
              <span>{{ isAdded ? 'Added to Cart!' : `Add to Cart - ${product.priceFormatted}` }}</span>
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- SLIDE-IN RIGHT SIDEBAR WINDOW: "Personalize with Text" (Figma Node 5151:6233) -->
    <Teleport to="body">
      <!-- Backdrop Overlay with Fade Transition (No blur - keeps realtime product preview crystal clear) -->
      <transition name="fade">
        <div
          v-if="currentStep === 2 && selectedSubCategory === 'text'"
          class="fixed inset-0 z-[90] pointer-events-none"
        ></div>
      </transition>

      <!-- Right Sidebar Drawer with Spring Slide Transition -->
      <transition name="slide-drawer">
        <div
          v-if="currentStep === 2 && selectedSubCategory === 'text'"
          class="fixed inset-y-0 right-0 z-[100] w-full max-w-[576px] w-[576px] bg-white border-l border-[#d9d9d9] shadow-2xl flex flex-col justify-between px-[28px] sm:px-[40px] py-[32px] sm:py-[44px] overflow-y-auto"
        >
          <div class="space-y-[24px] sm:space-y-[32px]">
            <!-- Sidebar Header Container (Figma Node 5151:6191) -->
            <div class="flex items-center justify-between w-full">
              <h2 class="font-['Stanley_Favorit',sans-serif] font-medium text-[24px] text-black">
                Personalize with Text
              </h2>
              <button
                @click="handleAttemptClose"
                class="w-[36px] h-[36px] rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-black transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X :size="22" />
              </button>
            </div>

            <!-- Text Input Box & Helper Subtext (Figma Node 5148:6144 & 5148:6146) -->
            <div class="space-y-2">
              <div class="relative">
                <textarea
                  ref="textInputRef"
                  :value="engravingText"
                  @input="handleTextInput"
                  rows="2"
                  placeholder="Type your text here (ex: Stanley Indonesia)"
                  class="w-full bg-white border border-black min-h-[48px] rounded-[8px] px-[20px] py-[12px] text-[14px] text-black focus:outline-none placeholder:text-[#898989] font-['Stanley_Favorit',sans-serif] transition-all resize-none"
                ></textarea>
              </div>
              <div class="font-['Stanley_Favorit',sans-serif] font-normal text-[12px] text-black leading-[18px]">
                <p class="mb-0">Text capacity adapts dynamically to your chosen font, size & placement.</p>
                <p>Profanity and restricted phrases will be blocked.</p>
              </div>
            </div>

            <!-- Font Selection Grid (Figma Node 5151:6203 / 5699:7158) -->
            <div class="space-y-2.5">
              <h3 class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] text-black">
                Select Your Font
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-[8px] w-full">
                <button
                  v-for="font in fontOptions"
                  :key="font.name"
                  type="button"
                  @click="selectedFont = font.name"
                  class="border border-black border-solid rounded-[4px] h-[48px] flex items-center justify-center cursor-pointer select-none transition-colors"
                  :class="[
                    (selectedFont === font.name || selectedFont === font.class)
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-neutral-50'
                  ]"
                >
                  <div
                    v-if="font.singleLine"
                    class="text-[12px] text-center tracking-[-0.36px] w-full flex flex-col justify-center h-[48px] px-1"
                    :class="font.class"
                  >
                    <p class="leading-[32px] truncate">{{ font.singleLine }}</p>
                  </div>
                  <div
                    v-else
                    class="text-[12px] text-center tracking-[-0.36px] w-full flex flex-col justify-center h-[48px] px-1"
                    :class="font.class"
                  >
                    <p class="leading-[14px] mb-0 truncate">{{ font.line1 }}</p>
                    <p class="leading-[14px] truncate">{{ font.line2 }}</p>
                  </div>
                </button>
              </div>
            </div>

            <!-- Font Size Options -->
            <div class="space-y-2.5">
              <h3 class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] text-black">
                Font Size
              </h3>
              <div class="grid grid-cols-4 gap-[8px] w-full">
                <button
                  v-for="sz in fontSizeOptions"
                  :key="sz"
                  type="button"
                  :disabled="isFontSizeDisabled(sz)"
                  @click="handleSelectFontSize(sz)"
                  class="h-[44px] rounded-[4px] border border-black border-solid flex items-center justify-center font-['Stanley_Favorit',sans-serif] text-[13px] tracking-[-0.36px] transition-colors select-none"
                  :class="[
                    isFontSizeDisabled(sz)
                      ? 'opacity-30 cursor-not-allowed text-neutral-400 bg-neutral-100'
                      : selectedFontSize === sz
                      ? 'bg-black text-white font-medium cursor-pointer'
                      : 'bg-white text-black hover:bg-neutral-50 font-normal cursor-pointer'
                  ]"
                >
                  {{ sz }}
                </button>
              </div>
            </div>

            <!-- Placement Options (Orientation + Alignment) -->
            <div class="space-y-2.5 w-full">
              <h3 class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] text-black">
                Set Placement
              </h3>

              <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
                <!-- Orientation Pill (Horizontal / Vertical) -->
                <div class="border border-black border-solid rounded-[4px] flex items-center shrink-0">
                  <button
                    type="button"
                    @click="setOrientation('horizontal')"
                    class="w-[100px] h-[48px] rounded-[4px] flex items-center justify-center text-[13px] tracking-[-0.36px] font-['Stanley_Favorit',sans-serif] cursor-pointer select-none transition-colors"
                    :class="[
                      textOrientation === 'horizontal'
                        ? 'bg-black text-white border border-black border-solid'
                        : 'bg-transparent text-black hover:bg-neutral-50'
                    ]"
                  >
                    Horizontal
                  </button>
                  <button
                    type="button"
                    @click="setOrientation('vertical')"
                    class="w-[100px] h-[48px] rounded-[4px] flex items-center justify-center text-[13px] tracking-[-0.36px] font-['Stanley_Favorit',sans-serif] cursor-pointer select-none transition-colors"
                    :class="[
                      textOrientation === 'vertical'
                        ? 'bg-black text-white border border-black border-solid'
                        : 'bg-transparent text-black hover:bg-neutral-50'
                    ]"
                  >
                    Vertical
                  </button>
                </div>

                <!-- Alignment Icons Container (Only visible when orientation is horizontal) -->
                <div
                  v-if="textOrientation === 'horizontal'"
                  class="bg-[#ededed] flex gap-[20px] h-[48px] items-center px-[16px] rounded-[4px] justify-center sm:justify-start"
                >
                  <!-- Top Align -->
                  <button
                    type="button"
                    @click="selectedPlacement = 'top'"
                    class="relative shrink-0 size-[28px] flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                    title="Align Top"
                  >
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="4.5" y1="7" x2="23.5" y2="7" stroke="black" stroke-width="1.5" stroke-linecap="round" />
                      <rect x="5.5" y="10.5" width="17" height="8" rx="1.5" stroke="black" stroke-width="1.5" :fill="selectedPlacement === 'top' ? 'black' : 'none'" />
                    </svg>
                  </button>

                  <!-- Center Align -->
                  <button
                    type="button"
                    @click="selectedPlacement = 'center'"
                    class="relative shrink-0 size-[28px] flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                    title="Align Center"
                  >
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="4.5" y1="6.5" x2="23.5" y2="6.5" stroke="black" stroke-width="1.5" stroke-linecap="round" />
                      <rect x="5.5" y="10" width="17" height="8" rx="1.5" stroke="black" stroke-width="1.5" :fill="(selectedPlacement || 'center') === 'center' ? 'black' : 'none'" />
                      <line x1="4.5" y1="21.5" x2="23.5" y2="21.5" stroke="black" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                  </button>

                  <!-- Bottom Align -->
                  <button
                    type="button"
                    @click="selectedPlacement = 'bottom'"
                    class="relative shrink-0 size-[28px] flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                    title="Align Bottom"
                  >
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="5.5" y="9.5" width="17" height="8" rx="1.5" stroke="black" stroke-width="1.5" :fill="selectedPlacement === 'bottom' ? 'black' : 'none'" />
                      <line x1="4.5" y1="21" x2="23.5" y2="21" stroke="black" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Action CTA -->
          <div class="pt-6">
            <button
              @click="isTextComplete && applyEdits()"
              :disabled="!isTextComplete"
              class="w-full h-[52px] rounded-[8px] font-['Stanley_Favorit',sans-serif] font-medium text-[14px] transition-all"
              :class="[
                isTextComplete
                  ? 'bg-black text-white hover:bg-neutral-800 cursor-pointer shadow-md opacity-100'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-60'
              ]"
            >
              Apply
            </button>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- SLIDE-IN RIGHT SIDEBAR WINDOW: "Browse Gallery" (Figma Node 5164:6419) -->
    <Teleport to="body">
      <!-- Backdrop Overlay with Fade Transition -->
      <transition name="fade">
        <div
          v-if="currentStep === 2 && selectedSubCategory === 'gallery'"
          class="fixed inset-0 z-[90] pointer-events-none"
        ></div>
      </transition>

      <!-- Right Sidebar Drawer with Spring Slide Transition -->
      <transition name="slide-drawer">
        <div
          v-if="currentStep === 2 && selectedSubCategory === 'gallery'"
          class="fixed inset-y-0 right-0 z-[100] w-full max-w-[576px] w-[576px] bg-white border-l border-[#d9d9d9] shadow-2xl flex flex-col justify-between overflow-hidden"
        >
          <!-- Scrollable Gallery Content Area -->
          <div
            @scroll="handleDrawerScroll"
            class="flex-1 overflow-y-auto px-[28px] sm:px-[40px] pt-[40px] sm:pt-[64px] pb-[100px] flex flex-col justify-between"
          >
          <!-- CAMPAIGN DETAIL VIEW (Figma Node 5171:7043) -->
          <div v-if="activeCampaign" class="space-y-[32px] sm:space-y-[48px] animate-fade-in flex-1">
            <div class="space-y-[32px] sm:space-y-[48px]">
              <!-- Sidebar Header Container -->
              <div class="flex items-center justify-between w-full">
                <h2 class="font-['Stanley_Favorit',sans-serif] font-medium text-[24px] text-black">
                  About {{ activeCampaign.title.replace('.', '') }}
                </h2>
                <button
                  @click="activeCampaign = null"
                  class="w-[36px] h-[36px] rounded-full hover:bg-neutral-100 flex items-center justify-center text-black transition-colors cursor-pointer"
                  aria-label="Back to main gallery"
                >
                  <ArrowLeft :size="20" />
                </button>
              </div>

              <!-- Campaign Description (Figma Node 5171:7172) -->
              <p class="font-['Stanley_Favorit',sans-serif] font-normal text-[14px] text-black leading-[20px] mb-6">
                {{ activeCampaign.description }}
              </p>

              <!-- Campaign Graphics Grid (3 Columns matching Figma Node 5171:7043) -->
              <div class="grid grid-cols-3 gap-[8px] w-full">
                <button
                  v-for="art in activeCampaign.graphics"
                  :key="art.id"
                  @click="selectedArtwork = selectedArtwork === art.id ? null : art.id"
                  class="w-full h-[184px] bg-[#f5f5f5] hover:bg-[#eaeaea] rounded-[8px] p-[16px] flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none"
                  :class="[
                    selectedArtwork === art.id
                      ? 'border border-black bg-white shadow-2xs'
                      : 'border border-transparent'
                  ]"
                >
                  <div class="w-[80px] h-[80px] flex items-center justify-center text-[44px] text-black p-2">
                    <img
                      v-if="art.img"
                      :src="art.img"
                      :alt="art.name"
                      class="max-w-[64px] max-h-[64px] object-contain pointer-events-none"
                    />
                    <span v-else>{{ art.symbol }}</span>
                  </div>
                  <div class="flex flex-col gap-[2px] w-full text-center">
                    <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[12px] text-black leading-snug truncate">
                      {{ art.name }}
                    </span>
                    <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[10px] text-neutral-500 leading-none truncate">
                      {{ art.subtext }}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- CATEGORY ARTWORK DETAIL VIEW (Figma Node 5172:7490) -->
          <div
            v-else-if="activeCategory"
            @wheel.prevent.stop="handleCategoryWheel"
            @touchstart="handleCategoryTouchStart"
            @touchend="handleCategoryTouchEnd"
            class="space-y-[32px] sm:space-y-[48px] animate-fade-in flex-1 select-none overflow-hidden"
          >
            <div class="space-y-[32px] sm:space-y-[48px]">
              <!-- Sidebar Header Container (Figma Node 5172:7491) -->
              <div class="flex items-center justify-between w-full">
                <h2 class="font-['Stanley_Favorit',sans-serif] font-medium text-[24px] text-black truncate">
                  {{ activeCategory.name }}
                </h2>
                <div class="flex items-center gap-[12px] shrink-0">
                  <button
                    type="button"
                    class="border border-black rounded-[8px] px-[14px] py-[6px] text-[14px] font-['Stanley_Favorit',sans-serif] font-normal text-black hover:bg-neutral-50 transition-colors cursor-pointer select-none"
                  >
                    Filter & Sort
                  </button>
                  <button
                    @click="activeCategory = null"
                    class="w-[36px] h-[36px] rounded-full hover:bg-neutral-100 flex items-center justify-center text-black transition-colors cursor-pointer"
                    aria-label="Back to main gallery"
                  >
                    <ArrowLeft :size="20" />
                  </button>
                </div>
              </div>

              <!-- Category Graphics Horizontal Track Slider Container (Figma Node 5172:7496) -->
              <div class="overflow-hidden w-full relative min-h-[376px] rounded-[8px]">
                <div
                  class="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu w-full"
                  :style="{ transform: `translateX(-${categoryPageIndex * 100}%)` }"
                >
                  <div
                    v-for="(pageGraphics, pageIdx) in categoryPages"
                    :key="pageIdx"
                    class="w-full shrink-0 grid grid-cols-3 gap-[8px] min-h-[376px]"
                  >
                    <button
                      v-for="art in pageGraphics"
                      :key="art.id"
                      @click="selectedArtwork = selectedArtwork === art.id ? null : art.id"
                      class="w-full h-[184px] bg-[#f5f5f5] hover:bg-[#eaeaea] rounded-[8px] p-[16px] flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none"
                      :class="[
                        selectedArtwork === art.id
                          ? 'border border-black bg-white shadow-2xs'
                          : 'border border-transparent'
                      ]"
                    >
                      <div class="w-[80px] h-[80px] flex items-center justify-center text-[44px] text-black p-2">
                        <img
                          v-if="art.img"
                          :src="art.img"
                          :alt="art.name"
                          class="max-w-[64px] max-h-[64px] object-contain pointer-events-none"
                        />
                        <span v-else>{{ art.symbol }}</span>
                      </div>
                      <div class="flex flex-col gap-[2px] w-full text-center">
                        <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[12px] text-black leading-snug truncate">
                          {{ art.name }}
                        </span>
                        <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[10px] text-neutral-500 leading-none truncate">
                          {{ art.subtext }}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Functional Pagination Controls (Figma Node 5172:7490) -->
              <div class="flex items-center justify-between w-full pt-4">
                <button
                  type="button"
                  @click="prevCategoryPage"
                  :disabled="categoryPageIndex === 0"
                  class="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all select-none"
                  :class="[
                    categoryPageIndex === 0
                      ? 'bg-[#f2f2f2] text-neutral-400 cursor-not-allowed opacity-60'
                      : 'border border-black text-black hover:bg-black hover:text-white cursor-pointer'
                  ]"
                >
                  <ChevronLeft :size="16" />
                </button>

                <!-- Interactive Pagination Dots -->
                <div class="flex items-center gap-[8px]">
                  <span
                    v-for="idx in totalCategoryPages"
                    :key="idx"
                    @click="categoryPageIndex = idx - 1"
                    class="w-[8px] h-[8px] rounded-full transition-all duration-300 cursor-pointer"
                    :class="categoryPageIndex === (idx - 1) ? 'bg-black scale-125' : 'bg-neutral-300 hover:bg-neutral-500'"
                  ></span>
                </div>

                <button
                  type="button"
                  @click="nextCategoryPage"
                  :disabled="categoryPageIndex >= totalCategoryPages - 1"
                  class="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all select-none"
                  :class="[
                    categoryPageIndex >= totalCategoryPages - 1
                      ? 'bg-[#f2f2f2] text-neutral-400 cursor-not-allowed opacity-60'
                      : 'border border-black text-black hover:bg-black hover:text-white cursor-pointer'
                  ]"
                >
                  <ChevronRight :size="16" />
                </button>
              </div>
            </div>
          </div>

          <!-- MAIN BROWSE GALLERY VIEW -->
          <div v-else class="space-y-[32px] sm:space-y-[48px] flex-1">
            <div class="space-y-[32px] sm:space-y-[48px]">
              <!-- Sidebar Header Container (Figma Node 5164:6420) -->
              <div class="flex items-center justify-between w-full">
                <h2 class="font-['Stanley_Favorit',sans-serif] font-medium text-[24px] text-black">
                  Browse Gallery
                </h2>
                <button
                  @click="handleAttemptClose"
                  class="w-[36px] h-[36px] rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-black transition-colors cursor-pointer"
                  aria-label="Close sidebar"
                >
                  <X :size="22" />
                </button>
              </div>

              <!-- Graphic Campaign API Slider Hero Banner Container (Figma Node 5164:6464) -->
              <div
                @click="activeCampaign = graphicCampaigns[currentSlideIndex]"
                class="bg-[#f5f5f5] rounded-[8px] overflow-hidden relative w-full h-[192px] p-[24px] flex flex-col justify-between text-white group shadow-xs cursor-pointer select-none"
              >
                <transition name="fade" mode="out-in">
                  <img
                    :key="graphicCampaigns[currentSlideIndex].id"
                    :src="graphicCampaigns[currentSlideIndex].bannerImg"
                    :alt="graphicCampaigns[currentSlideIndex].title"
                    class="absolute inset-0 w-full h-full object-cover pointer-events-none brightness-90 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu"
                  />
                </transition>

                <div class="relative z-10 font-['Stanley_Favorit',sans-serif] font-bold text-[20px] text-white tracking-[-0.6px] leading-[24px]">
                  <p class="mb-0">{{ graphicCampaigns[currentSlideIndex].title }}</p>
                  <p>{{ graphicCampaigns[currentSlideIndex].subtitle }}</p>
                </div>
                <div class="relative z-10 flex items-end justify-between w-full">
                  <button
                    type="button"
                    @click.stop="activeCampaign = graphicCampaigns[currentSlideIndex]"
                    class="bg-[#f5f5f5] hover:bg-white text-black h-[40px] px-[16px] py-[8px] rounded-[8px] font-['Stanley_Favorit',sans-serif] font-bold text-[12px] flex items-center gap-[8px] transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Explore Graphics</span>
                    <!-- Circle Container on + Icon with #f2f2f2 background and thinner premium Plus icon -->
                    <span class="w-[20px] h-[20px] rounded-full bg-[#f2f2f2] text-black flex items-center justify-center shrink-0">
                      <Plus :size="12" :stroke-width="1.5" />
                    </span>
                  </button>

                  <!-- Premium Slider Pagination Dots -->
                  <div class="flex items-center gap-[6px] opacity-90">
                    <span
                      v-for="(camp, idx) in graphicCampaigns"
                      :key="camp.id"
                      @click.stop="currentSlideIndex = idx"
                      class="w-[8px] h-[8px] rounded-full transition-all duration-300 cursor-pointer"
                      :class="currentSlideIndex === idx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'"
                    ></span>
                  </div>
                </div>
              </div>

              <!-- Top 5 Most Used Graphics Section (Figma Node 5164:6478) -->
              <div class="space-y-[16px]">
                <div class="flex items-center justify-between w-full">
                  <h3 class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] tracking-[-0.48px] text-black">
                    Top 5 Most Used Graphics
                  </h3>
                  <div class="flex items-center gap-[6px]">
                    <button
                      type="button"
                      @click="scrollSection('topGraphics', 'left')"
                      class="w-[28px] h-[28px] rounded-full border border-black/10 hover:border-black flex items-center justify-center text-black transition-colors cursor-pointer"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft :size="16" />
                    </button>
                    <button
                      type="button"
                      @click="scrollSection('topGraphics', 'right')"
                      class="w-[28px] h-[28px] rounded-full border border-black/10 hover:border-black flex items-center justify-center text-black transition-colors cursor-pointer"
                      aria-label="Scroll right"
                    >
                      <ChevronRight :size="16" />
                    </button>
                  </div>
                </div>
                <div ref="topGraphicsRef" class="flex gap-[12px] overflow-x-auto pb-[8px] scrollbar-none w-full">
                  <button
                    v-for="art in topGraphics"
                    :key="art.id"
                    @click="selectedArtwork = selectedArtwork === art.id ? null : art.id"
                    class="w-[138px] h-[184px] shrink-0 bg-[#f5f5f5] hover:bg-[#eaeaea] rounded-[8px] p-[16px] flex flex-col items-center justify-between text-center transition-all cursor-pointer select-none"
                    :class="[
                      selectedArtwork === art.id
                        ? 'border border-black bg-white shadow-2xs'
                        : 'border border-transparent'
                    ]"
                  >
                    <div class="w-[80px] h-[80px] flex items-center justify-center text-[44px] text-black p-2">
                      <img
                        v-if="art.img"
                        :src="art.img"
                        :alt="art.name"
                        class="max-w-[64px] max-h-[64px] object-contain pointer-events-none"
                      />
                      <span v-else>{{ art.symbol }}</span>
                    </div>
                    <div class="flex flex-col gap-[2px] w-full text-center">
                      <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[12px] text-black leading-snug truncate">
                        {{ art.name }}
                      </span>
                      <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[10px] text-neutral-500 leading-none truncate">
                        {{ art.club || 'Juventus FC' }}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Artwork Categories Section (Figma Node 5166:6575) -->
              <div class="space-y-[16px]">
                <div class="flex items-center justify-between w-full">
                  <h3 class="font-['Stanley_Favorit',sans-serif] font-medium text-[16px] tracking-[-0.48px] text-black">
                    Artwork Categories
                  </h3>
                  <div class="flex items-center gap-[6px]">
                    <button
                      type="button"
                      @click="scrollSection('categories', 'left')"
                      class="w-[28px] h-[28px] rounded-full border border-black/10 hover:border-black flex items-center justify-center text-black transition-colors cursor-pointer"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft :size="16" />
                    </button>
                    <button
                      type="button"
                      @click="scrollSection('categories', 'right')"
                      class="w-[28px] h-[28px] rounded-full border border-black/10 hover:border-black flex items-center justify-center text-black transition-colors cursor-pointer"
                      aria-label="Scroll right"
                    >
                      <ChevronRight :size="16" />
                    </button>
                  </div>
                </div>
                <div ref="artworkCategoriesRef" class="flex gap-[12px] overflow-x-auto pb-[8px] scrollbar-none w-full">
                  <div
                    v-for="cat in artworkCategories"
                    :key="cat.name"
                    @click="activeCategory = categoryDetails[cat.name] || null"
                    class="w-[138px] h-[184px] shrink-0 bg-[#f5f5f5] hover:bg-[#eaeaea] rounded-[8px] p-[16px] flex flex-col justify-between transition-all cursor-pointer select-none group"
                  >
                    <div class="w-[80px] h-[80px] mx-auto flex items-center justify-center text-[44px] text-black">
                      {{ cat.symbol }}
                    </div>
                    <div class="flex items-center justify-between w-full">
                      <span class="font-['Stanley_Favorit',sans-serif] font-normal text-[12px] text-black leading-snug">
                        {{ cat.name }}
                      </span>
                      <span class="text-neutral-500 group-hover:text-black transition-colors text-[14px]">›</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
          <!-- End Scrollable Gallery Content Area -->

          <!-- Floating Sticky Apply Button Container (Aligned with toggle's bottom-6 border) -->
          <transition name="slide-up-fade">
            <div
              v-if="selectedArtwork"
              class="absolute bottom-6 left-0 right-0 z-30 px-[28px] sm:px-[40px] transition-all duration-300 transform-gpu pointer-events-none"
              :class="[
                isScrollHidden ? 'translate-y-[150%] opacity-0' : 'translate-y-0 opacity-100'
              ]"
            >
              <button
                type="button"
                @click="applyEdits()"
                class="w-full h-[52px] rounded-[8px] bg-black text-white hover:bg-neutral-800 font-['Stanley_Favorit',sans-serif] font-medium text-[14px] shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-black/10 active:scale-[0.99] btn-shimmer pointer-events-auto"
              >
                <span>Apply</span>
              </button>
            </div>
          </transition>
        </div>
      </transition>
    </Teleport>

    <!-- DISCARD CONFIRMATION MODAL (Figma Node 5172:7586) -->
    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="showDiscardModal"
          class="fixed inset-0 z-[120] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 select-none"
        >
          <div
            class="bg-white rounded-[16px] p-[32px] sm:p-[40px] max-w-[480px] w-full border border-[#d9d9d9] shadow-2xl flex flex-col gap-[32px] animate-fade-in"
          >
            <!-- Confirmation Text Container -->
            <div class="flex flex-col gap-[16px] w-full">
              <h3 class="font-['Stanley_Favorit',sans-serif] font-medium text-[24px] text-black leading-tight">
                Discard your design?
              </h3>
              <p class="font-['Stanley_Favorit',sans-serif] font-normal text-[14px] text-black leading-[20px] mb-0">
                You haven't applied your latest edits. If you close this now, your progress will be lost.
              </p>
            </div>

            <!-- Button Action Container -->
            <div class="flex gap-[12px] w-full">
              <button
                type="button"
                @click="confirmDiscard"
                class="flex-1 border border-black hover:bg-neutral-100 text-black font-['Stanley_Favorit',sans-serif] font-normal text-[16px] py-[12px] px-[24px] rounded-[8px] tracking-[-0.48px] transition-colors cursor-pointer text-center"
              >
                Discard
              </button>
              <button
                type="button"
                @click="showDiscardModal = false"
                class="flex-1 bg-black hover:bg-neutral-800 text-white font-['Stanley_Favorit',sans-serif] font-normal text-[16px] py-[12px] px-[24px] rounded-[8px] tracking-[-0.48px] transition-colors cursor-pointer text-center"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </Teleport>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.995); }
  to { opacity: 1; transform: scale(1); }
}

.slide-drawer-enter-active,
.slide-drawer-leave-active {
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
}
.slide-drawer-enter-from,
.slide-drawer-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-fade-enter-active,
.slide-up-fade-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}
.slide-up-fade-enter-from,
.slide-up-fade-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
