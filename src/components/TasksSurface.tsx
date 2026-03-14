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
  Textarea,
} from "@chakra-ui/react";
import { Clock, Play, AlertCircle, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  fieldStyles,
  primaryButtonStyles,
  secondaryButtonStyles,
} from "./workspaceStyles";

type ActivityFeedEntry = {
  id: string;
  title: string;
  detail: string;
  tone: string;
};

type SummaryCardEntry = {
  label: string;
  value: string;
  hint: string;
  tone: string;
};

export type TasksSurfaceProps = {
  repoName: string;
  prompt: string;
  activityFeed: ActivityFeedEntry[];
  summaryCards: SummaryCardEntry[];
  isBackendSyncing: boolean;
  isRunningTask: boolean;
  backendError: string | null;
  canRunTask: boolean;
  onRepoNameChange: (value: string) => void;
  onPromptChange: (value: string) => void;
  onRunTask: () => void;
  onRetryBackend: () => void;
};

type TaskHistoryEntry = {
  id: string;
  prompt: string;
  status: "running" | "completed" | "failed";
  agent: string;
  timestamp: string;
};

const SEED_TASK_HISTORY: TaskHistoryEntry[] = [
  {
    id: "th-1",
    prompt: "Compare recent agent frameworks for enterprise research workflows.",
    status: "completed",
    agent: "Field Researcher Alpha",
    timestamp: "2h ago",
  },
  {
    id: "th-2",
    prompt: "Summarize model evaluation approaches for lab automation teams.",
    status: "completed",
    agent: "Literature Scanner",
    timestamp: "5h ago",
  },
  {
    id: "th-3",
    prompt: "Review local-first orchestration options with citation support.",
    status: "failed",
    agent: "Data Analyst Beta",
    timestamp: "1d ago",
  },
  {
    id: "th-4",
    prompt: "Map regulatory precedent for gene therapy trial designs.",
    status: "completed",
    agent: "Field Researcher Alpha",
    timestamp: "1d ago",
  },
];

const PROMPT_SUGGESTIONS = [
  "Compare recent agent frameworks for enterprise research workflows.",
  "Summarize model evaluation approaches for lab automation teams.",
  "Review local-first orchestration options with citation support.",
] as const;

const STATUS_CONFIG: Record<TaskHistoryEntry["status"], { tone: string; label: string }> = {
  running: { tone: "ui.accent", label: "Running" },
  completed: { tone: "ui.success", label: "Completed" },
  failed: { tone: "ui.danger", label: "Failed" },
};

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

function StatusIcon({ status }: { status: TaskHistoryEntry["status"] }) {
  const size = 14;
  switch (status) {
    case "running":
      return <Play size={size} />;
    case "completed":
      return <CheckCircle2 size={size} />;
    case "failed":
      return <AlertCircle size={size} />;
  }
}

