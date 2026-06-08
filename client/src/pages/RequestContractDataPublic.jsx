import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Building, 
  MapPin, 
  Mail, 
  Phone, 
  FileText, 
  Globe, 
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { apiFetch } from '../lib/api';
import { playBell, playWarning } from '../lib/sound';

export default function RequestContractDataPublic() {
  const { userId, contactId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Branding and Contact Data loaded from server
  const [branding, setBranding] = useState({
    companyName: 'NEXDASH',
    companyLogo: '',
    servicesList: [],
    defaultContractTemplate: ''
  });

  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    project_interest: '',
    project_value: 0
  });

  // Client Input Fields
  const [clientPais, setClientPais] = useState('Brasil');
  const [clientNome, setClientNome] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientDoc, setClientDoc] = useState('');
  const [clientCep, setClientCep] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientNum, setClientNum] = useState('');
  const [clientBairro, setClientBairro] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientState, setClientState] = useState('');
  const [clientRepresentative, setClientRepresentative] = useState('');

  // Fetch initial details
  useEffect(() => {
    const loadRequestDetails = async () => {
      try {
        const res = await apiFetch(`/api/contacts/public-contract-request/${userId}/${contactId}`);
        if (!res.ok) {
          throw new Error('Falha ao obter os dados da solicitação de contrato.');
        }
        const data = await res.json();
        if (data.branding) {
          setBranding(data.branding);
        }
        if (data.contact) {
          setContactInfo(data.contact);
          
          // Prefill inputs
          setClientNome(data.contact.name || '');
          setClientEmail(data.contact.email || '');
          setClientPhone(data.contact.phone || '');
          setClientDoc(data.contact.doc || '');
          setClientCep(data.contact.cep || '');
          setClientAddress(data.contact.endereço || '');
          setClientNum(data.contact.numero || '');
          setClientBairro(data.contact.bairro || '');
          setClientCity(data.contact.cidade || '');
          setClientState(data.contact.estado || '');
          setClientPais(data.contact.pais || 'Brasil');
          setClientRepresentative(data.contact.name || '');
        }
      } catch (err) {
        console.error('Error fetching request info:', err);
        setErrorMsg(err.message || 'Erro ao carregar dados do formulário.');
        playWarning();
      } finally {
        setIsLoading(false);
      }
    };
    loadRequestDetails();
  }, [userId, contactId]);

  // Automatic CEP Lookup for Brazil
  useEffect(() => {
    if (clientPais !== 'Brasil') return;
    const cleaned = clientCep.replace(/\D/g, '');
    if (cleaned.length === 8) {
      const lookupCep = async () => {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
          const data = await res.json();
          if (!data.erro) {
            setClientAddress(data.logradouro || '');
            setClientBairro(data.bairro || '');
            setClientCity(data.localidade || '');
            setClientState(data.uf || '');
          }
        } catch (err) {
          console.error('Erro na consulta de CEP:', err);
        }
      };
      lookupCep();
    }
  }, [clientCep, clientPais]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientNome || !clientEmail || !clientDoc) {
      alert('Por favor, preencha os campos obrigatórios (*).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Find matching service and contract template
      const matchedService = branding.servicesList.find(s => s.title === contactInfo.project_interest);
      const rawTemplate = matchedService?.contractTemplate || branding.defaultContractTemplate || '';

      const servicePrice = matchedService?.price || contactInfo.project_value || 0;
      const serviceFeatures = matchedService?.features ? matchedService.features.map((f, i) => `${i + 1}. ${f}`).join('\n') : '';

      // Compile template variables
      const shortcodeMap = {
        '{{Nome do Prestador}}': 'Gleison',
        '{{Endereço do Prestador}}': 'Av. Boa Viagem',
        '{{Número do Endereço Prestador}}': '1000',
        '{{Bairro do Prestador}}': 'Boa Viagem',
        '{{Cidade do Prestador}}': 'Recife',
        '{{Estado do Prestador}}': 'PE',
        '{{CPF/CNPJ do Prestador}}': '12.345.678/0001-99',
        
        '{{Nome do Cliente}}': clientNome,
        '{{Endereço do Cliente}}': clientAddress || '[Endereço do Cliente]',
        '{{Morada do Cliente}}': clientAddress || '[Morada do Cliente]',
        '{{Número do Endereço Cliente}}': clientNum || '',
        '{{Bairro do Cliente}}': clientBairro || '',
        '{{Cidade do Cliente}}': clientCity || '',
        '{{Estado do Cliente}}': clientState || '',
        '{{CPF/CNPJ do Cliente}}': clientDoc || '',
        '{{NIF do Cliente}}': clientDoc || '',
        '{{Representante do Cliente}}': clientRepresentative || clientNome,

        '{{Nome do Projeto}}': contactInfo.project_interest || 'Projeto Customizado',
        '{{Serviços Inclusos}}': serviceFeatures || contactInfo.project_interest || '[Serviço]',
        '{{Prazo do Contrato}}': matchedService?.time || 'A definir',

        '{{Valor Total}}': `R$ ${servicePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        '{{Valor do Desconto}}': 'R$ 0,00',
        '{{Valor Final}}': `R$ ${servicePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        '{{Condições de Pagamento}}': 'A definir',
        '{{Forma de Pagamento}}': 'A definir',
        '{{Número de Parcelas}}': '1',
        '{{Data}}': new Date().toLocaleDateString('pt-BR')
      };

      let compiled = rawTemplate;
      for (const [shortcode, val] of Object.entries(shortcodeMap)) {
        compiled = compiled.replace(new RegExp(shortcode, 'g'), val || `[${shortcode}]`);
      }

      // Prepare proposal services array
      const proposalServices = matchedService ? [{
        name: matchedService.title,
        desc: matchedService.subtitle || 'Serviço do catálogo',
        price: matchedService.price
      }] : [{
        name: contactInfo.project_interest || 'Projeto Customizado',
        desc: 'Serviço sob medida',
        price: contactInfo.project_value || 0
      }];

      // Post submission
      const payload = {
        name: clientNome,
        email: clientEmail,
        phone: clientPhone,
        doc: clientDoc,
        cep: clientCep,
        endereço: clientAddress,
        numero: clientNum,
        complemento: clientBairro, // Bairro gets mapped to complemento or customized
        bairro: clientBairro,
        cidade: clientCity,
        estado: clientState,
        pais: clientPais,
        compiledContractText: compiled,
        projectName: contactInfo.project_interest || 'Contrato Digital',
        amount: servicePrice,
        services: proposalServices
      };

      const res = await apiFetch(`/api/contacts/public-contract-submit/${userId}/${contactId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Falha ao processar e salvar os dados do contrato.');
      }

      setIsSuccess(true);
      playBell();

    } catch (err) {
      console.error('Submit contract error:', err);
      setErrorMsg(err.message || 'Erro ao submeter os dados. Tente novamente.');
      playWarning();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400 font-body">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-2 border-[#e13a40] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold tracking-wide">Carregando formulário seguro…</p>
        </div>
      </div>
    );
  }

  if (errorMsg && !isSuccess) {
    return (
      <div className="min-h-screen bg-[#070708] flex items-center justify-center p-4 font-body text-zinc-100">
        <div className="w-full max-w-md bg-[#0c0c0e] border border-zinc-900 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
          <div className="h-12 w-12 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h3 className="font-extrabold text-white text-base">Falha ao Abrir Formulário</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">{errorMsg}</p>
          <p className="text-[11px] text-zinc-500">Por favor, solicite um novo link ao seu consultor.</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#070708] bg-radial-glow flex items-center justify-center p-4 font-body text-zinc-100 animate-fade-in">
        <div className="w-full max-w-md bg-zinc-950/80 backdrop-blur-xl border border-zinc-900 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Dados Enviados!</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Obrigado! Seus dados cadastrais foram recebidos com sucesso e o contrato digital foi compilado.
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Nossa equipe irá revisar as informações e você receberá o link para assinatura em breve no seu WhatsApp/Email.
            </p>
          </div>
          <div className="pt-4 border-t border-zinc-900 flex items-center justify-center gap-2 text-[10px] text-zinc-500 font-mono">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Processado com Criptografia Segura</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070708] bg-radial-glow text-zinc-100 font-body py-12 px-4 select-none">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        
        {/* Top Company Logo / Header */}
        <div className="text-center space-y-4">
          {branding.companyLogo ? (
            <img 
              src={branding.companyLogo} 
              alt={branding.companyName}
              className="h-12 mx-auto object-contain bg-white rounded-lg p-1"
            />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-white mx-auto">
              {branding.companyName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-lg font-black uppercase tracking-wider text-white">
              Formulário de Contrato Seguro
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Fornecido por <strong>{branding.companyName}</strong>
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-[#121214] border border-zinc-900 rounded-xl p-4 flex items-start gap-3 select-text">
          <FileText className="h-5 w-5 text-[#e13a40] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Serviço Solicitado</h4>
            <p className="text-xs text-zinc-350 leading-relaxed">
              Você está preenchendo as informações para formalizar o contrato do serviço: <strong className="text-white">{contactInfo.project_interest || 'Projeto Personalizado'}</strong>.
            </p>
          </div>
        </div>

        {/* Main Form */}
        <Card className="bg-zinc-950/80 backdrop-blur-md border border-zinc-900 text-white">
          <CardHeader className="pb-3 border-b border-zinc-900">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">Informações de Faturamento</CardTitle>
            <CardDescription className="text-zinc-550 text-xs">Informe os dados exatamente como constam em seu registro fiscal ou civil.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4 select-text">
              
              {/* Pais e Documento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-450 font-bold uppercase">País de Residência / Sede *</label>
                  <select
                    value={clientPais}
                    onChange={(e) => {
                      setClientPais(e.target.value);
                      setClientDoc('');
                    }}
                    className="w-full bg-[#101014] border border-zinc-850 text-white text-xs h-10 rounded-lg px-3 outline-none focus:ring-1 focus:ring-[#e13a40]/30 cursor-pointer"
                  >
                    <option value="Brasil">🇧🇷 Brasil</option>
                    <option value="Portugal">🇵🇹 Portugal</option>
                    <option value="Outro">🌐 Outro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-450 font-bold uppercase">
                    {clientPais === 'Brasil' ? 'CNPJ / CPF *' : clientPais === 'Portugal' ? 'NIF (Nº de Contribuinte) *' : 'Documento / Tax ID *'}
                  </label>
                  <Input
                    required
                    value={clientDoc}
                    onChange={(e) => setClientDoc(e.target.value)}
                    placeholder={clientPais === 'Brasil' ? 'CNPJ ou CPF' : clientPais === 'Portugal' ? 'Ex: 123456789' : 'Tax ID'}
                    className="bg-[#101014] border-zinc-850 text-white text-xs h-10"
                  />
                </div>
              </div>

              {/* Nome ou Razão Social */}
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-450 font-bold uppercase">Razão Social ou Nome Completo *</label>
                <Input
                  required
                  value={clientNome}
                  onChange={(e) => setClientNome(e.target.value)}
                  placeholder="Nome legal completo para constar no contrato"
                  className="bg-[#101014] border-zinc-850 text-white text-xs h-10"
                />
              </div>

              {/* Representante Legal (se PJ) */}
              {clientPais !== 'Outro' && (
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-450 font-bold uppercase">Representante Legal (Assinante)</label>
                  <Input
                    value={clientRepresentative}
                    onChange={(e) => setClientRepresentative(e.target.value)}
                    placeholder="Nome do representante para assinar o documento"
                    className="bg-[#101014] border-zinc-850 text-white text-xs h-10"
                  />
                </div>
              )}

              {/* Email e Telefone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-450 font-bold uppercase">E-mail de Faturamento *</label>
                  <Input
                    required
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Ex: financeiro@empresa.com"
                    className="bg-[#101014] border-zinc-850 text-white text-xs h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-450 font-bold uppercase">Telefone / WhatsApp *</label>
                  <Input
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ex: (11) 99999-9999"
                    className="bg-[#101014] border-zinc-850 text-white text-xs h-10"
                  />
                </div>
              </div>

              {/* CEP / Código Postal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-zinc-900 pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-450 font-bold uppercase">
                    {clientPais === 'Brasil' ? 'CEP *' : 'Código Postal *'}
                  </label>
                  <Input
                    required
                    value={clientCep}
                    onChange={(e) => setClientCep(e.target.value)}
                    placeholder={clientPais === 'Brasil' ? '00000-000' : 'Código postal'}
                    className="bg-[#101014] border-zinc-850 text-white text-xs h-10"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs text-zinc-450 font-bold uppercase">
                    {clientPais === 'Brasil' ? 'Endereço / Logradouro *' : 'Morada / Rua *'}
                  </label>
                  <Input
                    required
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Rua, avenida, etc."
                    className="bg-[#101014] border-zinc-850 text-white text-xs h-10"
                  />
                </div>
              </div>

              {/* Número, Bairro, Cidade, Estado */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-450 font-bold uppercase">Número *</label>
                  <Input
                    required
                    value={clientNum}
                    onChange={(e) => setClientNum(e.target.value)}
                    placeholder="Ex: 123"
                    className="bg-[#101014] border-zinc-850 text-white text-xs h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-450 font-bold uppercase">Bairro / Freguesia</label>
                  <Input
                    value={clientBairro}
                    onChange={(e) => setClientBairro(e.target.value)}
                    placeholder="Bairro"
                    className="bg-[#101014] border-zinc-850 text-white text-xs h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-450 font-bold uppercase">Cidade *</label>
                  <Input
                    required
                    value={clientCity}
                    onChange={(e) => setClientCity(e.target.value)}
                    placeholder="Cidade"
                    className="bg-[#101014] border-zinc-850 text-white text-xs h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-450 font-bold uppercase">Estado / Distrito *</label>
                  <Input
                    required
                    value={clientState}
                    onChange={(e) => setClientState(e.target.value)}
                    placeholder="UF"
                    className="bg-[#101014] border-zinc-850 text-white text-xs h-10"
                  />
                </div>
              </div>

              {/* Submit Row */}
              <div className="pt-6 border-t border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>Seus dados estão protegidos por criptografia de ponta.</span>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-primary text-white text-xs font-bold hover:scale-102 transition-all shadow-glow hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none h-11"
                >
                  <span>{isSubmitting ? 'Processando Contrato…' : 'Gerar Contrato Digital'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
