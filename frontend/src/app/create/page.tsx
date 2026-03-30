'use client'

import { useState } from 'react'
import { Upload, X, ShieldCheck, Cpu } from 'lucide-react'
import { CATEGORIES } from '@/lib/mockData'
import { cn } from '@/lib/utils'

export default function CreateListingPage() {
  const [images, setImages] = useState<string[]>([])
  const [format, setFormat] = useState('auction')
  const [step, setStep] = useState(1) // 1: Details, 2: Verification

  // Mock AI Verification state
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mock upload
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map(() => 
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop'
      )
      setImages(prev => [...prev, ...newImages])
    }
  }

  const runAIVerification = () => {
    setIsVerifying(true)
    // Simulate AI model processing time
    setTimeout(() => {
      setIsVerifying(false)
      setVerificationResult({
        score: 94,
        styleMatch: 96,
        material: 92,
        estimatedPrice: { min: 4200, max: 5800 },
        recommendation: "Authentic"
      })
    }, 3000)
  }

  return (
    <div className="pt-24 pb-20 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>List an Artifact</h1>
        <p className="text-sm max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Create an immutable blockchain record and list your antique for sale. Our AI will authenticate your item to boost buyer trust.
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-12">
        <div className={cn("flex items-center gap-2 font-medium px-4 py-2 rounded-full", step === 1 ? "bg-amber-500/10 text-amber-500" : "text-gray-500")}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-current text-white">1</div>
          Details
        </div>
        <div className="w-12 h-px bg-gray-300 dark:bg-gray-700" />
        <div className={cn("flex items-center gap-2 font-medium px-4 py-2 rounded-full", step === 2 ? "bg-amber-500/10 text-amber-500" : "text-gray-500")}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-current text-white">2</div>
          AI Authentication
        </div>
      </div>

      {step === 1 && (
        <div className="card p-6 md:p-8 space-y-8 animate-fade-in">
          {/* Images */}
          <div>
            <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Artifact Images</h3>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Upload high-resolution images from multiple angles. Required for AI verification.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 group">
                  <img src={img} alt="Upload" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-2 left-2 text-[10px] bg-black/50 text-white px-2 py-0.5 rounded backdrop-blur-sm">Primary</span>
                  )}
                </div>
              ))}
              
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-colors">
                <Upload className="w-6 h-6 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500 font-medium">Upload Image</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Title</label>
              <input type="text" placeholder="e.g. Ming Dynasty Blue & White Vase" className="input" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Category</label>
              <select className="input">
                <option value="">Select a category</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Era/Period</label>
              <input type="text" placeholder="e.g. 14th Century" className="input" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Condition</label>
              <select className="input">
                <option value="mint">Mint / Near Mint</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor / Restoration Needed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Location</label>
              <input type="text" placeholder="e.g. London, UK" className="input" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Description</label>
              <textarea placeholder="Provide a detailed history and physical description..." className="input h-32 resize-none" />
            </div>
          </div>

          <div className="pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Listing Format</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { id: 'auction', label: 'Auction', desc: 'Highest bidder wins' },
                { id: 'fixed', label: 'Fixed Price', desc: 'Buy it now' },
                { id: 'offer', label: 'Make Offer', desc: 'Negotiate price' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setFormat(type.id)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    format === type.id ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500" : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                  )}
                >
                  <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{type.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{type.desc}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {format === 'auction' ? 'Starting Bid' : 'Price'} (ETH)
                </label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Ξ</span>
                   <input type="number" step="0.01" placeholder="0.00" className="input pl-10" />
                </div>
              </div>
              
              {format === 'auction' && (
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Duration</label>
                  <select className="input">
                    <option value="3">3 Days</option>
                    <option value="5">5 Days</option>
                    <option value="7">7 Days</option>
                    <option value="14">14 Days</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 flex justify-end">
             <button onClick={() => setStep(2)} className="btn-gold px-8" disabled={images.length === 0}>
               Continue <ChevronRight className="w-4 h-4 ml-1" />
             </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card p-6 md:p-10 text-center animate-fade-in">
          
          {!verificationResult ? (
            <div className="max-w-md mx-auto py-10">
               <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6 relative">
                 <Cpu className="w-10 h-10 text-blue-500" />
                 {isVerifying && (
                   <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                 )}
               </div>
               
               <h2 className="font-display text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                 {isVerifying ? 'Analyzing Artifact...' : 'AI Identity & Verification'}
               </h2>
               <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
                 Our AI models will analyze your images against 1.2 million known historical artifacts to generate an authenticity score and estimated value.
               </p>
               
               <button 
                 onClick={runAIVerification} 
                 disabled={isVerifying}
                 className={cn("btn-gold w-full justify-center text-lg h-14", isVerifying && "opacity-50 cursor-not-allowed")}
               >
                 {isVerifying ? 'Processing...' : 'Run AI Verification'}
               </button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-left">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-green-500 mb-1">Verification Complete</h2>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Analyzed 4 images across 12 AI vision models.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  <p className="text-sm text-center mb-2" style={{ color: 'var(--text-muted)' }}>Authenticity Score</p>
                  <p className="font-display text-4xl font-bold text-center text-amber-500">{verificationResult.score}%</p>
                </div>
                <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  <p className="text-sm text-center mb-2" style={{ color: 'var(--text-muted)' }}>AI Market Estimate</p>
                  <p className="font-display text-3xl font-bold text-center mt-2" style={{ color: 'var(--text-primary)' }}>
                    ${(verificationResult.estimatedPrice.min).toLocaleString()} - ${(verificationResult.estimatedPrice.max).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <div className="flex items-center justify-between p-3 rounded-lg text-sm" style={{ background: 'var(--bg-secondary)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Historical Style Match</span>
                  <span className="font-bold text-green-500">{verificationResult.styleMatch}%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg text-sm" style={{ background: 'var(--bg-secondary)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Material consistency</span>
                  <span className="font-bold text-green-500">{verificationResult.material}%</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1 justify-center">Back</button>
                <div className="flex-1 relative group">
                  <button className="btn-gold w-full justify-center">
                    Mint & Publish Listing
                  </button>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Requires wallet connection
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ChevronRight(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
}
