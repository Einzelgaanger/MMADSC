import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Mail, ArrowRight, CheckCircle, Sparkles, Shield, BarChart3 } from "lucide-react";

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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="w-full max-w-2xl mx-auto space-y-3"
    >
      {/* Premium Report */}
      <div
        className="glass-card-elevated rounded-xl p-5 cursor-pointer group transition-all hover:border-primary/20 relative overflow-hidden"
        onClick={onOpenPayment}
      >
        {/* Subtle gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, hsl(25 100% 58% / 0.3), transparent)" }} />

        <div className="relative flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-display font-semibold text-foreground text-[14px]">
                Premium Eligibility Report
              </h3>
              <span className="text-primary/60 text-[9px] font-mono uppercase tracking-wider bg-primary/8 px-1.5 py-0.5 rounded border border-primary/10">
                AI
              </span>
            </div>
            <p className="text-muted-foreground/50 text-[12px] font-body leading-relaxed">
              On-chain analysis, sybil risk assessment, allocation estimates, and personalized action plan.
            </p>

            <div className="flex items-center gap-4 mt-3">
              {[
                { icon: BarChart3, text: "Allocation est." },
                { icon: Shield, text: "Sybil check" },
                { icon: Sparkles, text: "AI insights" },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-1">
                  <f.icon className="w-3 h-3 text-muted-foreground/30" />
                  <span className="text-muted-foreground/40 text-[10px] font-body">{f.text}</span>
                </div>
              ))}
            </div>

            <button className="mt-4 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-display font-semibold text-[13px] transition-all group-hover:brightness-110">
              Get Report — $14.99
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-foreground text-[14px]">
              Get Notified
            </h3>
            <p className="text-muted-foreground/50 text-[12px] font-body mt-0.5">
              Be first to know when MetaMask announces the airdrop.
            </p>
            {subscribed ? (
              <div className="mt-3 flex items-center gap-2 text-green-400 font-display font-medium text-[13px]">
                <CheckCircle className="w-3.5 h-3.5" />
                You're on the list
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-3 flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 bg-muted/50 border border-border/40 rounded-lg px-3.5 py-2 text-foreground placeholder:text-muted-foreground/30 font-body text-[13px] outline-none focus:border-accent/30 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-accent text-accent-foreground px-4 py-2 rounded-lg font-display font-semibold text-[13px] transition-all hover:brightness-110"
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
