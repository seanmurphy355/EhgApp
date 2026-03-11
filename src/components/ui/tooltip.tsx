import type { ReactNode, RefObject } from "react";
import {
  Portal,
  Tooltip as ChakraTooltip,
  type TooltipContentProps,
  type TooltipRootProps,
} from "@chakra-ui/react";

type AppTooltipProps = Omit<TooltipRootProps, "children"> & {
  children: ReactNode;
  content: ReactNode;
  contentProps?: TooltipContentProps;
  disabled?: boolean;
  portalled?: boolean;
  portalRef?: RefObject<HTMLElement | null>;
  showArrow?: boolean;
};

export function Tooltip({
  children,
  content,
  contentProps,
  disabled = false,
  openDelay = 150,
  closeDelay = 80,
  portalled = true,
  portalRef,
  positioning = { placement: "right" },
  showArrow = true,
  ...rest
}: AppTooltipProps) {
  if (disabled || content == null) {
    return <>{children}</>;
  }

  return (
    <ChakraTooltip.Root
      closeDelay={closeDelay}
      openDelay={openDelay}
      positioning={positioning}
      {...rest}
    >
      <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
      <Portal disabled={!portalled} container={portalRef}>
        <ChakraTooltip.Positioner>
          <ChakraTooltip.Content
            bg="ui.surface"
            color="ui.text"
            border="1px solid"
            borderColor="ui.borderStrong"
            borderRadius="10px"
            boxShadow="hairline"
            px="2.5"
            py="1.5"
            fontSize="xs"
            lineHeight="1.4"
            {...contentProps}
          >
            {showArrow ? <ChakraTooltip.Arrow /> : null}
            {content}
          </ChakraTooltip.Content>
        </ChakraTooltip.Positioner>
      </Portal>
    </ChakraTooltip.Root>
  );
}
