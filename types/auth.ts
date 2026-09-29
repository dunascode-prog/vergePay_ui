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
  /** True when the account has 2FA on: the session is limited until a code is verified. */
  two_factor_required: boolean;
  user: {
    user_id: string;
    username: string;
    email: string;
    kyc_status: string;
  };
}

export interface SignupResponse {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface TwoFactorVerifyResponse {
  two_factor_enabled: boolean;
  setup_completed: boolean;
  two_factor_verified_at: string;
}

/** GET /v1/users/me */
export interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  kyc_status: string;
  two_factor_enabled: boolean;
  default_currency_code: string | null;
  created_at: string;
}
