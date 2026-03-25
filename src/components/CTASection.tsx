import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle } from "lucide-react";

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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Email notification */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-foreground text-[14px]">
              Get Notified
            </h3>
            <p className="text-muted-foreground text-[12px] font-body mt-0.5">
              Be first to know when MetaMask announces the airdrop.
            </p>
            {subscribed ? (
              <div className="mt-3 flex items-center gap-2 text-green-600 font-display font-medium text-[13px]">
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
                  className="flex-1 bg-secondary border border-border rounded-lg px-3.5 py-2 text-foreground placeholder:text-muted-foreground/40 font-body text-[13px] outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all"
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
