import React, { useState } from "react";
import { Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/backendClient";
import EinsteinLogo from "@/components/EinsteinLogo";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }

    if (mode === "register" && !name.trim()) {
      setError("Enter your name to create an account.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = mode === "register"
        ? await authApi.register({ name: name.trim(), email: trimmedEmail, password })
        : await authApi.login({ email: trimmedEmail, password });

      const user = result.user || result;
      const token = result.session?.token;
      localStorage.setItem("einstein_auth_user", JSON.stringify(user));
      if (token) localStorage.setItem("einstein_auth_token", token);
      localStorage.setItem("einstein_customer_email", user.email);
      localStorage.setItem("einstein_lang", user.preferred_language || localStorage.getItem("einstein_lang") || "ar");
      localStorage.setItem("einstein_is_provider", user.role === "provider" ? "true" : "false");

      if (user.role === "admin") {
        navigate("/Dashboard", { replace: true });
      } else if (user.role === "provider") {
        navigate("/ProviderDashboard", { replace: true });
      } else {
        navigate("/CustomerDashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Unable to sign in. Please check your details.");
    } finally {
      setLoading(false);
    }
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

          <form className="w-full" onSubmit={handleSubmit} noValidate>
            {mode === "register" && (
              <div className="mb-[27px]">
                <label htmlFor="auth-name" className="mb-[13px] block text-center text-[16px] font-bold text-[#334155]">
                  Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (error) setError("");
                  }}
                  className="h-[60px] w-full rounded-[13px] border border-[#dae5f4] bg-[#e8f0fd] px-4 text-[16px] text-black outline-none transition placeholder:text-[#7b8ca4] focus:border-[#b5c7e5] focus:ring-2 focus:ring-[#d5e2f5]"
                  autoComplete="name"
                  aria-invalid={Boolean(error)}
                />
              </div>
            )}

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
              disabled={loading}
              className="h-[62px] w-full rounded-[13px] bg-[#111827] text-[18px] font-bold text-white transition hover:bg-[#1f2937] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-2"
            >
              {loading ? "Please wait..." : mode === "register" ? "Create account" : "Sign in"}
            </button>

            <div className="mt-[17px] flex w-full items-center justify-between gap-4 text-[15px] leading-5">
              <a
                href="mailto:info@einsteindienstleistung.de?subject=Passwort%20zur%C3%BCcksetzen"
                className="font-semibold text-[#60718d] transition hover:text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#94a3b8] focus:ring-offset-2"
              >
                Forgot password?
              </a>
              <p className="text-[#60718d]">
                Need an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode((current) => current === "login" ? "register" : "login");
                    setError("");
                  }}
                  className="font-bold text-[#334155] transition hover:text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#94a3b8] focus:ring-offset-2"
                >
                  {mode === "login" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