function TaskHistoryRow({
  entry,
  index,
  skip,
}: {
  entry: TaskHistoryEntry;
  index: number;
  skip: boolean;
}) {
  const cfg = STATUS_CONFIG[entry.status];

  return (
    <motion.div
      initial={skip ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={skip ? undefined : { opacity: 0, height: 0, overflow: "hidden" }}
      transition={{ duration: 0.18, delay: index * 0.04, ease: "easeOut" }}
      layout={!skip}
    >
      <Flex align="start" gap="3" py="3" px={{ base: "5", md: "6" }}>
        <Flex
          h="6"
          w="6"
          align="center"
          justify="center"
          borderRadius="full"
          bg="ui.surfaceInset"
          border="1px solid"
          borderColor="ui.border"
          color={cfg.tone}
          flexShrink={0}
          mt="0.5"
        >
          <StatusIcon status={entry.status} />
        </Flex>
        <Stack gap="0.5" flex="1" minW="0">
          <Text fontSize="sm" fontWeight="500" color="ui.text" truncate>
            {entry.prompt}
          </Text>
          <Flex gap="2" align="center" flexWrap="wrap">
            <Text fontSize="xs" color={cfg.tone} fontWeight="500">
              {cfg.label}
            </Text>
            <Text fontSize="xs" color="ui.textSubtle">{entry.agent}</Text>
            <HStack gap="1">
              <Clock size={10} color="var(--ui-text-subtle)" />
              <Text fontSize="xs" color="ui.textSubtle">{entry.timestamp}</Text>
            </HStack>
          </Flex>
        </Stack>
      </Flex>
    </motion.div>
  );
}

export function TasksSurface({
  repoName,
  prompt,
  activityFeed,
  summaryCards,
  isRunningTask,
  backendError,
  canRunTask,
  onRepoNameChange,
  onPromptChange,
  onRunTask,
  onRetryBackend,
}: TasksSurfaceProps) {
  const prefersReduced = useReducedMotion();
  const skip = !!prefersReduced;

  const connectionLabel = backendError ? "Backend offline" : "Connected";
  const connectionTone = backendError ? "ui.warning" : "ui.success";

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
          <Heading
            as="h1"
            fontSize={{ base: "2xl", md: "3xl" }}
            letterSpacing="-0.04em"
            lineHeight="1.05"
          >
            Task operations
          </Heading>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            lineHeight="1.8"
            color="ui.textMuted"
            maxW="4xl"
          >
            Run scoped research work, keep prompts reviewable, and monitor active investigations.
          </Text>
        </Stack>

        <Flex gap="3" align="center" wrap="wrap" w={{ base: "full", md: "auto" }}>
          <HStack
            gap="2"
            px="3"
            py="1.5"
            border="1px solid"
            borderColor="ui.border"
            borderRadius="full"
            bg="ui.pillAlpha"
          >
            <Box h="2" w="2" borderRadius="full" bg={connectionTone} />
            <Text fontSize="xs" color="ui.textMuted">{connectionLabel}</Text>
          </HStack>
          <Button
            {...primaryButtonStyles}
            onClick={onRunTask}
            disabled={!canRunTask || isRunningTask}
          >
            {isRunningTask ? "Running..." : "Run task"}
          </Button>
        </Flex>
      </Flex>

      {backendError && (
        <Card.Root
          bg="ui.cardAltAlpha"
          border="1px solid"
          borderColor="ui.warning"
          borderRadius="panel"
          shadow="hairline"
        >
          <Card.Body px="5" py="4">
            <Flex
              direction={{ base: "column", md: "row" }}
              gap="4"
              justify="space-between"
              align={{ md: "center" }}
            >
              <Stack gap="1">
                <Text fontSize="sm" fontWeight="600" color="ui.text">
                  Backend unavailable
                </Text>
                <Text fontSize="sm" color="ui.textMuted" lineHeight="1.6">
                  {backendError}
                </Text>
              </Stack>
              <Button
                {...secondaryButtonStyles}
                onClick={onRetryBackend}
                minW={{ md: "150px" }}
              >
                Retry backend
              </Button>
            </Flex>
          </Card.Body>
        </Card.Root>
      )}

      <Grid
        templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 340px" }}
        gap="5"
        alignItems="start"
      >
        <Stack gap="5">
          <Card.Root {...primaryCard}>
            <SectionCardHeader sectionLabel="Quick start" title="New task" />
            <Card.Body px={{ base: "5", md: "6" }} py={{ base: "5", md: "6" }}>
              <Stack gap="5">
                <Box>
                  <Text
                    mb="2"
                    fontSize="xs"
                    textTransform="uppercase"
                    letterSpacing="0.18em"
                    color="ui.textSubtle"
                    fontFamily="mono"
                  >
                    Repository
                  </Text>
                  <Input
                    value={repoName}
                    onChange={(e) => onRepoNameChange(e.target.value)}
                    {...fieldStyles}
                  />
                </Box>

                <Box>
                  <Text
                    mb="2"
                    fontSize="xs"
                    textTransform="uppercase"
                    letterSpacing="0.18em"
                    color="ui.textSubtle"
                    fontFamily="mono"
                  >
                    Task prompt
                  </Text>
                  <Textarea
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    minH="160px"
                    resize="vertical"
                    {...fieldStyles}
                  />
                </Box>

                <Stack gap="2.5">
                  <Text
                    fontSize="xs"
                    textTransform="uppercase"
                    letterSpacing="0.18em"
                    color="ui.textSubtle"
                    fontFamily="mono"
                  >
                    Suggested prompts
                  </Text>
                  <Flex gap="2" wrap="wrap">
                    {PROMPT_SUGGESTIONS.map((item) => (
                      <Button
                        key={item}
                        justifyContent="start"
                        textAlign="left"
                        whiteSpace="normal"
                        h="auto"
                        py="2"
                        px="3"
                        variant="ghost"
                        border="1px solid"
                        borderColor="ui.border"
                        borderRadius="control"
                        bg="ui.surfaceInset"
                        color="ui.textMuted"
                        fontSize="xs"
                        lineHeight="1.5"
                        _hover={{ bg: "ui.surfaceHover", color: "ui.text" }}
                        onClick={() => onPromptChange(item)}
                      >
                        {item}
                      </Button>
                    ))}
                  </Flex>
                </Stack>

                <Flex justify="end">
                  <Button
                    {...primaryButtonStyles}
                    onClick={onRunTask}
                    disabled={!canRunTask || isRunningTask}
                    minW="140px"
                  >
                    {isRunningTask ? "Running..." : "Run task"}
                  </Button>
                </Flex>
              </Stack>
            </Card.Body>
          </Card.Root>

          <Card.Root {...primaryCard}>
            <SectionCardHeader
              sectionLabel="History"
              title="Recent tasks"
              trailing={
                <Text fontSize="xs" fontFamily="mono" color="ui.textSubtle" mt="1">
                  {SEED_TASK_HISTORY.length} tasks
                </Text>
              }
            />
            <Card.Body p="0">
              <AnimatePresence initial={false}>
                {SEED_TASK_HISTORY.map((entry, i) => (
                  <Box key={entry.id}>
                    <TaskHistoryRow entry={entry} index={i} skip={skip} />
                    {i < SEED_TASK_HISTORY.length - 1 && (
                      <Separator
                        borderColor="ui.border"
                        mx={{ base: "5", md: "6" }}
                      />
                    )}
                  </Box>
                ))}
              </AnimatePresence>
            </Card.Body>
          </Card.Root>
        </Stack>

        <Stack
          gap="5"
          position={{ xl: "sticky" }}
          top={{ xl: "6" }}
          alignSelf="start"
        >
          <Card.Root {...sidebarCard}>
            <SectionCardHeader sectionLabel="Metrics" title="Task summary" />
            <Card.Body px="5" py="4">
              <Stack gap="3">
                {summaryCards.map((card) => (
                  <Box
                    key={card.label}
                    bg="ui.surfaceInset"
                    border="1px solid"
                    borderColor="ui.border"
                    borderRadius="16px"
                    px="4"
                    py="3.5"
                  >
                    <Stack gap="1.5">
                      <Flex align="center" gap="2">
                        <Box h="2" w="2" borderRadius="full" bg={card.tone} />
                        <Text
                          fontSize="xs"
                          textTransform="uppercase"
                          letterSpacing="0.16em"
                          color="ui.textSubtle"
                          fontFamily="mono"
                        >
                          {card.label}
                        </Text>
                      </Flex>
                      <Flex align="baseline" justify="space-between" gap="3">
                        <Text fontSize="sm" color="ui.textMuted" lineHeight="1.7">
                          {card.hint}
                        </Text>
                        <Text
                          fontSize={card.value.length > 4 ? "lg" : "xl"}
                          fontWeight="700"
                          letterSpacing="-0.03em"
                          color={card.tone}
                          flexShrink={0}
                        >
                          {card.value}
                        </Text>
                      </Flex>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Card.Body>
          </Card.Root>

          <Card.Root {...sidebarCard}>
            <SectionCardHeader sectionLabel="Feed" title="Activity" />
            <Card.Body p="0">
              {activityFeed.map((entry, i) => (
                <Box key={entry.id}>
                  <Flex align="start" gap="3" py="3" px="5">
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
                      <Text
                        fontSize="xs"
                        color="ui.textMuted"
                        lineHeight="1.7"
                        truncate
                      >
                        {entry.detail}
                      </Text>
                    </Stack>
                  </Flex>
                  {i < activityFeed.length - 1 && (
                    <Separator borderColor="ui.border" mx="5" />
                  )}
                </Box>
              ))}
            </Card.Body>
          </Card.Root>
        </Stack>
      </Grid>
    </Stack>
  );
}
