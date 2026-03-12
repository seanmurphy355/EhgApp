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
import { Clock } from "lucide-react";
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
  { label: "Active agents", value: "3 / 5", tone: "ui.success" },
  { label: "Running tasks", value: "3", tone: "ui.accent" },
  { label: "Budget", value: "$1,240 / $4,000", tone: "ui.warning" },
  { label: "Pending reviews", value: "4", tone: "ui.violet" },
] as const;

const blockCard = {
  bg: "ui.cardAlpha",
  border: "1px solid",
  borderColor: "ui.border",
  borderRadius: "panel",
  shadow: "panel",
  overflow: "hidden",
} as const;

function BlockHeader({ title, trailing }: { title: string; trailing?: React.ReactNode }) {
  return (
    <Flex
      justify="space-between"
      align="baseline"
      px="5"
      py="3.5"
      borderBottom="1px solid"
      borderColor="ui.border"
    >
      <Text fontSize="sm" fontWeight="600" color="ui.text">{title}</Text>
      {trailing}
    </Flex>
  );
}

function AgentRow({ agent }: { agent: AgentEntry }) {
  const cfg = STATUS_CONFIG[agent.status];
  const dimmed = agent.status === "idle" || agent.status === "paused";

  return (
    <Flex align="center" gap="3" py="2.5" px="5">
      <Box h="2" w="2" borderRadius="full" bg={cfg.tone} flexShrink={0} />
      <Stack gap="0.5" flex="1" minW="0">
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
      </Stack>
      <Text fontSize="xs" fontFamily="mono" color={agent.progress > 0 ? "ui.textMuted" : "ui.textSubtle"} flexShrink={0}>
        {agent.progress > 0 ? `${agent.progress}%` : "\u2014"}
      </Text>
      <HStack gap="1" flexShrink={0}>
        <Clock size={10} color="var(--chakra-colors-ui-text-subtle)" />
        <Text fontSize="xs" color="ui.textSubtle">{agent.lastHeartbeat}</Text>
      </HStack>
    </Flex>
  );
}

function PipelineTaskRow({ task }: { task: PipelineTask }) {
  return (
    <Flex align="center" gap="3" py="2" pl="9" pr="5">
      <Text fontSize="sm" color="ui.text" flex="1" truncate>{task.title}</Text>
      <Text fontSize="xs" color="ui.textSubtle" flexShrink={0} truncate>
        {task.agent}
      </Text>
      <HStack gap="1" flexShrink={0}>
        <Clock size={10} color="var(--chakra-colors-ui-text-subtle)" />
        <Text fontSize="xs" fontFamily="mono" color="ui.textSubtle">{task.timeInStage}</Text>
      </HStack>
    </Flex>
  );
}

