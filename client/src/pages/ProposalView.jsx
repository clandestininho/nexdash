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
  const [branding, setBranding] = useState(null);
  const [gateways, setGateways] = useState({ asaas: false, mercadopago: false, stripe: false });
  const [isLoading, setIsLoading] = useState(true);
  const [paymentTab, setPaymentTab] = useState('pix'); // pix | card
  const [isPaying, setIsPaying] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });

  // Load customizer settings safely from localStorage (fallbacks)
  const primaryColor = branding?.primaryColor || localStorage.getItem('dgflow_prop_primary_color') || localStorage.getItem('dgflow_proposal_primary_color') || '#e13a40';
  const secondaryColor = branding?.secondaryColor || localStorage.getItem('dgflow_prop_secondary_color') || localStorage.getItem('dgflow_proposal_secondary_color') || '#0f766e';
  const customTitle = branding?.customTitle || localStorage.getItem('dgflow_prop_custom_title') || localStorage.getItem('dgflow_proposal_title') || '';
  const customWelcome = branding?.customWelcome || localStorage.getItem('dgflow_prop_custom_welcome') || localStorage.getItem('dgflow_proposal_welcome') || '';
  const customBtnText = branding?.customBtnText || localStorage.getItem('dgflow_prop_custom_btn_text') || localStorage.getItem('dgflow_proposal_btn_text') || '';
  const customThanks = branding?.customThanks || localStorage.getItem('dgflow_prop_custom_thanks') || localStorage.getItem('dgflow_proposal_thanks') || '';
  const showReviews = branding ? branding.showReviews : (localStorage.getItem('dgflow_prop_show_reviews') || localStorage.getItem('dgflow_proposal_show_reviews')) === 'true';
  const showProjects = branding ? branding.showProjects : (localStorage.getItem('dgflow_prop_show_projects') || localStorage.getItem('dgflow_proposal_show_projects')) !== 'false';
  const maxProjects = branding ? branding.maxProjects : parseInt(localStorage.getItem('dgflow_prop_max_projects') || localStorage.getItem('dgflow_proposal_max_projects') || '4');
  const proposalLogo = branding?.proposalLogo || localStorage.getItem('dgflow_prop_logo') || localStorage.getItem('dgflow_proposal_logo') || '';
  const proposalFavicon = branding?.proposalFavicon || localStorage.getItem('dgflow_prop_favicon') || localStorage.getItem('dgflow_proposal_favicon') || '';

  // Digital Signature States
  const [signerName, setSignerName] = useState('');
  const [signerCpf, setSignerCpf] = useState('');
  const [signerRubrica, setSignerRubrica] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = React.useRef(null);

  useEffect(() => {
    const loadProposal = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${window.location.origin}/api/public/proposals/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProposal(data.proposal);
          setStatus(data.proposal.status === 'approved' ? 'approved' : 'pending');
          setSignerName(data.proposal.signerName || data.proposal.clientName || '');
          setSignerCpf(data.proposal.signerCpf || '');
          setSignerRubrica(data.proposal.signerRubrica || '');
          setBranding(data.branding);
          setGateways(data.gateways);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Failed to fetch public proposal from API, falling back to local storage:", err);
      }

      // LOCALSTORAGE FALLBACK
      try {
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
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Erro ao carregar proposta do localStorage:", err);
      }

      // DEMO FALLBACK
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
      setIsLoading(false);
    };

    loadProposal();
  }, [id]);

  const handleApprove = async () => {
    if (!signerName || !signerCpf) {
      alert("Por favor, preencha o Nome Completo e o CPF para realizar a assinatura.");
      return;
    }
    if (proposal) {
      let signatureDataUrl = '';
      if (canvasRef.current) {
        signatureDataUrl = canvasRef.current.toDataURL();
      }

      // Save to server
      try {
        const res = await fetch(`${window.location.origin}/api/public/proposals/${proposal.id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signerName,
            signerCpf,
            signerRubrica,
            signatureImage: signatureDataUrl
          })
        });
        if (res.ok) {
          const data = await res.json();
          setProposal(data.proposal);
        }
      } catch (err) {
        console.warn("Erro ao salvar assinatura no servidor:", err);
      }

      // Backwards Compatibility: Update proposal status in localStorage
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
    }
  };

  const handleSimulatePayment = async (method = 'PIX') => {
    setIsPaying(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // aesthetic delay

      const res = await fetch(`${window.location.origin}/api/public/proposals/${proposal.id}/pay-simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method })
      });

      if (res.ok) {
        const data = await res.json();
        setProposal(data.proposal);
        alert("Pagamento simulado efetuado com sucesso! A transação foi aprovada.");
      } else {
        alert("Falha ao simular pagamento.");
      }
    } catch (err) {
      console.error("Erro ao simular pagamento:", err);
      alert("Erro de conexão ao simular pagamento.");
    } finally {
      setIsPaying(false);
    }
  };

  // Canvas drawing event handlers
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
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

  // Set line styling
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#09090b'; // dark ink
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (status === 'approved' && proposal?.signatureImage) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = proposal.signatureImage;
      }
    }
  }, [proposal, status]);

  // Set page title
  useEffect(() => {
    const titleText = proposal?.projectName || customTitle || 'Proposta Comercial - NEXDASH';
    document.title = titleText;
  }, [proposal, customTitle]);

  if (isLoading || !proposal) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Clock className="h-10 w-10 text-[#e13a40] mx-auto animate-spin" />
          <p className="text-sm text-zinc-400 font-mono">Buscando proposta no NEXDASH...</p>
        </div>
      </div>
    );
  }

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

  const profileMoeda = branding?.currency || 'BRL';
  const currencySymbol = profileMoeda === 'EUR' ? '€' : profileMoeda === 'USD' ? '$' : 'R$';

  const formatMoney = (val) => {
    try {
      const num = Number(val);
      if (isNaN(num)) return '0,00';
      return num.toLocaleString(
        profileMoeda === 'EUR' ? 'de-DE' : profileMoeda === 'USD' ? 'en-US' : 'pt-BR',
        { minimumFractionDigits: 2 }
      );
    } catch (e) {
      return '0,00';
    }
  };

  const proposalId = String(proposal?.id || 'prop-demo');
  const cleanId = proposalId.includes('_') ? proposalId.split('_')[2].slice(0, 6) : proposalId.slice(0, 6);

  // Dynamic PIX copy/paste string
  const pixCode = `00020101021226830014br.gov.bcb.pix2561api.asaas.com/v3/pix/t/${proposalId}5204000053039865405${amount.toFixed(2)}5802BR5925${encodeURIComponent(proposal.clientName)}6009SAO PAULO62070503***6304` + Math.floor(Math.random() * 9000 + 1000).toString(16);

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

      {/* Blurry Glows */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 h-[300px] w-[500px] rounded-full blur-[100px] pointer-events-none" style={{ backgroundColor: `${primaryColor}1a` }} />
      <div className="absolute bottom-[-100px] right-0 h-[250px] w-[350px] rounded-full bg-cyan-500/5 blur-[90px] pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-8 relative select-none">
        
        {/* Top Header */}
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

        {/* Title */}
        <div className="text-center space-y-2.5 py-4">
          {proposalLogo ? (
            <img src={proposalLogo} alt="Logo" className="max-h-[55px] max-w-[200px] object-contain mx-auto mb-3 animate-fade-in" />
          ) : (
            <div className="text-sm font-bold tracking-tight text-white mb-2 font-mono uppercase">NEXDASH</div>
          )}

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display leading-tight max-w-md mx-auto">
            {proposal?.projectName || customTitle || 'Proposta Comercial'}
          </h1>
          <p className="text-zinc-500 text-xs tracking-widest font-mono uppercase">
            Orçamento #{cleanId}
          </p>
        </div>

        {/* Vertical Stack List */}
        <div className="space-y-6">
          
          {/* Detalhes da Proposta */}
          <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/80 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/40">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" style={{ color: primaryColor }} />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Detalhes da Proposta</h2>
              </div>
              
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1 ${
                proposal.payment_status === 'PAID'
                  ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                  : status === 'approved' 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                    : 'bg-zinc-800/60 text-zinc-400 border border-zinc-800'
              }`}>
                <span className={`h-1 w-1 rounded-full ${proposal.payment_status === 'PAID' ? 'bg-emerald-400' : status === 'approved' ? 'bg-amber-400 animate-pulse' : 'bg-zinc-400'}`} />
                {proposal.payment_status === 'PAID' ? 'Pago' : status === 'approved' ? 'Assinado' : 'Pendente'}
              </span>
            </div>

            <div className="p-5 space-y-5">
              
              {/* Sobre o Projeto */}
              <div className="space-y-1.5 text-left select-text">
                <span className="text-[10px] font-black uppercase block tracking-wider" style={{ color: primaryColor }}>Sobre o Projeto</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                  {proposal?.description || customWelcome || 'Desenvolvimento completo de identidade visual corporativa, logotipo responsivo, manual de aplicação da marca, tipografia e papelaria de apoio corporativo sob medida.'}
                </p>
              </div>

              <div className="h-px bg-zinc-900/60" />

              {/* Serviços Incluídos */}
              <div className="space-y-3 text-left">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block tracking-wider">Serviços Incluídos</span>
                
                <div className="space-y-2">
                  {servicesList.map((service, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 flex items-center justify-between gap-4 select-text"
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-[11px] font-bold text-white leading-normal">{service.name}</h4>
                        <p className="text-[9px] text-zinc-500 leading-normal">{service.desc || 'Serviço sob medida'}</p>
                      </div>

                      <span className="text-xs font-bold font-mono whitespace-nowrap shrink-0" style={{ color: primaryColor }}>
                        {currencySymbol} {formatMoney(service.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing totals */}
              <div className="p-3.5 rounded-lg border border-zinc-900 bg-zinc-950/80 space-y-2 font-mono select-text">
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Subtotal:</span>
                  <span>{currencySymbol} {formatMoney(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-emerald-500 border-b border-zinc-900 pb-2">
                  <span>Desconto:</span>
                  <span>- {currencySymbol} {formatMoney(discount)}</span>
                </div>

                <div className="flex items-center justify-between pt-1.5 font-body">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider">Total:</span>
                  <span className="text-lg font-black font-mono leading-none" style={{ color: primaryColor }}>
                    {currencySymbol} {formatMoney(amount)}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Condições de Pagamento */}
          <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/80 p-5 shadow-xl text-left select-text">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5">
              <Plus className="h-4 w-4" style={{ color: secondaryColor }} />
              <h3 className="text-[10px] font-black uppercase tracking-wider" style={{ color: secondaryColor }}>Condições de Pagamento</h3>
            </div>
            
            <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
              Este contrato autoriza o início dos trabalhos mediante a confirmação da entrada e assinatura eletrônica do cliente.
            </p>

            <div className="pt-2 text-[10px] text-zinc-500 font-mono space-y-1">
              <div className="flex items-center justify-between">
                <span>Validade:</span>
                <span>7 dias</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Assinatura:</span>
                <span>Assinatura Digital NEXDASH</span>
              </div>
            </div>
          </div>

          {/* Depoimentos */}
          {showReviews && (
            <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/80 p-5 shadow-xl text-left animate-fade-in space-y-3 select-text">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" style={{ color: primaryColor }} />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">O que dizem os Clientes</h3>
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-950/40 border border-zinc-900 text-center">
                <p className="text-[10px] text-zinc-400 italic">"Excelente atendimento, equipe atenciosa e projeto entregue com máxima qualidade."</p>
                <span className="text-[8px] font-bold text-zinc-500 block mt-2">- Marina Sousa</span>
              </div>
            </div>
          )}

          {/* Portfólio */}
          {showProjects && (
            <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/80 p-5 shadow-xl text-left animate-fade-in space-y-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" style={{ color: primaryColor }} />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Nosso Portfólio ({maxProjects} itens)</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: Math.min(maxProjects, 4) }).map((_, i) => (
                  <div key={i} className="aspect-video bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center text-[9px] text-zinc-650 font-mono">
                    Projeto #{i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assinatura Digital / Checkout Area */}
          <div className="rounded-2xl border border-zinc-900 bg-[#0c0c0e]/80 p-6 shadow-2xl space-y-5 text-left font-body animate-fade-in relative z-10">
            
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Check className="h-4 w-4" style={{ color: primaryColor }} />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {status === 'approved' ? 'Orçamento Aprovado & Pagamento' : 'Assinatura Digital'}
              </h3>
            </div>

            <div className="space-y-4">
              
              {status === 'pending' ? (
                <>
                  {/* Nome Completo */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Nome Completo</label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="Digite seu nome completo"
                      className="w-full bg-[#101014] border border-zinc-800 text-xs rounded-lg p-2.5 outline-none text-white focus-primary h-10 font-medium transition-all"
                    />
                  </div>

                  {/* CPF */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">CPF</label>
                    <input
                      type="text"
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
                      className="w-full bg-[#101014] border border-zinc-800 text-xs rounded-lg p-2.5 outline-none text-white focus-primary h-10 font-mono transition-all"
                    />
                  </div>

                  {/* Rubrica */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Rubrica (suas iniciais)</label>
                    <input
                      type="text"
                      value={signerRubrica}
                      onChange={(e) => setSignerRubrica(e.target.value.toUpperCase().slice(0, 3))}
                      placeholder="EX: JS"
                      className="w-full max-w-[100px] bg-[#101014] border border-zinc-800 text-xs rounded-lg p-2.5 outline-none text-white focus-primary h-10 font-bold uppercase text-center transition-all"
                    />
                  </div>

                  {/* Canvas */}
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
                    
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="px-3 py-1.5 border border-zinc-850 hover:border-zinc-700 bg-zinc-950 rounded text-[10px] text-zinc-400 hover:text-white cursor-pointer transition-all"
                    >
                      Limpar Assinatura
                    </button>
                  </div>

                  {/* Sign trigger button */}
                  <div className="pt-3">
                    <button
                      onClick={handleApprove}
                      className="w-full py-3.5 rounded-xl text-white font-extrabold text-xs uppercase tracking-widest transition-all hover:scale-102 cursor-pointer shadow-lg hover:shadow-xl flex items-center justify-center gap-2 border border-teal-500/10 animate-pulse-soft"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        boxShadow: `0 4px 14px ${primaryColor}33`
                      }}
                    >
                      <Check className="h-4 w-4" />
                      <span>{customBtnText || "Assinar e Aprovar"}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-5 animate-fade-in select-text">
                  
                  {/* Signed metadata */}
                  <div className="p-4 bg-[#08080a] border border-zinc-900 rounded-xl text-[10px] text-zinc-400 font-mono space-y-1 shadow-inner">
                    <div className="flex justify-between">
                      <span>Assinado digitalmente por:</span>
                      <span className="text-white font-bold">{signerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Documento CPF:</span>
                      <span className="text-white font-bold">{signerCpf}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Assinatura registrada em:</span>
                      <span className="text-white font-bold">{proposal?.approvedDate || new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-900/60 pt-1 mt-1 text-[9px] text-zinc-550 font-semibold">
                      <span>Protocolo de Autenticidade:</span>
                      <span>DF-{proposalId.includes('_') ? proposalId.split('_')[2]?.slice(0, 10) : proposalId.slice(0, 10)}</span>
                    </div>
                  </div>

                  {/* PAID CONFIRMED BLOCK */}
                  {proposal.payment_status === 'PAID' ? (
                    <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-3.5 shadow-lg animate-fade-in">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 flex items-center justify-center mx-auto border-emerald-500/40">
                        <CheckCircle className="h-5 w-5 animate-bounce-soft" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider">✓ Pagamento Confirmado!</h4>
                        <p className="text-[10px] text-zinc-400 font-body leading-relaxed max-w-sm mx-auto">
                          Seu pagamento de <strong>{currencySymbol} {formatMoney(amount)}</strong> foi compensado com sucesso via <strong>{proposal.payment_method || 'PIX'}</strong>.
                        </p>
                      </div>
                      <p className="text-[9px] text-zinc-550 font-mono select-none">
                        A equipe comercial foi notificada via WebSocket e o seu projeto foi automaticamente movido para a etapa de produção. Obrigado pela parceria!
                      </p>
                    </div>
                  ) : (
                    /* DYNAMIC CHECKOUT BLOCK */
                    <div className="space-y-4 border border-zinc-900 rounded-xl bg-zinc-950/40 overflow-hidden">
                      
                      {/* Checkout choice tabs */}
                      <div className="flex border-b border-zinc-900 select-none">
                        <button
                          type="button"
                          onClick={() => setPaymentTab('pix')}
                          className={`flex-1 py-3 text-xs font-bold text-center border-r border-zinc-900 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            paymentTab === 'pix' ? 'bg-[#0f0f12] text-white' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <Award className="h-3.5 w-3.5 text-emerald-400" />
                          PIX Dinâmico
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentTab('card')}
                          className={`flex-1 py-3 text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            paymentTab === 'card' ? 'bg-[#0f0f12] text-white' : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <CreditCard className="h-3.5 w-3.5 text-blue-400" />
                          Cartão de Crédito
                        </button>
                      </div>

                      <div className="p-5">
                        
                        {/* TAB: PIX CHECKOUT */}
                        {paymentTab === 'pix' && (
                          <div className="space-y-4 text-center">
                            <span className="text-[10px] text-zinc-400 leading-relaxed font-body block text-left">
                              Escaneie o QR Code abaixo com o app do seu banco para pagar instantaneamente. A aprovação é automática em segundos.
                            </span>

                            {/* QR Code image from QRServer API */}
                            <div className="bg-white p-2 rounded-xl h-[170px] w-[170px] mx-auto border border-zinc-200 shadow-md flex items-center justify-center select-none">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pixCode)}`}
                                alt="QR Code PIX"
                                className="h-full w-full object-contain"
                              />
                            </div>

                            {/* Copy and paste */}
                            <div className="space-y-1.5 select-text text-left">
                              <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Código Copia e Cola PIX</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  readOnly
                                  value={pixCode}
                                  className="flex-1 bg-[#101014] border border-zinc-900 text-[9px] text-zinc-400 rounded-lg px-2.5 h-8 font-mono outline-none select-all"
                                />
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(pixCode);
                                    setPixCopied(true);
                                    setTimeout(() => setPixCopied(false), 2000);
                                  }}
                                  className="px-3 h-8 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-bold cursor-pointer shrink-0 transition-all select-none"
                                >
                                  {pixCopied ? 'Copiado!' : 'Copiar'}
                                </button>
                              </div>
                            </div>

                            {/* Poll status */}
                            <div className="flex items-center justify-center gap-2 py-1 text-[9px] text-zinc-500 font-semibold select-none">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                              <span>Aguardando confirmação de pagamento...</span>
                            </div>

                            {/* Simulated Confirm button */}
                            <button
                              disabled={isPaying}
                              onClick={() => handleSimulatePayment('PIX')}
                              className="w-full mt-2 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 transition-all"
                            >
                              {isPaying ? (
                                <>
                                  <Clock className="h-3 w-3 animate-spin" />
                                  <span>Processando Pagamento...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="h-3 w-3 text-emerald-400" />
                                  <span>Simular Aprovação de PIX</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* TAB: CARD CHECKOUT */}
                        {paymentTab === 'card' && (
                          <div className="space-y-3.5 text-left">
                            <span className="text-[10px] text-zinc-400 leading-relaxed font-body block pb-1">
                              Insira os dados do seu cartão de crédito abaixo para efetuar a transação segura.
                            </span>

                            {/* Card Number */}
                            <div className="space-y-1">
                              <label className="text-[9px] text-zinc-500 font-bold uppercase block">Número do Cartão</label>
                              <input
                                type="text"
                                placeholder="4444 4444 4444 4444"
                                value={cardDetails.number}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                  const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
                                  setCardDetails({ ...cardDetails, number: formatted });
                                }}
                                className="w-full bg-[#101014] border border-zinc-900 text-xs rounded-lg px-3 h-9 font-mono text-white outline-none focus:border-zinc-700"
                              />
                            </div>

                            {/* Cardholder Name */}
                            <div className="space-y-1">
                              <label className="text-[9px] text-zinc-500 font-bold uppercase block">Nome Impresso no Cartão</label>
                              <input
                                type="text"
                                placeholder="NOME DO TITULAR"
                                value={cardDetails.name}
                                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value.toUpperCase() })}
                                className="w-full bg-[#101014] border border-zinc-900 text-xs rounded-lg px-3 h-9 font-body text-white outline-none focus:border-zinc-700"
                              />
                            </div>

                            {/* Expiry and CVV row */}
                            <div className="grid grid-cols-2 gap-3.5">
                              <div className="space-y-1">
                                <label className="text-[9px] text-zinc-500 font-bold uppercase block">Vencimento (MM/AA)</label>
                                <input
                                  type="text"
                                  placeholder="MM/AA"
                                  value={cardDetails.expiry}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    let formatted = val;
                                    if (val.length > 2) formatted = val.slice(0, 2) + '/' + val.slice(2);
                                    setCardDetails({ ...cardDetails, expiry: formatted });
                                  }}
                                  className="w-full bg-[#101014] border border-zinc-900 text-xs rounded-lg px-3 h-9 font-mono text-white outline-none focus:border-zinc-700 text-center"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] text-zinc-500 font-bold uppercase block">Código CVV</label>
                                <input
                                  type="password"
                                  placeholder="•••"
                                  value={cardDetails.cvv}
                                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                  className="w-full bg-[#101014] border border-zinc-900 text-xs rounded-lg px-3 h-9 font-mono text-white outline-none focus:border-zinc-700 text-center"
                                />
                              </div>
                            </div>

                            {/* Submit pay */}
                            <button
                              disabled={isPaying || !cardDetails.number || !cardDetails.name || !cardDetails.cvv}
                              onClick={() => handleSimulatePayment('Cartão de Crédito (Simulado)')}
                              className="w-full mt-3.5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-white font-extrabold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 transition-all select-none"
                            >
                              {isPaying ? (
                                <>
                                  <Clock className="h-3.5 w-3.5 animate-spin" />
                                  <span>Processando Pagamento...</span>
                                </>
                              ) : (
                                <>
                                  <CreditCard className="h-3.5 w-3.5 text-blue-400" />
                                  <span>Pagar {currencySymbol} {formatMoney(amount)}</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                      </div>
                    </div>
                  )}

                  {customThanks && proposal.payment_status !== 'PAID' && (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center shadow-sm select-text select-all">
                      <p className="text-xs text-zinc-350 italic font-medium">"{customThanks}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="text-[9px] text-zinc-650 font-mono text-center leading-normal pt-2 select-none">
              Ao assinar, você aceita digitalmente os termos do contrato DGFlow sob a conformidade jurídica MP 2.200-2.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
