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

export interface SuperiorOptions {
  zona: number;
  requisito: number;
  competencia: number;
}

export interface Superior {
  miembro_id: number;
  nombre_completo: string;
}

export interface Zone {
  zona_id: number;
  descripcion: string;
}

export interface Service {
  servicio_id: number;
  descripcion: string;
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

export interface CivilStatus {
  estado_civil_id: number;
  descripcion: string;
}

export interface Education {
  educacion_id: number;
  descripcion: string;
}

export interface Occupation {
  ocupacion_id: number;
  descripcion: string;
}

export interface Disability {
  discapacidad_id: number;
  descripcion: string;
}

export interface MemberForm {
  cedula?: string;
  nombre_completo: string;
  telefono?: string;
  fecha_nacimiento?: Date;
  hijos: number;
  educacion_fk_id: number;
  estado_civil_fk_id: number;
  ocupacion_fk_id: number;
  discapacidad_fk_id: number;
  historial: {
    lider_fk_id: number;
    supervisor_fk_id: number;
    servicio_fk_id: number;
    zona_fk_id: number;
  };
}
