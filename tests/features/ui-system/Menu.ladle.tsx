// @ladle-only
import type { Story } from "@ladle/react";

import "@/styles/global.css";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";

export const TriggerAriaExpanded: Story = () => (
  <div className="bg-brand-grey p-8">
    <Menu>
      <MenuTrigger>
        <button type="button">Account menu</button>
      </MenuTrigger>
      <MenuContent aria-label="Account actions">
        <MenuItem key="profile">Profile</MenuItem>
        <MenuItem key="logout">Logout</MenuItem>
      </MenuContent>
    </Menu>
  </div>
);

export const ItemKeyboardNavigation: Story = () => (
  <div className="bg-brand-grey p-8">
    <Menu defaultOpen>
      <MenuTrigger>
        <button type="button">Account menu</button>
      </MenuTrigger>
      <MenuContent aria-label="Account actions">
        <MenuItem key="profile">Profile</MenuItem>
        <MenuItem key="logout">Logout</MenuItem>
      </MenuContent>
    </Menu>
  </div>
);

export default {
  title: "ui-system / Menu",
};