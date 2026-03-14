import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  HStack,
  Separator,
  Stack,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { Clock, RefreshCw } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { secondaryButtonStyles } from "./workspaceStyles";
import { toaster } from "./ui/toaster";
import {
  type AgentEntry,
  type ApprovalItem,
  type FeedEntry,
  type PipelineTask,
  formatElapsed,
  HEALTH_CONFIG,
  ROTATING_FEED,
  SEED_AGENTS,
  SEED_APPROVALS,
  SEED_FEED,
  SEED_PIPELINE,
  STATUS_CONFIG,
  TONE_HEX,
} from "../lib/agentData";

const SPARKLINE_DATA: Record<string, { v: number }[]> = {
  "Active agents": [{ v: 2 }, { v: 2 }, { v: 3 }, { v: 3 }, { v: 4 }, { v: 3 }, { v: 3 }],
  "Running tasks": [{ v: 1 }, { v: 2 }, { v: 2 }, { v: 3 }, { v: 4 }, { v: 3 }, { v: 3 }],
  "Budget spent": [{ v: 200 }, { v: 400 }, { v: 600 }, { v: 800 }, { v: 950 }, { v: 1100 }, { v: 1240 }],
  "Pending reviews": [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 2 }, { v: 5 }, { v: 4 }, { v: 4 }],
};

const PIPELINE_TABS = ["All", "Queued", "In Progress", "Under Review", "Completed"] as const;

const primaryCard = {
  bg: "ui.cardAlpha",
  border: "1px solid",
  borderColor: "ui.border",
  borderRadius: "panel",
  shadow: "panel",
  overflow: "hidden",
} as const;

const sidebarCard = {
  bg: "ui.cardAltAlpha",
  border: "1px solid",
  borderColor: "ui.border",
  borderRadius: "panel",
  shadow: "hairline",
  overflow: "hidden",
} as const;

function useAnimatedValue(target: number, duration: number = 600, skip: boolean = false): number {
  const [display, setDisplay] = useState(skip ? target : 0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (skip) {
      setDisplay(target);
      return;
    }
    const start = performance.now();
    const from = 0;
    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, skip]);

  return display;
}

function extractLeadingNumber(value: string): number | null {
  const match = value.match(/\$?([\d,]+)/);
  if (!match) return null;
  return parseInt(match[1].replace(/,/g, ""), 10);
}

function replaceLeadingNumber(template: string, num: number): string {
  return template.replace(/\$?([\d,]+)/, (match) => {
    const hasDollar = match.startsWith("$");
    const formatted = num.toLocaleString();
    return hasDollar ? `$${formatted}` : formatted;
  });
}

function SectionCardHeader({
  sectionLabel,
  title,
  trailing,
}: {
  sectionLabel: string;
  title: string;
  trailing?: React.ReactNode;
}) {
  return (
    <Card.Header
      px={{ base: "5", md: "6" }}
      py="4"
      borderBottom="1px solid"
      borderColor="ui.border"
    >
      <Flex justify="space-between" align="start">
        <Stack gap="1">
          <Text
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="0.18em"
            color="ui.textSubtle"
            fontFamily="mono"
          >
            {sectionLabel}
          </Text>
          <Heading as="h2" fontSize="lg" letterSpacing="-0.03em">
            {title}
          </Heading>
        </Stack>
        {trailing}
      </Flex>
    </Card.Header>
  );
}

function AnimatedStatValue({
  value,
  tone,
  skip,
}: {
  value: string;
  tone: string;
  skip: boolean;
}) {
  const num = extractLeadingNumber(value);
  const animated = useAnimatedValue(num ?? 0, 600, skip || num === null);

  const rendered = num !== null ? replaceLeadingNumber(value, animated) : value;

  return (
    <Text fontSize="lg" fontWeight="700" letterSpacing="-0.03em" color={tone}>
      {rendered}
    </Text>
  );
}

