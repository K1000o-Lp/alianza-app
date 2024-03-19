import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  CivilStatus,
  Disability,
  Education,
  MemberForm,
  Occupation,
  ResponseMember,
  ResponseStatistic,
  Service,
  StatisticParam,
  Superior,
  SuperiorOptions,
  Zone,
} from "../../types";

export const alianzaApi = createApi({
  reducerPath: "alianzaApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000/" }),
  endpoints: (builder) => ({
    getZones: builder.query<Zone[], null | void>({
      query: () => "organizacion/zonas",
    }),
    getServices: builder.query<Service[], null | void>({
      query: () => "organizacion/servicios",
    }),
    getCountStatistics: builder.query<ResponseStatistic, StatisticParam>({
      query: ({ requisito_id, competencia_id }) =>
        `persona/estadisticas?requisito=${requisito_id}&competencia=${competencia_id}`,
    }),
    getSuperiors: builder.query<Superior[], Partial<SuperiorOptions>>({
      query: (options) => ({
        url: "persona/miembros",
        params: options,
      }),
      transformResponse: (response: ResponseMember[]) =>
        response.map(({ miembro_id, nombre_completo }) => ({
          miembro_id,
          nombre_completo,
        })),
    }),
    getMembers: builder.query<ResponseMember[], null | void>({
      query: () => ({ url: "persona/miembros" }),
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
    postMembers: builder.mutation<ResponseMember, MemberForm>({
      query: (newMember) => ({
        url: 'persona/miembros',
        method: 'POST',
        body: newMember,
      }),
    }),
    getCivilStatuses: builder.query<CivilStatus[], null | void>({
      query: () => "persona/estados_civiles",
    }),
    getEducations: builder.query<Education[], null | void>({
      query: () => "persona/educaciones",
    }),
    getOccupations: builder.query<Occupation[], null | void>({
      query: () => "persona/ocupaciones",
    }),
    getDisabilities: builder.query<Disability[], null | void>({
      query: () => "persona/discapacidades",
    }),
  }),
});

export const {
  useGetCountStatisticsQuery,
  useGetSuperiorsQuery,
  useGetMembersQuery,
  usePostMembersMutation,
  useGetZonesQuery,
  useGetServicesQuery,
  useGetCivilStatusesQuery,
  useGetEducationsQuery,
  useGetOccupationsQuery,
  useGetDisabilitiesQuery,
} = alianzaApi;
