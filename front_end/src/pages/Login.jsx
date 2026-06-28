import React, { useState } from "react";
import { Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EinsteinLogo from "@/components/EinsteinLogo";
import { createMockAdminSession } from "@/lib/mockAuth";

function GoogleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.74-.07-1.45-.19-2.14H12v4.05h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.44Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.24-2.51c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.41 13.9A6 6 0 0 1 6.1 12c0-.66.11-1.3.31-1.9V7.51H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.49l3.34-2.59Z" />
      <path fill="#EA4335" d="M12 5.98c1.47 0 2.79.51 3.82 1.5l2.87-2.87A9.64 9.64 0 0 0 12 2 10 10 0 0 0 3.07 7.51l3.34 2.59C7.21 7.74 9.4 5.98 12 5.98Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#1877F2" />
      <path fill="#fff" d="M13.62 18.5v-5.73h1.94l.29-2.24h-2.23V9.1c0-.65.18-1.09 1.12-1.09h1.2v-2a16.3 16.3 0 0 0-1.75-.09c-1.73 0-2.91 1.05-2.91 2.99v1.67H9.32v2.24h1.96v5.73h2.34Z" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password.trim()) {
      setError("Enter any email and password to continue.");
      return;
    }

    createMockAdminSession(trimmedEmail);
    navigate("/", { replace: true });
  };

  return (
    <main className="min-h-dvh bg-[#f4f7fb] px-4 py-5 text-[#111827] [letter-spacing:0]">
      <section className="mx-auto min-h-[calc(100dvh-2.5rem)] w-full max-w-[560px] overflow-hidden rounded-[18px] border-t-[5px] border-[#dbe7f5] bg-white shadow-[0_22px_70px_rgba(15,23,42,0.12)]">
        <div className="mx-auto flex w-full max-w-[460px] flex-col items-center px-4 pb-10 pt-[54px] sm:px-0">
          <div className="mb-10 flex h-[122px] w-[122px] items-center justify-center rounded-full bg-white shadow-[0_18px_42px_rgba(15,23,42,0.16)]">
            <EinsteinLogo size={118} />
          </div>

          <h1 className="mb-[14px] max-w-[430px] text-center text-[38px] font-extrabold leading-[1.16] text-[#111827] [letter-spacing:0]">
            Welcome to EinStein Institut
          </h1>
          <p className="mb-[42px] text-center text-[19px] font-semibold text-[#66758c]">
            Sign in to continue
          </p>

          <div className="flex w-full flex-col gap-4">
            <button
              type="button"
              className="flex h-[68px] w-full items-center justify-center gap-[17px] rounded-[13px] border border-[#dfe7f1] bg-white text-[19px] font-semibold text-[#334155] transition hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#94a3b8] focus:ring-offset-2"
              aria-label="Continue with Google"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <button
              type="button"
              className="flex h-[66px] w-full items-center justify-center gap-[17px] rounded-[13px] border border-[#dfe7f1] bg-white text-[19px] font-semibold text-[#334155] transition hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#94a3b8] focus:ring-offset-2"
              aria-label="Continue with Facebook"
            >
              <FacebookIcon />
              Continue with Facebook
            </button>
          </div>

          <div className="my-[38px] flex w-full items-center gap-4">
            <div className="h-px flex-1 bg-[#dbe3ee]" />
            <span className="text-[14px] font-bold uppercase text-[#96a5ba]">OR</span>
            <div className="h-px flex-1 bg-[#dbe3ee]" />
          </div>

          <form className="w-full" onSubmit={handleSubmit} noValidate>
            <div className="mb-[27px]">
              <label htmlFor="auth-email" className="mb-[13px] block text-center text-[16px] font-bold text-[#334155]">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-[15px] top-1/2 h-5 w-5 -translate-y-1/2 text-[#8ea0b7]" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError("");
                  }}
                  className="h-[60px] w-full rounded-[13px] border border-[#dae5f4] bg-[#e8f0fd] pl-[49px] pr-4 text-[16px] text-black outline-none transition placeholder:text-[#7b8ca4] focus:border-[#b5c7e5] focus:ring-2 focus:ring-[#d5e2f5]"
                  autoComplete="email"
                  aria-invalid={Boolean(error)}
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="auth-password" className="mb-[13px] block text-center text-[16px] font-bold text-[#334155]">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-[15px] top-1/2 h-5 w-5 -translate-y-1/2 text-[#8ea0b7]" />
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError("");
                  }}
                  className="h-[60px] w-full rounded-[13px] border border-[#dae5f4] bg-[#e8f0fd] pl-[49px] pr-4 text-[16px] text-black outline-none transition placeholder:text-[#7b8ca4] focus:border-[#b5c7e5] focus:ring-2 focus:ring-[#d5e2f5]"
                  autoComplete="current-password"
                  aria-invalid={Boolean(error)}
                />
              </div>
            </div>

            {error && (
              <p className="mb-4 rounded-[10px] bg-red-50 px-4 py-3 text-center text-[14px] font-semibold text-red-700" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="h-[62px] w-full rounded-[13px] bg-[#111827] text-[18px] font-bold text-white transition hover:bg-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-2"
            >
              Sign in
            </button>

            <div className="mt-[17px] flex w-full items-center justify-between gap-4 text-[15px] leading-5">
              <button
                type="button"
                className="font-semibold text-[#60718d] transition hover:text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#94a3b8] focus:ring-offset-2"
              >
                Forgot password?
              </button>
              <p className="text-[#60718d]">
                Need an account?{" "}
                <button
                  type="button"
                  className="font-bold text-[#334155] transition hover:text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#94a3b8] focus:ring-offset-2"
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
