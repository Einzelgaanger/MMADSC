import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import metadropLogo from "@/assets/metadrop-logo.png";

type SplashScreenProps = {
  onComplete: () => void;
};

/**
 * Full-viewport intro: logo scales from small to large, brief hold, then overlay fades out.
 */
const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [visible, setVisible] = useState(true);
  const holdScheduled = useRef(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <AnimatePresence mode="wait" onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="fixed inset-0 pointer-events-none bg-mesh" />
          <div className="fixed inset-0 pointer-events-none bg-dots opacity-[0.3]" />
          <div className="fixed inset-0 pointer-events-none bg-noise" />

          <motion.img
            src={metadropLogo}
            alt="MetaDrop"
            width={400}
            height={400}
            className="relative z-10 object-contain drop-shadow-[0_12px_48px_hsl(24_92%_50%/0.2)] w-[min(78vw,320px)] h-[min(78vw,320px)] sm:w-[min(58vw,380px)] sm:h-[min(58vw,380px)] md:w-96 md:h-96"
            initial={{ scale: 0.1, opacity: 0.25 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 72,
              damping: 9.5,
              mass: 0.62,
            }}
            onAnimationComplete={() => {
              if (holdScheduled.current) return;
              holdScheduled.current = true;
              window.setTimeout(() => setVisible(false), 700);
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
