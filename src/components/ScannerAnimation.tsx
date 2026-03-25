import { motion } from "framer-motion";
import { Hexagon } from "lucide-react";

const steps = [
  "Connecting to Etherscan API...",
  "Fetching transaction history...",
  "Scanning multi-chain activity...",
  "Analyzing DeFi interactions...",
  "Checking Linea network...",
  "Calculating eligibility score...",
];

const ScannerAnimation = () => {
  return (
    <motion.div
      key="scanner"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 md:pt-40 flex flex-col items-center"
    >
      {/* Animated hex logo */}
      <div className="relative mb-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 flex items-center justify-center"
        >
          <Hexagon className="w-20 h-20 text-primary/30" strokeWidth={1} />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Hexagon className="w-12 h-12 text-primary/60" strokeWidth={1.5} />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-primary"
          />
        </div>
      </div>

      <h3 className="font-display font-bold text-xl text-foreground mb-2">
        Analyzing Wallet
      </h3>
      <p className="text-muted-foreground text-sm font-body mb-8">
        Scanning on-chain data across multiple sources
      </p>

      {/* Animated steps */}
      <div className="space-y-2 w-full max-w-xs">
        {steps.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.35 }}
            className="flex items-center gap-2.5"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.35 + 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"
            />
            <span className="text-muted-foreground text-xs font-body">{step}</span>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs mt-8 h-1 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
        />
      </div>
    </motion.div>
  );
};

export default ScannerAnimation;
