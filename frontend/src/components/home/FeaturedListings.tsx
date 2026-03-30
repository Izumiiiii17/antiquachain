import Link from 'next/link'
import AntiquCard from '@/components/marketplace/AntiquCard'
import { MOCK_LISTINGS } from '@/lib/mockData'
import { ArrowRight } from 'lucide-react'

export default function FeaturedListings() {
  const featured = MOCK_LISTINGS.slice(0, 3)

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-semibold text-amber-500 mb-2 tracking-widest uppercase">Curated Selection</p>
            <h2 className="font-display text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Featured Artifacts
            </h2>
            <p className="mt-2 text-base max-w-md" style={{ color: 'var(--text-muted)' }}>
              Handpicked treasures verified by our blockchain authentication system.
            </p>
          </div>
          <Link href="/marketplace" className="hidden sm:flex items-center gap-2 text-amber-500 font-semibold hover:gap-3 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(listing => (
            <AntiquCard key={listing.id} listing={listing} />
          ))}
        </div>

        <div className="flex justify-center mt-10 sm:hidden">
          <Link href="/marketplace" className="btn-ghost">
            View all artifacts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
