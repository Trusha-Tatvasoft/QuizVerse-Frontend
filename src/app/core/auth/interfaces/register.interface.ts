/**
 * Interface for register credentials
 */
export interface RegisterCredential {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  bio?: string;
}
