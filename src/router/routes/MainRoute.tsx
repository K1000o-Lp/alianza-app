import { Outlet, RouteObject } from "react-router-dom";

import { PrivateRoute, RoleRoute } from "../components";
import { Layout } from "../../layout";
import { Home } from "../../pages/Home/view/Home";
import { Miembros } from "../../pages/Miembros/view/Miembros";
import { AddMember } from "../../pages/AddMember/view/AddMember";
import { Attendance } from "../../pages/Asistencias/view/Attendance";
import { Eventos } from "../../pages/Eventos/view/Eventos";
import { EditMember } from "../../pages/EditMember/view/EditMember";
import { ReportesConsolidaciones } from "../../pages/ReportesConsolidaciones/view/ReportesConsolidaciones";
import { Supervisores } from "../../pages/Supervisores/view/Supervisores";
import { FormacionQR } from "../../pages/FormacionQR";
import { GestionUsuarios } from "../../pages/GestionUsuarios";
import { QRRegistro } from "../../pages/QRRegistro/view/QRRegistro";
import { RegistrarFormacion } from "../../pages/RegistrarFormacion";

const ADMIN_ROLES = ['admin'];
const STAFF_ROLES = ['admin', 'pastores'];

export const MainRoute: RouteObject = {
  path: "/",
  element: (
    <PrivateRoute>
      <Layout>
        <Outlet />
      </Layout>
    </PrivateRoute>
  ),
  children: [
    {
      index: true,
      element: <Home />,
    },
    {
      path: "miembros",
      element: (
        <RoleRoute roles={STAFF_ROLES}>
          <Miembros />
        </RoleRoute>
      ),
    },
    {
      path: "miembros/crear",
      element: (
        <RoleRoute roles={ADMIN_ROLES}>
          <AddMember />
        </RoleRoute>
      ),
    },
    {
      path: "miembros/:id/editar",
      element: (
        <RoleRoute roles={ADMIN_ROLES}>
          <EditMember />
        </RoleRoute>
      ),
    },
    {
      path: "eventos/crear",
      element: (
        <RoleRoute roles={STAFF_ROLES}>
          <Eventos />
        </RoleRoute>
      ),
    },
    {
      path: "asistencias/crear",
      element: (
        <RoleRoute roles={STAFF_ROLES}>
          <Attendance />
        </RoleRoute>
      ),
    },
    {
      path: "reportes/consolidaciones",
      element: (
        <RoleRoute roles={STAFF_ROLES}>
          <ReportesConsolidaciones />
        </RoleRoute>
      ),
    },
    {
      path: "supervisores",
      element: (
        <RoleRoute roles={ADMIN_ROLES}>
          <Supervisores />
        </RoleRoute>
      ),
    },
    {
      path: "formacion/qr",
      element: (
        <RoleRoute roles={STAFF_ROLES}>
          <FormacionQR />
        </RoleRoute>
      ),
    },
    {
      path: "usuarios",
      element: (
        <RoleRoute roles={ADMIN_ROLES}>
          <GestionUsuarios />
        </RoleRoute>
      ),
    },
    {
      path: "registro/qr",
      element: (
        <RoleRoute roles={ADMIN_ROLES}>
          <QRRegistro />
        </RoleRoute>
      ),
    },
    {
      path: "formacion/registrar/:miembro_id",
      element: (
        <RoleRoute roles={STAFF_ROLES}>
          <RegistrarFormacion />
        </RoleRoute>
      ),
    },
  ],
};
