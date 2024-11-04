import { createApi, fetchBaseQuery, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import {
  CivilStatus,
  consolidationForm,
  Disability,
  Education,
  EventForm,
  IniciarSesionForm,
  MemberForm,
  Occupation,
  Options,
  Requirement,
  RequirementsOption,
  ResponseEvent,
  ResponseMember,
  ResponseResultado,
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

const customBaseQuery = fetchBaseQuery({ 
  baseUrl: BACKEND_URL,
 });

export const alianzaApi = createApi({
  reducerPath: "alianzaApi",
  baseQuery: customBaseQuery,
  tagTypes: [
    'Zones', 'Services', 'Members', 'Results', 'Statistics', 'CivilStatuses', 'Educations',
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
    getMembersWithResults: builder.query<ResponseMember[], Partial<Options>>({
      query: (options) => ({
        url: 'persona/miembros',
        params: options,
      }),
      providesTags: ['Results'],
    }),
    getMembersWithLastResult: builder.query<ResponseMember[], Partial<Options>>({
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
            resultados
          }) => {
            let ultimo_requisito: string | undefined;

            if(resultados?.length > 0) {
              ultimo_requisito = resultados[0].requisito.nombre;
            }
            
            return ({
              id,
              cedula,
              nombre_completo,
              telefono,
              fecha_nacimiento,
              hijos,
              resultados,
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
        rejectValue: (error: FetchBaseQueryError) => {
          const errorMessage = (error.data && typeof error.data === 'object' && 'message' in error.data) ? (error.data as { message: string }).message : 'Unknown error';
          return {
            message: errorMessage,
            code: error.status,
          }
        }
      }),
      invalidatesTags: ['Members', 'Statistics'],
    }),
    putMembers: builder.mutation<ResponseMember, MemberForm>({
      query: ({ id, ...newMember }) => ({
        url: `persona/miembros/${id}`,
        method: 'PUT',
        body: newMember,
        rejectValue: (error: FetchBaseQueryError) => {
          const errorMessage = (error.data && typeof error.data === 'object' && 'message' in error.data) ? (error.data as { message: string }).message : 'Unknown error';
          return {
            message: errorMessage,
            code: error.status,
          }
        }
      }),
      invalidatesTags: ['Members'],
    }),
    postConsolidationResults: builder.mutation<ResponseResultado, consolidationForm>({
      query: (newConsolidation) => ({
        url: 'formacion/resultados',
        method: 'POST',
        body: newConsolidation,
        rejectValue: (error: FetchBaseQueryError) => {
          const errorMessage = (error.data && typeof error.data === 'object' && 'message' in error.data) ? (error.data as { message: string }).message : 'Unknown error';
          return {
            message: errorMessage,
            code: error.status,
          }
        }
      }),
      invalidatesTags: ['Results', 'Members'],
    }),
    getRequirements: builder.query<Requirement[], Partial<RequirementsOption> | null | void >({
      query: (options) => ({ url: "formacion/requisitos", params: options || undefined }),
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
  }),
});

export const {
  useIniciarSesionMutation,
  useGetCountStatisticsQuery,
  useGetMembersWithResultsQuery,
  useGetMembersWithLastResultQuery,
  usePostConsolidationResultsMutation,
  useGetRequirementsQuery,
  usePostMembersMutation,
  usePutMembersMutation,
  useGetZonesQuery,
  useGetServicesQuery,
  useGetCivilStatusesQuery,
  useGetEducationsQuery,
  useGetOccupationsQuery,
  useGetDisabilitiesQuery,
  usePostEventsMutation,
} = alianzaApi;
