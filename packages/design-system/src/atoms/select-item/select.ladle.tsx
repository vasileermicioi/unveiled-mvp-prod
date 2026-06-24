// @atoms-re-export
import { NextUIProvider, Select, SelectItem } from "@nextui-org/react";

function StoryBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <div className="flex min-h-[200px] flex-col gap-4 bg-brand-grey p-8">
        {children}
      </div>
    </NextUIProvider>
  );
}

export const Default = () => (
  <StoryBackdrop>
    <Select
      aria-label="Select demo"
      placeholder="Pick one"
      variant="bordered"
      radius="none"
      classNames={{
        trigger: "unveiled-select-trigger",
        value: "unveiled-select-value",
        listbox: "!rounded-none !p-0 !gap-0",
        listboxWrapper: "!p-0",
        popoverContent: "unveiled-select-popover",
      }}
      listboxProps={{
        itemClasses: {
          base: "unveiled-select-item !rounded-none !px-4 !py-3",
        },
      }}
    >
      <SelectItem key="alpha">Alpha</SelectItem>
      <SelectItem key="beta">Beta</SelectItem>
      <SelectItem key="gamma">Gamma</SelectItem>
    </Select>
  </StoryBackdrop>
);

export const Multiple = () => (
  <StoryBackdrop>
    <Select
      aria-label="Multiple"
      placeholder="Pick many"
      variant="bordered"
      radius="none"
      selectionMode="multiple"
      classNames={{
        trigger: "unveiled-select-trigger",
        value: "unveiled-select-value",
        listbox: "!rounded-none !p-0 !gap-0",
        listboxWrapper: "!p-0",
        popoverContent: "unveiled-select-popover",
      }}
      listboxProps={{
        itemClasses: {
          base: "unveiled-select-item !rounded-none !px-4 !py-3",
        },
      }}
    >
      <SelectItem key="red">Red</SelectItem>
      <SelectItem key="green">Green</SelectItem>
      <SelectItem key="blue">Blue</SelectItem>
    </Select>
  </StoryBackdrop>
);

export default {
  title: "Atoms / Select",
  parameters: { ladle: { skipCoverage: true } },
};
