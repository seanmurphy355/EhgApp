import { useEffect, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "motion/react";

type ResearchOrgTreeProps = {
  reducedMotion: boolean;
};

type NodeDef = {
  id: string;
  label: string;
  tag: string;
  x: number;
  y: number;
};

type EdgeDef = {
  from: string;
  to: string;
};

type Hop = {
  from: string;
  to: string;
};

type Scenario = {
  name: string;
  hops: readonly Hop[];
  activeEdges: ReadonlySet<string>;
};

const NODES: readonly NodeDef[] = [
  { id: "director", label: "Research Director", tag: "Leadership", x: 50, y: 8 },
  { id: "projectLead", label: "Project Lead", tag: "Projects", x: 22, y: 44 },
  { id: "reviewBoard", label: "Review Board", tag: "Oversight", x: 50, y: 44 },
  { id: "budgetOfficer", label: "Budget Officer", tag: "Finance", x: 78, y: 44 },
  { id: "fieldResearcher", label: "Field Researcher", tag: "Research", x: 10, y: 84 },
  { id: "dataAnalyst", label: "Data Analyst", tag: "Analysis", x: 36, y: 84 },
];

const EDGES: readonly EdgeDef[] = [
  { from: "director", to: "projectLead" },
  { from: "director", to: "reviewBoard" },
  { from: "director", to: "budgetOfficer" },
  { from: "projectLead", to: "fieldResearcher" },
  { from: "projectLead", to: "dataAnalyst" },
];

function ek(from: string, to: string): string {
  return `${from}->${to}`;
}

const SCENARIOS: readonly Scenario[] = [
  {
    name: "Launch investigation",
    hops: [
      { from: "director", to: "projectLead" },
      { from: "projectLead", to: "fieldResearcher" },
    ],
    activeEdges: new Set([ek("director", "projectLead"), ek("projectLead", "fieldResearcher")]),
  },
  {
    name: "Analyze results",
    hops: [
      { from: "projectLead", to: "fieldResearcher" },
      { from: "projectLead", to: "dataAnalyst" },
    ],
    activeEdges: new Set([ek("projectLead", "fieldResearcher"), ek("projectLead", "dataAnalyst")]),
  },
  {
    name: "Review compliance",
    hops: [
      { from: "director", to: "reviewBoard" },
    ],
    activeEdges: new Set([ek("director", "reviewBoard")]),
  },
  {
    name: "Allocate budget",
    hops: [
      { from: "director", to: "budgetOfficer" },
      { from: "director", to: "projectLead" },
    ],
    activeEdges: new Set([ek("director", "budgetOfficer"), ek("director", "projectLead")]),
  },
];

const NODE_MAP = new Map(NODES.map((n) => [n.id, n]));

const HEX = {
  accent: "#6B63D7",
  border: "#3a3a3a",
} as const;

const NODE_HH = 7.5;

function elbowPath(from: NodeDef, to: NodeDef): string {
  const y1 = from.y + NODE_HH;
  const y4 = to.y - NODE_HH;
  const midY = (y1 + y4) / 2;
  return `M${from.x} ${y1} V${midY} H${to.x} V${y4}`;
}

function elbowWaypoints(from: NodeDef, to: NodeDef): [string, string][] {
  const y1 = from.y + NODE_HH;
  const y4 = to.y - NODE_HH;
  const midY = (y1 + y4) / 2;
  return [
    [`${from.x}%`, `${y1}%`],
    [`${from.x}%`, `${midY}%`],
    [`${to.x}%`, `${midY}%`],
    [`${to.x}%`, `${y4}%`],
  ];
}

const STEP_MS = 1200;
const HOLD_MS = 3200;
const DOT_DURATION = 1.1;

const TRANSITION_ALL =
  "opacity 0.9s, border-color 0.9s, box-shadow 0.9s, background-color 0.9s";

export function ResearchOrgTree({ reducedMotion }: ResearchOrgTreeProps) {
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState(0);

  const scenario = SCENARIOS[idx]!;
  const isStatic = reducedMotion;
  const tx = isStatic ? "none" : undefined;
  const hopsLen = scenario.hops.length;
  const allDone = step >= hopsLen;

  const activatedNodeIds = new Set<string>();
  if (isStatic) {
    for (const n of NODES) activatedNodeIds.add(n.id);
  } else {
    activatedNodeIds.add(scenario.hops[0]!.from);
    for (let i = 0; i < step; i++) {
      activatedNodeIds.add(scenario.hops[i]!.to);
    }
  }

  const activeEdgeSet = new Set<string>();
  if (!isStatic) {
    for (const key of scenario.activeEdges) {
      const sep = key.indexOf("->");
      const fromId = key.slice(0, sep);
      const toId = key.slice(sep + 2);
      if (activatedNodeIds.has(fromId) && activatedNodeIds.has(toId)) {
        activeEdgeSet.add(key);
      }
    }
  }

  const currentHop = !isStatic && step < hopsLen ? scenario.hops[step]! : null;
  const dotFrom = currentHop ? NODE_MAP.get(currentHop.from)! : null;
  const dotTo = currentHop ? NODE_MAP.get(currentHop.to)! : null;

  const badgeNodeId =
    !isStatic && allDone ? scenario.hops[hopsLen - 1]!.to : null;

  useEffect(() => {
    if (reducedMotion) return;
    const scenarioHopsLen = SCENARIOS[idx]!.hops.length;

    if (step < scenarioHopsLen) {
      const id = setTimeout(() => setStep((s) => s + 1), STEP_MS);
      return () => clearTimeout(id);
    }

    const id = setTimeout(() => {
      setIdx((p) => (p + 1) % SCENARIOS.length);
      setStep(0);
    }, HOLD_MS);
    return () => clearTimeout(id);
  }, [idx, step, reducedMotion]);

  return (
    <Box>
      <Flex h="5" mb="2" justify="center" align="center">
        <Text fontSize="xs" fontWeight="500" letterSpacing="0.04em" textTransform="uppercase" color="ui.textSubtle" textAlign="center">
          Research operations
        </Text>
      </Flex>

      <Box position="relative" overflow="visible" h={{ base: "240px", md: "310px" }} mx="auto" maxW="600px">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          {EDGES.map((edge) => {
            const from = NODE_MAP.get(edge.from)!;
            const to = NODE_MAP.get(edge.to)!;
            const key = ek(edge.from, edge.to);
            const active = isStatic || activeEdgeSet.has(key);
            return (
              <path
                key={key}
                d={elbowPath(from, to)}
                fill="none"
                stroke={active ? HEX.accent : HEX.border}
                strokeWidth={active ? 2 : 1}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                opacity={isStatic ? 0.4 : active ? 0.45 : 0.08}
                style={{
                  transition: tx ?? "stroke 0.9s, stroke-width 0.9s, opacity 0.9s",
                }}
              />
            );
          })}
        </svg>

        {dotFrom && dotTo && (() => {
          const wp = elbowWaypoints(dotFrom, dotTo);
          return (
            <motion.div
              key={`dot-${idx}-${step}`}
              style={{
                position: "absolute",
                width: 8,
                height: 8,
                marginLeft: -4,
                marginTop: -4,
                borderRadius: "50%",
                backgroundColor: HEX.accent,
                boxShadow: `0 0 4px ${HEX.accent}66, 0 0 8px ${HEX.accent}1a`,
                zIndex: 3,
                pointerEvents: "none",
              }}
              initial={{
                left: wp[0][0],
                top: wp[0][1],
                opacity: 0.5,
              }}
              animate={{
                left: wp.map((w) => w[0]),
                top: wp.map((w) => w[1]),
                opacity: 1,
              }}
              transition={{
                duration: DOT_DURATION,
                ease: "linear",
                times: [0, 0.33, 0.66, 1],
              }}
            />
          );
        })()}

        {NODES.map((node) => {
          const active = isStatic || activatedNodeIds.has(node.id);
          const showBadge = badgeNodeId === node.id;
          return (
            <Box
              key={node.id}
              position="absolute"
              left={`${node.x}%`}
              top={`${node.y}%`}
              transform="translate(-50%, -50%)"
              zIndex={1}
              minW={{ base: "100px", md: "130px" }}
              px={{ base: "3", md: "5" }}
              py={{ base: "2.5", md: "3" }}
              borderRadius="control"
              bg={active ? "ui.surface" : "ui.surfaceInset"}
              border="1px solid"
              borderColor={active ? "ui.accentBorder" : "ui.border"}
              boxShadow={active ? `0 0 6px ${HEX.accent}12` : "none"}
              opacity={active || isStatic ? 1 : 0.35}
              style={{ transition: tx ?? TRANSITION_ALL }}
            >
              <Text
                fontSize="xs"
                fontWeight="600"
                color={active ? "ui.text" : "ui.textSubtle"}
                textAlign="center"
                lineHeight="1.2"
                style={{ transition: tx ?? "color 0.9s" }}
              >
                {node.label}
              </Text>
              <Text
                fontSize="10px"
                color={active ? "ui.textMuted" : "ui.textSubtle"}
                textAlign="center"
                mt="1"
                lineHeight="1"
                style={{ transition: tx ?? "color 0.9s" }}
              >
                {node.tag}
              </Text>

              <AnimatePresence>
                {showBadge && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.3 }}
                    style={{ position: "absolute", top: -8, right: -8 }}
                  >
                    <Box
                      px="1.5"
                      py="0.5"
                      bg="ui.accent"
                      color="white"
                      fontSize="9px"
                      fontWeight="600"
                      borderRadius="full"
                      lineHeight="1"
                    >
                      Active
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
