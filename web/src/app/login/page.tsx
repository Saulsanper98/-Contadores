'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@playgroup.local');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError('Credenciales inválidas');
      return;
    }

    router.push('/dashboard');
  }

  return (
    <main className="min-h-screen bg-[#06090f] text-slate-100 flex items-center justify-center p-8">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8">
        <div>
          <p className="text-indigo-400 text-sm tracking-widest uppercase">Playgroup</p>
          <h1 className="text-2xl font-bold mt-2">Iniciar sesión</h1>
        </div>

        <label className="block space-y-2 text-sm">
          <span className="text-slate-400">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            required
          />
        </label>

        <label className="block space-y-2 text-sm">
          <span className="text-slate-400">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            required
          />
        </label>

        {error ? <p className="text-red-400 text-sm">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-cyan-500/20 border border-cyan-400/40 py-2 font-medium hover:bg-cyan-500/30 disabled:opacity-50">
          {loading ? 'Entrando…' : 'Entrar'}
        </button>

        <Link href="/" className="block text-center text-cyan-400 text-sm hover:underline">
          ← Volver al inicio
        </Link>
      </form>
    </main>
  );
}
