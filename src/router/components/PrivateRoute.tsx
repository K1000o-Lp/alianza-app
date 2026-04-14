import { FC, ReactNode, useEffect, useState } from "react";
import { RootState, useAppDispatch, useAppSelector } from "../../redux/store";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { setUser, logOut } from "../../redux/features/authSlice";
import { User } from "../../types";
import { config } from "../../config";

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
      if (token) {
        try {
          const decoded = jwtDecode<{ session: User; exp: number }>(token);
          const isExpired = decoded.exp * 1000 < Date.now();

          if (isExpired) {
            try {
              const response = await fetch(`${config().BACKEND_URL}auth/refresh`, {
                method: "POST",
                credentials: "include",
              });
              if (response.ok) {
                const data = await response.json();
                const newToken: string = data.access_token;
                localStorage.setItem("token", newToken);
                const newDecoded = jwtDecode<{ session: User }>(newToken);
                dispatch(setUser(newDecoded.session));
              } else {
                dispatch(logOut());
                localStorage.removeItem("token");
              }
            } catch {
              dispatch(logOut());
              localStorage.removeItem("token");
            }
          } else if (!auth.user) {
            dispatch(setUser(decoded.session));
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          dispatch(logOut());
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    verifySession();
  }, [auth.user, token, dispatch]);

  if (loading) {
    return <div style={{height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><img src={bannerDarkUrl} alt="logo" style={{ width: "250px"}} /></div>;
  }

  if (!token || !auth.isLogged) {
    return <Navigate to="/auth/signin" replace />;
  }

  return children;
};
