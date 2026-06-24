import type * as React from "react";

import {
  ModalBody as ModalBodyAtom,
  ModalContent as ModalContentAtom,
  ModalFooter as ModalFooterAtom,
  ModalHeader as ModalHeaderAtom,
  ModalRoot,
} from "../../atoms/modal";
import { cn } from "../../lib/utils";

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
    <ModalRoot
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
      <ModalContentAtom>
        {title ? (
          <ModalHeaderAtom className="font-display text-lg font-black uppercase tracking-widest">
            {title}
          </ModalHeaderAtom>
        ) : null}
        <ModalBodyAtom>{children}</ModalBodyAtom>
      </ModalContentAtom>
    </ModalRoot>
  );
}

export const ModalBody = ModalBodyAtom;
export const ModalContent = ModalContentAtom;
export const ModalHeader = ModalHeaderAtom;
export const ModalFooter = ModalFooterAtom;
