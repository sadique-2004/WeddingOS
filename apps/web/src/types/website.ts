export type WeddingThemeKey = 'CLASSIC_INDIAN' | 'MINIMAL_ELEGANT' | 'MODERN_CELEBRATION'

export interface PublicWebsiteConfig {
  slug: string
  themeKey: WeddingThemeKey
  brideName: string
  groomName: string
  weddingDate: string
  locationName: string
  welcomeHeadline: string
  welcomeMessage: string
  isPublished: boolean
  showSchedule: boolean
  showDressCode: boolean
  showVenues: boolean
  showLivestream: boolean
  livestreamUrl?: string
  coverPhoto?: string
}
