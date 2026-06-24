// @atoms-re-export
import { AtomStoryBackdrop } from "../../atoms/backdrop";
import { Button } from "../../atoms/button";

import { Menu, MenuContent, MenuItem, MenuTrigger } from "./menu";

export const Default = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <Menu>
      <MenuTrigger>
        <Button>Open menu</Button>
      </MenuTrigger>
      <MenuContent aria-label="Actions">
        <MenuItem key="copy">Copy</MenuItem>
        <MenuItem key="paste">Paste</MenuItem>
        <MenuItem key="delete" color="danger">
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
  </AtomStoryBackdrop>
);

export const TriggerAriaExpanded = () => <Default />;

export const ItemKeyboardNavigation = () => <Default />;

export const PlacementMatrix = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    {(["bottom-start", "bottom-end", "top-start", "top-end"] as const).map(
      (placement) => (
        <Menu key={placement} placement={placement}>
          <MenuTrigger>
            <Button variant="secondary">{placement}</Button>
          </MenuTrigger>
          <MenuContent aria-label={placement}>
            <MenuItem key="one">One</MenuItem>
            <MenuItem key="two">Two</MenuItem>
          </MenuContent>
        </Menu>
      ),
    )}
  </AtomStoryBackdrop>
);

export default {
  title: "Molecules / Menu",
  parameters: { ladle: { skipCoverage: true } },
};
