import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white gap-8">
      <div className="relative w-24 h-24">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
        {/* Animated Inner Ring */}
        <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-28 h-28">
          <Image 
            src="/my-shop-logo.png" 
            alt="MY SHOP Logo" 
            fill 
            className="object-contain animate-pulse"
            priority
            sizes="112px"
          />
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.5em] pl-[0.5em]">
          Loading Store...
        </p>
      </div>
    </div>
  );
}
