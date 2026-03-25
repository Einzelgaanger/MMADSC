import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import WalletInput from "@/components/WalletInput";
import ScoreDisplay from "@/components/ScoreDisplay";
import ActivityBreakdown from "@/components/ActivityBreakdown";
import CTASection from "@/components/CTASection";
import PricingSection, { type PricingTier } from "@/components/PricingSection";
import PaymentModal from "@/components/PaymentModal";
import ScannerAnimation from "@/components/ScannerAnimation";
import { analyzeWallet, type ScoringResult } from "@/lib/scoring";

const Index = () => {
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier>("pro");

  const handleCheck = async (address: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 2400));
    const scoring = analyzeWallet(address);
    setResult(scoring);
    setIsLoading(false);
  };

  const handleReset = () => setResult(null);

  const handleSelectTier = (tier: PricingTier) => {
    setSelectedTier(tier);
    setShowPayment(true);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background mesh */}
      <div className="fixed inset-0 pointer-events-none bg-mesh" />
      <div className="fixed inset-0 pointer-events-none bg-dots opacity-40" />

      <div className="relative z-10">
        {/* Nav */}
        <nav className="border-b border-border bg-card/80 backdrop-blur-lg sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 lg:px-8 py-3.5 max-w-6xl mx-auto">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="font-display font-bold text-primary-foreground text-sm">M</span>
                </div>
                <span className="font-display font-bold text-[16px] text-foreground">
                  MetaDrop
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-700 text-[11px] font-body font-medium">Live</span>
              </div>
            </div>
            <span className="hidden sm:inline text-muted-foreground text-[11px] font-body">
              Not affiliated with MetaMask or ConsenSys
            </span>
          </div>
        </nav>

        {/* Main Content */}
        <main className="px-6 lg:px-8 pb-24 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <ScannerAnimation key="scanner" />
            ) : !result ? (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {/* Hero section */}
                <div className="pt-20 md:pt-28 pb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl mx-auto text-center"
                  >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 border border-primary/20 rounded-full px-3.5 py-1 mb-8 bg-primary/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-primary text-[11px] font-display font-medium uppercase tracking-[0.12em]">
                        Pre-announcement tracker
                      </span>
                    </div>

                    {/* Title */}
                    <h1 className="font-display font-bold text-[2.75rem] md:text-[3.75rem] lg:text-[4.25rem] leading-[1.05] tracking-tight">
                      <span className="text-foreground">Check your eligibility</span>
                      <br />
                      <span className="text-gradient-primary">for the MetaMask Airdrop</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-muted-foreground font-body text-[15px] md:text-base max-w-md mx-auto mt-6 leading-relaxed">
                      Analyze your on-chain footprint across 8+ chains.
                      Compare with past airdrop winners and get actionable insights.
                    </p>
                  </motion.div>

                  {/* Input */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="mt-10"
                  >
                    <WalletInput onSubmit={handleCheck} isLoading={isLoading} />
                  </motion.div>

                  {/* Social proof */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mt-14"
                  >
                    <div className="flex items-center justify-center gap-6 md:gap-8 text-muted-foreground text-[12px] font-body">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                        <span>Read-only</span>
                      </div>
                      <span className="w-px h-3.5 bg-border" />
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                        <span>Instant results</span>
                      </div>
                      <span className="w-px h-3.5 bg-border" />
                      <span>12,400+ wallets checked</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
                      <span className="text-muted-foreground/50 text-[10px] font-body mr-1">Powered by</span>
                      {["Etherscan", "Alchemy", "Moralis", "The Graph", "DefiLlama"].map((s) => (
                        <span key={s} className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border">
                          {s}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* How it works */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.5 }}
                  className="max-w-4xl mx-auto mt-12 mb-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { step: "01", title: "Paste your address", desc: "Enter any Ethereum address — we only use public on-chain data." },
                      { step: "02", title: "Multi-chain analysis", desc: "We scan activity across Ethereum, Linea, Polygon, Arbitrum & more." },
                      { step: "03", title: "Get your score", desc: "See your eligibility tier, activity breakdown, and boost actions." },
                    ].map((item) => (
                      <div key={item.step} className="glass-card rounded-xl p-5 group hover:border-primary/20 transition-colors">
                        <span className="text-primary font-mono text-[11px] font-medium">{item.step}</span>
                        <h3 className="font-display font-semibold text-foreground text-[14px] mt-2">{item.title}</h3>
                        <p className="text-muted-foreground text-[12px] font-body mt-1.5 leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="pt-8 space-y-8"
              >
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-muted-foreground text-[13px] font-body hover:text-foreground transition-colors group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  New check
                </button>

                <ScoreDisplay result={result} />
                <ActivityBreakdown activities={result.activities} />
                <PricingSection onSelectTier={handleSelectTier} />
                <CTASection />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card/50">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                  <span className="font-display font-bold text-primary-foreground text-[8px]">M</span>
                </div>
                <span className="text-muted-foreground text-[11px] font-body">
                  © 2026 MetaDrop
                </span>
              </div>
              <span className="w-px h-3 bg-border" />
              <span className="text-muted-foreground/60 text-[11px] font-body">
                Speculative analysis — not financial advice
              </span>
            </div>
            <span className="text-muted-foreground/50 text-[11px] font-body">
              Not affiliated with MetaMask or ConsenSys
            </span>
          </div>
        </footer>
      </div>

      {result && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          result={result}
          tier={selectedTier}
        />
      )}
    </div>
  );
};

export default Index;
