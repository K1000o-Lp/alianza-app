import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ResponseMember,
  ResponseStatistic,
  StatisticParam,
  Zone,
} from "../../types";

export const alianzaApi = createApi({
  reducerPath: "alianzaApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000" }),
  endpoints: (builder) => ({
    getCountStatistics: builder.query<ResponseStatistic, StatisticParam>({
      query: ({ requisito_id, competencia_id }) =>
        `persona/estadisticas?requisito=${requisito_id}&competencia=${competencia_id}`,
    }),
    getMembers: builder.query<ResponseMember[], null | void>({
      query: () => "persona/miembros",
      transformResponse: (response: ResponseMember[]) =>
        response.map(
          ({
            miembro_id,
            cedula,
            nombre_completo,
            telefono,
            fecha_nacimiento,
            hijos,
          }) => ({
            miembro_id,
            cedula,
            nombre_completo,
            telefono,
            fecha_nacimiento,
            hijos,
          })
        ),
    }),
    getZones: builder.query<Zone[], null | void>({
      query: () => "organizacion/zonas",
    }),
  }),
});

export const {
  useGetCountStatisticsQuery,
  useGetMembersQuery,
  useGetZonesQuery,
} = alianzaApi;
