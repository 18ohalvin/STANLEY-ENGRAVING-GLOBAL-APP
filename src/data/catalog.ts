import quencherH20Img from '@/assets/products/quencher-h20-blue.png'
import quencherProTourImg from '@/assets/products/quencher-protour-peach.png'
import iceFlowImg from '@/assets/products/iceflow-white.png'
import campMugImg from '@/assets/products/camp-mug-green.png'
import cafeTumblerImg from '@/assets/products/cafe-tumbler-brown.png'
import quencherGreenImg from '@/assets/products/quencher-green.png'

import cardQuestionsImg from '@/assets/images/card-questions.png'
import cardGuidedImg from '@/assets/images/card-guided.png'
import cardArtistDropImg from '@/assets/images/card-artist-drop.png'

export interface ProductColor {
  name: string
  hex: string
  image?: string
}

export interface EngravingCharLimits {
  S: number
  M: number
  L: number
  XL: number
}

export interface EngravingProfile {
  zoneWidth: number
  zoneHeight: number
  maxSoloGraphicHeight: number
  largeGraphicHeight: number
  standardGraphicHeight: number
  smallGraphicHeight: number
  charLimits: {
    solo: EngravingCharLimits
    withLargeGraphic: EngravingCharLimits
    withStandardGraphic: EngravingCharLimits
    withSmallGraphic: EngravingCharLimits
  }
}

export const DEFAULT_ENGRAVING_PROFILE: EngravingProfile = {
  zoneWidth: 191,
  zoneHeight: 280,
  maxSoloGraphicHeight: 150,
  largeGraphicHeight: 150,
  standardGraphicHeight: 100,
  smallGraphicHeight: 70,
  charLimits: {
    solo: { S: 100, M: 80, L: 60, XL: 40 },
    withLargeGraphic: { S: 60, M: 45, L: 30, XL: 20 },
    withStandardGraphic: { S: 80, M: 60, L: 45, XL: 30 },
    withSmallGraphic: { S: 90, M: 70, L: 55, XL: 35 },
  }
}

export const getEngravingProfile = (product?: Product): EngravingProfile => {
  return product?.engravingProfile || DEFAULT_ENGRAVING_PROFILE
}

export interface Product {
  id: string
  handle: string
  name: string
  description: string
  priceFormatted: string
  priceAmount: number
  currency: string
  defaultImage: string
  gradientFrom: string
  gradientTo: string
  colors: ProductColor[]
  badge?: string
  sizes?: string[]
  engravingProfile?: EngravingProfile
}

export interface InspirationCard {
  id: string
  titleLine1: string
  titleLine2: string
  tag: string
  image: string
  bgColor?: string
  textColor: 'black' | 'white'
  description: string
}

export const INSPIRATION_CARDS: InspirationCard[] = [
  {
    id: 'faq',
    titleLine1: 'What People',
    titleLine2: 'Are Asking',
    tag: 'FAQ & Care',
    image: cardQuestionsImg,
    bgColor: '#e7e7d5',
    textColor: 'black',
    description: 'Learn how our precision laser engraving works, warranty coverage, and tumbler care instructions.',
  },
  {
    id: 'guided-ai',
    titleLine1: 'Guided to Generate',
    titleLine2: 'Your Design',
    tag: 'AI Studio',
    image: cardGuidedImg,
    bgColor: '#242a30',
    textColor: 'white',
    description: 'Explore custom vector prompts and smart layout suggestions for a truly unique engraved piece.',
  },
  {
    id: 'artist-drops',
    titleLine1: 'Get Inspired by Artist',
    titleLine2: 'Designs Drop',
    tag: 'Limited Drops',
    image: cardArtistDropImg,
    bgColor: '#f6eafa',
    textColor: 'black',
    description: 'Browse curated collaborations including the exclusive Stanley x Liunic on Things collection.',
  },
  {
    id: 'artist-showcase-2',
    titleLine1: 'Exclusive Studio',
    titleLine2: 'Monogram Sets',
    tag: 'Typography',
    image: cardArtistDropImg,
    bgColor: '#eef2f6',
    textColor: 'black',
    description: 'Choose from architectural monograms, minimal initials, and precision coordinates.',
  },
]

