'use client';

import { useRouter } from "next/navigation";

export default function AdminSignOut() {
  const router = useRouter();
  const signOut = async () => {
    await fetch("/api/auth/admin", { method: "DELETE" });
    router.push("/");
    router.refresh();
  };
  return <button onClick={signOut} className="ml-2 text-xs text-slate-500 hover:text-slate-950">Sair</button>;
}
