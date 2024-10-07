import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  CivilStatus,
  Disability,
  Education,
  EvaluacionInput,
  Evaluaciones,
  EventForm,
  IniciarSesionForm,
  MemberForm,
  Occupation,
  Options,
  ResponseEvent,
  ResponseMember,
  ResponseStatistic,
  Service,
  Sesion,
  User,
  Zone,
} from "../../types";
import { jwtDecode } from "jwt-decode";
import { setUser } from "../features/authSlice";
import { config } from "../../config";

const BACKEND_URL = config()?.BACKEND_URL;

export const alianzaApi = createApi({
  reducerPath: "alianzaApi",
  baseQuery: fetchBaseQuery({ baseUrl: BACKEND_URL }),
  tagTypes: [
    'Zones', 'Services', 'Members', 'Evaluations', 'Statistics', 'CivilStatuses', 'Educations',
    'Disabilities', 'Occupations',
  ],
  endpoints: (builder) => ({
    iniciarSesion: builder.mutation<Sesion, IniciarSesionForm>({
      query: (newSession) => ({
        url: 'auth/login',
        method: 'POST',
        body: newSession,
      }),
      onCacheEntryAdded: async (_, { dispatch, cacheDataLoaded }) => {
        try {
          const { data: { access_token } } = await cacheDataLoaded;
          const { session }: { session: User } = jwtDecode(access_token);
  
          localStorage.setItem('token', access_token);
          dispatch(setUser(session));
          console.log(session);
  
          dispatch(setUser(session));
        } catch(error) {
          console.log(error);
        }
      }
    }),
    getZones: builder.query<Zone[], null | void>({
      query: () => "organizacion/zonas",
    }),
    getServices: builder.query<Service[], null | void>({
      query: () => "organizacion/servicios",
    }),
    getCountStatistics: builder.query<ResponseStatistic, Partial<Options>>({
      query: (options) => ({
        url: 'persona/estadisticas',
        params: options,
      }),
      providesTags: ['Statistics'],
    }),
    getMembers: builder.query<ResponseMember[], Partial<Options>>({
      query: (options) => ({ url: "persona/miembros", params: options }),
      transformResponse: (response: ResponseMember[]) =>
        response.map(
          ({
            id,
            cedula,
            nombre_completo,
            telefono,
            fecha_nacimiento,
            hijos,
            evaluaciones
          }) => {
            let ultimo_requisito: string | undefined;

            if(!evaluaciones) {
              console.log(`Evaluaciones no existen para el miembro: ${nombre_completo}`);
              throw new Error(`Evaluaciones no existen para el miembro: ${nombre_completo}`); 
            }

            for(let i = 0; i < evaluaciones?.length; i++) {
              if(evaluaciones[i]?.resultado === false) {
                break;
              }
  
              if(evaluaciones[i]?.resultado === true) {
                ultimo_requisito = evaluaciones[i]?.requisito.nombre;
              }
            }
            
            return ({
              id,
              cedula,
              nombre_completo,
              telefono,
              fecha_nacimiento,
              hijos,
              ultimo_requisito
            })
          }
        ),
        providesTags: ['Members'],
    }),
    postMembers: builder.mutation<ResponseMember, MemberForm>({
      query: (newMember) => ({
        url: 'persona/miembros',
        method: 'POST',
        body: newMember,
      }),
      invalidatesTags: ['Members', 'Statistics'],
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
    postEvents: builder.mutation<ResponseEvent, EventForm>({
      query: (newEvent) => ({
        url: 'formacion/eventos',
        method: 'POST',
        body: newEvent,
      }),
    }),
    getEvaluations: builder.query<ResponseMember[], Partial<Options>>({
      query: (options) => ({
        url: 'persona/miembros',
        params: options,
      }),
      providesTags: ['Evaluations'],
    }),
    updateEvaluations: builder.mutation<Evaluaciones[], EvaluacionInput[]>({
      query: (toUpdate) => ({
        url: 'formacion/evaluaciones',
        method: 'PUT',
        body: toUpdate,
      }),
      invalidatesTags: ['Evaluations', 'Statistics'],
    }), 
  }),
});

export const {
  useIniciarSesionMutation,
  useGetCountStatisticsQuery,
  useGetMembersQuery,
  usePostMembersMutation,
  useGetZonesQuery,
  useGetServicesQuery,
  useGetCivilStatusesQuery,
  useGetEducationsQuery,
  useGetOccupationsQuery,
  useGetDisabilitiesQuery,
  usePostEventsMutation,
  useGetEvaluationsQuery,
  useUpdateEvaluationsMutation,
} = alianzaApi;
