import {
  Modal as HeroUIModal,
  ModalBody,
  ModalContent,
  ModalFooter as HeroUIModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import type * as React from "react";

import { cn } from "@/lib/utils";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
};

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  size = "2xl",
}: ModalProps) {
  return (
    <HeroUIModal
      isOpen={open}
      onClose={onClose}
      size={size}
      hideCloseButton
      classNames={{
        base: cn(
          "rounded-none border-4 border-brand-dark bg-white shadow-[12px_12px_0_0_var(--brand-dark)]",
          className,
        ),
      }}
    >
      <ModalContent>
        {title ? (
          <ModalHeader className="font-display text-lg font-black uppercase tracking-widest">
            {title}
          </ModalHeader>
        ) : null}
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </HeroUIModal>
  );
}

export const ModalFooter = HeroUIModalFooter;
export { ModalBody, ModalContent, ModalHeader };
