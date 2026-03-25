import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Activity, Clock, Globe, TrendingUp, TrendingDown, Minus,
  Check, X, ChevronRight, Lock, AlertTriangle, Target, Zap,
  BarChart3, Brain, Layers, ArrowLeft, ExternalLink, Download,
  Star, Eye, RefreshCw, Wallet, Coins, FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateReport } from "@/lib/generatePDF";
import metadropLogo from "@/assets/metadrop-logo.png";

interface ReportData {
  walletAddress: string;
  email: string;
  generatedAt: string;
  dataSources?: Record<string, boolean>;
  onChainData: any;
  score: { score: number; tier: string; activities: any[]; rawScore?: number; maxScore?: number };
  analysis: {
    executiveSummary: string;
    strengths: string[];
    weaknesses: string[];
    riskFactors: string[];
    immediateActions: string[];
    thingsToMaintain: string[];
    thingsToStop: string[];
    historicalComparison: string;
    lineaStrategy: string;
    timelineEstimate: string;
    portfolioInsights?: string;
    multiChainAnalysis?: string;
    estimatedAllocation?: {
      lowEstimate: string;
      midEstimate: string;
      highEstimate: string;
      confidence: string;
      reasoning: string;
    };
  };
}

type ReportTier = "basic" | "pro" | "elite" | "insider";

function getTierFromAmount(amount: number): ReportTier {
  if (amount >= 9999) return "elite";
  if (amount >= 4999) return "pro";
  if (amount >= 2999) return "insider";
  return "basic";
}

const tierAccess: Record<ReportTier, string[]> = {
  basic: ["score", "overview", "activities"],
  pro: ["score", "overview", "activities", "analysis", "strengths", "weaknesses", "risks", "actions", "allocation", "history"],
  elite: ["score", "overview", "activities", "analysis", "strengths", "weaknesses", "risks", "actions", "allocation", "history", "linea", "timeline", "nansen", "portfolio", "multichain"],
  insider: ["score", "overview", "activities", "analysis", "strengths", "weaknesses", "risks", "actions", "allocation", "history", "linea", "timeline", "nansen", "portfolio", "multichain"],
};

// Score ring component
const ScoreRing = ({ score, tier }: { score: number; tier: string }) => {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const tierColor = tier === "High" ? "hsl(152 69% 50%)" : tier === "Medium" ? "hsl(38 92% 50%)" : "hsl(0 72% 55%)";
  const tierLabel = tier === "High" ? "STRONG CANDIDATE" : tier === "Medium" ? "MODERATE CHANCE" : "NEEDS IMPROVEMENT";

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full opacity-20 blur-xl" style={{ background: tierColor }} />
        <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="hsl(222 20% 18%)" strokeWidth="7" />
          <motion.circle
            cx="80" cy="80" r={radius}
            fill="none" stroke={tierColor} strokeWidth="7" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
            className="font-display font-extrabold text-5xl leading-none"
            style={{ color: tierColor }}
          >
            {score}
          </motion.span>
          <span className="text-[hsl(220_10%_55%)] text-xs mt-1 font-body">/100</span>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-4 px-5 py-1.5 rounded-full text-xs font-display font-bold tracking-wider border"
        style={{
          color: tierColor,
          borderColor: tierColor,
          backgroundColor: `color-mix(in srgb, ${tierColor} 10%, transparent)`,
        }}
      >
        {tier.toUpperCase()} — {tierLabel}
      </motion.div>
    </div>
  );
};

// KPI Card
const KPICard = ({ label, value, icon: Icon, accentColor = "hsl(25 95% 53%)" }: { label: string; value: string; icon: any; accentColor?: string }) => (
  <div className="bg-[hsl(222_30%_10%)] border border-[hsl(222_20%_18%)] rounded-xl p-4 relative overflow-hidden group hover:border-[hsl(222_20%_25%)] transition-colors">
    <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: accentColor }} />
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
      <span className="text-[hsl(220_10%_55%)] text-[10px] font-body uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-white font-display font-bold text-lg">{value}</p>
  </div>
);

