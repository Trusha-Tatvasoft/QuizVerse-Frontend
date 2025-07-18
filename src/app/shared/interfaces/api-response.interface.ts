/**
 * Generic API response interface
 */
export interface ApiResponse<T> {
  result: boolean;
  message: string;
  data: T;
}
