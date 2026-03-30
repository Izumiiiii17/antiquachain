import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | undefined, currency: string = 'ETH'): string {
  if (amount === undefined || isNaN(amount)) return 'N/A'
  if (currency === 'ETH') return `Ξ ${amount.toFixed(3)}`
  if (currency === 'USDT') return `$${amount.toLocaleString()}`
  return `${amount} ${currency}`
}

export function formatUsd(amount: number | undefined): string {
  if (amount === undefined || isNaN(amount)) return 'N/A'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

export function truncateAddress(address: string | undefined, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function timeUntil(isoDate: string | undefined): { hours: number; minutes: number; seconds: number; expired: boolean } {
  if (!isoDate) return { hours: 0, minutes: 0, seconds: 0, expired: true }
  const diff = new Date(isoDate).getTime() - Date.now()
  if (diff <= 0 || isNaN(diff)) return { hours: 0, minutes: 0, seconds: 0, expired: true }
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { hours, minutes, seconds, expired: false }
}

export function formatTimeAgo(isoDate: string | undefined): string {
  if (!isoDate) return 'unknown'
  const time = new Date(isoDate).getTime()
  if (isNaN(time)) return 'unknown'
  const diff = Date.now() - time
  const days = Math.floor(diff / 86400000)
  if (days > 30) return `${Math.floor(days / 30)}mo ago`
  if (days > 0) return `${days}d ago`
  const hours = Math.floor(diff / 3600000)
  if (hours > 0) return `${hours}h ago`
  return 'just now'
}

export function scoreColor(score: number): string {
  if (score >= 90) return 'text-green-500'
  if (score >= 75) return 'text-yellow-500'
  return 'text-red-500'
}

export function conditionLabel(condition: string): string {
  const map: Record<string, string> = {
    mint: 'Mint', excellent: 'Excellent', good: 'Good', fair: 'Fair', poor: 'Poor',
  }
  return map[condition] ?? condition
}
