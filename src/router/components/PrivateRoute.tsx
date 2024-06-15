import { FC, ReactNode, useEffect } from "react";
import { RootState, useAppDispatch, useAppSelector } from "../../redux/store";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { setUser } from "../../redux/features/authSlice";
import { User } from "../../types";

interface Props {
  children: ReactNode;
}

export const PrivateRoute: FC<Props> = ({ children }) => {
  const dispatch = useAppDispatch();
  const token = localStorage.getItem('token');
  const auth = useAppSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    if(!auth.user && token) {
      const { session }: {session: User} = jwtDecode(token);
      dispatch(setUser(session));
    }
  }, [auth.user])

  if(!token) {
    return <Navigate to="auth/signin"/>
  }


  return auth.isLogged ? children : <Navigate to="auth/signin" replace />;
};
