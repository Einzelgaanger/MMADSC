import { motion } from "framer-motion";
import { Hexagon } from "lucide-react";

const steps = [
  "Querying Etherscan API",
  "Fetching multi-chain data",
  "Analyzing DeFi activity",
  "Scanning Linea network",
  "Computing eligibility score",
];

const ScannerAnimation = () => {
  return (
    <motion.div
      key="scanner"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-36 md:pt-44 flex flex-col items-center max-w-sm mx-auto"
    >
      {/* Animated rings */}
      <div className="relative w-24 h-24 mb-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-primary/15"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border border-primary/25"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-full border border-primary/10"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center"
          >
            <span className="font-display font-bold text-primary text-sm">M</span>
          </motion.div>
        </div>
      </div>

      <h3 className="font-display font-semibold text-base text-foreground mb-1">
        Analyzing Wallet
      </h3>
      <p className="text-muted-foreground/60 text-[12px] font-body mb-8">
        Scanning across multiple data sources
      </p>

      {/* Steps */}
      <div className="space-y-2.5 w-full">
        {steps.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.4 }}
            className="flex items-center gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.4 + 0.25 }}
            >
              <div className="w-5 h-5 rounded border border-primary/20 bg-primary/5 flex items-center justify-center">
                <motion.svg
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: i * 0.4 + 0.3, duration: 0.3 }}
                  className="w-3 h-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                >
                  <motion.path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </div>
            </motion.div>
            <span className="text-muted-foreground text-[12px] font-body">{step}</span>
          </motion.div>
        ))}
      </div>

      {/* Progress */}
      <div className="w-full mt-8 h-[3px] bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, hsl(25 100% 58%), hsl(175 80% 48%))" }}
        />
      </div>
    </motion.div>
  );
};

export default ScannerAnimation;
