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
  Text,
} from "@chakra-ui/react";
import { Clock, RefreshCw } from "lucide-react";
import { secondaryButtonStyles } from "./workspaceStyles";

type AgentStatus = "active" | "idle" | "paused" | "error";

type AgentEntry = {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  currentTask: string | null;
  progress: number;
  budgetUsed: number;
  budgetTotal: number;
  lastHeartbeat: string;
};

type PipelineTask = {
  id: string;
  title: string;
  agent: string;
  timeInStage: string;
};

type PipelineStage = {
  label: string;
  tone: string;
  tasks: PipelineTask[];
};

type ApprovalItem = {
  id: string;
  title: string;
  agent: string;
  submittedAgo: string;
};

type FeedEntry = {
  id: string;
  title: string;
  detail: string;
  tone: string;
};

const STATUS_CONFIG: Record<AgentStatus, { label: string; tone: string }> = {
  active: { label: "Active", tone: "ui.success" },
  idle: { label: "Idle", tone: "ui.textSubtle" },
  paused: { label: "Paused", tone: "ui.warning" },
  error: { label: "Error", tone: "ui.danger" },
};

const SEED_AGENTS: AgentEntry[] = [
  {
    id: "fra",
    name: "Field Researcher Alpha",
    role: "Investigation",
    status: "active",
    currentTask: "Survey local policy archives for regulatory precedent",
    progress: 68,
    budgetUsed: 320,
    budgetTotal: 1000,
    lastHeartbeat: "2m ago",
  },
  {
    id: "dab",
    name: "Data Analyst Beta",
    role: "Analysis",
    status: "active",
    currentTask: "Cross-reference citation graphs across 12 journals",
    progress: 41,
    budgetUsed: 180,
    budgetTotal: 800,
    lastHeartbeat: "45s ago",
  },
  {
    id: "rc",
    name: "Review Coordinator",
    role: "Oversight",
    status: "idle",
    currentTask: null,
    progress: 0,
    budgetUsed: 0,
    budgetTotal: 600,
    lastHeartbeat: "18m ago",
  },
  {
    id: "ls",
    name: "Literature Scanner",
    role: "Discovery",
    status: "active",
    currentTask: "Scan arXiv for 2026 submissions on causal inference",
    progress: 85,
    budgetUsed: 740,
    budgetTotal: 1200,
    lastHeartbeat: "1m ago",
  },
  {
    id: "ba",
    name: "Budget Auditor",
    role: "Finance",
    status: "paused",
    currentTask: null,
    progress: 0,
    budgetUsed: 0,
    budgetTotal: 400,
    lastHeartbeat: "1h ago",
  },
];

const SEED_PIPELINE: PipelineStage[] = [
  {
    label: "Queued",
    tone: "ui.textSubtle",
    tasks: [
      { id: "q1", title: "Compile systematic review protocol", agent: "Review Coordinator", timeInStage: "34m" },
      { id: "q2", title: "Audit Q1 research expenditure", agent: "Budget Auditor", timeInStage: "2h 10m" },
    ],
  },
  {
    label: "In Progress",
    tone: "ui.accent",
    tasks: [
      { id: "p1", title: "Survey local policy archives", agent: "Field Researcher Alpha", timeInStage: "1h 20m" },
      { id: "p2", title: "Cross-reference citation graphs", agent: "Data Analyst Beta", timeInStage: "45m" },
      { id: "p3", title: "Scan arXiv 2026 submissions", agent: "Literature Scanner", timeInStage: "28m" },
    ],
  },
  {
    label: "Under Review",
    tone: "ui.violet",
    tasks: [
      { id: "r1", title: "Preliminary findings on gene therapy efficacy", agent: "Field Researcher Alpha", timeInStage: "3h" },
    ],
  },
  {
    label: "Completed",
    tone: "ui.success",
    tasks: [
      { id: "c1", title: "Literature gap analysis — immunotherapy", agent: "Literature Scanner", timeInStage: "6h" },
      { id: "c2", title: "Dataset normalization for cohort study", agent: "Data Analyst Beta", timeInStage: "1d" },
    ],
  },
];

const SEED_FEED: FeedEntry[] = [
  { id: "f1", title: "Literature Scanner started task", detail: "Scanning arXiv for 2026 causal inference submissions.", tone: "ui.accent" },
  { id: "f2", title: "Field Researcher Alpha checkpoint", detail: "Completed 68% of local policy archive survey.", tone: "ui.success" },
  { id: "f3", title: "Data Analyst Beta finding", detail: "Identified 3 citation clusters requiring manual review.", tone: "ui.violet" },
  { id: "f4", title: "Budget Auditor paused", detail: "Awaiting Q1 expenditure data from finance team.", tone: "ui.warning" },
  { id: "f5", title: "Review Coordinator idle", detail: "No pending review assignments. Waiting for new submissions.", tone: "ui.textSubtle" },
];

