// Browser-side client for the VergePay API. Requests go to /v1/* on this
// app's origin (rewritten to the API in next.config.ts), so the session
// cookies travel with them and JavaScript never touches a token.

/** The `error` object of the API's failure envelope: `{ status: "failed", error }`. */
export interface ApiErrorBody {
  code: string;
  message: string;
  /** Set on CONFLICT errors, e.g. "email" when the email is taken. */
  field?: string;
  /** Set on VALIDATION_ERROR: field name → messages. */
  details?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly field?: string;
  readonly details?: unknown;

  constructor(status: number, body?: Partial<ApiErrorBody>) {
    super(body?.message ?? "Something went wrong. Please try again.");
    this.name = "ApiError";
    this.status = status;
    this.code = body?.code ?? "NETWORK_ERROR";
    this.field = body?.field;
    this.details = body?.details;
  }

  /** Messages for individual form fields, from a VALIDATION_ERROR or a CONFLICT. */
  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    if (this.field) out[this.field] = this.message;
    if (this.details && typeof this.details === "object") {
      for (const [field, value] of Object.entries(this.details)) {
        const message = Array.isArray(value) ? value[0] : value;
        if (typeof message === "string") out[field] = message;
      }
    }
    return out;
  }
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Refresh tokens work once, so parallel requests that all find the session
// expired must share one refresh; a second refresh would fail and sign the
// user out.
let refreshing: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
  refreshing ??= fetch("/v1/auth/refresh", { method: "POST" })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

function toSignin() {
  const next = window.location.pathname + window.location.search;
  window.location.assign(`/signin?next=${encodeURIComponent(next)}`);
}

export async function api<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const send = () =>
    fetch(endpoint, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

  let response: Response;
  try {
    response = await send();
  } catch {
    throw new ApiError(0, { message: "Can't reach VergePay. Check your connection and try again." });
  }

  // The access cookie expires with its token, after which the API answers
  // 401 (no token, or TOKEN_EXPIRED). Refresh once and retry. Auth endpoints
  // are excluded: a 401 from sign-in means a wrong password, not an old session.
  if (response.status === 401 && !endpoint.startsWith("/v1/auth/")) {
    if (await refreshSession()) {
      response = await send();
    }
    if (response.status === 401) {
      toSignin();
    }
  }

  const body = await readBody(response);
  if (!response.ok) {
    const error = (body as { error?: Partial<ApiErrorBody> } | null)?.error;
    throw new ApiError(response.status, error);
  }
  return body as T;
}
