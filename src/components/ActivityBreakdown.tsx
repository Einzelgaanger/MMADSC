import { motion } from "framer-motion";
import { Check, ExternalLink, ChevronRight, Lock, Eye } from "lucide-react";
import type { WalletActivity } from "@/lib/scoring";

interface ActivityBreakdownProps {
  activities: WalletActivity[];
}

const ActivityBreakdown = ({ activities }: ActivityBreakdownProps) => {
  const detected = activities.filter((a) => a.detected);
  const missing = activities.filter((a) => !a.detected);
  const visibleDetected = detected.slice(0, 3);
  const hiddenDetected = detected.slice(3);
  const visibleMissing = missing.slice(0, 2);
  const hiddenMissing = missing.slice(2);

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
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[11px] font-mono">
            {detected.length}/{activities.length}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-primary font-display bg-primary/8 border border-primary/15 px-2 py-0.5 rounded-full">
            <Eye className="w-3 h-3" />
            Preview
          </span>
        </div>
      </div>

      {/* Detected — show first 3, blur rest */}
      {detected.length > 0 && (
        <div className="mb-5">
          <p className="text-[11px] font-body text-muted-foreground uppercase tracking-wider mb-2">Detected</p>
          <div className="space-y-1">
            {visibleDetected.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.03 }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-card border border-border hover:border-border transition-colors group"
              >
                <div className="w-5 h-5 rounded border border-green-500/20 bg-green-500/5 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-medium text-foreground/90 text-[13px]">{activity.label}</p>
                </div>
                <span className="text-green-600/70 text-[11px] font-mono shrink-0">
                  +{activity.weight}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Blurred detected items */}
          {hiddenDetected.length > 0 && (
            <div className="relative mt-1">
              <div className="blur-content space-y-1">
                {hiddenDetected.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-card border border-border"
                  >
                    <div className="w-5 h-5 rounded border border-green-500/20 bg-green-500/5 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-medium text-foreground/90 text-[13px]">{activity.label}</p>
                    </div>
                    <span className="text-green-600/70 text-[11px] font-mono shrink-0">+{activity.weight}</span>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2 bg-card/95 border border-border shadow-sm px-4 py-2 rounded-lg">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  <span className="text-foreground text-[12px] font-display font-medium">
                    +{hiddenDetected.length} more detected — unlock with report
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Missing — show first 2, blur rest */}
      {missing.length > 0 && (
        <div>
          <p className="text-[11px] font-body text-muted-foreground uppercase tracking-wider mb-2">Boost your score</p>
          <div className="space-y-1">
            {visibleMissing.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.03 }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border hover:border-primary/20 transition-colors group bg-card"
              >
                <div className="w-5 h-5 rounded border border-border flex items-center justify-center shrink-0">
                  <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-medium text-muted-foreground text-[13px]">{activity.label}</p>
                  {activity.boostAction && (
                    <p className="text-primary/60 text-[11px] font-body mt-0.5">{activity.boostAction}</p>
                  )}
                </div>
                {activity.boostLink ? (
                  <a
                    href={activity.boostLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary text-[11px] font-display font-medium hover:text-primary/80 transition-colors shrink-0"
                  >
                    Go <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground/30 text-[11px] font-mono shrink-0">
                    +{activity.weight}
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Blurred missing items */}
          {hiddenMissing.length > 0 && (
            <div className="relative mt-1">
              <div className="blur-content space-y-1">
                {hiddenMissing.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-card"
                  >
                    <div className="w-5 h-5 rounded border border-border flex items-center justify-center shrink-0">
                      <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-medium text-muted-foreground text-[13px]">{activity.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2 bg-card/95 border border-border shadow-sm px-4 py-2 rounded-lg">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  <span className="text-foreground text-[12px] font-display font-medium">
                    +{hiddenMissing.length} boost actions — unlock full plan
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Teaser: blurred advanced insights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 relative"
      >
        <div className="blur-content-light glass-card rounded-xl p-5">
          <h3 className="font-display font-semibold text-[14px] text-foreground mb-3">Advanced Insights</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground font-body uppercase">Est. Allocation</p>
              <p className="font-display font-bold text-lg text-foreground">$4,200 – $12,500</p>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground font-body uppercase">Sybil Risk</p>
              <p className="font-display font-bold text-lg text-green-600">Low Risk</p>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground font-body uppercase">Nansen Profile</p>
              <p className="font-display font-bold text-sm text-foreground">Smart Money</p>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground font-body uppercase">DeFi Depth</p>
              <p className="font-display font-bold text-lg text-foreground">7 Protocols</p>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 bg-card/95 border border-border shadow-lg px-6 py-4 rounded-xl">
            <Lock className="w-5 h-5 text-primary" />
            <span className="text-foreground text-[13px] font-display font-semibold">
              Unlock Advanced Analytics
            </span>
            <span className="text-muted-foreground text-[11px] font-body">
              Available in Pro, Elite & Insider reports
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ActivityBreakdown;
