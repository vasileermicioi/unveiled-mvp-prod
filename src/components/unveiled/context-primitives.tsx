import { createContext, useContext } from "react";
import { emptyLiveDataView, type LiveDataView } from "@/lib/data-access/live-view-adapters";
import { copyFor, type UiLanguage } from "@/lib/i18n";

export const LiveDataContext = createContext<LiveDataView>(emptyLiveDataView);
export const LanguageContext = createContext<UiLanguage>("DE");

export { emptyLiveDataView };
export type { LiveDataView };

export function useLiveData() {
  return useContext(LiveDataContext);
}

export function useCopy() {
  return copyFor(useContext(LanguageContext));
}
