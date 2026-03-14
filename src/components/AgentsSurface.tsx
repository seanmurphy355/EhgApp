import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Card,
  Flex,
  Grid,
  Heading,
  HStack,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ArrowLeft, Clock } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Area, AreaChart, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";
import { colors } from "../theme/tokens";
import {
  type AgentEntry,
  type FeedEntry,
  formatElapsed,
  HEALTH_CONFIG,
  ROTATING_FEED,
  SEED_AGENTS,
  SEED_FEED,
  SEED_PIPELINE,
  STATUS_CONFIG,
  TONE_HEX,
} from "../lib/agentData";

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

const HEX = {
  accent: colors.ui.accent,
} as const;

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

function MiniStat({
  label,
  value,
  tone,
  index,
  skip,
}: {
  label: string;
  value: string;
  tone: string;
  index: number;
  skip: boolean;
}) {
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
        py="3.5"
        h="full"
        transition="border-color 0.15s ease"
        _hover={{ borderColor: "ui.borderStrong" }}
      >
        <Stack gap="0">
          <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.14em" color="ui.textSubtle" fontFamily="mono">
            {label}
          </Text>
          <Text fontSize="lg" fontWeight="700" letterSpacing="-0.03em" color={tone}>
            {value}
          </Text>
        </Stack>
      </Box>
    </motion.div>
  );
}

const PERF_LABELS = ["6h", "5h", "4h", "3h", "2h", "1h", "now"];

function generatePerfData(agent: AgentEntry) {
  const base = agent.progress > 0 ? Math.max(5, agent.progress - 45) : 0;
  return PERF_LABELS.map((label, i) => ({
    label,
    tasks: Math.round(base + (agent.progress - base) * (i / (PERF_LABELS.length - 1))),
    budget: Math.round(agent.budgetUsed * (0.15 + 0.85 * (i / (PERF_LABELS.length - 1)))),
  }));
}

