import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Check, 
  HelpCircle, 
  ArrowRight, 
  ShoppingBag, 
  Globe, 
  Sparkles,
  Link2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { apiFetch } from '../lib/api';

export default function Services() {
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [profileMoeda, setProfileMoeda] = useState('BRL');
  const [services, setServices] = useState([]);
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);

  // Form states for new service
  const [srvTitle, setSrvTitle] = useState('');
  const [srvSubtitle, setSrvSubtitle] = useState('');
  const [srvPrice, setSrvPrice] = useState('');
  const [srvTime, setSrvTime] = useState('');
  const [srvFeatures, setSrvFeatures] = useState('');
  const [srvContractTemplate, setSrvContractTemplate] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await apiFetch('/api/settings');
        if (res.ok) {
          const settings = await res.json();
          if (settings) {
            if (settings.profile_moeda) {
              setProfileMoeda(settings.profile_moeda);
            }
            if (settings.services_list) {
              setServices(JSON.parse(settings.services_list));
            } else {
              // Defaults
              const defaults = [
                {
                  id: 'srv-1',
                  title: 'Identidade Visual Completa',
                  subtitle: 'Marca, paleta de cores, tipografia e manual de marca',
                  price: 3500.00,
                  time: '20 dias úteis',
                  features: [
                    'Logotipo principal e secundário',
                    'Definição de tipografia e guia HSL',
                    'Manual de uso da marca em PDF',
                    'Mockups premium para redes sociais',
                    '03 rodadas de ajustes inclusas'
                  ],
                  contractTemplate: '',
                  popular: true,
                },
                {
                  id: 'srv-2',
                  title: 'Gestão de Social Media',
                  subtitle: 'Criação de criativos, copys e cronograma mensal',
                  price: 1800.00,
                  time: 'Mensal',
                  features: [
                    '12 posts estáticos/carrossel',
                    '04 vídeos no formato Reels/TikTok',
                    'Redação das legendas (Copywriting)',
                    'Agendamento e monitoramento básico',
                    'Relatório mensal de insights'
                  ],
                  contractTemplate: '',
                  popular: false,
                }
              ];
              setServices(defaults);
              await apiFetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ services_list: JSON.stringify(defaults) })
              });
            }
          }
        }
      } catch (err) {
        console.error('Error fetching settings currency:', err);
      }
    };
    loadData();
  }, []);

  const currencySymbol = profileMoeda === 'EUR' ? '€' : profileMoeda === 'USD' ? '$' : 'R$';

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const handleCopyCheckout = (srvTitle) => {
    navigator.clipboard.writeText(`https://dgflow.app/estudio/checkout/${srvTitle.toLowerCase().replace(/\s+/g, '-')}`);
    alert(`Link de Checkout copiado para "${srvTitle}"!`);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!srvTitle || !srvPrice) return;

    const newSrv = {
      id: 'srv-' + Date.now(),
      title: srvTitle,
      subtitle: srvSubtitle,
      price: parseFloat(srvPrice) || 0,
      time: srvTime || 'A combinar',
      features: srvFeatures.split('\n').filter(f => f.trim() !== ''),
      contractTemplate: srvContractTemplate,
      popular: false
    };

    const updated = [...services, newSrv];
    setServices(updated);
    setIsNewServiceModalOpen(false);

    // Reset fields
    setSrvTitle('');
    setSrvSubtitle('');
    setSrvPrice('');
    setSrvTime('');
    setSrvFeatures('');
    setSrvContractTemplate('');

    try {
      await apiFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services_list: JSON.stringify(updated) })
      });
      window.dispatchEvent(new CustomEvent('services_updated', { detail: updated }));
    } catch (err) {
      console.error('[Services] Error saving service list settings:', err);
    }
  };

  const handleDeleteService = async (id) => {
    if (confirm("Remover este serviço do catálogo corporativo?")) {
      const updated = services.filter(s => s.id !== id);
      setServices(updated);
      try {
        await apiFetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ services_list: JSON.stringify(updated) })
        });
        window.dispatchEvent(new CustomEvent('services_updated', { detail: updated }));
      } catch (err) {
        console.error('[Services] Error deleting service list settings:', err);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-fade-in text-zinc-100 p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <div className="p-1 bg-[#e13a40]/10 rounded-lg">
              <Briefcase className="h-6 w-6 text-[#e13a40]" />
            </div>
            Catálogo de Serviços
          </h1>
          <p className="text-sm text-zinc-400 mt-1 font-body">
            Gerencie seus pacotes de design e marketing, crie links de checkout rápidos e configure regras de faturamento.
          </p>
        </div>

        <button 
          onClick={() => setIsNewServiceModalOpen(true)}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] py-2.5 px-4 text-xs font-bold text-white shadow-lg shadow-[#e13a40]/10 transition-all h-9 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Adicionar Serviço</span>
        </button>
      </div>

      {/* Services Grid */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((srv) => (
            <Card 
              key={srv.id} 
              className={`bg-[#0c0c0e] border-[#1f1f23] text-white flex flex-col justify-between hover:border-zinc-800 transition-all duration-200 relative ${
                srv.popular ? 'ring-1 ring-[#e13a40] bg-gradient-to-b from-[#0c0c0e] to-[#121010]' : ''
              }`}
            >
              {srv.popular && (
                <span className="absolute -top-2.5 right-4 bg-[#e13a40] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(255,72,61,0.4)]">
                  Mais Vendido
                </span>
              )}

              <CardHeader className="pb-3 flex-row justify-between items-start">
                <div className="flex-1 pr-4">
                  <CardTitle className="text-sm font-extrabold text-white">{srv.title}</CardTitle>
                  <CardDescription className="text-zinc-500 text-[10px] mt-1 font-body leading-relaxed">{srv.subtitle}</CardDescription>
                </div>
                
                <button
                  onClick={() => handleDeleteService(srv.id)}
                  className="p-1 rounded text-zinc-550 hover:text-red-400 hover:bg-zinc-950/60 transition-colors shrink-0"
                  title="Excluir Serviço"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </CardHeader>

              <CardContent className="space-y-4 flex-1">
                
                {/* Pricing row */}
                <div className="flex items-baseline gap-1 bg-zinc-950/40 p-3 rounded-lg border border-zinc-900 select-none">
                  <span className="text-base font-black text-white font-mono">{currencySymbol} {srv.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span className="text-[10px] text-zinc-500 font-medium">/ {srv.time}</span>
                </div>

                {srv.contractTemplate && (
                  <div className="text-[9px] text-[#e13a40] font-bold bg-[#e13a40]/5 border border-[#e13a40]/10 px-2 py-0.5 rounded w-fit select-none font-mono">
                    ✓ Contrato Customizado
                  </div>
                )}

                {/* Scope Bullet points */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Escopo do Serviço</span>
                  <div className="space-y-2 text-xs">
                    {srv.features && srv.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-zinc-300">
                        <Check className="h-3.5 w-3.5 text-[#e13a40] shrink-0 mt-0.5" />
                        <span className="leading-tight text-[11px]">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>

              {/* Card Footer Actions */}
              <div className="p-6 pt-0 space-y-2">
                <button 
                  onClick={() => handleCopyCheckout(srv.title)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-zinc-900 hover:border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 py-2 px-4 text-xs font-semibold text-zinc-400 hover:text-white transition-all duration-150 h-9"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  <span>Link de Checkout</span>
                </button>

                <button 
                  onClick={() => alert(`Direcionando para elaboração de Orçamento de "${srv.title}"`)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] py-2 px-4 text-xs font-bold text-white transition-all h-9"
                >
                  <span>Gerar Proposta</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

            </Card>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-zinc-900 rounded-2xl p-16 flex flex-col items-center justify-center text-center bg-zinc-950/20">
          <div 
            onClick={() => setIsNewServiceModalOpen(true)}
            className="h-12 w-12 rounded-full bg-[#e13a40]/10 border border-[#e13a40]/20 flex items-center justify-center cursor-pointer hover:scale-105 hover:bg-[#e13a40]/20 transition-all text-[#e13a40] mb-4"
          >
            <Plus className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Nenhum serviço cadastrado</h3>
          <p className="text-zinc-500 text-xs max-w-sm mb-6 leading-relaxed">
            Comece populando seu catálogo de serviços para poder emitir orçamentos corporativos e compartilhar links de faturamento imediatos.
          </p>
        </div>
      )}

      {/* Checkout Customization Accordion */}
      <Card className="bg-[#0c0c0e] border-[#1f1f23] text-white">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-1.5 uppercase tracking-wider">
            <ShoppingBag className="h-4 w-4 text-[#e13a40]" />
            Configuração de Checkout e Pagamento
          </CardTitle>
          <CardDescription className="text-zinc-500 text-xs">
            Habilite formas de recebimento e regras de parcelamento do seu Estúdio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 font-body">
          
          {/* Option 1: Pix */}
          <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/20">
            <button 
              onClick={() => toggleAccordion('pix')}
              className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-white hover:bg-zinc-900/40"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Cobrança Automatizada via PIX</span>
              </div>
              {activeAccordion === 'pix' ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
            </button>
            
            {activeAccordion === 'pix' && (
              <div className="p-4 pt-0 text-[11px] text-zinc-400 space-y-2 border-t border-zinc-900">
                <p className="pt-3">O Pix é habilitado por padrão em todos os links de checkout. Os contratos exibirão automaticamente o QR code Pix e a chave cadastrada nas configurações do Financeiro.</p>
                <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 p-2 rounded border border-emerald-500/10 w-fit">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Taxa zero ativada!</span>
                </div>
              </div>
            )}
          </div>

          {/* Option 2: Parcelamento */}
          <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/20">
            <button 
              onClick={() => toggleAccordion('parcelas')}
              className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-white hover:bg-zinc-900/40"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#e13a40]" />
                <span>Regras de Parcelamento (Boleto/Crédito)</span>
              </div>
              {activeAccordion === 'parcelas' ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
            </button>
            
            {activeAccordion === 'parcelas' && (
              <div className="p-4 pt-0 text-[11px] text-zinc-400 space-y-3 border-t border-zinc-900">
                <p className="pt-3 font-body">Defina o número máximo de parcelas permitidas para contratos e faturamentos:</p>
                <div className="flex items-center gap-4 pb-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-semibold block">Máximo de Parcelas</label>
                    <select className="bg-[#101014] text-zinc-300 border border-zinc-800 text-[11px] p-2 rounded-xl outline-none focus:border-[#e13a40] cursor-pointer font-semibold">
                      <option value="3">Até 3x sem juros</option>
                      <option value="6">Até 6x sem juros</option>
                      <option value="12">Até 12x (com juros do emissor)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      {/* MODAL: NOVO SERVIÇO */}
      {isNewServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-[#0c0c0e] border border-[#1f1f23] text-white p-6 shadow-2xl animate-fade-in relative">
            <button 
              onClick={() => setIsNewServiceModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 font-bold text-lg"
            >
              ×
            </button>

            <h2 className="text-base font-bold text-white mb-1">Novo Serviço</h2>
            <p className="text-zinc-500 text-xs mb-6">Insira um novo pacote de serviços ao catálogo corporativo corporativo.</p>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-semibold">Título do Serviço *</label>
                <Input 
                  required
                  value={srvTitle}
                  onChange={(e) => setSrvTitle(e.target.value)}
                  placeholder="Ex: Landing Page Premium"
                  className="bg-zinc-950 border-zinc-900 text-white text-xs h-9"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-semibold">Subtítulo / Escopo Resumido</label>
                <Input 
                  value={srvSubtitle}
                  onChange={(e) => setSrvSubtitle(e.target.value)}
                  placeholder="Ex: LP de alta conversão otimizada para anúncios"
                  className="bg-zinc-950 border-zinc-900 text-white text-xs h-9"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">Valor do Serviço ({currencySymbol}) *</label>
                  <Input 
                    required
                    type="number"
                    value={srvPrice}
                    onChange={(e) => setSrvPrice(e.target.value)}
                    placeholder="Ex: 2500"
                    className="bg-zinc-950 border-zinc-900 text-white text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-400 font-semibold">Prazo / Frequência</label>
                  <Input 
                    value={srvTime}
                    onChange={(e) => setSrvTime(e.target.value)}
                    placeholder="Ex: 10 dias úteis"
                    className="bg-zinc-950 border-zinc-900 text-white text-xs h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-semibold">Itens de Escopo (Um por linha)</label>
                <textarea 
                  rows="4"
                  value={srvFeatures}
                  onChange={(e) => setSrvFeatures(e.target.value)}
                  placeholder="Ex:
Design exclusivo no Figma
Desenvolvimento Webflow
Integração de APIs CRM"
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-2.5 outline-none text-white focus:border-[#e13a40] text-xs font-body"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-semibold">Modelo de Contrato Customizado (Opcional)</label>
                <textarea 
                  rows="4"
                  value={srvContractTemplate}
                  onChange={(e) => setSrvContractTemplate(e.target.value)}
                  placeholder="Se deixado em branco, usará o modelo padrão de contratos..."
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-2.5 outline-none text-white focus:border-[#e13a40] text-[10px] font-mono"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#1f1f23] flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsNewServiceModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white font-bold"
                >
                  Salvar Serviço
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
