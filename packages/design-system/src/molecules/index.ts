export * from "./drawer";
export * from "./field";
export * from "./menu";
export * from "./modal";
export * from "./select-input";
export * from "./stat-panel";
export * from "./state-panel";
export * from "./toast";

import * as Drawer from "./drawer";
import * as Field from "./field";
import * as Menu from "./menu";
import * as Modal from "./modal";
import * as SelectInput from "./select-input";
import * as StatPanel from "./stat-panel";
import * as StatePanel from "./state-panel";
import * as Toast from "./toast";

export const Molecules = {
  ...Drawer,
  ...Field,
  ...Menu,
  ...Modal,
  ...SelectInput,
  ...StatePanel,
  ...StatPanel,
  ...Toast,
} as const;
