import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ReportData {
  walletAddress: string;
  email: string;
  generatedAt: string;
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
  };
}

// Colors matching our design system
const COLORS = {
  primary: [246, 133, 27] as [number, number, number],      // MetaMask orange
  dark: [12, 14, 24] as [number, number, number],            // Dark background
  darkCard: [18, 22, 38] as [number, number, number],        // Card bg
  text: [220, 225, 240] as [number, number, number],         // Light text
  muted: [120, 130, 155] as [number, number, number],        // Muted text
  green: [74, 222, 128] as [number, number, number],         // Success
  red: [248, 113, 113] as [number, number, number],          // Danger
  accent: [0, 230, 230] as [number, number, number],         // Cyan accent
  white: [255, 255, 255] as [number, number, number],
};

function addPageHeader(doc: jsPDF, pageNum: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Dark background
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Top bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 3, "F");

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text("MetaDrop Premium Report — Confidential", 20, pageHeight - 10);
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 40, pageHeight - 10);
}

function addSectionTitle(doc: jsPDF, title: string, y: number, icon?: string): number {
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.primary);
  const displayTitle = icon ? `${icon}  ${title}` : title;
  doc.text(displayTitle, 20, y);
  
  // Underline
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(20, y + 3, 190, y + 3);
  
  return y + 12;
}

function addBulletList(doc: jsPDF, items: string[], startY: number, color: [number, number, number] = COLORS.text): number {
  let y = startY;
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(10);
  items.forEach((item) => {
    if (y > pageHeight - 30) return;
    
    doc.setTextColor(...COLORS.primary);
    doc.text("►", 24, y);
    doc.setTextColor(...color);
    
    const lines = doc.splitTextToSize(item, 155);
    doc.text(lines, 32, y);
    y += lines.length * 5 + 3;
  });
  
  return y;
}

function addParagraph(doc: jsPDF, text: string, y: number, color: [number, number, number] = COLORS.text): number {
  doc.setFontSize(10);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, 165);
  doc.text(lines, 22, y);
  return y + lines.length * 5 + 4;
}

