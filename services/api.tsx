'use server';
import { getServerAxios } from './axios';
import { PagedRequest, PagedResponse } from './types';

export async function get<TFilter = any, TResponseItem = any>(url: string, request?: PagedRequest<TFilter>, options?: { skipAuth?: boolean }): Promise<PagedResponse<TResponseItem>> {
  const axios = await getServerAxios(options);
  const response = await axios.post<PagedResponse<TResponseItem>>(url, request);
  return response.data;
}

export async function post<T>(url: string, request?: T, options?: { skipAuth?: boolean }): Promise<number> {
  const axios = await getServerAxios(options);
  const response = await axios.post<number>(url, request);
  return response.data;
}

// export async function put<TRequest = any, TResponse = any>(
//   url: string,
//   body: TRequest
// ): Promise<TResponse> {
//   const response = await api.put<TResponse>(url, body);
//   return response.data;
// }

// export async function apiDelete<TResponse = any>(
//   url: string
// ): Promise<TResponse> {
//   const response = await api.delete<TResponse>(url);
//   return response.data;
// }
