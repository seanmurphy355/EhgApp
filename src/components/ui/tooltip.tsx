import { keyframes } from "@emotion/react";
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

const tooltipArrowBob = keyframes`
  0%, 55%, 100% {
    transform: translate3d(0, 0, 0);
  }

  70% {
    transform: translate3d(0, -2px, 0);
  }

  85% {
    transform: translate3d(0, 1px, 0);
  }
`;

const tooltipMotionStyles = {
  transformOrigin: "var(--transform-origin)",
  animationDuration: "0.14s",
  animationTimingFunction: "ease-out",
  _closed: {
    animationDuration: "0.1s",
    animationTimingFunction: "ease-in",
  },
  "&[data-placement^=top]": {
    _open: { animationName: "slide-from-bottom, fade-in" },
    _closed: { animationName: "slide-to-bottom, fade-out" },
  },
  "&[data-placement^=bottom]": {
    _open: { animationName: "slide-from-top, fade-in" },
    _closed: { animationName: "slide-to-top, fade-out" },
  },
  "&[data-placement^=left]": {
    _open: { animationName: "slide-from-right, fade-in" },
    _closed: { animationName: "slide-to-right, fade-out" },
  },
  "&[data-placement^=right]": {
    _open: { animationName: "slide-from-left, fade-in" },
    _closed: { animationName: "slide-to-left, fade-out" },
  },
  _motionReduce: {
    animationDuration: "0.01ms",
    animationTimingFunction: "linear",
    "&[data-placement^=top], &[data-placement^=bottom], &[data-placement^=left], &[data-placement^=right]": {
      _open: { animationName: "fade-in" },
      _closed: { animationName: "fade-out" },
    },
  },
} as const;

const tooltipArrowMotionStyles = {
  animation: `${tooltipArrowBob} 1.8s ease-in-out 0.3s infinite`,
  willChange: "transform",
  _motionReduce: {
    animation: "none",
  },
} as const;

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
            css={tooltipMotionStyles}
            {...contentProps}
          >
            {showArrow ? <ChakraTooltip.Arrow css={tooltipArrowMotionStyles} /> : null}
            {content}
          </ChakraTooltip.Content>
        </ChakraTooltip.Positioner>
      </Portal>
    </ChakraTooltip.Root>
  );
}
