import { motion } from "framer-motion";
import type { ScoringResult } from "@/lib/scoring";
import { Shield, Activity, Clock, Globe, TrendingUp } from "lucide-react";

interface ScoreDisplayProps {
  result: ScoringResult;
}

const tierConfig = {
  High: {
    gradient: "from-green-400 to-emerald-500",
    glow: "0 0 80px hsl(142 70% 45% / 0.15), 0 0 30px hsl(142 70% 45% / 0.1)",
    label: "Strong Candidate",
    textClass: "text-green-400",
    bgClass: "bg-green-400/10 border-green-400/20",
  },
  Medium: {
    gradient: "from-primary to-yellow-400",
    glow: "0 0 80px hsl(28 92% 54% / 0.15), 0 0 30px hsl(28 92% 54% / 0.1)",
    label: "Moderate Chance",
    textClass: "text-primary",
    bgClass: "bg-primary/10 border-primary/20",
  },
  Low: {
    gradient: "from-red-400 to-orange-400",
    glow: "0 0 80px hsl(0 70% 50% / 0.12), 0 0 30px hsl(0 70% 50% / 0.08)",
    label: "Needs Improvement",
    textClass: "text-red-400",
    bgClass: "bg-red-400/10 border-red-400/20",
  },
};

const ScoreDisplay = ({ result }: ScoreDisplayProps) => {
  const config = tierConfig[result.tier];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Score Card */}
      <div
        className="glass-card rounded-2xl p-8 md:p-10 text-center relative overflow-hidden"
        style={{ boxShadow: config.glow }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/[0.03] rounded-full blur-3xl" />

        <div className="relative">
          <p className="text-muted-foreground/70 font-body text-xs mb-1 uppercase tracking-[0.2em]">
            Eligibility Score
          </p>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.15, stiffness: 120, damping: 12 }}
            className="relative inline-block my-4"
          >
            <span
              className={`text-7xl md:text-8xl font-display font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent leading-none`}
            >
              {result.score}
            </span>
            <span className="text-muted-foreground/40 text-xl md:text-2xl font-display font-light ml-1">
              /100
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-display font-semibold border ${config.bgClass} ${config.textClass}`}
            >
              <TrendingUp className="w-3 h-3" />
              {result.tier} — {config.label}
            </span>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            {[
              { icon: Activity, label: "Transactions", value: result.totalTransactions.toLocaleString() },
              { icon: Clock, label: "Wallet Age", value: result.walletAge },
              { icon: Globe, label: "Networks", value: result.networksUsed.toString() },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="bg-secondary/40 border border-border/50 rounded-xl p-3"
              >
                <stat.icon className="w-3.5 h-3.5 text-muted-foreground/50 mx-auto mb-1.5" />
                <p className="text-foreground font-display font-semibold text-base">{stat.value}</p>
                <p className="text-muted-foreground/60 text-[10px] font-body mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground/50 text-[11px] font-body">
        <Shield className="w-3 h-3" />
        <span className="font-mono tracking-wide">{result.address.slice(0, 8)}...{result.address.slice(-6)}</span>
      </div>
    </motion.div>
  );
};

export default ScoreDisplay;
