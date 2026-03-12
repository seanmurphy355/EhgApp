import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  Heading,
  HStack,
  IconButton,
  Input,
  Portal,
  RadioGroup,
  Separator,
  Stack,
  Switch,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { X } from "lucide-react";
import type { ReviewPosture, WorkspaceSettings } from "../lib/settings";
import {
  fieldStyles,
  primaryButtonStyles,
  secondaryButtonStyles,
} from "./workspaceStyles";

type SettingsSurfaceProps = {
  settings: WorkspaceSettings;
  onSave: (nextSettings: WorkspaceSettings) => void;
};

type SettingsSummaryItemProps = {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
};

const reviewPostureOptions: Array<{ value: ReviewPosture; label: string; detail: string }> = [
  {
    value: "standard",
    label: "Standard",
    detail: "Balanced review defaults for everyday research runs.",
  },
  {
    value: "strict",
    label: "Strict",
    detail: "Favor tighter review gates and more deliberate evidence checks.",
  },
  {
    value: "expedited",
    label: "Expedited",
    detail: "Reduce review friction when speed matters more than ceremony.",
  },
];

function formatReviewPosture(value: ReviewPosture): string {
  const label = reviewPostureOptions.find((option) => option.value === value)?.label;
  return label ?? "Standard";
}

function SettingsSummaryItem({ label, value, hint, accent = false }: SettingsSummaryItemProps) {
  return (
    <Box bg="ui.surfaceInset" border="1px solid" borderColor="ui.border" borderRadius="16px" px="4" py="4">
      <Stack gap="1.5">
        <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="ui.textSubtle" fontFamily="mono">
          {label}
        </Text>
        <Text fontSize="lg" fontWeight="700" letterSpacing="-0.03em" color={accent ? "ui.accentSoft" : "ui.text"}>
          {value}
        </Text>
        <Text fontSize="sm" color="ui.textMuted" lineHeight="1.7">
          {hint}
        </Text>
      </Stack>
    </Box>
  );
}