export const PRODUCTS: Product[] = [
  {
    id: 'quencher-h20-40oz',
    handle: 'the-quencher-h20-flowstate-tumbler-40oz',
    name: 'The Quencher H2.0 Flowstate™ Tumbler 40 oz',
    description: 'Official colorways & high-definition renders pulled directly from stanley1913.com',
    priceFormatted: 'IDR 800.000',
    priceAmount: 800000,
    currency: 'IDR',
    defaultImage: quencherGreenImg,
    gradientFrom: '#344d62',
    gradientTo: '#cbd6e2',
    sizes: ['40 oz', '30 oz'],
    colors: [
      { name: 'Hammertone Green', hex: '#637554', image: quencherGreenImg },
      { name: 'Rose Quartz', hex: '#E8C5C8', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Rose-Quartz-Hero_1000x.jpg' },
      { name: 'Eucalyptus Green', hex: '#8FA396', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-FlowState-Eucalyptus-Hero_1000x.jpg' },
      { name: 'Cream', hex: '#F5F2EB', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-FlowState-Cream-Hero_1000x.jpg' },
      { name: 'Matte Charcoal', hex: '#363839', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Charcoal-Hero_1000x.jpg' },
      { name: 'Fog Gray', hex: '#8C9BA5', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Fog-Hero_1000x.jpg' },
      { name: 'Pool Cyan', hex: '#73B2C6', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Pool-Hero_1000x.jpg' },
      { name: 'Tigerlily Orange', hex: '#E65D47', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Tigerlily-Hero_1000x.jpg' },
      { name: 'Iris Violet', hex: '#616A94', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Iris-Hero_1000x.jpg' },
      { name: 'Black', hex: '#1C1C1C', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Black-Hero_1000x.jpg' },
      { name: 'Ash Gray', hex: '#B5B7B5', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Ash-Hero_1000x.jpg' },
      { name: 'Peony Pink', hex: '#F4A6BA', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Peony-Hero_1000x.jpg' },
      { name: 'Wisteria Lavender', hex: '#C3B1E1', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Wisteria-Hero_1000x.jpg' }
    ]
  },
  {
    id: 'quencher-protour',
    handle: 'the-quencher-protour-flip-straw-tumbler',
    name: 'The Quencher ProTour Flip Straw Tumbler 40 oz',
    description: 'Official colorways & high-definition renders pulled directly from stanley1913.com',
    priceFormatted: 'IDR 800.000',
    priceAmount: 800000,
    currency: 'IDR',
    defaultImage: quencherProTourImg,
    gradientFrom: '#ffcaa2',
    gradientTo: '#faf1ea',
    sizes: ['40 oz'],
    colors: [
      { name: 'Peach Glaze', hex: '#F4856E', image: quencherProTourImg },
      { name: 'Rose Quartz', hex: '#E8C5C8', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Rose-Quartz-Hero_1000x.jpg' },
      { name: 'Eucalyptus', hex: '#8FA396', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-FlowState-Eucalyptus-Hero_1000x.jpg' },
      { name: 'Cream', hex: '#F5F2EB', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-FlowState-Cream-Hero_1000x.jpg' },
      { name: 'Midnight Matte', hex: '#1E2735', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Charcoal-Hero_1000x.jpg' },
      { name: 'Mint Jade', hex: '#597D71', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Pool-Hero_1000x.jpg' },
      { name: 'Soft Lavender', hex: '#C3B1E1', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Wisteria-Hero_1000x.jpg' }
    ]
  },
  {
    id: 'iceflow-flip-straw',
    handle: 'the-iceflow-flip-straw-tumbler',
    name: 'The IceFlow™ Flip Straw Tumbler 30 oz',
    description: 'Official colorways & high-definition renders pulled directly from stanley1913.com',
    priceFormatted: 'IDR 800.000',
    priceAmount: 800000,
    currency: 'IDR',
    defaultImage: 'https://www.stanley1913.com/cdn/shop/files/30oz-IceFlow-Flip-Straw-Rose-Quartz-Hero_1000x.jpg',
    gradientFrom: '#d7c8c4',
    gradientTo: '#ffecec',
    sizes: ['30 oz', '20 oz'],
    colors: [
      { name: 'Polar White', hex: '#EDF2F4', image: iceFlowImg },
      { name: 'Rose Quartz', hex: '#E8C5C8', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Rose-Quartz-Hero_1000x.jpg' },
      { name: 'Charcoal Black', hex: '#1C1C1C', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Black-Hero_1000x.jpg' },
      { name: 'Sky Cyan', hex: '#73B2C6', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Pool-Hero_1000x.jpg' },
      { name: 'Eucalyptus', hex: '#8FA396', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-FlowState-Eucalyptus-Hero_1000x.jpg' },
      { name: 'Pomelo Coral', hex: '#F4856E', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Tigerlily-Hero_1000x.jpg' }
    ]
  },
  {
    id: 'quencher-h20-30oz',
    handle: 'the-quencher-h20-flowstate-tumbler-30oz',
    name: 'The Quencher H2.0 Flowstate™ Tumbler 30 oz',
    description: 'Official colorways & high-definition renders pulled directly from stanley1913.com',
    priceFormatted: 'IDR 750.000',
    priceAmount: 750000,
    currency: 'IDR',
    defaultImage: 'https://www.stanley1913.com/cdn/shop/files/30oz-Flowstate-Rose-Quartz-Hero_1000x.jpg',
    gradientFrom: '#496076',
    gradientTo: '#d6e1ea',
    sizes: ['30 oz'],
    colors: [
      { name: 'Rose Quartz', hex: '#E8C5C8', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Rose-Quartz-Hero_1000x.jpg' },
      { name: 'Cream', hex: '#F5F2EB', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-FlowState-Cream-Hero_1000x.jpg' },
      { name: 'Fog Gray', hex: '#8C9BA5', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Fog-Hero_1000x.jpg' },
      { name: 'Matte Charcoal', hex: '#363839', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Charcoal-Hero_1000x.jpg' },
      { name: 'Eucalyptus', hex: '#8FA396', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-FlowState-Eucalyptus-Hero_1000x.jpg' },
      { name: 'Pool Cyan', hex: '#73B2C6', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Pool-Hero_1000x.jpg' }
    ]
  },
  {
    id: 'classic-camp-mug',
    handle: 'classic-legendary-camp-mug',
    name: 'Classic Legendary Camp Mug 12 oz',
    description: 'Official colorways & high-definition renders pulled directly from stanley1913.com',
    priceFormatted: 'IDR 350.000',
    priceAmount: 350000,
    currency: 'IDR',
    defaultImage: campMugImg,
    gradientFrom: '#414f41',
    gradientTo: '#a0b9a0',
    sizes: ['12 oz'],
    colors: [
      { name: 'Hammertone Green', hex: '#3E5844', image: campMugImg },
      { name: 'Matte Black', hex: '#1A1A1A', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Black-Hero_1000x.jpg' },
      { name: 'Polar White', hex: '#EDF2F4', image: iceFlowImg },
      { name: 'Nightfall Navy', hex: '#1E2735', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Charcoal-Hero_1000x.jpg' },
      { name: 'Wine Plum', hex: '#542D3F', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Iris-Hero_1000x.jpg' }
    ]
  },
  {
    id: 'cafe-travel-mug',
    handle: 'the-cafe-to-go-travel-mug',
    name: 'The Transit Travel Mug 16 oz',
    description: 'Official colorways & high-definition renders pulled directly from stanley1913.com',
    priceFormatted: 'IDR 450.000',
    priceAmount: 450000,
    currency: 'IDR',
    defaultImage: cafeTumblerImg,
    gradientFrom: '#784c3f',
    gradientTo: '#efb9a0',
    sizes: ['16 oz'],
    colors: [
      { name: 'Warm Terracotta', hex: '#794c3a', image: cafeTumblerImg },
      { name: 'Obsidian Black', hex: '#181818', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-Flowstate-Black-Hero_1000x.jpg' },
      { name: 'Cream', hex: '#F5F2EB', image: 'https://www.stanley1913.com/cdn/shop/files/40oz-FlowState-Cream-Hero_1000x.jpg' }
    ]
  }
]
