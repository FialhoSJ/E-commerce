import { getAdminSession } from '@/lib/server/admin-auth';
import NavbarClient from './NavbarClient';

export default async function Navbar() {
  const session = await getAdminSession();
  return <NavbarClient isAdmin={Boolean(session)} />;
}
