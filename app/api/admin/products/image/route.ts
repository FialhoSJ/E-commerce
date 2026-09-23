import { randomUUID } from 'node:crypto';
import { getAdminSession } from '@/lib/server/admin-auth';
import { hasSupabaseConfig } from '@/lib/server/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

export async function POST(request: Request) {
  if (!await getAdminSession()) return Response.json({ error: 'Acesso negado.' }, { status: 401 });
  if (!hasSupabaseConfig()) return Response.json({ error: 'Configure o Supabase no servidor.' }, { status: 503 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');
  if (!(file instanceof File)) return Response.json({ error: 'Selecione uma imagem.' }, { status: 400 });
  if (!allowedTypes.has(file.type)) return Response.json({ error: 'Use uma imagem JPG, PNG ou WEBP.' }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) return Response.json({ error: 'A imagem deve ter no máximo 5 MB.' }, { status: 413 });

  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || 'products';
  const extension = allowedTypes.get(file.type);
  if (!baseUrl || !serviceKey || !extension) return Response.json({ error: 'Storage do Supabase não configurado.' }, { status: 503 });

  const objectPath = `catalog/${randomUUID()}.${extension}`;
  try {
    const response = await fetch(`${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath}`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': file.type,
        'x-upsert': 'false',
        'cache-control': '31536000',
      },
      body: await file.arrayBuffer(),
    });
    if (!response.ok) return Response.json({ error: 'Não foi possível enviar a imagem. Verifique o bucket público do Storage.' }, { status: 502 });
    return Response.json({ url: `${baseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${objectPath}` }, { status: 201 });
  } catch {
    return Response.json({ error: 'Não foi possível conectar ao Storage do Supabase.' }, { status: 502 });
  }
}
