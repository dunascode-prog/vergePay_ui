import { api } from "@/lib/api";
import { SignupRequest, SignupResponse } from "@/types/auth";

export function signup(data: SignupRequest) {
  return api<SignupResponse>("/v1/auth/sign-up", {
    method: "POST",
    headers: {
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(data),
  });
}
