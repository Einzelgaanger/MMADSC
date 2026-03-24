import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ===================== ETHERSCAN =====================
async function fetchEtherscanData(address: string, apiKey: string) {
  const baseUrl = 'https://api.etherscan.io/api';
  
  const [txRes, tokenRes, internalRes, erc721Res] = await Promise.all([
    fetch(`${baseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=500&sort=asc&apikey=${apiKey}`),
    fetch(`${baseUrl}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=300&sort=desc&apikey=${apiKey}`),
    fetch(`${baseUrl}?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${apiKey}`),
    fetch(`${baseUrl}?module=account&action=tokennfttx&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${apiKey}`),
  ]);

  const [txData, tokenData, internalData, erc721Data] = await Promise.all([
    txRes.json(), tokenRes.json(), internalRes.json(), erc721Res.json(),
  ]);

  const transactions = txData.status === '1' ? txData.result : [];
  const tokenTransfers = tokenData.status === '1' ? tokenData.result : [];
  const internalTxs = internalData.status === '1' ? internalData.result : [];
  const nftTransfers = erc721Data.status === '1' ? erc721Data.result : [];

  const firstTxTimestamp = transactions.length > 0 ? parseInt(transactions[0].timeStamp) : 0;
  const walletAgeYears = firstTxTimestamp > 0
    ? parseFloat(((Date.now() / 1000 - firstTxTimestamp) / (365.25 * 24 * 3600)).toFixed(1))
    : 0;

  const uniqueContracts = new Set(transactions.filter((tx: any) => tx.to).map((tx: any) => tx.to.toLowerCase()));

  // DEX routers
  const dexRouters = [
    '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', '0xe592427a0aece92de3edee1f18e0157c05861564',
    '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f', '0x1111111254fb6c44bac0bed2854e76f90643097d',
    '0xdef1c0ded9bec7f1a1670819833240f027b25eff', '0x881d40237659c251811cec9c364ef91dc08d300c',
    '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad', // Uniswap Universal Router
  ];
  const swapTxs = transactions.filter((tx: any) => tx.to && dexRouters.includes(tx.to.toLowerCase()));

  // Bridge contracts
  const bridgeContracts = [
    '0x3154cf16ccdb4c6d922629664174b904d80f2c35', '0x8315177ab297ba92a06054ce80a67ed4dbd7ed3a',
    '0x99c9fc46f92e8a1c0dec1b1747d010903e884be1', '0xd19d4b5d358258f05d7b411e21a1460d11b0876f',
    '0x2796317b0ff8538f253012862c06787adfb8ceb6', // Linea Bridge
  ];
  const bridgeTxs = transactions.filter((tx: any) => tx.to && bridgeContracts.includes(tx.to.toLowerCase()));

  // Staking
  const stakingContracts = [
    '0xae7ab96520de3a18e5e111b5eaab095312d7fe84', '0xdd9bc35ae942ef0cfa76930954a156b3ff30a4e1',
    '0xfe2e637202056d30016725477c5da089ab0a043a', // sfrxETH
  ];
  const stakingTxs = transactions.filter((tx: any) => tx.to && stakingContracts.includes(tx.to.toLowerCase()));

  // Governance
  const governanceSignatures = ['castVote', 'castVoteWithReason', 'castVoteBySig', 'vote', 'submitVote'];
  const governanceTxs = transactions.filter((tx: any) =>
    tx.functionName && governanceSignatures.some((sig: string) => tx.functionName?.includes(sig))
  );

  const totalEthVolume = transactions.reduce((sum: number, tx: any) => sum + parseFloat(tx.value) / 1e18, 0);
  const uniqueTokens = new Set(tokenTransfers.map((t: any) => t.contractAddress?.toLowerCase()));

  // Gas spent (in ETH)
  const totalGasSpent = transactions.reduce((sum: number, tx: any) => {
    return sum + (parseFloat(tx.gasUsed || '0') * parseFloat(tx.gasPrice || '0')) / 1e18;
  }, 0);

  const recentActivity = transactions.filter((tx: any) => {
    const txTime = parseInt(tx.timeStamp) * 1000;
    return Date.now() - txTime < 90 * 24 * 3600 * 1000;
  }).length;

  // Monthly activity distribution
  const monthlyActivity: Record<string, number> = {};
  transactions.forEach((tx: any) => {
    const date = new Date(parseInt(tx.timeStamp) * 1000);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyActivity[key] = (monthlyActivity[key] || 0) + 1;
  });

  return {
    totalTransactions: transactions.length,
    walletAgeYears,
    uniqueContracts: uniqueContracts.size,
    swapCount: swapTxs.length,
    bridgeCount: bridgeTxs.length,
    stakingCount: stakingTxs.length,
    nftTransferCount: nftTransfers.length,
    governanceCount: governanceTxs.length,
    totalEthVolume: Math.round(totalEthVolume * 1000) / 1000,
    uniqueTokens: uniqueTokens.size,
    tokenTransferCount: tokenTransfers.length,
    internalTxCount: internalTxs.length,
    totalGasSpentETH: Math.round(totalGasSpent * 10000) / 10000,
    firstTxDate: firstTxTimestamp > 0 ? new Date(firstTxTimestamp * 1000).toISOString().split('T')[0] : 'N/A',
    lastTxDate: transactions.length > 0 ? new Date(parseInt(transactions[transactions.length - 1].timeStamp) * 1000).toISOString().split('T')[0] : 'N/A',
    recentActivity,
    activeMonths: Object.keys(monthlyActivity).length,
    monthlyActivity,
  };
}

