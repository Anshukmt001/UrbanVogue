"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, MapPin } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/Navbar";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-background text-foreground min-h-svh flex items-center justify-center px-6 pt-24 pb-16">
        <div className="w-full grid lg:grid-cols-2 max-w-5xl border border-border bg-card clip-notch overflow-hidden">
          {/* Editorial panel */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-background border-b lg:border-b-0 lg:border-r border-border relative overflow-hidden">
            <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden />
            <div className="relative">
              <p className="font-headline text-2xl tracking-[0.04em] uppercase">
                Urban <span className="font-editorial italic text-primary normal-case font-medium">Vogue</span>
              </p>
              <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-muted-foreground mt-1">
                Admin Portal
              </p>
            </div>
            <div className="relative">
              <p className="font-headline text-6xl uppercase leading-[0.85] tracking-tight">
                Members
                <span className="block font-editorial italic normal-case font-medium text-primary">
                  only.
                </span>
              </p>
              <p className="mt-6 text-sm text-muted-foreground leading-relaxed max-w-sm">
                Foundation management for the first 150 early-access members.
              </p>
            </div>
            <div className="relative flex items-center gap-2 font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Urban Vogue · Early Access 2026
            </div>
          </div>

          {/* Form panel */}
          <div className="p-8 sm:p-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to site
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="font-mono text-[9px] tracking-[0.32em] uppercase text-primary mt-10 mb-3">
                Restricted
              </p>
              <h1 className="font-headline text-4xl sm:text-5xl uppercase tracking-tight leading-none">
                Admin <span className="font-editorial italic text-primary normal-case font-medium">Login</span>
              </h1>

              <form onSubmit={onSubmit} className="mt-10 space-y-8">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="admin@urbanvogue.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="w-full">
                  <label
                    htmlFor="password"
                    className="block font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-2"
                  >
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-border px-0 py-3 pr-10 text-foreground placeholder:text-muted-foreground/40 text-base focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-0 flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                      ) : (
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </div>
                {error ? (
                  <p
                    role="alert"
                    className="font-mono text-[10px] tracking-[0.18em] uppercase text-red-500"
                  >
                    {error}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  variant="inverse"
                  size="lg"
                  loading={loading}
                  className="w-full"
                >
                  Login
                </Button>
              </form>

              <p className="mt-8 text-center font-mono text-[8px] tracking-[0.26em] uppercase text-muted-foreground">
                Authorized admins only
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}