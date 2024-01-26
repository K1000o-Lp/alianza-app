import { FC, ReactNode } from "react";
import { RootState, useAppSelector } from "../../redux/store";
import { Navigate } from "react-router-dom";

interface Props {
  children: ReactNode;
}

export const PrivateRoute: FC<Props> = ({ children }) => {
  const auth = useAppSelector((state: RootState) => state.auth);

  return auth.isLogged ? children : <Navigate to="auth/signin" replace />;
};
