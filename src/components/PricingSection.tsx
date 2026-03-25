import { motion } from "framer-motion";
import {
  FileText, Zap, Crown, RefreshCw, Check, ArrowRight,
  BarChart3, Shield, Sparkles, Brain, TrendingUp, Globe,
  Database, Lock, Bell, CalendarCheck
} from "lucide-react";

export type PricingTier = "basic" | "pro" | "elite" | "insider";

interface PricingSectionProps {
  onSelectTier: (tier: PricingTier) => void;
}

const tiers = [
  {
    id: "basic" as PricingTier,
    name: "Basic Report",
    price: "$9.99",
    priceNote: "one-time",
    description: "Essential eligibility snapshot with core metrics",
    badge: "Starter",
    badgeClass: "tier-badge-basic",
    icon: FileText,
    popular: false,
    features: [
      { text: "Overall eligibility score", included: true },
      { text: "Activity breakdown (5 core metrics)", included: true },
      { text: "Basic tier classification", included: true },
      { text: "Top 3 action items", included: true },
      { text: "Sybil risk flag (pass/fail)", included: true },
      { text: "AI-powered analysis", included: false },
      { text: "Allocation estimates", included: false },
      { text: "Historical airdrop comparison", included: false },
      { text: "Linea strategy guide", included: false },
    ],
    accentColor: "hsl(210 100% 50%)",
  },
  {
    id: "pro" as PricingTier,
    name: "Pro Report",
    price: "$49.99",
    priceNote: "one-time",
    description: "Deep-dive analysis with AI insights & allocation estimates",
    badge: "Most Popular",
    badgeClass: "tier-badge-pro",
    icon: Zap,
    popular: true,
    features: [
      { text: "Everything in Basic", included: true },
      { text: "14 on-chain activity metrics", included: true },
      { text: "AI-powered executive summary", included: true },
      { text: "Estimated $MASK allocation range", included: true },
      { text: "Sybil & farmer risk assessment", included: true },
      { text: "Historical airdrop comparison", included: true },
      { text: "8+ data sources (Etherscan, Alchemy, Moralis…)", included: true },
      { text: "Personalized action plan (8+ items)", included: true },
      { text: "Linea strategy deep-dive", included: true },
    ],
    accentColor: "hsl(25 95% 53%)",
  },
  {
    id: "elite" as PricingTier,
    name: "Elite Report",
    price: "$99.99",
    priceNote: "one-time",
    description: "Institutional-grade analysis with Nansen & Dune intelligence",
    badge: "Premium",
    badgeClass: "tier-badge-elite",
    icon: Crown,
    popular: false,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Nansen wallet profiling & labels", included: true },
      { text: "Dune Analytics deep query", included: true },
      { text: "Smart Money / Whale detection", included: true },
      { text: "Multi-chain portfolio breakdown", included: true },
      { text: "DeFi position analysis", included: true },
      { text: "Competitor wallet benchmarking", included: true },
      { text: "Priority action timeline", included: true },
      { text: "Confidence-weighted allocation model", included: true },
    ],
    accentColor: "hsl(280 80% 55%)",
  },
  {
    id: "insider" as PricingTier,
    name: "Insider Weekly",
    price: "$29.99",
    priceNote: "/month",
    description: "Weekly AI-monitored reports with live airdrop intelligence",
    badge: "Subscription",
    badgeClass: "tier-badge-insider",
    icon: RefreshCw,
    popular: false,
    features: [
      { text: "Full Pro Report on signup", included: true },
      { text: "Weekly updated AI report via email", included: true },
      { text: "Token news & airdrop signal tracking", included: true },
      { text: "Score change alerts", included: true },
      { text: "Snapshot date predictions", included: true },
      { text: "Market-adjusted allocation estimates", included: true },
      { text: "Weekly action recommendations", included: true },
      { text: "ConsenSys ecosystem monitor", included: true },
      { text: "Cancel anytime", included: true },
    ],
    accentColor: "hsl(152 69% 41%)",
  },
];

const dataSourceIcons = [
  { name: "Etherscan", icon: Database },
  { name: "Alchemy", icon: Globe },
  { name: "Moralis", icon: TrendingUp },
  { name: "Nansen", icon: Shield },
  { name: "Dune", icon: BarChart3 },
  { name: "The Graph", icon: Brain },
];

const PricingSection = ({ onSelectTier }: PricingSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="w-full max-w-5xl mx-auto space-y-8"
    >
      {/* Section header */}
      <div className="text-center">
        <h2 className="font-display font-bold text-xl md:text-2xl text-foreground">
          Unlock Your Full Report
        </h2>
        <p className="text-muted-foreground text-sm font-body mt-2 max-w-lg mx-auto">
          Go beyond the free score. Get AI-powered analysis backed by{" "}
          <span className="text-foreground font-medium">8+ premium data sources</span>.
        </p>
      </div>

      {/* Data sources bar */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {dataSourceIcons.map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary border border-border text-muted-foreground text-[11px] font-body"
          >
            <s.icon className="w-3 h-3" />
            {s.name}
          </div>
        ))}
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            className={`relative rounded-xl overflow-hidden transition-all hover:shadow-lg ${
              tier.popular
                ? "glass-card-elevated ring-2 ring-primary/30 scale-[1.02]"
                : "glass-card hover:border-border"
            }`}
          >
            {/* Top accent */}
            <div className="h-1 w-full" style={{ background: tier.accentColor }} />

            <div className="p-5">
              {/* Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-display font-semibold border ${tier.badgeClass}`}>
                  <tier.icon className="w-3 h-3" />
                  {tier.badge}
                </span>
                {tier.id === "insider" && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-body">
                    <Bell className="w-3 h-3" />
                    Weekly
                  </span>
                )}
              </div>

              {/* Name & Price */}
              <h3 className="font-display font-bold text-foreground text-base">
                {tier.name}
              </h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-display font-bold text-2xl text-foreground">{tier.price}</span>
                <span className="text-muted-foreground text-xs font-body">{tier.priceNote}</span>
              </div>
              <p className="text-muted-foreground text-[12px] font-body mt-2 leading-relaxed">
                {tier.description}
              </p>

              {/* Features */}
              <ul className="mt-4 space-y-2">
                {tier.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2">
                    {f.included ? (
                      <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: tier.accentColor }} />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-muted-foreground/30 mt-0.5 shrink-0" />
                    )}
                    <span
                      className={`text-[12px] font-body leading-snug ${
                        f.included ? "text-foreground/80" : "text-muted-foreground/40"
                      }`}
                    >
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => onSelectTier(tier.id)}
                className={`mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-display font-semibold text-[13px] transition-all ${
                  tier.popular
                    ? "bg-primary text-primary-foreground hover:brightness-110 shadow-sm"
                    : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                }`}
              >
                {tier.id === "insider" ? "Subscribe" : "Get Report"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust bar */}
      <div className="flex items-center justify-center gap-6 text-muted-foreground text-[11px] font-body pt-2">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Secure payment
        </div>
        <span className="w-px h-3 bg-border" />
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" />
          Read-only wallet access
        </div>
        <span className="w-px h-3 bg-border" />
        <span>12,400+ reports generated</span>
      </div>
    </motion.div>
  );
};

export default PricingSection;
