import { motion } from "framer-motion";

/** Quiet background: two slow neutrals + faint grid. No rainbow orbs. */
const HomeBackdrop = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-home-aurora" />

      <motion.div
        className="absolute -left-[10%] top-[0%] h-[min(85vw,420px)] w-[min(85vw,420px)] rounded-full bg-gradient-to-br from-orange-200/40 to-transparent blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, 15, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[5%] bottom-[5%] h-[min(70vw,360px)] w-[min(70vw,360px)] rounded-full bg-gradient-to-tl from-slate-300/35 to-transparent blur-3xl"
        animate={{ x: [0, -18, 0], y: [0, -12, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="absolute inset-0 bg-grid-fine" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_25%,transparent_0%,hsl(222_16%_97%/0.92)_75%)]" />
      <div className="absolute inset-0 bg-noise opacity-[0.028]" />
    </div>
  );
};

export default HomeBackdrop;
