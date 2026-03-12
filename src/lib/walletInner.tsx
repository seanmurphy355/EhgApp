import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  WalletContext,
  type PaymentRecord,
  type WalletContextValue,
  USDC_DECIMALS,
  BASE_CHAIN_ID,
  BASE_SEPOLIA_CHAIN_ID,
  BASE_USDC_ADDRESS,
  BASE_SEPOLIA_USDC_ADDRESS,
  BALANCE_STORAGE_KEY,
  loadPaymentHistory,
  loadMaxValue,
  PAYMENT_HISTORY_KEY,
  MAX_VALUE_STORAGE_KEY,
} from "./wallet";

export default function WalletProviderInner({ children }: { children: ReactNode }) {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  const isTestnet = (import.meta.env.VITE_X402_TESTNET ?? "true") === "true";
  const chainId = isTestnet ? BASE_SEPOLIA_CHAIN_ID : BASE_CHAIN_ID;
  const usdcAddress = isTestnet ? BASE_SEPOLIA_USDC_ADDRESS : BASE_USDC_ADDRESS;

  const [usdcBalance, setUsdcBalance] = useState<string | null>(() => {
    return localStorage.getItem(BALANCE_STORAGE_KEY);
  });
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>(loadPaymentHistory);
  const [maxPaymentValue, setMaxPaymentValueState] = useState<bigint>(loadMaxValue);

  const embeddedWallet = useMemo(() => {
    return wallets.find((w) => w.walletClientType === "privy") ?? wallets[0] ?? null;
  }, [wallets]);

  const walletAddress = embeddedWallet?.address ?? null;

  const refreshBalance = useCallback(async () => {
    if (!embeddedWallet) return;
    setIsRefreshingBalance(true);
    try {
      const provider = await embeddedWallet.getEthereumProvider();
      const balanceHex = await provider.request({
        method: "eth_call",
        params: [
          {
            to: usdcAddress,
            data: `0x70a08231000000000000000000000000${embeddedWallet.address.slice(2)}`,
          },
          "latest",
        ],
      }) as string;
      const raw = BigInt(balanceHex);
      const whole = raw / BigInt(10 ** USDC_DECIMALS);
      const frac = raw % BigInt(10 ** USDC_DECIMALS);
      const formatted = `${whole}.${frac.toString().padStart(USDC_DECIMALS, "0").slice(0, 2)}`;
      setUsdcBalance(formatted);
      localStorage.setItem(BALANCE_STORAGE_KEY, formatted);
    } catch {
      setUsdcBalance(null);
      localStorage.removeItem(BALANCE_STORAGE_KEY);
    } finally {
      setIsRefreshingBalance(false);
    }
  }, [embeddedWallet, usdcAddress]);

  useEffect(() => {
    if (walletsReady && embeddedWallet) {
      void refreshBalance();
    }
  }, [walletsReady, embeddedWallet, refreshBalance]);

  const clearPaymentHistory = useCallback(() => {
    setPaymentHistory([]);
    localStorage.removeItem(PAYMENT_HISTORY_KEY);
  }, []);

  const setMaxPaymentValue = useCallback((value: bigint) => {
    setMaxPaymentValueState(value);
    localStorage.setItem(MAX_VALUE_STORAGE_KEY, value.toString());
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      ready,
      authenticated,
      login,
      logout: async () => { await logout(); },
      userId: user?.id ?? null,
      userEmail: user?.email?.address ?? null,

      walletAddress,
      walletReady: walletsReady,

      usdcBalance,
      refreshBalance,
      isRefreshingBalance,

      paymentHistory,
      clearPaymentHistory,

      maxPaymentValue,
      setMaxPaymentValue,

      isTestnet,
      chainId,
      usdcAddress,
    }),
    [
      ready,
      authenticated,
      login,
      logout,
      user,
      walletAddress,
      walletsReady,
      usdcBalance,
      refreshBalance,
      isRefreshingBalance,
      paymentHistory,
      clearPaymentHistory,
      maxPaymentValue,
      setMaxPaymentValue,
      isTestnet,
      chainId,
      usdcAddress,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