const SEED_APPROVALS: ApprovalItem[] = [
  { id: "a1", title: "Gene therapy efficacy — preliminary findings", agent: "Field Researcher Alpha", submittedAgo: "3h ago" },
  { id: "a2", title: "Citation cluster anomaly report", agent: "Data Analyst Beta", submittedAgo: "1h ago" },
  { id: "a3", title: "Scope expansion: add immunotherapy vertical", agent: "Literature Scanner", submittedAgo: "45m ago" },
  { id: "a4", title: "Budget reallocation request — Q2", agent: "Budget Auditor", submittedAgo: "20m ago" },
];

const SUMMARY_ITEMS = [
  { label: "Active agents", value: "3 / 5", tone: "ui.success", hint: "3 agents running, 2 idle or paused." },
  { label: "Running tasks", value: "3", tone: "ui.accent", hint: "Tasks currently in progress." },
  { label: "Budget spent", value: "$1,240 / $4,000", tone: "ui.warning", hint: "31% of total budget consumed.", progress: 31 },
  { label: "Pending reviews", value: "4", tone: "ui.violet", hint: "Awaiting human approval." },
] as const;

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

function AgentRow({ agent }: { agent: AgentEntry }) {
  const cfg = STATUS_CONFIG[agent.status];
  const dimmed = agent.status === "idle" || agent.status === "paused";
  const budgetPct = agent.budgetTotal > 0
    ? Math.round((agent.budgetUsed / agent.budgetTotal) * 100)
    : 0;

  return (
    <Flex align="center" gap="3" py="3" px={{ base: "5", md: "6" }}>
      <Box h="2" w="2" borderRadius="full" bg={cfg.tone} flexShrink={0} />
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
            <Box
              h="3px"
              flex="1"
              borderRadius="full"
              bg="ui.surfaceRaised"
              overflow="hidden"
            >
              <Box
                h="full"
                borderRadius="full"
                bg={budgetPct > 75 ? "ui.warning" : "ui.accent"}
                w={`${budgetPct}%`}
                transition="width 0.3s ease"
              />
            </Box>
            <Text fontSize="xs" fontFamily="mono" color="ui.textSubtle" flexShrink={0}>
              ${agent.budgetUsed} / ${agent.budgetTotal}
            </Text>
          </Flex>
        )}
      </Stack>
      <Stack gap="0" align="end" flexShrink={0}>
        <Text fontSize="xs" fontFamily="mono" color={agent.progress > 0 ? "ui.textMuted" : "ui.textSubtle"}>
          {agent.progress > 0 ? `${agent.progress}%` : "\u2014"}
        </Text>
        <HStack gap="1">
          <Clock size={10} color="var(--ui-text-subtle)" />
          <Text fontSize="xs" color="ui.textSubtle">{agent.lastHeartbeat}</Text>
        </HStack>
      </Stack>
    </Flex>
  );
}

