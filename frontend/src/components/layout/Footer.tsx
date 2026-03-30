import Link from 'next/link'
import { Gem, Twitter, Github, MessageCircle } from 'lucide-react'

export default function Footer() {
  const links = {
    Marketplace: [
      { label: 'Browse All', href: '/marketplace' },
      { label: 'Live Auctions', href: '/auction' },
      { label: 'Trending', href: '/marketplace?sort=trending' },
      { label: 'Verified Only', href: '/marketplace?verified=true' },
    ],
    Platform: [
      { label: 'AI Verification', href: '/verify' },
      { label: 'Investment Analytics', href: '/analytics' },
      { label: 'Blockchain Explorer', href: '/explorer' },
      { label: 'Escrow System', href: '/escrow' },
    ],
    Sellers: [
      { label: 'Create Listing', href: '/create' },
      { label: 'Seller Dashboard', href: '/dashboard?tab=selling' },
      { label: 'Pricing Guide', href: '/guide' },
      { label: 'Authentication', href: '/authenticate' },
    ],
  }

  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
      {/* Newsletter */}
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-display font-bold" style={{ color: 'var(--text-primary)' }}>
              Stay ahead of the market
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Weekly insights on trending antiques and price movements.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="input max-w-xs"
            />
            <button className="btn-gold whitespace-nowrap">Subscribe</button>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
              <Gem className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold">
              <span className="text-gold-gradient">Antiqua</span>
              <span style={{ color: 'var(--text-primary)' }}>Chain</span>
            </span>
          </Link>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
            The world&apos;s premier decentralized marketplace for authenticated antiques and historical artifacts.
          </p>
          <div className="flex gap-3">
            {[Twitter, Github, MessageCircle].map((Icon, i) => (
              <button key={i}
                className="w-9 h-9 flex items-center justify-center rounded-lg border transition-colors hover:border-amber-500/50 hover:text-amber-500"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(links).map(([title, items]) => (
          <div key={title}>
            <h4 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>{title}</h4>
            <ul className="space-y-2.5">
              {items.map(item => (
                <li key={item.href}>
                  <Link href={item.href}
                    className="text-sm transition-colors hover:text-amber-500"
                    style={{ color: 'var(--text-muted)' }}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © 2024 AntiquaChain. All rights reserved.
          </p>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(t => (
              <Link key={t} href="#" className="text-xs hover:text-amber-500 transition-colors" style={{ color: 'var(--text-muted)' }}>{t}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
