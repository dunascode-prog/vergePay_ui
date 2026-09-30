import { api } from "@/lib/api";
import { BrokerageLink, Holding, StartLinkResponse, TwoFactorSetup } from "@/types/brokerage";

export async function listBrokerageLinks() {
  return (await api<{ data: BrokerageLink[] }>("/v1/brokerage-links")).data;
}

export async function listHoldings() {
  return (await api<{ data: Holding[] }>("/v1/holdings")).data;
}

/** Needs a 2FA code confirmed in the last few minutes (the API answers 403 TWO_FACTOR_REQUIRED otherwise). */
export function startAlpacaLink() {
  return api<StartLinkResponse>("/v1/brokerage-links", {
    method: "POST",
    body: JSON.stringify({ provider_name: "alpaca" }),
  });
}

/** Starts 2FA setup: a secret for the authenticator app, confirmed with verifyTwoFactor(). */
export function startTwoFactorSetup() {
  return api<TwoFactorSetup>("/v1/auth/2fa/enable", { method: "POST" });
}
