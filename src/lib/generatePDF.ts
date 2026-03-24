import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportData {
  walletAddress: string;
  email: string;
  generatedAt: string;
  dataSources?: Record<string, boolean>;
  onChainData: any;
  score: {
    score: number;
    tier: string;
    activities: any[];
  };
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

const C = {
  primary: [246, 133, 27] as [number, number, number],
  dark: [12, 14, 24] as [number, number, number],
  darkCard: [18, 22, 38] as [number, number, number],
  text: [220, 225, 240] as [number, number, number],
  muted: [120, 130, 155] as [number, number, number],
  green: [74, 222, 128] as [number, number, number],
  red: [248, 113, 113] as [number, number, number],
  accent: [0, 230, 230] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  yellow: [250, 204, 21] as [number, number, number],
};

let totalPages = 7;

function darkPage(doc: jsPDF, pageNum: number) {
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, w, h, "F");
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, w, 3, "F");
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text("MetaDrop Premium Report — Confidential", 20, h - 8);
  doc.text(`Page ${pageNum} of ${totalPages}`, w - 40, h - 8);
}

function sectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(14);
  doc.setTextColor(...C.primary);
  doc.text(title, 20, y);
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(0.5);
  doc.line(20, y + 3, 190, y + 3);
  return y + 12;
}

function bullets(doc: jsPDF, items: string[], y: number, color: [number, number, number] = C.text): number {
  const h = doc.internal.pageSize.getHeight();
  doc.setFontSize(9);
  items.forEach((item) => {
    if (y > h - 25) return;
    doc.setTextColor(...C.primary);
    doc.text("►", 24, y);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(item, 152);
    doc.text(lines, 32, y);
    y += lines.length * 4.5 + 3;
  });
  return y;
}

function para(doc: jsPDF, text: string, y: number, color: [number, number, number] = C.text): number {
  doc.setFontSize(9);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, 165);
  doc.text(lines, 22, y);
  return y + lines.length * 4.5 + 4;
}

function statBox(doc: jsPDF, x: number, y: number, w: number, label: string, value: string) {
  doc.setFillColor(...C.darkCard);
  doc.roundedRect(x, y, w, 28, 2, 2, "F");
  doc.setFontSize(14);
  doc.setTextColor(...C.white);
  doc.text(value, x + w / 2, y + 12, { align: "center" });
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text(label.toUpperCase(), x + w / 2, y + 22, { align: "center" });
}

