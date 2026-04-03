import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
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
      setError("Enter a wallet address");
      return;
    }
    if (!isValidEthAddress(trimmed)) {
      setError("Invalid address — use 0x…");
      return;
    }
    setError("");
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="input-panel-well rounded-lg p-1 sm:p-1.5">
        <div
          className={[
            "relative overflow-hidden rounded-md border transition-[border-color,box-shadow] duration-300",
            focused
              ? "border-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.35),0_0_28px_-6px_hsl(var(--primary)/0.35)]"
              : "border-zinc-500/70",
          ].join(" ")}
        >
          {/* Soft pulse when idle */}
          {!focused && !isLoading && (
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-md bg-primary/[0.04]"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          <div className="relative flex flex-col sm:flex-row sm:items-stretch">
            <label className="sr-only" htmlFor="wallet-address">
              Ethereum address
            </label>
            <div className="relative min-w-0 flex-1">
              <div className="absolute left-4 top-2.5 z-[1] font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500 sm:left-5">
                Ethereum address
              </div>
              <div className="absolute left-4 top-[1.85rem] z-[1] font-mono text-[9px] uppercase tracking-[0.18em] text-primary/70 sm:left-5">
                Address
              </div>
              <input
                id="wallet-address"
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setError("");
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="0x0000…0000"
                className="min-h-[64px] w-full bg-transparent pb-3 pl-4 pr-4 pt-[2.65rem] font-mono text-[13px] text-zinc-50 outline-none placeholder:text-zinc-600 sm:min-h-[66px] sm:pb-3.5 sm:pl-5 sm:pr-5 sm:pt-[2.75rem] sm:text-[14px]"
                disabled={isLoading}
              />
            </div>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={isLoading ? {} : { scale: 1.01 }}
              whileTap={isLoading ? {} : { scale: 0.98 }}
              className="relative flex min-h-[52px] shrink-0 items-center justify-center gap-2 overflow-hidden border-t border-zinc-600/90 bg-primary px-7 font-body text-[13px] font-semibold tracking-wide text-primary-foreground sm:min-h-0 sm:min-w-[152px] sm:border-l sm:border-t-0"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent"
                aria-hidden
              />
              {isLoading ? (
                <>
                  <Loader2 className="relative h-4 w-4 animate-spin" aria-hidden />
                  <span className="relative">Working</span>
                </>
              ) : (
                <>
                  <span className="relative">Analyze</span>
                  <ArrowRight className="relative h-4 w-4 opacity-90" aria-hidden />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2.5 font-body text-[12px] text-red-400"
          role="alert"
        >
          {error}
        </motion.p>
      )}
      <p className="mt-3 font-body text-[11px] leading-relaxed text-zinc-500">
        Read-only. No seed phrase, no signatures, no wallet connect.
      </p>
    </form>
  );
};

export default WalletInput;
