import type { ReactElement } from "react";

export interface MemberFeedHeaderProps {
  badge: string;
  title: string;
}

export function MemberFeedHeaderPresentational({
  badge,
  title,
}: MemberFeedHeaderProps): ReactElement {
  return (
    <section className="border-4 border-brand-dark bg-white p-5 md:p-7">
      <span className="inline-flex items-center gap-1 border-2 border-brand-dark bg-brand-yellow px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-brand-dark">
        {badge}
      </span>
      <h1 className="headline-lg mt-5">{title}</h1>
    </section>
  );
}

export interface MemberFeedGateProps {
  membershipGate: string;
  billingGate: string;
}

export function MemberFeedGatePresentational({
  membershipGate,
  billingGate,
}: MemberFeedGateProps): ReactElement {
  return (
    <section className="border-4 border-brand-dark bg-brand-cream p-4">
      <p className="unveiled-meta">{membershipGate}</p>
      <p className="mt-2 text-sm font-bold uppercase tracking-widest">
        {billingGate}
      </p>
    </section>
  );
}

export interface MemberFeedMessageProps {
  message: string;
}

export function MemberFeedMessagePresentational({
  message,
}: MemberFeedMessageProps): ReactElement | null {
  if (!message) return null;
  return (
    <section className="border-4 border-brand-dark bg-white p-4">
      <p className="text-sm font-bold uppercase tracking-widest">{message}</p>
    </section>
  );
}
