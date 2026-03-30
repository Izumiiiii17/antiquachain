'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn, formatCurrency, formatUsd, timeUntil, conditionLabel } from '@/lib/utils'
import { ShieldCheck, Eye, Heart, Clock, TrendingUp, Zap, Star } from 'lucide-react'
import type { Listing } from '@/types'

interface AntiquCardProps {
  listing: Listing
  className?: string
}

function AuctionTimer({ endsAt }: { endsAt: string }) {
  const [time, setTime] = useState(() => timeUntil(endsAt))

  // Client-side countdown — runs every second
  if (typeof window !== 'undefined') {
    setInterval(() => setTime(timeUntil(endsAt)), 1000)
  }

  if (time.expired) return <span className="text-red-400 text-xs font-semibold">Ended</span>

  return (
    <span className="text-xs font-mono font-bold text-amber-400">
      {String(time.hours).padStart(2, '0')}:{String(time.minutes).padStart(2, '0')}:{String(time.seconds).padStart(2, '0')}
    </span>
  )
}

export default function AntiquCard({ listing, className }: AntiquCardProps) {
  const [wished, setWished] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const isAuction = listing.type === 'auction'
  const primaryImage = listing.images.find(i => i.isPrimary) ?? listing.images[0]

  return (
    <Link href={`/listing/${listing.id}`} className={cn('block group', className)}>
      <div className="card overflow-hidden">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/3] bg-gray-100 dark:bg-charcoal-800">
          {!imageLoaded && (
            <div className="absolute inset-0 shimmer" />
          )}
          {primaryImage && (
            <img
              src={primaryImage.url}
              alt={primaryImage.alt}
              className={cn(
                'w-full h-full object-cover transition-transform duration-500 group-hover:scale-105',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
            />
          )}

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {listing.isVerified && (
              <span className="badge badge-verified">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            )}
            {isAuction && (
              <span className="badge badge-auction flex items-center gap-1">
                <span className="live-dot" />
                Live Auction
              </span>
            )}
          </div>

          {/* Watchlist heart */}
          <button
            onClick={(e) => { e.preventDefault(); setWished(!wished) }}
            className={cn(
              'absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200',
              wished
                ? 'bg-red-500 border-red-500 text-white scale-110'
                : 'glass text-white/70 hover:text-red-400 hover:border-red-400/50'
            )}
          >
            <Heart className={cn('w-3.5 h-3.5', wished && 'fill-current')} />
          </button>

          {/* Authenticity score */}
          <div className="absolute bottom-3 right-3">
            <div className="glass px-2 py-1 rounded-lg flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span className="text-xs font-bold text-amber-400">{listing.authenticityScore}%</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category + Era */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {listing.category.name}
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{listing.era}</span>
          </div>

          {/* Title */}
          <h3 className="font-display font-semibold text-base leading-snug mb-3 line-clamp-2 group-hover:text-amber-400 transition-colors"
            style={{ color: 'var(--text-primary)' }}>
            {listing.title}
          </h3>

          {/* Seller */}
          <div className="flex items-center gap-2 mb-3">
            <img
              src={listing.seller.avatar}
              alt={listing.seller.name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{listing.seller.name}</span>
            <div className="flex items-center gap-0.5 ml-auto">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{listing.seller.rating}</span>
            </div>
          </div>

          {/* Price + Auction */}
          <div className="flex items-end justify-between">
            <div>
              {isAuction ? (
                <>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Current bid</p>
                  <p className="font-display text-lg font-bold text-amber-500">
                    {formatCurrency(listing.currentBid ?? listing.price, listing.currency)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Buy now</p>
                  <p className="font-display text-lg font-bold text-amber-500">
                    {formatCurrency(listing.price, listing.currency)}
                  </p>
                </>
              )}
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatUsd(listing.priceUsd)}</p>
            </div>

            {isAuction && listing.auctionEndsAt && (
              <div className="text-right">
                <div className="flex items-center gap-1 mb-0.5">
                  <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Ends in</span>
                </div>
                <AuctionTimer endsAt={listing.auctionEndsAt} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{listing.bidCount} bids</p>
              </div>
            )}
          </div>

          {/* Footer stats */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{listing.views.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{listing.watchlistCount}</span>
            </div>
            <span
              className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}
            >
              {conditionLabel(listing.condition)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
