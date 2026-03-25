import { motion } from "framer-motion";
import type { ScoringResult } from "@/lib/scoring";
import { Activity, Clock, Globe, TrendingUp, Lock } from "lucide-react";

interface ScoreDisplayProps {
  result: ScoringResult;
}

const tierConfig = {
  High: {
    color: "hsl(152 69% 41%)",
    label: "Strong Candidate",
    badgeBg: "bg-green-50 border-green-200 text-green-700",
  },
  Medium: {
    color: "hsl(25 95% 53%)",
    label: "Moderate Chance",
    badgeBg: "bg-orange-50 border-orange-200 text-orange-700",
  },
  Low: {
    color: "hsl(0 72% 51%)",
    label: "Needs Improvement",
    badgeBg: "bg-red-50 border-red-200 text-red-700",
  },
};

const ScoreDisplay = ({ result }: ScoreDisplayProps) => {
  const config = tierConfig[result.tier];

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const progress = (result.score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass-card-elevated rounded-2xl p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Circular score */}
          <div className="relative shrink-0">
            <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
              <circle cx="70" cy="70" r={radius} fill="none" stroke="hsl(220 14% 92%)" strokeWidth="6" />
              <motion.circle
                cx="70" cy="70" r={radius}
                fill="none"
                stroke={config.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - progress }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
                className="font-display font-bold text-4xl text-foreground leading-none"
              >
                {result.score}
              </motion.span>
              <span className="text-muted-foreground text-[11px] font-body mt-0.5">out of 100</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-display font-semibold border ${config.badgeBg}`}>
                <TrendingUp className="w-3 h-3" />
                {result.tier} — {config.label}
              </span>
            </motion.div>

            <p className="text-muted-foreground text-[12px] font-body mt-3 leading-relaxed max-w-sm">
              Based on your on-chain activity across {result.networksUsed} networks,
              {" "}{result.totalTransactions.toLocaleString()} transactions over {result.walletAge}.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-4 justify-center md:justify-start">
              {[
                { icon: Activity, label: "Txns", value: result.totalTransactions.toLocaleString() },
                { icon: Clock, label: "Age", value: result.walletAge },
                { icon: Globe, label: "Chains", value: result.networksUsed.toString() },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 + i * 0.06 }}
                  className="flex items-center gap-1.5"
                >
                  <stat.icon className="w-3 h-3 text-muted-foreground/50" />
                  <span className="text-foreground text-[12px] font-display font-medium">{stat.value}</span>
                  <span className="text-muted-foreground text-[11px] font-body">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Teaser locked metrics */}
        <div className="mt-6 pt-5 border-t border-border grid grid-cols-3 gap-3">
          {[
            { label: "Est. Allocation", value: "$? — $?" },
            { label: "Sybil Score", value: "●●●●" },
            { label: "Nansen Label", value: "●●●●●●" },
          ].map((item) => (
            <div key={item.label} className="relative bg-secondary/60 rounded-lg p-3 text-center">
              <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">{item.label}</p>
              <p className="font-display font-bold text-sm text-muted-foreground/30 mt-1 blur-content-light">{item.value}</p>
              <Lock className="absolute top-2 right-2 w-3 h-3 text-muted-foreground/30" />
            </div>
          ))}
        </div>

        {/* Address bar */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="font-mono text-muted-foreground text-[11px]">
              {result.address.slice(0, 10)}...{result.address.slice(-8)}
            </span>
          </div>
          <span className="text-muted-foreground/50 text-[10px] font-body">
            Analyzed just now
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ScoreDisplay;
