import { useState } from "react";
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
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AsciiArtAnimation } from "./components/AsciiArtAnimation";

const workspaceSections = ["Home", "Tasks", "Activity", "Repos", "Prompts", "Settings"];

const activityFeed = [
  {
    title: "Repository linked",
    detail: "Connected to repository and waiting for a scoped research brief.",
    tone: "ui.accent",
  },
  {
    title: "Research queue ready",
    detail: "Prepared to collect sources, summarize findings, and surface diffs for review.",
    tone: "ui.violet",
  },
  {
    title: "Review trail visible",
    detail: "Keeps an inspectable activity log so decisions stay visible while work is in flight.",
    tone: "ui.success",
  },
];

const summaryCards = [
  { label: "Tasks today", value: "04", hint: "2 active, 2 waiting", tone: "ui.accent" },
  { label: "Sources linked", value: "18", hint: "notes, papers, repos", tone: "ui.success" },
  { label: "Review status", value: "Ready", hint: "waiting on a new brief", tone: "ui.violet" },
];

const promptSuggestions = [
  "Compare recent agent frameworks for enterprise research workflows.",
  "Summarize model evaluation approaches for lab automation teams.",
  "Review local-first orchestration options with citation support.",
];

const fieldStyles = {
  bg: "ui.surfaceInset",
  border: "1px solid",
  borderColor: "ui.border",
  borderRadius: "control",
  color: "ui.text",
  _placeholder: { color: "ui.textSubtle" },
  _hover: { borderColor: "ui.borderStrong" },
  _focusVisible: {
    borderColor: "ui.focus",
    boxShadow: "0 0 0 1px var(--chakra-colors-ui-focus)",
  },
} as const;

const secondaryButtonStyles = {
  bg: "transparent",
  color: "ui.textMuted",
  border: "1px solid",
  borderColor: "ui.border",
  borderRadius: "control",
  _hover: {
    bg: "ui.surfaceHover",
    borderColor: "ui.borderStrong",
    color: "ui.text",
  },
} as const;

