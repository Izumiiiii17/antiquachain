'use client'

import { useState } from 'react'
import { Upload, X, ShieldCheck, Cpu, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function VerifyPage() {
  const [image, setImage] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Mock upload
      setImage('https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&h=600&fit=crop')
      setResult(null)
    }
  }

  const runVerification = () => {
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      setResult({
        score: 96,
        forgeryRisk: 2,
        styleMatch: 98,
        materialConsistency: 95,
        estimatedEra: "Late 17th Century",
        origin: "Bizen Province, Japan",
        recommendation: "Authentic Edo Period Katana"
      })
    }, 4000)
  }

  return (
    <div className="pt-24 pb-20 px-6 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          AI Identity & Authentication
        </h1>
        <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Upload an image of an artifact to instantly verify its authenticity. Our proprietary models analyze brushstrokes, material degradation, and historical style markers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Upload Zone */}
        <div className="card p-6 md:p-8">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Upload className="w-5 h-5 text-amber-500" /> Upload Artifact Image
          </h2>
          
          {!image ? (
            <label className="border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all" style={{ borderColor: 'var(--border)' }}>
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-amber-500" />
              </div>
              <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Click to upload or drag and drop</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>High resolution JPEG, PNG, or WEBP (max 20MB)</p>
              <button className="btn-ghost pointer-events-none">Select File</button>
              <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
            </label>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border bg-gray-100 dark:bg-charcoal-900 group" style={{ borderColor: 'var(--border)' }}>
              <img src={image} alt="Uploaded artifact" className="w-full aspect-square object-cover" />
              <button 
                onClick={() => { setImage(null); setResult(null) }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              {!result && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={runVerification}
                    disabled={isVerifying}
                    className="btn-gold shadow-gold text-lg px-8 py-4"
                  >
                    {isVerifying ? 'Analyzing...' : 'Run Analysis'}
                  </button>
                </div>
              )}

              {isVerifying && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center px-8 text-center">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mb-6" />
                  <p className="text-white font-bold text-lg mb-2">Analyzing 12M data points...</p>
                  <p className="text-white/70 text-sm">Cross-referencing historical databases and forgery markers.</p>
                </div>
              )}
            </div>
          )}

          {!image && !isVerifying && !result && (
            <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
               <Info className="w-5 h-5 shrink-0" />
               <p className="text-xs leading-relaxed">For best results, ensure the item is well-lit against a neutral background. Include close-ups of signatures, mint marks, or distinctive wear patterns.</p>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className={cn("transition-all duration-500", result ? "opacity-100 translate-y-0" : "opacity-50 translate-y-4 pointer-events-none")}>
           <div className="card p-6 md:p-8 sticky top-24">
             <div className="flex items-center gap-3 mb-6 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl" style={{ color: 'var(--text-primary)' }}>AI Verification Report</h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Generated securely on-chain • ID: {Date.now().toString(16).toUpperCase()}</p>
                </div>
             </div>

             {result ? (
               <div className="space-y-6">
                 <div className="flex items-center justify-between p-4 rounded-xl border border-green-500/30 bg-green-500/5">
                   <div>
                     <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">Authenticity Confidence</p>
                     <p className="text-xs text-green-600/80 dark:text-green-400/80">Model certainty level: Extremely High</p>
                   </div>
                   <div className="font-display text-4xl font-bold text-green-500">{result.score}%</div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                     <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Estimated Era</p>
                     <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{result.estimatedEra}</p>
                   </div>
                   <div className="p-4 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                     <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Probable Origin</p>
                     <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{result.origin}</p>
                   </div>
                 </div>

                 <div className="space-y-3 pt-2">
                   {[
                     { label: 'Forgery Risk Factor', val: `${result.forgeryRisk}%`, okay: true },
                     { label: 'Historical Style Match', val: `${result.styleMatch}%`, okay: true },
                     { label: 'Material Degradation Consistency', val: `${result.materialConsistency}%`, okay: true },
                   ].map(metric => (
                     <div key={metric.label} className="flex items-center justify-between text-sm p-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                       <span style={{ color: 'var(--text-secondary)' }}>{metric.label}</span>
                       <span className="font-bold flex items-center gap-1 text-green-500">
                         {metric.val} <CheckCircle2 className="w-3.5 h-3.5" />
                       </span>
                     </div>
                   ))}
                 </div>

                 <div className="p-4 rounded-xl mt-6 border border-amber-500/30 bg-amber-500/5">
                   <p className="text-xs font-semibold text-amber-500 mb-1 uppercase tracking-wider">AI Conclusion</p>
                   <p className="font-medium text-amber-600 dark:text-amber-400">{result.recommendation}</p>
                 </div>

                 <button className="w-full btn-gold py-3 mt-4">
                   Generate Authenticity Certificate (NFT)
                 </button>
               </div>
             ) : (
               <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
                 <Cpu className="w-12 h-12 mb-4" />
                 <p className="font-semibold">Awaiting image upload...</p>
                 <p className="text-sm mt-1">Upload an image and run analysis to view the detailed authenticity report here.</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  )
}
