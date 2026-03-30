'use client'

import { MARKET_INSIGHTS } from '@/lib/mockData'
import { TrendingUp, TrendingDown, BarChart3, Activity, PieChart, Info, ArrowUpRight } from 'lucide-react'
import { formatUsd } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function AnalyticsPage() {
  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="font-display text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Market Analytics</h1>
        <p className="text-base" style={{ color: 'var(--text-muted)' }}>
          Real-time insights and price indexing for the global antiquities market.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Global Market Cap', val: '$1.42B', sub: '+2.4% this month' },
          { label: 'Platform Volume (24h)', val: '$842k', sub: '124 active trades' },
          { label: 'Smart Contract Escrows', val: '$12.4M', sub: 'Fully locked & secured' },
          { label: 'AI Authentications', val: '8,492', sub: 'Zero confirmed forgeries' },
        ].map(stat => (
          <div key={stat.label} className="card p-5">
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            <p className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{stat.val}</p>
            <p className="text-xs text-green-500 font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-bold flex items-center gap-2 mb-1" style={{ color: 'var(--text-primary)' }}>
                <Activity className="w-5 h-5 text-amber-500" /> Category Performance Index
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Returns over the last 12 months by category</p>
            </div>
            <button className="btn-ghost py-1 px-3 text-xs">Export CSV</button>
          </div>
          
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MARKET_INSIGHTS}>
                <XAxis dataKey="category" stroke="var(--border)" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip 
                  cursor={{ fill: 'var(--bg-secondary)' }}
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '8px' }}
                />
                <Bar dataKey="priceChange" radius={[4, 4, 0, 0]}>
                  {MARKET_INSIGHTS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.priceChange > 0 ? '#16a34a' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Movers list */}
        <div className="card p-6 flex flex-col">
          <h2 className="font-bold flex items-center gap-2 mb-6" style={{ color: 'var(--text-primary)' }}>
             <TrendingUp className="w-5 h-5 text-amber-500" /> Top Movers
          </h2>
          
          <div className="space-y-4 flex-1">
            {MARKET_INSIGHTS.sort((a,b) => b.priceChange - a.priceChange).map((item, i) => (
              <div key={item.category} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.category}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg: {formatUsd(item.avgPrice)}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${item.priceChange > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {item.priceChange > 0 ? '+' : ''}{item.priceChange}%
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 btn-ghost flex justify-center text-sm py-2">
            View All Categories <ArrowUpRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}
