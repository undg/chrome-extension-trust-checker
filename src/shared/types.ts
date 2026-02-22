export interface TrustpilotRating {
  domain: string
  rating: number
  reviewCount: number
  trustScore?: string
  url: string
  fetchedAt: number
}

export interface RatingAPI {
  fetchRating(domain: string): Promise<TrustpilotRating | null>
}
