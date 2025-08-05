export interface ResetCredential {
  password: string;
  resetPasswordToken?: string;
}

export interface ForgotCredential {
  email: string;
}
