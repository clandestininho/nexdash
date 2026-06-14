import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  FileText, 
  DollarSign, 
  Calendar, 
  Plus, 
  Minus, 
  Check, 
  Sparkles, 
  ArrowRight, 
  PlusCircle, 
  Trash2, 
  Layers, 
  Bot, 
  Zap, 
  SlidersHorizontal,
  FolderOpen
} from 'lucide-react';
import { apiFetch } from '../lib/api';

const DEFAULT_CONTRACT_TEMPLATE = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

IDENTIFICAÇÃO DAS PARTES CONTRATANTES

Pelo presente instrumento particular de Contrato, {{Nome do Prestador}}, com sede na {{Endereço do Prestador}}, {{Número do Endereço Prestador}} - {{Bairro do Prestador}}, na cidade de {{Cidade do Prestador}}, estado de {{Estado do Prestador}}, inscrito no CNPJ/CPF (MF) sob o nº {{CPF/CNPJ do Prestador}}, representado por {{Nome do Prestador}} (CONTRATADO)

e

{{Nome do Cliente}}, pessoa jurídica/física, com sede/residência em {{Endereço do Cliente}}, {{Número do Endereço Cliente}} - {{Bairro do Cliente}}, na {{Cidade do Cliente}} no estado de {{Estado do Cliente}}, inscrito no CNPJ/CPF sob o nº {{CPF/CNPJ do Cliente}}, neste ato representado por {{Representante do Cliente}}. (CONTRATANTE),

Ambas devidamente representadas na forma de seus respectivos Contratos Sociais, têm entre si justo e acordado o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas e condições seguintes:

01 - DO OBJETO DO CONTRATO
1.1. O presente Contrato tem como objeto, a prestação pela CONTRATADO à CONTRATANTE, dos seguintes serviços:
{{Serviços Inclusos}}

02 - DO VALOR E CONDIÇÕES DE PAGAMENTO
2.1. Pelos serviços prestados, a CONTRATANTE pagará à CONTRATADA o valor bruto total de {{Valor Total}}, sujeito a um desconto de {{Valor do Desconto}}, resultando no valor líquido e final de {{Valor Final}}.
2.2. O faturamento será sob as seguintes condições de pagamento: {{Condições de Pagamento}} via {{Forma de Pagamento}}.
2.3. O prazo final acordado para entrega total do projeto é de {{Prazo do Contrato}}.

