import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Loader2, FileText, X, CheckCircle, AlertCircle, Sparkles, BarChart3 } from "lucide-react";
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
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" onClick={handleClose} />

        <motion.div
          initial={{ scale: 0.97, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.97, opacity: 0, y: 8 }}
          className="relative glass-card-elevated rounded-2xl p-6 max-w-[420px] w-full"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-6 right-6 h-px"
            style={{ background: "linear-gradient(90deg, transparent, hsl(25 100% 58% / 0.3), transparent)" }} />

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted-foreground/30 hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {step === "email" && (
            <div className="space-y-5">
              <div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center mb-4">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-display font-bold text-base text-foreground">
                  Premium Eligibility Report
                </h3>
                <p className="text-muted-foreground/50 text-[12px] font-body mt-1.5 leading-relaxed">
                  AI-powered analysis with allocation estimates and personalized action plan.
                </p>
              </div>

              {/* Features */}
              <div className="bg-muted/40 border border-border/30 rounded-lg p-3.5 space-y-2">
                {[
                  { icon: BarChart3, text: "Estimated allocation range (Low/Mid/High)" },
                  { icon: Sparkles, text: "AI-powered personalized recommendations" },
                  { icon: Shield, text: "Sybil risk & airdrop farmer detection" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-2.5">
                    <item.icon className="w-3.5 h-3.5 text-primary/50 shrink-0 mt-0.5" />
                    <span className="text-foreground/60 text-[12px] font-body">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Email */}
              <div>
                <label className="text-muted-foreground/40 text-[10px] font-body block mb-1.5 uppercase tracking-wider font-medium">
                  Email for delivery
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-muted/50 border border-border/40 rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground/30 font-body text-[13px] outline-none focus:border-primary/30 transition-colors"
                />
              </div>

              <button
                onClick={handlePurchase}
                disabled={!email.trim() || !email.includes("@")}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-display font-bold text-[13px] transition-all hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Get Full Report — $14.99
              </button>

              <p className="text-center text-muted-foreground/25 text-[10px] font-body flex items-center justify-center gap-1.5">
                <Shield className="w-3 h-3" />
                Secure payment via Paystack
              </p>
            </div>
          )}

          {step === "processing" && (
            <div className="text-center py-8 space-y-4">
              <div className="relative mx-auto w-12 h-12">
                <Loader2 className="w-12 h-12 text-primary/20 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
              </div>
              <h3 className="font-display font-semibold text-[14px] text-foreground">
                Generating Report
              </h3>
              <p className="text-muted-foreground/50 text-[12px] font-body max-w-xs mx-auto">
                Complete payment in the opened window. Analyzing wallet across 8+ data sources…
              </p>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-green-400/8 border border-green-400/15 flex items-center justify-center mx-auto">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-display font-semibold text-[14px] text-foreground">
                Report Downloaded
              </h3>
              <p className="text-muted-foreground/50 text-[12px] font-body">
                Check your downloads folder for the PDF.
              </p>
              <button
                onClick={handleClose}
                className="bg-muted border border-border/40 text-foreground px-5 py-2 rounded-lg font-display font-medium text-[13px] hover:bg-secondary transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {step === "error" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-destructive/8 border border-destructive/15 flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="font-display font-semibold text-[14px] text-foreground">
                Something went wrong
              </h3>
              <p className="text-muted-foreground/50 text-[12px] font-body max-w-xs mx-auto">
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
