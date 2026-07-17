import { api } from "@/lib/api";
import {
  SigninRequest,
  SigninResponse,
  SignupRequest,
  SignupResponse,
} from "@/types/auth";

export function signup(data: SignupRequest) {
  return api<SignupResponse>("/v1/auth/signup", {
    method: "POST",
    // headers: {
    //   "Idempotency-Key": crypto.randomUUID(),
    // },
    body: JSON.stringify(data),
  });
}
export function signin(data: SigninRequest) {
  return api<SigninResponse>("/v1/auth/signin", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}
