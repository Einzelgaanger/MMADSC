import { motion } from "framer-motion";
import { Check, ExternalLink, ChevronRight } from "lucide-react";
import type { WalletActivity } from "@/lib/scoring";

interface ActivityBreakdownProps {
  activities: WalletActivity[];
}

const ActivityBreakdown = ({ activities }: ActivityBreakdownProps) => {
  const detected = activities.filter((a) => a.detected);
  const missing = activities.filter((a) => !a.detected);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-[15px] text-foreground">Activity Breakdown</h2>
        <span className="text-muted-foreground/40 text-[11px] font-mono">
          {detected.length}/{activities.length}
        </span>
      </div>

      {/* Detected */}
      {detected.length > 0 && (
        <div className="mb-5">
          <p className="text-[11px] font-body text-muted-foreground/50 uppercase tracking-wider mb-2">Detected</p>
          <div className="space-y-1">
            {detected.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.03 }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-muted/30 border border-border/30 hover:border-border/50 transition-colors group"
              >
                <div className="w-5 h-5 rounded border border-green-400/20 bg-green-400/5 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-medium text-foreground/90 text-[13px]">{activity.label}</p>
                </div>
                <span className="text-green-400/70 text-[11px] font-mono shrink-0">
                  +{activity.weight}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Missing */}
      {missing.length > 0 && (
        <div>
          <p className="text-[11px] font-body text-muted-foreground/50 uppercase tracking-wider mb-2">Boost your score</p>
          <div className="space-y-1">
            {missing.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.03 }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border/20 hover:border-primary/15 transition-colors group"
              >
                <div className="w-5 h-5 rounded border border-border/30 flex items-center justify-center shrink-0">
                  <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-medium text-muted-foreground/60 text-[13px]">{activity.label}</p>
                  {activity.boostAction && (
                    <p className="text-primary/50 text-[11px] font-body mt-0.5">{activity.boostAction}</p>
                  )}
                </div>
                {activity.boostLink ? (
                  <a
                    href={activity.boostLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary/60 text-[11px] font-display font-medium hover:text-primary transition-colors shrink-0"
                  >
                    Go <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground/20 text-[11px] font-mono shrink-0">
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