// ===================== ALCHEMY =====================
async function fetchAlchemyData(address: string, apiKey: string) {
  const baseUrl = `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;

  try {
    const [balanceRes, nftRes, tokenRes] = await Promise.all([
      fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getBalance', params: [address, 'latest'] }),
      }),
      fetch(`${baseUrl}/getNFTs?owner=${address}&pageSize=100`),
      fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'alchemy_getTokenBalances', params: [address] }),
      }),
    ]);

    const [balanceData, nftData, tokenData] = await Promise.all([
      balanceRes.json(), nftRes.json(), tokenRes.json(),
    ]);

    const ethBalance = balanceData.result ? parseInt(balanceData.result, 16) / 1e18 : 0;
    const nftsOwned = nftData.ownedNfts?.length || nftData.totalCount || 0;
    const nftCollections = new Set(nftData.ownedNfts?.map((n: any) => n.contract?.address) || []);
    
    const tokenBalances = tokenData.result?.tokenBalances || [];
    const nonZeroTokens = tokenBalances.filter((t: any) => t.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000');

    return {
      ethBalance: Math.round(ethBalance * 10000) / 10000,
      nftsOwned,
      nftCollections: nftCollections.size,
      tokenHoldings: nonZeroTokens.length,
      topNFTs: (nftData.ownedNfts || []).slice(0, 5).map((n: any) => ({
        name: n.title || n.contract?.name || 'Unknown',
        collection: n.contract?.name || 'Unknown',
      })),
    };
  } catch (e) {
    console.error('Alchemy fetch error:', e);
    return { ethBalance: 0, nftsOwned: 0, nftCollections: 0, tokenHoldings: 0, topNFTs: [] };
  }
}

// ===================== MORALIS (Multi-chain) =====================
async function fetchMoralisData(address: string, apiKey: string) {
  const headers = { 'X-API-Key': apiKey, 'Accept': 'application/json' };
  const chains = ['eth', 'polygon', 'bsc', 'arbitrum', 'optimism', 'avalanche', 'base', 'linea'];

  try {
    const chainResults = await Promise.all(
      chains.map(async (chain) => {
        try {
          const res = await fetch(
            `https://deep-index.moralis.io/api/v2.2/${address}?chain=${chain}&limit=1`,
            { headers }
          );
          if (!res.ok) return { chain, txCount: 0, active: false };
          const data = await res.json();
          return { chain, txCount: data.result?.length || 0, active: (data.result?.length || 0) > 0 };
        } catch {
          return { chain, txCount: 0, active: false };
        }
      })
    );

    // Get DeFi positions
    let defiPositions: any[] = [];
    try {
      const defiRes = await fetch(
        `https://deep-index.moralis.io/api/v2.2/wallets/${address}/defi/positions?chain=eth`,
        { headers }
      );
      if (defiRes.ok) {
        const defiData = await defiRes.json();
        defiPositions = defiData.result || [];
      }
    } catch { /* ignore */ }

    // Get wallet net worth
    let netWorth: any = null;
    try {
      const nwRes = await fetch(
        `https://deep-index.moralis.io/api/v2.2/wallets/${address}/net-worth?chains[]=eth&chains[]=polygon&chains[]=arbitrum&chains[]=optimism&chains[]=base&chains[]=linea&exclude_spam=true`,
        { headers }
      );
      if (nwRes.ok) {
        netWorth = await nwRes.json();
      }
    } catch { /* ignore */ }

    const activeChains = chainResults.filter(c => c.active);

    return {
      chainsActive: activeChains.map(c => c.chain),
      totalChainsUsed: activeChains.length,
      chainBreakdown: chainResults,
      defiPositions: defiPositions.slice(0, 10),
      defiProtocolsUsed: new Set(defiPositions.map((p: any) => p.protocol_name)).size,
      totalNetWorthUSD: netWorth?.total_networth_usd || null,
      chainNetWorth: netWorth?.chains || [],
    };
  } catch (e) {
    console.error('Moralis fetch error:', e);
    return { chainsActive: [], totalChainsUsed: 0, chainBreakdown: [], defiPositions: [], defiProtocolsUsed: 0, totalNetWorthUSD: null, chainNetWorth: [] };
  }
}

// ===================== LINEA (ConsenSys L2) =====================
async function fetchLineaData(address: string) {
  try {
    const baseUrl = 'https://api.lineascan.build/api';
    // Lineascan uses Etherscan-compatible API (free, no key needed for basic)
    const [txRes, tokenRes] = await Promise.all([
      fetch(`${baseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=200&sort=desc`),
      fetch(`${baseUrl}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc`),
    ]);

    const [txData, tokenData] = await Promise.all([txRes.json(), tokenRes.json()]);
    const lineaTxs = txData.status === '1' ? txData.result : [];
    const lineaTokenTxs = tokenData.status === '1' ? tokenData.result : [];

    const lineaContracts = new Set(lineaTxs.map((tx: any) => tx.to?.toLowerCase()).filter(Boolean));
    
    // Check for known Linea DeFi protocols
    const lineaDeFiContracts = [
      '0x272e156df8da513c69cb41cc7a99185d53f926bb', // SyncSwap
      '0x80115c708e12edd42e504c1cd52aea96c547c05c', // LineaBank/Mendi
    ];
    const lineaDeFiInteractions = lineaTxs.filter((tx: any) => 
      tx.to && lineaDeFiContracts.includes(tx.to.toLowerCase())
    ).length;

    const firstLineaTx = lineaTxs.length > 0 ? lineaTxs[lineaTxs.length - 1] : null;
    const lineaAge = firstLineaTx ? 
      ((Date.now() / 1000 - parseInt(firstLineaTx.timeStamp)) / (30 * 24 * 3600)).toFixed(1) : '0';

    return {
      lineaTransactions: lineaTxs.length,
      lineaTokenTransfers: lineaTokenTxs.length,
      lineaUniqueContracts: lineaContracts.size,
      lineaDeFiInteractions,
      lineaAgeMonths: parseFloat(lineaAge),
      lineaFirstTx: firstLineaTx ? new Date(parseInt(firstLineaTx.timeStamp) * 1000).toISOString().split('T')[0] : 'N/A',
      lineaActive: lineaTxs.length > 0,
    };
  } catch (e) {
    console.error('Linea fetch error:', e);
    return { lineaTransactions: 0, lineaTokenTransfers: 0, lineaUniqueContracts: 0, lineaDeFiInteractions: 0, lineaAgeMonths: 0, lineaFirstTx: 'N/A', lineaActive: false };
  }
}

