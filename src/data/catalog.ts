import quencherH20Img from '@/assets/products/quencher-h20-blue.png'
import quencherProTourImg from '@/assets/products/quencher-protour-peach.png'
import iceFlowImg from '@/assets/products/iceflow-white.png'
import campMugImg from '@/assets/products/camp-mug-green.png'
import cafeTumblerImg from '@/assets/products/cafe-tumbler-brown.png'
import quencherGreenImg from '@/assets/products/quencher-green.png'

import cardQuestionsImg from '@/assets/images/card-questions.png'
import cardGuidedImg from '@/assets/images/card-guided.png'
import cardArtistDropImg from '@/assets/images/card-artist-drop.png'
import bannerBarbieHeroImg from '@/assets/images/banner-barbie-hero.jpg'

import trending1Img from '@/assets/images/trending-1.jpg'
import trending2Img from '@/assets/images/trending-2.jpg'
import trending3Img from '@/assets/images/trending-3.jpg'
import trending4Img from '@/assets/images/trending-4.jpg'

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
  maxSoloGraphicHeight: 182,
  largeGraphicHeight: 182,
  standardGraphicHeight: 135,
  smallGraphicHeight: 100,
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
  titleLine2?: string
  subtitle?: string
  tag?: string
  image: string
  bgColor?: string
  textColor: 'black' | 'white'
  gradientOverlay?: string
  description: string
  campaignId?: string
}

export const INSPIRATION_CARDS: InspirationCard[] = [
  {
    id: 'autumn-26',
    titleLine1: "Autumn '26 Collection",
    subtitle: 'Limited-edition outdoors and nature graphics.',
    tag: "Autumn '26",
    image: trending1Img,
    bgColor: '#16281a',
    textColor: 'white',
    gradientOverlay: 'linear-gradient(180deg, rgba(16, 36, 21, 0.88) 0%, rgba(16, 36, 21, 0.45) 45%, transparent 80%)',
    description: 'Limited-edition outdoors and nature graphics for the season.',
    campaignId: 'autumn-26',
  },
  {
    id: 'world-cup-vibes',
    titleLine1: 'World Cup Vibes',
    subtitle: 'Rep your favorite team front and center.',
    tag: 'World Cup',
    image: trending2Img,
    bgColor: '#edf1f5',
    textColor: 'black',
    gradientOverlay: 'linear-gradient(180deg, rgba(240, 243, 247, 0.92) 0%, rgba(240, 243, 247, 0.5) 45%, transparent 80%)',
    description: 'Rep your favorite team front and center with laser engraved logos.',
    campaignId: 'world-cup',
  },
  {
    id: 'automotive-lovers',
    titleLine1: 'Automotive Lovers? Join here.',
    subtitle: 'Precision motorsport insignias and race badges.',
    tag: 'Automotive',
    image: trending3Img,
    bgColor: '#3f1f2e',
    textColor: 'white',
    gradientOverlay: 'linear-gradient(180deg, rgba(58, 26, 40, 0.86) 0%, rgba(58, 26, 40, 0.42) 45%, transparent 80%)',
    description: 'Precision motorsport insignias and race badges.',
    campaignId: 'automotive',
  },
  {
    id: 'college-logo',
    titleLine1: 'Find Your Exclusive College Logo',
    subtitle: 'Collegiate pillar crests and campus emblems.',
    tag: 'Collegiate',
    image: trending4Img,
    bgColor: '#540f2c',
    textColor: 'white',
    gradientOverlay: 'linear-gradient(180deg, rgba(82, 12, 42, 0.88) 0%, rgba(82, 12, 42, 0.42) 45%, transparent 80%)',
    description: 'Collegiate pillar crests and campus emblems.',
    campaignId: 'college',
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
      { name: 'Rose Quartz', hex: '#E8C5C8', image: quencherGreenImg },
      { name: 'Eucalyptus Green', hex: '#8FA396', image: quencherGreenImg },
      { name: 'Cream', hex: '#F5F2EB', image: quencherGreenImg },
      { name: 'Matte Charcoal', hex: '#363839', image: quencherGreenImg },
      { name: 'Fog Gray', hex: '#8C9BA5', image: quencherGreenImg },
      { name: 'Pool Cyan', hex: '#73B2C6', image: quencherGreenImg },
      { name: 'Tigerlily Orange', hex: '#E65D47', image: quencherGreenImg },
      { name: 'Iris Violet', hex: '#616A94', image: quencherGreenImg },
      { name: 'Black', hex: '#1C1C1C', image: quencherGreenImg },
      { name: 'Ash Gray', hex: '#B5B7B5', image: quencherGreenImg },
      { name: 'Peony Pink', hex: '#F4A6BA', image: quencherGreenImg },
      { name: 'Wisteria Lavender', hex: '#C3B1E1', image: quencherGreenImg }
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
      { name: 'Rose Quartz', hex: '#E8C5C8', image: quencherProTourImg },
      { name: 'Eucalyptus', hex: '#8FA396', image: quencherProTourImg },
      { name: 'Cream', hex: '#F5F2EB', image: quencherProTourImg },
      { name: 'Midnight Matte', hex: '#1E2735', image: quencherProTourImg },
      { name: 'Mint Jade', hex: '#597D71', image: quencherProTourImg },
      { name: 'Soft Lavender', hex: '#C3B1E1', image: quencherProTourImg }
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
    defaultImage: iceFlowImg,
    gradientFrom: '#d7c8c4',
    gradientTo: '#ffecec',
    sizes: ['30 oz', '20 oz'],
    colors: [
      { name: 'Polar White', hex: '#EDF2F4', image: iceFlowImg },
      { name: 'Rose Quartz', hex: '#E8C5C8', image: iceFlowImg },
      { name: 'Charcoal Black', hex: '#1C1C1C', image: iceFlowImg },
      { name: 'Sky Cyan', hex: '#73B2C6', image: iceFlowImg },
      { name: 'Eucalyptus', hex: '#8FA396', image: iceFlowImg },
      { name: 'Pomelo Coral', hex: '#F4856E', image: iceFlowImg }
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
    defaultImage: quencherH20Img,
    gradientFrom: '#496076',
    gradientTo: '#d6e1ea',
    sizes: ['30 oz'],
    colors: [
      { name: 'Rose Quartz', hex: '#E8C5C8', image: quencherH20Img },
      { name: 'Cream', hex: '#F5F2EB', image: quencherH20Img },
      { name: 'Fog Gray', hex: '#8C9BA5', image: quencherH20Img },
      { name: 'Matte Charcoal', hex: '#363839', image: quencherH20Img },
      { name: 'Eucalyptus', hex: '#8FA396', image: quencherH20Img },
      { name: 'Pool Cyan', hex: '#73B2C6', image: quencherH20Img }
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
      { name: 'Matte Black', hex: '#1A1A1A', image: campMugImg },
      { name: 'Polar White', hex: '#EDF2F4', image: campMugImg },
      { name: 'Nightfall Navy', hex: '#1E2735', image: campMugImg },
      { name: 'Wine Plum', hex: '#542D3F', image: campMugImg }
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
      { name: 'Obsidian Black', hex: '#181818', image: cafeTumblerImg },
      { name: 'Cream', hex: '#F5F2EB', image: cafeTumblerImg }
    ]
  }
]
