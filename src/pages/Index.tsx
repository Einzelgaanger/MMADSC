import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hexagon, ArrowLeft, Shield, Zap, Eye, Users, BarChart3 } from "lucide-react";
import WalletInput from "@/components/WalletInput";
import ScoreDisplay from "@/components/ScoreDisplay";
import ActivityBreakdown from "@/components/ActivityBreakdown";
import CTASection from "@/components/CTASection";
import PaymentModal from "@/components/PaymentModal";
import ScannerAnimation from "@/components/ScannerAnimation";
import { analyzeWallet, type ScoringResult } from "@/lib/scoring";

const Index = () => {
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const handleCheck = async (address: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 2400));
    const scoring = analyzeWallet(address);
    setResult(scoring);
    setIsLoading(false);
  };

  const handleReset = () => setResult(null);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle grid */}
      <div className="fixed inset-0 bg-grid opacity-40 pointer-events-none" />

      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[400px] bg-accent/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-[60%] right-[10%] w-[300px] h-[300px] bg-primary/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Hexagon className="w-8 h-8 text-primary" strokeWidth={1.8} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-primary font-display font-bold text-[10px]">M</span>
              </div>
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-foreground">
              MetaDrop
            </span>
          </div>
          <div className="flex items-center gap-5">
            <span className="hidden sm:inline text-muted-foreground/60 text-[11px] font-body">
              v2.1 • Live data
            </span>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <a
              href="https://metamask.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/70 text-[11px] font-body hover:text-foreground transition-colors"
            >
              Not affiliated with MetaMask
            </a>
          </div>
        </nav>

        {/* Main Content */}
        <main className="px-6 pb-24 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <ScannerAnimation key="scanner" />
            ) : !result ? (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="pt-20 md:pt-28"
              >
                {/* Hero */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mb-14"
                >
                  <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-7">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                    <span className="text-primary text-[11px] font-display font-semibold uppercase tracking-[0.15em]">
                      Token launch tracker
                    </span>
                  </div>

                  <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-[4.5rem] text-foreground leading-[1.1] tracking-tight">
                    Check your eligibility
                    <br />
                    <span className="text-gradient-primary">for the MetaMask Airdrop</span>
                  </h1>

                  <p className="text-muted-foreground font-body text-base md:text-[1.05rem] max-w-lg mx-auto mt-6 leading-relaxed">
                    Analyze your on-chain footprint across 8+ chains. See your score,
                    compare with past airdrops, and get a personalized action plan.
                  </p>
                </motion.div>

                <WalletInput onSubmit={handleCheck} isLoading={isLoading} />

                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mt-16 space-y-8"
                >
                  {/* Stats row */}
                  <div className="flex items-center justify-center gap-8 text-muted-foreground/70 text-xs font-body">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Read-only analysis</span>
                    </div>
                    <div className="w-px h-4 bg-border" />
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Instant results</span>
                    </div>
                    <div className="w-px h-4 bg-border" />
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>12,400+ wallets checked</span>
                    </div>
                  </div>

                  {/* Data sources */}
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {["Etherscan", "Alchemy", "Moralis", "The Graph", "Linea", "DefiLlama"].map((source) => (
                      <span
                        key={source}
                        className="text-[10px] font-body text-muted-foreground/40 bg-secondary/50 px-3 py-1 rounded-full border border-border/50"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="pt-8 space-y-8"
              >
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-muted-foreground text-sm font-body hover:text-foreground transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  Check another wallet
                </button>

                <ScoreDisplay result={result} />
                <ActivityBreakdown activities={result.activities} />
                <CTASection onOpenPayment={() => setShowPayment(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8 px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Hexagon className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.5} />
              <p className="text-muted-foreground/50 text-[11px] font-body">
                © 2026 MetaDrop. Speculative analysis tool — not financial advice.
              </p>
            </div>
            <p className="text-muted-foreground/40 text-[11px] font-body">
              Not affiliated with, endorsed by, or connected to MetaMask or ConsenSys.
            </p>
          </div>
        </footer>
      </div>

      {/* Payment Modal */}
      {result && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          result={result}
        />
      )}
    </div>
  );
};

export default Index;
