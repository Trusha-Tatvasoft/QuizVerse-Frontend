/**
 * Generic API response interface
 */
export interface ApiResponse<T> {
  result: boolean;
  statusCode: number;
  message: string;
  data: T;
}
