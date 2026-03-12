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
          <Card.Body position="relative" px={{ base: "5", md: "6", xl: "7" }} py={{ base: "3", md: "3.5" }}>
            <Stack gap="3" align="center" textAlign="center">
              <img
                src="/logo.png"
                alt="Aurelia"
                draggable={false}
                style={{ height: "3.5rem", width: "auto", pointerEvents: "none" }}
              />

              <Stack gap="3" align="center">
                <Heading as="h1" fontSize={{ base: "3xl", md: "4xl", xl: "5xl" }} letterSpacing="-0.05em" lineHeight="0.96" maxW="4xl">
                  One workspace for your research team.
                </Heading>
                <Text fontSize={{ base: "md", xl: "lg" }} lineHeight="1.9" color="ui.textMuted" maxW="2xl">
                  Run your entire research operation in one workspace.
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
    </Stack>
  );
}
