import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import ScoreDisplay from "@/components/ScoreDisplay";
import ActivityBreakdown from "@/components/ActivityBreakdown";
import CTASection from "@/components/CTASection";
import PricingSection, { type PricingTier } from "@/components/PricingSection";
import PaymentModal from "@/components/PaymentModal";
import ScannerAnimation from "@/components/ScannerAnimation";
import HomeBackdrop from "@/components/HomeBackdrop";
import CryptoFloatLayer from "@/components/CryptoFloatLayer";
import AnalysisInputPanel from "@/components/AnalysisInputPanel";
import { analyzeWallet, type ScoringResult } from "@/lib/scoring";
import metadropLogo from "@/assets/metadrop-logo.png";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const partners = ["Etherscan", "Alchemy", "Moralis", "The Graph", "DefiLlama", "Nansen", "Dune"];

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

  const howSteps = [
    {
      step: "01",
      title: "Address in",
      desc: "Any Ethereum address. Public data only — no connect wallet, no signatures.",
    },
    {
      step: "02",
      title: "Chains & activity",
      desc: "We weight activity across the networks you care about (ETH, L2s, Linea, and peers).",
    },
    {
      step: "03",
      title: "Score & breakdown",
      desc: "Tier, activity slices, and concrete next steps — not a generic paragraph.",
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <HomeBackdrop />
      <CryptoFloatLayer />

      <div className="relative z-10">
        {/* Nav — app bar: brand lockup + status + secondary actions */}
        <header className="sticky top-0 z-30 border-b border-border/50 bg-white/80 shadow-[0_1px_0_hsl(0_0%_100%/0.9)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/65">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
          <div className="mx-auto flex h-[3.75rem] max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
            <Link to="/" className="group flex min-w-0 items-center gap-3 sm:gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-card shadow-sm transition-colors group-hover:border-primary/30 group-hover:shadow-md sm:h-11 sm:w-11">
                <img src={metadropLogo} alt="" className="h-7 w-7 object-contain sm:h-8 sm:w-8" width={32} height={32} />
              </div>
              <div className="min-w-0">
                <span className="font-display text-[15px] font-semibold leading-none tracking-tight text-foreground sm:text-base">
                  MetaDrop
                </span>
                <p className="mt-0.5 truncate font-body text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px]">
                  Eligibility check
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="hidden font-body text-[11px] font-medium text-muted-foreground sm:inline">Live</span>
              </div>
              <p className="hidden max-w-[200px] font-body text-[11px] leading-snug text-muted-foreground lg:block xl:max-w-none">
                Independent tool — not MetaMask or ConsenSys
              </p>
              <div className="hidden h-6 w-px bg-border/70 sm:block" />
              <nav className="flex items-center gap-1 sm:gap-0.5">
                <Link
                  to="/manage-subscription"
                  className="rounded-lg px-2.5 py-2 font-body text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground sm:px-3 sm:text-[13px]"
                >
                  Manage
                </Link>
                <Link
                  to="/terms"
                  className="hidden rounded-lg px-2.5 py-2 font-body text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground sm:inline-block sm:px-3 sm:text-[13px]"
                >
                  Terms
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <ScannerAnimation key="scanner" />
            ) : !result ? (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Hero — one column, typographic; input dock is the only “card” */}
                <section className="pb-16 pt-8 sm:pt-10 md:pt-12">
                  <div className="relative mx-auto max-w-3xl lg:max-w-6xl lg:px-0">
                    <motion.img
                      src={metadropLogo}
                      alt=""
                      aria-hidden
                      className="pointer-events-none absolute -right-4 top-0 hidden w-40 select-none opacity-[0.06] lg:block xl:w-48"
                    />

                    <motion.div
                      className="relative z-10"
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                    >
                      <motion.p
                        variants={itemVariants}
                        className="font-body text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        Pre-announcement tracker
                      </motion.p>

                      <motion.div variants={itemVariants} className="mt-6 flex justify-center lg:hidden">
                        <img src={metadropLogo} alt="" className="h-24 w-24 object-contain opacity-95" width={96} height={96} />
                      </motion.div>

                      <motion.h1
                        variants={itemVariants}
                        className="mt-6 text-balance text-center font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:mt-0 lg:text-left"
                      >
                        Check your eligibility{" "}
                        <span className="text-gradient-primary">for the MetaMask airdrop</span>
                      </motion.h1>

                      <motion.p
                        variants={itemVariants}
                        className="mx-auto mt-5 max-w-xl text-pretty text-center font-body text-[15px] leading-[1.65] text-muted-foreground sm:text-base lg:mx-0 lg:text-left"
                      >
                        One address, one score-shaped readout — built from public chain data, not wallet access.
                      </motion.p>
                    </motion.div>

                    <div className="relative z-10 mt-12 lg:mt-14">
                      <AnalysisInputPanel onSubmit={handleCheck} isLoading={isLoading} />

                      <p className="mt-8 text-center font-body text-sm leading-relaxed text-muted-foreground lg:text-left">
                        <span className="tabular-nums font-medium text-foreground">8+</span> networks · typical{" "}
                        <span className="tabular-nums font-medium text-foreground">&lt;3s</span> ·{" "}
                        <span className="font-medium text-foreground">read-only</span> access
                      </p>

                      <div className="mt-10 flex flex-col gap-6 border-t border-border/60 pt-10 sm:flex-row sm:items-start sm:justify-between">
                        <p className="max-w-md font-body text-sm leading-relaxed text-muted-foreground">
                          <Lock className="mb-2 inline h-4 w-4 text-foreground/70" aria-hidden /> No API keys from you.
                          Nothing leaves your browser except the address you submit for scoring.
                        </p>
                        <p className="font-body text-[13px] leading-relaxed text-muted-foreground sm:max-w-sm sm:text-right">
                          <span className="block font-medium text-foreground">12,400+ wallets checked</span>
                          Integrations: {partners.join(" · ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Flow — vertical timeline, no repeated card chrome */}
                <section className="border-t border-border/60 pb-6 pt-14 md:pt-16">
                  <div className="mx-auto max-w-3xl lg:mx-0 lg:max-w-6xl">
                    <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">What happens</h2>
                    <p className="mt-2 max-w-xl font-body text-[15px] leading-relaxed text-muted-foreground">
                      Straight line from paste to result — no parallel “feature cards.”
                    </p>

                    <ol className="mt-10 space-y-0">
                      {howSteps.map((item, i) => (
                        <motion.li
                          key={item.step}
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-20px" }}
                          transition={{ delay: i * 0.05, duration: 0.4 }}
                          className="relative flex gap-5 pb-12 last:pb-0 md:gap-8"
                        >
                          <div className="flex w-11 shrink-0 flex-col items-center md:w-14">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-foreground bg-background font-mono text-[11px] font-semibold text-foreground">
                              {item.step}
                            </span>
                            {i < howSteps.length - 1 ? (
                              <span className="mt-2 w-px flex-1 min-h-[2.5rem] bg-border" aria-hidden />
                            ) : null}
                          </div>
                          <div className="min-w-0 pt-0.5">
                            <h3 className="font-display text-lg font-semibold text-foreground md:text-xl">{item.title}</h3>
                            <p className="mt-2 max-w-prose font-body text-[14px] leading-relaxed text-muted-foreground md:text-[15px]">
                              {item.desc}
                            </p>
                          </div>
                        </motion.li>
                      ))}
                    </ol>
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pt-6 sm:pt-8 space-y-8 sm:space-y-10"
              >
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 text-muted-foreground text-[13px] font-body hover:text-foreground transition-colors group min-h-[44px] sm:min-h-0 -ml-1 px-1"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform shrink-0" />
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

        <footer className="border-t border-border/80 bg-card/40 backdrop-blur-sm mt-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <div className="flex flex-col gap-8 sm:gap-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                <div className="flex items-center gap-3">
                  <img src={metadropLogo} alt="" className="w-11 h-11 sm:w-12 sm:h-12 object-contain opacity-90" loading="lazy" width={48} height={48} />
                  <div>
                    <span className="text-foreground text-sm font-display font-semibold block">MetaDrop</span>
                    <span className="text-muted-foreground text-[11px] font-body">© {new Date().getFullYear()} MetaDrop</span>
                  </div>
                </div>
                <p className="text-muted-foreground/80 text-[11px] sm:text-xs font-body max-w-md sm:text-right leading-relaxed">
                  Speculative analysis for informational purposes only. Not financial advice.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border/60">
                <nav className="flex flex-wrap gap-x-5 gap-y-2 justify-center sm:justify-start text-[11px] sm:text-xs font-body">
                  <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors py-1">
                    Terms of Service
                  </Link>
                  <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors py-1">
                    Privacy Policy
                  </Link>
                  <Link to="/manage-subscription" className="text-muted-foreground hover:text-foreground transition-colors py-1">
                    Manage subscription
                  </Link>
                </nav>
                <p className="text-center sm:text-right text-muted-foreground/55 text-[10px] font-body">
                  Not affiliated with MetaMask or ConsenSys
                </p>
              </div>
            </div>
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
