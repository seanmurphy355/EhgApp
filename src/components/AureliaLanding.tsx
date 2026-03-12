import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Stack,
  Text,
  type ButtonProps,
} from "@chakra-ui/react";
import { motion, useReducedMotion } from "motion/react";
import { ResearchOrgTree } from "./ResearchOrgTree";

type AureliaLandingProps = {
  secondaryButtonStyles: Partial<ButtonProps>;
  onGetStarted: () => void;
};

const hubCards = [
  {
    title: "Plan research",
    detail: "Map questions to projects and budgets.",
  },
  {
    title: "Deploy agents",
    detail: "Agents search, summarize, and draft findings.",
  },
  {
    title: "Review findings",
    detail: "Inspect results and approve next steps.",
  },
] as const;

const capabilities = [
  { label: "Project tree", detail: "Nest studies and tasks under research projects." },
  { label: "Agent jobs", detail: "Queue investigations and watch agents report back." },
  { label: "Budgets", detail: "Track research budgets and spending." },
  { label: "Approvals", detail: "Timestamped approvals and rejections." },
] as const;

const hostingFeatures = [
  {
    title: "Agent-driven deploys",
    detail: "Agents package findings into deployable artifacts. No manual Docker or CI setup required.",
  },
  {
    title: "Built-in observability",
    detail: "Logs, metrics, and resource usage feed back into your workspace so agents can self-diagnose.",
  },
  {
    title: "Usage-based scaling",
    detail: "Resources spin up on demand and scale down when idle. You only pay for active research workloads.",
  },
] as const;

const frameworks = [
  "Docker", "Python", "Node.js", "React", "Next.js", "FastAPI",
  "Django", "Go", "Rust", "Vue.js", "Svelte",
] as const;

const terminalLines = [
  { prompt: true, text: "aurelia deploy --workspace acme-research" },
  { prompt: false, text: "Packaging research artifacts..." },
  { prompt: false, text: "Building container image..." },
  { prompt: false, text: "Deploying to edge network..." },
  { prompt: false, text: "Live → https://acme-research.aurelia.app" },
] as const;

type TypewriterSegment = {
  text: string;
  color?: string;
  loop?: boolean;
  breakBefore?: boolean;
};

type TypewriterTextProps = {
  segments: readonly TypewriterSegment[];
  speed: number;
  enabled: boolean;
};

const CURSOR_STYLES = {
  display: "inline-block" as const,
  width: "2px",
  height: "0.75em",
  marginLeft: "1px",
  verticalAlign: "baseline",
  backgroundColor: "var(--chakra-colors-ui-accent)",
  animation: "twCursorBlink 0.6s step-end infinite",
};

function TypewriterText({ segments, speed, enabled }: TypewriterTextProps) {
  const totalLength = segments.reduce((sum, s) => sum + s.text.length, 0);
  const loopIndex = segments.findIndex((s) => s.loop);
  const loopLength = loopIndex >= 0 ? segments[loopIndex]!.text.length : 0;

  const [initialCount, setInitialCount] = useState(enabled ? 0 : totalLength);
  const initialDone = initialCount >= totalLength;

  const [loopCount, setLoopCount] = useState(loopLength);
  const [phase, setPhase] = useState<"hold" | "erasing" | "holdEmpty" | "typing">("hold");

  useEffect(() => {
    if (!enabled || initialDone) return;
    const id = setTimeout(() => setInitialCount((c) => c + 1), speed);
    return () => clearTimeout(id);
  }, [initialCount, totalLength, speed, enabled, initialDone]);

  useEffect(() => {
    if (!enabled || !initialDone || loopIndex < 0) return;

    if (phase === "hold") {
      const id = setTimeout(() => setPhase("erasing"), 1800);
      return () => clearTimeout(id);
    }
    if (phase === "erasing") {
      if (loopCount <= 0) {
        setPhase("holdEmpty");
        return;
      }
      const id = setTimeout(() => setLoopCount((c) => c - 1), 30);
      return () => clearTimeout(id);
    }
    if (phase === "holdEmpty") {
      const id = setTimeout(() => setPhase("typing"), 500);
      return () => clearTimeout(id);
    }
    if (phase === "typing") {
      if (loopCount >= loopLength) {
        setPhase("hold");
        return;
      }
      const id = setTimeout(() => setLoopCount((c) => c + 1), speed);
      return () => clearTimeout(id);
    }
  }, [enabled, initialDone, loopIndex, phase, loopCount, loopLength, speed]);

  const segStarts: number[] = [];
  let running = 0;
  for (const s of segments) {
    segStarts.push(running);
    running += s.text.length;
  }

  return (
    <>
      {segments.map((segment, si) => {
        const start = segStarts[si]!;
        let visibleText: string;
        if (!initialDone) {
          const count = Math.max(0, Math.min(segment.text.length, initialCount - start));
          visibleText = segment.text.slice(0, count);
        } else if (segment.loop) {
          visibleText = segment.text.slice(0, loopCount);
        } else {
          visibleText = segment.text;
        }

        const showCursor = !initialDone
          ? initialCount >= start && initialCount <= start + segment.text.length
          : segment.loop;

        return (
          <Text as="span" key={si} color={segment.color} css={segment.loop ? { display: "block" } : undefined}>
            {visibleText}
            {showCursor && <span style={CURSOR_STYLES} />}
          </Text>
        );
      })}
    </>
  );
}

