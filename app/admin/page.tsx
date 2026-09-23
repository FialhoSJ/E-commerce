import { getAdminSession } from '@/lib/server/admin-auth';
import { getCatalogProducts } from '@/lib/server/catalog';
import { hasSupabaseConfig } from '@/lib/server/supabase';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect('/auth?redirect=/admin');
  const databaseReady = hasSupabaseConfig();
  const products = databaseReady ? await getCatalogProducts(true) : [];
  return <AdminClient initialProducts={products} databaseReady={databaseReady} />;
}
