'use client'

import Link from 'next/link'
import { ArrowRight, ShieldCheck, Zap, TrendingUp, Play } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-hero-gradient" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Radial gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10">
        <div className="w-full h-full rounded-full"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
      </div>

      {/* Floating antique images */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=280&h=320&fit=crop', top: '15%', right: '6%', rotate: '8deg', delay: '0s' },
          { url: 'https://images.unsplash.com/photo-1611324745866-d1fb46c21e23?w=220&h=260&fit=crop', top: '55%', right: '14%', rotate: '-6deg', delay: '1.5s' },
          { url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200&h=240&fit=crop', top: '20%', right: '28%', rotate: '4deg', delay: '0.8s' },
        ].map((img, i) => (
          <div key={i}
            className="absolute rounded-2xl overflow-hidden border shadow-2xl animate-float"
            style={{
              top: img.top, right: img.right,
              transform: `rotate(${img.rotate})`,
              animationDelay: img.delay,
              borderColor: 'rgba(245,158,11,0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              width: parseInt(img.url.match(/w=(\d+)/)?.[1] ?? '200') / 2,
            }}>
            <img src={img.url} alt="" className="w-full h-full object-cover opacity-60" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-2xl animate-slide-up">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.3)' }}>
            <span className="live-dot" />
            <span className="text-sm font-semibold text-amber-400">Live auctions happening now</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-6xl lg:text-7xl font-bold leading-none text-white mb-6">
            The Future of
            <span className="block text-gold-gradient">Rare Antiques</span>
          </h1>

          <p className="text-lg text-white/60 leading-relaxed mb-10 max-w-lg">
            Buy, sell and invest in rare historical artifacts with blockchain-verified provenance,
            AI authentication, and secure crypto payments. Every piece, a piece of history.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-12">
            <Link href="/marketplace" className="btn-gold text-base px-8 py-3.5">
              Explore Marketplace <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/create" className="flex items-center gap-2 text-white/70 text-base font-semibold hover:text-white transition-colors px-4 py-3.5">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/20 bg-white/10">
                <Play className="w-4 h-4 fill-current" />
              </div>
              List Your Antique
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Verified Artifacts', value: '24,800+' },
              { label: 'Active Auctions', value: '1,240' },
              { label: 'Total Volume', value: '$48M+' },
            ].map(stat => (
              <div key={stat.label}>
                <p className="font-display text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/50 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32"
        style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }} />
    </section>
  )
}
