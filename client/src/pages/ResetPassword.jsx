import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, Sparkles, AlertCircle, Check, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShinyButton } from '../components/ui/ShinyButton';
import logo from '../logo.png';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Extract the reset token from the browser query URL
  const token = new URLSearchParams(window.location.search).get('token');

  // Verify complexity rules interactively
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    match: password === confirmPassword && password.length > 0
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (!token) {
      setError('Token de recuperação ausente ou inválido na URL.');
      return;
    }

    if (!checks.length || !checks.upper || !checks.lower || !checks.number) {
      setError('Por favor, atenda a todos os requisitos de segurança de senha.');
      return;
    }

    if (!checks.match) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao redefinir a senha. O link pode ter expirado.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f2f2f2] font-body flex items-center justify-center p-4">
      {/* Sleek ambient background glowing lights */}
      <div className="absolute inset-0 isolate pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#e13a40]/5 blur-[130px]" />
        <div className="absolute bottom-10 left-1/3 w-[300px] h-[300px] rounded-full bg-[#ff483d]/2 blur-[90px]" />
      </div>

      <div className="w-full max-w-[440px] space-y-7 bg-[#0c0c0e]/80 border border-[#1f1f1f] rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden z-10 text-left">
        
        {/* Branding header */}
        <div className="flex flex-col items-center text-center space-y-3 pb-3 border-b border-[#1f1f1f]">
          <img 
            src={logo} 
            alt="NEXDASH Logo" 
            className="h-12 w-12 drop-shadow-[0_0_10px_rgba(225,58,64,0.35)]" 
          />
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight">NEXDASH</h1>
            <p className="text-[9px] text-[#e13a40] font-bold uppercase tracking-widest">
              Redefinição de Acesso
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-[#e13a40]/10 border border-[#e13a40]/20 text-[#e13a40] rounded-xl text-xs font-medium flex items-start gap-2.5 animate-fade-in shadow-sm">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center py-4">
            <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-full flex items-center justify-center">
              <Check className="size-6 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">Senha Alterada com Sucesso!</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Suas novas credenciais corporativas já estão ativas. Você pode fazer o login imediatamente no sistema.
              </p>
            </div>
            <Link to="/login" className="block w-full">
              <ShinyButton className="w-full h-11 rounded-xl flex items-center justify-center">
                <span className="text-sm font-semibold tracking-wide flex items-center gap-2">
                  Ir para o Login <Sparkles className="size-4 text-[#ff483d]" />
                </span>
              </ShinyButton>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Criar Nova Senha</h2>
              <p className="text-xs text-zinc-450 leading-relaxed">
                Defina sua nova senha corporativa segura de no mínimo 8 dígitos.
              </p>
            </div>

            {/* Token state display warning if missing */}
            {!token && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-[11px] leading-relaxed">
                ⚠️ <strong>Atenção:</strong> Nenhum token de segurança foi detectado na barra de endereços. A alteração de senha falhará sem um link de redefinição válido gerado por e-mail.
              </div>
            )}

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 pl-0.5">
                Nova Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="pl-11 bg-[#0b0b0d] border-zinc-800 text-white placeholder-zinc-550 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl w-full text-sm"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Confirm password input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 pl-0.5">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="pl-11 bg-[#0b0b0d] border-zinc-800 text-white placeholder-zinc-550 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl w-full text-sm"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Dynamic visual complexity checklist */}
            <div className="p-3 bg-zinc-950/80 border border-zinc-900 rounded-xl space-y-2 text-[10px] text-zinc-400">
              <span className="font-bold uppercase tracking-wider text-zinc-500">Requisitos de Segurança:</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <Check className={`size-3 shrink-0 ${checks.length ? 'text-emerald-400' : 'text-zinc-650'}`} />
                  <span className={checks.length ? 'text-zinc-200 font-semibold' : ''}>Pelo menos 8 caracteres</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className={`size-3 shrink-0 ${checks.upper ? 'text-emerald-400' : 'text-zinc-650'}`} />
                  <span className={checks.upper ? 'text-zinc-200 font-semibold' : ''}>Uma letra maiúscula (A-Z)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className={`size-3 shrink-0 ${checks.lower ? 'text-emerald-400' : 'text-zinc-650'}`} />
                  <span className={checks.lower ? 'text-zinc-200 font-semibold' : ''}>Uma letra minúscula (a-z)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className={`size-3 shrink-0 ${checks.number ? 'text-emerald-400' : 'text-zinc-650'}`} />
                  <span className={checks.number ? 'text-zinc-200 font-semibold' : ''}>Pelo menos um número (0-9)</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2 border-t border-zinc-900 pt-1.5">
                  <Check className={`size-3 shrink-0 ${checks.match ? 'text-emerald-400' : 'text-zinc-650'}`} />
                  <span className={checks.match ? 'text-zinc-200 font-semibold' : ''}>As senhas digitadas são idênticas</span>
                </div>
              </div>
            </div>

            {/* Submission buttons */}
            <ShinyButton
              type="submit"
              disabled={isLoading || !token}
              className="w-full h-11 mt-4 rounded-xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span className="text-sm font-semibold tracking-wide">Redefinindo...</span>
                </>
              ) : (
                <span className="text-sm font-semibold tracking-wide flex items-center gap-2">
                  Salvar Nova Senha <Sparkles className="size-4 text-[#ff483d]" />
                </span>
              )}
            </ShinyButton>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs text-zinc-500 hover:text-white transition-all flex items-center justify-center gap-1.5 mx-auto"
              >
                <ChevronLeft className="size-3.5" /> Voltar para o Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
