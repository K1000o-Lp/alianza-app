import { FC, ReactNode } from "react";
import ResponsiveAppBar from "./components/AppBar";

interface Props {
  children: ReactNode;
}

export const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      <ResponsiveAppBar />
      <div>Aquí va el hijito</div>
      {children}
    </>
  );
};
