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
  console.log(data);
  if (!response.ok) {
    throw data;
  }
  return data;
}
