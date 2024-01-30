import * as React from "react";
import Drawer from "@mui/material/Drawer";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";

import { NavList } from "./NavList";
import { NavItem } from "../../types";

interface Props {
  open: boolean;
  toggleDrawer: (
    event: React.KeyboardEvent | React.MouseEvent,
    reason: "backdropClick" | "escapeKeyDown"
  ) => void;
}

export const DrawerMenu: React.FC<Props> = ({ open, toggleDrawer }) => {
  const navItems: NavItem[] = [
    {
      key: "/",
      label: "Panel",
      icon: <DashboardIcon />,
      route: "../",
    },
    {
      key: "/miembros",
      label: "Miembros",
      icon: <PeopleIcon />,
      route: "../miembros",
    },
    {
      key: "/reportes",
      label: "Reportes",
      icon: <AssignmentIcon />,
      route: "../reportes",
    },
  ];

  return (
    <>
      <Drawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={toggleDrawer}
      >
        <NavList navItems={navItems} />
      </Drawer>
    </>
  );
};
