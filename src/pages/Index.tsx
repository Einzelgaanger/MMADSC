import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hexagon, ArrowLeft } from "lucide-react";
import WalletInput from "@/components/WalletInput";
import ScoreDisplay from "@/components/ScoreDisplay";
import ActivityBreakdown from "@/components/ActivityBreakdown";
import CTASection from "@/components/CTASection";
import PaymentModal from "@/components/PaymentModal";
import { analyzeWallet, type ScoringResult } from "@/lib/scoring";

const Index = () => {
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const handleCheck = async (address: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    const scoring = analyzeWallet(address);
    setResult(scoring);
    setIsLoading(false);
  };

  const handleReset = () => setResult(null);

  return (
    <div className="min-h-screen bg-background bg-grid relative">
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <Hexagon className="w-7 h-7 text-primary" />
            <span className="font-display font-bold text-lg text-foreground">
              MetaDrop
            </span>
          </div>
          <a
            href="https://metamask.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground text-sm font-body hover:text-foreground transition-colors"
          >
            Not affiliated with MetaMask
          </a>
        </nav>

        {/* Main Content */}
        <main className="px-6 pb-20 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="pt-16 md:pt-24"
              >
                {/* Hero */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-12"
                >
                  <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                    <span className="text-primary text-xs font-display font-semibold uppercase tracking-wider">
                      Pre-announcement tracker
                    </span>
                  </div>

                  <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl text-foreground leading-tight">
                    Are you eligible for the
                    <br />
                    <span className="text-gradient-primary">MetaMask Airdrop</span>?
                  </h1>

                  <p className="text-muted-foreground font-body text-base md:text-lg max-w-xl mx-auto mt-5 leading-relaxed">
                    30M+ wallets. One of crypto's most anticipated token launches.
                    Check your on-chain activity and see where you stand.
                  </p>
                </motion.div>

                <WalletInput onSubmit={handleCheck} isLoading={isLoading} />

                {/* Social Proof */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center gap-6 mt-16 text-muted-foreground text-xs font-body"
                >
                  <span>🔒 Read-only</span>
                  <span className="w-px h-4 bg-border" />
                  <span>⚡ Instant results</span>
                  <span className="w-px h-4 bg-border" />
                  <span>🎯 12,400+ wallets checked</span>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="pt-8 space-y-8"
              >
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-muted-foreground text-sm font-body hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
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
        <footer className="border-t border-border py-8 px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-xs font-body">
            <p>© 2026 MetaDrop. Speculative analysis tool — not financial advice.</p>
            <p>This tool is not affiliated with, endorsed by, or connected to MetaMask or ConsenSys.</p>
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
