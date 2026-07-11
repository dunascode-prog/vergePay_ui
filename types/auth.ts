export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupResponse {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
}
