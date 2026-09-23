type SupabaseResponse<T> = T;

export function hasSupabaseConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<SupabaseResponse<T>> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase não configurado.');
  const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...init.headers },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Supabase respondeu ${response.status}.`);
  return response.json() as Promise<T>;
}
