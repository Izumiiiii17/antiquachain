import { ShieldCheck, Link as LinkIcon, Cpu, Lock } from 'lucide-react'

const pillars = [
  {
    icon: ShieldCheck,
    title: 'AI Authenticated',
    description: 'Every artifact verified by our advanced AI model with a confidence score.',
    color: '#22c55e',
  },
  {
    icon: LinkIcon,
    title: 'Blockchain Provenance',
    description: 'Immutable ownership history stored on-chain for full transparency.',
    color: '#f59e0b',
  },
  {
    icon: Lock,
    title: 'Escrow Protected',
    description: 'Smart contract escrow secures funds until delivery is confirmed.',
    color: '#3b82f6',
  },
  {
    icon: Cpu,
    title: 'Smart Contracts',
    description: 'Automated, trustless transactions via Ethereum smart contracts.',
    color: '#a855f7',
  },
]

export default function TrustBanner() {
  return (
    <section className="py-12 px-6 border-y" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {pillars.map(p => {
          const Icon = p.icon
          return (
            <div key={p.title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${p.color}18`, border: `1px solid ${p.color}40` }}>
                <Icon className="w-5 h-5" style={{ color: p.color }} />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{p.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
