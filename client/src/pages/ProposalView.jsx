import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Check, 
  Globe, 
  ShieldAlert, 
  CreditCard, 
  Clock, 
  FileCheck, 
  Award,
  BookOpen,
  CheckCircle,
  XCircle,
  Users,
  Briefcase,
  ChevronDown,
  Plus
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

export default function ProposalView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [status, setStatus] = useState('pending'); // pending, approved
  const [selectedLang, setSelectedLang] = useState('pt');

  // Load customizer settings safely from localStorage
  const primaryColor = localStorage.getItem('dgflow_prop_primary_color') || localStorage.getItem('dgflow_proposal_primary_color') || '#e13a40';
  const secondaryColor = localStorage.getItem('dgflow_prop_secondary_color') || localStorage.getItem('dgflow_proposal_secondary_color') || '#0f766e';
  const customTitle = localStorage.getItem('dgflow_prop_custom_title') || localStorage.getItem('dgflow_proposal_title') || '';
  const customWelcome = localStorage.getItem('dgflow_prop_custom_welcome') || localStorage.getItem('dgflow_proposal_welcome') || '';
  const customBtnText = localStorage.getItem('dgflow_prop_custom_btn_text') || localStorage.getItem('dgflow_proposal_btn_text') || '';
  const customThanks = localStorage.getItem('dgflow_prop_custom_thanks') || localStorage.getItem('dgflow_proposal_thanks') || '';
  const showReviews = (localStorage.getItem('dgflow_prop_show_reviews') || localStorage.getItem('dgflow_proposal_show_reviews')) === 'true';
  const showProjects = (localStorage.getItem('dgflow_prop_show_projects') || localStorage.getItem('dgflow_proposal_show_projects')) !== 'false';
  const maxProjects = parseInt(localStorage.getItem('dgflow_prop_max_projects') || localStorage.getItem('dgflow_proposal_max_projects') || '4');
  const proposalLogo = localStorage.getItem('dgflow_prop_logo') || localStorage.getItem('dgflow_proposal_logo') || '';
  const proposalFavicon = localStorage.getItem('dgflow_prop_favicon') || localStorage.getItem('dgflow_proposal_favicon') || '';

  // Digital Signature States
  const [signerName, setSignerName] = useState('');
  const [signerCpf, setSignerCpf] = useState('');
  const [signerRubrica, setSignerRubrica] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = React.useRef(null);

  useEffect(() => {
    try {
      // Find proposal in localStorage
      const stored = localStorage.getItem('dgflow_proposals');
      if (stored) {
        const proposals = JSON.parse(stored);
        if (Array.isArray(proposals)) {
          const found = proposals.find(p => p.id === id);
          if (found) {
            setProposal(found);
            setStatus(found.status === 'approved' ? 'approved' : 'pending');
            setSignerName(found.signerName || found.clientName || '');
            setSignerCpf(found.signerCpf || '');
            setSignerRubrica(found.signerRubrica || '');
            return;
          }
        }
      }
    } catch (err) {
      console.error("Erro ao carregar proposta do localStorage:", err);
    }

    // Fallback demo proposal if not found or JSON parsing error
    setProposal({
      id: 'prop-demo',
      projectName: 'Design de Identidade Visual Premium',
      clientName: 'Marina Sousa',
      amount: 2500.00,
      date: new Date().toLocaleDateString('pt-BR'),
      description: 'Desenvolvimento completo de identidade visual corporativa, incluindo logotipo responsivo, manual de aplicação da marca, tipografia e papelaria básica.',
      services: [
        { name: 'Criação de Logotipo', desc: 'Design personalizado e exclusivo', price: 1500.00 },
        { name: 'Manual de Marca', desc: 'Guia completo de aplicação', price: 800.00 },
        { name: 'Papelaria', desc: 'Cartão de visita, papel timbrado', price: 500.00 }
      ],
      subtotal: 2800.00,
      discount: 300.00
    });
  }, [id]);

  const handleApprove = () => {
    if (!signerName || !signerCpf) {
      alert("Por favor, preencha o Nome Completo e o CPF para realizar a assinatura.");
      return;
    }
    if (proposal) {
      // Get base64 signature image from canvas
      let signatureDataUrl = '';
      if (canvasRef.current) {
        signatureDataUrl = canvasRef.current.toDataURL();
      }

      // Update proposal status in localStorage
      try {
        const stored = localStorage.getItem('dgflow_proposals');
        if (stored) {
          const proposals = JSON.parse(stored);
          if (Array.isArray(proposals)) {
            const updated = proposals.map(p => p.id === proposal.id ? { 
              ...p, 
              status: 'approved',
              signerName,
              signerCpf,
              signerRubrica,
              signatureImage: signatureDataUrl,
              approvedDate: new Date().toLocaleDateString('pt-BR')
            } : p);
            localStorage.setItem('dgflow_proposals', JSON.stringify(updated));
          }
        }
      } catch (err) {
        console.error("Erro ao atualizar proposta no localStorage:", err);
      }
      setStatus('approved');
      alert("Proposta Aprovada com Sucesso! O contrato foi assinado digitalmente e o prestador foi notificado no WhatsApp.");
    }
  };

  // Canvas drawing event handlers (with high precision scaling mapping client coords directly to canvas coords)
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Support mouse and touch events correctly
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    
    // Scale according to logical canvas size vs visual box bounding rect size
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const startDrawing = (e) => {
    if (status === 'approved') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || status === 'approved') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Set line styling whenever canvas mounts or updates
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#09090b'; // dark ink
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // If already approved, we can pre-draw the saved signature image!
      if (status === 'approved' && proposal?.signatureImage) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = proposal.signatureImage;
      }
    }
  }, [proposal, status]);

  // Set dynamic page title and favicon from customizer settings
  useEffect(() => {
    const titleText = proposal?.projectName || customTitle || 'Proposta Comercial - DGFlow';
    document.title = titleText;
    
    if (proposalFavicon) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = proposalFavicon;
    }
  }, [proposal, customTitle, proposalFavicon]);

  if (!proposal) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShieldAlert className="h-10 w-10 text-[#e13a40] mx-auto animate-bounce" />
          <p className="text-sm text-zinc-400 font-mono">Buscando proposta na DGFlow...</p>
        </div>
      </div>
    );
  }

  // Safe numerical parser helpers to ensure no .toLocaleString crashes
  const amount = Number(proposal?.amount || 0);
  const subtotal = Number(proposal?.subtotal || (amount * 1.12));
  const discount = Number(proposal?.discount || (subtotal - amount));

  const servicesList = (proposal?.services || [
    { name: 'Criação de Logotipo', desc: 'Design personalizado e exclusivo', price: amount * 0.6 },
    { name: 'Manual de Marca', desc: 'Guia completo de aplicação', price: amount * 0.32 },
    { name: 'Papelaria', desc: 'Cartão de visita, papel timbrado', price: amount * 0.2 }
  ]).map(s => ({
    ...s,
    price: Number(s?.price || 0)
  }));

  const formatMoney = (val) => {
    try {
      const num = Number(val);
      if (isNaN(num)) return '0,00';
      return num.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    } catch (e) {
      return '0,00';
    }
  };

  const proposalId = String(proposal?.id || 'prop-demo');
  const cleanId = proposalId.includes('-') ? proposalId.split('-')[1].slice(0, 6) : proposalId.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-body py-12 px-4 md:px-8 relative overflow-hidden">
      
      <style>{`
        .focus-primary:focus {
          border-color: ${primaryColor} !important;
          box-shadow: 0 0 0 2px ${primaryColor}33 !important;
        }
        .canvas-border {
          border-color: ${primaryColor}4d !important;
        }
      `}</style>

      {/* Premium Blurry Ambient Glows */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 h-[300px] w-[500px] rounded-full blur-[100px] pointer-events-none" style={{ backgroundColor: `${primaryColor}1a` }} />
      <div className="absolute bottom-[-100px] right-0 h-[250px] w-[350px] rounded-full bg-cyan-500/5 blur-[90px] pointer-events-none" />

      {/* Main Container: Single centered vertical column layout to match configurator preview exactly */}
      <div className="max-w-2xl mx-auto space-y-8 relative">
        
        {/* Top Header Row with language selection */}
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-1.5 border px-3 py-1 rounded-full text-xs font-semibold shadow-sm"
            style={{ 
              backgroundColor: `${primaryColor}1a`, 
              borderColor: `${primaryColor}33`, 
              color: primaryColor,
              boxShadow: `0 1px 2px ${primaryColor}0d`
            }}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Proposta Comercial</span>
          </div>

          <div className="relative shrink-0">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="appearance-none bg-[#0c0c0e] border border-zinc-800 rounded-lg px-8 py-1.5 text-xs text-zinc-300 font-bold outline-none cursor-pointer hover:border-zinc-700 transition-colors pr-10"
            >
              <option value="pt">BR Português</option>
              <option value="en">US English</option>
            </select>
            <Globe className="h-3.5 w-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-[8px]">▼</div>
          </div>
        </div>

        {/* Brand/Proposal Title Banner */}
        <div className="text-center space-y-2.5 py-4">
          
          {/* Brand Logo if loaded */}
          {proposalLogo ? (
            <img src={proposalLogo} alt="Logo" className="max-h-[55px] max-w-[200px] object-contain mx-auto mb-3 animate-fade-in" />
          ) : (
            <div className="text-sm font-bold tracking-tight text-white mb-2 font-mono uppercase">dgflow</div>
          )}

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display leading-tight max-w-md mx-auto">
            {proposal?.projectName || customTitle || 'Proposta Comercial'}
          </h1>
          <p className="text-zinc-550 text-xs tracking-widest font-mono uppercase">
            Orçamento #{cleanId}
          </p>
        </div>

        {/* Vertical Stack List matching preview panel exactly */}
        <div className="space-y-6">
          
          {/* CARD 1: Detalhes da Proposta */}
          <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/80 overflow-hidden shadow-xl">
            
            {/* Card Header */}
            <div className="p-5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/40">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" style={{ color: primaryColor }} />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Detalhes da Proposta</h2>
              </div>
              
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1 ${
                status === 'approved' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                <span className={`h-1 w-1 rounded-full ${status === 'approved' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                {status === 'approved' ? 'Aprovado' : 'Pendente'}
              </span>
            </div>

            {/* Card Content body */}
            <div className="p-5 space-y-5">
              
              {/* Sobre o Projeto */}
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-black uppercase block tracking-wider" style={{ color: primaryColor }}>Sobre o Projeto</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                  {proposal?.description || customWelcome || 'Desenvolvimento completo de identidade visual corporativa, logotipo responsivo, manual de aplicação da marca, tipografia e papelaria de apoio corporativo sob medida.'}
                </p>
              </div>

              <div className="h-px bg-zinc-900/60" />

              {/* Serviços Incluídos */}
              <div className="space-y-3 text-left">
                <span className="text-[10px] font-bold text-zinc-350 uppercase block tracking-wider">Serviços Incluídos</span>
                
                <div className="space-y-2">
                  {servicesList.map((service, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-[11px] font-bold text-white leading-normal">{service.name}</h4>
                        <p className="text-[9px] text-zinc-550 leading-normal">{service.desc || 'Serviço sob medida'}</p>
                      </div>

                      <span className="text-xs font-bold font-mono whitespace-nowrap shrink-0" style={{ color: primaryColor }}>
                        R$ {formatMoney(service.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing totals */}
              <div className="p-3.5 rounded-lg border border-zinc-900 bg-zinc-950/80 space-y-2 font-mono">
                
                <div className="flex items-center justify-between text-[10px] text-zinc-550">
                  <span>Subtotal:</span>
                  <span>R$ {formatMoney(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-emerald-500 border-b border-zinc-900 pb-2">
                  <span>Desconto:</span>
                  <span>- R$ {formatMoney(discount)}</span>
                </div>

                <div className="flex items-center justify-between pt-1.5 font-body">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Total:</span>
                  <span className="text-lg font-black font-mono leading-none" style={{ color: primaryColor }}>
                    R$ {formatMoney(amount)}
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* CARD 2: Condições de Pagamento */}
          <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/80 p-5 shadow-xl text-left">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5">
              <Plus className="h-4 w-4" style={{ color: secondaryColor }} />
              <h3 className="text-[10px] font-black uppercase tracking-wider" style={{ color: secondaryColor }}>Condições de Pagamento</h3>
            </div>
            
            <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
              As condições de pagamento serão exibidas automaticamente com base nos dados do orçamento aprovado.
            </p>

            <div className="pt-2 text-[10px] text-zinc-500 font-mono space-y-1">
              <div className="flex items-center justify-between">
                <span>Validade:</span>
                <span>7 dias</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Assinatura:</span>
                <span>DGFlow Digital</span>
              </div>
            </div>
          </div>

          {/* CARD 3: Depoimentos (Se ativado nas configurações) */}
          {showReviews && (
            <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/80 p-5 shadow-xl text-left animate-fade-in space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" style={{ color: primaryColor }} />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">O que dizem os Clientes</h3>
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-950/40 border border-zinc-900 text-center">
                <p className="text-[10px] text-zinc-400 italic">"Excelente atendimento, equipe atenciosa e projeto entregue com máxima qualidade."</p>
                <span className="text-[8px] font-bold text-zinc-500 block mt-2">- Mariana Sousa</span>
              </div>
            </div>
          )}

          {/* CARD 4: Portfólio (Se ativado nas configurações) */}
          {showProjects && (
            <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/80 p-5 shadow-xl text-left animate-fade-in space-y-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" style={{ color: primaryColor }} />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Nosso Portfólio ({maxProjects} itens)</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: Math.min(maxProjects, 4) }).map((_, i) => (
                  <div key={i} className="aspect-video bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center text-[9px] text-zinc-550 font-mono">
                    Projeto #{i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CARD 5: Assinatura Digital */}
          <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/80 p-6 shadow-2xl space-y-5 text-left font-body animate-fade-in relative z-10">
            
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3 select-none">
              <Check className="h-4 w-4" style={{ color: primaryColor }} />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Assinatura Digital</h3>
            </div>

            <div className="space-y-4">
              
              {/* Nome Completo */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Nome Completo</label>
                <input
                  type="text"
                  disabled={status === 'approved'}
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  className="w-full bg-[#101014] border border-zinc-800 text-xs rounded-lg p-2.5 outline-none text-white focus-primary h-10 font-medium disabled:opacity-60 transition-all"
                />
              </div>

              {/* CPF */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">CPF</label>
                <input
                  type="text"
                  disabled={status === 'approved'}
                  value={signerCpf}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    let formatted = val;
                    if (val.length > 3) formatted = val.slice(0, 3) + '.' + val.slice(3);
                    if (val.length > 6) formatted = formatted.slice(0, 7) + '.' + formatted.slice(7);
                    if (val.length > 9) formatted = formatted.slice(0, 11) + '-' + formatted.slice(11, 13);
                    setSignerCpf(formatted);
                  }}
                  placeholder="000.000.000-00"
                  className="w-full bg-[#101014] border border-zinc-800 text-xs rounded-lg p-2.5 outline-none text-white focus-primary h-10 font-mono disabled:opacity-60 transition-all"
                />
              </div>

              {/* Rubrica */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Rubrica (suas iniciais)</label>
                <input
                  type="text"
                  disabled={status === 'approved'}
                  value={signerRubrica}
                  onChange={(e) => setSignerRubrica(e.target.value.toUpperCase().slice(0, 3))}
                  placeholder="EX: JS"
                  className="w-full max-w-[100px] bg-[#101014] border border-zinc-800 text-xs rounded-lg p-2.5 outline-none text-white focus-primary h-10 font-bold uppercase text-center disabled:opacity-60 transition-all"
                />
                <p className="text-[9px] text-zinc-550 block leading-snug mt-1.5">Aparecerá em todas as páginas da proposta.</p>
              </div>

              {/* Signature Draw Canvas */}
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Assine no campo abaixo</label>
                <div className="relative border-2 border-dashed canvas-border rounded-xl overflow-hidden bg-white h-[180px] w-full">
                  <canvas
                    ref={canvasRef}
                    width={450}
                    height={180}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full bg-white cursor-crosshair"
                  />
                </div>
                
                {status === 'pending' && (
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="px-3 py-1.5 border border-zinc-850 hover:border-zinc-700 bg-zinc-950 rounded text-[10px] text-zinc-400 hover:text-white cursor-pointer transition-all"
                  >
                    Limpar Assinatura
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3">
                {status === 'pending' ? (
                  <button
                    onClick={handleApprove}
                    className="w-full py-3.5 rounded-xl text-white font-extrabold text-xs uppercase tracking-widest transition-all hover:scale-102 cursor-pointer shadow-lg hover:shadow-xl flex items-center justify-center gap-2 border border-teal-500/10 animate-pulse"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                      boxShadow: `0 4px 14px ${primaryColor}33`
                    }}
                  >
                    <Check className="h-4 w-4" />
                    <span>{customBtnText || "Assinar e Aprovar"}</span>
                  </button>
                ) : (
                  <div className="space-y-3.5 pt-1">
                    <div className="w-full py-3 px-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[11px] flex items-center justify-center gap-2 uppercase tracking-widest text-center shadow-md select-none">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-450 animate-pulse shrink-0" />
                      <span>Proposta Assinada & Aprovada</span>
                    </div>

                    {customThanks && (
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center shadow-sm select-text">
                        <p className="text-xs text-zinc-350 italic font-medium">"{customThanks}"</p>
                      </div>
                    )}
                    
                    {/* Approved signer metadata details card */}
                    <div className="p-3 bg-[#08080a] border border-zinc-900 rounded-lg text-[10px] text-zinc-400 font-mono space-y-1 select-text">
                      <div className="flex justify-between">
                        <span>Assinado por:</span>
                        <span className="text-white font-bold">{signerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CPF:</span>
                        <span className="text-white font-bold">{signerCpf}</span>
                      </div>
                      {signerRubrica && (
                        <div className="flex justify-between">
                          <span>Rubrica:</span>
                          <span className="text-white font-bold">{signerRubrica}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Data:</span>
                        <span className="text-white font-bold">{proposal?.approvedDate || new Date().toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Protocolo DGFlow:</span>
                        <span className="text-white font-semibold">DF-{proposalId.includes('-') ? proposalId.split('-')[1].slice(0, 6) : proposalId.slice(0, 6)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            <p className="text-[9px] text-zinc-650 font-mono text-center leading-normal pt-2">
              Ao assinar, você aceita digitalmente os termos do contrato DGFlow sob a conformidade jurídica MP 2.200-2.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