// Section Card wrapper
const SectionCard = ({ title, icon: Icon, children, locked = false, accentColor }: { title: string; icon: any; children: React.ReactNode; locked?: boolean; accentColor?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[hsl(222_30%_8%)] border border-[hsl(222_20%_16%)] rounded-2xl overflow-hidden"
  >
    <div className="flex items-center gap-3 px-6 py-4 border-b border-[hsl(222_20%_14%)]">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `color-mix(in srgb, ${accentColor || 'hsl(25 95% 53%)'} 15%, transparent)` }}>
        <Icon className="w-4 h-4" style={{ color: accentColor || "hsl(25 95% 53%)" }} />
      </div>
      <h3 className="font-display font-bold text-white text-sm tracking-wide">{title}</h3>
      {locked && (
        <div className="ml-auto flex items-center gap-1.5 bg-[hsl(222_30%_12%)] border border-[hsl(222_20%_20%)] rounded-full px-3 py-1">
          <Lock className="w-3 h-3 text-[hsl(25_95%_53%)]" />
          <span className="text-[hsl(25_95%_53%)] text-[10px] font-display font-semibold">UPGRADE TO UNLOCK</span>
        </div>
      )}
    </div>
    <div className="p-6">
      {locked ? (
        <div className="relative">
          <div className="blur-[6px] pointer-events-none select-none opacity-40">{children}</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-[hsl(222_30%_10%)]/95 border border-[hsl(222_20%_20%)] rounded-xl px-6 py-4 text-center shadow-2xl">
              <Lock className="w-6 h-6 text-[hsl(25_95%_53%)] mx-auto mb-2" />
              <p className="text-white font-display font-semibold text-sm">Unlock with Pro or Elite</p>
              <p className="text-[hsl(220_10%_55%)] text-xs font-body mt-1">Available in higher tier reports</p>
            </div>
          </div>
        </div>
      ) : children}
    </div>
  </motion.div>
);

// Bullet list
const BulletList = ({ items, color }: { items: string[]; color: string }) => (
  <div className="space-y-3">
    {items.map((item, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 * i }}
        className="flex items-start gap-3"
      >
        <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: color }} />
        <p className="text-[hsl(220_15%_80%)] text-sm font-body leading-relaxed">{item}</p>
      </motion.div>
    ))}
  </div>
);

