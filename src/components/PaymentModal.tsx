import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Loader2, FileText, X, CheckCircle, AlertCircle, Zap, Crown, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateReport } from "@/lib/generatePDF";
import type { ScoringResult } from "@/lib/scoring";
import type { PricingTier } from "./PricingSection";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ScoringResult;
  tier: PricingTier;
}

type Step = "email" | "processing" | "success" | "error";

const tierMeta: Record<PricingTier, { name: string; price: string; amount: number; icon: any; color: string }> = {
  basic: { name: "Basic Report", price: "$9.99", amount: 999, icon: FileText, color: "hsl(210 100% 50%)" },
  pro: { name: "Pro Report", price: "$49.99", amount: 4999, icon: Zap, color: "hsl(25 95% 53%)" },
  elite: { name: "Elite Report", price: "$99.99", amount: 9999, icon: Crown, color: "hsl(280 80% 55%)" },
  insider: { name: "Insider Weekly", price: "$29.99/mo", amount: 2999, icon: RefreshCw, color: "hsl(152 69% 41%)" },
};

const PaymentModal = ({ isOpen, onClose, result, tier }: PaymentModalProps) => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [errorMsg, setErrorMsg] = useState("");
  const meta = tierMeta[tier];
  const TierIcon = meta.icon;

  const handlePurchase = async () => {
    if (!email.trim() || !email.includes("@")) return;
    setStep("processing");

    try {
      const { data, error } = await supabase.functions.invoke("initialize-payment", {
        body: { email, walletAddress: result.address, tier, amount: meta.amount },
      });

      if (error || !data?.authorization_url) {
        throw new Error(error?.message || "Failed to initialize payment");
      }

      const reference = data.reference;
      const paymentWindow = window.open(data.authorization_url, "_blank", "width=600,height=700");

      const pollInterval = setInterval(async () => {
        try {
          const { data: reportData, error: reportError } = await supabase.functions.invoke("generate-report", {
            body: { reference, walletAddress: result.address, email, tier },
          });
          if (reportError) return;
          if (reportData?.report) {
            clearInterval(pollInterval);
            if (paymentWindow && !paymentWindow.closed) paymentWindow.close();
            generateReport(reportData.report);
            setStep("success");
          }
        } catch {
          // still polling
        }
      }, 3000);

      setTimeout(() => {
        clearInterval(pollInterval);
        if (step === "processing") {
          setStep("error");
          setErrorMsg("Payment verification timed out. If you completed payment, contact support.");
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
        <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={handleClose} />

        <motion.div
          initial={{ scale: 0.97, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.97, opacity: 0, y: 8 }}
          className="relative glass-card-elevated rounded-2xl p-6 max-w-[420px] w-full"
        >
          <div className="h-1 absolute top-0 left-0 right-0 rounded-t-2xl" style={{ background: meta.color }} />

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {step === "email" && (
            <div className="space-y-5">
              <div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}>
                  <TierIcon className="w-4 h-4" style={{ color: meta.color }} />
                </div>
                <h3 className="font-display font-bold text-base text-foreground">{meta.name}</h3>
                <p className="text-muted-foreground text-[12px] font-body mt-1.5 leading-relaxed">
                  {tier === "insider"
                    ? "Get your initial Pro report now + weekly AI-monitored updates via email."
                    : "AI-powered analysis personalized to your wallet's on-chain footprint."
                  }
                </p>
              </div>

              <div>
                <label className="text-muted-foreground text-[10px] font-body block mb-1.5 uppercase tracking-wider font-medium">
                  Email for delivery
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground/40 font-body text-[13px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              <button
                onClick={handlePurchase}
                disabled={!email.trim() || !email.includes("@")}
                className="w-full text-primary-foreground py-2.5 rounded-lg font-display font-bold text-[13px] transition-all hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: meta.color }}
              >
                {tier === "insider" ? `Subscribe — ${meta.price}` : `Get Report — ${meta.price}`}
              </button>

              <p className="text-center text-muted-foreground/50 text-[10px] font-body flex items-center justify-center gap-1.5">
                <Shield className="w-3 h-3" />
                Secure payment via Paystack
              </p>
            </div>
          )}

          {step === "processing" && (
            <div className="text-center py-8 space-y-4">
              <div className="relative mx-auto w-12 h-12">
                <Loader2 className="w-12 h-12 animate-spin" style={{ color: `${meta.color}30` }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <TierIcon className="w-4 h-4" style={{ color: meta.color }} />
                </div>
              </div>
              <h3 className="font-display font-semibold text-[14px] text-foreground">Generating Report</h3>
              <p className="text-muted-foreground text-[12px] font-body max-w-xs mx-auto">
                Complete payment in the opened window. Analyzing wallet across 8+ data sources…
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center mx-auto">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-display font-semibold text-[14px] text-foreground">Report Downloaded</h3>
              <p className="text-muted-foreground text-[12px] font-body">
                {tier === "insider"
                  ? "Check your downloads. You'll receive weekly updates at your email."
                  : "Check your downloads folder for the PDF."
                }
              </p>
              <button
                onClick={handleClose}
                className="bg-secondary border border-border text-foreground px-5 py-2 rounded-lg font-display font-medium text-[13px] hover:bg-secondary/80 transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {step === "error" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="font-display font-semibold text-[14px] text-foreground">Something went wrong</h3>
              <p className="text-muted-foreground text-[12px] font-body max-w-xs mx-auto">
                {errorMsg || "Please try again or contact support."}
              </p>
              <button
                onClick={() => setStep("email")}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg font-display font-semibold text-[13px] hover:brightness-110 transition-all"
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
