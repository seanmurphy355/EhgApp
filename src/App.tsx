import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  Separator,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import {
  Activity as ActivityIcon,
  Bot,
  Check,
  ChevronDown,
  FileText,
  FolderGit2,
  Home as HomeIcon,
  LayoutDashboard,
  ListTodo,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings as SettingsIcon,
  Wallet as WalletIcon,
} from "lucide-react";
import { AsciiArtAnimation } from "./components/AsciiArtAnimation";
import { AureliaLanding } from "./components/AureliaLanding";
import { CreateWorkspaceDialog } from "./components/CreateWorkspaceDialog";
import { AgentsSurface } from "./components/AgentsSurface";
import { DashboardSurface } from "./components/DashboardSurface";
import { SettingsSurface } from "./components/SettingsSurface";
import { TasksSurface } from "./components/TasksSurface";
import { WalletSurface } from "./components/WalletSurface";
import { WorkspaceSelector } from "./components/WorkspaceSelector";
import {
  fieldStyles,
  primaryButtonStyles,
  secondaryButtonStyles,
} from "./components/workspaceStyles";
import { Tooltip } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import {
  ensureSession,
  fetchActivity,
  fetchActivitySummary,
  getApiBaseUrl,
  runTask,
  toUserMessage,
  type ActivityItem,
  type ActivitySummaryResponse,
} from "./lib/api";
import {
  createWorkspace,
  loadLastWorkspaceId,
  loadWorkspaces,
  saveLastWorkspaceId,
  saveWorkspaces,
  type Workspace,
  type WorkspaceSettings,
} from "./lib/settings";
import { WalletProvider } from "./lib/wallet";

const workspaceSections = [
  { label: "Home", icon: HomeIcon },
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Agents", icon: Bot },
  { label: "Tasks", icon: ListTodo },
  { label: "Activity", icon: ActivityIcon },
  { label: "Repos", icon: FolderGit2 },
  { label: "Prompts", icon: FileText },
  { label: "Wallet", icon: WalletIcon },
  { label: "Settings", icon: SettingsIcon },
] as const;

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

const defaultActivityFeed: ActivityFeedEntry[] = [
  {
    id: "seed-1",
    title: "Repository linked",
    detail: "Connected to repository and waiting for a scoped research brief.",
    tone: "ui.accent",
  },
  {
    id: "seed-2",
    title: "Research queue ready",
    detail: "Prepared to collect sources, summarize findings, and surface diffs for review.",
    tone: "ui.violet",
  },
  {
    id: "seed-3",
    title: "Review trail visible",
    detail: "Keeps an inspectable activity log so decisions stay visible while work is in flight.",
    tone: "ui.success",
  },
];

const defaultSummaryCards: SummaryCardEntry[] = [
  { label: "Tasks today", value: "00", hint: "no tasks yet", tone: "ui.accent" },
  { label: "Events today", value: "00", hint: "activity tracked live", tone: "ui.success" },
  { label: "Last activity", value: "--", hint: "waiting on first event", tone: "ui.violet" },
];

const promptSuggestions = [
  "Compare recent agent frameworks for enterprise research workflows.",
  "Summarize model evaluation approaches for lab automation teams.",
  "Review local-first orchestration options with citation support.",
] as const;

function mapToneForActivity(item: ActivityItem): string {
  if (item.type === "task.run_requested") {
    return "ui.accent";
  }

  if (item.type === "session.created") {
    return "ui.success";
  }

  return "ui.violet";
}

function mapTitleForActivity(item: ActivityItem): string {
  if (item.type === "task.run_requested") {
    return "Task run requested";
  }

  if (item.type === "session.created") {
    return "Session created";
  }

  return "System update";
}

function toFeedEntry(item: ActivityItem): ActivityFeedEntry {
  return {
    id: item.id,
    title: mapTitleForActivity(item),
    detail: item.detail,
    tone: mapToneForActivity(item),
  };
}

