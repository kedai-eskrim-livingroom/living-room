"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginUser, getUser } from "@/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser({ email, password });

      const user = getUser();
      const role = user?.role;

      if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (role === "PENJAGA") {
        router.push("/penjaga/order");
      } else {
        setError("Role tidak dikenali. Hubungi administrator.");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Email atau password salah. Silakan coba lagi.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-white flex items-center justify-center overflow-hidden font-poppins">
      {/* Background gradient blob bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-[45vh] pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% 110%, #FDDBB4 0%, #FCD4A0 30%, rgba(255,215,160,0) 70%)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-[420px] px-5 gap-7">
        {/* Logo */}
        <div className="flex justify-center items-center">
          <Image
            src="/logo.png"
            alt="Livingroom Logo"
            width={220}
            height={60}
            className="object-contain"
            priority
          />
        </div>

        {/* Card */}
        <div className="w-full bg-[#FEF0DC] rounded-[20px] border-[1.5px] border-[#F37021] px-6 pt-7 pb-8 box-border">
          <h1 className="text-[22px] font-bold text-[#1A1A1A] mb-5 leading-tight">
            Login
          </h1>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[13px] font-medium text-[#1A1A1A]">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3.5 py-3 rounded-[10px] border-[1.5px] border-transparent bg-[#F5F5F5] text-sm text-[#1A1A1A] outline-none transition-all duration-200 focus:border-[#F37021] focus:shadow-[0_0_0_3px_rgba(243,112,33,0.15)] font-poppins"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[13px] font-medium text-[#1A1A1A]">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-3.5 py-3 rounded-[10px] border-[1.5px] border-transparent bg-[#F5F5F5] text-sm text-[#1A1A1A] outline-none transition-all duration-200 focus:border-[#F37021] focus:shadow-[0_0_0_3px_rgba(243,112,33,0.15)] font-poppins"
              />
            </div>

            {/* Error message */}
            {error && (
              <p className="text-[13px] text-[#D94F00] m-0 px-3 py-2 bg-[rgba(217,79,0,0.08)] rounded-lg">
                {error}
              </p>
            )}

            {/* Submit button */}
            <button
              id="btn-login"
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 mt-1 rounded-xl border-none bg-[#F37021] text-white text-[15px] font-semibold tracking-wide transition-all duration-200 font-poppins
                ${loading ? "opacity-75 cursor-not-allowed" : "cursor-pointer hover:bg-[#d95e0f] active:scale-[0.98]"}`}
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
