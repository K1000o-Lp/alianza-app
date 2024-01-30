import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ResponseStatistic, StatisticParam } from "../../types";

export const alianzaApi = createApi({
  reducerPath: "alianzaApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000" }),
  endpoints: (builder) => ({
    getCountStatistics: builder.query<ResponseStatistic, StatisticParam>({
      query: ({ requisito_id, competencia_id }) =>
        `persona/estadisticas?requisito=${requisito_id}&competencia=${competencia_id}`,
    }),
  }),
});

export const { useGetCountStatisticsQuery } = alianzaApi;
