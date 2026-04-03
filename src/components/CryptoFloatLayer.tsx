import { motion } from "framer-motion";

/** Floating crypto glyphs + emojis — fixed positions for stable SSR/hydration. */
const FLOATERS: { sym: string; left: string; top: string; size: string; delay: number; dur: number }[] = [
  { sym: "₿", left: "4%", top: "12%", size: "text-2xl", delay: 0, dur: 18 },
  { sym: "Ξ", left: "88%", top: "8%", size: "text-3xl", delay: 0.5, dur: 22 },
  { sym: "🪙", left: "12%", top: "38%", size: "text-xl", delay: 1, dur: 20 },
  { sym: "⚡", left: "72%", top: "22%", size: "text-lg", delay: 0.2, dur: 16 },
  { sym: "💎", left: "52%", top: "6%", size: "text-xl", delay: 1.2, dur: 24 },
  { sym: "🔗", left: "28%", top: "58%", size: "text-lg", delay: 0.8, dur: 19 },
  { sym: "◎", left: "92%", top: "45%", size: "text-2xl", delay: 0.3, dur: 21 },
  { sym: "🌐", left: "8%", top: "72%", size: "text-xl", delay: 1.5, dur: 17 },
  { sym: "◆", left: "64%", top: "68%", size: "text-xl", delay: 0.6, dur: 23 },
  { sym: "📈", left: "42%", top: "42%", size: "text-sm", delay: 2, dur: 25 },
  { sym: "✦", left: "18%", top: "18%", size: "text-lg", delay: 0.4, dur: 20 },
  { sym: "🔶", left: "78%", top: "78%", size: "text-base", delay: 1.1, dur: 18 },
  { sym: "₿", left: "56%", top: "88%", size: "text-lg", delay: 0.9, dur: 22 },
  { sym: "Ξ", left: "34%", top: "82%", size: "text-2xl", delay: 0.7, dur: 19 },
  { sym: "⚙", left: "96%", top: "62%", size: "text-lg", delay: 1.3, dur: 26 },
  { sym: "⬡", left: "2%", top: "52%", size: "text-xl", delay: 0.1, dur: 21 },
  { sym: "🪙", left: "48%", top: "28%", size: "text-base", delay: 1.6, dur: 18 },
  { sym: "✧", left: "84%", top: "32%", size: "text-xl", delay: 0.55, dur: 24 },
];

const CryptoFloatLayer = () => (
  <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
    {FLOATERS.map((f, i) => (
      <motion.span
        key={`${f.sym}-${i}`}
        className={`absolute select-none ${f.size} text-foreground/[0.09] sm:text-foreground/[0.11]`}
        style={{ left: f.left, top: f.top }}
        animate={{
          y: [0, -14, 4, 0],
          x: [0, 6, -4, 0],
          rotate: [0, 8, -6, 0],
          opacity: [0.06, 0.14, 0.08, 0.06],
        }}
        transition={{
          duration: f.dur,
          repeat: Infinity,
          ease: "easeInOut",
          delay: f.delay,
        }}
      >
        {f.sym}
      </motion.span>
    ))}
  </div>
);

export default CryptoFloatLayer;
