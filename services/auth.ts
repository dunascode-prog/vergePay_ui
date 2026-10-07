import { api } from "@/lib/api";
import {
  SigninRequest,
  SigninResponse,
  SignupRequest,
  SignupResponse,
  TwoFactorVerifyResponse,
  UserProfile,
} from "@/types/auth";

export function signup(data: SignupRequest) {
  return api<SignupResponse>("/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function signin(data: SigninRequest) {
  return api<SigninResponse>("/v1/auth/signin", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Finishes a 2FA sign-in: upgrades the limited session to a full one. */
export function verifyTwoFactor(code: string) {
  return api<TwoFactorVerifyResponse>("/v1/auth/2fa/verify", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

/** Revokes the refresh token and clears both cookies. Safe with no session. */
export function signout() {
  return api<{ success: boolean }>("/v1/auth/logout", { method: "POST" });
}

/** Emails a 6-digit reset code if the address has an account. Always the same answer. */
export function requestPasswordReset(email: string) {
  return api<{ message: string }>("/v1/auth/password/forgot", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** Sets a new password with the emailed code. Signs the account out everywhere. */
export function resetPassword(data: { email: string; code: string; password: string; confirmPassword: string }) {
  return api<{ message: string }>("/v1/auth/password/reset", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMe() {
  return api<UserProfile>("/v1/users/me");
}
