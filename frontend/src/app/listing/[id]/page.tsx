'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'
import { toast } from 'react-hot-toast'
import { MOCK_LISTINGS, MOCK_SELLERS } from '@/lib/mockData'
import { formatCurrency, formatUsd, timeUntil, conditionLabel, truncateAddress, formatTimeAgo } from '@/lib/utils'
import { ShieldCheck, Heart, Share2, AlertTriangle, MessageSquare, Clock, ArrowRight, Eye, ChevronRight, CheckCircle2 } from 'lucide-react'

// Mock fetching the listing by ID
function getListing(id: string) {
  return MOCK_LISTINGS.find(l => l.id === id) || MOCK_LISTINGS[0]
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = getListing(params.id)
  const isAuction = listing.type === 'auction'
  const primaryImage = listing.images.find(i => i.isPrimary) || listing.images[0]
  const [activeImage, setActiveImage] = useState(primaryImage.url)
  const [wished, setWished] = useState(false)
  const [currentLiveBid, setCurrentLiveBid] = useState(listing.currentBid ?? listing.price)
  const [liveBidCount, setLiveBidCount] = useState(listing.bidCount ?? 0)
  const [bidAmount, setBidAmount] = useState(currentLiveBid + 0.1)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    if (!isAuction) return;
    
    // Connect to the backend
    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join-auction', listing.id);
    });

    newSocket.on('auction-state', (data) => {
      if (data.currentBid) {
        setCurrentLiveBid(data.currentBid);
        setBidAmount(data.currentBid + 0.1);
      }
      setLiveBidCount(data.bidCount);
    });

    newSocket.on('new-bid', (data) => {
      setCurrentLiveBid(data.amount);
      setLiveBidCount(data.bidCount);
      setBidAmount(data.amount + 0.1);
      toast.success(`New bid placed: ${data.amount} ETH`, { style: { background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--gold-border)' }});
    });

    newSocket.on('bid-error', (data) => {
      toast.error(data.message, { style: { background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid red' }});
    });

    return () => {
      newSocket.disconnect();
    };
  }, [listing.id, isAuction]);

  const handlePlaceBid = () => {
    if (!socket) return;
    if (bidAmount <= currentLiveBid) {
      toast.error('Bid must be higher than current bid.');
      return;
    }
    
    socket.emit('place-bid', {
      listingId: listing.id,
      amount: bidAmount.toString(),
      bidderId: 'u1'
    });
  }

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/marketplace" className="hover:text-amber-500 transition-colors">Marketplace</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/marketplace?category=${listing.category.slug}`} className="hover:text-amber-500 transition-colors">{listing.category.name}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span style={{ color: 'var(--text-primary)' }}>{listing.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Gallery */}
        <div className="space-y-4 sticky top-24">
          <div className="relative aspect-square rounded-2xl overflow-hidden border bg-gray-100 dark:bg-charcoal-900" style={{ borderColor: 'var(--border)' }}>
            <img src={activeImage} alt={listing.title} className="w-full h-full object-contain" />
            
            {/* Top badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {listing.isVerified && (
                <span className="badge badge-verified backdrop-blur-md bg-opacity-80">
                  <ShieldCheck className="w-4 h-4" /> AI Authenticated
                </span>
              )}
              <span className="badge backdrop-blur-md bg-black/40 text-white border-white/20">
                Id: {listing.artifactId}
              </span>
            </div>

            {/* Actions */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button 
                onClick={() => setWished(!wished)}
                className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${wished ? 'bg-red-500 text-white border-red-500' : 'bg-black/40 text-white border-white/20 hover:bg-black/60'}`}
              >
                <Heart className={`w-4 h-4 ${wished ? 'fill-current' : ''}`} />
              </button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md bg-black/40 text-white border-white/20 hover:bg-black/60 transition-all">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          {listing.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {listing.images.map(img => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.url)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === img.url ? 'border-amber-500 shadow-gold' : 'border-transparent hover:border-amber-500/50'}`}
                >
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Verification Card Mobile (Hidden on desktop) */}
          <div className="lg:hidden card p-5 mt-6">
            <h3 className="font-semibold flex items-center gap-2 mb-3" style={{ color: 'var(--text-primary)' }}>
              <ShieldCheck className="w-5 h-5 text-amber-500" /> Authenticity Report
            </h3>
            <div className="flex items-center justify-between p-3 rounded-lg mb-3" style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border)' }}>
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">AI Confidence Score</span>
              <span className="font-display font-bold text-lg text-amber-600 dark:text-amber-400">{listing.authenticityScore}%</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              This artifact has been verified by our proprietary AI model analyzing historical style, material degradation, and forgery markers against 1.2M known antiquities.
            </p>
          </div>
        </div>

        {/* Details & Purchase block */}
        <div className="flex flex-col gap-8">
          
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                {listing.category.name}
              </span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>•</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Era: {listing.era}
              </span>
            </div>
            
            <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight mb-4" style={{ color: 'var(--text-primary)' }}>
              {listing.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{listing.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{listing.watchlistCount} watching</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Condition: {conditionLabel(listing.condition)}</span>
              </div>
            </div>
          </div>

          {/* Pricing Model */}
          <div className="card p-6 md:p-8">
            {isAuction ? (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <p className="text-sm font-semibold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <span className="live-dot" /> Live Auction
                    </p>
                    <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Current Bid</p>
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(currentLiveBid, listing.currency)}
                      </span>
                      <span className="text-lg" style={{ color: 'var(--text-muted)' }}>{formatUsd(listing.priceUsd * (currentLiveBid / listing.price))}</span>
                    </div>
                  </div>
                  
                  {listing.auctionEndsAt && (
                    <div className="md:text-right border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-sm mb-1 flex items-center md:justify-end gap-1.5" style={{ color: 'var(--text-muted)' }}>
                        <Clock className="w-4 h-4" /> Ends in
                      </p>
                      <p className="font-mono text-2xl font-bold text-amber-500 tracking-tight">
                        {String(timeUntil(listing.auctionEndsAt).hours).padStart(2, '0')}:
                        {String(timeUntil(listing.auctionEndsAt).minutes).padStart(2, '0')}:
                        {String(timeUntil(listing.auctionEndsAt).seconds).padStart(2, '0')}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{liveBidCount} bids placed</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg" style={{ color: 'var(--text-muted)' }}>Ξ</span>
                    <input 
                      type="number" 
                      step="0.05"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="w-full input pl-10 h-12 text-lg font-bold" 
                    />
                  </div>
                  <button onClick={handlePlaceBid} className="btn-gold flex-1 justify-center text-lg h-12 shadow-gold">
                    Place Bid
                  </button>
                </div>
                
                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                  Minimum bid: {formatCurrency(currentLiveBid + 0.1, listing.currency)} • Gas fees apply
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Buy Now Price</p>
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(listing.price, listing.currency)}
                    </span>
                    <span className="text-lg" style={{ color: 'var(--text-muted)' }}>{formatUsd(listing.priceUsd)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="btn-gold flex-1 justify-center h-12 text-lg shadow-gold">
                    Buy Now
                  </button>
                  <button className="btn-ghost flex-1 justify-center h-12 text-lg">
                    Make Offer
                  </button>
                </div>

                <div className="p-4 rounded-xl flex items-start gap-3 bg-blue-500/10 border border-blue-500/20">
                  <ShieldCheck className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">Escrow Protected</p>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80">Funds are held in a secure smart contract and only released when you confirm delivery.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Seller Info */}
          <div className="p-5 rounded-2xl flex items-center justify-between border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-4">
              <img src={listing.seller.avatar} alt={listing.seller.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  {listing.seller.name}
                  {listing.seller.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>★ {listing.seller.rating}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>({listing.seller.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors hover:border-amber-500 hover:text-amber-500" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--surface)' }}>
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-display text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Description</h3>
            <p className="leading-relaxed text-sm" style={{ color: 'var(--text-secondary)' }}>
              {listing.description}
            </p>
          </div>

          {/* Blockchain Provenance */}
          <div className="pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <LinkIcon className="w-5 h-5 text-amber-500" /> On-Chain Provenance
            </h3>
            
            <div className="space-y-6">
              {listing.provenance.map((record, i) => (
                <div key={record.id} className="provenance-line flex items-start gap-4 z-10">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border relative z-10" style={{ background: 'var(--surface)', borderColor: 'var(--gold-border)' }}>
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                  </div>
                  <div className="flex-1 card p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-500">{record.event}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatTimeAgo(record.timestamp)}</span>
                    </div>
                    {record.note && (
                      <p className="text-sm mb-3" style={{ color: 'var(--text-primary)' }}>{record.note}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-xs p-3 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                      <div>
                        <p style={{ color: 'var(--text-muted)' }} className="mb-1">From</p>
                        <p className="font-mono text-amber-600 dark:text-amber-400">{truncateAddress(record.from)}</p>
                      </div>
                      <div>
                        <p style={{ color: 'var(--text-muted)' }} className="mb-1">To</p>
                        <p className="font-mono text-emerald-600 dark:text-emerald-400">{truncateAddress(record.to)}</p>
                      </div>
                      <div className="col-span-2 pt-2 mt-2 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                        <span style={{ color: 'var(--text-muted)' }}>Tx Hash</span>
                        <a href={`https://etherscan.io/tx/${record.txHash}`} target="_blank" rel="noreferrer" className="font-mono text-blue-500 hover:underline">
                          {record.txHash}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full btn-ghost justify-center text-sm">
              View Full History on Etherscan <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Shipping */}
          <div className="pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
             <h3 className="font-display text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Shipping & Logistics</h3>
             <ul className="space-y-3">
               {listing.shipping.map((s, i) => (
                 <li key={i} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {s}
                 </li>
               ))}
             </ul>
          </div>

        </div>
      </div>
    </div>
  )
}

function LinkIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  )
}
