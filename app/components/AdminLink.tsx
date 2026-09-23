import Link from "next/link";
import { getAdminSession } from "@/lib/server/admin-auth";
import AdminSignOut from "./AdminSignOut";

export default async function AdminLink() {
  const session = await getAdminSession();
  return session ? <span className="inline-flex items-center"><Link href="/admin" className="font-semibold text-teal-700 hover:text-teal-900">Admin</Link><AdminSignOut /></span> : null;
}
