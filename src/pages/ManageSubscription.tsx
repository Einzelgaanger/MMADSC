import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertCircle, CheckCircle, Loader2, Mail, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import metadropLogo from "@/assets/metadrop-logo.png";

type Step = "lookup" | "loading" | "active" | "cancelled" | "not_found";

const ManageSubscription = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<Step>("lookup");
  const [subscription, setSubscription] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);

  const handleLookup = async () => {
    if (!email.trim() || !email.includes("@")) return;
    setStep("loading");

    try {
      const { data, error } = await supabase.functions.invoke("manage-subscription", {
        body: { action: "check", email },
      });

      if (error || !data?.active) {
        setStep("not_found");
        return;
      }

      setSubscription(data.subscription);
      setStep("active");
    } catch {
      setStep("not_found");
    }
  };

  const handleCancel = async () => {
    if (!email) return;
    setCancelling(true);

    try {
      const { data, error } = await supabase.functions.invoke("manage-subscription", {
        body: { action: "cancel", email },
      });

      if (error) throw error;
      setStep("cancelled");
    } catch (err) {
      console.error("Cancel error:", err);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none bg-mesh" />
      <div className="relative z-10">
        <nav className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 lg:px-8 py-3 max-w-4xl mx-auto">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={metadropLogo} alt="MetaDrop" className="w-8 h-8 object-contain" width={32} height={32} />
              <span className="font-display font-bold text-[16px] text-foreground tracking-tight">MetaDrop</span>
            </Link>
            <Link to="/" className="flex items-center gap-1.5 text-muted-foreground text-[13px] font-body hover:text-foreground transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
          </div>
        </nav>

        <main className="px-6 lg:px-8 py-16 max-w-lg mx-auto">
          <div className="text-center mb-10">
            <img src={metadropLogo} alt="MetaDrop" className="w-14 h-14 mx-auto mb-4 object-contain" width={56} height={56} />
            <h1 className="font-display font-extrabold text-2xl text-foreground">Manage Subscription</h1>
            <p className="text-muted-foreground text-sm font-body mt-2">View or cancel your Insider Weekly subscription</p>
          </div>

          <AnimatePresence mode="wait">
            {step === "lookup" && (
              <motion.div key="lookup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card rounded-2xl p-6 space-y-4">
                <label className="text-muted-foreground text-[10px] font-body block uppercase tracking-wider font-medium">
                  Enter your subscription email
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/40 font-body text-[13px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                    onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                  />
                  <button
                    onClick={handleLookup}
                    disabled={!email.includes("@")}
                    className="bg-primary text-primary-foreground px-5 py-3 rounded-xl font-display font-semibold text-[13px] hover:brightness-110 disabled:opacity-30 transition-all"
                  >
                    Look Up
                  </button>
                </div>
              </motion.div>
            )}

            {step === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                <p className="text-muted-foreground text-sm font-body mt-3">Looking up subscription…</p>
              </motion.div>
            )}

            {step === "active" && subscription && (
              <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground text-[15px]">Active Subscription</h3>
                    <p className="text-muted-foreground text-[12px] font-body">Insider Weekly — $29.99/month</p>
                  </div>
                </div>

                <div className="space-y-2 text-[13px] font-body">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Email</span>
                    <span className="text-foreground font-medium">{subscription.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Wallet</span>
                    <span className="text-foreground font-mono text-[11px]">{subscription.wallet_address?.slice(0, 8)}...{subscription.wallet_address?.slice(-6)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Since</span>
                    <span className="text-foreground">{new Date(subscription.created_at).toLocaleDateString()}</span>
                  </div>
                  {subscription.next_charge_date && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Next billing</span>
                      <span className="text-foreground">{new Date(subscription.next_charge_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full flex items-center justify-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive py-3 rounded-xl font-display font-semibold text-[13px] hover:bg-destructive/20 disabled:opacity-50 transition-all"
                  >
                    {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    {cancelling ? "Cancelling…" : "Cancel Subscription"}
                  </button>
                  <p className="text-muted-foreground/60 text-[10px] font-body text-center mt-2">
                    You'll retain access until the end of your current billing period
                  </p>
                </div>
              </motion.div>
            )}

            {step === "cancelled" && (
              <motion.div key="cancelled" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-display font-bold text-foreground text-base">Subscription Cancelled</h3>
                <p className="text-muted-foreground text-[13px] font-body">Your Insider Weekly subscription has been cancelled. You'll continue receiving reports until the end of your current billing period.</p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-display font-semibold text-[13px] hover:brightness-110 transition-all"
                >
                  Back to Home
                </Link>
              </motion.div>
            )}

            {step === "not_found" && (
              <motion.div key="not_found" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-display font-bold text-foreground text-base">No Active Subscription</h3>
                <p className="text-muted-foreground text-[13px] font-body">We couldn't find an active subscription for <strong>{email}</strong>. Please check the email address or contact support.</p>
                <button
                  onClick={() => { setStep("lookup"); setEmail(""); }}
                  className="bg-secondary border border-border text-foreground px-6 py-2.5 rounded-xl font-display font-medium text-[13px] hover:bg-secondary/80 transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default ManageSubscription;
