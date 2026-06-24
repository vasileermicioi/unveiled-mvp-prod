import type { ReactElement } from "react";

export interface AdminPanelHeaderProps {
  badge: string;
  title: string;
}

export function AdminPanelHeaderPresentational({
  badge,
  title,
}: AdminPanelHeaderProps): ReactElement {
  return (
    <section className="border-4 border-brand-dark bg-white p-5 md:p-7">
      <span className="inline-flex items-center gap-1 border-2 border-brand-dark bg-brand-yellow px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-brand-dark">
        {badge}
      </span>
      <h1 className="headline-lg mt-5">{title}</h1>
    </section>
  );
}

export interface AdminPanelTabBarProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabClick: (tab: string) => void;
}

export function AdminPanelTabBarPresentational(
  props: AdminPanelTabBarProps,
): ReactElement {
  const { tabs, activeTab, onTabClick } = props;
  return (
    <div className="flex border-4 border-brand-dark bg-brand-grey p-1">
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            data-testid={`admin-tab-${tab.id}`}
            className={
              isSelected
                ? "flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all bg-brand-dark text-white shadow-[2px_2px_0_0_#202621]"
                : "flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all text-brand-dark hover:bg-brand-dark/10"
            }
            onClick={() => onTabClick(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export interface AdminPanelActionListEntry {
  id: string;
  label: string;
  onSelect: () => void;
  testId?: string;
}

export interface AdminPanelActionListProps {
  entries: AdminPanelActionListEntry[];
}

export function AdminPanelActionListPresentational(
  props: AdminPanelActionListProps,
): ReactElement {
  const { entries } = props;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {entries.map((entry) => (
        <button
          key={entry.id}
          type="button"
          data-testid={entry.testId}
          onClick={entry.onSelect}
          className="border-4 border-brand-dark bg-white p-4 text-left text-sm font-black uppercase tracking-widest transition-colors hover:bg-brand-yellow"
        >
          {entry.label}
        </button>
      ))}
    </div>
  );
}