function PipelineTaskRow({ task }: { task: PipelineTask }) {
  return (
    <Flex align="center" gap="3" py="2" pl="8" pr="5">
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

function StatCard({
  label,
  value,
  tone,
  hint,
  progress,
}: {
  label: string;
  value: string;
  tone: string;
  hint: string;
  progress?: number;
}) {
  return (
    <Box
      bg="ui.surfaceInset"
      border="1px solid"
      borderColor="ui.border"
      borderRadius="16px"
      px="4"
      py="4"
      flex="1"
      minW="0"
    >
      <Stack gap="1.5">
        <Text
          fontSize="xs"
          textTransform="uppercase"
          letterSpacing="0.16em"
          color="ui.textSubtle"
          fontFamily="mono"
        >
          {label}
        </Text>
        <Text fontSize="lg" fontWeight="700" letterSpacing="-0.03em" color={tone}>
          {value}
        </Text>
        {progress !== undefined && (
          <Box h="3px" borderRadius="full" bg="ui.surfaceRaised" overflow="hidden">
            <Box
              h="full"
              borderRadius="full"
              bg={tone}
              w={`${progress}%`}
              transition="width 0.3s ease"
            />
          </Box>
        )}
        <Text fontSize="xs" color="ui.textMuted" lineHeight="1.7">
          {hint}
        </Text>
      </Stack>
    </Box>
  );
}

export function DashboardSurface() {
  const activeCount = SEED_AGENTS.filter((a) => a.status === "active").length;

  return (
    <Stack gap={{ base: "6", xl: "8" }}>
      {/* ── Page header ── */}
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
              <Text
                fontSize="xs"
                textTransform="uppercase"
                letterSpacing="0.16em"
                color="ui.textSubtle"
                fontFamily="mono"
              >
                Dashboard
              </Text>
            </HStack>
            <HStack
              gap="2"
              px="3"
              py="1.5"
              border="1px solid"
              borderColor="ui.accentBorder"
              borderRadius="full"
              bg="ui.accentMuted"
              w="fit-content"
            >
              <Box h="2" w="2" borderRadius="full" bg="ui.accentSoft" />
              <Text fontSize="sm" color="ui.text">Research Lab</Text>
            </HStack>
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
              <Box h="2" w="2" borderRadius="full" bg="ui.success" />
              <Text fontSize="sm" color="ui.textMuted">
                {activeCount} active
              </Text>
            </HStack>
          </Flex>

          <Stack gap="1" minW="0">
            <Heading
              as="h1"
              fontSize={{ base: "2xl", md: "3xl" }}
              letterSpacing="-0.04em"
              lineHeight="1.05"
            >
              Research dashboard
            </Heading>
            <Text
              fontSize={{ base: "sm", md: "md" }}
              lineHeight="1.8"
              color="ui.textMuted"
              maxW="4xl"
            >
              Monitor agent status, task pipelines, budgets, and pending approvals.
            </Text>
          </Stack>
        </Stack>

        <Flex gap="3" wrap="wrap" w={{ base: "full", md: "auto" }}>
          <Button size="sm" {...secondaryButtonStyles}>
            <RefreshCw size={14} />
            <Text ml="1.5">Refresh</Text>
          </Button>
        </Flex>
      </Flex>

      {/* ── Summary stat cards ── */}
      <Grid
        templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
        gap="3"
      >
        {SUMMARY_ITEMS.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            tone={item.tone}
            hint={item.hint}
            progress={"progress" in item ? item.progress : undefined}
          />
        ))}
      </Grid>

      {/* ── Main + sidebar grid ── */}
      <Grid
        templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 340px" }}
        gap="5"
        alignItems="start"
      >
        {/* Left column */}
        <Stack gap="5">
          {/* Agents card */}
          <Card.Root {...primaryCard}>
            <SectionCardHeader sectionLabel="Fleet" title="Agents" />
            <Card.Body p="0">
              {SEED_AGENTS.map((agent, i) => (
                <Box key={agent.id}>
                  <AgentRow agent={agent} />
                  {i < SEED_AGENTS.length - 1 && (
                    <Separator borderColor="ui.border" mx={{ base: "5", md: "6" }} />
                  )}
                </Box>
              ))}
            </Card.Body>
          </Card.Root>

          {/* Recent activity card */}
          <Card.Root {...primaryCard}>
            <SectionCardHeader sectionLabel="Feed" title="Recent activity" />
            <Card.Body p="0">
              {SEED_FEED.map((entry, i) => (
                <Box key={entry.id}>
                  <Flex align="start" gap="3" py="3" px={{ base: "5", md: "6" }}>
                    <Box
                      h="2"
                      w="2"
                      borderRadius="full"
                      bg={entry.tone}
                      flexShrink={0}
                      mt="1.5"
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
                  {i < SEED_FEED.length - 1 && (
                    <Separator borderColor="ui.border" mx={{ base: "5", md: "6" }} />
                  )}
                </Box>
              ))}
            </Card.Body>
          </Card.Root>
        </Stack>

        {/* Right sidebar */}
        <Stack
          gap="5"
          position={{ xl: "sticky" }}
          top={{ xl: "6" }}
          alignSelf="start"
        >
          {/* Pending approvals card */}
          <Card.Root {...sidebarCard}>
            <SectionCardHeader
              sectionLabel="Review"
              title="Pending approvals"
              trailing={
                <Text fontSize="xs" fontFamily="mono" color="ui.accent" mt="1">
                  {SEED_APPROVALS.length} pending
                </Text>
              }
            />
            <Card.Body p="0">
              {SEED_APPROVALS.map((item, i) => (
                <Box key={item.id}>
                  <Stack gap="2" py="3" px="5">
                    <Flex align="start" gap="2.5">
                      <Box
                        h="2"
                        w="2"
                        borderRadius="full"
                        bg="ui.violet"
                        flexShrink={0}
                        mt="1.5"
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
                        size="xs"
                        variant="ghost"
                        color="ui.accent"
                        px="2"
                        borderRadius="control"
                        _hover={{ bg: "ui.surfaceHover" }}
                      >
                        Approve
                      </Button>
                      <Button size="xs" {...secondaryButtonStyles} px="2">
                        Reject
                      </Button>
                    </Flex>
                  </Stack>
                  {i < SEED_APPROVALS.length - 1 && (
                    <Separator borderColor="ui.border" mx="5" />
                  )}
                </Box>
              ))}
            </Card.Body>
          </Card.Root>

          {/* Pipeline card */}
          <Card.Root {...sidebarCard}>
            <SectionCardHeader sectionLabel="Workflow" title="Pipeline" />
            <Card.Body p="0">
              {SEED_PIPELINE.map((stage, si) => (
                <Box key={stage.label}>
                  <Flex
                    align="center"
                    gap="2"
                    py="2.5"
                    px="5"
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
                      <PipelineTaskRow task={task} />
                      {ti < stage.tasks.length - 1 && (
                        <Separator borderColor="ui.border" ml="8" mr="5" />
                      )}
                    </Box>
                  ))}
                </Box>
              ))}
            </Card.Body>
          </Card.Root>
        </Stack>
      </Grid>
    </Stack>
  );
}
