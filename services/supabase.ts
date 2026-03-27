const baseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const hasSupabaseConfig = Boolean(baseUrl && anonKey);

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH';
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  prefer?: string;
}

export async function requestSupabase<T>(table: string, options: RequestOptions = {}) {
  if (!baseUrl || !anonKey) {
    return { data: null as T | null, error: new Error('Missing Supabase configuration') };
  }

  const params = new URLSearchParams();
  Object.entries(options.query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });

  const url = `${baseUrl}/rest/v1/${table}${params.toString() ? `?${params.toString()}` : ''}`;
  try {
    const res = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        ...(options.prefer ? { Prefer: options.prefer } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!res.ok) {
      return { data: null as T | null, error: new Error(await res.text()) };
    }

    if (res.status === 204) return { data: null as T | null, error: null };
    const text = await res.text();
    return { data: (text ? JSON.parse(text) : null) as T | null, error: null };
  } catch (error) {
    return { data: null as T | null, error: error as Error };
  }
}