export function DashboardSurface() {
  return (
    <Stack gap="6">
      <Stack gap="1">
        <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} letterSpacing="-0.04em" lineHeight="1.05">
          Research dashboard
        </Heading>
        <Text fontSize="sm" lineHeight="1.8" color="ui.textMuted">
          Monitor agent status, task pipelines, budgets, and pending approvals.
        </Text>
      </Stack>

      <HStack gap="6" flexWrap="wrap">
        {SUMMARY_ITEMS.map((item, i) => (
          <HStack key={item.label} gap="2">
            {i > 0 && <Box h="3" w="px" bg="ui.border" mr="1" />}
            <Box h="1.5" w="1.5" borderRadius="full" bg={item.tone} />
            <Text fontSize="xs" color="ui.textSubtle">{item.label}</Text>
            <Text fontSize="xs" fontWeight="600" fontFamily="mono" color="ui.text">{item.value}</Text>
          </HStack>
        ))}
      </HStack>

      <Grid templateColumns={{ base: "1fr", xl: "repeat(2, minmax(0, 1fr))" }} gap="4">
        <Card.Root {...blockCard}>
          <BlockHeader title="Agents" />
          <Card.Body p="0">
            {SEED_AGENTS.map((agent, i) => (
              <Box key={agent.id}>
                <AgentRow agent={agent} />
                {i < SEED_AGENTS.length - 1 && <Separator borderColor="ui.border" mx="5" />}
              </Box>
            ))}
          </Card.Body>
        </Card.Root>

        <Card.Root {...blockCard}>
          <BlockHeader title="Pipeline" />
          <Card.Body p="0">
            {SEED_PIPELINE.map((stage, si) => (
              <Box key={stage.label}>
                <Flex align="center" gap="2" py="2.5" px="5" mt={si > 0 ? "1" : "0"}>
                  <Box h="2" w="2" borderRadius="full" bg={stage.tone} />
                  <Text fontSize="xs" fontWeight="600" color="ui.textMuted">{stage.label}</Text>
                  <Text fontSize="xs" fontFamily="mono" color="ui.textSubtle">{stage.tasks.length}</Text>
                </Flex>
                {stage.tasks.map((task, ti) => (
                  <Box key={task.id}>
                    <PipelineTaskRow task={task} />
                    {ti < stage.tasks.length - 1 && <Separator borderColor="ui.border" ml="9" mr="5" />}
                  </Box>
                ))}
              </Box>
            ))}
          </Card.Body>
        </Card.Root>

        <Card.Root {...blockCard}>
          <BlockHeader title="Recent activity" />
          <Card.Body p="0">
            {SEED_FEED.map((entry, i) => (
              <Box key={entry.id}>
                <Flex align="center" gap="3" py="2.5" px="5">
                  <Box h="1.5" w="1.5" borderRadius="full" bg={entry.tone} flexShrink={0} />
                  <Text fontSize="sm" fontWeight="500" color="ui.text" flexShrink={0}>
                    {entry.title}
                  </Text>
                  <Text fontSize="sm" color="ui.textSubtle" flex="1" truncate>
                    {entry.detail}
                  </Text>
                </Flex>
                {i < SEED_FEED.length - 1 && <Separator borderColor="ui.border" mx="5" />}
              </Box>
            ))}
          </Card.Body>
        </Card.Root>

        <Card.Root {...blockCard}>
          <BlockHeader
            title="Pending approvals"
            trailing={
              <Text fontSize="xs" fontFamily="mono" color="ui.accent">{SEED_APPROVALS.length} pending</Text>
            }
          />
          <Card.Body p="0">
            {SEED_APPROVALS.map((item, i) => (
              <Box key={item.id}>
                <Flex align="center" gap="3" py="2.5" px="5">
                  <Box h="1.5" w="1.5" borderRadius="full" bg="ui.violet" flexShrink={0} />
                  <Stack gap="0.5" flex="1" minW="0">
                    <Text fontSize="sm" fontWeight="500" color="ui.text" truncate>
                      {item.title}
                    </Text>
                    <Flex gap="2" align="center">
                      <Text fontSize="xs" color="ui.textSubtle">{item.agent}</Text>
                      <HStack gap="1">
                        <Clock size={10} color="var(--chakra-colors-ui-text-subtle)" />
                        <Text fontSize="xs" color="ui.textSubtle">{item.submittedAgo}</Text>
                      </HStack>
                    </Flex>
                  </Stack>
                  <HStack gap="1.5" flexShrink={0}>
                    <Button size="xs" variant="ghost" color="ui.accent" px="2" borderRadius="control" _hover={{ bg: "ui.surfaceHover" }}>
                      Approve
                    </Button>
                    <Button size="xs" {...secondaryButtonStyles} px="2">
                      Reject
                    </Button>
                  </HStack>
                </Flex>
                {i < SEED_APPROVALS.length - 1 && <Separator borderColor="ui.border" mx="5" />}
              </Box>
            ))}
          </Card.Body>
        </Card.Root>
      </Grid>
    </Stack>
  );
}