// ===================== DEFILLAMA (Free, no key) =====================
async function fetchDefiLlamaData(address: string) {
  try {
    // DefiLlama protocol interactions check — query wallet's protocol participation
    const res = await fetch(`https://api.llama.fi/protocol-interactions/${address}`);
    
    // Alternative: check known protocols the wallet may have used
    const knownProtocols = [
      { name: 'Uniswap', slug: 'uniswap' },
      { name: 'Aave', slug: 'aave' },
      { name: 'Lido', slug: 'lido' },
      { name: 'Compound', slug: 'compound' },
      { name: 'Curve', slug: 'curve-dex' },
      { name: 'Maker', slug: 'makerdao' },
      { name: 'Convex', slug: 'convex-finance' },
      { name: 'Balancer', slug: 'balancer' },
      { name: 'Yearn', slug: 'yearn-finance' },
      { name: 'SushiSwap', slug: 'sushi' },
    ];

    // Get top DeFi protocols TVL for context
    const protocolsRes = await fetch('https://api.llama.fi/protocols');
    let topProtocols: any[] = [];
    if (protocolsRes.ok) {
      const allProtocols = await protocolsRes.json();
      topProtocols = allProtocols
        .filter((p: any) => p.category && p.tvl > 100000000)
        .slice(0, 20)
        .map((p: any) => ({ name: p.name, tvl: p.tvl, category: p.category, chains: p.chains?.slice(0, 5) }));
    }

    return {
      knownProtocols: knownProtocols.map(p => p.name),
      topDeFiProtocols: topProtocols,
      defiLandscape: topProtocols.length > 0 ? 'Available' : 'Limited data',
    };
  } catch (e) {
    console.error('DefiLlama fetch error:', e);
    return { knownProtocols: [], topDeFiProtocols: [], defiLandscape: 'Unavailable' };
  }
}

// ===================== THE GRAPH (Uniswap subgraph) =====================
async function fetchTheGraphData(address: string) {
  try {
    const uniswapQuery = {
      query: `{
        swaps(first: 100, where: {sender: "${address.toLowerCase()}"}, orderBy: timestamp, orderDirection: desc) {
          id
          timestamp
          amount0
          amount1
          amountUSD
          pool { token0 { symbol } token1 { symbol } }
        }
      }`
    };

    const res = await fetch('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(uniswapQuery),
    });

    if (!res.ok) {
      // Try origin endpoint
      const res2 = await fetch('https://gateway.thegraph.com/api/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uniswapQuery),
      });
      if (!res2.ok) return { uniswapSwaps: 0, uniswapVolumeUSD: 0, topPairs: [] };
      const data2 = await res2.json();
      const swaps = data2.data?.swaps || [];
      return processSwaps(swaps);
    }

    const data = await res.json();
    const swaps = data.data?.swaps || [];
    return processSwaps(swaps);
  } catch (e) {
    console.error('The Graph fetch error:', e);
    return { uniswapSwaps: 0, uniswapVolumeUSD: 0, topPairs: [] };
  }
}

function processSwaps(swaps: any[]) {
  const totalVolume = swaps.reduce((sum: number, s: any) => sum + parseFloat(s.amountUSD || '0'), 0);
  const pairs: Record<string, number> = {};
  swaps.forEach((s: any) => {
    const pair = `${s.pool?.token0?.symbol || '?'}/${s.pool?.token1?.symbol || '?'}`;
    pairs[pair] = (pairs[pair] || 0) + 1;
  });
  const topPairs = Object.entries(pairs)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([pair, count]) => ({ pair, count }));

  return {
    uniswapSwaps: swaps.length,
    uniswapVolumeUSD: Math.round(totalVolume * 100) / 100,
    topPairs,
  };
}

// ===================== DUNE ANALYTICS =====================
async function fetchDuneData(address: string, apiKey: string) {
  try {
    // Execute a query for wallet analysis
    // Using a simple query to get wallet stats
    const executeRes = await fetch('https://api.dune.com/api/v1/query/3521251/execute', {
      method: 'POST',
      headers: {
        'X-Dune-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query_parameters: { wallet_address: address.toLowerCase() } }),
    });

    if (!executeRes.ok) {
      // Fallback: try to get general wallet labels
      return { duneLabels: [], duneInsights: 'Query not available' };
    }

    const executeData = await executeRes.json();
    const executionId = executeData.execution_id;

    if (!executionId) return { duneLabels: [], duneInsights: 'No execution ID' };

    // Poll for results (max 15 seconds)
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const statusRes = await fetch(`https://api.dune.com/api/v1/execution/${executionId}/results`, {
        headers: { 'X-Dune-API-Key': apiKey },
      });
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.state === 'QUERY_STATE_COMPLETED') {
          return {
            duneLabels: statusData.result?.rows?.map((r: any) => r.label || r.tag) || [],
            duneInsights: 'Available',
            duneData: statusData.result?.rows?.slice(0, 10) || [],
          };
        }
      }
    }
    return { duneLabels: [], duneInsights: 'Query timeout' };
  } catch (e) {
    console.error('Dune fetch error:', e);
    return { duneLabels: [], duneInsights: 'Error' };
  }
}

// ===================== NANSEN =====================
async function fetchNansenData(address: string, apiKey: string) {
  try {
    const res = await fetch(`https://api.nansen.ai/v1/address/${address}/labels`, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' },
    });

    if (!res.ok) {
      // Try alternative endpoint
      const res2 = await fetch(`https://api.nansen.ai/v1/address/labels?address=${address}`, {
        headers: { 'api-key': apiKey, 'Accept': 'application/json' },
      });
      if (!res2.ok) return { nansenLabels: [], isSmartMoney: false, isAirdropFarmer: false, walletType: 'Unknown' };
      const data2 = await res2.json();
      return processNansenLabels(data2);
    }

    const data = await res.json();
    return processNansenLabels(data);
  } catch (e) {
    console.error('Nansen fetch error:', e);
    return { nansenLabels: [], isSmartMoney: false, isAirdropFarmer: false, walletType: 'Unknown' };
  }
}

