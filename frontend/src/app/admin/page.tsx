import { ShieldAlert, Users, PackageSearch, AlertTriangle, TrendingUp, Filter } from 'lucide-react'
import { MOCK_LISTINGS } from '@/lib/mockData'

export default function AdminPage() {
  const stats = [
    { label: 'Total Volume', value: '$48.2M', trend: '+12%', color: 'border-green-500 text-green-500' },
    { label: 'Pending Approvals', value: '18', trend: 'Action Reqd', color: 'border-amber-500 text-amber-500' },
    { label: 'Active Disputes', value: '3', trend: 'High Priority', color: 'border-red-500 text-red-500' },
    { label: 'Total Users', value: '12,402', trend: '+5.2%', color: 'border-blue-500 text-blue-500' },
  ]

  return (
    <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2 font-amber" style={{ color: 'var(--text-primary)' }}>Admin Command Center</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage listings, moderate disputes, and monitor platform health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`card p-5 border-l-4 ${s.color.split(' ')[0]}`}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            <p className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <span className={`text-xs font-semibold ${s.color.split(' ')[1]}`}>{s.trend}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
               <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                 <ShieldAlert className="w-5 h-5 text-amber-500" /> Pending AI Reviews
               </h2>
               <button className="btn-ghost py-1 px-3 text-xs"><Filter className="w-3 h-3 mr-1" /> Filter</button>
            </div>
            
            <div className="space-y-4">
              {MOCK_LISTINGS.slice(3, 6).map(listing => (
                <div key={listing.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                  <img src={listing.images[0].url} className="w-16 h-16 rounded object-cover" />
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{listing.title}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>ID: {listing.artifactId} • AI Score: <span className="text-amber-500 font-bold">{listing.authenticityScore}%</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-gold py-1.5 px-3 text-xs">Approve</button>
                    <button className="btn-ghost py-1.5 px-3 text-xs text-red-500 hover:bg-red-500/10 hover:border-red-500">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="card p-6 border border-red-500/20 bg-red-500/5">
             <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-500">
               <AlertTriangle className="w-5 h-5" /> Active Escrow Disputes
             </h2>
             <div className="space-y-3">
               {[1,2].map(i => (
                 <div key={i} className="p-3 rounded-lg bg-surface border border-red-500/20">
                   <div className="flex justify-between text-xs mb-2">
                     <span className="font-bold">Order #AQ-{9483+i}</span>
                     <span className="text-red-500">Awaiting Admin</span>
                   </div>
                   <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Buyer claims "Item not as described, minor scratch."</p>
                   <button className="mt-3 w-full btn-ghost py-1.5 text-xs text-red-500">Review Dispute</button>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
