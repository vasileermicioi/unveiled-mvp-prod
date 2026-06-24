export * from "./button";
export * from "./card";
export * from "./divider";
export * from "./drawer";
export * from "./menu";
export * from "./modal";
export * from "./select-item";
export * from "./table-primitive";
export * from "./tabs";
export * from "./text-area";
export * from "./text-input";
export * from "./toast";

import * as Button from "./button";
import * as Card from "./card";
import * as Divider from "./divider";
import * as Drawer from "./drawer";
import * as Menu from "./menu";
import * as Modal from "./modal";
import * as SelectItem from "./select-item";
import * as TablePrimitive from "./table-primitive";
import * as Tabs from "./tabs";
import * as TextArea from "./text-area";
import * as TextInput from "./text-input";
import * as Toast from "./toast";

export const Atoms = {
  ...Button,
  ...Card,
  ...Divider,
  ...Drawer,
  ...Menu,
  ...Modal,
  ...SelectItem,
  ...TablePrimitive,
  ...Tabs,
  ...TextArea,
  ...TextInput,
  ...Toast,
} as const;
