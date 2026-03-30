import { MARKET_INSIGHTS } from '@/lib/mockData'
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { formatUsd } from '@/lib/utils'

export default function MarketInsightsSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-semibold text-amber-500 mb-2 tracking-widest uppercase">Investment Data</p>
            <h2 className="font-display text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Market Insights
            </h2>
            <p className="mt-2 text-base" style={{ color: 'var(--text-muted)' }}>
              Track price trends and discover emerging categories.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Live market data</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MARKET_INSIGHTS.map(insight => {
            const isUp = insight.priceChange > 0
            return (
              <div key={insight.category} className="card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{insight.category}</h3>
                    {insight.trending && (
                      <span className="badge badge-gold mt-1">🔥 Trending</span>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold ${isUp ? 'text-green-500 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
                    {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {isUp ? '+' : ''}{insight.priceChange}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Avg Price</p>
                    <p className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                      {formatUsd(insight.avgPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Monthly Vol.</p>
                    <p className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                      {insight.volume}
                    </p>
                  </div>
                </div>

                {/* Mini price bar */}
                <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(Math.abs(insight.priceChange) * 4, 100)}%`,
                      background: isUp ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'linear-gradient(90deg, #ef4444, #dc2626)'
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