export function generateReport(data: ReportData): void {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const cx = pw / 2;
  const d = data.onChainData;
  const a = data.analysis;

  // ========== PAGE 1: COVER ==========
  doc.setFillColor(...C.dark);
  doc.rect(0, 0, pw, ph, "F");
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, pw, 6, "F");

  doc.setFontSize(28);
  doc.setTextColor(...C.primary);
  doc.text("METADROP", cx, 45, { align: "center" });
  doc.setFontSize(11);
  doc.setTextColor(...C.muted);
  doc.text("PREMIUM ELIGIBILITY REPORT", cx, 55, { align: "center" });

  // Data sources badge
  const sources = data.dataSources || {};
  const activeSourceCount = Object.values(sources).filter(Boolean).length;
  doc.setFontSize(8);
  doc.setTextColor(...C.accent);
  doc.text(`Powered by ${activeSourceCount} data sources: Etherscan · Alchemy · Moralis · Linea · The Graph · DefiLlama · Dune · Nansen`, cx, 63, { align: "center" });

  // Score
  doc.setDrawColor(...C.primary);
  doc.setLineWidth(3);
  doc.circle(cx, 105, 28);
  const tierColor = data.score.tier === "High" ? C.green : data.score.tier === "Medium" ? C.yellow : C.red;
  doc.setFontSize(38);
  doc.setTextColor(...tierColor);
  doc.text(`${data.score.score}`, cx, 110, { align: "center" });
  doc.setFontSize(11);
  doc.setTextColor(...C.muted);
  doc.text("/100", cx + 18, 110);

  doc.setFontSize(14);
  doc.setTextColor(...tierColor);
  const tierLabel = data.score.tier === "High" ? "STRONG CANDIDATE" : data.score.tier === "Medium" ? "MODERATE CHANCE" : "NEEDS IMPROVEMENT";
  doc.text(`${data.score.tier.toUpperCase()} — ${tierLabel}`, cx, 145, { align: "center" });

  // Estimated allocation
  if (a.estimatedAllocation) {
    doc.setFillColor(...C.darkCard);
    doc.roundedRect(40, 155, 130, 25, 3, 3, "F");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text("ESTIMATED $MASK ALLOCATION", cx, 164, { align: "center" });
    doc.setFontSize(12);
    doc.setTextColor(...C.accent);
    doc.text(`${a.estimatedAllocation.lowEstimate} — ${a.estimatedAllocation.highEstimate}`, cx, 174, { align: "center" });
  }

  // Stats grid
  const sy = 195;
  const sw = 38;
  const gap = 4;
  const startX = 20;
  const stats = [
    { label: "Transactions", value: (d.totalTransactions || 0).toLocaleString() },
    { label: "Wallet Age", value: `${d.walletAgeYears || 0}yr` },
    { label: "Chains", value: `${d.totalChainsUsed || 1}` },
    { label: "ETH Balance", value: `${d.ethBalance || 0}` },
  ];
  stats.forEach((s, i) => statBox(doc, startX + i * (sw + gap), sy, sw, s.label, s.value));

  const stats2 = [
    { label: "Contracts", value: `${d.uniqueContracts || 0}` },
    { label: "NFTs Owned", value: `${d.nftsOwned || 0}` },
    { label: "DeFi Protocols", value: `${d.defiProtocolsUsed || 0}` },
    { label: "Linea TXs", value: `${d.lineaTransactions || 0}` },
  ];
  stats2.forEach((s, i) => statBox(doc, startX + i * (sw + gap), sy + 32, sw, s.label, s.value));

  // Wallet info
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text(`Wallet: ${data.walletAddress.slice(0, 10)}...${data.walletAddress.slice(-8)}`, cx, 270, { align: "center" });
  doc.text(`Generated: ${new Date(data.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}  |  Prepared for: ${data.email}`, cx, 277, { align: "center" });

  doc.setFontSize(6);
  doc.text("This report is speculative analysis. Not financial advice. Not affiliated with MetaMask or ConsenSys.", cx, ph - 8, { align: "center" });

  // ========== PAGE 2: EXECUTIVE SUMMARY + WALLET OVERVIEW ==========
  doc.addPage();
  darkPage(doc, 2);
  let y = 18;

  y = sectionTitle(doc, "EXECUTIVE SUMMARY", y);
  y = para(doc, a.executiveSummary, y);
  y += 3;

  if (a.portfolioInsights) {
    y = sectionTitle(doc, "PORTFOLIO INSIGHTS", y);
    y = para(doc, a.portfolioInsights, y);
    y += 3;
  }

  if (a.multiChainAnalysis) {
    y = sectionTitle(doc, "MULTI-CHAIN ANALYSIS", y);
    y = para(doc, a.multiChainAnalysis, y);
    y += 3;
  }

  // Wallet overview table
  y = sectionTitle(doc, "WALLET OVERVIEW", y);
  const overviewRows = [
    ["ETH Balance", `${d.ethBalance || 0} ETH`, "Net Worth (est.)", `$${Math.round(d.totalNetWorthUSD || 0).toLocaleString()}`],
    ["Total Transactions", `${d.totalTransactions || 0}`, "Gas Spent", `${d.totalGasSpentETH || 0} ETH`],
    ["Active Chains", `${d.totalChainsUsed || 1} (${(d.chainsActive || ['eth']).join(', ')})`, "Token Holdings", `${d.tokenHoldings || 0}`],
    ["NFTs Owned", `${d.nftsOwned || 0} (${d.nftCollections || 0} collections)`, "Uniswap Volume", `$${(d.uniswapVolumeUSD || 0).toLocaleString()}`],
    ["Linea TXs", `${d.lineaTransactions || 0}`, "Linea DeFi", `${d.lineaDeFiInteractions || 0} interactions`],
    ["First TX", d.firstTxDate || "N/A", "Last TX", d.lastTxDate || "N/A"],
  ];

  autoTable(doc, {
    startY: y,
    body: overviewRows,
    theme: "plain",
    styles: { fillColor: C.darkCard, textColor: C.text, fontSize: 8, cellPadding: 3, lineColor: [30, 35, 55], lineWidth: 0.2 },
    columnStyles: {
      0: { textColor: C.muted, cellWidth: 35 },
      1: { fontStyle: "bold", cellWidth: 50 },
      2: { textColor: C.muted, cellWidth: 35 },
      3: { fontStyle: "bold", cellWidth: 50 },
    },
    margin: { left: 20, right: 20 },
  });

  // ========== PAGE 3: ACTIVITY BREAKDOWN ==========
  doc.addPage();
  darkPage(doc, 3);
  y = 18;

  y = sectionTitle(doc, "ON-CHAIN ACTIVITY BREAKDOWN", y);

  const activityRows = data.score.activities.map((act: any) => [
    act.detected ? "✓" : "✗",
    act.label,
    act.detail || "",
    `${act.earnedPoints}/${act.weight}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["", "Activity", "Analysis", "Pts"]],
    body: activityRows,
    theme: "plain",
    styles: { fillColor: C.darkCard, textColor: C.text, fontSize: 8, cellPadding: 3.5, lineColor: [30, 35, 55], lineWidth: 0.2 },
    headStyles: { fillColor: [30, 35, 55] as any, textColor: C.primary, fontStyle: "bold", fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 38 },
      2: { cellWidth: 105 },
      3: { cellWidth: 17, halign: "center" },
    },
    didParseCell: (cellData) => {
      if (cellData.column.index === 0 && cellData.section === "body") {
        cellData.cell.styles.textColor = cellData.cell.raw === "✓" ? C.green : C.red;
      }
    },
    margin: { left: 20, right: 20 },
  });

  // ========== PAGE 4: STRENGTHS, WEAKNESSES, RISKS ==========
  doc.addPage();
  darkPage(doc, 4);
  y = 18;

  y = sectionTitle(doc, "STRENGTHS", y);
  y = bullets(doc, a.strengths || [], y, C.green);
  y += 4;

  y = sectionTitle(doc, "WEAKNESSES", y);
  y = bullets(doc, a.weaknesses || [], y, C.red);
  y += 4;

  y = sectionTitle(doc, "RISK FACTORS & SYBIL ASSESSMENT", y);
  y = bullets(doc, a.riskFactors || [], y, C.yellow);

  // Nansen labels if available
  if (d.nansenLabels && d.nansenLabels.length > 0) {
    y += 4;
    y = sectionTitle(doc, "NANSEN WALLET PROFILE", y);
    y = para(doc, `Labels: ${d.nansenLabels.join(', ')}`, y, d.isAirdropFarmer ? C.red : C.green);
    if (d.isAirdropFarmer) {
      y = para(doc, "⚠️ WARNING: This wallet has been flagged as a potential airdrop farmer by Nansen. This may significantly reduce or eliminate your allocation.", y, C.red);
    }
    if (d.isSmartMoney) {
      y = para(doc, "✓ This wallet is tagged as 'Smart Money' — a positive signal for genuine engagement.", y, C.green);
    }
  }

  // ========== PAGE 5: HISTORICAL COMPARISON & ALLOCATION ESTIMATE ==========
  doc.addPage();
  darkPage(doc, 5);
  y = 18;

  y = sectionTitle(doc, "HISTORICAL AIRDROP COMPARISON", y);
  y = para(doc, a.historicalComparison, y);
  y += 3;

  // Comparison table
  const compRows = [
    ["Uniswap ($UNI)", "Sept 2020", "~$5,000", "Used Uniswap before cutoff"],
    ["dYdX ($DYDX)", "Sept 2021", "~$9,000", "Traded on dYdX platform"],
    ["ENS ($ENS)", "Nov 2021", "~$14,000", "Registered .eth domains"],
    ["Optimism ($OP)", "June 2022", "~$3,000", "Multi-criteria: bridge, vote, usage"],
    ["Arbitrum ($ARB)", "Mar 2023", "~$2,000", "Bridge + transaction count"],
    ["MetaMask ($MASK)", "Q2-Q3 2026?", "TBD", "Expected: swap, bridge, Linea, Snaps, staking"],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Airdrop", "Date", "Avg Value", "Key Criteria"]],
    body: compRows,
    theme: "plain",
    styles: { fillColor: C.darkCard, textColor: C.text, fontSize: 8, cellPadding: 3.5, lineColor: [30, 35, 55], lineWidth: 0.2 },
    headStyles: { fillColor: [30, 35, 55] as any, textColor: C.primary, fontStyle: "bold", fontSize: 8 },
    margin: { left: 20, right: 20 },
  });

  y = (doc as any).lastAutoTable?.finalY + 10 || y + 60;

  // Allocation estimate box
  if (a.estimatedAllocation) {
    y = sectionTitle(doc, "YOUR ESTIMATED $MASK ALLOCATION", y);

    doc.setFillColor(...C.darkCard);
    doc.roundedRect(20, y, 170, 55, 3, 3, "F");
    doc.setDrawColor(...C.primary);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, y, 170, 55, 3, 3, "S");

    const est = a.estimatedAllocation;
    doc.setFontSize(10);
    doc.setTextColor(...C.muted);
    doc.text("Conservative", 45, y + 14);
    doc.text("Mid Estimate", 95, y + 14);
    doc.text("Optimistic", 148, y + 14);

    doc.setFontSize(16);
    doc.setTextColor(...C.red);
    doc.text(est.lowEstimate, 45, y + 26);
    doc.setTextColor(...C.yellow);
    doc.text(est.midEstimate, 95, y + 26);
    doc.setTextColor(...C.green);
    doc.text(est.highEstimate, 148, y + 26);

    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text(`Confidence: ${est.confidence}`, 30, y + 38);
    const reasonLines = doc.splitTextToSize(est.reasoning, 150);
    doc.text(reasonLines, 30, y + 45);
  }

  // ========== PAGE 6: ACTION PLAN ==========
  doc.addPage();
  darkPage(doc, 6);
  y = 18;

  y = sectionTitle(doc, "IMMEDIATE ACTIONS (Priority Order)", y);
  y = bullets(doc, a.immediateActions || [], y, C.accent);
  y += 4;

  y = sectionTitle(doc, "BEHAVIORS TO MAINTAIN", y);
  y = bullets(doc, a.thingsToMaintain || [], y, C.green);
  y += 4;

  y = sectionTitle(doc, "THINGS TO STOP", y);
  y = bullets(doc, a.thingsToStop || [], y, C.red);

  // ========== PAGE 7: LINEA STRATEGY + TIMELINE ==========
  doc.addPage();
  darkPage(doc, 7);
  y = 18;

  y = sectionTitle(doc, "LINEA NETWORK STRATEGY", y);
  y = para(doc, a.lineaStrategy, y);
  y += 2;

  const lineaActions = [
    "Bridge ETH to Linea via MetaMask Bridge — portfolio.metamask.io/bridge",
    "Swap tokens on SyncSwap, Horizon DEX, or EchoDEX on Linea",
    "Provide liquidity on Linea DEXs for deeper engagement signals",
    "Use lending protocols on Linea (LineaBank/Mendi Finance)",
    "Interact with Linea's native ecosystem dApps weekly",
    "Maintain consistent activity for 8+ weeks before snapshot",
  ];
  y = bullets(doc, lineaActions, y, C.accent);
  y += 5;

  y = sectionTitle(doc, "TIMELINE & URGENCY", y);
  y = para(doc, a.timelineEstimate, y);
  y += 3;

  // Timeline box
  doc.setFillColor(...C.darkCard);
  doc.roundedRect(20, y, 170, 55, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(...C.primary);
  doc.text("KEY MILESTONES", 30, y + 12);
  doc.setFontSize(8);
  doc.setTextColor(...C.text);
  const milestones = [
    "• Sept 2025: CEO Joseph Lubin confirms $MASK token",
    "• Q1 2026: MetaMask Rewards Seasons actively tracking engagement",
    "• Q2-Q3 2026: Expected snapshot/token launch window",
    "• NOW → 30-90 days: Critical window to improve eligibility",
    "• Post-snapshot: No further improvements possible",
  ];
  milestones.forEach((m, i) => doc.text(m, 30, y + 22 + i * 7));

  y += 65;

  // Final CTA
  doc.setFillColor(246, 133, 27);
  doc.roundedRect(20, y, 170, 30, 3, 3, "F");
  doc.setFontSize(11);
  doc.setTextColor(...C.dark);
  doc.text("Re-check your score anytime at metadrop.app", cx, y + 13, { align: "center" });
  doc.setFontSize(8);
  doc.text("Track your progress as you implement these recommendations.", cx, y + 22, { align: "center" });

  // Save
  const filename = `MetaDrop_Report_${data.walletAddress.slice(0, 8)}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
