import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  HStack,
  Input,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  AlertCircle,
  Bot,
  Copy,
  ExternalLink,
  RefreshCw,
  Shield,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  useWallet,
  formatAddress,
  microToUsdc,
  usdcToMicro,
  readUsdcBalance,
  type PaymentRecord,
} from "../lib/wallet";
import { fetchAgentWallet, type AgentWalletInfo } from "../lib/api";
import { fieldStyles, secondaryButtonStyles } from "./workspaceStyles";

const CIRCLE_FAUCET_URL = "https://faucet.circle.com/";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <Button size="xs" variant="ghost" onClick={handleCopy} px="2" h="7" color="ui.textSubtle" _hover={{ color: "ui.text" }}>
      <Copy size={12} />
      <Text fontSize="xs" ml="1">{copied ? "Copied" : "Copy"}</Text>
    </Button>
  );
}

function ConnectionCard() {
  const wallet = useWallet();
  if (!wallet) return null;
  const { authenticated, login, logout, userId, userEmail, ready } = wallet;

  if (!ready) {
    return (
      <Card.Root bg="ui.cardAltAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" shadow="hairline">
        <Card.Body px="5" py="4">
          <Text fontSize="sm" color="ui.textMuted">Initializing Privy...</Text>
        </Card.Body>
      </Card.Root>
    );
  }

  if (!authenticated) {
    return (
      <Card.Root bg="ui.cardAltAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" shadow="hairline">
        <Card.Header px="5" py="3" borderBottom="1px solid" borderColor="ui.border">
          <Text fontSize="sm" fontWeight="600" color="ui.text">Authentication</Text>
          <Text mt="1" fontSize="xs" color="ui.textSubtle">
            Connect with Privy to create an embedded wallet.
          </Text>
        </Card.Header>
        <Card.Body px="5" py="4">
          <Stack gap="4">
            <Text fontSize="sm" color="ui.textMuted" lineHeight="1.7">
              Sign in to get an embedded wallet that can hold USDC and pay for API services via the x402 protocol.
              No seed phrase or browser extension required.
            </Text>
            <Button
              bg="ui.accent"
              color="white"
              borderRadius="control"
              px="5"
              _hover={{ bg: "ui.accentHover" }}
              onClick={login}
            >
              Connect with Privy
            </Button>
          </Stack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root bg="ui.cardAltAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" shadow="hairline">
      <Card.Header px="5" py="3" borderBottom="1px solid" borderColor="ui.border">
        <Text fontSize="sm" fontWeight="600" color="ui.text">Connection</Text>
        <Text mt="1" fontSize="xs" color="ui.textSubtle">Authenticated via Privy.</Text>
      </Card.Header>
      <Card.Body px="5" py="4">
        <Stack gap="3">
          <Flex justify="space-between" align="center">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="ui.textSubtle" fontFamily="mono">
              User ID
            </Text>
            <Text fontSize="sm" color="ui.textMuted" fontFamily="mono">{userId ? formatAddress(userId) : "--"}</Text>
          </Flex>
          {userEmail ? (
            <Flex justify="space-between" align="center">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="ui.textSubtle" fontFamily="mono">
                Email
              </Text>
              <Text fontSize="sm" color="ui.textMuted">{userEmail}</Text>
            </Flex>
          ) : null}
          <Separator borderColor="ui.border" />
          <Button {...secondaryButtonStyles} size="sm" onClick={logout}>
            Disconnect
          </Button>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}

function WalletCard() {
  const wallet = useWallet();
  if (!wallet) return null;
  const {
    walletAddress,
    walletReady,
    usdcBalance,
    refreshBalance,
    isRefreshingBalance,
    isTestnet,
    chainId,
  } = wallet;

  if (!walletReady || !walletAddress) {
    return null;
  }

  const networkLabel = isTestnet ? "Base Sepolia (testnet)" : "Base";

  return (
    <Card.Root bg="ui.cardAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" shadow="panel" overflow="hidden">
      <Card.Header px={{ base: "5", md: "6" }} py="5" borderBottom="1px solid" borderColor="ui.border">
        <Flex align="center" justify="space-between" gap="4">
          <Stack gap="1">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
              Embedded wallet
            </Text>
            <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} letterSpacing="-0.03em">
              Funding wallet
            </Heading>
            <Text fontSize="sm" color="ui.textMuted" maxW="2xl">
              Your Privy-managed wallet holds USDC for automated x402 API payments.
            </Text>
          </Stack>
          <Flex gap="2" wrap="wrap">
            <HStack gap="2" px="3" py="1.5" border="1px solid" borderColor="ui.border" borderRadius="full" bg="ui.surfaceInset">
              <Box h="2" w="2" borderRadius="full" bg="ui.success" />
              <Text fontSize="sm" color="ui.textMuted">{networkLabel}</Text>
            </HStack>
            <HStack gap="2" px="3" py="1.5" border="1px solid" borderColor="ui.border" borderRadius="full" bg="ui.surfaceInset">
              <Box h="2" w="2" borderRadius="full" bg="ui.accent" />
              <Text fontSize="sm" color="ui.textMuted">Chain {chainId}</Text>
            </HStack>
          </Flex>
        </Flex>
      </Card.Header>

      <Card.Body px={{ base: "5", md: "6" }} py={{ base: "5", md: "6" }}>
        <Stack gap="6">
          <Box bg="ui.surfaceInset" border="1px solid" borderColor="ui.border" borderRadius="16px" px="4" py="4">
            <Stack gap="3">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="ui.textSubtle" fontFamily="mono">
                Wallet address
              </Text>
              <Flex align="center" gap="3">
                <Text fontSize="sm" fontFamily="mono" color="ui.text" wordBreak="break-all">
                  {walletAddress}
                </Text>
                <CopyButton text={walletAddress} />
              </Flex>
            </Stack>
          </Box>

          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="4">
            <Box bg="ui.surfaceInset" border="1px solid" borderColor="ui.border" borderRadius="16px" px="4" py="4">
              <Flex align="center" justify="space-between" gap="4">
                <Stack gap="1">
                  <HStack gap="2">
                    <Box h="2" w="2" borderRadius="full" bg="ui.accent" />
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="ui.textSubtle" fontFamily="mono">
                      USDC balance
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="ui.textMuted">
                    {isTestnet ? "Testnet USDC on Base Sepolia" : "USDC on Base"}
                  </Text>
                </Stack>
                <HStack gap="2">
                  <Text fontSize="2xl" fontWeight="700" letterSpacing="-0.03em" color="ui.accent">
                    {usdcBalance ?? "--"}
                  </Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={refreshBalance}
                    disabled={isRefreshingBalance}
                    px="1"
                    h="7"
                    color="ui.textSubtle"
                    _hover={{ color: "ui.text" }}
                  >
                    <RefreshCw size={12} className={isRefreshingBalance ? "animate-spin" : ""} />
                  </Button>
                </HStack>
              </Flex>
            </Box>

            <Box bg="ui.surfaceInset" border="1px solid" borderColor="ui.border" borderRadius="16px" px="4" py="4">
              <Flex align="center" justify="space-between" gap="4">
                <Stack gap="1">
                  <HStack gap="2">
                    <Box h="2" w="2" borderRadius="full" bg="ui.violet" />
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="ui.textSubtle" fontFamily="mono">
                      Protocol
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="ui.textMuted">
                    HTTP 402 micropayments
                  </Text>
                </Stack>
                <Text fontSize="2xl" fontWeight="700" letterSpacing="-0.03em" color="ui.violet">
                  x402
                </Text>
              </Flex>
            </Box>
          </Grid>

          <Box bg="ui.surfaceInset" border="1px solid" borderColor="ui.border" borderRadius="16px" px="4" py="4">
            <Stack gap="3">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="ui.textSubtle" fontFamily="mono">
                Fund your wallet
              </Text>
              <Text fontSize="sm" color="ui.textMuted" lineHeight="1.7">
                Send USDC to the wallet address above on the {isTestnet ? "Base Sepolia" : "Base"} network.
                {isTestnet
                  ? " For testnet tokens, use the Circle faucet below."
                  : " You can bridge USDC from Ethereum or buy directly on Base."}
              </Text>
              {isTestnet ? (
                <Button
                  {...secondaryButtonStyles}
                  w="fit-content"
                  onClick={() => window.open(CIRCLE_FAUCET_URL, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink size={14} />
                  <Text ml="2">Circle testnet faucet</Text>
                </Button>
              ) : null}
            </Stack>
          </Box>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}

function SafetySettingsCard() {
  const wallet = useWallet();
  const [draftMax, setDraftMax] = useState(() =>
    wallet ? microToUsdc(wallet.maxPaymentValue).toString() : "10",
  );
  if (!wallet) return null;
  const { maxPaymentValue, setMaxPaymentValue, authenticated } = wallet;

  if (!authenticated) return null;

  const handleSave = () => {
    const parsed = parseFloat(draftMax);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setMaxPaymentValue(usdcToMicro(parsed));
    }
  };

  return (
    <Card.Root bg="ui.cardAltAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" shadow="hairline">
      <Card.Header px="5" py="3" borderBottom="1px solid" borderColor="ui.border">
        <HStack gap="2">
          <Shield size={14} color="var(--chakra-colors-ui-text-subtle)" />
          <Text fontSize="sm" fontWeight="600" color="ui.text">Payment safety</Text>
        </HStack>
        <Text mt="1" fontSize="xs" color="ui.textSubtle">
          Cap the maximum USDC per x402 payment.
        </Text>
      </Card.Header>
      <Card.Body px="5" py="4">
        <Stack gap="3">
          <Box>
            <Text mb="2" fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
              Max per request (USDC)
            </Text>
            <Flex gap="2">
              <Input
                value={draftMax}
                onChange={(e) => setDraftMax(e.target.value)}
                type="number"
                step="0.01"
                min="0.01"
                {...fieldStyles}
                flex="1"
              />
              <Button
                bg="ui.accent"
                color="white"
                borderRadius="control"
                px="4"
                _hover={{ bg: "ui.accentHover" }}
                onClick={handleSave}
              >
                Save
              </Button>
            </Flex>
          </Box>
          <Text fontSize="sm" color="ui.textMuted" lineHeight="1.7">
            Any x402 payment exceeding this cap will be rejected client-side.
            The facilitator covers gas fees; you only need USDC.
          </Text>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}

function PaymentHistoryCard() {
  const wallet = useWallet();
  if (!wallet) return null;
  const { paymentHistory, clearPaymentHistory, authenticated } = wallet;

  if (!authenticated) return null;

  return (
    <Card.Root bg="ui.cardAltAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" shadow="hairline">
      <Card.Header px="5" py="3" borderBottom="1px solid" borderColor="ui.border">
        <Flex justify="space-between" align="center">
          <Box>
            <Text fontSize="sm" fontWeight="600" color="ui.text">Payment history</Text>
            <Text mt="1" fontSize="xs" color="ui.textSubtle">
              Recent x402 payments from this wallet.
            </Text>
          </Box>
          {paymentHistory.length > 0 ? (
            <Button
              size="xs"
              variant="ghost"
              onClick={clearPaymentHistory}
              color="ui.textSubtle"
              _hover={{ color: "ui.text" }}
              px="2"
              h="7"
            >
              <Trash2 size={12} />
              <Text fontSize="xs" ml="1">Clear</Text>
            </Button>
          ) : null}
        </Flex>
      </Card.Header>
      <Card.Body px="5" py="4">
        {paymentHistory.length === 0 ? (
          <Text fontSize="sm" color="ui.textMuted">No payments recorded yet.</Text>
        ) : (
          <Stack gap="3">
            {paymentHistory.slice(0, 20).map((record: PaymentRecord, index: number) => (
              <Box key={record.id}>
                <Flex justify="space-between" align="start" gap="3">
                  <Stack gap="0.5" minW="0" flex="1">
                    <Text fontSize="sm" color="ui.text" truncate>
                      {new URL(record.url).hostname}{new URL(record.url).pathname}
                    </Text>
                    <Text fontSize="xs" color="ui.textSubtle">
                      {new Date(record.timestamp).toLocaleString()}
                    </Text>
                  </Stack>
                  <HStack gap="2" flexShrink={0}>
                    <Box
                      h="2"
                      w="2"
                      borderRadius="full"
                      bg={record.status === "success" ? "ui.success" : "ui.warning"}
                    />
                    <Text fontSize="xs" color="ui.textMuted">
                      {record.status}
                    </Text>
                  </HStack>
                </Flex>
                {index < Math.min(paymentHistory.length, 20) - 1 ? (
                  <Separator mt="3" borderColor="ui.border" />
                ) : null}
              </Box>
            ))}
          </Stack>
        )}
      </Card.Body>
    </Card.Root>
  );
}

function AgentWalletCard() {
  const wallet = useWallet();
  const isTestnet = (import.meta.env.VITE_X402_TESTNET ?? "true") === "true";

  const [agentInfo, setAgentInfo] = useState<AgentWalletInfo | null>(null);
  const [agentBalance, setAgentBalance] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAgentInfo = useCallback(async () => {
    try {
      const info = await fetchAgentWallet();
      setAgentInfo(info);
      setError(null);

      if (info.configured && info.address) {
        setIsRefreshing(true);
        try {
          const bal = await readUsdcBalance(info.address, isTestnet);
          setAgentBalance(bal);
        } finally {
          setIsRefreshing(false);
        }
      }
    } catch {
      setError("Could not reach backend.");
    }
  }, [isTestnet]);

  useEffect(() => {
    void loadAgentInfo();
  }, [loadAgentInfo]);

  const handleRefreshBalance = useCallback(async () => {
    if (!agentInfo?.address) return;
    setIsRefreshing(true);
    try {
      const bal = await readUsdcBalance(agentInfo.address, isTestnet);
      setAgentBalance(bal);
    } finally {
      setIsRefreshing(false);
    }
  }, [agentInfo?.address, isTestnet]);

  const networkLabel = isTestnet ? "Base Sepolia (testnet)" : "Base";

  if (error) {
    return (
      <Card.Root bg="ui.cardAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" shadow="panel" overflow="hidden">
        <Card.Header px={{ base: "5", md: "6" }} py="5" borderBottom="1px solid" borderColor="ui.border">
          <Flex align="center" gap="3">
            <Bot size={18} color="var(--chakra-colors-ui-text-subtle)" />
            <Stack gap="1">
              <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} letterSpacing="-0.03em">
                Agent wallet
              </Heading>
            </Stack>
          </Flex>
        </Card.Header>
        <Card.Body px={{ base: "5", md: "6" }} py={{ base: "5", md: "6" }}>
          <Flex align="center" gap="3">
            <AlertCircle size={16} color="var(--chakra-colors-ui-warning)" />
            <Text fontSize="sm" color="ui.textMuted">{error}</Text>
          </Flex>
        </Card.Body>
      </Card.Root>
    );
  }

  if (!agentInfo) {
    return (
      <Card.Root bg="ui.cardAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" shadow="panel" overflow="hidden">
        <Card.Body px={{ base: "5", md: "6" }} py="5">
          <Text fontSize="sm" color="ui.textMuted">Loading agent wallet...</Text>
        </Card.Body>
      </Card.Root>
    );
  }

  if (!agentInfo.configured) {
    return (
      <Card.Root bg="ui.cardAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" shadow="panel" overflow="hidden">
        <Card.Header px={{ base: "5", md: "6" }} py="5" borderBottom="1px solid" borderColor="ui.border">
          <Flex align="center" justify="space-between" gap="4">
            <Flex align="center" gap="3">
              <Bot size={18} color="var(--chakra-colors-ui-text-subtle)" />
              <Stack gap="1">
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                  Server-side wallet
                </Text>
                <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} letterSpacing="-0.03em">
                  Agent wallet
                </Heading>
              </Stack>
            </Flex>
            <HStack gap="2" px="3" py="1.5" border="1px solid" borderColor="ui.border" borderRadius="full" bg="ui.surfaceInset">
              <Box h="2" w="2" borderRadius="full" bg="ui.warning" />
              <Text fontSize="sm" color="ui.textMuted">Not configured</Text>
            </HStack>
          </Flex>
        </Card.Header>
        <Card.Body px={{ base: "5", md: "6" }} py={{ base: "5", md: "6" }}>
          <Box bg="ui.surfaceInset" border="1px solid" borderColor="ui.border" borderRadius="16px" px="4" py="4">
            <Stack gap="3">
              <Flex align="center" gap="2">
                <AlertCircle size={14} color="var(--chakra-colors-ui-warning)" />
                <Text fontSize="sm" fontWeight="600" color="ui.text">
                  EVM_PRIVATE_KEY not set
                </Text>
              </Flex>
              <Text fontSize="sm" color="ui.textMuted" lineHeight="1.7">
                The server-side agent wallet requires an EVM private key to sign x402
                payment authorisations. Set the <Text as="span" fontFamily="mono" color="ui.text">EVM_PRIVATE_KEY</Text> environment
                variable in the backend <Text as="span" fontFamily="mono" color="ui.text">.env</Text> file, then restart the server.
              </Text>
            </Stack>
          </Box>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root bg="ui.cardAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" shadow="panel" overflow="hidden">
      <Card.Header px={{ base: "5", md: "6" }} py="5" borderBottom="1px solid" borderColor="ui.border">
        <Flex align="center" justify="space-between" gap="4">
          <Flex align="center" gap="3">
            <Bot size={18} color="var(--chakra-colors-ui-text-subtle)" />
            <Stack gap="1">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                Server-side wallet
              </Text>
              <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} letterSpacing="-0.03em">
                Agent wallet
              </Heading>
              <Text fontSize="sm" color="ui.textMuted" maxW="2xl">
                The backend agent signs x402 payments autonomously using this wallet.
              </Text>
            </Stack>
          </Flex>
          <Flex gap="2" wrap="wrap">
            <HStack gap="2" px="3" py="1.5" border="1px solid" borderColor="ui.border" borderRadius="full" bg="ui.surfaceInset">
              <Box h="2" w="2" borderRadius="full" bg="ui.success" />
              <Text fontSize="sm" color="ui.textMuted">{networkLabel}</Text>
            </HStack>
            <HStack gap="2" px="3" py="1.5" border="1px solid" borderColor="ui.border" borderRadius="full" bg="ui.surfaceInset">
              <Box h="2" w="2" borderRadius="full" bg="ui.success" />
              <Text fontSize="sm" color="ui.textMuted">Configured</Text>
            </HStack>
          </Flex>
        </Flex>
      </Card.Header>

      <Card.Body px={{ base: "5", md: "6" }} py={{ base: "5", md: "6" }}>
        <Stack gap="6">
          <Box bg="ui.surfaceInset" border="1px solid" borderColor="ui.border" borderRadius="16px" px="4" py="4">
            <Stack gap="3">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="ui.textSubtle" fontFamily="mono">
                Agent address
              </Text>
              <Flex align="center" gap="3">
                <Text fontSize="sm" fontFamily="mono" color="ui.text" wordBreak="break-all">
                  {agentInfo.address}
                </Text>
                <CopyButton text={agentInfo.address!} />
              </Flex>
            </Stack>
          </Box>

          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="4">
            <Box bg="ui.surfaceInset" border="1px solid" borderColor="ui.border" borderRadius="16px" px="4" py="4">
              <Flex align="center" justify="space-between" gap="4">
                <Stack gap="1">
                  <HStack gap="2">
                    <Box h="2" w="2" borderRadius="full" bg="ui.accent" />
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="ui.textSubtle" fontFamily="mono">
                      USDC balance
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="ui.textMuted">
                    {isTestnet ? "Testnet USDC on Base Sepolia" : "USDC on Base"}
                  </Text>
                </Stack>
                <HStack gap="2">
                  <Text fontSize="2xl" fontWeight="700" letterSpacing="-0.03em" color="ui.accent">
                    {agentBalance ?? "--"}
                  </Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={handleRefreshBalance}
                    disabled={isRefreshing}
                    px="1"
                    h="7"
                    color="ui.textSubtle"
                    _hover={{ color: "ui.text" }}
                  >
                    <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                  </Button>
                </HStack>
              </Flex>
            </Box>

            <Box bg="ui.surfaceInset" border="1px solid" borderColor="ui.border" borderRadius="16px" px="4" py="4">
              <Flex align="center" justify="space-between" gap="4">
                <Stack gap="1">
                  <HStack gap="2">
                    <Box h="2" w="2" borderRadius="full" bg="ui.violet" />
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="ui.textSubtle" fontFamily="mono">
                      Protocol
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="ui.textMuted">
                    HTTP 402 micropayments
                  </Text>
                </Stack>
                <Text fontSize="2xl" fontWeight="700" letterSpacing="-0.03em" color="ui.violet">
                  x402
                </Text>
              </Flex>
            </Box>
          </Grid>

          <Box bg="ui.surfaceInset" border="1px solid" borderColor="ui.border" borderRadius="16px" px="4" py="4">
            <Stack gap="3">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="ui.textSubtle" fontFamily="mono">
                Fund the agent
              </Text>
              <Text fontSize="sm" color="ui.textMuted" lineHeight="1.7">
                Send USDC to the agent address above on the {isTestnet ? "Base Sepolia" : "Base"} network.
                {isTestnet
                  ? " For testnet tokens, use the Circle faucet below."
                  : " You can bridge USDC from Ethereum or buy directly on Base."}
              </Text>
              {isTestnet ? (
                <Button
                  {...secondaryButtonStyles}
                  w="fit-content"
                  onClick={() => window.open(CIRCLE_FAUCET_URL, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink size={14} />
                  <Text ml="2">Circle testnet faucet</Text>
                </Button>
              ) : null}
            </Stack>
          </Box>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}

export function WalletSurface() {
  const wallet = useWallet();
  const isTestnet = (import.meta.env.VITE_X402_TESTNET ?? "true") === "true";

  const authenticated = wallet?.authenticated ?? false;
  const walletAddress = wallet?.walletAddress ?? null;

  const statusLabel = authenticated
    ? walletAddress
      ? "Wallet connected"
      : "Creating wallet..."
    : "Not connected";
  const statusTone = authenticated ? "ui.success" : "ui.warning";

  return (
    <Stack gap={{ base: "6", xl: "8" }}>
      <Flex
        direction={{ base: "column", xl: "row" }}
        align={{ base: "start", xl: "center" }}
        justify="space-between"
        gap="5"
        pb="5"
        borderBottom="1px solid"
        borderColor="ui.border"
      >
        <Stack gap="3" minW="0">
          <Flex gap="2" wrap="wrap">
            <HStack
              gap="2"
              px="3"
              py="1.5"
              border="1px solid"
              borderColor="ui.border"
              borderRadius="full"
              bg="ui.pillAlpha"
              w="fit-content"
            >
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="ui.textSubtle" fontFamily="mono">
                Wallet
              </Text>
            </HStack>
            {wallet ? (
              <HStack
                gap="2"
                px="3"
                py="1.5"
                border="1px solid"
                borderColor={authenticated ? "ui.accentBorder" : "ui.border"}
                borderRadius="full"
                bg={authenticated ? "ui.accentMuted" : "ui.pillAlpha"}
                w="fit-content"
              >
                <Box h="2" w="2" borderRadius="full" bg={statusTone} />
                <Text fontSize="sm" color="ui.text">
                  {statusLabel}
                </Text>
              </HStack>
            ) : null}
            {isTestnet ? (
              <HStack
                gap="2"
                px="3"
                py="1.5"
                border="1px solid"
                borderColor="ui.border"
                borderRadius="full"
                bg="ui.pillAlpha"
                w="fit-content"
              >
                <Box h="2" w="2" borderRadius="full" bg="ui.warning" />
                <Text fontSize="sm" color="ui.textMuted">Testnet mode</Text>
              </HStack>
            ) : null}
          </Flex>

          <Stack gap="1" minW="0">
            <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} letterSpacing="-0.04em" lineHeight="1.05">
              Funding wallet
            </Heading>
            <Text fontSize={{ base: "sm", md: "md" }} lineHeight="1.8" color="ui.textMuted" maxW="4xl">
              Manage your agent wallet, fund it with USDC, and configure payment safety for x402 API micropayments.
            </Text>
          </Stack>
        </Stack>

        {wallet ? (
          <Flex gap="3" wrap="wrap" w={{ base: "full", md: "auto" }}>
            <HStack gap="2" px="4" py="2" border="1px solid" borderColor="ui.border" borderRadius="control" bg="ui.surfaceInset">
              <Wallet size={16} color="var(--chakra-colors-ui-text-subtle)" />
              <Text fontSize="sm" color="ui.textMuted">
                {walletAddress ? formatAddress(walletAddress) : "No wallet"}
              </Text>
            </HStack>
          </Flex>
        ) : null}
      </Flex>

      <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 340px" }} gap="6" alignItems="start">
        <Stack gap="6">
          <WalletCard />
          <AgentWalletCard />
        </Stack>

        <Stack gap="4" position={{ xl: "sticky" }} top={{ xl: "6" }} alignSelf="start">
          <ConnectionCard />
          <SafetySettingsCard />
          <PaymentHistoryCard />
        </Stack>
      </Grid>
    </Stack>
  );
}
