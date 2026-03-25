import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { isValidEthAddress } from "@/lib/scoring";

interface WalletInputProps {
  onSubmit: (address: string) => void;
  isLoading: boolean;
}

const WalletInput = ({ onSubmit, isLoading }: WalletInputProps) => {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

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
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div
        className={`relative rounded-xl transition-all duration-300 ${
          focused
            ? "shadow-[0_0_0_1px_hsl(25_100%_58%/0.3),0_0_30px_hsl(25_100%_58%/0.08)]"
            : "shadow-[0_0_0_1px_hsl(230_15%_15%/0.6)]"
        }`}
        style={{ background: "linear-gradient(145deg, hsl(230 22% 9%), hsl(230 22% 6%))" }}
      >
        <div className="flex items-center">
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError("");
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="0x... enter wallet address"
            className="flex-1 bg-transparent px-5 py-4 text-foreground placeholder:text-muted-foreground/40 font-mono text-[13px] outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-display font-semibold text-[13px] transition-all hover:brightness-110 disabled:opacity-40 mr-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isLoading ? "Scanning" : "Check"}</span>
          </button>
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-destructive text-[12px] mt-2.5 text-center font-body"
        >
          {error}
        </motion.p>
      )}
      <p className="text-muted-foreground/30 text-[11px] text-center mt-3 font-body">
        No wallet signatures or private keys required
      </p>
    </form>
  );
};

export default WalletInput;