export default function App() {
  const [activeSection, setActiveSection] = useState("Home");
  const [repoName, setRepoName] = useState("ehg/agent-research-lab");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [prompt, setPrompt] = useState(
    "Research how top teams structure citation-aware agent workflows for technical investigation and synthesis."
  );

  return (
    <Box minH="100vh" bg="ui.bg" color="ui.text" position="relative" overflowX="clip">
      <Box pointerEvents="none" position="fixed" inset="0" zIndex="0">
        <AsciiArtAnimation />
      </Box>

      <Grid
        position="relative"
        zIndex="1"
        minH="100vh"
        templateColumns={{ base: "1fr", lg: sidebarOpen ? "272px minmax(0, 1fr)" : "56px minmax(0, 1fr)" }}
        css={{ transition: "grid-template-columns 0.2s ease" }}
      >
        <Box
          as="aside"
          bg="ui.panelAlpha"
          backdropFilter="blur(18px)"
          borderBottom={{ base: "1px solid", lg: "none" }}
          borderRight={{ base: "none", lg: "1px solid" }}
          borderColor="ui.border"
          position={{ base: "relative", lg: "sticky" }}
          top="0"
          h={{ lg: "100vh" }}
          overflow="hidden"
        >
          <Flex
            direction="column"
            minH={{ lg: "100vh" }}
            px={{ base: "4", md: sidebarOpen ? "5" : "2" }}
            py={{ base: "4", md: "6" }}
            gap="6"
            css={{ transition: "padding 0.2s ease" }}
          >
            <Stack gap="5">
              <Flex align="center" justify="space-between">
                <HStack gap="3" align="center" minW="0">
                  <Flex
                    h="10"
                    w="10"
                    align="center"
                    justify="center"
                    borderRadius="16px"
                    bg="ui.surfaceInset"
                    border="1px solid"
                    borderColor="ui.border"
                    color="ui.accentSoft"
                    fontWeight="700"
                    fontSize="sm"
                    letterSpacing="-0.03em"
                    flexShrink="0"
                  >
                    J
                  </Flex>
                  {sidebarOpen && (
                    <Stack gap="0" minW="0">
                      <Text fontSize="sm" fontWeight="600" color="ui.text" truncate>
                        Jules-style Lab
                      </Text>
                      <Text fontSize="xs" color="ui.textMuted" truncate>
                        Agent workspace shell
                      </Text>
                    </Stack>
                  )}
                </HStack>
                <IconButton
                  aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                  variant="ghost"
                  size="sm"
                  color="ui.textSubtle"
                  _hover={{ color: "ui.text", bg: "ui.surfaceHover" }}
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  flexShrink="0"
                >
                  {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                </IconButton>
              </Flex>

              {sidebarOpen && (
                <>
                  <Button
                    bg="ui.accent"
                    color="white"
                    borderRadius="control"
                    h="11"
                    _hover={{ bg: "ui.accentHover" }}
                  >
                    New task
                  </Button>

                  <Stack gap="3">
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                      Workspace
                    </Text>
                    <Grid templateColumns={{ base: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))", lg: "1fr" }} gap="2">
                      {workspaceSections.map((section) => {
                        const active = activeSection === section;

                        return (
                          <Button
                            key={section}
                            justifyContent="flex-start"
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
                            onClick={() => setActiveSection(section)}
                          >
                            <Text>{section}</Text>
                          </Button>
                        );
                      })}
                    </Grid>
                  </Stack>
                </>
              )}
            </Stack>

            {sidebarOpen && (
              <Box bg="ui.cardAltAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" px="4" py="4">
                <Stack gap="2">
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                    Active repo
                  </Text>
                  <Text fontSize="sm" fontWeight="600" color="ui.text">
                    {repoName}
                  </Text>
                  <HStack align="start" gap="2">
                    <Box h="2" w="2" mt="1.5" borderRadius="full" bg="ui.success" flexShrink="0" />
                    <Text fontSize="sm" color="ui.textMuted" lineHeight="1.6">
                      Connected and ready for a scoped task prompt.
                    </Text>
                  </HStack>
                </Stack>
              </Box>
            )}
          </Flex>
        </Box>

        <Box as="main" minW="0">
          <Stack gap={{ base: "6", xl: "8" }} px={{ base: "4", md: "6", xl: "8" }} py={{ base: "4", md: "6" }} maxW="1500px" mr="auto">
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
                      Home
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
                    <Text fontSize="sm" color="ui.text">
                      {repoName}
                    </Text>
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
                      Activity visible
                    </Text>
                  </HStack>
                </Flex>

                <Stack gap="1" minW="0">
                  <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} letterSpacing="-0.04em" lineHeight="1.05">
                    Agent workspace
                  </Heading>
                  <Text fontSize={{ base: "sm", md: "md" }} lineHeight="1.8" color="ui.textMuted" maxW="4xl">
                    Left-aligned task entry, repo context, and review activity in a calmer shell that reads like a workspace instead of a landing page.
                  </Text>
                </Stack>
              </Stack>

              <Flex gap="3" wrap="wrap" w={{ base: "full", md: "auto" }}>
                <Button {...secondaryButtonStyles} flex={{ base: "1", md: "0" }}>
                  Open repo
                </Button>
                <Button
                  bg="ui.accent"
                  color="white"
                  borderRadius="control"
                  px="5"
                  flex={{ base: "1", md: "0" }}
                  _hover={{ bg: "ui.accentHover" }}
                >
                  Start task
                </Button>
              </Flex>
            </Flex>

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
                      <HStack
                        gap="2"
                        px="3"
                        py="1.5"
                        border="1px solid"
                        borderColor="ui.border"
                        borderRadius="full"
                        bg="ui.surfaceInset"
                      >
                        <Box h="2" w="2" borderRadius="full" bg="ui.success" />
                        <Text fontSize="sm" color="ui.textMuted">
                          Connected
                        </Text>
                      </HStack>
                      <HStack
                        gap="2"
                        px="3"
                        py="1.5"
                        border="1px solid"
                        borderColor="ui.border"
                        borderRadius="full"
                        bg="ui.surfaceInset"
                      >
                        <Box h="2" w="2" borderRadius="full" bg="ui.violet" />
                        <Text fontSize="sm" color="ui.textMuted">
                          Traceable activity
                        </Text>
                      </HStack>
                      <HStack
                        gap="2"
                        px="3"
                        py="1.5"
                        border="1px solid"
                        borderColor="ui.border"
                        borderRadius="full"
                        bg="ui.surfaceInset"
                      >
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
                      <Input value={repoName} onChange={(event) => setRepoName(event.target.value)} {...fieldStyles} />
                    </Box>

                    <Box>
                      <Text mb="2" fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                        Task prompt
                      </Text>
                      <Textarea
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
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
                            onClick={() => setPrompt(item)}
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
                        bg="ui.accent"
                        color="white"
                        borderRadius="control"
                        px="5"
                        minW={{ md: "140px" }}
                        _hover={{ bg: "ui.accentHover" }}
                      >
                        Run task
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
                        <Box key={entry.title}>
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
        </Box>
      </Grid>
    </Box>
  );
}
