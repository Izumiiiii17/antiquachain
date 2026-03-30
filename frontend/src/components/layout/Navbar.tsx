'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { truncateAddress } from '@/lib/utils'
import {
  Search, Sun, Moon, Menu, X, Wallet, Bell,
  ChevronDown, Gem, LayoutDashboard, PlusCircle,
  ShieldCheck, TrendingUp, LogOut
} from 'lucide-react'

type Theme = 'light' | 'dark'

export default function Navbar() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletOpen, setWalletOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    const initial = saved ?? 'dark'
    setTheme(initial)
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.classList.toggle('dark', next === 'dark')
    localStorage.setItem('theme', next)
  }

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
        setWalletAddress(accounts[0])
      } catch {
        // User rejected
      }
    } else {
      // Mock connection for demo
      setWalletAddress('0x742d35Cc6634C0532925a3b8D4C9C56e7d5e3F2')
    }
  }

  const navLinks = [
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/auction', label: 'Live Auctions' },
    { href: '/verify', label: 'AI Verify' },
    { href: '/analytics', label: 'Analytics' },
  ]

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass border-b shadow-sm'
          : 'bg-transparent border-transparent',
        'border-b'
      )}
      style={{ borderColor: scrolled ? 'var(--border)' : 'transparent' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-gold">
              <Gem className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold">
              <span className="text-gold-gradient">Antiqua</span>
              <span style={{ color: 'var(--text-primary)' }}>Chain</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === link.href
                    ? 'text-amber-500 bg-amber-500/10'
                    : 'hover:bg-white/5'
                )}
                style={{ color: pathname === link.href ? undefined : 'var(--text-secondary)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search */}
          <div className={cn(
            'hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200',
            searchFocused ? 'border-amber-500 shadow-gold w-64' : 'w-48'
          )} style={{ background: 'var(--surface)', borderColor: searchFocused ? undefined : 'var(--border)' }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search antiques..."
              className="bg-transparent outline-none text-sm w-full"
              style={{ color: 'var(--text-primary)' }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-lg border relative transition-colors hover:border-amber-500/50"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg border transition-colors hover:border-amber-500/50"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Wallet / Account */}
            {walletAddress ? (
              <div className="relative">
                <button
                  onClick={() => setWalletOpen(!walletOpen)}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all"
                  style={{ background: 'var(--surface)', borderColor: 'var(--gold-border)', color: 'var(--gold)' }}
                >
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span>{truncateAddress(walletAddress)}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {walletOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-xl border shadow-xl p-2 z-50"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                  >
                    <Link href="/dashboard" onClick={() => setWalletOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-amber-500/10 hover:text-amber-500"
                      style={{ color: 'var(--text-secondary)' }}>
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/wallet" onClick={() => setWalletOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-amber-500/10 hover:text-amber-500"
                      style={{ color: 'var(--text-secondary)' }}>
                      <Wallet className="w-4 h-4" /> Wallet & Portfolio
                    </Link>
                    <Link href="/create" onClick={() => setWalletOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-amber-500/10 hover:text-amber-500"
                      style={{ color: 'var(--text-secondary)' }}>
                      <PlusCircle className="w-4 h-4" /> Create Listing
                    </Link>
                    <div className="my-1 border-t" style={{ borderColor: 'var(--border)' }} />
                    <button
                      onClick={() => { setWalletAddress(null); setWalletOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4" /> Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={connectWallet} className="btn-gold hidden sm:flex">
                <Wallet className="w-4 h-4" /> Connect Wallet
              </button>
            )}

            {/* List button */}
            <Link href="/create" className="btn-ghost hidden lg:flex">
              <PlusCircle className="w-4 h-4" /> List Item
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-1" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-amber-500/10 hover:text-amber-500"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            {walletAddress
              ? <p className="text-sm px-3 py-2" style={{ color: 'var(--text-muted)' }}>{truncateAddress(walletAddress)}</p>
              : <button onClick={connectWallet} className="btn-gold w-full justify-center"><Wallet className="w-4 h-4" /> Connect Wallet</button>
            }
          </div>
        </div>
      )}
    </nav>
  )
}
