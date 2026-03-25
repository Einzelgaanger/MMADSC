import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Mail, ArrowRight, CheckCircle, Sparkles, TrendingUp, Shield, BarChart3 } from "lucide-react";

interface CTASectionProps {
  onOpenPayment: () => void;
}

const CTASection = ({ onOpenPayment }: CTASectionProps) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="w-full max-w-2xl mx-auto space-y-4"
    >
      {/* Premium Report CTA */}
      <div
        className="glass-card rounded-2xl p-6 relative overflow-hidden cursor-pointer group transition-all hover:border-primary/30"
        onClick={onOpenPayment}
        style={{ boxShadow: "0 0 60px hsl(28 92% 54% / 0.08)" }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/[0.05] rounded-full blur-3xl" />

        <div className="relative flex items-start gap-4">
          <div className="bg-primary/15 p-3 rounded-xl shrink-0 border border-primary/10">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-bold text-foreground text-base">
                Premium Eligibility Report
              </h3>
              <span className="bg-primary/15 text-primary text-[9px] font-display font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-primary/10">
                AI-Powered
              </span>
            </div>
            <p className="text-muted-foreground/70 text-[13px] font-body mt-1 leading-relaxed">
              Detailed PDF with real on-chain analysis, AI recommendations, sybil risk assessment, and a step-by-step action plan.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
              {[
                { icon: TrendingUp, text: "Historical comparison" },
                { icon: Shield, text: "Sybil risk assessment" },
                { icon: Sparkles, text: "AI recommendations" },
                { icon: BarChart3, text: "Allocation estimates" },
              ].map((feature) => (
                <div key={feature.text} className="flex items-center gap-1.5">
                  <feature.icon className="w-3 h-3 text-primary/60" />
                  <span className="text-foreground/50 text-[11px] font-body">{feature.text}</span>
                </div>
              ))}
            </div>

            <button className="mt-4 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-display font-semibold text-sm transition-all group-hover:shadow-lg group-hover:shadow-primary/20">
              Get Full Report — $14.99
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Email Capture */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-accent/15 p-3 rounded-xl shrink-0 border border-accent/10">
            <Mail className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-foreground text-base">
              Get Notified First
            </h3>
            <p className="text-muted-foreground/70 text-[13px] font-body mt-1">
              Be first to know when MetaMask announces. We'll send claim instructions instantly.
            </p>
            {subscribed ? (
              <div className="mt-4 flex items-center gap-2 text-green-400 font-display font-semibold text-sm">
                <CheckCircle className="w-4 h-4" />
                You're on the list!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 bg-secondary/60 border border-border/50 rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 font-body text-sm outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/30 transition-all"
                />
                <button
                  type="submit"
                  className="bg-accent text-accent-foreground px-5 py-2.5 rounded-xl font-display font-semibold text-sm transition-all hover:shadow-lg hover:shadow-accent/20"
                >
                  Notify Me
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CTASection;