function AgentDetailView({
  agent,
  agents,
  feed,
  skip,
  onBack,
}: {
  agent: AgentEntry;
  agents: AgentEntry[];
  feed: FeedEntry[];
  skip: boolean;
  onBack: () => void;
}) {
  const cfg = STATUS_CONFIG[agent.status];
  const healthCfg = HEALTH_CONFIG[agent.health.status];
  const budgetPct = agent.budgetTotal > 0 ? Math.round((agent.budgetUsed / agent.budgetTotal) * 100) : 0;
  const hex = TONE_HEX[cfg.tone] ?? "#6B63D7";

  const perfData = useMemo(() => generatePerfData(agent), [agent]);

  const agentFeed = useMemo(
    () => feed.filter((e) => e.title.includes(agent.name.split(" ")[0])),
    [feed, agent.name],
  );

  const agentPipeline = useMemo(() => {
    return SEED_PIPELINE.map((stage) => ({
      ...stage,
      tasks: stage.tasks.filter((t) => t.agent === agent.name),
    })).filter((stage) => stage.tasks.length > 0);
  }, [agent.name]);

  const completedTasks = useMemo(() => {
    return SEED_PIPELINE.find((s) => s.label === "Completed")?.tasks.filter((t) => t.agent === agent.name).length ?? 0;
  }, [agent.name]);

  const uptimeMs = Date.now() - agent.mountedAt;
  const uptimeLabel = uptimeMs < 60_000
    ? `${Math.floor(uptimeMs / 1000)}s`
    : uptimeMs < 3_600_000
      ? `${Math.floor(uptimeMs / 60_000)}m`
      : `${Math.floor(uptimeMs / 3_600_000)}h ${Math.floor((uptimeMs % 3_600_000) / 60_000)}m`;

  return (
    <Stack gap={{ base: "6", xl: "8" }}>
      <Flex align="center" gap="3" pb="5" borderBottom="1px solid" borderColor="ui.border">
        <Box
          as="button"
          onClick={onBack}
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="9"
          w="9"
          borderRadius="control"
          bg="ui.surfaceInset"
          border="1px solid"
          borderColor="ui.border"
          color="ui.textMuted"
          cursor="pointer"
          flexShrink={0}
          _hover={{ bg: "ui.surfaceHover", borderColor: "ui.borderStrong", color: "ui.text" }}
          transition="all 0.15s ease"
        >
          <ArrowLeft size={16} />
        </Box>
        <Stack gap="0" flex="1" minW="0">
          <Flex align="center" gap="2.5">
            <Heading as="h1" fontSize={{ base: "xl", md: "2xl" }} letterSpacing="-0.04em" lineHeight="1.05">
              {agent.name}
            </Heading>
            <HStack
              gap="1.5"
              px="2.5"
              py="1"
              borderRadius="full"
              bg="ui.pillAlpha"
              border="1px solid"
              borderColor="ui.border"
            >
              <Box
                h="6px"
                w="6px"
                borderRadius="full"
                bg={cfg.tone}
                css={agent.status === "active" ? { animation: "activePulse 2s ease-in-out infinite" } : undefined}
              />
              <Text fontSize="xs" fontWeight="500" color={cfg.tone}>
                {cfg.label}
              </Text>
            </HStack>
            <HStack
              gap="1.5"
              px="2.5"
              py="1"
              borderRadius="full"
              bg="ui.pillAlpha"
              border="1px solid"
              borderColor="ui.border"
            >
              <Box h="6px" w="6px" borderRadius="full" bg={healthCfg.tone} />
              <Text fontSize="xs" fontWeight="500" color={healthCfg.tone}>
                {healthCfg.label}
              </Text>
            </HStack>
          </Flex>
          <Flex gap="3" align="center" mt="0.5">
            <Text fontSize="sm" fontFamily="mono" color="ui.textSubtle">{agent.role}</Text>
            <HStack gap="1">
              <Clock size={10} color="var(--ui-text-subtle)" />
              <Text fontSize="xs" color="ui.textSubtle">{agent.lastHeartbeat}</Text>
            </HStack>
          </Flex>
        </Stack>
      </Flex>

      <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap="3">
        <MiniStat label="Progress" value={agent.progress > 0 ? `${agent.progress}%` : "\u2014"} tone="ui.accent" index={0} skip={skip} />
        <MiniStat label="Budget" value={`$${agent.budgetUsed} / $${agent.budgetTotal}`} tone="ui.warning" index={1} skip={skip} />
        <MiniStat label="Completed" value={String(completedTasks)} tone="ui.success" index={2} skip={skip} />
        <MiniStat label="Uptime" value={uptimeLabel} tone="ui.violet" index={3} skip={skip} />
      </Grid>

      <Grid
        templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 340px" }}
        gap="5"
        alignItems="start"
      >
        <Stack gap="5">
          <Card.Root {...primaryCard}>
            <SectionCardHeader sectionLabel="Performance" title="Metrics over time" />
            <Card.Body px={{ base: "2", md: "4" }} py="4">
              <Box h="220px">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={perfData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="perfTaskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={HEX.accent} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={HEX.accent} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="perfBudgetGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFB64A" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#FFB64A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: colors.ui.textSubtle, fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: colors.ui.textSubtle, fontSize: 11 }}
                    />
                    <RTooltip
                      contentStyle={{
                        backgroundColor: colors.ui.surface,
                        border: `1px solid ${colors.ui.borderStrong}`,
                        borderRadius: 12,
                        fontSize: 12,
                        color: colors.ui.text,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="tasks"
                      name="Progress %"
                      stroke={HEX.accent}
                      strokeWidth={2}
                      fill="url(#perfTaskGrad)"
                      isAnimationActive={!skip}
                      animationDuration={800}
                    />
                    <Area
                      type="monotone"
                      dataKey="budget"
                      name="Budget ($)"
                      stroke="#FFB64A"
                      strokeWidth={1.5}
                      fill="url(#perfBudgetGrad)"
                      isAnimationActive={!skip}
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Card.Body>
          </Card.Root>

          <Card.Root {...primaryCard}>
            <SectionCardHeader sectionLabel="Feed" title="Agent activity" />
            <Card.Body p="0">
              {agentFeed.length === 0 ? (
                <Flex py="6" justify="center">
                  <Text fontSize="sm" color="ui.textSubtle">No recent activity for this agent.</Text>
                </Flex>
              ) : (
                <AnimatePresence initial={false}>
                  {agentFeed.map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      initial={skip ? false : { opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={skip ? undefined : { opacity: 0, height: 0, overflow: "hidden" }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      layout={!skip}
                    >
                      <Flex align="start" gap="3" py="3" px={{ base: "5", md: "6" }}>
                        <Box h="2" w="2" borderRadius="full" bg={entry.tone} flexShrink={0} mt="1.5" />
                        <Stack gap="0.5" flex="1" minW="0">
                          <Text fontSize="sm" fontWeight="500" color="ui.text">{entry.title}</Text>
                          <Text fontSize="xs" color="ui.textMuted" lineHeight="1.7">{entry.detail}</Text>
                        </Stack>
                      </Flex>
                      {i < agentFeed.length - 1 && (
                        <Separator borderColor="ui.border" mx={{ base: "5", md: "6" }} />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </Card.Body>
          </Card.Root>
        </Stack>

        <Stack gap="5" position={{ xl: "sticky" }} top={{ xl: "6" }} alignSelf="start">
          <Card.Root {...sidebarCard}>
            <SectionCardHeader
              sectionLabel="Pipeline"
              title="Tasks"
              trailing={
                <Text fontSize="xs" fontFamily="mono" color="ui.accent" mt="1">
                  {agentPipeline.reduce((s, st) => s + st.tasks.length, 0)} tasks
                </Text>
              }
            />
            <Card.Body p="0">
              {agentPipeline.length === 0 ? (
                <Flex py="6" justify="center">
                  <Text fontSize="sm" color="ui.textSubtle">No pipeline tasks.</Text>
                </Flex>
              ) : (
                agentPipeline.map((stage, si) => (
                  <Box key={stage.label}>
                    <Flex align="center" gap="2" py="2.5" px="5" mt={si > 0 ? "1" : "0"}>
                      <Box h="2" w="2" borderRadius="full" bg={stage.tone} />
                      <Text fontSize="xs" fontWeight="600" color="ui.textMuted">{stage.label}</Text>
                      <Text fontSize="xs" fontFamily="mono" color="ui.textSubtle">{stage.tasks.length}</Text>
                    </Flex>
                    {stage.tasks.map((task, ti) => (
                      <Box key={task.id}>
                        <Flex align="center" gap="3" py="2" pl="8" pr="5">
                          <Text fontSize="sm" color="ui.text" flex="1" truncate>{task.title}</Text>
                          <HStack gap="1" flexShrink={0}>
                            <Clock size={10} color="var(--ui-text-subtle)" />
                            <Text fontSize="xs" fontFamily="mono" color="ui.textSubtle">{task.timeInStage}</Text>
                          </HStack>
                        </Flex>
                        {ti < stage.tasks.length - 1 && (
                          <Separator borderColor="ui.border" ml="8" mr="5" />
                        )}
                      </Box>
                    ))}
                  </Box>
                ))
              )}
            </Card.Body>
          </Card.Root>

          <Card.Root {...sidebarCard}>
            <SectionCardHeader
              sectionLabel="Diagnostics"
              title="Health check"
              trailing={
                <HStack
                  gap="1.5"
                  px="2"
                  py="0.5"
                  borderRadius="full"
                  bg="ui.surfaceInset"
                  border="1px solid"
                  borderColor="ui.border"
                  mt="1"
                >
                  <Box h="5px" w="5px" borderRadius="full" bg={healthCfg.tone} />
                  <Text fontSize="10px" fontFamily="mono" color={healthCfg.tone}>{healthCfg.label}</Text>
                </HStack>
              }
            />
            <Card.Body px="5" py="4">
              <Stack gap="3">
                <Flex justify="space-between" align="center">
                  <Text fontSize="xs" color="ui.textSubtle">Latency</Text>
                  <Text fontSize="xs" fontFamily="mono" color={agent.health.latencyMs > 200 ? "ui.warning" : "ui.text"}>
                    {agent.health.latencyMs}ms
                  </Text>
                </Flex>
                <Separator borderColor="ui.border" />
                <Flex justify="space-between" align="center">
                  <Text fontSize="xs" color="ui.textSubtle">Memory</Text>
                  <Flex align="center" gap="2">
                    <Box h="3px" w="48px" borderRadius="full" bg="ui.surfaceRaised" overflow="hidden">
                      <Box
                        h="full"
                        borderRadius="full"
                        bg={agent.health.memoryPct > 80 ? "ui.danger" : agent.health.memoryPct > 60 ? "ui.warning" : "ui.success"}
                        w={`${agent.health.memoryPct}%`}
                        transition="width 0.4s ease"
                      />
                    </Box>
                    <Text fontSize="xs" fontFamily="mono" color="ui.text">{agent.health.memoryPct}%</Text>
                  </Flex>
                </Flex>
                <Separator borderColor="ui.border" />
                <Flex justify="space-between" align="center">
                  <Text fontSize="xs" color="ui.textSubtle">Error rate</Text>
                  <Text fontSize="xs" fontFamily="mono" color={agent.health.errorRate > 5 ? "ui.danger" : agent.health.errorRate > 2 ? "ui.warning" : "ui.text"}>
                    {agent.health.errorRate}%
                  </Text>
                </Flex>
                <Separator borderColor="ui.border" />
                <Flex justify="space-between" align="center">
                  <Text fontSize="xs" color="ui.textSubtle">Last check</Text>
                  <Text fontSize="xs" fontFamily="mono" color="ui.textMuted">
                    {formatElapsed(Date.now() - agent.health.lastCheckAt)}
                  </Text>
                </Flex>
              </Stack>
            </Card.Body>
          </Card.Root>

          {agent.currentTask && (
            <Card.Root {...sidebarCard}>
              <SectionCardHeader sectionLabel="Active" title="Current task" />
              <Card.Body px="5" py="4">
                <Text fontSize="sm" color="ui.text" lineHeight="1.6">{agent.currentTask}</Text>
                {agent.progress > 0 && (
                  <Box mt="3">
                    <Flex justify="space-between" mb="1.5">
                      <Text fontSize="xs" fontFamily="mono" color="ui.textSubtle">Progress</Text>
                      <Text fontSize="xs" fontFamily="mono" color="ui.accent">{agent.progress}%</Text>
                    </Flex>
                    <Box h="4px" borderRadius="full" bg="ui.surfaceRaised" overflow="hidden">
                      <motion.div
                        animate={{ width: `${agent.progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{ height: "100%", borderRadius: 9999, background: hex }}
                      />
                    </Box>
                  </Box>
                )}
              </Card.Body>
            </Card.Root>
          )}
        </Stack>
      </Grid>
    </Stack>
  );
}

export function AgentsSurface() {
  const prefersReduced = useReducedMotion();
  const skip = !!prefersReduced;

  const [agents, setAgents] = useState<AgentEntry[]>(SEED_AGENTS);
  const [feed, setFeed] = useState<FeedEntry[]>(SEED_FEED);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const feedIndexRef = useRef(0);

  const activeCount = useMemo(() => agents.filter((a) => a.status === "active").length, [agents]);
  const totalTasks = useMemo(() => SEED_PIPELINE.reduce((s, st) => s + st.tasks.length, 0), []);
  const avgProgress = useMemo(() => {
    const running = agents.filter((a) => a.progress > 0);
    return running.length > 0 ? Math.round(running.reduce((s, a) => s + a.progress, 0) / running.length) : 0;
  }, [agents]);
  const totalBudgetUsed = useMemo(() => agents.reduce((s, a) => s + a.budgetUsed, 0), [agents]);

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
      setAgents((prev) =>
        prev.map((a) => ({ ...a, lastHeartbeat: formatElapsed(Date.now() - a.mountedAt) })),
      );
    }, 3000);
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

  const selectedAgent = useMemo(
    () => (selectedAgentId ? agents.find((a) => a.id === selectedAgentId) ?? null : null),
    [agents, selectedAgentId],
  );

  if (selectedAgent) {
    return (
      <AgentDetailView
        agent={selectedAgent}
        agents={agents}
        feed={feed}
        skip={skip}
        onBack={() => setSelectedAgentId(null)}
      />
    );
  }

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
          <Flex align="center" gap="3">
            <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} letterSpacing="-0.04em" lineHeight="1.05">
              Agents
            </Heading>
            <HStack
              gap="1.5"
              px="2.5"
              py="1"
              borderRadius="full"
              bg="ui.pillAlpha"
              border="1px solid"
              borderColor="ui.border"
            >
              <Box h="6px" w="6px" borderRadius="full" bg="ui.success" css={{ animation: "activePulse 2s ease-in-out infinite" }} />
              <Text fontSize="xs" fontFamily="mono" color="ui.textMuted">{activeCount} active</Text>
            </HStack>
          </Flex>
          <Text fontSize={{ base: "sm", md: "md" }} lineHeight="1.8" color="ui.textMuted" maxW="4xl">
            View all agents, monitor health and status, and drill into individual dashboards.
          </Text>
        </Stack>
      </Flex>

      <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap="3">
        <MiniStat label="Active" value={`${activeCount} / ${agents.length}`} tone="ui.success" index={0} skip={skip} />
        <MiniStat label="Tasks" value={String(totalTasks)} tone="ui.accent" index={1} skip={skip} />
        <MiniStat label="Avg progress" value={`${avgProgress}%`} tone="ui.violet" index={2} skip={skip} />
        <MiniStat label="Budget used" value={`$${totalBudgetUsed.toLocaleString()}`} tone="ui.warning" index={3} skip={skip} />
      </Grid>

      <Card.Root {...primaryCard}>
        <SectionCardHeader
          sectionLabel="Fleet"
          title="All agents"
          trailing={
            <Text fontSize="xs" fontFamily="mono" color="ui.textSubtle" mt="1">
              {agents.length} total
            </Text>
          }
        />
        <Card.Body p="0">
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap="0">
            {agents.map((agent, i) => {
              const agentCfg = STATUS_CONFIG[agent.status];
              const dimmed = agent.status === "idle" || agent.status === "paused";
              const budgetPct = agent.budgetTotal > 0 ? Math.round((agent.budgetUsed / agent.budgetTotal) * 100) : 0;
              const barHex = budgetPct > 75 ? "#FFB64A" : "#6B63D7";

              return (
                <motion.div
                  key={agent.id}
                  initial={skip ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.04, ease: "easeOut" }}
                  whileHover={skip ? undefined : { scale: 1.01, transition: { duration: 0.12 } }}
                >
                  <Box
                    px={{ base: "5", md: "6" }}
                    py="4"
                    cursor="pointer"
                    borderRight={{ md: "1px solid" }}
                    borderBottom="1px solid"
                    borderColor="ui.border"
                    _hover={{ bg: "ui.surfaceHover" }}
                    transition="background-color 0.15s ease"
                    onClick={() => setSelectedAgentId(agent.id)}
                  >
                    <Flex align="center" gap="2.5" mb="2">
                      <Box
                        h="7px"
                        w="7px"
                        borderRadius="full"
                        bg={agentCfg.tone}
                        flexShrink={0}
                        css={agent.status === "active" ? { animation: "activePulse 2s ease-in-out infinite" } : undefined}
                      />
                      <Text fontSize="sm" fontWeight="600" color={dimmed ? "ui.textSubtle" : "ui.text"} truncate>
                        {agent.name}
                      </Text>
                    </Flex>
                    <Flex align="center" gap="2" mb="2" flexWrap="wrap">
                      <Text fontSize="xs" fontFamily="mono" color="ui.textSubtle">{agent.role}</Text>
                      <Text fontSize="xs" color={agentCfg.tone}>{agentCfg.label}</Text>
                      <HStack
                        gap="1"
                        px="1.5"
                        py="0.5"
                        borderRadius="full"
                        bg="ui.surfaceInset"
                        border="1px solid"
                        borderColor="ui.border"
                        ml="auto"
                      >
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
                    </Flex>
                    <Text fontSize="xs" color={dimmed ? "ui.textSubtle" : "ui.textMuted"} truncate mb="2.5">
                      {agent.currentTask ?? "No active task"}
                    </Text>
                    {agent.budgetTotal > 0 && (
                      <Flex align="center" gap="2" mb="1.5">
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
                    <Flex justify="space-between" align="center">
                      <Text fontSize="xs" fontFamily="mono" color={agent.progress > 0 ? "ui.textMuted" : "ui.textSubtle"}>
                        {agent.progress > 0 ? `${agent.progress}%` : "\u2014"}
                      </Text>
                      <HStack gap="1">
                        <Clock size={10} color="var(--ui-text-subtle)" />
                        <Text fontSize="xs" color="ui.textSubtle">{agent.lastHeartbeat}</Text>
                      </HStack>
                    </Flex>
                  </Box>
                </motion.div>
              );
            })}
          </Grid>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
}
