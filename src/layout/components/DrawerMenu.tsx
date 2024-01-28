import * as React from "react";
import Drawer from "@mui/material/Drawer";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";

import { NavList } from "./NavList";

interface Props {
  open: boolean;
  toggleDrawer: (
    event: React.KeyboardEvent | React.MouseEvent,
    reason: "backdropClick" | "escapeKeyDown"
  ) => void;
}

export const DrawerMenu: React.FC<Props> = ({ open, toggleDrawer }) => {
  const navItems = [
    {
      key: "panel-administracion",
      label: "Panel",
      icon: <DashboardIcon />,
      route: "../",
    },
    {
      key: "miembros",
      label: "Miembros",
      icon: <PeopleIcon />,
      route: "../miembros",
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
