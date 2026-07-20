const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function api<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const data = await response.json();

  if (!response.ok) {
    throw data;
  }
  return data;
}

export async function refreshAccessToken(): Promise<boolean> {
  const response = await fetch(`${baseUrl}/v1/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  return response.ok;
}
export async function apiFetch(
  endpoint: string,
  options?: RequestInit,
): Promise<Response> {
  const request = () =>
    fetch(`${baseUrl}${endpoint}`, {
      ...options,
      credentials: "include",
    });

  const response = await request();

  if (response.status !== 401) {
    return response;
  }

  const refreshed = await refreshAccessToken();

  if (!refreshed) {
    throw new Error("Session expired");
  }

  return request();
}