export function generateReport(data: ReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ============ PAGE 1: COVER ============
  doc.setFillColor(...COLORS.dark);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Orange gradient bar at top
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 6, "F");

  // Logo area
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.primary);
  doc.text("METADROP", pageWidth / 2, 50, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(...COLORS.muted);
  doc.text("PREMIUM ELIGIBILITY REPORT", pageWidth / 2, 62, { align: "center" });

  // Score circle (simulated)
  const centerX = pageWidth / 2;
  const centerY = 110;
  
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(3);
  doc.circle(centerX, centerY, 30);
  
  doc.setFontSize(42);
  const tierColor = data.score.tier === "High" ? COLORS.green : data.score.tier === "Medium" ? COLORS.primary : COLORS.red;
  doc.setTextColor(...tierColor);
  doc.text(`${data.score.score}`, centerX, centerY + 5, { align: "center" });
  
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.muted);
  doc.text("/100", centerX + 20, centerY + 5);

  // Tier badge
  doc.setFontSize(16);
  doc.setTextColor(...tierColor);
  const tierLabel = data.score.tier === "High" ? "STRONG CANDIDATE" : data.score.tier === "Medium" ? "MODERATE CHANCE" : "NEEDS IMPROVEMENT";
  doc.text(`${data.score.tier.toUpperCase()} — ${tierLabel}`, centerX, centerY + 45, { align: "center" });

  // Wallet info
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  doc.text(`Wallet: ${data.walletAddress.slice(0, 10)}...${data.walletAddress.slice(-8)}`, centerX, 180, { align: "center" });
  doc.text(`Generated: ${new Date(data.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, centerX, 188, { align: "center" });
  doc.text(`Prepared for: ${data.email}`, centerX, 196, { align: "center" });

  // Stats row
  const statsY = 220;
  const stats = [
    { label: "Transactions", value: data.onChainData.totalTransactions.toLocaleString() },
    { label: "Wallet Age", value: `${data.onChainData.walletAgeYears}yr` },
    { label: "Contracts", value: data.onChainData.uniqueContracts.toString() },
    { label: "ETH Volume", value: `${data.onChainData.totalEthVolume}` },
  ];

  const statWidth = (pageWidth - 40) / stats.length;
  stats.forEach((stat, i) => {
    const x = 20 + i * statWidth + statWidth / 2;
    doc.setFontSize(18);
    doc.setTextColor(...COLORS.white);
    doc.text(stat.value, x, statsY, { align: "center" });
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(stat.label.toUpperCase(), x, statsY + 8, { align: "center" });
  });

  // Disclaimer
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text("This report is speculative analysis based on on-chain data. Not financial advice.", centerX, pageHeight - 15, { align: "center" });
  doc.text("MetaDrop is not affiliated with MetaMask, ConsenSys, or any related entity.", centerX, pageHeight - 10, { align: "center" });

  // ============ PAGE 2: EXECUTIVE SUMMARY + ACTIVITY BREAKDOWN ============
  doc.addPage();
  addPageHeader(doc, 2, 5);
  let y = 20;

  y = addSectionTitle(doc, "EXECUTIVE SUMMARY", y);
  y = addParagraph(doc, data.analysis.executiveSummary, y);
  y += 5;

  y = addSectionTitle(doc, "ON-CHAIN ACTIVITY BREAKDOWN", y);

  // Activity table
  const activityRows = data.score.activities.map((a: any) => [
    a.detected ? "✓" : "✗",
    a.label,
    a.detail || "",
    `${a.earnedPoints}/${a.weight}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Status", "Activity", "Details", "Points"]],
    body: activityRows,
    theme: "plain",
    styles: {
      fillColor: COLORS.darkCard,
      textColor: COLORS.text,
      fontSize: 9,
      cellPadding: 4,
      lineColor: [40, 50, 70],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [30, 35, 55],
      textColor: COLORS.primary,
      fontStyle: "bold",
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 15, halign: "center" },
      1: { cellWidth: 40 },
      2: { cellWidth: 90 },
      3: { cellWidth: 25, halign: "center" },
    },
    didParseCell: (data) => {
      if (data.column.index === 0 && data.section === "body") {
        const val = data.cell.raw as string;
        if (val === "✓") {
          data.cell.styles.textColor = COLORS.green;
        } else {
          data.cell.styles.textColor = COLORS.red;
        }
      }
    },
    margin: { left: 20, right: 20 },
  });

  // ============ PAGE 3: STRENGTHS, WEAKNESSES, RISKS ============
  doc.addPage();
  addPageHeader(doc, 3, 5);
  y = 20;

  y = addSectionTitle(doc, "STRENGTHS", y);
  y = addBulletList(doc, data.analysis.strengths, y, COLORS.green);
  y += 5;

  y = addSectionTitle(doc, "WEAKNESSES", y);
  y = addBulletList(doc, data.analysis.weaknesses, y, COLORS.red);
  y += 5;

  y = addSectionTitle(doc, "RISK FACTORS", y);
  y = addBulletList(doc, data.analysis.riskFactors, y, COLORS.muted);
  y += 5;

  if (y < pageHeight - 60) {
    y = addSectionTitle(doc, "HISTORICAL COMPARISON", y);
    y = addParagraph(doc, data.analysis.historicalComparison, y);
  }

  // ============ PAGE 4: ACTION PLAN ============
  doc.addPage();
  addPageHeader(doc, 4, 5);
  y = 20;

  y = addSectionTitle(doc, "IMMEDIATE ACTIONS TO TAKE", y);
  y = addBulletList(doc, data.analysis.immediateActions, y, COLORS.accent);
  y += 5;

  y = addSectionTitle(doc, "THINGS TO MAINTAIN", y);
  y = addBulletList(doc, data.analysis.thingsToMaintain, y, COLORS.green);
  y += 5;

  y = addSectionTitle(doc, "THINGS TO STOP", y);
  y = addBulletList(doc, data.analysis.thingsToStop, y, COLORS.red);

  // ============ PAGE 5: LINEA STRATEGY + TIMELINE ============
  doc.addPage();
  addPageHeader(doc, 5, 5);
  y = 20;

  y = addSectionTitle(doc, "LINEA NETWORK STRATEGY", y);
  y = addParagraph(doc, data.analysis.lineaStrategy, y);
  y += 5;

  // Linea action items
  const lineaActions = [
    "Bridge ETH to Linea via MetaMask Bridge (portfolio.metamask.io/bridge)",
    "Use DeFi protocols on Linea: SyncSwap, Horizon DEX, LineaBank",
    "Provide liquidity on Linea DEXs for bonus interaction signals",
    "Interact with Linea's native dApps and ecosystem projects",
    "Keep consistent weekly activity on Linea — not just one-time usage",
  ];
  y = addBulletList(doc, lineaActions, y, COLORS.accent);
  y += 5;

  y = addSectionTitle(doc, "TIMELINE & URGENCY", y);
  y = addParagraph(doc, data.analysis.timelineEstimate, y);
  y += 5;

  // Key dates box
  doc.setFillColor(...COLORS.darkCard);
  doc.roundedRect(20, y, 170, 50, 3, 3, "F");
  
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.primary);
  doc.text("KEY MILESTONES", 30, y + 12);
  
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  const milestones = [
    "• Sept 2025: CEO Joseph Lubin confirms $MASK token \"coming soon\"",
    "• Q1 2026: MetaMask Rewards Seasons actively tracking engagement",
    "• Q2-Q3 2026: Expected snapshot/token launch window",
    "• Action window: 30-60 days to meaningfully improve eligibility",
  ];
  milestones.forEach((m, i) => {
    doc.text(m, 30, y + 22 + i * 7);
  });

  y += 65;

  // Final CTA box
  doc.setFillColor(246, 133, 27, 0.15);
  doc.roundedRect(20, y, 170, 35, 3, 3, "F");
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, y, 170, 35, 3, 3, "S");

  doc.setFontSize(12);
  doc.setTextColor(...COLORS.primary);
  doc.text("Need help implementing these recommendations?", centerX, y + 14, { align: "center" });
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text("Re-check your score anytime at metadrop.app — track your progress as you improve.", centerX, y + 24, { align: "center" });

  // Save
  const filename = `MetaDrop_Report_${data.walletAddress.slice(0, 8)}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}
