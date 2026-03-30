// Type definitions for AntiquaChain

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  walletAddress?: string
  role: 'buyer' | 'seller' | 'admin'
  rating: number
  reviewCount: number
  joinedAt: string
  verified: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  count: number
}

export interface ListingImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
}

export type ListingCondition = 'mint' | 'excellent' | 'good' | 'fair' | 'poor'
export type ListingType = 'fixed' | 'auction' | 'offer'
export type Currency = 'ETH' | 'USDT' | 'BTC'

export interface ProvenanceRecord {
  id: string
  txHash: string
  from: string
  to: string
  timestamp: string
  event: 'minted' | 'transferred' | 'verified' | 'auctioned'
  note?: string
}

export interface Listing {
  id: string
  title: string
  description: string
  category: Category
  era: string
  condition: ListingCondition
  type: ListingType
  price: number
  currency: Currency
  priceUsd: number
  images: ListingImage[]
  seller: User
  sellerRating: number
  isVerified: boolean
  authenticityScore: number
  provenance: ProvenanceRecord[]
  artifactId: string
  auctionEndsAt?: string
  currentBid?: number
  bidCount?: number
  location: string
  shipping: string[]
  tags: string[]
  views: number
  watchlistCount: number
  createdAt: string
}

export interface Bid {
  id: string
  bidder: User
  amount: number
  currency: Currency
  timestamp: string
}

export interface Offer {
  id: string
  buyer: User
  listing: Listing
  amount: number
  currency: Currency
  message?: string
  status: 'pending' | 'accepted' | 'rejected' | 'countered'
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  type: 'text' | 'offer'
  offerAmount?: number
  timestamp: string
}

export interface Order {
  id: string
  listing: Listing
  buyer: User
  seller: User
  amount: number
  currency: Currency
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'disputed' | 'completed'
  escrowId?: string
  txHash?: string
  createdAt: string
}

export interface MarketInsight {
  category: string
  avgPrice: number
  priceChange: number
  volume: number
  trending: boolean
}

export interface AIVerificationResult {
  confidence: number
  authenticityScore: number
  riskLevel: 'low' | 'medium' | 'high'
  details: {
    styleMatch: number
    materialAnalysis: number
    ageEstimate: string
    forgeryRisk: number
    historicalConsistency: number
  }
  recommendation: string
  suggestedPriceRange: { min: number; max: number }
}

export interface WalletState {
  address: string | null
  balance: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
}

export interface FilterState {
  category: string
  era: string
  priceMin: number
  priceMax: number
  condition: string
  currency: string
  verified: boolean
  auctionOnly: boolean
  sortBy: string
}
