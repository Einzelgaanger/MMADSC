import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Mail, ArrowRight, CheckCircle } from "lucide-react";

const CTASection = () => {
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
      <div className="glass-card rounded-2xl p-6 glow-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="bg-primary/20 p-3 rounded-xl shrink-0">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-foreground text-lg">
              Premium Eligibility Report
            </h3>
            <p className="text-muted-foreground text-sm font-body mt-1">
              Get a detailed PDF with personalized action plan, historical comparison with past airdrop winners, and priority alerts.
            </p>
            <button className="mt-4 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-display font-semibold text-sm transition-all hover:opacity-90">
              Get Full Report — $9.99
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
