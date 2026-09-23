import { getAdminSession } from '@/lib/server/admin-auth';
import { getCatalogProducts } from '@/lib/server/catalog';
import { getFakeStoreProducts } from '@/lib/server/fake-products';
import { hasSupabaseConfig } from '@/lib/server/supabase';
import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect('/auth?redirect=/admin');
  const databaseReady = hasSupabaseConfig();
  const products = databaseReady ? await getCatalogProducts(true) : [];
  const fakeProducts = await getFakeStoreProducts();
  return <AdminDashboard initialProducts={products} fakeProducts={fakeProducts} databaseReady={databaseReady} />;
}
