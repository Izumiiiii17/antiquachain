import Link from 'next/link'
import { MOCK_SELLERS } from '@/lib/mockData'
import { ShieldCheck, Star, ArrowRight } from 'lucide-react'

export default function TopSellers() {
  return (
    <section className="py-20 px-6" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-semibold text-amber-500 mb-2 tracking-widest uppercase">Trusted Experts</p>
            <h2 className="font-display text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>Top Sellers</h2>
          </div>
          <Link href="/sellers" className="hidden sm:flex items-center gap-2 text-amber-500 font-semibold hover:gap-3 transition-all">
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_SELLERS.map((seller, i) => (
            <div key={seller.id} className="card p-6 flex flex-col items-center text-center">
              {/* Rank badge */}
              <div className="relative mb-4">
                <img src={seller.avatar} alt={seller.name}
                  className="w-20 h-20 rounded-full object-cover border-2"
                  style={{ borderColor: 'var(--gold-border)' }}
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                  #{i + 1}
                </div>
              </div>

              <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{seller.name}</h3>

              <div className="flex items-center gap-1 mt-1 mb-3">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{seller.rating}</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>({seller.reviewCount} reviews)</span>
              </div>

              {seller.verified && (
                <span className="badge badge-verified mb-4">
                  <ShieldCheck className="w-3 h-3" /> Verified Expert
                </span>
              )}

              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                Member since {new Date(seller.joinedAt).getFullYear()}
              </p>

              <Link href={`/sellers/${seller.id}`} className="btn-ghost w-full justify-center text-sm">
                View Profile
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
