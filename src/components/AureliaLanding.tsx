import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  HStack,
  Heading,
  Stack,
  Text,
  type ButtonProps,
} from "@chakra-ui/react";
import { motion, useReducedMotion } from "motion/react";

type AureliaLandingProps = {
  secondaryButtonStyles: Partial<ButtonProps>;
};

const hubCards = [
  {
    eyebrow: "Structure",
    title: "Scope the research agenda before work begins.",
    detail: "Map questions to projects, assign leads, and set budgets for each study.",
  },
  {
    eyebrow: "Activate",
    title: "Put persistent agents on every question.",
    detail: "Agents search, summarize, and draft findings on the schedule you set.",
  },
  {
    eyebrow: "Review",
    title: "See findings and decide together.",
    detail: "Shared timelines, cost snapshots, and sign-off gates in one visible trail.",
  },
] as const;

const capabilities = [
  { label: "Project tree", detail: "Nest studies and tasks under the research projects that fund them." },
  { label: "Agent jobs", detail: "Queue investigations, set deadlines, and watch agents report back in real time." },
  { label: "Spend ledger", detail: "See where every dollar is committed, burning, or waiting for sign-off." },
  { label: "Decision log", detail: "Timestamped approvals and rejections so no call goes unrecorded." },
] as const;

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

export function AureliaLanding({ secondaryButtonStyles }: AureliaLandingProps) {
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
          <Card.Body position="relative" px={{ base: "5", md: "6", xl: "7" }} py={{ base: "6", md: "7" }}>
            <Stack gap="4" align="center" textAlign="center">
              <img
                src="/logo.png"
                alt="Aurelia"
                draggable={false}
                style={{ height: "4.5rem", width: "auto", pointerEvents: "none" }}
              />
              <HStack gap="2" wrap="wrap" justify="center">
                <HStack gap="2" px="3" py="1.5" border="1px solid" borderColor="ui.accentBorder" borderRadius="full" bg="ui.accentMuted">
                  <Box h="2" w="2" borderRadius="full" bg="ui.accentSoft" />
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="ui.textSubtle" fontFamily="mono">
                    Aurelia
                  </Text>
                </HStack>
                <HStack gap="2" px="3" py="1.5" border="1px solid" borderColor="ui.border" borderRadius="full" bg="ui.pillAlpha">
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="ui.textSubtle" fontFamily="mono">
                    Research OS
                  </Text>
                </HStack>
              </HStack>

              <Stack gap="3" align="center">
                <Heading as="h1" fontSize={{ base: "3xl", md: "4xl", xl: "5xl" }} letterSpacing="-0.05em" lineHeight="0.96" maxW="4xl">
                  One workspace for your entire research team.
                </Heading>
                <Text fontSize={{ base: "md", xl: "lg" }} lineHeight="1.9" color="ui.textMuted" maxW="2xl">
                  Stop stitching tools together. Questions, agents, and findings share one surface.
                </Text>
              </Stack>

              <Flex gap="3" wrap="wrap" justify="center">
                <Button bg="ui.accent" color="white" borderRadius="control" px="5" _hover={{ bg: "ui.accentHover" }}>
                  Get started
                </Button>
                <Button {...secondaryButtonStyles}>See how it works</Button>
              </Flex>
            </Stack>
          </Card.Body>
        </Card.Root>
      </motion.div>

      <motion.div
        variants={prefersReduced ? undefined : MOTION.stagger}
        initial={prefersReduced ? undefined : "hidden"}
        whileInView={prefersReduced ? undefined : "show"}
        viewport={viewportOpts}
      >
        <Grid templateColumns={{ base: "1fr", xl: "repeat(3, minmax(0, 1fr))" }} gap="4">
          {hubCards.map((card) => (
            <motion.div
              key={card.title}
              variants={prefersReduced ? undefined : MOTION.card}
              whileHover={prefersReduced ? undefined : MOTION.hoverLift}
            >
              <Card.Root bg="ui.cardAltAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" shadow="hairline" h="full">
                <Card.Body px="5" py="5">
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                    {card.eyebrow}
                  </Text>
                  <Heading mt="2" as="h2" fontSize="xl" letterSpacing="-0.03em" lineHeight="1.08">
                    {card.title}
                  </Heading>
                  <Text mt="3" fontSize="sm" lineHeight="1.8" color="ui.textMuted">
                    {card.detail}
                  </Text>
                </Card.Body>
              </Card.Root>
            </motion.div>
          ))}
        </Grid>
      </motion.div>

      <motion.div {...reveal} viewport={viewportOpts}>
        <Card.Root bg="ui.cardAltAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" shadow="hairline">
          <Card.Body px={{ base: "5", md: "6", xl: "7" }} py={{ base: "6", md: "7" }}>
            <Stack gap="5">
              <Stack gap="2" align="center" textAlign="center">
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                  What you control
                </Text>
                <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} letterSpacing="-0.04em" lineHeight="1.05">
                  Every moving piece, visible and accounted for.
                </Heading>
              </Stack>

              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={{ base: "5", xl: "6" }}>
                {capabilities.map((cap) => (
                  <Stack key={cap.label} gap="1.5">
                    <Text fontSize="sm" fontWeight="600" color="ui.text">
                      {cap.label}
                    </Text>
                    <Text fontSize="sm" lineHeight="1.75" color="ui.textMuted">
                      {cap.detail}
                    </Text>
                  </Stack>
                ))}
              </Grid>
            </Stack>
          </Card.Body>
        </Card.Root>
      </motion.div>
    </Stack>
  );
}