function toSummaryCards(summary: ActivitySummaryResponse): SummaryCardEntry[] {
  const lastEvent = summary.lastEventAt
    ? new Date(summary.lastEventAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--";

  return [
    {
      label: "Tasks today",
      value: String(summary.tasksToday).padStart(2, "0"),
      hint: "task.run_requested events",
      tone: "ui.accent",
    },
    {
      label: "Events today",
      value: String(summary.eventsToday).padStart(2, "0"),
      hint: "all events since midnight",
      tone: "ui.success",
    },
    {
      label: "Last activity",
      value: lastEvent,
      hint: summary.lastEventAt ? "latest event timestamp" : "waiting on first event",
      tone: "ui.violet",
    },
  ];
}

const workspaceDescriptions: Record<string, { title: string; detail: string }> = {
  Dashboard: {
    title: "Research dashboard",
    detail: "Monitor agent status, task pipelines, budgets, and pending approvals across active research operations.",
  },
  Tasks: {
    title: "Task operations",
    detail: "Run scoped research work, keep prompts reviewable, and monitor active investigations from a calmer operating surface.",
  },
  Activity: {
    title: "Activity overview",
    detail: "Track execution checkpoints, surfaced findings, and decision trails without losing the surrounding research context.",
  },
  Repos: {
    title: "Repository context",
    detail: "Keep source materials, repo state, and working prompts connected while research programs move through execution.",
  },
  Prompts: {
    title: "Prompt workspace",
    detail: "Draft, revise, and reuse investigation prompts in a shell built for traceable research operations.",
  },
  Settings: {
    title: "Research hub settings",
    detail: "Tune the operating environment, visibility model, and review posture that support the broader research hub.",
  },
};


const sidebarIconButtonStyles = {
  variant: "ghost",
  bg: "transparent",
  color: "ui.textSubtle",
  border: "1px solid",
  borderColor: "transparent",
  borderRadius: "control",
  transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease",
  _hover: {
    bg: "ui.surfaceHover",
    borderColor: "ui.borderStrong",
    color: "ui.text",
  },
  _focusVisible: {
    borderColor: "ui.focus",
    boxShadow: "0 0 0 1px var(--chakra-colors-ui-focus)",
  },
  _active: {
    bg: "ui.surfaceInset",
    borderColor: "ui.borderStrong",
    color: "ui.text",
  },
} as const;

type WorkspaceSurfaceProps = {
  activeSection: string;
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

function WorkspaceSurface({
  activeSection,
  repoName,
  prompt,
  activityFeed,
  summaryCards,
  isBackendSyncing,
  isRunningTask,
  backendError,
  canRunTask,
  onRepoNameChange,
  onPromptChange,
  onRunTask,
  onRetryBackend,
}: WorkspaceSurfaceProps) {
  const sectionContent = workspaceDescriptions[activeSection] ?? {
    title: "Agent workspace",
    detail: "Run scoped research work, keep prompts reviewable, and monitor activity from a calm operational shell.",
  };

  const connectionLabel = backendError ? "Backend offline" : isBackendSyncing ? "Syncing backend" : "Connected";
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
          <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} letterSpacing="-0.04em" lineHeight="1.05">
            {sectionContent.title}
          </Heading>
          <Text fontSize={{ base: "sm", md: "md" }} lineHeight="1.8" color="ui.textMuted" maxW="4xl">
            {sectionContent.detail}
          </Text>
        </Stack>

        <Flex gap="3" wrap="wrap" w={{ base: "full", md: "auto" }}>
          <Button {...secondaryButtonStyles} flex={{ base: "1", md: "0" }}>
            Open repo
          </Button>
          <Button
            {...primaryButtonStyles}
            flex={{ base: "1", md: "0" }}
            onClick={onRunTask}
            disabled={!canRunTask || isBackendSyncing || isRunningTask}
          >
            {isRunningTask ? "Running..." : "Start task"}
          </Button>
        </Flex>
      </Flex>

      {backendError ? (
        <Card.Root bg="ui.cardAltAlpha" border="1px solid" borderColor="ui.warning" borderRadius="panel" shadow="hairline">
          <Card.Body px="5" py="4">
            <Flex direction={{ base: "column", md: "row" }} gap="4" justify="space-between" align={{ md: "center" }}>
              <Stack gap="1">
                <Text fontSize="sm" fontWeight="600" color="ui.text">
                  Backend unavailable
                </Text>
                <Text fontSize="sm" color="ui.textMuted" lineHeight="1.6">
                  {backendError}
                </Text>
              </Stack>
              <Button {...secondaryButtonStyles} onClick={onRetryBackend} minW={{ md: "150px" }}>
                Retry backend
              </Button>
            </Flex>
          </Card.Body>
        </Card.Root>
      ) : null}

      <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 340px" }} gap="6" alignItems="start">
        <Card.Root bg="ui.cardAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" shadow="panel" overflow="hidden">
          <Card.Header px={{ base: "5", md: "6" }} py="5" borderBottom="1px solid" borderColor="ui.border">
            <Flex direction={{ base: "column", md: "row" }} align={{ base: "start", md: "center" }} justify="space-between" gap="4">
              <Stack gap="1">
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                  Quick start
                </Text>
                <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} letterSpacing="-0.03em">
                  Start a task
                </Heading>
                <Text fontSize="sm" color="ui.textMuted" maxW="2xl">
                  Give the agent one clear objective, then keep context, activity, and review state in view from the surrounding workspace.
                </Text>
              </Stack>

              <Flex gap="2" wrap="wrap">
                <HStack gap="2" px="3" py="1.5" border="1px solid" borderColor="ui.border" borderRadius="full" bg="ui.surfaceInset">
                  <Box h="2" w="2" borderRadius="full" bg={connectionTone} />
                  <Text fontSize="sm" color="ui.textMuted">
                    {connectionLabel}
                  </Text>
                </HStack>
                <HStack gap="2" px="3" py="1.5" border="1px solid" borderColor="ui.border" borderRadius="full" bg="ui.surfaceInset">
                  <Box h="2" w="2" borderRadius="full" bg="ui.violet" />
                  <Text fontSize="sm" color="ui.textMuted">
                    Traceable activity
                  </Text>
                </HStack>
                <HStack gap="2" px="3" py="1.5" border="1px solid" borderColor="ui.border" borderRadius="full" bg="ui.surfaceInset">
                  <Box h="2" w="2" borderRadius="full" bg="ui.warning" />
                  <Text fontSize="sm" color="ui.textMuted">
                    Reviewable output
                  </Text>
                </HStack>
              </Flex>
            </Flex>
          </Card.Header>

          <Card.Body px={{ base: "5", md: "6" }} py={{ base: "5", md: "6" }}>
            <Stack gap="6">
              <Box>
                <Text mb="2" fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                  Repository
                </Text>
                <Input value={repoName} onChange={(event) => onRepoNameChange(event.target.value)} {...fieldStyles} />
              </Box>

              <Box>
                <Text mb="2" fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                  Task prompt
                </Text>
                <Textarea
                  value={prompt}
                  onChange={(event) => onPromptChange(event.target.value)}
                  minH={{ base: "220px", md: "240px" }}
                  resize="vertical"
                  {...fieldStyles}
                />
              </Box>

              <Stack gap="3">
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                  Suggested prompts
                </Text>
                <Stack gap="2.5">
                  {promptSuggestions.map((item) => (
                    <Button
                      key={item}
                      justifyContent="start"
                      textAlign="left"
                      whiteSpace="normal"
                      h="auto"
                      py="3"
                      px="4"
                      variant="ghost"
                      border="1px solid"
                      borderColor="ui.border"
                      borderRadius="control"
                      bg="ui.surfaceInset"
                      color="ui.textMuted"
                      _hover={{ bg: "ui.surfaceHover", color: "ui.text" }}
                      onClick={() => onPromptChange(item)}
                    >
                      {item}
                    </Button>
                  ))}
                </Stack>
              </Stack>

              <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} gap="4">
                <Text fontSize="sm" color="ui.textMuted" maxW="2xl" lineHeight="1.7">
                  Keep prompts scoped, concrete, and reviewable so the workspace stays useful once the activity rail starts filling up.
                </Text>
                <Button
                  {...primaryButtonStyles}
                  minW={{ md: "140px" }}
                  onClick={onRunTask}
                  disabled={!canRunTask || isBackendSyncing || isRunningTask}
                >
                  {isRunningTask ? "Running..." : "Run task"}
                </Button>
              </Flex>
            </Stack>
          </Card.Body>
        </Card.Root>

        <Stack gap="4" position={{ xl: "sticky" }} top={{ xl: "6" }} alignSelf="start">
          <Card.Root bg="ui.cardAltAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" shadow="hairline">
            <Card.Header px="5" py="3" borderBottom="1px solid" borderColor="ui.border">
              <Text fontSize="sm" fontWeight="600" color="ui.text">
                Activity feed
              </Text>
              <Text mt="1" fontSize="xs" color="ui.textSubtle">
                Visible checkpoints from the workspace shell.
              </Text>
            </Card.Header>
            <Card.Body px="5" py="4">
              <Stack gap="4">
                {activityFeed.map((entry, index) => (
                  <Box key={entry.id}>
                    <HStack align="start" gap="3">
                      <Flex
                        mt="0.5"
                        h="6"
                        w="6"
                        align="center"
                        justify="center"
                        borderRadius="full"
                        bg="ui.surfaceInset"
                        border="1px solid"
                        borderColor="ui.borderStrong"
                        color={entry.tone}
                        fontSize="xs"
                        fontFamily="mono"
                        flexShrink="0"
                      >
                        {index + 1}
                      </Flex>
                      <Stack gap="1" minW="0">
                        <Text fontSize="sm" fontWeight="600" color="ui.text">
                          {entry.title}
                        </Text>
                        <Text fontSize="sm" lineHeight="1.7" color="ui.textMuted">
                          {entry.detail}
                        </Text>
                      </Stack>
                    </HStack>
                    {index < activityFeed.length - 1 ? <Separator mt="4" borderColor="ui.border" /> : null}
                  </Box>
                ))}
              </Stack>
            </Card.Body>
          </Card.Root>

          <Card.Root bg="ui.cardAltAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" shadow="hairline">
            <Card.Header px="5" py="3" borderBottom="1px solid" borderColor="ui.border">
              <Text fontSize="sm" fontWeight="600" color="ui.text">
                Task summary
              </Text>
              <Text mt="1" fontSize="xs" color="ui.textSubtle">
                Lightweight context that supports the main task surface.
              </Text>
            </Card.Header>
            <Card.Body px="5" py="4">
              <Stack gap="3">
                {summaryCards.map((card) => (
                  <Box key={card.label} bg="ui.surfaceInset" border="1px solid" borderColor="ui.border" borderRadius="16px" px="3" py="3">
                    <Flex align="center" justify="space-between" gap="4">
                      <Stack gap="1" minW="0">
                        <HStack gap="2">
                          <Box h="2" w="2" borderRadius="full" bg={card.tone} />
                          <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="ui.textSubtle" fontFamily="mono">
                            {card.label}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="ui.textMuted">
                          {card.hint}
                        </Text>
                      </Stack>
                      <Text
                        fontSize={card.value.length > 4 ? "xl" : "2xl"}
                        fontWeight="700"
                        letterSpacing="-0.03em"
                        color={card.tone}
                        textAlign="right"
                      >
                        {card.value}
                      </Text>
                    </Flex>
                  </Box>
                ))}
              </Stack>
            </Card.Body>
          </Card.Root>
        </Stack>
      </Grid>
    </Stack>
  );
}


