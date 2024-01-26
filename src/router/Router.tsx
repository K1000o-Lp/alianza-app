import { useRoutes } from "react-router-dom";
import { AuthRoute, MainRoute } from "./routes";

export const Router = () => {
  const router = useRoutes([MainRoute, AuthRoute]);

  return router;
};
