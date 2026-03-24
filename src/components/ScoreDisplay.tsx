import { motion } from "framer-motion";
import type { ScoringResult } from "@/lib/scoring";
import { Shield, Activity, Clock, Globe } from "lucide-react";

interface ScoreDisplayProps {
  result: ScoringResult;
}

const tierConfig = {
  High: {
    gradient: "from-green-400 to-emerald-500",
    glow: "0 0 60px hsl(142 70% 45% / 0.4)",
    label: "Strong Candidate",
    textClass: "text-green-400",
  },
  Medium: {
    gradient: "from-primary to-yellow-400",
    glow: "var(--glow-primary)",
    label: "Moderate Chance",
    textClass: "text-primary",
  },
  Low: {
    gradient: "from-red-400 to-orange-400",
    glow: "0 0 60px hsl(0 70% 50% / 0.3)",
    label: "Needs Improvement",
    textClass: "text-red-400",
  },
};

const ScoreDisplay = ({ result }: ScoreDisplayProps) => {
  const config = tierConfig[result.tier];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Score Card */}
      <div
        className="glass-card rounded-3xl p-8 text-center relative overflow-hidden"
        style={{ boxShadow: config.glow }}
      >
        <div className="absolute inset-0 bg-gradient-to-br opacity-5" />
        
        <p className="text-muted-foreground font-body text-sm mb-2 uppercase tracking-widest">
          Eligibility Score
        </p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2, stiffness: 100 }}
          className="relative inline-block"
        >
          <span
            className={`text-8xl font-display font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
          >
            {result.score}
          </span>
          <span className="text-muted-foreground text-2xl font-display">/100</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span
            className={`inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-display font-semibold ${config.textClass} bg-secondary`}
          >
            {result.tier} — {config.label}
          </span>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: Activity, label: "Transactions", value: result.totalTransactions.toLocaleString() },
            { icon: Clock, label: "Wallet Age", value: result.walletAge },
            { icon: Globe, label: "Networks", value: result.networksUsed.toString() },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="bg-secondary/50 rounded-xl p-3"
            >
              <stat.icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-foreground font-display font-semibold text-lg">{stat.value}</p>
              <p className="text-muted-foreground text-xs font-body">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Address */}
      <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground text-xs font-body">
        <Shield className="w-3 h-3" />
        <span className="font-mono">{result.address.slice(0, 8)}...{result.address.slice(-6)}</span>
      </div>
    </motion.div>
  );
};

export default ScoreDisplay;
