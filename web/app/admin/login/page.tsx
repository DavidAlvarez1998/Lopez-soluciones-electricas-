"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "@/lib/actions/auth";

const initialState = { error: null as string | null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-bright hover:bg-blue-glow disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 mt-2"
    >
      {pending ? "Ingresando..." : "Ingresar"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-barlow-condensed text-3xl font-bold text-off-white tracking-wide">
            LÓPEZ
          </h1>
          <p className="text-blue-glow text-sm font-semibold tracking-widest uppercase mt-1">
            ⚡ Soluciones Eléctricas
          </p>
          <p className="text-brand-gray text-xs mt-1">
            Comprometidos con el cambio energético
          </p>
        </div>

        {/* Card glassmorphism */}
        <div className="glass rounded-2xl p-8 shadow-glow">
          <h2 className="text-off-white text-xl font-semibold mb-6 text-center">
            Ingresar al panel
          </h2>

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-brand-gray text-sm font-medium mb-1.5"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder-brand-gray/50 focus:outline-none focus:border-blue-glow focus:ring-1 focus:ring-blue-glow transition-colors"
                placeholder="admin@lopezelectrica.co"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-brand-gray text-sm font-medium mb-1.5"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-off-white placeholder-brand-gray/50 focus:outline-none focus:border-blue-glow focus:ring-1 focus:ring-blue-glow transition-colors"
                placeholder="••••••••"
              />
            </div>

            {state?.error && (
              <div className="bg-accent/10 border border-accent/30 rounded-lg px-4 py-3 text-accent text-sm">
                {state.error}
              </div>
            )}

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}