function StatCard({
  label,
  value,
  tone,
  hint,
  progress,
  index,
  skip,
}: {
  label: string;
  value: string;
  tone: string;
  hint: string;
  progress?: number;
  index: number;
  skip: boolean;
}) {
  const hex = TONE_HEX[tone] ?? "#6B63D7";
  const sparkData = SPARKLINE_DATA[label];

  return (
    <motion.div
      initial={skip ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.06, ease: "easeOut" }}
      whileHover={skip ? undefined : { y: -2, transition: { duration: 0.15 } }}
      style={{ flex: 1, minWidth: 0 }}
    >
      <Box
        bg="ui.surfaceInset"
        border="1px solid"
        borderColor="ui.border"
        borderRadius="16px"
        px="4"
        py="4"
        h="full"
        transition="border-color 0.15s ease"
        _hover={{ borderColor: "ui.borderStrong" }}
      >
        <Stack gap="1.5">
          <Flex justify="space-between" align="start">
            <Text
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="0.16em"
              color="ui.textSubtle"
              fontFamily="mono"
            >
              {label}
            </Text>
            {sparkData && (
              <Box w="64px" h="24px" flexShrink={0} ml="2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkData}>
                    <defs>
                      <linearGradient id={`spark-${label.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={hex} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={hex} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={hex}
                      strokeWidth={1.5}
                      fill={`url(#spark-${label.replace(/\s/g, "")})`}
                      isAnimationActive={!skip}
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Flex>
          <AnimatedStatValue value={value} tone={tone} skip={skip} />
          {progress !== undefined && (
            <Box h="3px" borderRadius="full" bg="ui.surfaceRaised" overflow="hidden">
              <motion.div
                initial={skip ? false : { width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                style={{ height: "100%", borderRadius: 9999, background: hex }}
              />
            </Box>
          )}
          <Text fontSize="xs" color="ui.textMuted" lineHeight="1.7">
            {hint}
          </Text>
        </Stack>
      </Box>
    </motion.div>
  );
}

function AgentRow({
  agent,
  index,
  isHighlighted,
  isDimmedByHover,
  onHover,
  onLeave,
  skip,
}: {
  agent: AgentEntry;
  index: number;
  isHighlighted: boolean;
  isDimmedByHover: boolean;
  onHover: () => void;
  onLeave: () => void;
  skip: boolean;
}) {
  const cfg = STATUS_CONFIG[agent.status];
  const dimmed = agent.status === "idle" || agent.status === "paused";
  const budgetPct = agent.budgetTotal > 0
    ? Math.round((agent.budgetUsed / agent.budgetTotal) * 100)
    : 0;
  const barHex = budgetPct > 75 ? "#FFB64A" : "#6B63D7";

  return (
    <motion.div
      initial={skip ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: index * 0.04, ease: "easeOut" }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        opacity: isDimmedByHover ? 0.35 : 1,
        transition: "opacity 0.15s ease, background-color 0.15s ease",
        backgroundColor: isHighlighted ? "rgba(107, 99, 215, 0.06)" : "transparent",
        cursor: "default",
      }}
    >
      <Flex align="center" gap="3" py="3" px={{ base: "5", md: "6" }}>
        <Box
          h="2"
          w="2"
          borderRadius="full"
          bg={cfg.tone}
          flexShrink={0}
          css={agent.status === "active" ? { animation: "activePulse 2s ease-in-out infinite" } : undefined}
        />
        <Stack gap="1" flex="1" minW="0">
          <Flex align="center" gap="2">
            <Text fontSize="sm" fontWeight="500" color={dimmed ? "ui.textSubtle" : "ui.text"} truncate>
              {agent.name}
            </Text>
            <Text fontSize="xs" fontFamily="mono" color="ui.textSubtle" flexShrink={0}>
              {agent.role}
            </Text>
          </Flex>
          <Text fontSize="xs" color={dimmed ? "ui.textSubtle" : "ui.textMuted"} truncate>
            {agent.currentTask ?? "No active task"}
          </Text>
          {agent.budgetTotal > 0 && (
            <Flex align="center" gap="2" mt="0.5">
              <Box h="3px" flex="1" borderRadius="full" bg="ui.surfaceRaised" overflow="hidden">
                <motion.div
                  animate={{ width: `${budgetPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{ height: "100%", borderRadius: 9999, background: barHex }}
                />
              </Box>
              <Text fontSize="xs" fontFamily="mono" color="ui.textSubtle" flexShrink={0}>
                ${agent.budgetUsed} / ${agent.budgetTotal}
              </Text>
            </Flex>
          )}
        </Stack>
        <Stack gap="0.5" align="end" flexShrink={0}>
          <Text fontSize="xs" fontFamily="mono" color={agent.progress > 0 ? "ui.textMuted" : "ui.textSubtle"}>
            {agent.progress > 0 ? `${agent.progress}%` : "\u2014"}
          </Text>
          <HStack gap="1">
            <Clock size={10} color="var(--ui-text-subtle)" />
            <Text fontSize="xs" color="ui.textSubtle">{agent.lastHeartbeat}</Text>
          </HStack>
          <HStack gap="1">
            <Box
              h="5px"
              w="5px"
              borderRadius="full"
              bg={HEALTH_CONFIG[agent.health.status].tone}
            />
            <Text fontSize="10px" fontFamily="mono" color={HEALTH_CONFIG[agent.health.status].tone}>
              {HEALTH_CONFIG[agent.health.status].label}
            </Text>
          </HStack>
        </Stack>
      </Flex>
    </motion.div>
  );
}

function PipelineTaskRow({
  task,
  isDimmedByHover,
}: {
  task: PipelineTask;
  isDimmedByHover: boolean;
}) {
  return (
    <Flex
      align="center"
      gap="3"
      py="2"
      pl="8"
      pr="5"
      style={{
        opacity: isDimmedByHover ? 0.35 : 1,
        transition: "opacity 0.15s ease",
      }}
    >
      <Text fontSize="sm" color="ui.text" flex="1" truncate>{task.title}</Text>
      <Text fontSize="xs" color="ui.textSubtle" flexShrink={0} truncate maxW="120px">
        {task.agent}
      </Text>
      <HStack gap="1" flexShrink={0}>
        <Clock size={10} color="var(--ui-text-subtle)" />
        <Text fontSize="xs" fontFamily="mono" color="ui.textSubtle">{task.timeInStage}</Text>
      </HStack>
    </Flex>
  );
}

export function DashboardSurface() {
  const prefersReduced = useReducedMotion();
  const skip = !!prefersReduced;

  const [agents, setAgents] = useState<AgentEntry[]>(SEED_AGENTS);
  const [feed, setFeed] = useState<FeedEntry[]>(SEED_FEED);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(SEED_APPROVALS);
  const [hoveredAgentName, setHoveredAgentName] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [syncLabel, setSyncLabel] = useState("Just now");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pipelineTab, setPipelineTab] = useState<string>("All");
  const feedIndexRef = useRef(0);

  const activeCount = useMemo(() => agents.filter((a) => a.status === "active").length, [agents]);
  const runningTasks = useMemo(
    () => agents.filter((a) => a.status === "active" && a.currentTask).length,
    [agents],
  );
  const totalBudgetUsed = useMemo(() => agents.reduce((sum, a) => sum + a.budgetUsed, 0), [agents]);
  const totalBudgetCap = useMemo(() => agents.reduce((sum, a) => sum + a.budgetTotal, 0), [agents]);
  const budgetPct = totalBudgetCap > 0 ? Math.round((totalBudgetUsed / totalBudgetCap) * 100) : 0;

  const summaryItems = useMemo(() => [
    { label: "Active agents", value: `${activeCount} / ${agents.length}`, tone: "ui.success", hint: `${activeCount} agents running, ${agents.length - activeCount} idle or paused.` },
    { label: "Running tasks", value: `${runningTasks}`, tone: "ui.accent", hint: "Tasks currently in progress." },
    { label: "Budget spent", value: `$${totalBudgetUsed.toLocaleString()} / $${totalBudgetCap.toLocaleString()}`, tone: "ui.warning", hint: `${budgetPct}% of total budget consumed.`, progress: budgetPct },
    { label: "Pending reviews", value: `${approvals.length}`, tone: "ui.violet", hint: "Awaiting human approval." },
  ] as const, [activeCount, agents.length, runningTasks, totalBudgetUsed, totalBudgetCap, budgetPct, approvals.length]);

  const filteredPipeline = useMemo(() => {
    if (pipelineTab === "All") return SEED_PIPELINE;
    return SEED_PIPELINE.filter((s) => s.label === pipelineTab);
  }, [pipelineTab]);

  useEffect(() => {
    const id = setInterval(() => {
      setAgents((prev) => {
        const active = prev.filter((a) => a.status === "active" && a.progress < 100);
        if (active.length === 0) return prev;
        const pick = active[Math.floor(Math.random() * active.length)];
        const delta = 1 + Math.floor(Math.random() * 3);
        return prev.map((a) => {
          if (a.id !== pick.id) return a;
          const nextProgress = Math.min(a.progress + delta, 100);
          const budgetDelta = Math.round((delta / 100) * a.budgetTotal);
          return {
            ...a,
            progress: nextProgress,
            budgetUsed: Math.min(a.budgetUsed + budgetDelta, a.budgetTotal),
            mountedAt: Date.now(),
          };
        });
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const entry = ROTATING_FEED[feedIndexRef.current % ROTATING_FEED.length];
      feedIndexRef.current += 1;
      const stamped = { ...entry, id: `${entry.id}-${feedIndexRef.current}` };
      setFeed((prev) => [stamped, ...prev].slice(0, 8));
    }, 12_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          lastHeartbeat: formatElapsed(Date.now() - a.mountedAt),
        })),
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const seconds = Math.round((Date.now() - lastSyncedAt.getTime()) / 1000);
      if (seconds < 5) setSyncLabel("Just now");
      else if (seconds < 60) setSyncLabel(`${seconds}s ago`);
      else setSyncLabel(`${Math.floor(seconds / 60)}m ago`);
    }, 1000);
    return () => clearInterval(id);
  }, [lastSyncedAt]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setLastSyncedAt(new Date());
    setTimeout(() => setIsRefreshing(false), 800);
  }, []);

  const handleApprovalAction = useCallback((item: ApprovalItem, action: "approved" | "rejected") => {
    const idx = approvals.findIndex((a) => a.id === item.id);
    setApprovals((prev) => prev.filter((a) => a.id !== item.id));
    toaster.create({
      title: `${action === "approved" ? "Approved" : "Rejected"}: ${item.title}`,
      type: action === "approved" ? "success" : "info",
      action: {
        label: "Undo",
        onClick: () => {
          setApprovals((prev) => {
            const copy = [...prev];
            copy.splice(idx, 0, item);
            return copy;
          });
        },
      },
      duration: 5000,
    });
  }, [approvals]);

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
        <Stack gap="1" minW="0">
          <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} letterSpacing="-0.04em" lineHeight="1.05">
            Research dashboard
          </Heading>
          <Text fontSize={{ base: "sm", md: "md" }} lineHeight="1.8" color="ui.textMuted" maxW="4xl">
            Monitor agent status, task pipelines, budgets, and pending approvals.
          </Text>
        </Stack>

        <Flex gap="3" align="center" wrap="wrap" w={{ base: "full", md: "auto" }}>
          <Text fontSize="xs" color="ui.textSubtle" fontFamily="mono" flexShrink={0}>
            Synced {syncLabel}
          </Text>
          <Button size="sm" {...secondaryButtonStyles} onClick={handleRefresh}>
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{ display: "flex", alignItems: "center" }}
            >
              <RefreshCw size={14} />
            </motion.div>
            <Text ml="1.5">Refresh</Text>
          </Button>
        </Flex>
      </Flex>

      <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap="3">
        {summaryItems.map((item, i) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            tone={item.tone}
            hint={item.hint}
            progress={"progress" in item ? item.progress : undefined}
            index={i}
            skip={skip}
          />
        ))}
      </Grid>

      <Grid
        templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 340px" }}
        gap="5"
        alignItems="start"
      >
        <Stack gap="5">
          <Card.Root {...primaryCard}>
            <SectionCardHeader sectionLabel="Fleet" title="Agents" />
            <Card.Body p="0">
              {agents.map((agent, i) => (
                <Box key={agent.id}>
                  <AgentRow
                    agent={agent}
                    index={i}
                    isHighlighted={hoveredAgentName === agent.name}
                    isDimmedByHover={hoveredAgentName !== null && hoveredAgentName !== agent.name}
                    onHover={() => setHoveredAgentName(agent.name)}
                    onLeave={() => setHoveredAgentName(null)}
                    skip={skip}
                  />
                  {i < agents.length - 1 && (
                    <Separator borderColor="ui.border" mx={{ base: "5", md: "6" }} />
                  )}
                </Box>
              ))}
            </Card.Body>
          </Card.Root>

          <Card.Root {...primaryCard}>
            <SectionCardHeader sectionLabel="Feed" title="Recent activity" />
            <Card.Body p="0">
              <AnimatePresence initial={false}>
                {feed.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={skip ? false : { opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={skip ? undefined : { opacity: 0, height: 0, overflow: "hidden" }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    layout={!skip}
                    style={{
                      opacity: hoveredAgentName && !entry.title.includes(hoveredAgentName.split(" ")[0]) ? 0.35 : 1,
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    <Flex align="start" gap="3" py="3" px={{ base: "5", md: "6" }}>
                      <Box
                        h="2" w="2" borderRadius="full"
                        bg={entry.tone} flexShrink={0} mt="1.5"
                      />
                      <Stack gap="0.5" flex="1" minW="0">
                        <Text fontSize="sm" fontWeight="500" color="ui.text">
                          {entry.title}
                        </Text>
                        <Text fontSize="xs" color="ui.textMuted" lineHeight="1.7">
                          {entry.detail}
                        </Text>
                      </Stack>
                    </Flex>
                    {i < feed.length - 1 && (
                      <Separator borderColor="ui.border" mx={{ base: "5", md: "6" }} />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </Card.Body>
          </Card.Root>
        </Stack>

        <Stack gap="5" position={{ xl: "sticky" }} top={{ xl: "6" }} alignSelf="start">
          <Card.Root {...sidebarCard}>
            <SectionCardHeader
              sectionLabel="Review"
              title="Pending approvals"
              trailing={
                <Text fontSize="xs" fontFamily="mono" color="ui.accent" mt="1">
                  {approvals.length} pending
                </Text>
              }
            />
            <Card.Body p="0">
              <AnimatePresence initial={false}>
                {approvals.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={skip ? false : { opacity: 0, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={skip ? undefined : { opacity: 0, x: -20, height: 0, overflow: "hidden" }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    layout={!skip}
                  >
                    <Stack gap="2" py="3" px="5">
                      <Flex align="start" gap="2.5">
                        <Box
                          h="2" w="2" borderRadius="full"
                          bg="ui.violet" flexShrink={0} mt="1.5"
                        />
                        <Stack gap="0.5" flex="1" minW="0">
                          <Text fontSize="sm" fontWeight="500" color="ui.text" lineHeight="1.4">
                            {item.title}
                          </Text>
                          <Flex gap="2" align="center" flexWrap="wrap">
                            <Text fontSize="xs" color="ui.textSubtle">{item.agent}</Text>
                            <HStack gap="1">
                              <Clock size={10} color="var(--ui-text-subtle)" />
                              <Text fontSize="xs" color="ui.textSubtle">{item.submittedAgo}</Text>
                            </HStack>
                          </Flex>
                        </Stack>
                      </Flex>
                      <Flex gap="2" pl="4.5">
                        <Button
                          size="xs" variant="ghost" color="ui.accent" px="2"
                          borderRadius="control" _hover={{ bg: "ui.surfaceHover" }}
                          onClick={() => handleApprovalAction(item, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="xs" {...secondaryButtonStyles} px="2"
                          onClick={() => handleApprovalAction(item, "rejected")}
                        >
                          Reject
                        </Button>
                      </Flex>
                    </Stack>
                    <Separator borderColor="ui.border" mx="5" />
                  </motion.div>
                ))}
              </AnimatePresence>
              {approvals.length === 0 && (
                <Flex py="6" justify="center">
                  <Text fontSize="sm" color="ui.textSubtle">No pending approvals</Text>
                </Flex>
              )}
            </Card.Body>
          </Card.Root>

          <Card.Root {...sidebarCard}>
            <Card.Header
              px={{ base: "5", md: "6" }}
              py="4"
              borderBottom="1px solid"
              borderColor="ui.border"
            >
              <Stack gap="2">
                <Stack gap="1">
                  <Text
                    fontSize="xs" textTransform="uppercase"
                    letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono"
                  >
                    Workflow
                  </Text>
                  <Heading as="h2" fontSize="lg" letterSpacing="-0.03em">
                    Pipeline
                  </Heading>
                </Stack>
                <Tabs.Root
                  value={pipelineTab}
                  onValueChange={(e) => setPipelineTab(e.value)}
                  size="sm"
                  variant="plain"
                >
                  <Tabs.List
                    gap="0"
                    borderBottom="none"
                    position="relative"
                    flexWrap="wrap"
                  >
                    {PIPELINE_TABS.map((tab) => (
                      <Tabs.Trigger
                        key={tab}
                        value={tab}
                        px="2.5"
                        py="1"
                        fontSize="xs"
                        fontWeight="500"
                        color={pipelineTab === tab ? "ui.text" : "ui.textSubtle"}
                        bg="transparent"
                        borderRadius="control"
                        position="relative"
                        _hover={{ color: "ui.text" }}
                        transition="color 0.15s ease"
                      >
                        {tab}
                        {pipelineTab === tab && (
                          <motion.div
                            layoutId="pipeline-tab-indicator"
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: "25%",
                              right: "25%",
                              height: 2,
                              borderRadius: 1,
                              background: "#6B63D7",
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>
                </Tabs.Root>
              </Stack>
            </Card.Header>
            <Card.Body p="0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pipelineTab}
                  initial={skip ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={skip ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  {filteredPipeline.map((stage, si) => (
                    <Box key={stage.label}>
                      <Flex
                        align="center" gap="2" py="2.5" px="5"
                        mt={si > 0 ? "1" : "0"}
                      >
                        <Box h="2" w="2" borderRadius="full" bg={stage.tone} />
                        <Text fontSize="xs" fontWeight="600" color="ui.textMuted">
                          {stage.label}
                        </Text>
                        <Text fontSize="xs" fontFamily="mono" color="ui.textSubtle">
                          {stage.tasks.length}
                        </Text>
                      </Flex>
                      {stage.tasks.map((task, ti) => (
                        <Box key={task.id}>
                          <PipelineTaskRow
                            task={task}
                            isDimmedByHover={hoveredAgentName !== null && task.agent !== hoveredAgentName}
                          />
                          {ti < stage.tasks.length - 1 && (
                            <Separator borderColor="ui.border" ml="8" mr="5" />
                          )}
                        </Box>
                      ))}
                    </Box>
                  ))}
                </motion.div>
              </AnimatePresence>
            </Card.Body>
          </Card.Root>
        </Stack>
      </Grid>
    </Stack>
  );
}
