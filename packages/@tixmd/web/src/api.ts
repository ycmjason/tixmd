export type CreateTicketPayload = {
  id: string;
  title: string;
  body: string;
  labels: string[];
  dependencies: string[];
  criteria: string[];
};

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function request<T>(url: string, options: RequestInit): Promise<ApiResult<T>> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) return { ok: false, error: data.error ?? `Server error: ${res.status}` };
  return { ok: true, data };
}

export function createTicket(payload: CreateTicketPayload): Promise<ApiResult<{ id: string }>> {
  return request('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTicket({
  id,
  markdown,
}: {
  id: string;
  markdown: string;
}): Promise<ApiResult<{ id: string }>> {
  return request(`/api/tickets/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({ markdown }),
  });
}

export function deleteTicket({ id }: { id: string }): Promise<ApiResult<{ id: string }>> {
  return request(`/api/tickets/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
