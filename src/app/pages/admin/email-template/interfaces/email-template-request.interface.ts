export interface EmailTemplatesRequest {
  id: number;
  templateType: number;
  title: string;
  subject: string;
  body: string | null;
  status?: boolean; // true = Active, false = Inactive
}
