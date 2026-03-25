import { motion } from "framer-motion";
import { Check, X, ExternalLink, ChevronRight } from "lucide-react";
import type { WalletActivity } from "@/lib/scoring";

interface ActivityBreakdownProps {
  activities: WalletActivity[];
}

const categoryIcons: Record<string, string> = {
  swap: "🔄",
  bridge: "🌉",
  staking: "📈",
  governance: "🗳️",
  nft: "🖼️",
  usage: "⚡",
};

const ActivityBreakdown = ({ activities }: ActivityBreakdownProps) => {
  const detected = activities.filter((a) => a.detected);
  const missing = activities.filter((a) => !a.detected);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Section header */}
      <div className="flex items-center gap-3">
        <h2 className="font-display font-bold text-lg text-foreground">Activity Breakdown</h2>
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-muted-foreground/50 text-[11px] font-body">
          {detected.length}/{activities.length} detected
        </span>
      </div>

      {/* Detected Activities */}
      {detected.length > 0 && (
        <div>
          <h3 className="font-display font-medium text-sm text-foreground/70 mb-2.5 flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-green-400/10 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-400" />
            </div>
            Detected ({detected.length})
          </h3>
          <div className="space-y-1.5">
            {detected.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 hover:border-green-400/20 transition-colors"
              >
                <span className="text-base">{categoryIcons[activity.category]}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-medium text-foreground text-sm">{activity.label}</p>
                  <p className="text-muted-foreground/60 text-[11px] font-body truncate">{activity.description}</p>
                </div>
                <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded-md text-[11px] font-display font-semibold shrink-0">
                  +{activity.weight}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Missing — Boost Your Score */}
      {missing.length > 0 && (
        <div>
          <h3 className="font-display font-medium text-sm text-foreground/70 mb-2.5 flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
              <ChevronRight className="w-3 h-3 text-primary" />
            </div>
            Actions to Boost Score ({missing.length})
          </h3>
          <div className="space-y-1.5">
            {missing.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.04 }}
                className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 border-primary/10 hover:border-primary/25 transition-colors"
              >
                <span className="text-base opacity-40">{categoryIcons[activity.category]}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-medium text-muted-foreground text-sm">{activity.label}</p>
                  {activity.boostAction && (
                    <p className="text-primary/70 text-[11px] font-body flex items-center gap-1 mt-0.5">
                      {activity.boostAction}
                    </p>
                  )}
                </div>
                {activity.boostLink ? (
                  <a
                    href={activity.boostLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary text-[11px] font-display font-semibold hover:underline shrink-0"
                  >
                    Go <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground/30 text-[11px] font-display shrink-0">
                    +{activity.weight}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ActivityBreakdown;
