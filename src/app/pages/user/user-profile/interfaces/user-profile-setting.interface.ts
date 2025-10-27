export interface UserProfileSetting {
  fullName?: string;
  email: string;
  bio?: string;
}

export interface VerifyOtpRequest {
  otp: string;
}