Data: {{Data}}`;

export default function NewSaleModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('chooser'); // chooser | quick-sale | wizard
  const [wizardStep, setWizardStep] = useState(1); // 1, 2, 3, 4

  // Data collections from APIs with fallback lists
  const [contacts, setContacts] = useState([]);
  const [servicesOptions, setServicesOptions] = useState([
    { id: '1', name: 'Design de Marca / Identidade Visual', price: 3500 },
    { id: '2', name: 'Consultoria Estratégica de Marketing', price: 6000 },
    { id: '3', name: 'Gestão Mensal de Tráfego Pago', price: 1500 },
    { id: '4', name: 'Landing Page de Conversão', price: 2500 },
    { id: '5', name: 'E-commerce Completo Shopify', price: 8000 },
    { id: '6', name: 'Software Sob Medida Express', price: 12000 }
  ]);

  // Loading indicator for quick submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FORMS STATE ---
  // Quick Sale states
  const [qsClient, setQsClient] = useState('');
  const [qsService, setQsService] = useState('');
  const [qsDesc, setQsDesc] = useState('');
  const [qsAmount, setQsAmount] = useState('');
  const [qsDate, setQsDate] = useState(new Date().toISOString().split('T')[0]);
  const [qsPaymentMode, setQsPaymentMode] = useState('vista'); // vista | parcelado | recorrente
  const [qsStatus, setQsStatus] = useState('pending'); // pending | partial | received
  const [qsCategory, setQsCategory] = useState('Design');
  const [qsGenerateTask, setQsGenerateTask] = useState(false);

  // Wizard Step 1: Basic Info
  const [wClientName, setWClientName] = useState('');
  const [wClientCpfCnpj, setWClientCpfCnpj] = useState('');
  const [wClientRepresentative, setWClientRepresentative] = useState('');
  const [wProjectName, setWProjectName] = useState('');
  const [wDescription, setWDescription] = useState('');
  const [wClientAddress, setWClientAddress] = useState('');
  const [wClientNum, setWClientNum] = useState('');
  const [wClientBairro, setWClientBairro] = useState('');
  const [wClientCity, setWClientCity] = useState('');
  const [wClientState, setWClientState] = useState('');

  // Wizard Step 2: Services list
  const [wServicesList, setWServicesList] = useState([
    { id: 'ws-1', name: 'Design de Identidade Visual', description: 'Criação de logotipo, paleta de cores e manual da marca', unitPrice: 3500, quantity: 1 }
  ]);
  const [wDiscountValue, setWDiscountValue] = useState('0');

  // Wizard Step 3: Billing & Terms
  const [wIsRecurrent, setWIsRecurrent] = useState(false);
  const [wPaymentMethod, setWPaymentMethod] = useState('PIX ou Transferência Bancária');
  const [wPaymentConditions, setWPaymentConditions] = useState('À vista com 5% de desconto');
  const [wProjectStartMode, setWProjectStartMode] = useState('days'); // days | date
  const [wProjectStartDays, setWProjectStartDays] = useState('3');
  const [wProjectStartDate, setWProjectStartDate] = useState('');
  const [wDeliveryPeriod, setWDeliveryPeriod] = useState('30 dias corridos');
  const [wProposalValidity, setWProposalValidity] = useState('30');

  // Wizard Step 4: Contract pairing
  const [activeTemplateText, setActiveTemplateText] = useState(DEFAULT_CONTRACT_TEMPLATE);
  const [compiledText, setCompiledText] = useState('');

  // Fetch contacts and custom templates on initialization
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const res = await apiFetch('/api/contacts');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setContacts(data);
        }
      } catch (err) {
        console.error('Erro ao buscar contatos:', err);
      }
    };
    loadContacts();

    const loadServices = async () => {
      try {
        const res = await apiFetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data && data.services_list) {
            const list = JSON.parse(data.services_list);
            setServicesOptions(list.map(s => ({
              id: s.id,
              name: s.title,
              price: s.price
            })));
          }
        }
      } catch (err) {
        console.error('Erro ao carregar serviços no modal de venda:', err);
      }
    };
    loadServices();

    // Check if there is an active custom template in Proposals
    const storedTemplate = localStorage.getItem('dgflow_active_template');
    if (storedTemplate) {
      setActiveTemplateText(storedTemplate);
    }

    // Set up global window event listener
    const handleOpen = () => {
      setIsOpen(true);
      setCurrentView('chooser');
      setWizardStep(1);
    };

    const handleServicesUpdated = (e) => {
      const list = e.detail;
      if (Array.isArray(list)) {
        setServicesOptions(list.map(s => ({
          id: s.id,
          name: s.title,
          price: s.price
        })));
      }
    };

    window.addEventListener('open-new-sale-modal', handleOpen);
    window.addEventListener('services_updated', handleServicesUpdated);
    
    return () => {
      window.removeEventListener('open-new-sale-modal', handleOpen);
      window.removeEventListener('services_updated', handleServicesUpdated);
    };
  }, []);

  // Sync BRL unit value if service selected in Quick Sale
  const handleSelectServiceQuickSale = (name) => {
    setQsService(name);
    const matched = servicesOptions.find(opt => opt.name === name);
    if (matched) {
      setQsAmount(matched.price.toString());
    }
  };

  // --- WIZARD FORM MATHS ---
  const getSubtotalValue = () => {
    return wServicesList.reduce((acc, curr) => acc + (parseFloat(curr.unitPrice || 0) * parseInt(curr.quantity || 1)), 0);
  };
  const getFinalValue = () => {
    const sub = getSubtotalValue();
    const disc = parseFloat(wDiscountValue || 0);
    return Math.max(0, sub - disc);
  };

  // Compile contract logic
  const handleCompileContract = () => {
    const subtotal = getSubtotalValue();
    const discount = parseFloat(wDiscountValue || 0);
    const finalVal = getFinalValue();

    const servicesSummary = wServicesList.map((s, idx) => {
      return `${idx + 1}. ${s.name} (${s.quantity}x) - R$ ${(s.unitPrice * s.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
   * Detalhes: ${s.description || 'Não especificado'}`;
    }).join('\n');

    const shortcodeMap = {
      '{{Nome do Prestador}}': 'Gleison',
      '{{Endereço do Prestador}}': 'Av. Boa Viagem',
      '{{Número do Endereço Prestador}}': '1000',
      '{{Bairro do Prestador}}': 'Boa Viagem',
      '{{Cidade do Prestador}}': 'Recife',
      '{{Estado do Prestador}}': 'PE',
      '{{CPF/CNPJ do Prestador}}': '12.345.678/0001-99',
      
      '{{Nome do Cliente}}': wClientName || '[Nome do Cliente]',
      '{{Endereço do Cliente}}': wClientAddress || '[Endereço]',
      '{{Número do Endereço Cliente}}': wClientNum || '[Número]',
      '{{Bairro do Cliente}}': wClientBairro || '[Bairro]',
      '{{Cidade do Cliente}}': wClientCity || '[Cidade]',
      '{{Estado do Cliente}}': wClientState || '[Estado]',
      '{{CPF/CNPJ do Cliente}}': wClientCpfCnpj || '[CPF/CNPJ]',
      '{{Representante do Cliente}}': wClientRepresentative || '[Representante]',

      '{{Nome do Projeto}}': wProjectName || '[Nome do Projeto]',
      '{{Serviços Inclusos}}': servicesSummary || '[Serviços]',
      '{{Prazo do Contrato}}': wDeliveryPeriod || '[Prazo]',

      '{{Valor Total}}': `R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      '{{Valor do Desconto}}': `R$ ${discount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      '{{Valor Final}}': `R$ ${finalVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      '{{Condições de Pagamento}}': wPaymentConditions || '[Condições]',
      '{{Forma de Pagamento}}': wPaymentMethod || '[Método]',
      '{{Data}}': new Date().toLocaleDateString('pt-BR')
    };

    let compiled = activeTemplateText;
    for (const [shortcode, val] of Object.entries(shortcodeMap)) {
      compiled = compiled.replace(new RegExp(shortcode, 'g'), val);
    }
    setCompiledText(compiled);
  };

  // Step changes listener in step 4 compile
  useEffect(() => {
    if (wizardStep === 4) {
      handleCompileContract();
    }
  }, [wizardStep]);

  // --- SUBMIT HANDLERS ---
  const handleSaveQuickSale = (e) => {
    e.preventDefault();
    if (!qsClient || !qsAmount || !qsDate) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);

    const newTx = {
      id: 'tx-' + Date.now(),
      type: 'income',
      client: qsClient,
      description: qsDesc || qsService || 'Venda de Serviço',
      category: qsCategory,
      amount: parseFloat(qsAmount),
      date: qsDate,
      status: qsStatus === 'received' ? 'received' : qsStatus === 'pending' ? 'pending' : 'received' // aligns with finance statuses
    };

    // Save to local storage
    const stored = localStorage.getItem('dgflow_transactions');
    let currentTxs = [];
    if (stored) {
      try {
        currentTxs = JSON.parse(stored);
      } catch (e) {
        currentTxs = [];
      }
    }
    const updated = [newTx, ...currentTxs];
    localStorage.setItem('dgflow_transactions', JSON.stringify(updated));

    // Sync to backend settings
    apiFetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dgflow_transactions: JSON.stringify(updated)
      })
    }).catch(err => console.error('Erro ao sincronizar transação no servidor:', err));

    // Simulate task creation if switch is ON
    if (qsGenerateTask) {
      const storedHistory = localStorage.getItem('dgflow_task_history') || '[]';
      const history = JSON.parse(storedHistory);
      history.push({
        id: 't-' + Date.now(),
        title: `Acompanhar entrega: ${qsClient} - ${qsService || 'Serviço'}`,
        client: qsClient,
        date: qsDate,
        status: 'todo'
      });
      localStorage.setItem('dgflow_task_history', JSON.stringify(history));
    }

    // Trigger reactive window reload event
    window.dispatchEvent(new CustomEvent('dgflow_transactions_updated'));
    setIsSubmitting(false);
    setIsOpen(false);
    
    // Reset Form
    setQsClient('');
    setQsService('');
    setQsDesc('');
    setQsAmount('');
    setQsPaymentMode('vista');
    setQsStatus('pending');
    setQsCategory('Design');
    setQsGenerateTask(false);
  };

  const handleSaveWizardProposal = (e) => {
    e.preventDefault();
    if (!wClientName || !wProjectName) {
      alert("Por favor, informe ao menos o cliente e o título da proposta.");
      return;
    }

    setIsSubmitting(true);

    const newProposal = {
      id: 'prop-' + Date.now(),
      projectName: wProjectName,
      clientName: wClientName,
      amount: getFinalValue(),
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      compiledText: compiledText
    };

    const stored = localStorage.getItem('dgflow_proposals');
    let currentProps = [];
    if (stored) {
      try {
        currentProps = JSON.parse(stored);
      } catch (e) {
        currentProps = [];
      }
    }
    const updated = [newProposal, ...currentProps];
    localStorage.setItem('dgflow_proposals', JSON.stringify(updated));

    // Try to sync with server
    apiFetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProposal)
    }).catch(err => console.error('Erro ao salvar proposta no servidor:', err));

    // Trigger reactive window reload event
    window.dispatchEvent(new CustomEvent('dgflow_proposals_updated'));
    setIsSubmitting(false);
    setIsOpen(false);

    // Reset wizard
    setWClientName('');
    setWClientCpfCnpj('');
    setWClientRepresentative('');
    setWProjectName('');
    setWDescription('');
    setWClientAddress('');
    setWClientNum('');
    setWClientBairro('');
    setWClientCity('');
    setWClientState('');
    setWServicesList([
      { id: 'ws-1', name: 'Design de Identidade Visual', description: 'Criação de logotipo, paleta de cores e manual da marca', unitPrice: 3500, quantity: 1 }
    ]);
    setWDiscountValue('0');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#0c0c0e] border border-zinc-900 rounded-2xl w-full max-w-2xl text-white overflow-hidden shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-900/60 transition-all z-10"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* 1. VIEW: CHOOSER */}
        {currentView === 'chooser' && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center space-y-2 max-w-sm mx-auto">
              <h2 className="text-lg font-bold text-white tracking-tight">O que você deseja fazer?</h2>
              <p className="text-[11px] text-zinc-500 font-body">Escolha uma ação de venda rápida direta ou elabore um orçamento estruturado</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              {/* Option 1: Quick Sale */}
              <button
                onClick={() => setCurrentView('quick-sale')}
                className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 hover:border-[#e13a40]/20 hover:bg-[#e13a40]/5 text-left transition-all duration-350 flex flex-col justify-between group h-[200px]"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-white group-hover:text-[#e13a40] transition-colors">Venda Rápida</h3>
                  <p className="text-[10px] text-zinc-500 font-body leading-relaxed">
                    Lance uma venda imediata no fluxo de caixa. Ideal para pagamentos recorrentes rápidos ou faturamentos diretos.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 group-hover:text-white transition-colors uppercase tracking-wider">
                  <span>Lançar Agora</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>

              {/* Option 2: Wizard Proposal */}
              <button
                onClick={() => {
                  setCurrentView('wizard');
                  setWizardStep(1);
                }}
                className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 hover:border-[#e13a40]/20 hover:bg-[#e13a40]/5 text-left transition-all duration-350 flex flex-col justify-between group h-[200px]"
              >
                <div className="h-10 w-10 rounded-xl bg-[#e13a40]/10 flex items-center justify-center text-[#e13a40] border border-[#e13a40]/20 group-hover:scale-105 transition-transform duration-200">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-white group-hover:text-[#e13a40] transition-colors">Novo Orçamento</h3>
                  <p className="text-[10px] text-zinc-500 font-body leading-relaxed">
                    Crie uma proposta comercial completa passo a passo, detalhe serviços com controle de quantidade, valores e vincule o contrato.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 group-hover:text-white transition-colors uppercase tracking-wider">
                  <span>Criar Proposta</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>

            </div>
          </div>
        )}

        {/* 2. VIEW: QUICK SALE FORM */}
        {currentView === 'quick-sale' && (
          <form onSubmit={handleSaveQuickSale} className="p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
              <button
                type="button"
                onClick={() => setCurrentView('chooser')}
                className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider"
              >
                ← Voltar
              </button>
              <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Nova Venda Rápida</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Client field */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Cliente *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    list="contacts-list"
                    placeholder="Ex: Marina Sousa"
                    value={qsClient}
                    onChange={(e) => setQsClient(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#e13a40] transition-colors"
                  />
                  <datalist id="contacts-list">
                    {contacts.map(c => <option key={c.id} value={c.name} />)}
                    <option value="Carlos Silva" />
                    <option value="Marina Sousa" />
                    <option value="Construtora Pernambuco" />
                  </datalist>
                </div>
              </div>

              {/* Service options dropdown */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Serviço / Produto</label>
                <select
                  value={qsService}
                  onChange={(e) => handleSelectServiceQuickSale(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#e13a40] transition-colors font-semibold"
                >
                  <option value="">-- selecione um serviço comum --</option>
                  {servicesOptions.map(opt => (
                    <option key={opt.id} value={opt.name}>{opt.name}</option>
                  ))}
                  <option value="Outro">Outro serviço customizado</option>
                </select>
              </div>

              {/* Description */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Descrição Detalhada</label>
                <textarea
                  placeholder="Ex: Desenvolvimento da identidade visual corporativa..."
                  value={qsDesc}
                  onChange={(e) => setQsDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#e13a40] transition-colors resize-none"
                />
              </div>

              {/* Value and due date */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Valor Bruto (R$) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[10px] text-zinc-500 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={qsAmount}
                    onChange={(e) => setQsAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg py-2.5 pl-8 pr-3 text-xs text-white outline-none focus:border-[#e13a40] transition-colors font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Vencimento *</label>
                <input
                  type="date"
                  required
                  value={qsDate}
                  onChange={(e) => setQsDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-xs text-white outline-none focus:border-[#e13a40] transition-colors font-mono"
                />
              </div>

              {/* Payment mode pill tabs */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Faturamento</label>
                <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-900">
                  {[
                    { id: 'vista', label: 'À Vista' },
                    { id: 'parcelado', label: 'Parcelado' },
                    { id: 'recorrente', label: 'Recorrente' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setQsPaymentMode(mode.id)}
                      className={`py-1.5 rounded text-[10px] font-bold text-center transition-all ${
                        qsPaymentMode === mode.id
                          ? 'bg-[#e13a40] text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status pill tabs */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Status Financeiro</label>
                <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-900">
                  {[
                    { id: 'pending', label: 'Pendente' },
                    { id: 'partial', label: 'Parcial' },
                    { id: 'received', label: 'Pago' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setQsStatus(st.id)}
                      className={`py-1.5 rounded text-[10px] font-bold text-center transition-all ${
                        qsStatus === st.id
                          ? st.id === 'received' ? 'bg-emerald-600 text-white' : st.id === 'partial' ? 'bg-orange-500 text-white' : 'bg-rose-500 text-white'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Categoria Financeira</label>
                <select
                  value={qsCategory}
                  onChange={(e) => setQsCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#e13a40] transition-colors font-semibold"
                >
                  <option value="Design">Design</option>
                  <option value="Consultoria">Consultoria</option>
                  <option value="Software">Software</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Infraestrutura">Infraestrutura</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              {/* Automate Task Switch */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-900 mt-2">
                <div className="space-y-0.5 pr-2">
                  <span className="text-[10px] font-bold text-white block">Gerar Tarefa de Acompanhamento</span>
                  <span className="text-[9px] text-zinc-500 font-body">Cria uma pendência automática na agenda no dia do vencimento</span>
                </div>
                <button
                  type="button"
                  onClick={() => setQsGenerateTask(!qsGenerateTask)}
                  className={`w-9 h-5 rounded-full transition-all relative ${
                    qsGenerateTask ? 'bg-emerald-600' : 'bg-zinc-800'
                  }`}
                >
                  <span className={`h-4 w-4 bg-white rounded-full absolute top-0.5 transition-all ${
                    qsGenerateTask ? 'right-0.5' : 'left-0.5'
                  }`} />
                </button>
              </div>

            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between gap-3 border-t border-zinc-900 mt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="py-2.5 px-5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs font-semibold transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/10 flex items-center gap-1.5 transition-all"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Transação'}
              </button>
            </div>
          </form>
        )}

        {/* 3. VIEW: PROPOSAL WIZARD */}
        {currentView === 'wizard' && (
          <div className="flex flex-col h-[85vh] max-h-[620px]">
            
            {/* Header with step steps bar */}
            <div className="p-5 border-b border-zinc-900 shrink-0">
              <div className="flex items-center gap-3 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    if (wizardStep > 1) setWizardStep(wizardStep - 1);
                    else setCurrentView('chooser');
                  }}
                  className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider"
                >
                  ← Voltar
                </button>
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Novo Orçamento</h2>
              </div>

              {/* Progress step dots */}
              <div className="flex items-center gap-2 pt-1.5">
                {[
                  { step: 1, name: 'Informações Básicas' },
                  { step: 2, name: 'Selecione os Serviços' },
                  { step: 3, name: 'Condições de Faturamento' },
                  { step: 4, name: 'Contrato e Conclusão' }
                ].map((s) => (
                  <div key={s.step} className="flex-1 flex items-center gap-1.5">
                    <div className={`h-1.5 rounded-full flex-1 transition-all ${
                      wizardStep >= s.step ? 'bg-[#e13a40]' : 'bg-zinc-800'
                    }`} />
                    <span className={`text-[8px] font-bold uppercase tracking-wider hidden md:inline shrink-0 ${
                      wizardStep === s.step ? 'text-[#e13a40]' : 'text-zinc-600'
                    }`}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scrollable Step Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
              
              {/* STEP 1: BASIC INFO */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg border border-[#e13a40]/15 bg-[#e13a40]/5 text-[#e13a40] text-[10px] font-medium leading-relaxed">
                    💡 <strong className="text-white">Dica:</strong> As propostas criadas ficam salvas na aba de Orçamentos e geram o portal de assinatura integrado para o cliente.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Proposal Title */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Título do Projeto / Proposta *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Identidade Visual e Site Corporativo - Nexfy"
                        value={wProjectName}
                        onChange={(e) => setWProjectName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#e13a40] transition-colors"
                      />
                    </div>

                    {/* Client Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Nome do Cliente *</label>
                      <input
                        type="text"
                        required
                        list="contacts-list"
                        placeholder="Ex: Marina Sousa"
                        value={wClientName}
                        onChange={(e) => setWClientName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#e13a40] transition-colors"
                      />
                    </div>

                    {/* Client CPF/CNPJ */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">CNPJ / CPF do Cliente</label>
                      <input
                        type="text"
                        placeholder="00.000.000/0001-00"
                        value={wClientCpfCnpj}
                        onChange={(e) => setWClientCpfCnpj(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#e13a40] transition-colors font-mono"
                      />
                    </div>

                    {/* Representative Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Representante Legal</label>
                      <input
                        type="text"
                        placeholder="Nome de quem assina"
                        value={wClientRepresentative}
                        onChange={(e) => setWClientRepresentative(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#e13a40] transition-colors"
                      />
                    </div>

                    {/* Client Address */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Endereço do Cliente</label>
                      <input
                        type="text"
                        placeholder="Av. Paulista"
                        value={wClientAddress}
                        onChange={(e) => setWClientAddress(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#e13a40] transition-colors"
                      />
                    </div>

                    {/* 3 columns: Number, Bairro, City */}
                    <div className="grid grid-cols-3 gap-2 sm:col-span-2">
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Número</label>
                        <input
                          type="text"
                          placeholder="100"
                          value={wClientNum}
                          onChange={(e) => setWClientNum(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-xs text-white outline-none focus:border-[#e13a40] transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Bairro</label>
                        <input
                          type="text"
                          placeholder="Centro"
                          value={wClientBairro}
                          onChange={(e) => setWClientBairro(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-xs text-white outline-none focus:border-[#e13a40] transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Cidade/UF</label>
                        <input
                          type="text"
                          placeholder="São Paulo - SP"
                          value={wClientCity}
                          onChange={(e) => setWClientCity(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-xs text-white outline-none focus:border-[#e13a40] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Description scope */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Resumo do Escopo (Aparece no Contrato)</label>
                      <textarea
                        rows={3}
                        placeholder="Escreva brevemente os objetivos gerais e limites deste projeto de prestação de serviço..."
                        value={wDescription}
                        onChange={(e) => setWDescription(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#e13a40] transition-colors resize-none"
                      />
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 2: SERVICES LIST & PRICING */}
              {wizardStep === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Serviços da proposta ({wServicesList.length})</span>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setWServicesList([...wServicesList, {
                          id: 'ws-' + Date.now(),
                          name: 'Novo Serviço Adicionado',
                          description: 'Escopo detalhado do serviço...',
                          unitPrice: 1000,
                          quantity: 1
                        }]);
                      }}
                      className="py-1 px-3 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] font-bold transition-all flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Adicionar Linha</span>
                    </button>
                  </div>

                  {/* Services listing stack */}
                  <div className="space-y-4">
                    {wServicesList.map((srv, idx) => (
                      <div key={srv.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-3 relative group">
                        
                        {/* Remove item button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (wServicesList.length === 1) {
                              alert("Ao menos um serviço deve constar no orçamento.");
                              return;
                            }
                            setWServicesList(wServicesList.filter(s => s.id !== srv.id));
                          }}
                          className="absolute top-4 right-4 p-1 rounded-lg border border-zinc-850 text-zinc-600 hover:text-rose-500 hover:border-rose-950/20 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          
                          {/* Service Name */}
                          <div className="sm:col-span-6 space-y-1">
                            <label className="text-[9px] text-zinc-500 font-bold uppercase">Nome do Serviço #{idx + 1}</label>
                            <input
                              type="text"
                              value={srv.name}
                              onChange={(e) => {
                                const list = [...wServicesList];
                                list[idx].name = e.target.value;
                                setWServicesList(list);
                              }}
                              className="w-full bg-zinc-900 border border-zinc-850 rounded-lg p-2 text-xs text-white outline-none focus:border-[#e13a40]"
                            />
                          </div>

                          {/* Unit price */}
                          <div className="sm:col-span-3 space-y-1">
                            <label className="text-[9px] text-zinc-500 font-bold uppercase">Preço Unitário (R$)</label>
                            <input
                              type="number"
                              value={srv.unitPrice}
                              onChange={(e) => {
                                const list = [...wServicesList];
                                list[idx].unitPrice = parseFloat(e.target.value) || 0;
                                setWServicesList(list);
                              }}
                              className="w-full bg-zinc-900 border border-zinc-850 rounded-lg p-2 text-xs text-white outline-none focus:border-[#e13a40] font-mono font-semibold"
                            />
                          </div>

                          {/* Quantity control */}
                          <div className="sm:col-span-3 space-y-1">
                            <label className="text-[9px] text-zinc-500 font-bold uppercase block">Quantidade</label>
                            <div className="flex items-center bg-zinc-900 border border-zinc-850 rounded-lg overflow-hidden h-8.5 mt-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (srv.quantity <= 1) return;
                                  const list = [...wServicesList];
                                  list[idx].quantity = srv.quantity - 1;
                                  setWServicesList(list);
                                }}
                                className="px-2 py-1 text-zinc-400 hover:text-white transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="flex-1 text-center text-xs font-mono font-bold text-white select-none">
                                {srv.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...wServicesList];
                                  list[idx].quantity = srv.quantity + 1;
                                  setWServicesList(list);
                                }}
                                className="px-2 py-1 text-zinc-400 hover:text-white transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          {/* Short description */}
                          <div className="sm:col-span-9 space-y-1">
                            <label className="text-[9px] text-zinc-500 font-bold uppercase">Detalhamento do entregável</label>
                            <input
                              type="text"
                              placeholder="Breve descrição dos entregáveis desse item..."
                              value={srv.description}
                              onChange={(e) => {
                                const list = [...wServicesList];
                                list[idx].description = e.target.value;
                                setWServicesList(list);
                              }}
                              className="w-full bg-zinc-900 border border-zinc-855 rounded-lg p-2 text-[11px] text-zinc-300 outline-none focus:border-[#e13a40]"
                            />
                          </div>

                          {/* Subtotal preview */}
                          <div className="sm:col-span-3 flex flex-col justify-end text-right px-1">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tight">Subtotal</span>
                            <span className="text-xs font-mono font-bold text-[#e13a40] mt-1">
                              R$ {(srv.unitPrice * srv.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Calculations math summary box */}
                  <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Resumo de Valores</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[10px] text-zinc-400 font-body">Subtotal:</span>
                        <span className="text-xs font-mono font-semibold text-zinc-300">R$ {getSubtotalValue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* Discount input */}
                    <div className="flex items-center gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block text-right">Aplicar Desconto (R$)</label>
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1.5 text-[9px] text-zinc-500 font-bold">R$</span>
                          <input
                            type="number"
                            placeholder="0"
                            value={wDiscountValue}
                            onChange={(e) => setWDiscountValue(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-lg py-1 pl-6 pr-2 text-xs text-white text-right font-mono font-bold outline-none focus:border-[#e13a40]"
                          />
                        </div>
                      </div>

                      <div className="h-8 w-px bg-zinc-900 hidden sm:block" />

                      {/* Final summary glowing value */}
                      <div className="text-right">
                        <span className="text-[9px] text-[#e13a40] font-bold uppercase tracking-wider block">Valor Líquido Final</span>
                        <span className="text-lg font-mono font-extrabold text-white">
                          R$ {getFinalValue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* STEP 3: BILLING CONDITIONS */}
              {wizardStep === 3 && (
                <div className="space-y-5">
                  
                  {/* Glowing Recurrence Switch container matching step 3 screenshot */}
                  <div className="p-4 rounded-xl border border-[#e13a40]/20 bg-[#e13a40]/5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-[#e13a40]" />
                        <span>Faturamento Recorrente / Mensalidade</span>
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-body leading-relaxed max-w-md">
                        Ative caso esta proposta represente um contrato de fee mensal ou assinatura contínua recorrente.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setWIsRecurrent(!wIsRecurrent)}
                      className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${
                        wIsRecurrent ? 'bg-[#e13a40]' : 'bg-zinc-800'
                      }`}
                    >
                      <span className={`h-4 w-4 bg-white rounded-full absolute top-0.5 transition-all ${
                        wIsRecurrent ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Method dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Forma de Pagamento</label>
                      <select
                        value={wPaymentMethod}
                        onChange={(e) => setWPaymentMethod(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#e13a40] font-semibold"
                      >
                        <option value="PIX ou Transferência Bancária">PIX ou Transferência Bancária</option>
                        <option value="Boleto Bancário Integrado">Boleto Bancário Integrado</option>
                        <option value="Cartão de Crédito Online via Link">Cartão de Crédito Online via Link</option>
                        <option value="Faturamento Faturado PJ">Faturamento Faturado PJ</option>
                      </select>
                    </div>

                    {/* Condition dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Condição de Pagamento</label>
                      <select
                        value={wPaymentConditions}
                        onChange={(e) => setWPaymentConditions(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 text-xs text-white outline-none focus:border-[#e13a40] font-semibold"
                      >
                        <option value="À vista com 5% de desconto">À vista com 5% de desconto</option>
                        <option value="50% entrada + 50% na aprovação final">50% entrada + 50% na aprovação final</option>
                        <option value="Parcelado em 3x sem juros no cartão">Parcelado em 3x sem juros no cartão</option>
                        <option value="Recorrência mensal fixa com vencimento todo dia 10">Recorrência mensal fixa com vencimento todo dia 10</option>
                        <option value="Faturamento em 12 parcelas consecutivas">Faturamento em 12 parcelas consecutivas</option>
                      </select>
                    </div>

                  </div>

                  {/* 3 columns: Project Start, Delivery period, proposal validity */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-zinc-900">
                    
                    {/* Col 1: Início do projeto */}
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-3">
                      <span className="text-[10px] text-[#e13a40] font-bold uppercase tracking-wider block">Início do Projeto</span>
                      
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-zinc-300 hover:text-white">
                          <input
                            type="radio"
                            name="startMode"
                            checked={wProjectStartMode === 'days'}
                            onChange={() => setWProjectStartMode('days')}
                            className="accent-[#e13a40]"
                          />
                          <span>Dias após aprovação</span>
                        </label>

                        {wProjectStartMode === 'days' && (
                          <input
                            type="text"
                            placeholder="Ex: 3 dias úteis"
                            value={wProjectStartDays}
                            onChange={(e) => setWProjectStartDays(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-[#e13a40]"
                          />
                        )}

                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-zinc-300 hover:text-white pt-1">
                          <input
                            type="radio"
                            name="startMode"
                            checked={wProjectStartMode === 'date'}
                            onChange={() => setWProjectStartMode('date')}
                            className="accent-[#e13a40]"
                          />
                          <span>Data específica</span>
                        </label>

                        {wProjectStartMode === 'date' && (
                          <input
                            type="date"
                            value={wProjectStartDate}
                            onChange={(e) => setWProjectStartDate(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-[#e13a40] font-mono"
                          />
                        )}
                      </div>
                    </div>

                    {/* Col 2: Delivery term */}
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-3 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-[#e13a40] font-bold uppercase tracking-wider block">Prazo de Entrega</span>
                        <p className="text-[9px] text-zinc-500 font-body mt-0.5 leading-relaxed">Tempo total necessário do início à entrega final.</p>
                      </div>

                      <input
                        type="text"
                        placeholder="Ex: 30 dias corridos"
                        value={wDeliveryPeriod}
                        onChange={(e) => setWDeliveryPeriod(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none focus:border-[#e13a40] font-semibold"
                      />
                    </div>

                    {/* Col 3: Proposal validity */}
                    <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 space-y-3 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-[#e13a40] font-bold uppercase tracking-wider block">Validade da Proposta</span>
                        <p className="text-[9px] text-zinc-500 font-body mt-0.5 leading-relaxed">Dias nos quais as condições comerciais estão garantidas.</p>
                      </div>

                      <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5">
                        <input
                          type="number"
                          placeholder="30"
                          value={wProposalValidity}
                          onChange={(e) => setWProposalValidity(e.target.value)}
                          className="bg-transparent text-white text-xs font-bold font-mono w-full outline-none"
                        />
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight select-none shrink-0">dias</span>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* STEP 4: CONTRACT PAIRING & COMPILATION */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Contrato de Prestação de Serviços</span>
                    <span className="px-2 py-0.5 text-[8px] font-bold uppercase font-mono text-[#e13a40] bg-[#e13a40]/10 border border-[#e13a40]/20 rounded">
                      Compilação Automática
                    </span>
                  </div>

                  {/* Contract preview textarea */}
                  <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 space-y-3 font-mono text-[10px] leading-relaxed text-zinc-300 h-64 overflow-y-auto scrollbar-thin">
                    {compiledText.split('\n').map((line, i) => (
                      <p key={i} className={line.trim() === '' ? 'h-3' : ''}>{line}</p>
                    ))}
                  </div>

                  {/* Pricing revision banner */}
                  <div className="p-3.5 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-xs text-zinc-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-[11px] font-semibold text-zinc-300">Valores e prazos compilados perfeitamente no contrato.</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase block leading-none">Total da Proposta</span>
                      <span className="text-sm font-mono font-bold text-white">R$ {getFinalValue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Bottom Sticky step navigation bar */}
            <div className="p-5 border-t border-zinc-900 flex items-center justify-between shrink-0 bg-[#0c0c0e]">
              <button
                type="button"
                onClick={() => {
                  if (wizardStep > 1) setWizardStep(wizardStep - 1);
                  else setCurrentView('chooser');
                }}
                className="py-2 px-4 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs font-semibold transition-all"
              >
                Voltar
              </button>

              {wizardStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    // Quick validation for step 1
                    if (wizardStep === 1 && (!wClientName || !wProjectName)) {
                      alert("Por favor, preencha o Nome do Cliente e o Título do Projeto.");
                      return;
                    }
                    setWizardStep(wizardStep + 1);
                  }}
                  className="py-2 px-5 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-xs font-bold text-white shadow-md shadow-[#e13a40]/15 flex items-center gap-1.5 transition-all"
                >
                  <span>Próximo Passo</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveWizardProposal}
                  disabled={isSubmitting}
                  className="py-2 px-6 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-xs font-bold text-white shadow-md shadow-[#e13a40]/20 flex items-center gap-1.5 transition-all"
                >
                  {isSubmitting ? 'Gerando proposta...' : 'Finalizar e Salvar Proposta'}
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
