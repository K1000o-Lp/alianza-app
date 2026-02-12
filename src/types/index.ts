import dayjs from "dayjs";
import { ReactElement } from "react";



export interface User {
  id: number;
  nombre_usuario: string;
  miembro: ResponseMember
  zona: Zone;
}

export interface NavItem {
  key: string;
  label: string;
  icon: ReactElement;
  route: string | undefined;
  items?: NavItem[];
}

export interface Options {
  id: string;
  cedula: string;
  zona: number;
  supervisor: number;
  rol: number;
  no_completado: boolean;
  requisito: number;
  resultado: boolean;
  results_since: string;
  results_until: string;
}

export interface RequirementsOption {
  requisitos: number[];
}

export interface Zone {
  id: number;
  descripcion: string;
}

export interface Service {
  id: number;
  descripcion: string;
}

export interface Statistic {
  key: string;
  title: string;
  requisito_id?: number;
  resultado?: boolean;
}

export interface ResponseStatistic {
  total_miembros: number;
  cantidad: number;
}

export interface Requisito {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Resultado {
  id: number;
  creado_en: Date | null;
  modificado_en: Date | null;
  eliminado_en: Date | null;
  requisito: Requisito;
}

export interface ResponseMember {
  discapacidad?: any;
  ocupacion?: any;
  estado_civil?: any;
  educacion?: any;
  id: number;
  cedula: string;
  nombre_completo: string;
  telefono: string;
  fecha_nacimiento: Date;
  hijos: number;
  creado_en?: Date;
  modificado_en?: Date;
  eliminado_en?: Date;
  historiales?: any;
  resultados: Resultado[];
  resultadosPorRequisito?: Record<string, Resultado>; // Requisitos como keys dinámicas
  ultimo_requisito?: string;
}

export interface ResponseResultado {
  id: number;
  miembro: any;
  requisito: any;
  creado_en: Date;
  modificado_en: Date;
  eliminado_en: Date;
}

export interface Requirement {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface CivilStatus {
  id: number;
  descripcion: string;
}

export interface Education {
  id: number;
  descripcion: string;
}

export interface Occupation {
  id: number;
  descripcion: string;
}

export interface Disability {
  id: number;
  descripcion: string;
}

export interface MemberForm {
  id?: number;
  cedula?: string;
  nombre_completo: string;
  telefono?: string;
  fecha_nacimiento?: Date|dayjs.Dayjs;
  hijos: number;
  educacion_id: number;
  estado_civil_id: number;
  ocupacion_id: number;
  discapacidad_id: number;
  historial: {
    servicio_id?: number;
    zona_id: number;
    supervisor_id?: number;
  };
  requisito: {
    requisito_ids: number[];
  }
  pageParam: number;
}

export interface consolidationForm {
  miembro_id: number;
  requisito_ids: any[];
  fecha_consolidacion: Date | dayjs.Dayjs;
  pageParam?: number;
}

export interface EventForm {
  nombre: string;
  descripcion: string;
  zona_id: number;
}

export interface ResponseEvent {
  nombre: string;
  descripcion: string;
  zona: Zone;
}

export interface AsistenciasForm {
  evento_id: number;
  miembros: Array<{nombre_completo: string, miembro_id: number}>
}

export interface EvaluacionInput {
  id: number;
  resultado: boolean;
}

export interface IniciarSesionForm {
  nombre_usuario: string;
  contrasena: string;
}

export interface Sesion {
  access_token: string;
}

export interface snackBarStatus {
  is_open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

export interface filterConsolidation {
  zona: number;
  supervisor: number;
  no_completado: boolean;
  requisito: number;
  desde: dayjs.Dayjs | null;
  hasta: dayjs.Dayjs | null;
}

export interface filterMembers {
  zona: number;
  supervisor?: number;
  limite?: number;
  desplazamiento?: number;
  q?: string;
}

export interface Supervisor {
  id: number;
  zona: Zone,
  miembro: ResponseMember;
  fecha_inicio: Date;
  fecha_finalizacion: Date;
}

export interface SupervisorOptions {
  id: number;
  zona_id: number;
}

export interface SupervisorForm {
  zona_id: number;
  miembro_ids: any[];
}