export interface WalletActivity {
  id: string;
  label: string;
  description: string;
  weight: number;
  detected: boolean;
  category: "swap" | "bridge" | "staking" | "governance" | "nft" | "usage";
  boostAction?: string;
  boostLink?: string;
}

export interface ScoringResult {
  address: string;
  score: number;
  tier: "High" | "Medium" | "Low";
  activities: WalletActivity[];
  totalTransactions: number;
  walletAge: string;
  networksUsed: number;
}

const ACTIVITY_TEMPLATES: Omit<WalletActivity, "detected">[] = [
  {
    id: "swap_volume",
    label: "MetaMask Swap Usage",
    description: "Used MetaMask's built-in swap aggregator with significant volume",
    weight: 20,
    category: "swap",
    boostAction: "Make swaps through MetaMask",
    boostLink: "https://portfolio.metamask.io/swap",
  },
  {
    id: "bridge_usage",
    label: "Cross-Chain Bridge Activity",
    description: "Bridged assets across chains using MetaMask Bridge or Linea Bridge",
    weight: 18,
    category: "bridge",
    boostAction: "Bridge assets via MetaMask Bridge",
    boostLink: "https://portfolio.metamask.io/bridge",
  },
  {
    id: "linea_activity",
    label: "Linea Network Activity",
    description: "Transacted on Linea (ConsenSys L2) — strong signal for eligibility",
    weight: 22,
    category: "usage",
    boostAction: "Use dApps on Linea network",
    boostLink: "https://linea.build/",
  },
  {
    id: "staking",
    label: "ETH Staking via MetaMask",
    description: "Staked ETH through MetaMask Portfolio staking feature",
    weight: 15,
    category: "staking",
    boostAction: "Stake ETH through MetaMask",
    boostLink: "https://portfolio.metamask.io/stake",
  },
  {
    id: "snaps_usage",
    label: "MetaMask Snaps Installed",
    description: "Installed and used MetaMask Snaps (extensibility platform)",
    weight: 12,
    category: "usage",
    boostAction: "Install MetaMask Snaps",
    boostLink: "https://snaps.metamask.io/",
  },
  {
    id: "nft_activity",
    label: "NFT Transactions",
    description: "Minted, bought, or sold NFTs through MetaMask",
    weight: 8,
    category: "nft",
    boostAction: "Interact with NFT marketplaces",
  },
  {
    id: "governance",
    label: "Governance Participation",
    description: "Voted in on-chain governance proposals",
    weight: 10,
    category: "governance",
    boostAction: "Vote on Snapshot or Tally",
  },
  {
    id: "multi_chain",
    label: "Multi-Chain Usage",
    description: "Active on 3+ EVM networks (Ethereum, Polygon, Arbitrum, etc.)",
    weight: 14,
    category: "usage",
    boostAction: "Use MetaMask on multiple networks",
  },
  {
    id: "wallet_age",
    label: "Wallet Age (1+ Year)",
    description: "Wallet has been active for over a year — early user signal",
    weight: 10,
    category: "usage",
  },
  {
    id: "metamask_card",
    label: "MetaMask Card Holder",
    description: "Applied for or uses the MetaMask Card",
    weight: 8,
    category: "usage",
    boostAction: "Apply for MetaMask Card",
    boostLink: "https://metamask.io/card/",
  },
];

function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function pseudoRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  };
}

export function analyzeWallet(address: string): ScoringResult {
  if (!isValidEthAddress(address)) {
    throw new Error("Invalid Ethereum address");
  }

  const rng = pseudoRandom(address.toLowerCase());

  const activities: WalletActivity[] = ACTIVITY_TEMPLATES.map((template) => ({
    ...template,
    detected: rng() > 0.4,
  }));

  const score = activities.reduce(
    (sum, a) => sum + (a.detected ? a.weight : 0),
    0
  );

  const maxScore = activities.reduce((sum, a) => sum + a.weight, 0);
  const normalizedScore = Math.round((score / maxScore) * 100);

  const tier: "High" | "Medium" | "Low" =
    normalizedScore >= 65 ? "High" : normalizedScore >= 35 ? "Medium" : "Low";

  const totalTransactions = Math.floor(rng() * 800) + 20;
  const ageYears = (rng() * 5 + 0.5).toFixed(1);
  const networksUsed = Math.floor(rng() * 8) + 1;

  return {
    address,
    score: normalizedScore,
    tier,
    activities,
    totalTransactions,
    walletAge: `${ageYears} years`,
    networksUsed,
  };
}

export { isValidEthAddress };
