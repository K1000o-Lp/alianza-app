import { ReactElement } from "react";

export interface User {
  username: FormDataEntryValue | null;
  rol?: number;
}

export interface NavItem {
  key: string;
  label: string;
  icon: ReactElement;
  route: string | undefined;
  items?: NavItem[];
}
