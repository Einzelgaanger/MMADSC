import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import metadropLogo from "@/assets/metadrop-logo.png";

const PrivacyPolicy = () => (
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
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm font-body mb-10">Last updated: March 25, 2026</p>

        <div className="prose prose-sm max-w-none font-body text-foreground/80 space-y-8">
          <section>
            <h2 className="font-display font-bold text-xl text-foreground">1. Information We Collect</h2>
            <p>MetaDrop collects minimal personal information necessary to provide our Service:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Email Address:</strong> Provided by you at checkout for report delivery, subscription management, and weekly report emails</li>
              <li><strong>Wallet Address:</strong> The public Ethereum address you submit for analysis. This is publicly available data on the blockchain</li>
              <li><strong>Payment Information:</strong> Processed securely by Paystack. We do not store credit card numbers or full payment details</li>
              <li><strong>Usage Data:</strong> Basic analytics including page views and feature usage to improve the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Generate and deliver your wallet analysis reports</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send weekly updated reports (Insider subscribers only)</li>
              <li>Send airdrop notification emails (if opted in)</li>
              <li>Improve our scoring algorithms and Service quality</li>
              <li>Respond to support inquiries</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">3. On-Chain Data</h2>
            <p>The wallet analysis we perform uses exclusively <strong>publicly available blockchain data</strong>. This includes transaction history, token balances, NFT holdings, DeFi interactions, and smart contract interactions. This data is inherently public on the Ethereum blockchain and other networks. We access this data through read-only APIs from trusted providers including Etherscan, Alchemy, Moralis, The Graph, DefiLlama, Dune Analytics, and Nansen.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">4. Data Storage & Security</h2>
            <p>Report data is stored securely in encrypted databases. We implement industry-standard security measures including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>256-bit TLS encryption for all data in transit</li>
              <li>Encrypted database storage for report data and personal information</li>
              <li>Secure payment processing through PCI-DSS compliant providers</li>
              <li>Regular security audits and monitoring</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">5. Data Sharing</h2>
            <p>We do <strong>not</strong> sell, rent, or trade your personal information. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Payment Processors (Paystack):</strong> To process transactions securely</li>
              <li><strong>AI Analysis Providers:</strong> Anonymized wallet data for generating AI-powered insights (no personal identifiers)</li>
              <li><strong>Legal Requirements:</strong> If required by law, regulation, or legal process</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">6. Data Retention</h2>
            <p>We retain report data for 12 months after generation to enable re-downloads and for Insider subscribers to access historical reports. Payment records are retained for 7 years as required by financial regulations. You may request deletion of your data by contacting us.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">7. Cookies & Tracking</h2>
            <p>MetaDrop uses minimal cookies necessary for the Service to function. We do not use third-party advertising cookies or cross-site tracking. Basic analytics may be used to understand usage patterns and improve the Service.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Request access to your stored personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for marketing communications</li>
              <li>Cancel your subscription at any time</li>
              <li>Export your report data</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">9. Children's Privacy</h2>
            <p>MetaDrop is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from minors.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. Changes will be posted on this page with an updated "Last updated" date. We encourage you to review this policy regularly.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-foreground">11. Contact Us</h2>
            <p>For privacy-related inquiries, data requests, or concerns, contact us at <a href="mailto:privacy@metadrop.io" className="text-primary hover:underline">privacy@metadrop.io</a>.</p>
          </section>
        </div>
      </main>
    </div>
  </div>
);

export default PrivacyPolicy;
