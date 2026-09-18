import Link from "next/link"
import Cart from "./Cart"
import AccountButton from "./AccountButton"

function Navbar() {
    return (
        <nav className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-slate-200 bg-[#f8faf9]/95 px-6 py-3 text-slate-900 backdrop-blur lg:px-10">
          <Link href="/" className="flex h-12 items-center gap-2 text-sm font-bold tracking-[0.18em]">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950 text-xs text-white">3D</span> STORE
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex"><Link href="/" className="hover:text-slate-950">Empresa</Link><Link href="/loja" className="hover:text-slate-950">Loja</Link><Link href="/#sobre" className="hover:text-slate-950">Sobre nós</Link></div>
          <div className="flex items-center gap-1"><AccountButton /><Cart /></div>
        </nav>
    )
}

export default Navbar;
