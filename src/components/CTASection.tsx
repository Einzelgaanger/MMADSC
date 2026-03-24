import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Mail, ArrowRight, CheckCircle, Sparkles, TrendingUp, Shield } from "lucide-react";

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
      transition={{ delay: 0.5, duration: 0.5 }}
      className="w-full max-w-2xl mx-auto space-y-4"
    >
      {/* Premium Report CTA */}
      <div className="glass-card rounded-2xl p-6 glow-primary relative overflow-hidden cursor-pointer group" onClick={onOpenPayment}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
        <div className="relative flex items-start gap-4">
          <div className="bg-primary/20 p-3 rounded-xl shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-bold text-foreground text-lg">
                Premium Eligibility Report
              </h3>
              <span className="bg-primary/20 text-primary text-[10px] font-display font-bold px-2 py-0.5 rounded-full uppercase">
                AI-Powered
              </span>
            </div>
            <p className="text-muted-foreground text-sm font-body mt-1">
              Get a detailed PDF with real on-chain analysis via Etherscan, AI-powered personalized recommendations, risk assessment, and a step-by-step action plan.
            </p>
            
            {/* Features grid */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              {[
                { icon: TrendingUp, text: "Historical comparison" },
                { icon: Shield, text: "Sybil risk assessment" },
                { icon: Sparkles, text: "AI recommendations" },
                { icon: FileText, text: "Instant PDF download" },
              ].map((feature) => (
                <div key={feature.text} className="flex items-center gap-1.5">
                  <feature.icon className="w-3 h-3 text-primary" />
                  <span className="text-foreground/70 text-xs font-body">{feature.text}</span>
                </div>
              ))}
            </div>

            <button className="mt-4 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-display font-semibold text-sm transition-all group-hover:opacity-90">
              Get Full Report — $14.99
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Email Capture */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-accent/20 p-3 rounded-xl shrink-0">
            <Mail className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-foreground text-lg">
              Get Notified First
            </h3>
            <p className="text-muted-foreground text-sm font-body mt-1">
              Be the first to know when MetaMask announces the airdrop. We'll send you claim instructions instantly.
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
                  className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground font-body text-sm outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  type="submit"
                  className="bg-accent text-accent-foreground px-5 py-2.5 rounded-xl font-display font-semibold text-sm transition-all hover:opacity-90"
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
