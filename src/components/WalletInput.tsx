import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Shield } from "lucide-react";
import { isValidEthAddress } from "@/lib/scoring";

interface WalletInputProps {
  onSubmit: (address: string) => void;
  isLoading: boolean;
}

const WalletInput = ({ onSubmit, isLoading }: WalletInputProps) => {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) {
      setError("Please enter a wallet address");
      return;
    }
    if (!isValidEthAddress(trimmed)) {
      setError("Invalid Ethereum address (0x...)");
      return;
    }
    setError("");
    onSubmit(trimmed);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="glass-card rounded-2xl p-1.5 transition-all focus-within:border-primary/30 focus-within:shadow-[0_0_40px_hsl(28_92%_54%/0.1)]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError("");
            }}
            placeholder="Enter wallet address (0x...)"
            className="flex-1 bg-transparent px-5 py-4 text-foreground placeholder:text-muted-foreground/50 font-body text-sm md:text-base outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-display font-semibold text-sm transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 mr-1"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {isLoading ? "Scanning..." : "Check"}
          </button>
        </div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-destructive text-xs mt-3 text-center font-body"
        >
          {error}
        </motion.p>
      )}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        <Shield className="w-3 h-3 text-muted-foreground/40" />
        <p className="text-muted-foreground/40 text-[11px] font-body">
          No wallet signatures or private keys required. Read-only analysis.
        </p>
      </div>
    </motion.form>
  );
};

export default WalletInput;
