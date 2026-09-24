import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faSearch } from "@fortawesome/free-solid-svg-icons";

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/20 px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <h1 className="text-9xl font-black text-primary/20 select-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-black text-brown uppercase tracking-widest">Lost?</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-black text-black uppercase">Oops! Page Not Found</h2>
          <p className="text-gray-500 font-bold uppercase tracking-tight text-sm">
            It looks like the path you're looking for was either moved or never existed. 
            Let's get you back to freshness!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link 
            href="/"
            className="bg-primary text-black font-black px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <FontAwesomeIcon icon={faHome} />
            BACK TO HOME
          </Link>
          <Link 
            href="/products"
            className="bg-black text-white font-black px-8 py-4 rounded-xl shadow-lg hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <FontAwesomeIcon icon={faSearch} />
            SHOP PRODUCTS
          </Link>
        </div>
      </div>
    </div>
  );
}
