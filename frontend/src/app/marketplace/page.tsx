'use client'

import { useState } from 'react'
import { MOCK_LISTINGS, CATEGORIES } from '@/lib/mockData'
import AntiquCard from '@/components/marketplace/AntiquCard'
import { Filter, ChevronDown, Check } from 'lucide-react'

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeSort, setActiveSort] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  // Filter listings based on category
  const filteredListings = activeCategory
    ? MOCK_LISTINGS.filter(l => l.category.slug === activeCategory)
    : MOCK_LISTINGS

  const sorts = [
    { id: 'newest', label: 'Newest Arrivals' },
    { id: 'price-asc', label: 'Price: Low to High' },
    { id: 'price-desc', label: 'Price: High to Low' },
    { id: 'ending-soon', label: 'Ending Soon' },
  ]

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Artifacts & Antiques
          </h1>
          <p className="text-base max-w-xl" style={{ color: 'var(--text-muted)' }}>
            Browse our authenticated collection of rare historical pieces. Every item includes on-chain provenance.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden btn-ghost flex-1 justify-center"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          {/* Sort dropdown */}
          <div className="relative group flex-1 md:flex-none">
            <button className="w-full btn-ghost justify-between md:justify-start" style={{ background: 'var(--surface)' }}>
              {sorts.find(s => s.id === activeSort)?.label}
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-xl p-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              {sorts.map(sort => (
                <button
                  key={sort.id}
                  onClick={() => setActiveSort(sort.id)}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between hover:bg-amber-500/10 hover:text-amber-500 transition-colors"
                  style={{ color: activeSort === sort.id ? 'var(--gold)' : 'var(--text-secondary)' }}
                >
                  {sort.label}
                  {activeSort === sort.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className={`w-full md:w-64 flex-shrink-0 space-y-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Category</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!activeCategory ? 'bg-amber-500/10 text-amber-500 font-medium' : 'hover:bg-amber-500/5 hover:text-amber-500'}`}
                  style={{ color: !activeCategory ? undefined : 'var(--text-secondary)' }}
                >
                  All Categories
                </button>
              </li>
              {CATEGORIES.slice(0, 8).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => setActiveCategory(cat.slug)}
                    className={`w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === cat.slug ? 'bg-amber-500/10 text-amber-500 font-medium' : 'hover:bg-amber-500/5 hover:text-amber-500'}`}
                    style={{ color: activeCategory === cat.slug ? undefined : 'var(--text-secondary)' }}
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{cat.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Era */}
          <div className="pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Era</h3>
            <div className="space-y-3">
              {['Ancient (Pre-500 AD)', 'Medieval (500-1500)', 'Renaissance (1500-1700)', '18th Century', '19th Century', '20th Century'].map(era => (
                <label key={era} className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors group-hover:border-amber-500" style={{ borderColor: 'var(--border)' }}>
                  </div>
                  <span className="text-sm transition-colors group-hover:text-amber-500" style={{ color: 'var(--text-secondary)' }}>{era}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Buy Format */}
          <div className="pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Purchase Type</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="hidden" />
                <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors group-hover:border-amber-500" style={{ borderColor: 'var(--border)' }}></div>
                <span className="text-sm transition-colors group-hover:text-amber-500" style={{ color: 'var(--text-secondary)' }}>Live Auction</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="hidden" />
                <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors group-hover:border-amber-500" style={{ borderColor: 'var(--border)' }}></div>
                <span className="text-sm transition-colors group-hover:text-amber-500" style={{ color: 'var(--text-secondary)' }}>Buy Now</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="hidden" />
                <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors group-hover:border-amber-500" style={{ borderColor: 'var(--border)' }}></div>
                <span className="text-sm transition-colors group-hover:text-amber-500" style={{ color: 'var(--text-secondary)' }}>Make Offer</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(listing => (
              <AntiquCard key={listing.id} listing={listing} />
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No artifacts found</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters to find what you&apos;re looking for.</p>
              <button
                onClick={() => setActiveCategory(null)}
                className="mt-6 btn-ghost"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
