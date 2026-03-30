'use client'

import { useState } from 'react'
import { PORTFOLIO_DATA } from '@/lib/mockData'
import { formatUsd } from '@/lib/utils'
import { Wallet, ArrowUpRight, ArrowDownRight, Activity, ArrowRightLeft, Lock } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function WalletPage() {
  const [period, setPeriod] = useState('6M')
  const totalValue = PORTFOLIO_DATA[PORTFOLIO_DATA.length - 1].value
  const previousValue = PORTFOLIO_DATA[0].value
  const growth = ((totalValue - previousValue) / previousValue) * 100

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Wallet & Portfolio</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Track your artifact collection value and crypto balances.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-gold py-2 px-6"><ArrowUpRight className="w-4 h-4 mr-2" /> Deposit</button>
          <button className="btn-ghost py-2 px-6"><ArrowDownRight className="w-4 h-4 mr-2" /> Withdraw</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Balances */}
        <div className="space-y-6">
          <div className="card p-6" style={{ background: 'linear-gradient(135deg, #1c1c19 0%, #353531 100%)', borderColor: 'var(--gold-border)' }}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-white/80">
                <Wallet className="w-5 h-5" />
                <span className="text-sm font-medium tracking-wide">METAMASK WALLET</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
            </div>
            
            <p className="text-xs text-white/50 mb-1">Total Balance</p>
            <div className="flex items-end gap-3 mb-6">
              <span className="font-display text-4xl text-white">4.82</span>
              <span className="text-xl text-amber-500 font-bold mb-1">ETH</span>
            </div>
            
            <p className="text-sm text-white/60 mb-1">~ $16,870.00 USD</p>
            <p className="text-xs font-mono bg-white/10 px-3 py-2 rounded-lg break-all text-white/50 mt-4">
              0x742d35Cc6634C053292...D4C9C56e7d5e3F2
            </p>
          </div>

          <div className="card p-6 border-blue-500/20 bg-blue-500/5">
             <h3 className="font-bold flex items-center gap-2 mb-2 text-blue-500 dark:text-blue-400">
               <Lock className="w-4 h-4" /> Locked in Escrow
             </h3>
             <p className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>1.25 ETH</p>
             <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Pending delivery confirmation for 1 order</p>
          </div>
        </div>

        {/* Portfolio Graph */}
        <div className="lg:col-span-2">
          <div className="card p-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between mb-8">
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Collection Valuation</p>
                <div className="flex items-end gap-4">
                  <span className="font-display text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatUsd(totalValue)}</span>
                  <span className={`flex items-center gap-1 text-sm font-bold mb-1 ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(growth).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 sm:mt-0 p-1 rounded-lg border h-fit" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                {['1M', '3M', '6M', '1Y', 'ALL'].map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${period === p ? 'bg-surface shadow text-amber-500' : 'text-gray-500'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PORTFOLIO_DATA}>
                  <XAxis dataKey="month" stroke="var(--border)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                  <YAxis stroke="var(--border)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={v => `$${v/1000}k`} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }}
                    itemStyle={{ color: 'var(--amber-500)', fontWeight: 600 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--gold)" 
                    strokeWidth={3} 
                    dot={{ fill: 'var(--gold)', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, fill: 'var(--gold)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TrendingUp(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
}

function TrendingDown(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
}
