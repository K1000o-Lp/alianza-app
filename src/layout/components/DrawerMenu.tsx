import * as React from "react";
import Drawer from "@mui/material/Drawer";
import { NavList } from "./NavList";
import { NavItem } from "../../types";
import { useAppSelector } from "../../redux/store";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AddBoxIcon from "@mui/icons-material/AddBox";
import Assignment from "@mui/icons-material/Assignment";
import EventIcon from "@mui/icons-material/Event";
import ChecklistIcon from "@mui/icons-material/Checklist";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import GroupIcon from "@mui/icons-material/Group";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";

interface Props {
  open: boolean;
  toggleDrawer: (
    event: React.KeyboardEvent | React.MouseEvent,
    reason: "backdropClick" | "escapeKeyDown"
  ) => void;
}

interface NavItemWithRoles extends NavItem {
  roles?: string[];
}

const ALL_NAV_ITEMS: NavItemWithRoles[] = [
  {
    key: "/",
    label: "Panel",
    icon: <DashboardIcon />,
    route: "/",
  },
  {
    key: "/miembros",
    label: "Miembros",
    icon: <PeopleIcon />,
    route: "/miembros",
    roles: ["admin", "pastores"],
  },
  {
    key: "/miembros/crear",
    label: "Agregar Miembro",
    icon: <AddBoxIcon />,
    route: "/miembros/crear",
    roles: ["admin"],
  },
  {
    key: "/eventos/crear",
    label: "Eventos",
    icon: <EventIcon />,
    route: "/eventos/crear",
    roles: ["admin", "pastores"],
  },
  {
    key: "/asistencias/crear",
    label: "Asistencias",
    icon: <ChecklistIcon />,
    route: "/asistencias/crear",
    roles: ["admin", "pastores"],
  },
  {
    key: "/reportes/consolidaciones",
    label: "Reporte de Consolidaciones",
    icon: <Assignment />,
    route: "/reportes/consolidaciones",
    roles: ["admin", "pastores"],
  },
  {
    key: "/supervisores",
    label: "Supervisores",
    icon: <SupervisorAccountIcon />,
    route: "/supervisores",
    roles: ["admin"],
  },
  {
    key: "/formacion/qr",
    label: "QR Formaciones",
    icon: <QrCode2Icon />,
    route: "/formacion/qr",
    roles: ["admin", "pastores"],
  },
  {
    key: "/usuarios",
    label: "Usuarios",
    icon: <GroupIcon />,
    route: "/usuarios",
    roles: ["admin"],
  },
  {
    key: "/registro/qr",
    label: "QR de Registro",
    icon: <HowToRegIcon />,
    route: "/registro/qr",
    roles: ["admin"],
  },
  {
    key: "/formacion/escanear",
    label: "Registrar Asistencia",
    icon: <QrCodeScannerIcon />,
    route: "/formacion/escanear",
    roles: ["miembros"],
  },
];

export const DrawerMenu: React.FC<Props> = ({ open, toggleDrawer }) => {
  const { user } = useAppSelector((state) => state.auth);
  const rolNombre = user?.rol?.nombre;

  const navItems: NavItem[] = ALL_NAV_ITEMS.filter(({ roles }) => {
    if (!roles) return true;
    if (!rolNombre) return false;
    return roles.includes(rolNombre);
  });

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
