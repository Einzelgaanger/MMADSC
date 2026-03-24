import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Shield, Loader2, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
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
      // Initialize payment via edge function
      const { data, error } = await supabase.functions.invoke("initialize-payment", {
        body: { email, walletAddress: result.address },
      });

      if (error || !data?.authorization_url) {
        throw new Error(error?.message || "Failed to initialize payment");
      }

      const reference = data.reference;

      // Open Paystack payment page
      const paymentWindow = window.open(data.authorization_url, "_blank", "width=600,height=700");

      // Poll for payment completion
      const pollInterval = setInterval(async () => {
        try {
          const { data: reportData, error: reportError } = await supabase.functions.invoke("generate-report", {
            body: { reference, walletAddress: result.address, email },
          });

          if (reportError) {
            // Payment not yet verified, keep polling
            return;
          }

          if (reportData?.report) {
            clearInterval(pollInterval);
            if (paymentWindow && !paymentWindow.closed) paymentWindow.close();

            // Generate and download PDF
            generateReport(reportData.report);
            setStep("success");
          }
        } catch {
          // Still polling
        }
      }, 3000);

      // Stop polling after 5 minutes
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
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative glass-card rounded-3xl p-8 max-w-md w-full glow-primary"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {step === "email" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="bg-primary/20 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground">
                  Premium Eligibility Report
                </h3>
                <p className="text-muted-foreground text-sm font-body mt-2">
                  Get a detailed PDF with AI-powered analysis, personalized action plan, and historical comparison with past airdrop winners.
                </p>
              </div>

              {/* What's included */}
              <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
                {[
                  "Real on-chain data analysis via Etherscan",
                  "AI-powered personalized recommendations",
                  "Risk factor assessment & sybil detection warnings",
                  "Historical comparison with UNI, dYdX, ARB airdrops",
                  "Linea strategy & step-by-step action plan",
                  "Estimated allocation value range",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground text-xs font-body">{item}</span>
                  </div>
                ))}
              </div>

              {/* Email input */}
              <div>
                <label className="text-muted-foreground text-xs font-body block mb-2">
                  Email for report delivery
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-secondary rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground font-body text-sm outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Purchase button */}
              <button
                onClick={handlePurchase}
                disabled={!email.trim() || !email.includes("@")}
                className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-display font-bold text-base transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Get Full Report — $14.99
              </button>

              <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs font-body">
                <Shield className="w-3 h-3" />
                <span>Secure payment via Paystack • Instant PDF delivery</span>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="text-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
              <h3 className="font-display font-bold text-lg text-foreground">
                Processing Your Report
              </h3>
              <p className="text-muted-foreground text-sm font-body">
                Complete payment in the opened window. We're analyzing your wallet with real on-chain data and AI...
              </p>
              <div className="bg-secondary/50 rounded-xl p-3 space-y-1">
                <p className="text-xs text-muted-foreground font-body">
                  ✓ Fetching Etherscan transaction history
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  ✓ Running AI eligibility analysis
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  ✓ Generating personalized PDF report
                </p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8 space-y-4">
              <div className="bg-primary/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">
                Report Downloaded!
              </h3>
              <p className="text-muted-foreground text-sm font-body">
                Your premium report has been downloaded. Check your downloads folder for the PDF.
              </p>
              <button
                onClick={handleClose}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-display font-semibold text-sm transition-all hover:opacity-90"
              >
                Close
              </button>
            </div>
          )}

          {step === "error" && (
            <div className="text-center py-8 space-y-4">
              <div className="bg-destructive/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">
                Something went wrong
              </h3>
              <p className="text-muted-foreground text-sm font-body">
                {errorMsg || "Please try again or contact support."}
              </p>
              <button
                onClick={() => setStep("email")}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-display font-semibold text-sm transition-all hover:opacity-90"
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
