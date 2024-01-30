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
