import { FC } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Link } from "react-router-dom";

import { NavItem } from "../../types";

interface Props {
  navItems: NavItem[];
}

export const NavList: FC<Props> = ({ navItems }) => {
  return (
    <Box sx={{ width: 250 }}>
      <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
        {navItems.map(({ key, label, icon, route }) => (
          <ListItem key={key} disablePadding>
            <ListItemButton component={Link} to={route || ""}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
