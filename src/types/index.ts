import { ReactElement } from "react";

export interface User {
  username: FormDataEntryValue | null;
  rol?: number;
}

export interface NavItem {
  key: string;
  label: string;
  icon: ReactElement;
  route: string | undefined;
  items?: NavItem[];
}

export interface Statistic {
  key: string;
  title: string;
  requisito_id?: number;
  competencia_id?: number;
}

export interface StatisticParam {
  requisito_id?: number;
  competencia_id?: number;
}

export interface ResponseStatistic {
  total_miembros: number;
  cantidad: number;
}

export interface ResponseMember {
  miembro_id: number;
  cedula: string;
  nombre_completo: string;
  telefono: string;
  fecha_nacimiento: Date;
  hijos: number;
  creado_en?: Date;
  modificado_en?: Date;
  eliminado_en?: Date;
  historiales?: unknown;
  evaluaciones?: unknown;
}

export interface Zone {
  zona_id: number;
  descripcion: string;
}
