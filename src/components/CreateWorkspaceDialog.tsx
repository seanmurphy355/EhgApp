import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Input,
  Portal,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { X } from "lucide-react";
import {
  fieldStyles,
  primaryButtonStyles,
  secondaryButtonStyles,
} from "./workspaceStyles";

type CreateWorkspaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, description: string) => void;
  title?: string;
};

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onSubmit,
  title = "Create workspace",
}: CreateWorkspaceDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
    }
  }, [open]);

  const canCreate = name.trim().length > 0;

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canCreate) return;
    onSubmit(name.trim(), description.trim());
    onOpenChange(false);
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(d) => onOpenChange(d.open)}
      placement="center"
      motionPreset="scale"
      size="md"
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Dialog.Backdrop bg="rgba(11, 11, 15, 0.82)" backdropFilter="blur(14px)" />
        <Dialog.Positioner px={{ base: "4", md: "6" }}>
          <Dialog.Content
            bg="ui.cardAlpha"
            border="1px solid"
            borderColor="ui.borderStrong"
            borderRadius="panel"
            boxShadow="panel"
            overflow="hidden"
            position="relative"
          >
            <IconButton
              aria-label="Close"
              size="sm"
              h="9"
              w="9"
              minW="9"
              position="absolute"
              top="3"
              right="3"
              zIndex="1"
              onClick={() => onOpenChange(false)}
              {...secondaryButtonStyles}
            >
              <X size={14} />
            </IconButton>

            <Dialog.Header
              px={{ base: "5", md: "6" }}
              py="4"
              borderBottom="1px solid"
              borderColor="ui.border"
            >
              <Stack gap="0.5" minW="0" pr="10">
                <Text
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="0.18em"
                  color="ui.textSubtle"
                  fontFamily="mono"
                >
                  New workspace
                </Text>
                <Dialog.Title
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight="700"
                  letterSpacing="-0.03em"
                  color="ui.text"
                >
                  {title}
                </Dialog.Title>
              </Stack>
            </Dialog.Header>

            <form onSubmit={handleSubmit}>
              <Dialog.Body px={{ base: "5", md: "6" }} py={{ base: "5", md: "6" }}>
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
                      Workspace name
                    </Text>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="My research project"
                      autoFocus
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
                      Description (optional)
                    </Text>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is this workspace for?"
                      minH="100px"
                      resize="vertical"
                      {...fieldStyles}
                    />
                  </Box>
                </Stack>
              </Dialog.Body>

              <Dialog.Footer
                px={{ base: "5", md: "6" }}
                py="4"
                borderTop="1px solid"
                borderColor="ui.border"
              >
                <Button
                  type="button"
                  {...secondaryButtonStyles}
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  {...primaryButtonStyles}
                  disabled={!canCreate}
                >
                  Create
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
