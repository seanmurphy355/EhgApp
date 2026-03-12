import {
  createContext,
  lazy,
  Suspense,
  useContext,
  type ReactNode,
} from "react";

export const USDC_DECIMALS = 6;
export const BASE_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;

export const BASE_USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const BASE_SEPOLIA_USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

export const BALANCE_STORAGE_KEY = "aurelia.wallet.usdcBalance";
export const PAYMENT_HISTORY_KEY = "aurelia.wallet.paymentHistory";
export const MAX_VALUE_STORAGE_KEY = "aurelia.wallet.maxPaymentValue";

const DEFAULT_MAX_VALUE = BigInt(10_000_000);

export type PaymentRecord = {
  id: string;
  url: string;
  amount: string;
  timestamp: string;
  status: "success" | "failed";
};

export type WalletContextValue = {
  ready: boolean;
  authenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  userId: string | null;
  userEmail: string | null;

  walletAddress: string | null;
  walletReady: boolean;

  usdcBalance: string | null;
  refreshBalance: () => Promise<void>;
  isRefreshingBalance: boolean;

  paymentHistory: PaymentRecord[];
  clearPaymentHistory: () => void;

  maxPaymentValue: bigint;
  setMaxPaymentValue: (value: bigint) => void;

  isTestnet: boolean;
  chainId: number;
  usdcAddress: string;
};

export const WalletContext = createContext<WalletContextValue | null>(null);

export function loadPaymentHistory(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(PAYMENT_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as PaymentRecord[]) : [];
  } catch {
    return [];
  }
}

export function savePaymentHistory(records: PaymentRecord[]): void {
  localStorage.setItem(PAYMENT_HISTORY_KEY, JSON.stringify(records.slice(0, 100)));
}

export function loadMaxValue(): bigint {
  try {
    const raw = localStorage.getItem(MAX_VALUE_STORAGE_KEY);
    return raw ? BigInt(raw) : DEFAULT_MAX_VALUE;
  } catch {
    return DEFAULT_MAX_VALUE;
  }
}

const IS_SECURE = typeof window !== "undefined" && window.location.protocol === "https:";

const LazyWalletProviderInner = IS_SECURE
  ? lazy(() => import("./walletInner"))
  : null;

export function WalletProvider({ children }: { children: ReactNode }) {
  if (!LazyWalletProviderInner) {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={null}>
      <LazyWalletProviderInner>{children}</LazyWalletProviderInner>
    </Suspense>
  );
}

export function useWallet(): WalletContextValue | null {
  return useContext(WalletContext);
}

export function formatAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function usdcToMicro(usdc: number): bigint {
  return BigInt(Math.round(usdc * 10 ** USDC_DECIMALS));
}

export function microToUsdc(micro: bigint): number {
  return Number(micro) / 10 ** USDC_DECIMALS;
}

const BASE_RPC = "https://mainnet.base.org";
const BASE_SEPOLIA_RPC = "https://sepolia.base.org";

export async function readUsdcBalance(
  address: string,
  testnet: boolean,
): Promise<string> {
  const rpc = testnet ? BASE_SEPOLIA_RPC : BASE_RPC;
  const usdcAddr = testnet ? BASE_SEPOLIA_USDC_ADDRESS : BASE_USDC_ADDRESS;
  const calldata =
    "0x70a08231" + address.slice(2).toLowerCase().padStart(64, "0");

  const res = await fetch(rpc, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{ to: usdcAddr, data: calldata }, "latest"],
      id: 1,
    }),
  });

  const json = (await res.json()) as { result?: string };
  const raw = BigInt(json.result ?? "0x0");
  const whole = raw / BigInt(10 ** USDC_DECIMALS);
  const frac = raw % BigInt(10 ** USDC_DECIMALS);
  return `${whole}.${frac.toString().padStart(USDC_DECIMALS, "0").slice(0, 2)}`;
}
