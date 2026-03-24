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
      transition={{ delay: 0.3, duration: 0.5 }}
      className="w-full max-w-2xl mx-auto space-y-6"
    >
      {/* Detected Activities */}
      <div>
        <h3 className="font-display font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-400" />
          Detected Activity ({detected.length})
        </h3>
        <div className="space-y-2">
          {detected.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="glass-card rounded-xl p-4 flex items-center gap-3"
            >
              <span className="text-xl">{categoryIcons[activity.category]}</span>
              <div className="flex-1">
                <p className="font-display font-medium text-foreground text-sm">{activity.label}</p>
                <p className="text-muted-foreground text-xs font-body">{activity.description}</p>
              </div>
              <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded text-xs font-display font-semibold">
                +{activity.weight}pts
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Missing — Boost Your Score */}
      {missing.length > 0 && (
        <div>
          <h3 className="font-display font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
            <X className="w-5 h-5 text-red-400" />
            Boost Your Score ({missing.length} actions)
          </h3>
          <div className="space-y-2">
            {missing.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="glass-card rounded-xl p-4 flex items-center gap-3 border-primary/20"
              >
                <span className="text-xl opacity-50">{categoryIcons[activity.category]}</span>
                <div className="flex-1">
                  <p className="font-display font-medium text-muted-foreground text-sm">{activity.label}</p>
                  {activity.boostAction && (
                    <p className="text-primary text-xs font-body flex items-center gap-1 mt-0.5">
                      <ChevronRight className="w-3 h-3" />
                      {activity.boostAction}
                    </p>
                  )}
                </div>
                {activity.boostLink ? (
                  <a
                    href={activity.boostLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary text-xs font-display font-semibold hover:underline"
                  >
                    Do it <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-muted-foreground/50 text-xs font-display">
                    +{activity.weight}pts
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
