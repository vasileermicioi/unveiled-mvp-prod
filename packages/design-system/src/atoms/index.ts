export * from "./button";
export * from "./card";
export * from "./divider";
export * from "./select-item";
export * from "./table-primitive";
export * from "./tabs";
export * from "./text-area";
export * from "./text-input";

import * as Button from "./button";
import * as Card from "./card";
import * as Divider from "./divider";
import * as SelectItem from "./select-item";
import * as TablePrimitive from "./table-primitive";
import * as Tabs from "./tabs";
import * as TextArea from "./text-area";
import * as TextInput from "./text-input";

export const Atoms = {
  ...Button,
  ...Card,
  ...Divider,
  ...SelectItem,
  ...TablePrimitive,
  ...Tabs,
  ...TextArea,
  ...TextInput,
} as const;
