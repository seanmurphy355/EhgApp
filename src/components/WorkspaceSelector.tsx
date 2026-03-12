import { useState } from "react";
import {
  Card,
  Flex,
  Grid,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Plus } from "lucide-react";
import type { Workspace } from "../lib/settings";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";

type WorkspaceSelectorProps = {
  workspaces: Workspace[];
  onSelect: (id: string) => void;
  onCreate: (name: string, description: string) => void;
};

export function WorkspaceSelector({ workspaces, onSelect, onCreate }: WorkspaceSelectorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const isEmpty = workspaces.length === 0;

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "";
    }
  }

  return (
    <Flex minH="100vh" align="center" justify="center" px={{ base: "4", md: "6" }} py="12">
      <Stack gap="8" w="full" maxW="720px" align="center">
        <Stack gap="3" align="center" textAlign="center">
          <img
            src="/logo.png"
            alt="Aurelia"
            draggable={false}
            style={{ height: "3rem", width: "auto", pointerEvents: "none" }}
          />
          <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} letterSpacing="-0.04em" lineHeight="1.05">
            {isEmpty ? "Create your first workspace" : "Your workspaces"}
          </Heading>
          <Text fontSize="sm" color="ui.textMuted" lineHeight="1.7" maxW="md">
            {isEmpty
              ? "Workspaces hold your research projects, agents, and settings. Create one to get started."
              : "Pick a workspace to continue, or create a new one."}
          </Text>
        </Stack>

        {isEmpty ? (
          <Card.Root
            bg="transparent"
            border="1px dashed"
            borderColor="ui.borderStrong"
            borderRadius="panel"
            cursor="pointer"
            transition="border-color 0.15s, background 0.15s"
            _hover={{ borderColor: "ui.accent", bg: "ui.cardAlpha" }}
            onClick={() => setDialogOpen(true)}
            maxW="320px"
            w="full"
          >
            <Card.Body px="5" py="6" display="flex" alignItems="center" justifyContent="center">
              <Stack gap="2" align="center">
                <Flex
                  h="10"
                  w="10"
                  align="center"
                  justify="center"
                  borderRadius="full"
                  border="1px solid"
                  borderColor="ui.borderStrong"
                  color="ui.textSubtle"
                >
                  <Plus size={20} />
                </Flex>
                <Text fontSize="sm" fontWeight="500" color="ui.textMuted">
                  New workspace
                </Text>
              </Stack>
            </Card.Body>
          </Card.Root>
        ) : (
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, minmax(0, 1fr))" }}
            gap="4"
            w="full"
          >
            {workspaces.map((ws) => (
              <Card.Root
                key={ws.id}
                bg="ui.cardAlpha"
                border="1px solid"
                borderColor="ui.border"
                borderRadius="panel"
                shadow="panel"
                cursor="pointer"
                transition="border-color 0.15s, box-shadow 0.15s"
                _hover={{ borderColor: "ui.accent", boxShadow: "0 0 0 1px var(--chakra-colors-ui-accent)" }}
                onClick={() => onSelect(ws.id)}
              >
                <Card.Body px="5" py="4">
                  <Stack gap="2">
                    <Heading as="h2" fontSize="lg" letterSpacing="-0.02em" lineHeight="1.2">
                      {ws.name}
                    </Heading>
                    {ws.description && (
                      <Text fontSize="sm" color="ui.textMuted" lineHeight="1.6" lineClamp={2}>
                        {ws.description}
                      </Text>
                    )}
                    <Text fontSize="xs" color="ui.textSubtle" fontFamily="mono">
                      Created {formatDate(ws.createdAt)}
                    </Text>
                  </Stack>
                </Card.Body>
              </Card.Root>
            ))}

            <Card.Root
              bg="transparent"
              border="1px dashed"
              borderColor="ui.borderStrong"
              borderRadius="panel"
              cursor="pointer"
              transition="border-color 0.15s, background 0.15s"
              _hover={{ borderColor: "ui.accent", bg: "ui.cardAlpha" }}
              onClick={() => setDialogOpen(true)}
              minH="120px"
            >
              <Card.Body px="5" py="4" display="flex" alignItems="center" justifyContent="center">
                <Stack gap="2" align="center">
                  <Flex
                    h="10"
                    w="10"
                    align="center"
                    justify="center"
                    borderRadius="full"
                    border="1px solid"
                    borderColor="ui.borderStrong"
                    color="ui.textSubtle"
                  >
                    <Plus size={20} />
                  </Flex>
                  <Text fontSize="sm" fontWeight="500" color="ui.textMuted">
                    New workspace
                  </Text>
                </Stack>
              </Card.Body>
            </Card.Root>
          </Grid>
        )}

        <CreateWorkspaceDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={onCreate}
        />
      </Stack>
    </Flex>
  );
}
