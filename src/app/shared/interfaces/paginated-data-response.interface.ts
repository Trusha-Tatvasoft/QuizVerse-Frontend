// Represents a paginated response containing total records and an array of generic type records.
export interface PaginatedDataResponse<T> {
  totalRecords: number;
  records: T[];
}
