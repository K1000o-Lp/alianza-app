import { createApi, fetchBaseQuery, FetchBaseQueryError, BaseQueryFn, FetchArgs, FetchBaseQueryMeta } from "@reduxjs/toolkit/query/react";
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
  RegistroForm,
  ResponseEvent,
  ResponseMember,
  ResponseResultado,
  ResponseStatistic,
  Rol,
  Service,
  Sesion,
  Supervisor,
  SupervisorForm,
  SupervisorOptions,
  User,
  UsuarioAdmin,
  Zone,
} from "../../types";
import { jwtDecode } from "jwt-decode";
import { setUser, logOut } from "../features/authSlice";
import { config } from "../../config";
import { obtenerEdad } from "../../helpers/obtenerEdad";

const BACKEND_URL = config()?.BACKEND_URL;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BACKEND_URL,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  object,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshResult = await rawBaseQuery(
      { url: 'auth/refresh', method: 'POST' },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const { access_token } = refreshResult.data as { access_token: string };
      localStorage.setItem('token', access_token);
      const { session }: { session: User } = jwtDecode(access_token);
      api.dispatch(setUser(session));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logOut());
      localStorage.removeItem('token');
    }
  }

  return result;
};

export const alianzaApi = createApi({
  reducerPath: "alianzaApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Zones', 'Services', 'Members', 'Results', 'InfiniteResults', 'Statistics', 'CivilStatuses', 'Educations',
    'Disabilities', 'Occupations', 'Supervisors', 'Usuarios'
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
        } catch(error) {
          console.log(error);
        }
      }
    }),
    refrescarSesion: builder.mutation<{ access_token: string }, void>({
      query: () => ({ url: 'auth/refresh', method: 'POST' }),
    }),
    cerrarSesion: builder.mutation<void, void>({
      query: () => ({ url: 'auth/logout', method: 'POST' }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
        } catch {
          // log out locally even if the server request fails
        } finally {
          dispatch(logOut());
          localStorage.removeItem('token');
        }
      },
    }),
    registrarUsuario: builder.mutation<{ access_token: string }, RegistroForm>({
      query: (dto) => ({ url: 'auth/registrar', method: 'POST', body: dto }),
      onCacheEntryAdded: async (_, { dispatch, cacheDataLoaded }) => {
        try {
          const { data: { access_token } } = await cacheDataLoaded;
          const { session }: { session: User } = jwtDecode(access_token);
          localStorage.setItem('token', access_token);
          dispatch(setUser(session));
        } catch(error) {
          console.log(error);
        }
      }
    }),
    registroCompleto: builder.mutation<{ access_token: string }, { nombre_completo: string; cedula: string; telefono: string; fecha_nacimiento: Date; zona_id: number; nombre_usuario: string; contrasena: string; transferir?: boolean }>({
      query: (dto) => ({ url: 'auth/registro-completo', method: 'POST', body: dto }),
      onCacheEntryAdded: async (_, { dispatch, cacheDataLoaded }) => {
        try {
          const { data: { access_token } } = await cacheDataLoaded;
          const { session }: { session: User } = jwtDecode(access_token);
          localStorage.setItem('token', access_token);
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
    getMembersWithResultsAndPagination: builder.infiniteQuery<ResponseMember[], { desplazamiento?: number; limite?: number }, number>({
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (_, __, lastPageParam, ____) =>
          lastPageParam + 24,
      },
      query: ({ queryArg, pageParam }) => ({
        url: 'persona/miembros',
        params: { ...queryArg, desplazamiento: pageParam },
      }),
      transformResponse: (response: ResponseMember[]) =>
        response.map(
          ({
            id,
            cedula,
            nombre_completo,
            telefono,
            fecha_nacimiento,
            hijos,
            resultados,
            ...rest
          }) => {
            const resultadosPorRequisito: Record<string, any> = {};

            if(resultados?.length > 0) {
              // Transformar resultados a objetos con clave por nombre de requisito
              resultados.forEach((resultado) => {
                const requisitName = resultado.requisito?.nombre || 'desconocido';
                resultadosPorRequisito[requisitName] = resultado;
              });
            }

            return ({
              id,
              cedula,
              nombre_completo,
              telefono,
              fecha_nacimiento,
              hijos,
              resultados,
              resultadosPorRequisito,
              ...rest
            })
          }
        ),
      providesTags: (result, _, { desplazamiento }) =>
        result ? [{ type: 'InfiniteResults', id: desplazamiento }] : [],
    }),
    getMembersConsolidation: builder.infiniteQuery<ResponseMember[], {
      zona?: number;
      supervisor?: number;
      no_completado?: boolean;
      requisito?: number;
      results_since?: string;
      results_until?: string;
      limite?: number;
    }, number>({
      infiniteQueryOptions: {
        initialPageParam: 0,
        getNextPageParam: (_, __, lastPageParam) => lastPageParam + 24,
      },
      query: ({ queryArg, pageParam }) => ({
        url: 'persona/miembros',
        params: { ...queryArg, desplazamiento: pageParam },
      }),
      transformResponse: (response: ResponseMember[]) =>
        response.map(({ id, cedula, nombre_completo, telefono, fecha_nacimiento, hijos, resultados, ...rest }) => {
          let consolidado_en: Date | undefined;
          const resultadosPorRequisito: Record<string, any> = {};
          if (resultados?.length > 0) {
            consolidado_en = resultados[0].creado_en as Date | undefined;
            resultados.forEach((resultado) => {
              const requisitName = resultado.requisito?.nombre || 'desconocido';
              resultadosPorRequisito[requisitName] = resultado;
            });
          }
          return { id, cedula, nombre_completo, telefono, fecha_nacimiento, hijos, resultados, resultadosPorRequisito, consolidado_en, ...rest };
        }),
      providesTags: ['Results'],
    }),
    getMembersWithResults: builder.query<ResponseMember[], Partial<Options>>({
      query: (options) => ({
        url: 'persona/miembros',
        params: options,
      }),
      transformResponse: (response: ResponseMember[]) =>
        response.map(
          ({
            id,
            cedula,
            nombre_completo,
            telefono,
            fecha_nacimiento,
            hijos,
            resultados,
            ...rest
          }) => {
            let consolidado_en: Date | undefined;
            const resultadosPorRequisito: Record<string, any> = {};

            if(resultados?.length > 0) {
              consolidado_en = resultados[0].creado_en as Date | undefined;
              // Transformar resultados a objetos con clave por nombre de requisito
              resultados.forEach((resultado) => {
                const requisitName = resultado.requisito?.nombre || 'desconocido';
                resultadosPorRequisito[requisitName] = resultado;
              });
            }

            return ({
              id,
              cedula,
              nombre_completo,
              telefono,
              fecha_nacimiento,
              hijos,
              resultados,
              resultadosPorRequisito,
              consolidado_en,
              ...rest
            })
          }
        ),
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
            resultados,
            historiales,
          }) => {
            let ultimo_requisito: string | undefined;
            const edad = obtenerEdad(fecha_nacimiento);

            if(resultados?.length > 0) {
              ultimo_requisito = resultados[0].requisito.nombre;
            }
            
            return ({
              id,
              cedula,
              nombre_completo,
              telefono,
              fecha_nacimiento,
              edad,
              hijos,
              resultados,
              ultimo_requisito,
              historiales,
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
      invalidatesTags: ['Members', 'Statistics', 'InfiniteResults'],
    }),
    putMembers: builder.mutation<ResponseMember, Partial<MemberForm>>({
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
      invalidatesTags: (_, __, { pageParam }) => {
        return ['Results', 'Members', { type: 'InfiniteResults', id: pageParam }];
      }
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
      invalidatesTags: (_, __, { pageParam }) => {
        return ['Results', 'Members', { type: 'InfiniteResults', id: pageParam }];
      }
    }),
    deleteConsolidationResults: builder.mutation<Object, {id: number; pageParam: number;}>({
      query: ({ id }) => ({
        url: `formacion/resultados/${id}`,
        method: 'DELETE',
        rejectValue: (error: FetchBaseQueryError) => {
          const errorMessage = (error.data && typeof error.data === 'object' && 'mensaje' in error.data) ? (error.data as { mensaje: string }).mensaje : 'Unknown error';
          return {
            message: errorMessage,
            code: error.status,
          }
        }
      }),
      invalidatesTags: (_, __, { pageParam}) => {
        return ['Results', 'Members', { type: 'InfiniteResults', id: pageParam }];
      }
    }),
    postResultadoSesion: builder.mutation<ResponseResultado, { requisito_id: number }>({
      query: (dto) => ({
        url: 'formacion/resultados/sesion',
        method: 'POST',
        body: dto,
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
    getSupervisors: builder.query<Supervisor[], Partial<SupervisorOptions>>({
      query: (options) => ({
        url: 'organizacion/supervisores',
        params: options,
      }),
      transformResponse: (response: Supervisor[]) =>
        response.map(
          ({
            id,
            zona,
            miembro,
            fecha_inicio,
            fecha_finalizacion,
          }) => {
            const { id: miembro_id, cedula, nombre_completo, telefono, fecha_nacimiento } = miembro;

            return ({
              id,
              zona,
              miembro,
              miembro_id,
              cedula,
              nombre_completo,
              telefono,
              fecha_nacimiento,
              fecha_inicio,
              fecha_finalizacion,
            })
          }
        ),
      providesTags: ['Supervisors'],
    }),
    postSupervisors: builder.mutation<Supervisor, SupervisorForm>({
      query: (newSupervisor) => ({
        url: 'organizacion/supervisores',
        method: 'POST',
        body: newSupervisor,
        rejectValue: (error: FetchBaseQueryError) => {
          const errorMessage = (error.data && typeof error.data === 'object' && 'message' in error.data) ? (error.data as { message: string }).message : 'Unknown error';
          return {
            message: errorMessage,
            code: error.status,
          }
        },
      }),
      invalidatesTags: ['Supervisors'],
    }),
    deleteSupervisors: builder.mutation<void, Partial<SupervisorOptions>>({
      query: ({id, ...rest}) => ({
        url: `organizacion/supervisores/${id}`,
        method: 'DELETE',
        params: rest,
        rejectValue: (error: FetchBaseQueryError) => {
          const errorMessage = (error.data && typeof error.data === 'object' && 'message' in error.data) ? (error.data as { message: string }).message : 'Unknown error';
          return {
            message: errorMessage,
            code: error.status,
          }
        },
      }),
      invalidatesTags: ['Supervisors'],
    }),
    getUsuarios: builder.query<UsuarioAdmin[], void>({
      query: () => 'usuarios',
      providesTags: ['Usuarios'],
    }),
    getRoles: builder.query<Rol[], void>({
      query: () => 'usuarios/roles',
    }),
    crearUsuario: builder.mutation<UsuarioAdmin, { nombre_usuario: string; contrasena: string; rol_nombre: string; zona_id?: number; miembro_id?: number }>({
      query: (dto) => ({ url: 'usuarios', method: 'POST', body: dto }),
      invalidatesTags: ['Usuarios'],
    }),
    actualizarRolUsuario: builder.mutation<void, { id: number; rol_id: number }>({
      query: ({ id, rol_id }) => ({
        url: `usuarios/${id}/rol`,
        method: 'PUT',
        body: { rol_id },
      }),
      invalidatesTags: ['Usuarios'],
    }),
    resetContrasenaUsuario: builder.mutation<void, { id: number; nueva_contrasena: string }>({
      query: ({ id, nueva_contrasena }) => ({
        url: `usuarios/${id}/contrasena`,
        method: 'PATCH',
        body: { nueva_contrasena },
      }),
    }),
    eliminarUsuario: builder.mutation<void, number>({
      query: (id) => ({
        url: `usuarios/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Usuarios'],
    }),
  }),
});

export const {
  useIniciarSesionMutation,
  useRefrescarSesionMutation,
  useCerrarSesionMutation,
  useRegistrarUsuarioMutation,
  useRegistroCompletoMutation,
  useGetCountStatisticsQuery,
  useGetMembersWithResultsQuery,
  useGetMembersConsolidationInfiniteQuery,
  useGetMembersWithResultsAndPaginationInfiniteQuery,
  useGetMembersWithLastResultQuery,
  usePostConsolidationResultsMutation,
  useDeleteConsolidationResultsMutation,
  usePostResultadoSesionMutation,
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
  useGetSupervisorsQuery,
  usePostSupervisorsMutation,
  useDeleteSupervisorsMutation,
  useGetUsuariosQuery,
  useGetRolesQuery,
  useCrearUsuarioMutation,
  useActualizarRolUsuarioMutation,
  useResetContrasenaUsuarioMutation,
  useEliminarUsuarioMutation,
} = alianzaApi;
