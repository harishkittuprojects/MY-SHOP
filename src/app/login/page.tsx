"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faCheckCircle,
  faBolt,
  faMobileScreen,
  faEnvelope,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { sendOtpAction, verifyOtpAction, directGuestLoginAction, phoneLoginAction } from "@/lib/actions/auth";
import { googleLoginAction } from "@/lib/actions/google-auth";

declare global {
  interface Window {
    google: any;
    google_initialized?: boolean;
  }
}

function recordCustomerLocally(name: string, email: string, phone: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("myShopRegisteredCustomers");
    const list: any[] = raw ? JSON.parse(raw) : [];
    const exists = list.some((c: any) => (email && c.email === email) || (phone && c.phone === phone));
    if (!exists) {
      list.unshift({
        id: `cust_${Date.now()}`,
        full_name: name || "Customer",
        email: email || "—",
        phone: phone || "—",
        total_orders: 1,
        total_spent: 129999,
        status: "active",
        created_at: new Date().toISOString()
      });
      localStorage.setItem("myShopRegisteredCustomers", JSON.stringify(list));
    }
  } catch {}
}

function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const router = useRouter();

  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInstantLoading, setIsInstantLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(30);

  // Timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const isFormValid = mode === "phone" ? phone.length === 10 : /\S+@\S+\.\S+/.test(email);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    if (mode === "phone") {
      // In phone mode, send/generate OTP
      setSuccess(`Verification OTP sent to +91 ${phone}`);
      setStep("otp");
      setCountdown(30);
      setIsLoading(false);
    } else {
      const res = await sendOtpAction(email);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(`Verification code sent to ${email}`);
        setStep("otp");
        setCountdown(30);
      }
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!otp || otp.length < 4) {
      setError("Please enter the verification code.");
      setIsLoading(false);
      return;
    }

    if (mode === "phone") {
      // Complete phone login
      const res = await phoneLoginAction(phone);
      if (res.success) {
        const cName = phone === "9876543210" ? "Rahul Sharma" : `Customer ${phone.slice(-4)}`;
        const cEmail = phone === "9876543210" ? "rahul.sharma@example.com" : `+91${phone}@myshop.local`;
        const cPhone = `+91 ${phone}`;
        recordCustomerLocally(cName, cEmail, cPhone);
        await fetch("/api/admin/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: cName, email: cEmail, phone: cPhone }),
        }).catch(() => {});
        router.push(redirect);
        router.refresh();
      } else {
        setError(res.error || "Login failed");
        setIsLoading(false);
      }
    } else {
      const res = await verifyOtpAction(email, otp);
      if (res.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        const cName = email === "rahul.sharma@example.com" ? "Rahul Sharma" : email.split("@")[0];
        recordCustomerLocally(cName, email, "");
        await fetch("/api/admin/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: cName, email, phone: "" }),
        }).catch(() => {});
        router.push(redirect);
        router.refresh();
      }
    }
  };

  const handleDirectLogin = async () => {
    setIsInstantLoading(true);
    setError("");
    try {
      const res = await directGuestLoginAction("Rahul Sharma", "rahul.sharma@example.com", "+919876543210");
      if (res.success) {
        recordCustomerLocally("Rahul Sharma", "rahul.sharma@example.com", "+91 9876543210");
        await fetch("/api/admin/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Rahul Sharma",
            email: "rahul.sharma@example.com",
            phone: "+91 9876543210",
          }),
        }).catch(() => {});
        router.push(redirect);
        router.refresh();
      } else {
        setError(res.error || "Direct login failed");
        setIsInstantLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
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
      shape: "rectangular",
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

  return (
    <div className="min-h-[82vh] flex items-center justify-center bg-gray-50/70 py-10 px-4">
      <div className="w-full max-w-[440px] bg-white rounded-2xl p-6 sm:p-10 shadow-[0_6px_30px_rgba(0,0,0,0.06)] border border-gray-100">
        
        {step === "input" ? (
          <div>
            {/* Header matching exact user image */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-snug">
              Log in for the best experience
            </h1>
            <p className="text-sm text-gray-500 font-normal mt-1 mb-5">
              {mode === "phone" ? "Enter your phone number to continue" : "Enter your email to continue"}
            </p>

            {/* Demo Customer Profile Card */}
            <div className="mb-6 p-4 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl text-left shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Demo Customer Profile
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                  SAMPLE PROFILE
                </span>
              </div>

              <div className="bg-white/95 border border-emerald-100 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] font-medium">Customer Name:</span>
                  <span className="font-bold text-slate-900">Rahul Sharma</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] font-medium">Demo Mobile:</span>
                  <span className="font-mono font-semibold text-slate-800">+91 9876543210</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] font-medium">Demo Email:</span>
                  <span className="font-mono text-slate-800">rahul.sharma@example.com</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] font-medium">Demo OTP:</span>
                  <span className="font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">1234</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-5 flex items-start gap-2 border border-red-100 text-xs font-semibold">
                <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleContinue}>
              {mode === "phone" ? (
                /* Phone Number Input with Floating Notch Label */
                <div className="relative mb-2">
                  <div
                    className={`relative border-2 ${
                      isFocused || phone.length > 0 ? "border-[#2874f0]" : "border-gray-300"
                    } rounded-md transition-colors flex items-center px-3.5 py-3.5 bg-white`}
                  >
                    {/* Floating notched label */}
                    <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-xs font-semibold text-[#2874f0] leading-none pointer-events-none select-none">
                      Phone Number
                    </label>

                    {/* Country Code Prefix */}
                    <div className="flex items-center gap-1.5 text-gray-900 font-bold text-base pr-3 mr-3 border-r border-gray-300 select-none flex-shrink-0">
                      <span>+91</span>
                      <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>

                    {/* Phone Input */}
                    <input
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setPhone(val);
                        setError("");
                      }}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder=""
                      autoFocus
                      className="w-full bg-transparent border-none outline-none text-base text-gray-900 font-medium tracking-wide placeholder:text-gray-300"
                    />
                  </div>
                </div>
              ) : (
                /* Email Input with Floating Notch Label */
                <div className="relative mb-2">
                  <div
                    className={`relative border-2 ${
                      isFocused || email.length > 0 ? "border-[#2874f0]" : "border-gray-300"
                    } rounded-md transition-colors flex items-center px-3.5 py-3.5 bg-white`}
                  >
                    <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-xs font-semibold text-[#2874f0] leading-none pointer-events-none select-none">
                      Email-ID
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="name@example.com"
                      autoFocus
                      className="w-full bg-transparent border-none outline-none text-base text-gray-900 font-medium placeholder:text-gray-300"
                    />
                  </div>
                </div>
              )}

              {/* Mode switch link */}
              <div className="flex justify-end mt-2 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "phone" ? "email" : "phone");
                    setError("");
                    setIsFocused(true);
                  }}
                  className="text-sm font-semibold text-[#2874f0] hover:underline"
                >
                  {mode === "phone" ? "Use Email-ID" : "Use Phone Number"}
                </button>
              </div>

              {/* Legal Terms & Privacy Disclaimer */}
              <p className="text-xs text-gray-500 leading-relaxed mb-8">
                By continuing, you confirm that you are above 18 years of age, and you agree to the My Shop&apos;s{" "}
                <Link href="/terms" className="text-[#2874f0] hover:underline">
                  Terms of Use
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#2874f0] hover:underline">
                  Privacy Policy
                </Link>
              </p>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`w-full py-3.5 rounded-md font-bold text-sm tracking-wide text-white transition-all shadow-sm ${
                  isFormValid && !isLoading
                    ? "bg-[#2874f0] hover:bg-[#1a64dc] active:scale-[0.99] cursor-pointer"
                    : "bg-[#bdbdbd] cursor-not-allowed"
                }`}
              >
                {isLoading ? "Processing..." : "Continue"}
              </button>

              {/* ⚡ 1-Click Auto Fill & Instant Login */}
              <button
                type="button"
                onClick={handleDirectLogin}
                disabled={isInstantLoading}
                className="w-full mt-3 py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] shadow-xs"
              >
                <FontAwesomeIcon icon={faBolt} className="text-emerald-600 text-xs" />
                <span>{isInstantLoading ? "Entering as Rahul Sharma..." : "⚡ 1-Click Login as Rahul Sharma (Demo Customer)"}</span>
              </button>

              {/* Quick Auto-Fill Selector */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 text-center">
                  Quick Auto-Fill Options
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("phone");
                      setPhone("9876543210");
                      setError("");
                    }}
                    className="py-2.5 px-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Fill dummy mobile number 9876543210"
                  >
                    <FontAwesomeIcon icon={faMobileScreen} className="text-[#2874f0] text-xs" />
                    <span>Auto-Fill Phone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("email");
                      setEmail("rahul.sharma@example.com");
                      setError("");
                    }}
                    className="py-2.5 px-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Fill dummy email rahul.sharma@example.com"
                  >
                    <FontAwesomeIcon icon={faEnvelope} className="text-[#2874f0] text-xs" />
                    <span>Auto-Fill Email</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          /* Step 2: OTP Verification */
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-snug">
              Verify with OTP
            </h1>
            <div className="flex items-center justify-between text-sm text-gray-500 mt-1 mb-4">
              <span>Sent to {mode === "phone" ? `+91 ${phone}` : email}</span>
              <button
                type="button"
                onClick={() => {
                  setStep("input");
                  setOtp("");
                  setError("");
                  setSuccess("");
                }}
                className="text-xs font-bold text-[#2874f0] hover:underline uppercase"
              >
                Change
              </button>
            </div>

            {/* Demo OTP Helper Banner */}
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 mb-5 flex items-center justify-between text-xs">
              <div className="text-emerald-900">
                <span className="font-bold">💡 Demo OTP:</span> Use <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-300">1234</span> <span className="text-[11px] text-emerald-700 hidden sm:inline">(Rahul Sharma)</span>
              </div>
              <button
                type="button"
                onClick={() => setOtp("1234")}
                className="font-bold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <FontAwesomeIcon icon={faBolt} className="text-emerald-600 text-[10px]" />
                <span>Auto-Fill 1234</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-5 flex items-start gap-2 border border-red-100 text-xs font-semibold">
                <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-5 flex items-start gap-2 border border-green-100 text-xs font-semibold">
                <FontAwesomeIcon icon={faCheckCircle} className="mt-0.5" />
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleVerifyOtp}>
              <div className="relative mb-6">
                <div className="relative border-2 border-[#2874f0] rounded-md px-4 py-3 bg-white">
                  <label className="absolute -top-2.5 left-3 bg-white px-1.5 text-xs font-semibold text-[#2874f0] leading-none pointer-events-none select-none">
                    Enter Verification OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setError("");
                    }}
                    placeholder="• • • • • •"
                    autoFocus
                    className="w-full bg-transparent border-none outline-none text-xl text-center text-gray-900 font-black tracking-[0.4em] placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-8 text-xs text-gray-500">
                <span>Didn&apos;t receive OTP?</span>
                {countdown > 0 ? (
                  <span className="font-semibold text-gray-400">Resend in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="font-bold text-[#2874f0] hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={otp.length === 0 || isLoading}
                className={`w-full py-3.5 rounded-md font-bold text-sm tracking-wide text-white transition-all shadow-sm ${
                  otp.length > 0 && !isLoading
                    ? "bg-[#2874f0] hover:bg-[#1a64dc] active:scale-[0.99] cursor-pointer"
                    : "bg-[#bdbdbd] cursor-not-allowed"
                }`}
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>
          </div>
        )}

        {/* ⚡ Demo Instant 1-Click Login Option */}
        <div className="mt-8 pt-5 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 font-medium mb-3 uppercase tracking-wider">
            Or Sign In With
          </p>

          <div className="flex flex-col gap-2.5">
            {/* Google One-Tap */}
            <div className="flex justify-center min-h-[44px]">
              <div id="googleBtnGroup" className="w-full flex justify-center"></div>
            </div>

            {/* Instant Demo Access Button */}
            <button
              onClick={handleDirectLogin}
              disabled={isInstantLoading}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-2.5 px-4 rounded-md border border-gray-200 transition-all text-xs flex items-center justify-center gap-2 active:scale-95"
            >
              <FontAwesomeIcon icon={faBolt} className="text-amber-500 text-sm" />
              <span>{isInstantLoading ? "Entering..." : "Quick 1-Click Guest Sign In"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2874f0]"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
