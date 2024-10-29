import * as React from "react";
import Drawer from "@mui/material/Drawer";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
// import AssignmentIcon from "@mui/icons-material/Assignment";
import AddBoxIcon from "@mui/icons-material/AddBox";
// import ChecklistIcon from '@mui/icons-material/Checklist';
//import EventIcon from '@mui/icons-material/Event';

import { NavList } from "./NavList";
import { NavItem } from "../../types";
import { Assignment } from "@mui/icons-material";

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
      key: "/miembros/crear",
      label: "Agregar Miembro",
      icon: <AddBoxIcon />,
      route: "../miembros/crear",
    },
    {
      key: "/reportes/consolidaciones",
      label: "Reporte de Consolidaciones",
      icon: <Assignment />,
      route: "../reportes/consolidaciones",
    }
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