function processNansenLabels(data: any) {
  const labels = data.labels || data.data?.labels || [];
  const labelNames = labels.map((l: any) => typeof l === 'string' ? l : l.name || l.label || '');
  
  return {
    nansenLabels: labelNames,
    isSmartMoney: labelNames.some((l: string) => l.toLowerCase().includes('smart money')),
    isAirdropFarmer: labelNames.some((l: string) => l.toLowerCase().includes('airdrop') || l.toLowerCase().includes('farmer')),
    isWhale: labelNames.some((l: string) => l.toLowerCase().includes('whale')),
    walletType: labelNames.length > 0 ? labelNames[0] : 'Unlabeled',
  };
}

// ===================== METAMASK SNAPS =====================
async function checkSnapsUsage(address: string, transactions: any) {
  // MetaMask Snaps interactions can be detected through specific contract interactions
  // The Snaps registry doesn't directly link to wallet addresses, but we can check
  // for interactions with known Snap-related contracts
  const snapRelatedContracts = [
    '0x1a7e4e63778b4f12a199c062f3efdd288afcbce8', // MetaMask Institutional
  ];

  // Check if user has interacted with MetaMask-specific infrastructure
  const hasSnapInteractions = false; // Would need deeper analysis
  
  return {
    snapsDetected: hasSnapInteractions,
    snapsNote: 'Snaps usage is primarily detected through MetaMask client data, not on-chain. Consider installing Snaps for bonus eligibility signals.',
  };
}

