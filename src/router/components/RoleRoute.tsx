import { FC, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../redux/store";

interface Props {
  children: ReactNode;
  roles: string[];
}

export const RoleRoute: FC<Props> = ({ children, roles }) => {
  const { user } = useAppSelector((state) => state.auth);
  const rolNombre = user?.rol?.nombre;

  if (!rolNombre || !roles.includes(rolNombre)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
