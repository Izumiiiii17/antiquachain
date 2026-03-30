import Link from 'next/link'
import { CATEGORIES } from '@/lib/mockData'

export default function CategoriesGrid() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-amber-500 mb-2 tracking-widest uppercase">Browse by Era & Type</p>
          <h2 className="font-display text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Explore Categories
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {CATEGORIES.map(cat => (
            <Link key={cat.id} href={`/marketplace?category=${cat.slug}`}
              className="card p-4 flex flex-col items-center text-center gap-2 hover:shadow-gold cursor-pointer transition-all duration-200">
              <span className="text-3xl">{cat.icon}</span>
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{cat.count} items</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