function resolveInitialWorkspace(): { list: Workspace[]; activeId: string } {
  let list = loadWorkspaces();
  if (list.length === 0) {
    const ws = createWorkspace("Aurelia Research Hub");
    list = loadWorkspaces();
    saveLastWorkspaceId(ws.id);
    return { list, activeId: ws.id };
  }
  const lastId = loadLastWorkspaceId();
  if (list.length === 1) return { list, activeId: list[0]!.id };
  if (lastId && list.some((ws) => ws.id === lastId)) return { list, activeId: lastId };
  return { list, activeId: list[0]!.id };
}

export default function App() {
  const [{ list: initList, activeId: initActiveId }] = useState(resolveInitialWorkspace);
  const [workspaceList, setWorkspaceList] = useState<Workspace[]>(initList);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(initActiveId);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  useEffect(() => {
    if (workspaceList.length === 0) {
      const ws = createWorkspace("Aurelia Research Hub");
      const updated = loadWorkspaces();
      setWorkspaceList(updated);
      setActiveWorkspaceId(ws.id);
      saveLastWorkspaceId(ws.id);
    } else if (!activeWorkspaceId) {
      setActiveWorkspaceId(workspaceList[0]!.id);
    }
  }, [workspaceList, activeWorkspaceId]);

  const activeWorkspace = useMemo(
    () => workspaceList.find((ws) => ws.id === activeWorkspaceId) ?? null,
    [workspaceList, activeWorkspaceId],
  );

  const workspaceSettings = activeWorkspace?.settings ?? {
    workspaceName: "Aurelia Research Hub",
    defaultRepository: "ehg/agent-research-lab",
    defaultBriefTemplate: "",
    reviewPosture: "standard" as const,
    showActivityRail: true,
  };

  const [activeSection, setActiveSection] = useState("Home");
  const [repoName, setRepoName] = useState("ehg/agent-research-lab");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [prompt, setPrompt] = useState(
    "Research how top teams structure citation-aware agent workflows for technical investigation and synthesis."
  );
  const [activityFeed, setActivityFeed] = useState<ActivityFeedEntry[]>(defaultActivityFeed);
  const [summaryCards, setSummaryCards] = useState<SummaryCardEntry[]>(defaultSummaryCards);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isBackendSyncing, setIsBackendSyncing] = useState(false);
  const [isRunningTask, setIsRunningTask] = useState(false);
  const [createWsDialogOpen, setCreateWsDialogOpen] = useState(false);

  function handleSelectWorkspace(id: string) {
    setActiveWorkspaceId(id);
    saveLastWorkspaceId(id);
    setActiveSection("Home");
  }

  function handleCreateWorkspace(name: string, description: string) {
    const ws = createWorkspace(name, description);
    setWorkspaceList(loadWorkspaces());
    handleSelectWorkspace(ws.id);
  }

  function handleBackToSelector() {
    setActiveWorkspaceId(null);
    saveLastWorkspaceId(null);
    setSwitcherOpen(false);
  }

  const syncBackendData = useCallback(async () => {
    setIsBackendSyncing(true);

    try {
      await ensureSession();

      const [activityResult, summaryResult] = await Promise.all([fetchActivity(50), fetchActivitySummary()]);

      setActivityFeed(activityResult.items.length > 0 ? activityResult.items.map(toFeedEntry) : defaultActivityFeed);
      setSummaryCards(toSummaryCards(summaryResult));
      setBackendError(null);
    } catch (error) {
      const message = `${toUserMessage(error)} (API: ${getApiBaseUrl()})`;
      setBackendError(message);
      setActivityFeed(defaultActivityFeed);
      setSummaryCards(defaultSummaryCards);
    } finally {
      setIsBackendSyncing(false);
    }
  }, []);

  useEffect(() => {
    void syncBackendData();
  }, [syncBackendData]);

  const canRunTask = useMemo(() => {
    return repoName.trim().length > 0 && prompt.trim().length > 0;
  }, [repoName, prompt]);

  const handleRunTask = useCallback(async () => {
    if (!repoName.trim() || !prompt.trim()) {
      return;
    }

    setIsRunningTask(true);

    try {
      await ensureSession();
      const result = await runTask({ repo: repoName.trim(), prompt: prompt.trim() });
      const summaryResult = await fetchActivitySummary();
      const nextEntry = toFeedEntry(result.activity);

      setActivityFeed((current) => [nextEntry, ...current.filter((entry) => entry.id !== nextEntry.id)].slice(0, 50));
      setSummaryCards(toSummaryCards(summaryResult));
      setBackendError(null);
    } catch (error) {
      setBackendError(`${toUserMessage(error)} (API: ${getApiBaseUrl()})`);
    } finally {
      setIsRunningTask(false);
    }
  }, [prompt, repoName]);

  const handleSaveSettings = useCallback((nextSettings: WorkspaceSettings) => {
    if (!activeWorkspaceId) return;
    setWorkspaceList((prev) => {
      const updated = prev.map((ws) =>
        ws.id === activeWorkspaceId
          ? { ...ws, name: nextSettings.workspaceName, settings: nextSettings }
          : ws,
      );
      saveWorkspaces(updated);
      return updated;
    });
  }, [activeWorkspaceId]);

  if (!activeWorkspace) {
    const showLanding = workspaceList.length === 0;

    return (
        <Box minH="100vh" bg="ui.bg" color="ui.text" position="relative" overflowX="clip">
          <Box pointerEvents="none" position="fixed" inset="0" zIndex="0">
            <AsciiArtAnimation />
          </Box>
          <Box position="relative" zIndex="1">
            {showLanding ? (
              <Box px={{ base: "4", md: "6", xl: "8" }} py={{ base: "4", md: "6" }} maxW="1200px" mx="auto">
                <AureliaLanding secondaryButtonStyles={secondaryButtonStyles} onGetStarted={() => setCreateWsDialogOpen(true)} />
                <CreateWorkspaceDialog
                  open={createWsDialogOpen}
                  onOpenChange={setCreateWsDialogOpen}
                  onSubmit={handleCreateWorkspace}
                  title="Create your first workspace"
                />
              </Box>
            ) : (
              <WorkspaceSelector
                workspaces={workspaceList}
                onSelect={handleSelectWorkspace}
                onCreate={handleCreateWorkspace}
              />
            )}
          </Box>
        </Box>
    );
  }

  return (
    <Box minH="100vh" bg="ui.bg" color="ui.text" position="relative" overflowX="clip">
      <Box pointerEvents="none" position="fixed" inset="0" zIndex="0">
        <AsciiArtAnimation />
      </Box>

      <Grid
        position="relative"
        zIndex="1"
        minH="100vh"
        templateColumns={{ base: "1fr", lg: sidebarOpen ? "272px minmax(0, 1fr)" : "72px minmax(0, 1fr)" }}
        css={{ transition: "grid-template-columns 0.2s ease" }}
      >
        <Box
          as="aside"
          bg="ui.panelAlpha"
          backdropFilter="blur(18px)"
          position={{ base: "relative", lg: "sticky" }}
          top="0"
          h={{ lg: "100vh" }}
          overflow="hidden"
        >
          <Flex
            direction="column"
            minH={{ lg: "100vh" }}
            px={{ base: "4", md: "5", lg: sidebarOpen ? "5" : "3" }}
            py={{ base: "4", md: "6" }}
            gap={{ base: "6", lg: sidebarOpen ? "6" : "5" }}
            align={{ base: "stretch", lg: sidebarOpen ? "stretch" : "center" }}
            css={{ transition: "padding 0.2s ease" }}
          >
            <Stack gap="5" w="full" align={{ base: "stretch", lg: sidebarOpen ? "stretch" : "center" }}>
              <Flex
                direction={{ base: "row", lg: sidebarOpen ? "row" : "column" }}
                align="center"
                justify={{ base: "space-between", lg: sidebarOpen ? "space-between" : "center" }}
                gap={{ base: "3", lg: sidebarOpen ? "3" : "4" }}
                w="full"
              >
                <Box position="relative" minW="0" flex="1">
                  <Flex
                    align="center"
                    gap="3"
                    cursor="pointer"
                    onClick={() => setSwitcherOpen((p) => !p)}
                    px="2"
                    py="1.5"
                    borderRadius="control"
                    _hover={{ bg: "ui.surfaceHover" }}
                    justify={{ base: "flex-start", lg: sidebarOpen ? "flex-start" : "center" }}
                  >
                    <Flex
                      h="9"
                      w="9"
                      align="center"
                      justify="center"
                      borderRadius="12px"
                      bg="ui.accent"
                      color="white"
                      fontSize="sm"
                      fontWeight="700"
                      flexShrink={0}
                    >
                      {activeWorkspace.name.charAt(0).toUpperCase()}
                    </Flex>
                    <Stack gap="0" minW="0" display={{ base: "flex", lg: sidebarOpen ? "flex" : "none" }}>
                      <Text fontSize="sm" fontWeight="600" color="ui.text" truncate>
                        {activeWorkspace.name}
                      </Text>
                      <Text fontSize="xs" color="ui.textMuted" truncate>
                        Workspace
                      </Text>
                    </Stack>
                    <Box display={{ base: "block", lg: sidebarOpen ? "block" : "none" }} ml="auto" flexShrink={0}>
                      <ChevronDown size={14} color="var(--chakra-colors-ui-text-subtle)" />
                    </Box>
                  </Flex>

                  {switcherOpen && (
                    <>
                      <Box position="fixed" inset="0" zIndex="9" onClick={() => setSwitcherOpen(false)} />
                      <Box
                        position="absolute"
                        top="100%"
                        left="0"
                        mt="1"
                        zIndex="10"
                        w="240px"
                        bg="ui.surface"
                        border="1px solid"
                        borderColor="ui.borderStrong"
                        borderRadius="control"
                        boxShadow="panel"
                        py="1.5"
                      >
                        <Text px="3" py="1.5" fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="ui.textSubtle" fontFamily="mono">
                          Workspaces
                        </Text>
                        {workspaceList.map((ws) => (
                          <Flex
                            key={ws.id}
                            align="center"
                            gap="2.5"
                            px="3"
                            py="2"
                            cursor="pointer"
                            _hover={{ bg: "ui.surfaceHover" }}
                            onClick={() => {
                              handleSelectWorkspace(ws.id);
                              setSwitcherOpen(false);
                            }}
                          >
                            <Flex
                              h="7"
                              w="7"
                              align="center"
                              justify="center"
                              borderRadius="8px"
                              bg={ws.id === activeWorkspaceId ? "ui.accent" : "ui.surfaceInset"}
                              color={ws.id === activeWorkspaceId ? "white" : "ui.textMuted"}
                              fontSize="xs"
                              fontWeight="700"
                              flexShrink={0}
                            >
                              {ws.name.charAt(0).toUpperCase()}
                            </Flex>
                            <Text fontSize="sm" color="ui.text" flex="1" truncate>
                              {ws.name}
                            </Text>
                            {ws.id === activeWorkspaceId && (
                              <Check size={14} color="var(--chakra-colors-ui-accent)" />
                            )}
                          </Flex>
                        ))}
                        <Separator my="1.5" borderColor="ui.border" />
                        <Flex
                          align="center"
                          gap="2.5"
                          px="3"
                          py="2"
                          cursor="pointer"
                          _hover={{ bg: "ui.surfaceHover" }}
                          onClick={() => {
                            setSwitcherOpen(false);
                            handleBackToSelector();
                          }}
                        >
                          <Plus size={14} color="var(--chakra-colors-ui-text-subtle)" />
                          <Text fontSize="sm" color="ui.textMuted">
                            New workspace
                          </Text>
                        </Flex>
                        <Flex
                          align="center"
                          gap="2.5"
                          px="3"
                          py="2"
                          cursor="pointer"
                          _hover={{ bg: "ui.surfaceHover" }}
                          onClick={() => {
                            setSwitcherOpen(false);
                            handleBackToSelector();
                          }}
                        >
                          <LogOut size={14} color="var(--chakra-colors-ui-text-subtle)" />
                          <Text fontSize="sm" color="ui.textMuted">
                            All workspaces
                          </Text>
                        </Flex>
                      </Box>
                    </>
                  )}
                </Box>

                <Tooltip content={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
                  <IconButton
                    aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    display={{ base: "none", lg: "inline-flex" }}
                    size="sm"
                    h="10"
                    w="10"
                    minW="10"
                    onClick={() => setSidebarOpen((prev) => !prev)}
                    flexShrink="0"
                    {...sidebarIconButtonStyles}
                  >
                    {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                  </IconButton>
                </Tooltip>
              </Flex>

              <Stack gap="5" w="full" display={{ base: "flex", lg: sidebarOpen ? "flex" : "none" }}>
                <Button {...primaryButtonStyles} h="11">
                  New task
                </Button>

                <Stack gap="3">
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                    Workspace
                  </Text>
                  <Grid templateColumns={{ base: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))", lg: "1fr" }} gap="2">
                    {workspaceSections.map((section) => {
                      const active = activeSection === section.label;
                      const SectionIcon = section.icon;

                      return (
                        <Button
                          key={section.label}
                          justifyContent="flex-start"
                          gap="3"
                          h="10"
                          px="3"
                          variant="ghost"
                          bg={active ? "ui.surfaceHover" : "transparent"}
                          color={active ? "ui.text" : "ui.textMuted"}
                          border="1px solid"
                          borderColor={active ? "ui.borderStrong" : "transparent"}
                          borderLeft="2px solid"
                          borderLeftColor={active ? "ui.accent" : "transparent"}
                          borderRadius="control"
                          _hover={{ bg: "ui.surfaceHover", color: "ui.text", borderColor: "ui.borderStrong" }}
                          onClick={() => setActiveSection(section.label)}
                          aria-current={active ? "page" : undefined}
                        >
                          <SectionIcon size={16} />
                          <Text>{section.label}</Text>
                        </Button>
                      );
                    })}
                  </Grid>
                </Stack>
              </Stack>

              <Stack gap="2" align="center" w="full" display={{ base: "none", lg: sidebarOpen ? "none" : "flex" }}>
                {workspaceSections.map((section) => {
                  const active = activeSection === section.label;
                  const SectionIcon = section.icon;

                  return (
                    <Tooltip key={section.label} content={section.label}>
                      <IconButton
                        aria-label={section.label}
                        size="sm"
                        h="10"
                        w="10"
                        minW="10"
                        position="relative"
                        onClick={() => setActiveSection(section.label)}
                        aria-current={active ? "page" : undefined}
                        {...sidebarIconButtonStyles}
                        bg={active ? "ui.accentMuted" : sidebarIconButtonStyles.bg}
                        color={active ? "ui.text" : sidebarIconButtonStyles.color}
                        borderColor={active ? "ui.accentBorder" : sidebarIconButtonStyles.borderColor}
                        boxShadow={active ? "inset 0 0 0 1px var(--chakra-colors-ui-accent-border)" : undefined}
                        _before={{
                          content: '""',
                          position: "absolute",
                          left: "3px",
                          top: "8px",
                          bottom: "8px",
                          width: "2px",
                          borderRadius: "full",
                          bg: active ? "ui.accent" : "transparent",
                        }}
                      >
                        <SectionIcon size={18} />
                      </IconButton>
                    </Tooltip>
                  );
                })}
              </Stack>
            </Stack>
          </Flex>
        </Box>

        <Box as="main" minW="0">
          <Stack gap={{ base: "6", xl: "8" }} px={{ base: "4", md: "6", xl: "8" }} py={{ base: "4", md: "6" }} maxW="1200px" mx="auto">
            {activeSection === "Home" ? (
              <AureliaLanding secondaryButtonStyles={secondaryButtonStyles} onGetStarted={() => setCreateWsDialogOpen(true)} />
            ) : activeSection === "Dashboard" ? (
              <DashboardSurface />
            ) : activeSection === "Agents" ? (
              <AgentsSurface />
            ) : activeSection === "Wallet" ? (
              <WalletProvider><WalletSurface /></WalletProvider>
            ) : activeSection === "Settings" ? (
              <SettingsSurface settings={workspaceSettings} onSave={handleSaveSettings} />
            ) : activeSection === "Tasks" ? (
              <TasksSurface
                repoName={repoName}
                prompt={prompt}
                activityFeed={activityFeed}
                summaryCards={summaryCards}
                isBackendSyncing={isBackendSyncing}
                isRunningTask={isRunningTask}
                backendError={backendError}
                canRunTask={canRunTask}
                onRepoNameChange={setRepoName}
                onPromptChange={setPrompt}
                onRunTask={handleRunTask}
                onRetryBackend={syncBackendData}
              />
            ) : (
              <WorkspaceSurface
                activeSection={activeSection}
                repoName={repoName}
                prompt={prompt}
                activityFeed={activityFeed}
                summaryCards={summaryCards}
                isBackendSyncing={isBackendSyncing}
                isRunningTask={isRunningTask}
                backendError={backendError}
                canRunTask={canRunTask}
                onRepoNameChange={setRepoName}
                onPromptChange={setPrompt}
                onRunTask={handleRunTask}
                onRetryBackend={syncBackendData}
              />
            )}
          </Stack>
        </Box>
      </Grid>

      <CreateWorkspaceDialog
        open={createWsDialogOpen}
        onOpenChange={setCreateWsDialogOpen}
        onSubmit={handleCreateWorkspace}
      />
      <Toaster />
    </Box>
  );
}