const Report = () => {
  const { reference } = useParams<{ reference: string }>();
  const [report, setReport] = useState<ReportData | null>(null);
  const [tier, setTier] = useState<ReportTier>("basic");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      if (!reference) { setError("No report reference"); setLoading(false); return; }
      
      try {
        const { data, error: dbError } = await supabase
          .from("report_purchases")
          .select("*")
          .eq("paystack_reference", reference)
          .eq("status", "completed")
          .maybeSingle();

        if (dbError || !data?.report_data) {
          setError("Report not found or payment not completed.");
          setLoading(false);
          return;
        }

        const reportData = data.report_data as unknown as ReportData;
        setReport(reportData);
        setTier(getTierFromAmount(data.amount_usd * 100));
      } catch {
        setError("Failed to load report.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reference]);

  const hasAccess = (section: string) => tierAccess[tier]?.includes(section);
  const d = report?.onChainData;
  const a = report?.analysis;

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(222_30%_5%)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 text-[hsl(25_95%_53%)] animate-spin mx-auto" />
          <p className="text-[hsl(220_10%_55%)] font-body text-sm">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[hsl(222_30%_5%)] flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="w-10 h-10 text-[hsl(0_72%_55%)] mx-auto" />
          <h2 className="text-white font-display font-bold text-xl">{error || "Report not found"}</h2>
          <Link to="/" className="inline-flex items-center gap-2 text-[hsl(25_95%_53%)] font-display font-semibold text-sm hover:brightness-110">
            <ArrowLeft className="w-4 h-4" /> Back to MetaDrop
          </Link>
        </div>
      </div>
    );
  }

  const kpiStats = [
    { label: "ETH Balance", value: `${d?.ethBalance || 0}`, icon: Coins, color: "hsl(25 95% 53%)" },
    { label: "Transactions", value: `${(d?.totalTransactions || 0).toLocaleString()}`, icon: Activity, color: "hsl(180 100% 45%)" },
    { label: "Wallet Age", value: `${d?.walletAgeYears || 0}yr`, icon: Clock, color: "hsl(152 69% 50%)" },
    { label: "Active Chains", value: `${d?.totalChainsUsed || 1}`, icon: Globe, color: "hsl(210 100% 60%)" },
    { label: "Contracts", value: `${d?.uniqueContracts || 0}`, icon: FileText, color: "hsl(280 80% 60%)" },
    { label: "NFTs Owned", value: `${d?.nftsOwned || 0}`, icon: Star, color: "hsl(38 92% 50%)" },
    { label: "DeFi Protocols", value: `${d?.defiProtocolsUsed || 0}`, icon: Layers, color: "hsl(0 72% 55%)" },
    { label: "Linea TXs", value: `${d?.lineaTransactions || 0}`, icon: Zap, color: "hsl(170 80% 50%)" },
  ];

  const handleDownloadPDF = () => {
    if (report) generateReport(report);
  };

  const tierBadge = tier === "elite" ? "★ ELITE" : tier === "pro" ? "PRO" : tier === "insider" ? "INSIDER" : "BASIC";
  const tierBadgeColor = tier === "elite" ? "hsl(280 80% 60%)" : tier === "pro" ? "hsl(25 95% 53%)" : tier === "insider" ? "hsl(152 69% 50%)" : "hsl(210 100% 60%)";

  return (
    <div className="min-h-screen bg-[hsl(222_30%_5%)]">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-[hsl(25_95%_53%)] via-[hsl(38_92%_50%)] to-[hsl(25_95%_53%)]" />

      {/* Ambient bg */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[hsl(25_95%_53%)] opacity-[0.02] blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(180_100%_45%)] opacity-[0.015] blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-20 bg-[hsl(222_30%_5%)]/90 backdrop-blur-xl border-b border-[hsl(222_20%_12%)]">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={metadropLogo} alt="MetaDrop" className="w-8 h-8 object-contain" />
            <span className="font-display font-bold text-white text-base">MetaDrop</span>
          </Link>
          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 rounded-full text-[10px] font-display font-bold tracking-wider border"
              style={{ color: tierBadgeColor, borderColor: tierBadgeColor, background: `color-mix(in srgb, ${tierBadgeColor} 10%, transparent)` }}
            >
              {tierBadge} REPORT
            </span>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 bg-[hsl(25_95%_53%)] text-white px-4 py-2 rounded-lg text-xs font-display font-semibold hover:brightness-110 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Header + Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[hsl(222_30%_8%)] border border-[hsl(222_20%_16%)] rounded-2xl p-8 md:p-10"
        >
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <ScoreRing score={report.score.score} tier={report.score.tier} />
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div>
                <p className="text-[hsl(220_10%_45%)] text-[10px] font-body uppercase tracking-widest mb-1">WALLET ADDRESS</p>
                <p className="text-[hsl(220_15%_75%)] font-mono text-sm">
                  {report.walletAddress.slice(0, 14)}...{report.walletAddress.slice(-10)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
                <span className="text-[hsl(220_10%_45%)] text-xs font-body">
                  Generated {new Date(report.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
                <span className="w-px h-3 bg-[hsl(222_20%_20%)]" />
                <span className="text-[hsl(220_10%_45%)] text-xs font-body">{report.email}</span>
              </div>
              {/* Data sources */}
              <div className="flex flex-wrap items-center gap-1.5 justify-center lg:justify-start">
                <span className="text-[hsl(180_100%_45%)] text-[9px] font-body mr-1">Powered by</span>
                {Object.entries(report.dataSources || {}).filter(([, v]) => v).map(([k]) => (
                  <span key={k} className="text-[9px] font-mono text-[hsl(220_10%_50%)] bg-[hsl(222_30%_12%)] px-2 py-0.5 rounded border border-[hsl(222_20%_18%)]">
                    {k}
                  </span>
                ))}
              </div>
              {/* Allocation estimate preview */}
              {hasAccess("allocation") && a?.estimatedAllocation && (
                <div className="bg-[hsl(222_30%_10%)] border border-[hsl(180_100%_45%)]/20 rounded-xl px-5 py-3 inline-block">
                  <p className="text-[hsl(220_10%_50%)] text-[9px] font-body uppercase tracking-widest mb-1">ESTIMATED $MASK ALLOCATION</p>
                  <p className="text-[hsl(180_100%_45%)] font-display font-bold text-lg">
                    {a.estimatedAllocation.lowEstimate} — {a.estimatedAllocation.highEstimate}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpiStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <KPICard label={stat.label} value={stat.value} icon={stat.icon} accentColor={stat.color} />
            </motion.div>
          ))}
        </div>

        {/* Executive Summary */}
        <SectionCard title="EXECUTIVE SUMMARY" icon={Brain} accentColor="hsl(25 95% 53%)" locked={!hasAccess("analysis")}>
          <p className="text-[hsl(220_15%_80%)] text-sm font-body leading-relaxed">{a?.executiveSummary}</p>
          {hasAccess("portfolio") && a?.portfolioInsights && (
            <div className="mt-5 pt-5 border-t border-[hsl(222_20%_14%)]">
              <h4 className="text-[hsl(220_10%_50%)] text-[10px] font-display uppercase tracking-widest mb-2">PORTFOLIO INSIGHTS</h4>
              <p className="text-[hsl(220_15%_75%)] text-sm font-body leading-relaxed">{a.portfolioInsights}</p>
            </div>
          )}
          {hasAccess("multichain") && a?.multiChainAnalysis && (
            <div className="mt-5 pt-5 border-t border-[hsl(222_20%_14%)]">
              <h4 className="text-[hsl(220_10%_50%)] text-[10px] font-display uppercase tracking-widest mb-2">MULTI-CHAIN ANALYSIS</h4>
              <p className="text-[hsl(220_15%_75%)] text-sm font-body leading-relaxed">{a.multiChainAnalysis}</p>
            </div>
          )}
        </SectionCard>

        {/* Wallet Overview Table */}
        <SectionCard title="WALLET OVERVIEW" icon={Wallet} accentColor="hsl(210 100% 60%)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              ["ETH Balance", `${d?.ethBalance || 0} ETH`, "Net Worth (est.)", `$${Math.round(d?.totalNetWorthUSD || 0).toLocaleString()}`],
              ["Total Transactions", `${d?.totalTransactions || 0}`, "Gas Spent", `${d?.totalGasSpentETH || 0} ETH`],
              ["Active Chains", `${d?.totalChainsUsed || 1} (${(d?.chainsActive || ['eth']).join(', ')})`, "Token Holdings", `${d?.tokenHoldings || 0}`],
              ["NFTs Owned", `${d?.nftsOwned || 0} (${d?.nftCollections || 0} collections)`, "Uniswap Volume", `$${(d?.uniswapVolumeUSD || 0).toLocaleString()}`],
              ["Linea TXs", `${d?.lineaTransactions || 0}`, "Linea DeFi", `${d?.lineaDeFiInteractions || 0} interactions`],
              ["First TX", d?.firstTxDate || "N/A", "Last TX", d?.lastTxDate || "N/A"],
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-2 gap-px ${i % 2 === 0 ? "bg-[hsl(222_30%_10%)]" : "bg-[hsl(222_30%_9%)]"} rounded-lg overflow-hidden`}>
                <div className="px-4 py-3">
                  <span className="text-[hsl(220_10%_50%)] text-[10px] font-body uppercase tracking-wider">{row[0]}</span>
                  <p className="text-white font-display font-semibold text-sm mt-0.5">{row[1]}</p>
                </div>
                <div className="px-4 py-3">
                  <span className="text-[hsl(220_10%_50%)] text-[10px] font-body uppercase tracking-wider">{row[2]}</span>
                  <p className="text-white font-display font-semibold text-sm mt-0.5">{row[3]}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Activity Breakdown */}
        <SectionCard title="ON-CHAIN ACTIVITY BREAKDOWN" icon={BarChart3} accentColor="hsl(38 92% 50%)">
          <div className="space-y-2">
            {report.score.activities.map((act: any, i: number) => {
              const pct = act.weight > 0 ? (act.earnedPoints / act.weight) * 100 : 0;
              const barColor = pct >= 70 ? "hsl(152 69% 50%)" : pct >= 30 ? "hsl(38 92% 50%)" : "hsl(0 72% 55%)";
              return (
                <motion.div
                  key={act.id || i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`rounded-xl p-4 border border-[hsl(222_20%_16%)] ${i % 2 === 0 ? "bg-[hsl(222_30%_10%)]" : "bg-[hsl(222_30%_9%)]"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${act.detected ? "bg-[hsl(152_69%_50%)]/10 border border-[hsl(152_69%_50%)]/25" : "bg-[hsl(0_72%_55%)]/10 border border-[hsl(0_72%_55%)]/25"}`}>
                      {act.detected ? <Check className="w-3.5 h-3.5 text-[hsl(152_69%_50%)]" /> : <X className="w-3.5 h-3.5 text-[hsl(0_72%_55%)]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-display font-semibold text-sm">{act.label}</p>
                        <span className="text-[hsl(25_95%_53%)] font-mono font-bold text-sm">{act.earnedPoints}/{act.weight}</span>
                      </div>
                      {act.detail && (
                        <p className="text-[hsl(220_10%_50%)] text-xs font-body mt-1 leading-relaxed">{act.detail}</p>
                      )}
                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 bg-[hsl(222_30%_14%)] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: barColor }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(2, pct)}%` }}
                          transition={{ duration: 0.8, delay: 0.1 * i }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SectionCard>

        {/* Strengths */}
        <SectionCard title="STRENGTHS" icon={TrendingUp} accentColor="hsl(152 69% 50%)" locked={!hasAccess("strengths")}>
          <BulletList items={a?.strengths || []} color="hsl(152 69% 50%)" />
        </SectionCard>

        {/* Weaknesses */}
        <SectionCard title="WEAKNESSES" icon={TrendingDown} accentColor="hsl(0 72% 55%)" locked={!hasAccess("weaknesses")}>
          <BulletList items={a?.weaknesses || []} color="hsl(0 72% 55%)" />
        </SectionCard>

        {/* Risk Factors */}
        <SectionCard title="RISK FACTORS & SYBIL ASSESSMENT" icon={AlertTriangle} accentColor="hsl(38 92% 50%)" locked={!hasAccess("risks")}>
          <BulletList items={a?.riskFactors || []} color="hsl(38 92% 50%)" />
          {hasAccess("nansen") && d?.nansenLabels && d.nansenLabels.length > 0 && (
            <div className="mt-5 pt-5 border-t border-[hsl(222_20%_14%)]">
              <h4 className="text-[hsl(220_10%_50%)] text-[10px] font-display uppercase tracking-widest mb-3">NANSEN WALLET PROFILE</h4>
              <div className={`rounded-xl p-4 border ${d.isAirdropFarmer ? "border-[hsl(0_72%_55%)]/30 bg-[hsl(0_72%_55%)]/5" : "border-[hsl(152_69%_50%)]/30 bg-[hsl(152_69%_50%)]/5"}`}>
                <p className="text-sm font-body" style={{ color: d.isAirdropFarmer ? "hsl(0 72% 55%)" : "hsl(152 69% 50%)" }}>
                  Labels: {d.nansenLabels.join(", ")}
                  {d.isAirdropFarmer && " ⚠️ Flagged as potential airdrop farmer"}
                  {d.isSmartMoney && " ✓ Smart Money tag detected"}
                </p>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Historical Comparison */}
        <SectionCard title="HISTORICAL AIRDROP COMPARISON" icon={BarChart3} accentColor="hsl(210 100% 60%)" locked={!hasAccess("history")}>
          <p className="text-[hsl(220_15%_80%)] text-sm font-body leading-relaxed mb-5">{a?.historicalComparison}</p>
          <div className="space-y-2">
            {[
              { name: "Uniswap ($UNI)", date: "Sept 2020", value: "~$5,000", criteria: "Used Uniswap before cutoff" },
              { name: "dYdX ($DYDX)", date: "Sept 2021", value: "~$9,000", criteria: "Traded on dYdX platform" },
              { name: "ENS ($ENS)", date: "Nov 2021", value: "~$14,000", criteria: "Registered .eth domains" },
              { name: "Optimism ($OP)", date: "June 2022", value: "~$3,000", criteria: "Multi-criteria: bridge, vote, usage" },
              { name: "Arbitrum ($ARB)", date: "Mar 2023", value: "~$2,000", criteria: "Bridge + transaction count" },
              { name: "MetaMask ($MASK)", date: "Q2-Q3 2026?", value: "TBD", criteria: "Swap, bridge, Linea, Snaps, staking", highlight: true },
            ].map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-4 gap-4 px-4 py-3 rounded-lg ${row.highlight ? "bg-[hsl(25_95%_53%)]/10 border border-[hsl(25_95%_53%)]/25" : i % 2 === 0 ? "bg-[hsl(222_30%_10%)]" : "bg-[hsl(222_30%_9%)]"}`}
              >
                <span className={`text-sm font-display font-semibold ${row.highlight ? "text-[hsl(25_95%_53%)]" : "text-white"}`}>{row.name}</span>
                <span className="text-[hsl(220_10%_50%)] text-sm font-body">{row.date}</span>
                <span className={`text-sm font-display font-bold ${row.value === "TBD" ? "text-[hsl(180_100%_45%)]" : "text-[hsl(152_69%_50%)]"}`}>{row.value}</span>
                <span className="text-[hsl(220_15%_70%)] text-xs font-body">{row.criteria}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Allocation Estimate */}
        {a?.estimatedAllocation && (
          <SectionCard title="YOUR ESTIMATED $MASK ALLOCATION" icon={Target} accentColor="hsl(180 100% 45%)" locked={!hasAccess("allocation")}>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Conservative", value: a.estimatedAllocation.lowEstimate, color: "hsl(0 72% 55%)" },
                { label: "Mid Estimate", value: a.estimatedAllocation.midEstimate, color: "hsl(38 92% 50%)" },
                { label: "Optimistic", value: a.estimatedAllocation.highEstimate, color: "hsl(152 69% 50%)" },
              ].map((est) => (
                <div key={est.label} className="bg-[hsl(222_30%_10%)] border border-[hsl(222_20%_18%)] rounded-xl p-4 text-center">
                  <p className="text-[hsl(220_10%_50%)] text-[10px] font-body uppercase tracking-wider mb-2">{est.label}</p>
                  <p className="font-display font-extrabold text-xl" style={{ color: est.color }}>{est.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-[hsl(222_30%_10%)] rounded-xl p-4 space-y-2">
              <p className="text-[hsl(220_10%_50%)] text-xs font-body">
                <strong className="text-[hsl(220_15%_70%)]">Confidence:</strong> {a.estimatedAllocation.confidence}
              </p>
              <p className="text-[hsl(220_10%_50%)] text-xs font-body leading-relaxed">{a.estimatedAllocation.reasoning}</p>
            </div>
          </SectionCard>
        )}

        {/* Immediate Actions */}
        <SectionCard title="IMMEDIATE ACTIONS (Priority Order)" icon={Zap} accentColor="hsl(180 100% 45%)" locked={!hasAccess("actions")}>
          <BulletList items={a?.immediateActions || []} color="hsl(180 100% 45%)" />
        </SectionCard>

        {/* Maintain / Stop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SectionCard title="BEHAVIORS TO MAINTAIN" icon={Check} accentColor="hsl(152 69% 50%)" locked={!hasAccess("actions")}>
            <BulletList items={a?.thingsToMaintain || []} color="hsl(152 69% 50%)" />
          </SectionCard>
          <SectionCard title="THINGS TO STOP" icon={X} accentColor="hsl(0 72% 55%)" locked={!hasAccess("actions")}>
            <BulletList items={a?.thingsToStop || []} color="hsl(0 72% 55%)" />
          </SectionCard>
        </div>

        {/* Linea Strategy */}
        <SectionCard title="LINEA NETWORK STRATEGY" icon={Layers} accentColor="hsl(170 80% 50%)" locked={!hasAccess("linea")}>
          <p className="text-[hsl(220_15%_80%)] text-sm font-body leading-relaxed mb-4">{a?.lineaStrategy}</p>
          <BulletList items={[
            "Bridge ETH to Linea via MetaMask Bridge — portfolio.metamask.io/bridge",
            "Swap tokens on SyncSwap, Horizon DEX, or EchoDEX on Linea",
            "Provide liquidity on Linea DEXs for deeper engagement signals",
            "Use lending protocols on Linea (LineaBank/Mendi Finance)",
            "Interact with Linea's native ecosystem dApps weekly",
            "Maintain consistent activity for 8+ weeks before snapshot",
          ]} color="hsl(170 80% 50%)" />
        </SectionCard>

        {/* Timeline */}
        <SectionCard title="TIMELINE & URGENCY" icon={Clock} accentColor="hsl(38 92% 50%)" locked={!hasAccess("timeline")}>
          <p className="text-[hsl(220_15%_80%)] text-sm font-body leading-relaxed mb-5">{a?.timelineEstimate}</p>
          <div className="space-y-3">
            {[
              { date: "Sept 2025", desc: "CEO Joseph Lubin confirms $MASK token", status: "CONFIRMED", color: "hsl(152 69% 50%)" },
              { date: "Q1 2026", desc: "MetaMask Rewards Seasons actively tracking engagement", status: "ACTIVE", color: "hsl(210 100% 60%)" },
              { date: "Q2-Q3 2026", desc: "Expected snapshot & token launch window", status: "UPCOMING", color: "hsl(38 92% 50%)" },
              { date: "NOW → 90 days", desc: "Critical window to improve eligibility", status: "URGENT", color: "hsl(0 72% 55%)" },
              { date: "Post-snapshot", desc: "No further improvements possible", status: "DEADLINE", color: "hsl(220 10% 50%)" },
            ].map((milestone, i) => (
              <div key={i} className="flex items-center gap-4 bg-[hsl(222_30%_10%)] border border-[hsl(222_20%_16%)] rounded-xl px-5 py-3.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: milestone.color }} />
                <span className="text-white font-display font-semibold text-sm w-28 shrink-0">{milestone.date}</span>
                <span className="text-[hsl(220_15%_75%)] text-sm font-body flex-1">{milestone.desc}</span>
                <span
                  className="text-[9px] font-display font-bold tracking-wider px-2.5 py-1 rounded-full shrink-0"
                  style={{ color: "hsl(222 30% 5%)", background: milestone.color }}
                >
                  {milestone.status}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-[hsl(25_95%_53%)] to-[hsl(38_92%_50%)] rounded-2xl p-8 text-center"
        >
          <img src={metadropLogo} alt="MetaDrop" className="w-14 h-14 mx-auto mb-4 object-contain" />
          <h3 className="text-[hsl(222_30%_5%)] font-display font-extrabold text-xl mb-2">Re-check your score anytime</h3>
          <p className="text-[hsl(222_30%_5%)]/70 font-body text-sm mb-4">Track your progress as you implement these recommendations.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[hsl(222_30%_5%)] text-white px-6 py-2.5 rounded-xl font-display font-semibold text-sm hover:bg-[hsl(222_30%_10%)] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Check Again
          </Link>
        </motion.div>

        {/* Disclaimer */}
        <div className="bg-[hsl(222_30%_8%)] border border-[hsl(222_20%_14%)] rounded-xl p-5">
          <p className="text-[hsl(220_10%_40%)] text-[10px] font-body uppercase tracking-widest mb-2 font-semibold">DISCLAIMER</p>
          <p className="text-[hsl(220_10%_40%)] text-[10px] font-body leading-relaxed">
            This report contains speculative analysis based on publicly available on-chain data. MetaDrop is not affiliated with MetaMask, ConsenSys, or any blockchain foundation. Nothing in this report constitutes financial, investment, or legal advice. Past airdrop patterns do not guarantee future distributions. Users should conduct their own research.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[hsl(222_20%_12%)] py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={metadropLogo} alt="MetaDrop" className="w-5 h-5 object-contain" />
            <span className="text-[hsl(220_10%_40%)] text-xs font-body">© 2026 MetaDrop — Confidential</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-body">
            <Link to="/terms" className="text-[hsl(220_10%_40%)] hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="text-[hsl(220_10%_40%)] hover:text-white transition-colors">Privacy</Link>
            <Link to="/manage-subscription" className="text-[hsl(220_10%_40%)] hover:text-white transition-colors">Manage Subscription</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Report;