// ===================== ENHANCED SCORING =====================
function calculateEnhancedScore(etherscan: any, alchemy: any, moralis: any, linea: any, theGraph: any, nansen: any) {
  let score = 0;
  const maxScore = 200;
  const activities: any[] = [];

  // 1. Swap activity (max 20pts)
  const combinedSwaps = etherscan.swapCount + (theGraph.uniswapSwaps || 0);
  const swapScore = Math.min(20, combinedSwaps * 1.5);
  activities.push({
    id: 'swap_volume', label: 'DEX Swap Activity', weight: 20,
    detected: combinedSwaps > 0, earnedPoints: Math.round(swapScore),
    detail: `${combinedSwaps} swaps detected (${etherscan.swapCount} on-chain + ${theGraph.uniswapSwaps || 0} Uniswap V3). Volume: $${theGraph.uniswapVolumeUSD?.toLocaleString() || '0'}`,
    category: 'swap',
  });
  score += swapScore;

  // 2. Bridge activity (max 18pts)
  const bridgeScore = Math.min(18, etherscan.bridgeCount * 5);
  activities.push({
    id: 'bridge_usage', label: 'Cross-Chain Bridge Activity', weight: 18,
    detected: etherscan.bridgeCount > 0, earnedPoints: Math.round(bridgeScore),
    detail: `${etherscan.bridgeCount} bridge transactions. Active on ${moralis.totalChainsUsed} chains: ${moralis.chainsActive.join(', ') || 'Ethereum only'}`,
    category: 'bridge',
  });
  score += bridgeScore;

  // 3. Linea activity — CRITICAL (max 25pts)
  const lineaScore = Math.min(25, linea.lineaTransactions * 2 + (linea.lineaDeFiInteractions * 3));
  activities.push({
    id: 'linea_activity', label: 'Linea Network Activity (ConsenSys L2)', weight: 25,
    detected: linea.lineaActive, earnedPoints: Math.round(lineaScore),
    detail: linea.lineaActive 
      ? `${linea.lineaTransactions} txs, ${linea.lineaUniqueContracts} contracts, ${linea.lineaDeFiInteractions} DeFi interactions. Active since ${linea.lineaFirstTx} (${linea.lineaAgeMonths} months)`
      : 'No Linea activity detected — this is likely the most impactful action to improve your score',
    category: 'usage',
  });
  score += lineaScore;

  // 4. Wallet age (max 12pts)
  const ageScore = Math.min(12, Math.floor(etherscan.walletAgeYears * 3));
  activities.push({
    id: 'wallet_age', label: 'Wallet Age & Longevity', weight: 12,
    detected: etherscan.walletAgeYears >= 0.5, earnedPoints: Math.round(ageScore),
    detail: `Active since ${etherscan.firstTxDate} (${etherscan.walletAgeYears} years). ${etherscan.activeMonths} active months.`,
    category: 'usage',
  });
  score += ageScore;

  // 5. Transaction volume (max 15pts)
  const txScore = Math.min(15, Math.floor(etherscan.totalTransactions / 15));
  activities.push({
    id: 'tx_volume', label: 'Transaction Volume', weight: 15,
    detected: etherscan.totalTransactions > 10, earnedPoints: Math.round(txScore),
    detail: `${etherscan.totalTransactions} total transactions. ${etherscan.totalEthVolume} ETH volume. ${etherscan.totalGasSpentETH} ETH in gas fees.`,
    category: 'usage',
  });
  score += txScore;

  // 6. Multi-chain usage (max 15pts)
  const chainScore = Math.min(15, moralis.totalChainsUsed * 3);
  activities.push({
    id: 'multi_chain', label: 'Multi-Chain Activity', weight: 15,
    detected: moralis.totalChainsUsed > 1, earnedPoints: Math.round(chainScore),
    detail: `Active on ${moralis.totalChainsUsed} chains: ${moralis.chainsActive.join(', ') || 'None detected'}`,
    category: 'usage',
  });
  score += chainScore;

  // 7. ETH Staking (max 15pts)
  const stakeScore = etherscan.stakingCount > 0 ? 15 : 0;
  activities.push({
    id: 'staking', label: 'ETH Staking Activity', weight: 15,
    detected: etherscan.stakingCount > 0, earnedPoints: stakeScore,
    detail: etherscan.stakingCount > 0 ? `${etherscan.stakingCount} staking transactions detected` : 'No staking activity. Stake ETH via MetaMask Portfolio for bonus signals.',
    category: 'staking',
  });
  score += stakeScore;

  // 8. NFT holdings (max 10pts)
  const nftScore = Math.min(10, (alchemy.nftsOwned || 0) * 0.5 + etherscan.nftTransferCount * 0.5);
  activities.push({
    id: 'nft_activity', label: 'NFT Portfolio & Activity', weight: 10,
    detected: (alchemy.nftsOwned || 0) > 0 || etherscan.nftTransferCount > 0, earnedPoints: Math.round(nftScore),
    detail: `${alchemy.nftsOwned || 0} NFTs owned across ${alchemy.nftCollections || 0} collections. ${etherscan.nftTransferCount} NFT transfers.`,
    category: 'nft',
  });
  score += nftScore;

  // 9. Governance (max 12pts)
  const govScore = etherscan.governanceCount > 0 ? Math.min(12, etherscan.governanceCount * 4) : 0;
  activities.push({
    id: 'governance', label: 'Governance Participation', weight: 12,
    detected: etherscan.governanceCount > 0, earnedPoints: Math.round(govScore),
    detail: etherscan.governanceCount > 0 ? `${etherscan.governanceCount} on-chain governance votes` : 'No governance votes detected. Vote on Snapshot or Tally.',
    category: 'governance',
  });
  score += govScore;

  // 10. DeFi protocol diversity (max 15pts)
  const defiScore = Math.min(15, (moralis.defiProtocolsUsed || 0) * 3 + etherscan.uniqueContracts * 0.1);
  activities.push({
    id: 'defi_diversity', label: 'DeFi Protocol Diversity', weight: 15,
    detected: (moralis.defiProtocolsUsed || 0) > 0 || etherscan.uniqueContracts > 10, earnedPoints: Math.round(defiScore),
    detail: `${moralis.defiProtocolsUsed || 0} DeFi protocols used. ${etherscan.uniqueContracts} unique contracts. ${alchemy.tokenHoldings || 0} token holdings.`,
    category: 'usage',
  });
  score += defiScore;

  // 11. Token diversity (max 10pts)
  const tokenScore = Math.min(10, etherscan.uniqueTokens * 0.5);
  activities.push({
    id: 'token_diversity', label: 'Token Diversity', weight: 10,
    detected: etherscan.uniqueTokens > 5, earnedPoints: Math.round(tokenScore),
    detail: `${etherscan.uniqueTokens} unique tokens interacted with. ${alchemy.tokenHoldings || 0} currently held.`,
    category: 'usage',
  });
  score += tokenScore;

  // 12. Recent activity (max 12pts)
  const recentScore = Math.min(12, etherscan.recentActivity * 0.5);
  activities.push({
    id: 'recent_activity', label: 'Recent Activity (90 days)', weight: 12,
    detected: etherscan.recentActivity > 5, earnedPoints: Math.round(recentScore),
    detail: `${etherscan.recentActivity} transactions in the last 90 days. Last activity: ${etherscan.lastTxDate}`,
    category: 'usage',
  });
  score += recentScore;

  // 13. Wallet value (max 10pts)
  const walletValue = moralis.totalNetWorthUSD || (alchemy.ethBalance || 0) * 3500;
  const valueScore = Math.min(10, Math.floor(walletValue / 1000));
  activities.push({
    id: 'wallet_value', label: 'Portfolio Value', weight: 10,
    detected: walletValue > 100, earnedPoints: Math.round(valueScore),
    detail: `Estimated portfolio: $${Math.round(walletValue).toLocaleString()}. ETH balance: ${alchemy.ethBalance || 0} ETH.`,
    category: 'usage',
  });
  score += valueScore;

  // 14. Nansen labels (bonus/penalty)
  let nansenBonus = 0;
  if (nansen.isSmartMoney) nansenBonus += 10;
  if (nansen.isWhale) nansenBonus += 5;
  if (nansen.isAirdropFarmer) nansenBonus -= 15; // Penalty for being flagged

  activities.push({
    id: 'nansen_profile', label: 'Wallet Profile (Nansen)', weight: 15,
    detected: nansen.nansenLabels.length > 0, earnedPoints: nansenBonus,
    detail: nansen.nansenLabels.length > 0 
      ? `Labels: ${nansen.nansenLabels.join(', ')}. ${nansen.isAirdropFarmer ? '⚠️ FLAGGED as potential airdrop farmer — this may reduce allocation.' : ''}`
      : 'No Nansen labels found — wallet appears organic.',
    category: 'usage',
  });
  score += nansenBonus;

  const normalizedScore = Math.max(0, Math.min(100, Math.round((score / maxScore) * 100)));
  const tier = normalizedScore >= 65 ? 'High' : normalizedScore >= 35 ? 'Medium' : 'Low';

  return { score: normalizedScore, tier, activities, rawScore: Math.round(score), maxScore };
}

