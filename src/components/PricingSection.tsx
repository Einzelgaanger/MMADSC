import { motion } from "framer-motion";
import {
  Check, ArrowRight, Lock, Bell, Shield,
  BarChart3, Brain, TrendingUp, Globe, Database
} from "lucide-react";
import tierBasicImg from "@/assets/tier-basic.png";
import tierProImg from "@/assets/tier-pro.png";
import tierEliteImg from "@/assets/tier-elite.png";
import tierInsiderImg from "@/assets/tier-insider.png";

export type PricingTier = "basic" | "pro" | "elite" | "insider";

interface PricingSectionProps {
  onSelectTier: (tier: PricingTier) => void;
}

const tiers = [
  {
    id: "basic" as PricingTier,
    name: "Basic",
    price: "$9.99",
    priceNote: "one-time",
    description: "Essential eligibility snapshot with core metrics",
    badge: "Starter",
    image: tierBasicImg,
    popular: false,
    features: [
      { text: "Overall eligibility score", included: true },
      { text: "Activity breakdown (5 metrics)", included: true },
      { text: "Basic tier classification", included: true },
      { text: "Top 3 action items", included: true },
      { text: "Sybil risk flag (pass/fail)", included: true },
      { text: "AI-powered analysis", included: false },
      { text: "Allocation estimates", included: false },
      { text: "Historical comparison", included: false },
      { text: "Linea strategy guide", included: false },
    ],
    ctaText: "Get Basic Report",
  },
  {
    id: "pro" as PricingTier,
    name: "Pro",
    price: "$49.99",
    priceNote: "one-time",
    description: "Deep-dive AI analysis with allocation estimates & full action plan",
    badge: "Most Popular",
    image: tierProImg,
    popular: true,
    features: [
      { text: "Everything in Basic", included: true },
      { text: "14 on-chain activity metrics", included: true },
      { text: "AI executive summary", included: true },
      { text: "Estimated $MASK allocation", included: true },
      { text: "Sybil & farmer risk assessment", included: true },
      { text: "Historical airdrop comparison", included: true },
      { text: "8+ data sources analysis", included: true },
      { text: "Personalized action plan", included: true },
      { text: "Linea strategy deep-dive", included: true },
    ],
    ctaText: "Get Pro Report",
  },
  {
    id: "elite" as PricingTier,
    name: "Elite",
    price: "$99.99",
    priceNote: "one-time",
    description: "Institutional-grade report with Nansen & Dune intelligence",
    badge: "Premium",
    image: tierEliteImg,
    popular: false,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Nansen wallet profiling", included: true },
      { text: "Dune Analytics deep query", included: true },
      { text: "Smart Money / Whale detection", included: true },
      { text: "Multi-chain portfolio breakdown", included: true },
      { text: "DeFi position analysis", included: true },
      { text: "Competitor benchmarking", included: true },
      { text: "Priority action timeline", included: true },
      { text: "Confidence-weighted model", included: true },
    ],
    ctaText: "Get Elite Report",
  },
  {
    id: "insider" as PricingTier,
    name: "Insider",
    price: "$29.99",
    priceNote: "/month",
    description: "Weekly AI-monitored reports with live airdrop intelligence",
    badge: "Subscribe",
    image: tierInsiderImg,
    popular: false,
    features: [
      { text: "Full Pro Report on signup", included: true },
      { text: "Weekly updated reports", included: true },
      { text: "Airdrop signal tracking", included: true },
      { text: "Score change alerts", included: true },
      { text: "Snapshot date predictions", included: true },
      { text: "Market-adjusted estimates", included: true },
      { text: "Weekly action recs", included: true },
      { text: "ConsenSys ecosystem monitor", included: true },
      { text: "Cancel anytime", included: true },
    ],
    ctaText: "Subscribe Now",
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
        <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground">
          Unlock Your Full Report
        </h2>
        <p className="text-muted-foreground text-sm font-body mt-3 max-w-lg mx-auto leading-relaxed">
          Go beyond the free score. Get AI-powered analysis backed by{" "}
          <span className="text-foreground font-medium">8+ premium data sources</span>{" "}
          trusted by 12,400+ wallets.
        </p>
      </div>

      {/* Data sources bar */}
      <div className="flex items-center justify-center gap-2.5 flex-wrap">
        {dataSourceIcons.map((s) => (
          <div
            key={s.name}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-muted-foreground text-[11px] font-body shadow-sm"
          >
            <s.icon className="w-3 h-3" />
            {s.name}
          </div>
        ))}
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {tiers.map((tier, i) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            className={`relative rounded-2xl overflow-hidden transition-all duration-200 ${
              tier.popular
                ? "glass-card-elevated ring-2 ring-primary/25 shadow-xl lg:scale-[1.03]"
                : "glass-card hover:shadow-md"
            }`}
          >
            {/* Popular ribbon */}
            {tier.popular && (
              <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                ★ Popular
              </div>
            )}

            <div className="p-6">
              {/* Tier mascot icon */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={tier.image}
                  alt={`${tier.name} tier`}
                  className="w-12 h-12 object-contain"
                  loading="lazy"
                  width={48}
                  height={48}
                />
                <div>
                  <h3 className="font-display font-bold text-foreground text-lg leading-tight">
                    {tier.name}
                  </h3>
                  <span className="text-muted-foreground text-[11px] font-body">{tier.badge}</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-display font-extrabold text-3xl text-foreground">{tier.price}</span>
                <span className="text-muted-foreground text-sm font-body">{tier.priceNote}</span>
              </div>

              <p className="text-muted-foreground text-[12.5px] font-body leading-relaxed mb-5">
                {tier.description}
              </p>

              {/* CTA */}
              <button
                onClick={() => onSelectTier(tier.id)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display font-semibold text-[13px] transition-all duration-200 mb-5 ${
                  tier.popular
                    ? "bg-primary text-primary-foreground hover:brightness-110 shadow-md shadow-primary/20"
                    : "bg-foreground text-background hover:opacity-90"
                }`}
              >
                {tier.ctaText}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Features */}
              <ul className="space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5">
                    {f.included ? (
                      <div className="w-4 h-4 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 mt-0.5">
                        <Lock className="w-2 h-2 text-muted-foreground/40" />
                      </div>
                    )}
                    <span
                      className={`text-[12px] font-body leading-snug ${
                        f.included ? "text-foreground/80" : "text-muted-foreground/40 line-through"
                      }`}
                    >
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Subscription note */}
              {tier.id === "insider" && (
                <div className="mt-4 pt-3 border-t border-border flex items-center gap-1.5 text-muted-foreground text-[11px] font-body">
                  <Bell className="w-3 h-3" />
                  Weekly email reports · Cancel anytime
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust bar */}
      <div className="flex items-center justify-center gap-6 text-muted-foreground text-[11px] font-body pt-2">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Secure checkout
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