export function SettingsSurface({ settings, onSave }: SettingsSurfaceProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draft, setDraft] = useState<WorkspaceSettings>(settings);
  const [hasSavedThisSession, setHasSavedThisSession] = useState(false);

  useEffect(() => {
    if (!isDialogOpen) {
      setDraft(settings);
    }
  }, [settings, isDialogOpen]);

  const trimmedWorkspaceName = draft.workspaceName.trim();
  const trimmedRepository = draft.defaultRepository.trim();
  const trimmedBriefTemplate = draft.defaultBriefTemplate.trim();

  const isValid = trimmedWorkspaceName.length > 0 && trimmedRepository.length > 0;
  const isDirty = useMemo(() => {
    return (
      trimmedWorkspaceName !== settings.workspaceName ||
      trimmedRepository !== settings.defaultRepository ||
      trimmedBriefTemplate !== settings.defaultBriefTemplate ||
      draft.reviewPosture !== settings.reviewPosture ||
      draft.showActivityRail !== settings.showActivityRail
    );
  }, [
    draft.reviewPosture,
    draft.showActivityRail,
    settings.defaultBriefTemplate,
    settings.defaultRepository,
    settings.reviewPosture,
    settings.showActivityRail,
    settings.workspaceName,
    trimmedBriefTemplate,
    trimmedRepository,
    trimmedWorkspaceName,
  ]);

  const summaryBrief = settings.defaultBriefTemplate.trim() || "No default brief saved yet.";
  const statusTitle = hasSavedThisSession ? "Settings saved locally" : "Local-only persistence";
  const statusDetail = hasSavedThisSession
    ? "Changes were saved on this device. Backend sync and task-form wiring are still pending."
    : "Settings are stored on this device for now and will stay frontend-only until the next integration pass.";

  function updateDraft<Key extends keyof WorkspaceSettings>(key: Key, value: WorkspaceSettings[Key]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleOpen() {
    setDraft(settings);
    setIsDialogOpen(true);
  }

  function handleClose() {
    setIsDialogOpen(false);
  }

  function handleSave() {
    if (!isValid || !isDirty) {
      return;
    }

    onSave({
      ...draft,
      workspaceName: trimmedWorkspaceName,
      defaultRepository: trimmedRepository,
      defaultBriefTemplate: trimmedBriefTemplate,
    });
    setHasSavedThisSession(true);
    setIsDialogOpen(false);
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
                Settings
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
                {settings.workspaceName}
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
              <Box h="2" w="2" borderRadius="full" bg={hasSavedThisSession ? "ui.success" : "ui.violet"} />
              <Text fontSize="sm" color="ui.textMuted">
                {hasSavedThisSession ? "Saved locally" : "Stored on device"}
              </Text>
            </HStack>
          </Flex>

          <Stack gap="1" minW="0">
            <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} letterSpacing="-0.04em" lineHeight="1.05">
              Research hub settings
            </Heading>
            <Text fontSize={{ base: "sm", md: "md" }} lineHeight="1.8" color="ui.textMuted" maxW="4xl">
              Tune the operating environment, visibility model, and review posture that support the broader research hub.
            </Text>
          </Stack>
        </Stack>

        <Flex gap="3" wrap="wrap" w={{ base: "full", md: "auto" }}>
          <Button
            {...primaryButtonStyles}
            flex={{ base: "1", md: "0" }}
            onClick={handleOpen}
          >
            Edit settings
          </Button>
        </Flex>
      </Flex>

      <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 340px" }} gap="6" alignItems="start">
        <Card.Root bg="ui.cardAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" shadow="panel" overflow="hidden">
          <Card.Header px={{ base: "5", md: "6" }} py="5" borderBottom="1px solid" borderColor="ui.border">
            <Stack gap="1">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                Saved defaults
              </Text>
              <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} letterSpacing="-0.03em">
                Workspace configuration
              </Heading>
              <Text fontSize="sm" color="ui.textMuted" maxW="2xl">
                Review what is currently stored on this device before backend wiring and live workspace hydration are added.
              </Text>
            </Stack>
          </Card.Header>

          <Card.Body px={{ base: "5", md: "6" }} py={{ base: "5", md: "6" }}>
            <Stack gap="5">
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, minmax(0, 1fr))" }} gap="4">
                <SettingsSummaryItem
                  label="Workspace name"
                  value={settings.workspaceName}
                  hint="Used to describe this settings profile inside the hub."
                  accent
                />
                <SettingsSummaryItem
                  label="Default repository"
                  value={settings.defaultRepository}
                  hint="Saved as a frontend-only default for future task wiring."
                />
                <SettingsSummaryItem
                  label="Review posture"
                  value={formatReviewPosture(settings.reviewPosture)}
                  hint="Controls the saved review bias for future integrations."
                />
                <SettingsSummaryItem
                  label="Activity rail"
                  value={settings.showActivityRail ? "Shown by default" : "Hidden by default"}
                  hint="Preference is saved now even though the shell does not consume it yet."
                />
              </Grid>

              <Box bg="ui.surfaceInset" border="1px solid" borderColor="ui.border" borderRadius="16px" px="4" py="4">
                <Stack gap="2">
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.16em" color="ui.textSubtle" fontFamily="mono">
                    Default research brief
                  </Text>
                  <Text fontSize="sm" color="ui.textMuted" lineHeight="1.8">
                    {summaryBrief}
                  </Text>
                </Stack>
              </Box>
            </Stack>
          </Card.Body>
        </Card.Root>

        <Stack gap="4" position={{ xl: "sticky" }} top={{ xl: "6" }} alignSelf="start">
          <Card.Root bg="ui.cardAltAlpha" border="1px solid" borderColor="ui.border" borderRadius="panel" shadow="hairline">
            <Card.Header px="5" py="3" borderBottom="1px solid" borderColor="ui.border">
              <Text fontSize="sm" fontWeight="600" color="ui.text">
                Save status
              </Text>
              <Text mt="1" fontSize="xs" color="ui.textSubtle">
                Local persistence only in this build.
              </Text>
            </Card.Header>
            <Card.Body px="5" py="4">
              <Stack gap="4">
                <HStack gap="2" px="3" py="1.5" border="1px solid" borderColor="ui.border" borderRadius="full" bg="ui.surfaceInset" w="fit-content">
                  <Box h="2" w="2" borderRadius="full" bg={hasSavedThisSession ? "ui.success" : "ui.violet"} />
                  <Text fontSize="sm" color="ui.textMuted">
                    {statusTitle}
                  </Text>
                </HStack>

                <Text fontSize="sm" color="ui.textMuted" lineHeight="1.8">
                  {statusDetail}
                </Text>

                <Separator borderColor="ui.border" />

                <Stack gap="2">
                  <Text fontSize="sm" fontWeight="600" color="ui.text">
                    What happens next
                  </Text>
                  <Text fontSize="sm" color="ui.textMuted" lineHeight="1.8">
                    Saving updates the settings summary immediately and keeps the values available after a refresh on this device.
                  </Text>
                </Stack>
              </Stack>
            </Card.Body>
          </Card.Root>
        </Stack>
      </Grid>

      <Dialog.Root
        open={isDialogOpen}
        onOpenChange={(details) => setIsDialogOpen(details.open)}
        placement="center"
        motionPreset="scale"
        scrollBehavior="inside"
        size="xl"
        lazyMount
        unmountOnExit
      >
        <Portal>
          <Dialog.Backdrop bg="rgba(11, 11, 15, 0.82)" backdropFilter="blur(10px)" />
          <Dialog.Positioner px={{ base: "4", md: "6" }}>
            <Dialog.Content
              bg="ui.cardAlpha"
              border="1px solid"
              borderColor="ui.borderStrong"
              borderRadius="panel"
              boxShadow="panel"
              overflow="hidden"
            >
              <Dialog.Header px={{ base: "5", md: "6" }} py="5" borderBottom="1px solid" borderColor="ui.border">
                <Flex justify="space-between" align="start" gap="4">
                  <Stack gap="1" minW="0">
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                      Settings
                    </Text>
                    <Dialog.Title fontSize={{ base: "xl", md: "2xl" }} fontWeight="700" letterSpacing="-0.03em" color="ui.text">
                      Edit workspace defaults
                    </Dialog.Title>
                    <Dialog.Description fontSize="sm" lineHeight="1.8" color="ui.textMuted" maxW="2xl">
                      Save the operating defaults you want the hub to remember locally until backend integration is ready.
                    </Dialog.Description>
                  </Stack>

                  <IconButton
                    aria-label="Close settings"
                    size="sm"
                    h="10"
                    w="10"
                    minW="10"
                    onClick={handleClose}
                    {...secondaryButtonStyles}
                  >
                    <X size={16} />
                  </IconButton>
                </Flex>
              </Dialog.Header>

              <Dialog.Body px={{ base: "5", md: "6" }} py={{ base: "5", md: "6" }}>
                <Stack gap="6">
                  <Box>
                    <Text mb="2" fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                      Workspace name
                    </Text>
                    <Input
                      value={draft.workspaceName}
                      onChange={(event) => updateDraft("workspaceName", event.target.value)}
                      placeholder="Aurelia Research Hub"
                      {...fieldStyles}
                    />
                  </Box>

                  <Box>
                    <Text mb="2" fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                      Default repository
                    </Text>
                    <Input
                      value={draft.defaultRepository}
                      onChange={(event) => updateDraft("defaultRepository", event.target.value)}
                      placeholder="owner/repository"
                      {...fieldStyles}
                    />
                  </Box>

                  <Box>
                    <Text mb="2" fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                      Default research brief
                    </Text>
                    <Textarea
                      value={draft.defaultBriefTemplate}
                      onChange={(event) => updateDraft("defaultBriefTemplate", event.target.value)}
                      minH={{ base: "180px", md: "200px" }}
                      resize="vertical"
                      placeholder="Capture the objective, evidence bar, and desired deliverable."
                      {...fieldStyles}
                    />
                  </Box>

                  <Separator borderColor="ui.border" />

                  <Box>
                    <Text mb="2.5" fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                      Review posture
                    </Text>
                    <RadioGroup.Root
                      value={draft.reviewPosture}
                      onValueChange={(details) => updateDraft("reviewPosture", details.value as ReviewPosture)}
                    >
                      <Stack gap="3">
                        {reviewPostureOptions.map((option) => {
                          const active = draft.reviewPosture === option.value;

                          return (
                            <RadioGroup.Item
                              key={option.value}
                              value={option.value}
                              cursor="pointer"
                              bg={active ? "ui.accentMuted" : "ui.surfaceInset"}
                              border="1px solid"
                              borderColor={active ? "ui.accentBorder" : "ui.border"}
                              borderRadius="16px"
                              px="4"
                              py="4"
                              _hover={{
                                bg: active ? "ui.accentMuted" : "ui.surfaceHover",
                                borderColor: active ? "ui.accentBorder" : "ui.borderStrong",
                              }}
                            >
                              <RadioGroup.ItemHiddenInput />
                              <Flex align="start" justify="space-between" gap="4">
                                <Stack gap="1" minW="0">
                                  <RadioGroup.ItemText fontSize="sm" fontWeight="600" color="ui.text">
                                    {option.label}
                                  </RadioGroup.ItemText>
                                  <Text fontSize="sm" color="ui.textMuted" lineHeight="1.7">
                                    {option.detail}
                                  </Text>
                                </Stack>
                                <RadioGroup.ItemControl
                                  mt="0.5"
                                  h="5"
                                  w="5"
                                  flexShrink="0"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  borderRadius="full"
                                  border="1px solid"
                                  borderColor={active ? "ui.accentSoft" : "ui.borderStrong"}
                                  bg={active ? "ui.accentMuted" : "transparent"}
                                >
                                  <RadioGroup.ItemIndicator>
                                    <Box h="2.5" w="2.5" borderRadius="full" bg="ui.accent" />
                                  </RadioGroup.ItemIndicator>
                                </RadioGroup.ItemControl>
                              </Flex>
                            </RadioGroup.Item>
                          );
                        })}
                      </Stack>
                    </RadioGroup.Root>
                  </Box>

                  <Box>
                    <Text mb="2.5" fontSize="xs" textTransform="uppercase" letterSpacing="0.18em" color="ui.textSubtle" fontFamily="mono">
                      Activity rail
                    </Text>
                    <Switch.Root
                      checked={draft.showActivityRail}
                      onCheckedChange={(details) => updateDraft("showActivityRail", details.checked)}
                      colorPalette="brand"
                      display="block"
                    >
                      <Switch.HiddenInput />
                      <Flex
                        align={{ base: "start", md: "center" }}
                        justify="space-between"
                        gap="4"
                        bg="ui.surfaceInset"
                        border="1px solid"
                        borderColor="ui.border"
                        borderRadius="16px"
                        px="4"
                        py="4"
                      >
                        <Stack gap="1" minW="0">
                          <Switch.Label fontSize="sm" fontWeight="600" color="ui.text">
                            Show activity rail by default
                          </Switch.Label>
                          <Text fontSize="sm" color="ui.textMuted" lineHeight="1.7">
                            Save this visibility preference now. The workspace shell will start reading it in a later pass.
                          </Text>
                        </Stack>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                      </Flex>
                    </Switch.Root>
                  </Box>
                </Stack>
              </Dialog.Body>

              <Dialog.Footer px={{ base: "5", md: "6" }} py="4" borderTop="1px solid" borderColor="ui.border">
                <Button {...secondaryButtonStyles} onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  {...primaryButtonStyles}
                  onClick={handleSave}
                  disabled={!isValid || !isDirty}
                >
                  Save settings
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Stack>
  );
}