// ===================== AI ANALYSIS =====================
async function generateAIAnalysis(allData: any, scoreData: any, address: string) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) return generateTemplateAnalysis(allData, scoreData);

  const { etherscan, alchemy, moralis, linea, theGraph, nansen, defiLlama } = allData;

  const prompt = `You are an elite crypto airdrop analyst. Analyze this wallet for MetaMask $MASK token airdrop eligibility. This is a PAID premium report — be extremely detailed and specific.

WALLET: ${address}

=== ETHERSCAN DATA ===
- Total transactions: ${etherscan.totalTransactions}
- Wallet age: ${etherscan.walletAgeYears} years (first tx: ${etherscan.firstTxDate}, last: ${etherscan.lastTxDate})
- Active months: ${etherscan.activeMonths}
- Swap transactions: ${etherscan.swapCount}
- Bridge transactions: ${etherscan.bridgeCount}
- Staking transactions: ${etherscan.stakingCount}
- NFT transfers: ${etherscan.nftTransferCount}
- Governance votes: ${etherscan.governanceCount}
- Unique contracts: ${etherscan.uniqueContracts}
- Unique tokens: ${etherscan.uniqueTokens}
- Total ETH volume: ${etherscan.totalEthVolume} ETH
- Gas spent: ${etherscan.totalGasSpentETH} ETH
- Recent activity (90d): ${etherscan.recentActivity} txs

=== ALCHEMY DATA ===
- ETH balance: ${alchemy.ethBalance} ETH
- NFTs owned: ${alchemy.nftsOwned} across ${alchemy.nftCollections} collections
- Token holdings: ${alchemy.tokenHoldings} active tokens

=== MORALIS MULTI-CHAIN ===
- Chains active: ${moralis.chainsActive?.join(', ') || 'Unknown'}
- Total chains: ${moralis.totalChainsUsed}
- DeFi protocols used: ${moralis.defiProtocolsUsed}
- Estimated net worth: $${moralis.totalNetWorthUSD || 'Unknown'}

=== LINEA (ConsenSys L2) ===
- Linea transactions: ${linea.lineaTransactions}
- Linea contracts: ${linea.lineaUniqueContracts}
- Linea DeFi interactions: ${linea.lineaDeFiInteractions}
- Linea active since: ${linea.lineaFirstTx} (${linea.lineaAgeMonths} months)

=== UNISWAP (The Graph) ===
- Uniswap V3 swaps: ${theGraph.uniswapSwaps}
- Uniswap volume: $${theGraph.uniswapVolumeUSD}
- Top pairs: ${theGraph.topPairs?.map((p: any) => p.pair).join(', ') || 'None'}

=== NANSEN LABELS ===
- Labels: ${nansen.nansenLabels?.join(', ') || 'None'}
- Smart Money: ${nansen.isSmartMoney}
- Airdrop Farmer flag: ${nansen.isAirdropFarmer}
- Whale: ${nansen.isWhale}

SCORE: ${scoreData.score}/100 (${scoreData.tier} tier)

Based on ALL this data and historical airdrops (Uniswap ~$5000 avg, dYdX ~$9000, Arbitrum ~$2000, Optimism ~$3000, ENS ~$14000), provide your analysis in EXACTLY this JSON format:

{
  "executiveSummary": "3-4 detailed sentences about eligibility, referencing specific data points from above",
  "strengths": ["5-7 specific strengths referencing actual numbers from the data"],
  "weaknesses": ["4-6 specific weaknesses with actionable context"],
  "riskFactors": ["4-5 risk factors including sybil detection, bot patterns, concentration risk, etc."],
  "immediateActions": ["6-8 specific, prioritized actions with exact URLs where possible. Include MetaMask-specific actions (Snaps, Card, Portfolio) and Linea actions"],
  "thingsToMaintain": ["4-5 positive behaviors to continue based on the data"],
  "thingsToStop": ["3-4 things that could hurt eligibility based on actual patterns seen"],
  "historicalComparison": "4-5 sentences comparing to past airdrop criteria. Reference specific numbers. Estimate value range based on tier and activity level.",
  "lineaStrategy": "3-4 sentences about Linea importance with specific protocols to use and actions to take",
  "timelineEstimate": "2-3 sentences about expected timeline and urgency based on latest ConsenSys signals",
  "portfolioInsights": "2-3 sentences about the wallet's portfolio composition and what it signals about the user's crypto sophistication",
  "multiChainAnalysis": "2-3 sentences about cross-chain activity patterns and how they compare to typical airdrop recipients",
  "estimatedAllocation": {
    "lowEstimate": "dollar amount string",
    "midEstimate": "dollar amount string",
    "highEstimate": "dollar amount string",
    "confidence": "Low/Medium/High",
    "reasoning": "1-2 sentences explaining the estimate"
  }
}

Be EXTREMELY specific. Reference actual numbers. Don't be generic. This person paid $14.99 for this report.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a premium crypto airdrop analyst. Always respond with valid JSON only. Be data-driven, specific, and brutally honest. No generic advice. Reference actual wallet data in every point.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI gateway error:', response.status, await response.text());
      return generateTemplateAnalysis(allData, scoreData);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const jsonMatch = content?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return generateTemplateAnalysis(allData, scoreData);
  } catch (e) {
    console.error('AI analysis error:', e);
    return generateTemplateAnalysis(allData, scoreData);
  }
}

function generateTemplateAnalysis(allData: any, scoreData: any) {
  const { etherscan, alchemy, moralis, linea, theGraph, nansen } = allData;
  const walletValue = moralis?.totalNetWorthUSD || (alchemy?.ethBalance || 0) * 3500;

  return {
    executiveSummary: `This wallet scores ${scoreData.score}/100 (${scoreData.tier} tier) based on comprehensive multi-source analysis. With ${etherscan.totalTransactions} transactions over ${etherscan.walletAgeYears} years across ${moralis?.totalChainsUsed || 1} chains, and ${linea?.lineaTransactions || 0} Linea transactions, ${scoreData.tier === 'High' ? 'this is a strong candidate for a meaningful $MASK allocation.' : scoreData.tier === 'Medium' ? 'there is moderate eligibility but significant improvements are possible.' : 'immediate action is needed to improve eligibility before the snapshot.'}`,
    strengths: [
      etherscan.walletAgeYears >= 2 ? `Wallet maturity of ${etherscan.walletAgeYears} years demonstrates genuine early adoption` : `Wallet has ${etherscan.totalTransactions} transactions showing active usage`,
      moralis?.totalChainsUsed > 1 ? `Multi-chain presence across ${moralis.totalChainsUsed} networks (${moralis.chainsActive?.join(', ')})` : 'Active Ethereum mainnet user',
      etherscan.totalEthVolume > 1 ? `${etherscan.totalEthVolume} ETH in transaction volume` : 'Consistent on-chain activity',
      linea?.lineaActive ? `Active Linea user with ${linea.lineaTransactions} transactions` : 'Room for high-impact Linea engagement',
      `${etherscan.uniqueContracts} unique contract interactions showing diverse protocol usage`,
    ].filter(Boolean),
    weaknesses: [
      !linea?.lineaActive ? 'No Linea activity — this is likely the most critical gap for $MASK eligibility' : null,
      etherscan.swapCount < 5 ? `Low swap count (${etherscan.swapCount}) — MetaMask Swap aggregator usage is likely weighted heavily` : null,
      etherscan.bridgeCount < 2 ? 'Limited bridge activity — cross-chain engagement is a key signal' : null,
      etherscan.stakingCount === 0 ? 'No ETH staking detected via MetaMask Portfolio' : null,
      etherscan.governanceCount === 0 ? 'No governance participation — shows limited community engagement' : null,
    ].filter(Boolean) as string[],
    riskFactors: [
      'Sybil detection: If linked to similar wallets with identical patterns, may be flagged and excluded',
      nansen?.isAirdropFarmer ? 'WARNING: Nansen has flagged this wallet as a potential airdrop farmer — this significantly reduces expected allocation' : 'No Nansen farmer flags detected — wallet appears organic',
      etherscan.recentActivity < 5 ? 'Low recent activity may signal dormant wallet — recent engagement is critical' : 'Recent activity is healthy',
      'MetaMask may weight proprietary metrics (Swap usage, Portfolio, Snaps) that cannot be fully detected on-chain',
    ],
    immediateActions: [
      !linea?.lineaActive ? 'HIGHEST PRIORITY: Bridge ETH to Linea and use DeFi protocols (SyncSwap, LineaBank) — portfolio.metamask.io/bridge' : 'Continue Linea engagement with weekly transactions',
      etherscan.swapCount < 10 ? 'Make swaps through MetaMask Swap aggregator — portfolio.metamask.io/swap' : 'Maintain regular swap activity',
      'Install 2-3 MetaMask Snaps from snaps.metamask.io',
      'Stake ETH through MetaMask Portfolio — portfolio.metamask.io/stake',
      etherscan.governanceCount === 0 ? 'Cast governance votes on snapshot.org or tally.xyz' : 'Continue governance participation',
      'Apply for MetaMask Card at metamask.io/card',
      moralis?.totalChainsUsed < 3 ? 'Expand to Arbitrum, Optimism, and Base networks via MetaMask' : 'Maintain multi-chain presence',
      'Provide liquidity on Linea DEXs for deeper engagement signals',
    ],
    thingsToMaintain: [
      'Keep wallet active with regular weekly transactions',
      'Use MetaMask as primary wallet for all interactions',
      'Maintain diverse DeFi activity across protocols',
      moralis?.totalChainsUsed > 2 ? `Continue multi-chain usage across ${moralis.chainsActive?.join(', ')}` : 'Build cross-chain presence',
    ],
    thingsToStop: [
      'Avoid fragmenting activity across many wallets — consolidate in one primary wallet',
      'Don\'t bridge assets just to bridge back — wash trading patterns trigger sybil detection',
      'Don\'t spam micro-transactions — quality and diversity matter more than quantity',
    ],
    historicalComparison: `Based on precedent: UNI averaged ~$5,000 (400 UNI), dYdX ~$9,000, ARB ~$2,000, OP ~$3,000, ENS ~$14,000 for early adopters. MetaMask has 143M+ users but likely 5-10M will qualify. With your ${scoreData.tier} tier profile and $${Math.round(walletValue).toLocaleString()} portfolio, estimated range: ${scoreData.tier === 'High' ? '$3,000-$20,000' : scoreData.tier === 'Medium' ? '$500-$5,000' : '$50-$1,000'}.`,
    lineaStrategy: `Linea is ConsenSys' own L2, making it the single strongest signal for $MASK eligibility. ${linea?.lineaActive ? `Your ${linea.lineaTransactions} Linea transactions are a great start — keep building depth.` : 'You have ZERO Linea activity — this should be your #1 priority.'} Use SyncSwap, Horizon DEX, and provide liquidity. Aim for weekly activity over at least 8 weeks.`,
    timelineEstimate: 'CEO Joseph Lubin confirmed $MASK token in Sept 2025 as "coming sooner than expected." MetaMask Rewards Seasons are actively tracking. Market consensus: Q2-Q3 2026 snapshot/launch. You have approximately 30-90 days to meaningfully improve eligibility.',
    portfolioInsights: `Portfolio value of approximately $${Math.round(walletValue).toLocaleString()} with ${alchemy?.tokenHoldings || 0} active tokens and ${alchemy?.nftsOwned || 0} NFTs. ${walletValue > 10000 ? 'Substantial portfolio signals genuine crypto engagement.' : 'Consider increasing on-chain value to signal commitment.'}`,
    multiChainAnalysis: `Active on ${moralis?.totalChainsUsed || 1} chain(s). ${moralis?.totalChainsUsed > 3 ? 'Excellent cross-chain diversity — this mirrors patterns of top airdrop recipients.' : 'Limited multi-chain presence. Expand to Arbitrum, Optimism, and Base for better positioning.'}`,
    estimatedAllocation: {
      lowEstimate: scoreData.tier === 'High' ? '$3,000' : scoreData.tier === 'Medium' ? '$500' : '$50',
      midEstimate: scoreData.tier === 'High' ? '$8,000' : scoreData.tier === 'Medium' ? '$2,000' : '$300',
      highEstimate: scoreData.tier === 'High' ? '$20,000' : scoreData.tier === 'Medium' ? '$5,000' : '$1,000',
      confidence: scoreData.tier === 'High' ? 'Medium' : 'Low',
      reasoning: `Based on ${etherscan.totalTransactions} transactions, ${etherscan.walletAgeYears}yr wallet age, ${moralis?.totalChainsUsed || 1} chains, and ${linea?.lineaTransactions || 0} Linea txs compared to historical airdrop distribution patterns.`,
    },
  };
}

