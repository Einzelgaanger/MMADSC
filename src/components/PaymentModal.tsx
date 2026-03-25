import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Shield, Loader2, FileText, X, CheckCircle, AlertCircle, Sparkles, TrendingUp, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateReport } from "@/lib/generatePDF";
import type { ScoringResult } from "@/lib/scoring";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ScoringResult;
}

type Step = "email" | "processing" | "success" | "error";

const PaymentModal = ({ isOpen, onClose, result }: PaymentModalProps) => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [errorMsg, setErrorMsg] = useState("");

  const handlePurchase = async () => {
    if (!email.trim() || !email.includes("@")) return;

    setStep("processing");

    try {
      const { data, error } = await supabase.functions.invoke("initialize-payment", {
        body: { email, walletAddress: result.address },
      });

      if (error || !data?.authorization_url) {
        throw new Error(error?.message || "Failed to initialize payment");
      }

      const reference = data.reference;
      const paymentWindow = window.open(data.authorization_url, "_blank", "width=600,height=700");

      const pollInterval = setInterval(async () => {
        try {
          const { data: reportData, error: reportError } = await supabase.functions.invoke("generate-report", {
            body: { reference, walletAddress: result.address, email },
          });

          if (reportError) return;

          if (reportData?.report) {
            clearInterval(pollInterval);
            if (paymentWindow && !paymentWindow.closed) paymentWindow.close();
            generateReport(reportData.report);
            setStep("success");
          }
        } catch {
          // Still polling
        }
      }, 3000);

      setTimeout(() => {
        clearInterval(pollInterval);
        if (step === "processing") {
          setStep("error");
          setErrorMsg("Payment verification timed out. If you completed payment, please contact support.");
        }
      }, 300000);
    } catch (err) {
      console.error("Payment error:", err);
      setStep("error");
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  const handleClose = () => {
    setStep("email");
    setEmail("");
    setErrorMsg("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={handleClose} />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative glass-card rounded-2xl p-7 max-w-md w-full border-primary/10"
          style={{ boxShadow: "0 0 80px hsl(28 92% 54% / 0.08), 0 25px 50px -12px hsl(222 47% 5% / 0.5)" }}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted-foreground/50 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {step === "email" && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="bg-primary/15 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 border border-primary/10">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  Premium Eligibility Report
                </h3>
                <p className="text-muted-foreground/70 text-[13px] font-body mt-1.5 leading-relaxed max-w-sm mx-auto">
                  AI-powered analysis with personalized action plan and historical airdrop comparison.
                </p>
              </div>

              {/* What's included */}
              <div className="bg-secondary/40 border border-border/50 rounded-xl p-4 space-y-2">
                {[
                  { icon: TrendingUp, text: "Real on-chain data via Etherscan & Alchemy" },
                  { icon: Sparkles, text: "AI-powered personalized recommendations" },
                  { icon: Shield, text: "Sybil risk & airdrop farmer detection" },
                  { icon: BarChart3, text: "Estimated allocation range (Low/Mid/High)" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-2.5">
                    <item.icon className="w-3.5 h-3.5 text-primary/70 shrink-0 mt-0.5" />
                    <span className="text-foreground/70 text-xs font-body">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Email input */}
              <div>
                <label className="text-muted-foreground/60 text-[11px] font-body block mb-1.5 uppercase tracking-wider">
                  Email for report delivery
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-secondary/60 border border-border/50 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/40 font-body text-sm outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30 transition-all"
                />
              </div>

              <button
                onClick={handlePurchase}
                disabled={!email.trim() || !email.includes("@")}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold text-sm transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Get Full Report — $14.99
              </button>

              <div className="flex items-center justify-center gap-1.5 text-muted-foreground/40 text-[10px] font-body">
                <Shield className="w-3 h-3" />
                <span>Secure payment via Paystack • Instant PDF</span>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="text-center py-6 space-y-4">
              <div className="relative mx-auto w-14 h-14">
                <Loader2 className="w-14 h-14 text-primary/30 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h3 className="font-display font-bold text-base text-foreground">
                Generating Your Report
              </h3>
              <p className="text-muted-foreground/60 text-[13px] font-body max-w-xs mx-auto">
                Complete payment in the opened window. We're analyzing your wallet across 8+ data sources…
              </p>
              <div className="bg-secondary/40 border border-border/50 rounded-xl p-3 space-y-1.5 text-left">
                {[
                  "Fetching Etherscan history",
                  "Scanning multi-chain activity",
                  "Running AI analysis",
                  "Building PDF report",
                ].map((s) => (
                  <p key={s} className="text-[11px] text-muted-foreground/50 font-body flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary/40" />
                    {s}
                  </p>
                ))}
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8 space-y-4">
              <div className="bg-green-400/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto border border-green-400/20">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">
                Report Downloaded!
              </h3>
              <p className="text-muted-foreground/60 text-[13px] font-body">
                Check your downloads folder for the PDF report.
              </p>
              <button
                onClick={handleClose}
                className="bg-secondary border border-border/50 text-foreground px-6 py-2.5 rounded-xl font-display font-semibold text-sm transition-all hover:bg-secondary/80"
              >
                Close
              </button>
            </div>
          )}

          {step === "error" && (
            <div className="text-center py-8 space-y-4">
              <div className="bg-destructive/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto border border-destructive/20">
                <AlertCircle className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">
                Something went wrong
              </h3>
              <p className="text-muted-foreground/60 text-[13px] font-body max-w-xs mx-auto">
                {errorMsg || "Please try again or contact support."}
              </p>
              <button
                onClick={() => setStep("email")}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-display font-semibold text-sm transition-all hover:shadow-lg hover:shadow-primary/20"
              >
                Try Again
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;
