export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
export interface SigninRequest {
  email: string;
  password: string;
}
export interface SigninResponse {
  success: boolean;
  message: string;
  user: {
    user_id: string;
    email: string;
  };
}

export interface SignupResponse {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface testResponse {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
