import { api } from "@/lib/api";
import { ProfileUpdate, UserProfile } from "@/types/auth";

/** Saves personal details. Name and date of birth are refused (409) once KYC has started. */
export function updateProfile(data: ProfileUpdate) {
  return api<UserProfile>("/v1/users/me", { method: "PATCH", body: JSON.stringify(data) });
}

/**
 * Starts an email change: checks the password (and needs a recent 2FA code
 * if 2FA is on: 403 TWO_FACTOR_REQUIRED), then emails a code to the new address.
 */
export function startEmailChange(data: { new_email: string; password: string }) {
  return api<{ pending_email: string; expires_at: string; message: string }>("/v1/users/me/email", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Confirms the change with the code sent to the new address. */
export function confirmEmailChange(code: string) {
  return api<UserProfile>("/v1/users/me/email/confirm", { method: "POST", body: JSON.stringify({ code }) });
}

export function cancelEmailChange() {
  return api<{ cancelled: boolean }>("/v1/users/me/email", { method: "DELETE" });
}

/** The photo file itself is the body: JPG or PNG, 2 MB at most. */
export function uploadProfilePhoto(file: File) {
  return api<UserProfile>("/v1/users/me/photo", { method: "PUT", headers: { "Content-Type": file.type }, body: file });
}

export function removeProfilePhoto() {
  return api<UserProfile>("/v1/users/me/photo", { method: "DELETE" });
}

/** Turns 2FA off. Needs a code confirmed in the last 5 minutes. */
export function disableTwoFactor() {
  return api<{ two_factor_enabled: false }>("/v1/auth/2fa", { method: "DELETE" });
}
