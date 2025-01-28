import { FC, ReactNode, useEffect, useState } from "react";
import { RootState, useAppDispatch, useAppSelector } from "../../redux/store";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { setUser } from "../../redux/features/authSlice";
import { User } from "../../types";

import bannerDarkUrl from "/banner-dark.webp";

interface Props {
  children: ReactNode;
}

export const PrivateRoute: FC<Props> = ({ children }) => {
  const dispatch = useAppDispatch();
  const token = localStorage.getItem("token");
  const auth = useAppSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (!auth.user && token) {
        try {
          const { session }: { session: User } = jwtDecode(token);
          dispatch(setUser(session));
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
      setLoading(false);
    };

    verifySession();
  }, [auth.user, token, dispatch]);

  if (loading) {
    return <div style={{height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><img src={bannerDarkUrl} alt="logo" style={{ width: "250px"}} /></div>;
  }

  if (!token) {
    return <Navigate to="/auth/signin" />;
  }

  return auth.isLogged ? children : <Navigate to="/auth/signin" replace />;
};
