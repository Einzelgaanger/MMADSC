import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Loader2, X, CheckCircle, AlertCircle, Zap, Crown, RefreshCw, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateReport } from "@/lib/generatePDF";
import type { ScoringResult } from "@/lib/scoring";
import type { PricingTier } from "./PricingSection";
import tierBasicImg from "@/assets/tier-basic.png";
import tierProImg from "@/assets/tier-pro.png";
import tierEliteImg from "@/assets/tier-elite.png";
import tierInsiderImg from "@/assets/tier-insider.png";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ScoringResult;
  tier: PricingTier;
}

type Step = "email" | "processing" | "success" | "error";

const tierMeta: Record<PricingTier, { name: string; price: string; amount: number; image: string }> = {
  basic: { name: "Basic Report", price: "$9.99", amount: 999, image: tierBasicImg },
  pro: { name: "Pro Report", price: "$49.99", amount: 4999, image: tierProImg },
  elite: { name: "Elite Report", price: "$99.99", amount: 9999, image: tierEliteImg },
  insider: { name: "Insider Weekly", price: "$29.99/mo", amount: 2999, image: tierInsiderImg },
};

const PaymentModal = ({ isOpen, onClose, result, tier }: PaymentModalProps) => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [errorMsg, setErrorMsg] = useState("");
  const meta = tierMeta[tier];

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
        <div className="absolute inset-0 bg-foreground/15 backdrop-blur-sm" onClick={handleClose} />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 12 }}
          className="relative bg-card rounded-2xl shadow-2xl border border-border p-7 max-w-[420px] w-full"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {step === "email" && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <img src={meta.image} alt={meta.name} className="w-14 h-14 object-contain" loading="lazy" width={56} height={56} />
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">{meta.name}</h3>
                  <p className="text-muted-foreground text-[12px] font-body mt-0.5">
                    {tier === "insider"
                      ? "Pro report now + weekly AI updates"
                      : "AI-powered wallet analysis"
                    }
                  </p>
                </div>
              </div>

              <div>
                <label className="text-muted-foreground text-[10px] font-body block mb-1.5 uppercase tracking-wider font-medium">
                  Email for report delivery
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/40 font-body text-[13px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>

              <button
                onClick={handlePurchase}
                disabled={!email.trim() || !email.includes("@")}
                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold text-[14px] transition-all hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-primary/15"
              >
                {tier === "insider" ? `Subscribe — ${meta.price}` : `Get Report — ${meta.price}`}
              </button>

              <p className="text-center text-muted-foreground/50 text-[10px] font-body flex items-center justify-center gap-1.5">
                <Shield className="w-3 h-3" />
                Secure payment · 256-bit encryption
              </p>
            </div>
          )}

          {step === "processing" && (
            <div className="text-center py-10 space-y-4">
              <div className="relative mx-auto w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-primary/15 animate-spin" style={{ borderTopColor: 'hsl(25 95% 53%)' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src={meta.image} alt="" className="w-8 h-8 object-contain" width={32} height={32} />
                </div>
              </div>
              <h3 className="font-display font-semibold text-base text-foreground">Generating Your Report</h3>
              <p className="text-muted-foreground text-[12px] font-body max-w-xs mx-auto leading-relaxed">
                Complete payment in the opened window. Analyzing across 8+ data sources…
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">Report Downloaded!</h3>
              <p className="text-muted-foreground text-[12px] font-body">
                {tier === "insider"
                  ? "Check your downloads. Weekly updates will arrive at your email."
                  : "Check your downloads folder for the PDF report."
                }
              </p>
              <button
                onClick={handleClose}
                className="bg-secondary border border-border text-foreground px-6 py-2.5 rounded-xl font-display font-medium text-[13px] hover:bg-secondary/80 transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {step === "error" && (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-display font-bold text-base text-foreground">Something went wrong</h3>
              <p className="text-muted-foreground text-[12px] font-body max-w-xs mx-auto">
                {errorMsg || "Please try again or contact support."}
              </p>
              <button
                onClick={() => setStep("email")}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-display font-semibold text-[13px] hover:brightness-110 transition-all"
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
