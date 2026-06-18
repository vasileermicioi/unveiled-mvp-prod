// @ladle-only
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import type * as React from "react";

import { cn } from "@/lib/utils";

export type HeroModalProps = React.ComponentProps<typeof Modal>;

export function HeroModal({ className, children, ...props }: HeroModalProps) {
  return (
    <Modal
      classNames={{
        base: cn(
          "rounded-none border-4 border-brand-dark bg-white shadow-[12px_12px_0_0_var(--brand-dark)]",
          className,
        ),
      }}
      {...props}
    >
      {children}
    </Modal>
  );
}

export {
  ModalBody as HeroModalBody,
  ModalContent as HeroModalContent,
  ModalFooter as HeroModalFooter,
  ModalHeader as HeroModalHeader,
};
