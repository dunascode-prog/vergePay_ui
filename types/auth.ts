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
  /** "YYYY-MM-DD" */
  date_of_birth: string | null;
  present_address: string | null;
  permanent_address: string | null;
  city: string | null;
  postal_code: string | null;
  country_code: string | null;
  timezone: string | null;
  kyc_status: "unverified" | "pending" | "verified" | "rejected";
  two_factor_enabled: boolean;
  default_currency_code: string | null;
  /** An email change waiting for the code sent to this address, or null. */
  pending_email: string | null;
  /** A signed, short-lived link to the profile photo (only ever sent to its owner), or null. */
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

/** What PATCH /v1/users/me accepts (name and date of birth lock once KYC starts). */
export type ProfileUpdate = Partial<
  Pick<UserProfile, "first_name" | "last_name" | "date_of_birth" | "present_address" | "permanent_address" | "city" | "postal_code">
>;
