import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import WalletInput from "@/components/WalletInput";

type Props = {
  onSubmit: (address: string) => void;
  isLoading: boolean;
};

const TINY = ["₿", "Ξ", "◎", "⚡", "💎", "🔗"];

const AnalysisInputPanel = ({ onSubmit, isLoading }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 280, damping: 22 });
  const springY = useSpring(my, { stiffness: 280, damping: 22 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    mx.set(px * 8);
    my.set(py * -8);
  };
  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const transform = useMotionTemplate`perspective(1000px) rotateX(${springY}deg) rotateY(${springX}deg)`;

  return (
    <motion.div
      ref={ref}
      className="relative mx-auto max-w-2xl lg:max-w-none"
      style={{ transform }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Animated chroma ring */}
      <div className="analysis-ring rounded-[1.35rem] p-[2px] sm:rounded-2xl">
        <div className="relative overflow-hidden rounded-[1.25rem] bg-[hsl(222_28%_6%)] shadow-[0_32px_64px_-20px_rgba(15,23,42,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-[1.35rem]">
          {/* Hex + grid texture */}
          <div className="pointer-events-none absolute inset-0 bg-hex-mesh opacity-[0.12]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-40" />

          {/* CRT scanline */}
          <motion.div
            className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[45%] bg-gradient-to-b from-primary/[0.07] via-transparent to-transparent"
            animate={{ y: ["-20%", "120%"] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
          />

          {/* Edge glow */}
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_60px_-20px_hsl(var(--primary)/0.15)]" />

          {/* Corner brackets */}
          <span className="pointer-events-none absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-primary/50 sm:left-4 sm:top-4" />
          <span className="pointer-events-none absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-primary/50 sm:right-4 sm:top-4" />
          <span className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-primary/40 sm:bottom-4 sm:left-4" />
          <span className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-primary/40 sm:bottom-4 sm:right-4" />

          <div className="relative z-[3] p-5 sm:p-7 md:p-8">
            {/* Ticker strip */}
            <div className="mb-5 flex items-center gap-2 overflow-hidden rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:text-[11px]">
              <motion.span
                className="flex shrink-0 gap-3 text-primary/90"
                animate={{ x: [0, -120] }}
                transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              >
                {[...TINY, ...TINY, ...TINY].map((c, i) => (
                  <span key={i}>{c}</span>
                ))}
              </motion.span>
            </div>

            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/80">
                  Analysis input
                </p>
                <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-[1.75rem]">
                  Wallet address
                </h2>
              </div>
              <p className="max-w-md font-body text-[13px] leading-relaxed text-zinc-400 sm:text-right sm:text-sm">
                Paste any 0x address. We never ask for a seed phrase or an on-chain signature.
              </p>
            </div>

            <div className="relative mt-6">
              <motion.div
                className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              />
              <WalletInput onSubmit={onSubmit} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisInputPanel;
