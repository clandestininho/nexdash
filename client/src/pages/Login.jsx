import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, ChevronLeft, Sparkles, AlertCircle, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShinyButton } from '../components/ui/ShinyButton';
import { connectSocket } from '../lib/socket';
import logo from '../logo.png';

// Carousel of premium client quotes
const TESTIMONIALS = [
  {
    text: "O NEXDASH transformou a nossa operação comercial. Ganhamos mais produtividade e aumentamos nossa taxa de conversão em 40% na agência.",
    author: "Gleison Silva",
    role: "CEO & Co-founder"
  },
  {
    text: "A integração dos leads do WhatsApp com o painel financeiro e a agenda inteligente economizou pelo menos 15 horas semanais da minha equipe.",
    author: "Amanda Costa",
    role: "Diretora de Operações"
  },
  {
    text: "O suporte aos agentes de IA e criador automático de propostas comerciais nos deu superpoderes para fechar projetos de alto valor.",
    author: "Ricardo Lima",
    role: "Gestor Comercial"
  }
];

// Interactive Google/Apple/Github icons
const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.61.69-1.15 1.84-1.01 2.96 1.12.09 2.26-.56 2.94-1.39z"/>
  </svg>
);

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const AuthSeparator = () => {
  return (
    <div className="flex w-full items-center justify-center py-2">
      <div className="bg-zinc-800 h-px w-full" />
      <span className="text-zinc-500 px-3 text-[10px] uppercase font-bold tracking-wider">OU</span>
      <div className="bg-zinc-800 h-px w-full" />
    </div>
  );
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState('request'); // 'request', 'code', 'success'
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // password complexity requirements
  const checks = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    match: newPassword === confirmPassword && newPassword.length > 0
  };

  const [activeQuote, setActiveQuote] = useState(0);

  const navigate = useNavigate();

  // Testimonial rotator interval
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, preencha todos os campos corporativos.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Credenciais inválidas. Por favor, verifique seu acesso.');
      }

      // Save token and user details to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Connect Socket.io client with JWT auth
      connectSocket(data.token);

      // Redirect to main CRM pipeline
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to trigger backend social OAuth redirection
  const handleSocialClick = (platform) => {
    setError('');
    window.location.href = `/api/auth/${platform.toLowerCase()}`;
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, informe seu e-mail corporativo.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar solicitação.');
      }

      setSuccessMessage('Código de recuperação enviado! Verifique sua caixa de e-mail.');
      setForgotStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!verificationCode || !newPassword || !confirmPassword) {
      setError('Por favor, preencha todos os campos obrigatórios.');
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
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode, password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao redefinir senha. Verifique o código digitado.');
      }

      setSuccessMessage('Senha alterada com sucesso! Você já pode realizar o login.');
      setForgotStep('success');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-[#f2f2f2] font-body lg:grid lg:grid-cols-2">
      
      {/* Left visual column - interactive brand layout */}
      <div className="relative hidden h-full flex-col justify-between border-r border-[#1f1f1f] bg-gradient-to-br from-[#0c0c0e] via-[#050505] to-[#120a0b] p-12 lg:flex overflow-hidden">
        
        {/* Animated fluid paths flowing dynamically in background */}
        <div className="absolute inset-0 z-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>

        {/* Diagonal high-tech grid overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(225,58,64,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(225,58,64,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40 z-0" />

        {/* Bottom corner branding glow */}
        <div className="absolute -bottom-48 -left-48 w-96 h-96 rounded-full bg-[#e13a40]/10 blur-[120px] pointer-events-none" />

        {/* Branding header container */}
        <div className="z-10 flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#e13a40] to-[#ff483d] rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-500" />
            <img 
              src={logo} 
              alt="NEXDASH Logo" 
              className="relative h-10 w-10 object-contain drop-shadow-[0_0_10px_rgba(225,58,64,0.4)]"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-wider text-white">NEXDASH</span>
            <span className="text-[9px] font-bold tracking-widest text-[#e13a40] uppercase -mt-0.5">CRM INTELIGENTE</span>
          </div>
        </div>

        {/* Mid illustration or quote rotating carousel */}
        <div className="z-10 mt-auto mb-10 max-w-lg">
          <div className="relative min-h-[160px] flex flex-col justify-end">
            <div className="absolute top-0 left-0 text-[#e13a40] opacity-25">
              <span className="text-7xl font-serif leading-none">&ldquo;</span>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeQuote}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-4 relative z-10 pl-6"
              >
                <p className="text-xl font-medium leading-relaxed text-zinc-150 drop-shadow-sm font-body">
                  {TESTIMONIALS[activeQuote].text}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-1 w-8 bg-gradient-to-r from-[#e13a40] to-transparent rounded-full" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {TESTIMONIALS[activeQuote].author}
                    </p>
                    <p className="text-xs text-[#e13a40] font-medium tracking-wide">
                      {TESTIMONIALS[activeQuote].role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Visual indicators */}
        <div className="z-10 flex gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveQuote(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeQuote ? 'w-8 bg-[#e13a40]' : 'w-2 bg-zinc-800 hover:bg-zinc-700'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Right form column */}
      <div className="relative flex flex-col justify-center items-center px-4 py-12 lg:px-16 min-h-screen overflow-y-auto">
        
        {/* Glow ambient lights behind the card */}
        <div className="absolute inset-0 isolate pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#e13a40]/5 blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-[#ff483d]/3 blur-[100px]" />
        </div>

        {/* Back Button to dashboard/landing if needed */}
        <Button 
          variant="ghost" 
          className="absolute top-6 left-6 text-zinc-450 hover:text-white transition-all text-xs font-semibold"
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="size-4 mr-1.5" />
          Voltar
        </Button>

        {/* Card containing login form */}
        <div className="w-full max-w-[420px] space-y-7 z-10">
          
          {/* Mobile branding header (visible only on small screens) */}
          <div className="flex flex-col items-center text-center space-y-3 lg:hidden">
            <img 
              src={logo} 
              alt="NEXDASH Logo" 
              className="h-14 w-14 drop-shadow-[0_0_12px_rgba(225,58,64,0.45)] animate-pulse-soft" 
            />
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white tracking-tight">NEXDASH</h1>
              <p className="text-[10px] text-[#e13a40] font-bold uppercase tracking-widest">
                CRM INTELIGENTE & AUTOMATION
              </p>
            </div>
          </div>

          {/* Form Header */}
          <div className="flex flex-col text-center lg:text-left space-y-1">
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center lg:justify-start gap-2">
              {isForgotMode ? 'Recuperar Senha' : 'Acesse o Painel'} <Sparkles className="size-5 text-[#e13a40] animate-pulse" />
            </h2>
            <p className="text-sm text-zinc-450">
              {isForgotMode 
                ? 'Digite seu e-mail corporativo para receber o link de redefinição.'
                : 'Digite seu e-mail corporativo para fazer login na plataforma.'}
            </p>
          </div>

          {/* Status & Error Banners */}
          {error && (
            <div className="p-3.5 bg-[#e13a40]/10 border border-[#e13a40]/20 text-[#e13a40] rounded-xl text-xs font-medium flex items-start gap-2.5 animate-fade-in shadow-sm">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-xl text-xs font-medium flex items-start gap-2.5 animate-fade-in shadow-sm">
              <Check className="size-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {!isForgotMode ? (
            <>
              {/* Social login block (decorative and sleek interface element) */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-11 border-zinc-800 bg-[#0e0e11] hover:bg-zinc-900 flex items-center justify-center rounded-xl"
                  onClick={() => handleSocialClick('Google')}
                >
                  <GoogleIcon className="size-4 text-white" />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-11 border-zinc-800 bg-[#0e0e11] hover:bg-zinc-900 flex items-center justify-center rounded-xl"
                  onClick={() => handleSocialClick('GitHub')}
                >
                  <GithubIcon className="size-4 text-white" />
                </Button>
              </div>

              <AuthSeparator />

              {/* Standard credential login form */}
              <form onSubmit={handleLogin} className="space-y-4">
                
                {/* E-mail field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 pl-0.5">
                    E-mail Corporativo
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="voce@empresa.com"
                      className="pl-11 bg-[#0b0b0d] border-zinc-800 text-white placeholder-zinc-550 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl w-full text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-0.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450">
                      Senha de Acesso
                    </label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsForgotMode(true);
                        setError('');
                        setSuccessMessage('');
                      }} 
                      className="text-[10px] font-bold text-[#e13a40] hover:underline hover:text-[#ff483d] transition-all bg-transparent border-none cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-11 bg-[#0b0b0d] border-zinc-800 text-white placeholder-zinc-550 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl w-full text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submission Button */}
                <ShinyButton
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 mt-6 rounded-xl flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span className="text-sm font-semibold tracking-wide">Entrando...</span>
                    </>
                  ) : (
                    <span className="text-sm font-semibold tracking-wide flex items-center gap-2">
                      Entrar no Sistema <Sparkles className="size-4 text-[#ff483d]" />
                    </span>
                  )}
                </ShinyButton>
              </form>

              {/* Registration link and compliance footer info */}
              <div className="text-center space-y-4 pt-2">
                <p className="text-xs text-zinc-450 font-medium">
                  Não tem uma conta corporativa?{' '}
                  <Link to="/register" className="text-[#e13a40] font-bold hover:underline hover:text-[#ff483d] transition-all pl-0.5">
                    Criar conta gratuita →
                  </Link>
                </p>
                
                <p className="text-[10px] text-zinc-600 leading-relaxed max-w-sm mx-auto">
                  Ao continuar, você concorda com nossos{' '}
                  <a href="#" className="hover:text-zinc-400 underline underline-offset-4 transition-all">Termos de Serviço</a>
                  {' '}e{' '}
                  <a href="#" className="hover:text-zinc-400 underline underline-offset-4 transition-all">Política de Privacidade</a>.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Forgot password form */}
              {forgotStep === 'request' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {/* E-mail field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 pl-0.5">
                      E-mail Corporativo
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="voce@empresa.com"
                        className="pl-11 bg-[#0b0b0d] border-zinc-800 text-white placeholder-zinc-550 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl w-full text-sm"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Submission Button */}
                  <ShinyButton
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 mt-6 rounded-xl flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span className="text-sm font-semibold tracking-wide">Enviando...</span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold tracking-wide flex items-center gap-2">
                        Enviar Código de Recuperação <Sparkles className="size-4 text-[#ff483d]" />
                      </span>
                    )}
                  </ShinyButton>
                </form>
              )}

              {forgotStep === 'code' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* Verification code field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 pl-0.5">
                      Código de Recuperação (6 dígitos)
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Ex: 123456"
                        className="pl-11 bg-[#0b0b0d] border-zinc-800 text-white placeholder-zinc-550 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl w-full text-sm font-mono tracking-widest text-center font-bold"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* New password field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 pl-0.5">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo de 8 caracteres"
                        className="pl-11 bg-[#0b0b0d] border-zinc-800 text-white placeholder-zinc-550 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl w-full text-sm"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Confirm password field */}
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
                        placeholder="Confirme a nova senha"
                        className="pl-11 bg-[#0b0b0d] border-zinc-800 text-white placeholder-zinc-550 focus:border-[#e13a40] focus:ring-1 focus:ring-[#e13a40]/30 h-11 rounded-xl w-full text-sm"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Complexity checklists box */}
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

                  {/* Submission Button */}
                  <ShinyButton
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 mt-4 rounded-xl flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span className="text-sm font-semibold tracking-wide">Redefinindo...</span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold tracking-wide flex items-center gap-2">
                        Redefinir Minha Senha <Sparkles className="size-4 text-[#ff483d]" />
                      </span>
                    )}
                  </ShinyButton>
                </form>
              )}

              {forgotStep === 'success' && (
                <div className="space-y-4 text-center py-2">
                  <div className="mx-auto w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-full flex items-center justify-center">
                    <Check className="size-6 text-emerald-400" />
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                    Sua nova senha foi redefinida com total segurança. Você já pode acessar a plataforma utilizando suas novas credenciais corporativas.
                  </p>
                </div>
              )}

              {/* Navigation Back */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(false);
                    setForgotStep('request');
                    setVerificationCode('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-[#e13a40] font-bold hover:underline hover:text-[#ff483d] transition-all flex items-center justify-center gap-1.5 mx-auto bg-transparent border-none cursor-pointer"
                >
                  <ChevronLeft className="size-3.5" /> Voltar para o Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

// Background path particle renderer component
function FloatingPaths({ position }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(225,58,64,${0.03 + i * 0.008})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-slate-900/40"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke={path.color}
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.02}
            initial={{ pathLength: 0.2, opacity: 0.4 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.7, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 15 + Math.random() * 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear',
            }}
          />
        ))}
      </svg>
    </div>
  );
}
