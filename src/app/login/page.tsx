"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faKey, faArrowRight, faTriangleExclamation, faCheckCircle, faBolt, faMobileAlt } from "@fortawesome/free-solid-svg-icons";
import { sendOtpAction, verifyOtpAction, directGuestLoginAction } from "@/lib/actions/auth";
import { googleLoginAction } from "@/lib/actions/google-auth";

declare global {
  interface Window {
    google: any;
    google_initialized?: boolean;
  }
}

function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [isInstantLoading, setIsInstantLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleDirectLogin = async () => {
    setIsInstantLoading(true);
    setError("");
    try {
      const res = await directGuestLoginAction("Valued Customer");
      if (res.success) {
        router.push(redirect);
        router.refresh();
      } else {
        setError(res.error || "Direct login failed");
        setIsInstantLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in directly");
      setIsInstantLoading(false);
    }
  };

  const handleGoogleCallback = useCallback(async (response: any) => {
    setIsLoading(true);
    setError("");

    const res = await googleLoginAction(response.credential);

    if (res.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      router.push(redirect);
      router.refresh();
    }
  }, [router, redirect]);

  const renderGoogleButton = useCallback(() => {
    const googleBtnGroup = document.getElementById("googleBtnGroup");
    if (!googleBtnGroup || !window.google) return;
    
    googleBtnGroup.innerHTML = "";
    
    const containerWidth = googleBtnGroup.offsetWidth || 280;
    window.google.accounts.id.renderButton(googleBtnGroup, {
      theme: "outline",
      size: "large",
      width: Math.min(containerWidth, 400),
      text: "continue_with",
      shape: "pill",
    });
  }, []);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

    const initializeGoogle = () => {
      if (!window.google) return;

      if (!window.google_initialized) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.google_initialized = true;
      }

      setTimeout(renderGoogleButton, 100);
    };

    if (window.google) {
      initializeGoogle();
    } else {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogle;
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener("load", initializeGoogle);
      }
    }
  }, [handleGoogleCallback, renderGoogleButton, step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    const res = await sendOtpAction(email);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("We've sent a verification code to your email.");
      setStep("otp");
    }
    
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!otp) {
      setError("Please enter the verification code.");
      setIsLoading(false);
      return;
    }

    const res = await verifyOtpAction(email, otp);

    if (res.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      router.push(redirect);
      router.refresh();
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-900 py-12 px-4 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-gray-100 relative overflow-hidden">
          
          <div className="text-center mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl mx-auto mb-3 shadow-md">
              <FontAwesomeIcon icon={faMobileAlt} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">My Shop Mobiles</h1>
            <p className="text-gray-500 font-bold text-xs">Fast Sign-In &amp; Instant Cart Access</p>
          </div>

          {/* ⚡ DIRECT 1-CLICK INSTANT LOGIN BUTTON */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 border border-amber-500/20 text-center">
            <p className="text-xs font-black text-slate-800 mb-2.5">
              ⚡ Instant 1-Click Access (No Email / OTP needed)
            </p>
            <button
              onClick={handleDirectLogin}
              disabled={isInstantLoading}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faBolt} className="text-base" />
              <span>{isInstantLoading ? "Entering Store..." : "Direct 1-Click Login"}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Or use email code</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3.5 rounded-xl mb-4 flex items-start gap-2.5 border border-red-100 text-xs font-bold">
              <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3.5 rounded-xl mb-4 flex items-start gap-2.5 border border-green-100 text-xs font-bold">
              <FontAwesomeIcon icon={faCheckCircle} className="mt-0.5" />
              <p>{success}</p>
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="relative z-10">
              <div className="mb-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-1.5 block">
                  Email Address
                </label>
                <div className="relative group">
                  <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 focus:border-slate-900 focus:bg-white rounded-xl py-3.5 pl-11 pr-4 text-black text-sm font-bold outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <span>{isLoading ? "Sending Code..." : "Send Verification Code"}</span>
                {!isLoading && <FontAwesomeIcon icon={faArrowRight} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="relative z-10">
              <div className="mb-4">
                <div className="flex justify-between items-end mb-1.5 ml-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">
                    Enter 6-Digit Code
                  </label>
                  <button 
                    type="button" 
                    onClick={() => { setStep("email"); setOtp(""); setSuccess(""); setError(""); }}
                    className="text-[10px] font-bold text-indigo-600 hover:underline uppercase"
                  >
                    Change Email
                  </button>
                </div>
                <div className="relative group">
                  <FontAwesomeIcon icon={faKey} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-slate-900 transition-colors" />
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 focus:border-slate-900 focus:bg-white rounded-xl py-3.5 pl-11 pr-4 text-black font-black text-center tracking-[0.4em] outline-none transition-all"
                    placeholder="------"
                    maxLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <span>{isLoading ? "Verifying..." : "Verify & Enter"}</span>
                {!isLoading && <FontAwesomeIcon icon={faArrowRight} />}
              </button>
            </form>
          )}

          <div className="mt-6 text-center relative z-10 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-center min-h-[44px]">
              <div id="googleBtnGroup" className="w-[280px] sm:w-[350px]"></div>
            </div>

            <div className="mt-4">
              <Link href="/products" className="text-xs font-bold text-gray-500 hover:text-slate-900 hover:underline">
                ← Continue browsing phones as Guest
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