// ===================== MAIN HANDLER =====================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference, walletAddress, email } = await req.json();

    if (!reference || !walletAddress) {
      return new Response(JSON.stringify({ error: 'Reference and wallet address required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify payment with Paystack
    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!PAYSTACK_SECRET_KEY) throw new Error('PAYSTACK_SECRET_KEY not configured');

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { 'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}` },
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return new Response(JSON.stringify({ error: 'Payment not verified' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Payment verified for ${walletAddress}. Fetching data from all sources...`);

    // Fetch from ALL data sources in parallel
    const ETHERSCAN_API_KEY = Deno.env.get('ETHERSCAN_API_KEY') || '';
    const ALCHEMY_API_KEY = Deno.env.get('ALCHEMY_API_KEY') || '';
    const MORALIS_API_KEY = Deno.env.get('MORALIS_API_KEY') || '';
    const DUNE_API_KEY = Deno.env.get('DUNE_API_KEY') || '';
    const NANSEN_API_KEY = Deno.env.get('NANSEN_API_KEY') || '';

    const [etherscan, alchemy, moralis, linea, theGraph, defiLlama, dune, nansen] = await Promise.all([
      ETHERSCAN_API_KEY ? fetchEtherscanData(walletAddress, ETHERSCAN_API_KEY) : Promise.resolve(getDefaultEtherscan()),
      ALCHEMY_API_KEY ? fetchAlchemyData(walletAddress, ALCHEMY_API_KEY) : Promise.resolve({ ethBalance: 0, nftsOwned: 0, nftCollections: 0, tokenHoldings: 0, topNFTs: [] }),
      MORALIS_API_KEY ? fetchMoralisData(walletAddress, MORALIS_API_KEY) : Promise.resolve({ chainsActive: ['eth'], totalChainsUsed: 1, chainBreakdown: [], defiPositions: [], defiProtocolsUsed: 0, totalNetWorthUSD: null, chainNetWorth: [] }),
      fetchLineaData(walletAddress),
      fetchTheGraphData(walletAddress),
      fetchDefiLlamaData(walletAddress),
      DUNE_API_KEY ? fetchDuneData(walletAddress, DUNE_API_KEY) : Promise.resolve({ duneLabels: [], duneInsights: 'Not configured' }),
      NANSEN_API_KEY ? fetchNansenData(walletAddress, NANSEN_API_KEY) : Promise.resolve({ nansenLabels: [], isSmartMoney: false, isAirdropFarmer: false, isWhale: false, walletType: 'Unknown' }),
    ]);

    console.log('All data sources fetched. Calculating score...');

    const allData = { etherscan, alchemy, moralis, linea, theGraph, defiLlama, dune, nansen };
    const scoreData = calculateEnhancedScore(etherscan, alchemy, moralis, linea, theGraph, nansen);

    console.log(`Score: ${scoreData.score}/100 (${scoreData.tier}). Generating AI analysis...`);

    const aiAnalysis = await generateAIAnalysis(allData, scoreData, walletAddress);

    const reportData = {
      walletAddress,
      email,
      generatedAt: new Date().toISOString(),
      dataSources: {
        etherscan: !!ETHERSCAN_API_KEY,
        alchemy: !!ALCHEMY_API_KEY,
        moralis: !!MORALIS_API_KEY,
        linea: true,
        theGraph: true,
        defiLlama: true,
        dune: !!DUNE_API_KEY,
        nansen: !!NANSEN_API_KEY,
      },
      onChainData: {
        ...etherscan,
        ethBalance: alchemy.ethBalance,
        nftsOwned: alchemy.nftsOwned,
        nftCollections: alchemy.nftCollections,
        tokenHoldings: alchemy.tokenHoldings,
        topNFTs: alchemy.topNFTs,
        chainsActive: moralis.chainsActive,
        totalChainsUsed: moralis.totalChainsUsed,
        defiProtocolsUsed: moralis.defiProtocolsUsed,
        totalNetWorthUSD: moralis.totalNetWorthUSD,
        lineaTransactions: linea.lineaTransactions,
        lineaActive: linea.lineaActive,
        lineaAgeMonths: linea.lineaAgeMonths,
        lineaDeFiInteractions: linea.lineaDeFiInteractions,
        uniswapSwaps: theGraph.uniswapSwaps,
        uniswapVolumeUSD: theGraph.uniswapVolumeUSD,
        topUniswapPairs: theGraph.topPairs,
        nansenLabels: nansen.nansenLabels,
        isSmartMoney: nansen.isSmartMoney,
        isAirdropFarmer: nansen.isAirdropFarmer,
        duneInsights: dune.duneInsights,
      },
      score: scoreData,
      analysis: aiAnalysis,
    };

    // Store in database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('report_purchases').upsert({
      email,
      wallet_address: walletAddress,
      paystack_reference: reference,
      status: 'completed',
      report_data: reportData,
    }, { onConflict: 'paystack_reference' });

    console.log('Report generated and stored successfully');

    return new Response(JSON.stringify({ report: reportData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getDefaultEtherscan() {
  return {
    totalTransactions: 0, walletAgeYears: 0, uniqueContracts: 0, swapCount: 0,
    bridgeCount: 0, stakingCount: 0, nftTransferCount: 0, governanceCount: 0,
    totalEthVolume: 0, uniqueTokens: 0, tokenTransferCount: 0, internalTxCount: 0,
    totalGasSpentETH: 0, firstTxDate: 'N/A', lastTxDate: 'N/A', recentActivity: 0,
    activeMonths: 0, monthlyActivity: {},
  };
}
