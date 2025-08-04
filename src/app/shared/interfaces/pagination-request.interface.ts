// Represents the structure for pagination, sorting, filtering, and search parameters used in API requests.
export interface PaginationRequest {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortColumn?: string;
  sortDescending: boolean;
  filters?: { [key: string]: number };
}
