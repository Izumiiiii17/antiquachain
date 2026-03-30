'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MOCK_LISTINGS } from '@/lib/mockData'
import { formatCurrency, formatUsd, timeUntil } from '@/lib/utils'
import { Clock, Flame, ChevronRight } from 'lucide-react'

function Countdown({ endsAt }: { endsAt: string }) {
  const [t, setT] = useState(timeUntil(endsAt))

  useEffect(() => {
    const id = setInterval(() => setT(timeUntil(endsAt)), 1000)
    return () => clearInterval(id)
  }, [endsAt])

  if (t.expired) return <span className="text-red-400 font-bold">Ended</span>

  return (
    <div className="flex items-center gap-1">
      {[t.hours, t.minutes, t.seconds].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="font-mono text-sm font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
            {String(v).padStart(2, '0')}
          </span>
          {i < 2 && <span className="text-amber-500 font-bold">:</span>}
        </span>
      ))}
    </div>
  )
}

export default function TrendingAuctions() {
  const auctions = MOCK_LISTINGS.filter(l => l.type === 'auction')

  return (
    <section className="py-20 px-6" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <p className="text-sm font-semibold text-orange-500 tracking-widest uppercase">Ending Soon</p>
            </div>
            <h2 className="font-display text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Live Auctions
            </h2>
          </div>
          <Link href="/marketplace?type=auction" className="hidden sm:flex items-center gap-2 text-amber-500 font-semibold hover:gap-3 transition-all">
            All auctions <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {auctions.map((listing, idx) => (
            <Link key={listing.id} href={`/listing/${listing.id}`}
              className="block group cursor-pointer">
              <div className="card p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Rank */}
                <span className="hidden sm:flex text-2xl font-display font-bold w-8 flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>

                {/* Image */}
                <div className="relative w-full sm:w-20 h-32 sm:h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={listing.images[0].url}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="live-dot" />
                    <span className="text-xs text-red-400 font-semibold">Live Auction</span>
                    <span className="badge badge-gold text-xs">{listing.category.name}</span>
                  </div>
                  <h3 className="font-semibold text-base line-clamp-1 group-hover:text-amber-400 transition-colors"
                    style={{ color: 'var(--text-primary)' }}>
                    {listing.title}
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {listing.bidCount} bids · {listing.seller.name}
                  </p>
                </div>

                {/* Bid + Countdown */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                  <div className="text-right">
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Current bid</p>
                    <p className="font-display font-bold text-amber-500">
                      {formatCurrency(listing.currentBid ?? listing.price, listing.currency)}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatUsd(listing.priceUsd)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    {listing.auctionEndsAt && <Countdown endsAt={listing.auctionEndsAt} />}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