const MOTION = {
  section: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
  stagger: {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  },
  card: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  },
  hoverLift: { y: -4, transition: { duration: 0.2 } },
  none: {
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0 },
  },
} as const;

export function AureliaLanding({ secondaryButtonStyles, onGetStarted }: AureliaLandingProps) {
  const prefersReduced = useReducedMotion();

  const reveal = prefersReduced
    ? { initial: MOTION.none.initial, whileInView: MOTION.none.animate, transition: MOTION.none.transition }
    : { initial: MOTION.section.initial, whileInView: MOTION.section.animate, transition: MOTION.section.transition };

  const viewportOpts = { once: true, margin: "-60px" } as const;

  return (
    <Stack gap={{ base: "6", xl: "8" }}>
      <motion.div {...reveal} viewport={viewportOpts}>
        <Card.Root
          bg="ui.cardAlpha"
          border="1px solid"
          borderColor="ui.border"
          borderRadius="panel"
          shadow="panel"
          overflow="hidden"
          position="relative"
        >
          <Box
            position="absolute"
            inset="0"
            bg="linear-gradient(135deg, rgba(107,99,215,0.18) 0%, rgba(31,31,31,0.18) 38%, rgba(14,14,14,0.78) 100%)"
            pointerEvents="none"
          />
          <Box
            position="absolute"
            inset={{ base: "-20% auto auto -10%", xl: "-35% auto auto -5%" }}
            h={{ base: "260px", xl: "320px" }}
            w={{ base: "260px", xl: "320px" }}
            borderRadius="full"
            bg="radial-gradient(circle, rgba(141,136,223,0.12) 0%, rgba(141,136,223,0.00) 68%)"
            pointerEvents="none"
          />
          <Card.Body position="relative" px={{ base: "5", md: "6", xl: "7" }} py={{ base: "6", md: "8", xl: "10" }}>
            <Stack gap="3" align="center" textAlign="center">
              <img
                src="/logo.png"
                alt="Aurelia"
                draggable={false}
                style={{ height: "3.5rem", width: "auto", pointerEvents: "none" }}
              />

              <Stack gap="3" align="center">
                <Heading as="h1" fontSize={{ base: "3xl", md: "4xl", xl: "5xl" }} letterSpacing="-0.05em" lineHeight="0.96" maxW="4xl" textTransform="uppercase">
                  One workspace for your{" "}
                  <TypewriterText
                    segments={[
                      { text: "research team", color: "ui.accent", loop: true },
                    ]}
                    speed={50}
                    enabled={!prefersReduced}
                  />
                </Heading>
                <Text fontSize={{ base: "md", xl: "lg" }} lineHeight="1.9" color="ui.textMuted" maxW="2xl">
                  Plan studies, deploy research agents, and review findings — all from one surface.
                </Text>
              </Stack>

              <Flex gap="3" wrap="wrap" justify="center">
                <Button bg="ui.accent" color="white" borderRadius="control" px="5" _hover={{ bg: "ui.accentHover" }} onClick={onGetStarted}>
                  Get started
                </Button>
                <Button {...secondaryButtonStyles}>See how it works</Button>
              </Flex>
            </Stack>
          </Card.Body>
        </Card.Root>
      </motion.div>

      <motion.div {...reveal} viewport={viewportOpts}>
        <ResearchOrgTree reducedMotion={!!prefersReduced} />
      </motion.div>

      <motion.div style={{ marginTop: 16 }}
        variants={prefersReduced ? undefined : MOTION.stagger}
        initial={prefersReduced ? undefined : "hidden"}
        whileInView={prefersReduced ? undefined : "show"}
        viewport={viewportOpts}
      >
        <Grid templateColumns={{ base: "1fr", xl: "repeat(3, minmax(0, 1fr))" }} gap="4">
          {hubCards.map((card, i) => (
            <motion.div
              key={card.title}
              variants={prefersReduced ? undefined : MOTION.card}
              whileHover={prefersReduced ? undefined : MOTION.hoverLift}
            >
              <Card.Root
                bg="ui.cardAltAlpha"
                border="1px solid"
                borderColor="ui.border"
                borderTop="2px solid"
                borderTopColor="ui.accentBorder"
                borderRadius="panel"
                boxShadow="inset 0 1px 0 0 rgba(255,255,255,0.03), 0 0 0 1px rgba(58,58,58,0.5)"
                h="full"
              >
                <Card.Body px="5" py="4">
                  <Flex align="baseline" gap="2" mb="1">
                    <Text fontSize="xs" fontFamily="mono" color="ui.accentSoft">
                      {String(i + 1).padStart(2, "0")}
                    </Text>
                    <Heading as="h2" fontSize="xl" letterSpacing="-0.03em" lineHeight="1.08">
                      {card.title}
                    </Heading>
                  </Flex>
                  <Text mt="1" fontSize="sm" lineHeight="1.8" color="ui.textMuted">
                    {card.detail}
                  </Text>
                </Card.Body>
              </Card.Root>
            </motion.div>
          ))}
        </Grid>
      </motion.div>

      <motion.div {...reveal} viewport={viewportOpts}>
        <Stack gap="5">
          <Stack gap="2" align="center" textAlign="center">
            <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} letterSpacing="-0.04em" lineHeight="1.05">
              Track every project, agent, budget, and decision.
            </Heading>
            <Text fontSize="sm" color="ui.textMuted" lineHeight="1.7">
              See the entire operation at a glance.
            </Text>
          </Stack>

          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="4">
            {capabilities.map((cap) => (
              <Card.Root
                key={cap.label}
                bg="ui.cardAltAlpha"
                border="1px solid"
                borderColor="ui.border"
                borderTop="1px solid"
                borderTopColor="ui.border"
                borderRadius="panel"
                boxShadow="inset 0 1px 0 0 rgba(255,255,255,0.03), 0 0 0 1px rgba(58,58,58,0.5)"
              >
                <Card.Body px="5" py="3">
                  <Text fontSize="sm" fontWeight="600" color="ui.text">
                    {cap.label}
                  </Text>
                  <Text mt="1.5" fontSize="sm" lineHeight="1.75" color="ui.textMuted">
                    {cap.detail}
                  </Text>
                </Card.Body>
              </Card.Root>
            ))}
          </Grid>
        </Stack>
      </motion.div>

      <motion.div {...reveal} viewport={viewportOpts}>
        <Stack gap="6">
          <Stack gap="3" align="center" textAlign="center">
            <Heading
              as="h2"
              fontSize={{ base: "3xl", md: "4xl" }}
              letterSpacing="-0.05em"
              lineHeight="1.05"
              css={{
                background: "linear-gradient(to bottom, #e8e8e8 0%, #707070 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              From findings to production
            </Heading>
            <Text fontSize="sm" color="ui.textMuted" lineHeight="1.7" maxW="2xl" mx="auto">
              Research agents can package and deploy results as live apps, dashboards, or APIs — using any framework your team already works with.
            </Text>
          </Stack>

          <motion.div
            variants={prefersReduced ? undefined : MOTION.stagger}
            initial={prefersReduced ? undefined : "hidden"}
            whileInView={prefersReduced ? undefined : "show"}
            viewport={viewportOpts}
          >
            <Grid
              templateColumns={{ base: "1fr", xl: "3fr 2fr" }}
              templateRows={{ xl: "1fr 1fr" }}
              gap="4"
            >
              <Box gridRow={{ xl: "1 / 3" }}>
                <motion.div
                  variants={prefersReduced ? undefined : MOTION.card}
                  style={{ height: "100%" }}
                >
                  <Card.Root
                    bg="ui.cardAltAlpha"
                    border="1px solid"
                    borderColor="ui.border"
                    borderRadius="panel"
                    h="full"
                    overflow="hidden"
                    css={{
                      transition: "border-color 0.2s ease",
                      "&:hover": { borderColor: "#3a3a3a" },
                    }}
                  >
                    <Card.Body px="6" py="5" display="flex" flexDirection="column" gap="4">
                      <Stack gap="1">
                        <Heading as="h3" fontSize="lg" letterSpacing="-0.03em" lineHeight="1.2" color="ui.text">
                          {hostingFeatures[0].title}
                        </Heading>
                        <Text fontSize="sm" lineHeight="1.7" color="ui.textMuted">
                          {hostingFeatures[0].detail}
                        </Text>
                      </Stack>

                      <Box
                        flex="1"
                        bg="ui.surfaceInset"
                        borderRadius="12px"
                        border="1px solid"
                        borderColor="ui.border"
                        overflow="hidden"
                      >
                        <Flex
                          align="center"
                          gap="1.5"
                          px="3.5"
                          py="2.5"
                          borderBottom="1px solid"
                          borderColor="ui.border"
                        >
                          <Box w="2.5" h="2.5" borderRadius="full" bg="#FF5F57" />
                          <Box w="2.5" h="2.5" borderRadius="full" bg="#FEBC2E" />
                          <Box w="2.5" h="2.5" borderRadius="full" bg="#28C840" />
                          <Text fontSize="xs" color="ui.textSubtle" ml="2" fontFamily="mono">
                            Terminal
                          </Text>
                        </Flex>
                        <Box px="4" py="3" fontFamily="mono" fontSize="xs" lineHeight="2" overflowX="auto">
                          {terminalLines.map((line, idx) => (
                            <Text key={idx} whiteSpace="nowrap">
                              <Text as="span" color={line.prompt ? "ui.textSubtle" : "ui.success"}>
                                {line.prompt ? "$ " : "  ✓ "}
                              </Text>
                              <Text as="span" color={line.prompt ? "ui.text" : "ui.success"}>
                                {line.text}
                              </Text>
                            </Text>
                          ))}
                        </Box>
                      </Box>
                    </Card.Body>
                  </Card.Root>
                </motion.div>
              </Box>

              {hostingFeatures.slice(1).map((feat) => (
                <motion.div
                  key={feat.title}
                  variants={prefersReduced ? undefined : MOTION.card}
                >
                  <Card.Root
                    bg="ui.cardAltAlpha"
                    border="1px solid"
                    borderColor="ui.border"
                    borderRadius="panel"
                    h="full"
                    css={{
                      transition: "border-color 0.2s ease",
                      "&:hover": { borderColor: "#3a3a3a" },
                    }}
                  >
                    <Card.Body px="6" py="5">
                      <Heading as="h3" fontSize="lg" letterSpacing="-0.03em" lineHeight="1.2" color="ui.text">
                        {feat.title}
                      </Heading>
                      <Text mt="2" fontSize="sm" lineHeight="1.8" color="ui.textMuted">
                        {feat.detail}
                      </Text>
                    </Card.Body>
                  </Card.Root>
                </motion.div>
              ))}
            </Grid>
          </motion.div>

          <Box
            overflow="hidden"
            py="3"
            css={{
              maskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }}
          >
            <motion.div
              animate={prefersReduced ? undefined : { x: ["0%", "-50%"] }}
              transition={
                prefersReduced
                  ? undefined
                  : { repeat: Infinity, duration: 25, ease: "linear" }
              }
              style={{ display: "flex", gap: "2.5rem", width: "max-content" }}
            >
              {[...frameworks, "+ more", ...frameworks, "+ more"].map((fw, i) => (
                <Text
                  key={i}
                  fontFamily="mono"
                  fontSize="xs"
                  color="ui.textSubtle"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  whiteSpace="nowrap"
                >
                  {fw}
                </Text>
              ))}
            </motion.div>
          </Box>
        </Stack>
      </motion.div>
    </Stack>
  );
}
