export interface AdminUserProfileFormData {
  fullName: string;
  userName: string;
  email: string;
  bio?: string;
  profilePic?: string;
}

export interface AdminProfileUpdatedData {
  fullName: string;
  userName: string;
  email: string;
  bio?: string;
}
