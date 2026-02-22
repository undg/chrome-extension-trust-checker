export type TrustpilotRating = {
  domain: string
  rating: number
  reviewCount: number
  trustScore?: string
  url: string
  fetchedAt: number
}

export type RatingAPI = {
  fetchRating(domain: string): Promise<TrustpilotRating | null>
}
