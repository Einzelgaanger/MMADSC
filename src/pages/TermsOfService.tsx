import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import metadropLogo from "@/assets/metadrop-logo.png";

const TermsOfService = () => (
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

      <main className="px-6 lg:px-8 py-12 max-w-4xl mx-auto">
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-foreground mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-sm font-body mb-10">Last updated: March 25, 2026</p>

        <div className="prose prose-sm max-w-none font-body text-foreground/80 space-y-8">
          <section>
            <h2 className="font-display font-bold text-xl text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using MetaDrop ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. MetaDrop is an independent analytics platform and is <strong>not affiliated with, endorsed by, or connected to MetaMask, ConsenSys, or any of their subsidiaries</strong>.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">2. Description of Service</h2>
            <p>MetaDrop provides on-chain wallet analysis and speculative airdrop eligibility scoring. Our reports aggregate publicly available blockchain data from sources including Etherscan, Alchemy, Moralis, The Graph, DefiLlama, Dune Analytics, and Nansen. The Service provides:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Free Tier:</strong> Basic eligibility score with limited activity breakdown</li>
              <li><strong>Basic Report ($9.99):</strong> One-time comprehensive eligibility snapshot</li>
              <li><strong>Pro Report ($49.99):</strong> One-time deep-dive AI analysis with allocation estimates</li>
              <li><strong>Elite Report ($99.99):</strong> One-time institutional-grade analysis with Nansen & Dune intelligence</li>
              <li><strong>Insider Weekly ($29.99/month):</strong> Recurring subscription with weekly updated AI reports</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">3. Speculative Nature of Reports</h2>
            <p>All reports, scores, allocation estimates, and analysis provided by MetaDrop are <strong>entirely speculative</strong>. There is no guarantee that MetaMask, ConsenSys, or any entity will conduct a token airdrop, or that any criteria analyzed by our Service will be relevant to any future airdrop. MetaDrop scores are based on historical airdrop patterns and publicly available on-chain data. <strong>Nothing in our reports constitutes financial advice.</strong></p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">4. Payment & Billing</h2>
            <p>Payments are processed securely through Paystack. All one-time report purchases (Basic, Pro, Elite) are final and non-refundable once the report has been generated and delivered.</p>
            <p><strong>Insider Weekly Subscription:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Billed monthly at $29.99 USD</li>
              <li>Automatically renews each billing cycle until cancelled</li>
              <li>You will receive an initial Pro-level report upon subscription, followed by weekly updated reports via email</li>
              <li>You may cancel at any time through the subscription management page on our website</li>
              <li>Upon cancellation, you retain access until the end of your current billing period</li>
              <li>No refunds for partial billing periods</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">5. Data & Read-Only Access</h2>
            <p>MetaDrop only uses publicly available on-chain data. We <strong>never</strong> request wallet connection, private keys, seed phrases, or any form of write access. All analysis is performed using read-only blockchain APIs. We collect your email address solely for report delivery and subscription management.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">6. Intellectual Property</h2>
            <p>All content, branding, analysis methodologies, scoring algorithms, and AI-generated insights are the intellectual property of MetaDrop. Reports are for personal use only and may not be redistributed, resold, or published without written consent.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">7. Limitation of Liability</h2>
            <p>MetaDrop is provided "as is" without warranty of any kind. We are not liable for any losses, damages, or missed opportunities arising from reliance on our reports or scores. This includes but is not limited to: investment decisions, missed airdrops, inaccurate estimates, or actions taken based on our recommendations. Our maximum liability is limited to the amount paid for the specific report or subscription in question.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">8. Prohibited Uses</h2>
            <p>You may not: (a) use the Service for any unlawful purpose; (b) attempt to reverse-engineer our scoring algorithms; (c) resell or redistribute reports; (d) submit fraudulent wallet addresses; (e) use automated systems to scrape or interact with the Service; (f) impersonate MetaMask, ConsenSys, or any other entity.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">9. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated "Last updated" date. Continued use of the Service constitutes acceptance of modified Terms.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">10. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:legal@metadrop.io" className="text-primary hover:underline">legal@metadrop.io</a>.</p>
          </section>
        </div>
      </main>
    </div>
  </div>
);

export default TermsOfService;
