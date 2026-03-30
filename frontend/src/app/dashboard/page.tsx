'use client'

import { useState } from 'react'
import { MOCK_LISTINGS, MOCK_SELLERS } from '@/lib/mockData'
import { formatCurrency, formatUsd } from '@/lib/utils'
import { LayoutDashboard, ShoppingBag, Package, MessageSquare, Heart, Settings, PlusCircle, CheckCircle2 } from 'lucide-react'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('orders')
  const user = MOCK_SELLERS[0]

  const tabs = [
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'listings', label: 'My Listings', icon: Package },
    { id: 'saved', label: 'Watchlist', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div className="card p-6 text-center">
          <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full mx-auto mb-4 border-2 object-cover" style={{ borderColor: 'var(--gold)' }} />
          <h2 className="font-display font-bold text-lg mb-1 flex items-center justify-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
            {user.name} 
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Verified {user.role === 'seller' ? 'Seller' : 'Buyer'}</p>
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <div>
              <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>12</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Listed</p>
            </div>
            <div>
              <p className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>34</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sold</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col sm:flex-row items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap min-w-[80px] sm:min-w-0 ${isActive ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-amber-500/5 hover:text-amber-500 text-gray-500 dark:text-gray-400'}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        
        {activeTab === 'listings' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Listings</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage your active and sold artifacts.</p>
              </div>
              <button className="btn-gold px-4 py-2">
                <PlusCircle className="w-4 h-4 mr-2" /> New Listing
              </button>
            </div>

            <div className="space-y-4">
              {MOCK_LISTINGS.slice(0, 3).map(listing => (
                <div key={listing.id} className="card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <img src={listing.images[0].url} alt={listing.title} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge" style={{ background: 'var(--bg-secondary)' }}>{listing.type}</span>
                      {listing.type === 'auction' && <span className="text-xs text-red-500 font-medium">Live</span>}
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1" style={{ color: 'var(--text-primary)' }}>{listing.title}</h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {listing.views} views • {listing.watchlistCount} watching • ID: {listing.artifactId}
                    </p>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0" style={{ borderColor: 'var(--border)' }}>
                    <div className="text-right mb-2">
                       <p className="font-bold text-amber-500">{formatCurrency(listing.currentBid ?? listing.price)}</p>
                       <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{listing.type === 'auction' ? `${listing.bidCount} bids` : 'Listing Price'}</p>
                    </div>
                    <button className="btn-ghost px-3 py-1.5 text-xs">Manage</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {activeTab !== 'listings' && (
           <div className="card p-12 text-center animate-fade-in">
             <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
               {(() => {
                 const TabIcon = tabs.find(t => t.id === activeTab)?.icon;
                 return TabIcon ? <TabIcon className="w-8 h-8 text-amber-500" /> : null;
               })()}
             </div>
             <h2 className="font-display text-xl font-bold mb-2 cursor-pointer capitalize">{activeTab}</h2>
             <p className="text-sm mx-auto max-w-sm" style={{ color: 'var(--text-muted)' }}>
               This section of the dashboard is coming soon during the Beta phase.
             </p>
           </div>
        )}

      </main>
    </div>
  )
}
