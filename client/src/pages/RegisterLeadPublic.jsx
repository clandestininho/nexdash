import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserPlus, Mail, Phone, Building, MapPin, CheckCircle, FileText, Sparkles } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function RegisterLeadPublic() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user') || '1'; // fallback to user 1

  // Dynamic White-label Configurations
  const [companyName, setCompanyName] = useState('NEXDASH');
  const [companyLogo, setCompanyLogo] = useState('');
  const [customFields, setCustomFields] = useState({
    doc: true,
    cep: true,
    notes: true,
    project_interest: true
  });

  // Visual Editor Customization Configurations
  const [pageBadgeText, setPageBadgeText] = useState('Design Profissional');
  const [pageMainTitle, setPageMainTitle] = useState('');
  const [pageSubtitleText, setPageSubtitleText] = useState('');
  const [pageDescText, setPageDescText] = useState('');
  const [pageButtonText, setPageButtonText] = useState('Enviar Cadastro');
  const [pageSecondaryBtnText, setPageSecondaryBtnText] = useState('Ver Portfólio');
  const [pageHeroImage, setPageHeroImage] = useState('');
  
  // Country Selector State
  const [pais, setPais] = useState('Brasil');

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [doc, setDoc] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [cep, setCep] = useState('');
  const [endereço, setEndereço] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [obs, setObs] = useState('');
  const [interesse, setInteresse] = useState('');

  // UI Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch Public White-label details from new endpoint
  useEffect(() => {
    const fetchPublicInfo = async () => {
      try {
        const res = await fetch(`/api/contacts/public-info/${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.companyName) setCompanyName(data.companyName);
          if (data.companyLogo) setCompanyLogo(data.companyLogo);
          if (data.customFields) setCustomFields(data.customFields);

          // Loaded customized settings from server database settings
          if (data.pageBadgeText) setPageBadgeText(data.pageBadgeText);
          if (data.pageMainTitle) setPageMainTitle(data.pageMainTitle);
          if (data.pageSubtitleText !== undefined) setPageSubtitleText(data.pageSubtitleText);
          if (data.pageDescText !== undefined) setPageDescText(data.pageDescText);
          if (data.pageButtonText) setPageButtonText(data.pageButtonText);
          if (data.pageSecondaryBtnText) setPageSecondaryBtnText(data.pageSecondaryBtnText);
          if (data.pageHeroImage !== undefined) setPageHeroImage(data.pageHeroImage);
        }
      } catch (err) {
        console.error('Erro ao buscar info pública:', err);
      }
    };
    fetchPublicInfo();
  }, [userId]);

  // Automatic CEP lookup
  useEffect(() => {
    if (pais !== 'Brasil') return;
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length === 8) {
      const lookupCep = async () => {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
          const data = await res.json();
          if (!data.erro) {
            setEndereço(data.logradouro || '');
            setBairro(data.bairro || '');
            setCidade(data.localidade || '');
            setEstado(data.uf || '');
          }
        } catch (err) {
          console.error('Erro na consulta de CEP:', err);
        }
      };
      lookupCep();
    }
  }, [cep, pais]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setErrorMessage('Por favor, preencha os campos obrigatórios (*).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    // Prepend correct phone code dynamically depending on selected country
    const phoneDdi = pais === 'Brasil' ? '55' : pais === 'Portugal' ? '351' : '';
    const cleanedPhone = phoneDdi + phone.replace(/\D/g, '');

    try {
      const response = await fetch('/api/contacts/public-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone: cleanedPhone,
          email,
          doc,
          cep,
          endereço,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          empresa,
          obs: obs || `Projeto de interesse: ${interesse}`,
          userId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar cadastro. Verifique os dados.');
      }

      setIsSuccess(true);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#070708] text-zinc-100 flex flex-col justify-center items-center py-12 px-4 font-body animate-fade-in relative z-10">
        
        {/* Subtle Brand Watermark Background */}
        {companyLogo && (
          <div 
            className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.015] select-none"
            style={{
              backgroundImage: `url(${companyLogo})`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '35%',
              filter: 'brightness(0) invert(1)'
            }}
          />
        )}

        <div className="w-full max-w-md bg-[#0c0c0e]/90 border border-zinc-900 rounded-2xl p-8 text-center space-y-5 shadow-2xl relative overflow-hidden z-10 backdrop-blur-md">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#e13a40]" />
          
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto">
            <CheckCircle className="h-8 w-8" />
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">Cadastro Recebido!</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Olá, <strong>{name}</strong>! Seus dados foram cadastrados com sucesso em nosso sistema e direcionados para a equipe da <strong>{pageMainTitle || companyName}</strong>.
          </p>
          <p className="text-[11px] text-zinc-500 font-body">
            Entraremos em contato via WhatsApp ou e-mail o mais breve possível. Obrigado!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070708] text-zinc-100 flex flex-col justify-center items-center py-12 px-4 font-body animate-fade-in relative overflow-hidden">
      
      {/* Colorful Gradient Ambient Lights in Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#e13a40]/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-orange-500/5 blur-[130px] pointer-events-none" />

      {/* Subtle Brand Watermark Background */}
      {companyLogo && (
        <div 
          className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.012] select-none"
          style={{
            backgroundImage: `url(${companyLogo})`,
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '38%',
            filter: 'brightness(0) invert(1)'
          }}
        />
      )}

      {/* Main Container sizing depending on split grid layout presence */}
      <div className={`w-full ${pageHeroImage ? 'max-w-5xl' : 'max-w-2xl'} z-10 transition-all duration-300`}>
        
        <div className={`grid grid-cols-1 ${pageHeroImage ? 'lg:grid-cols-12 gap-8 items-stretch' : 'gap-6'}`}>
          
          {/* Split-pane presentation left-side container */}
          {pageHeroImage && (
            <div className="lg:col-span-5 flex flex-col justify-between p-7 rounded-2xl bg-[#0c0c0e]/80 border border-zinc-900 shadow-xl backdrop-blur-md relative overflow-hidden group">
              <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#e13a40]/5 to-transparent pointer-events-none" />
              
              <div className="space-y-6 relative z-10">
                {/* Brand Header */}
                <div className="flex items-center gap-3">
                  {companyLogo ? (
                    <img 
                      src={companyLogo} 
                      alt={companyName} 
                      className="w-10 h-10 rounded-full border border-zinc-800 object-cover shadow-md"
                    />
                  ) : (
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#e13a40]/10 border border-[#e13a40]/20 text-[#e13a40] shadow-sm">
                      <UserPlus className="h-4 w-4" />
                    </div>
                  )}
                  <span className="font-extrabold text-base tracking-tight text-white uppercase bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                    {pageMainTitle || companyName}
                  </span>
                </div>

                {/* Badge text */}
                {pageBadgeText && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e13a40]/10 border border-[#e13a40]/25 text-[10px] font-black text-white uppercase tracking-wider w-fit select-none">
                    <Sparkles className="h-3.5 w-3.5 text-[#e13a40] animate-pulse" />
                    {pageBadgeText}
                  </span>
                )}

                {/* Subtitle / Headline */}
                <div className="space-y-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight">
                    {pageSubtitleText || `Conecte-se com ${pageMainTitle || companyName}`}
                  </h1>
                  <p className="text-zinc-400 text-xs leading-relaxed font-body">
                    {pageDescText || 'Preencha o formulário de cadastro ao lado com suas informações de contato e requisitos para iniciar nosso atendimento comercial.'}
                  </p>
                </div>
              </div>

              {/* Graphic Display representing Hero */}
              <div className="mt-8 relative aspect-[4/3] rounded-xl border border-zinc-850 bg-zinc-950 overflow-hidden shadow-inner select-none">
                <img 
                  src={pageHeroImage} 
                  alt="Destaque Estúdio" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
              </div>

            </div>
          )}

          {/* Form wrapper column */}
          <div className={`${pageHeroImage ? 'lg:col-span-7' : 'w-full'} flex flex-col justify-center`}>
            
            {/* Centered Brand intro (Only if no hero image is present) */}
            {!pageHeroImage && (
              <div className="text-center mb-6 space-y-2">
                {companyLogo ? (
                  <img 
                    src={companyLogo} 
                    alt={companyName} 
                    className="w-16 h-16 rounded-full mx-auto border border-[#1f1f1f] object-cover shadow-lg mb-2"
                  />
                ) : (
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#e13a40]/10 border border-[#e13a40]/20 shadow-md">
                    <UserPlus className="h-5 w-5" />
                  </div>
                )}

                {pageBadgeText && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e13a40]/10 border border-[#e13a40]/20 text-[9px] font-black text-white uppercase tracking-wider mx-auto mb-1 select-none">
                    {pageBadgeText}
                  </span>
                )}

                <h1 className="text-2xl font-extrabold text-white tracking-tight">{pageMainTitle || companyName}</h1>
                <p className="text-xs text-zinc-400">
                  {pageSubtitleText || `Preencha seus dados para se cadastrar em ${pageMainTitle || companyName}`}
                </p>
                {pageDescText && (
                  <p className="text-zinc-500 text-[11px] leading-relaxed max-w-md mx-auto pt-1 font-body">{pageDescText}</p>
                )}
              </div>
            )}

            {/* Form Box */}
            <div className="bg-[#0c0c0e]/90 border border-zinc-900 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e13a40] to-red-800" />

              {errorMessage && (
                <div className="p-3.5 bg-[#e13a40]/10 border border-[#e13a40]/20 text-[#e13a40] rounded-xl text-xs font-semibold animate-fade-in">
                  ⚠️ {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Dados Pessoais Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 border-b border-[#1f1f1f] pb-2">
              Dados Cadastrais
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* País de Origem */}
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Selecione seu País</label>
                <select
                  value={pais}
                  onChange={(e) => {
                    setPais(e.target.value);
                    setDoc('');
                    setCep('');
                  }}
                  className="w-full bg-[#1a1a1a] text-white text-xs rounded-xl border border-[#1f1f1f] focus:border-[#e13a40] h-9 px-3 outline-none font-semibold cursor-pointer"
                >
                  <option value="Brasil">🇧🇷 Brasil</option>
                  <option value="Portugal">🇵🇹 Portugal</option>
                  <option value="Outro">🌐 Outro País</option>
                </select>
              </div>

              {/* Nome Completo */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Nome Completo *</label>
                <Input 
                  required
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 focus:border-[#e13a40] h-9"
                />
              </div>

              {/* E-mail */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">E-mail *</label>
                <Input 
                  required
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 focus:border-[#e13a40] h-9 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Telefone */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Telefone / WhatsApp *</label>
                <div className="flex gap-2">
                  <span className="bg-[#1a1a1a] border border-[#1f1f1f] text-xs text-zinc-300 px-3 rounded-lg select-none font-bold h-9 flex items-center">
                    {pais === 'Brasil' ? '🇧🇷 +55' : pais === 'Portugal' ? '🇵🇹 +351' : '🌐 +'}
                  </span>
                  <Input 
                    required
                    type="text"
                    placeholder={pais === 'Brasil' ? '(00) 00000-0000' : pais === 'Portugal' ? '912 345 678' : 'Número completo'}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 focus:border-[#e13a40] h-9 font-mono flex-1"
                  />
                </div>
              </div>

              {/* CPF / CNPJ or NIF (Conditional) */}
              {customFields.doc && (
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    {pais === 'Brasil' ? 'CPF / CNPJ' : pais === 'Portugal' ? 'NIF (Nº de Contribuinte)' : 'Documento / VAT ID'}
                  </label>
                  <Input 
                    type="text"
                    placeholder={pais === 'Brasil' ? '000.000.000-00' : pais === 'Portugal' ? '123 456 789' : 'Identidade tributária'}
                    value={doc}
                    onChange={(e) => setDoc(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 focus:border-[#e13a40] h-9 font-mono"
                  />
                </div>
              )}
            </div>

            {/* Empresa */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Empresa</label>
              <Input 
                type="text"
                placeholder="Nome da sua empresa (opcional)"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 focus:border-[#e13a40] h-9"
              />
            </div>
          </div>

          {/* Endereço Section (Conditional) */}
          {customFields.cep && (
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 border-b border-[#1f1f1f] pb-2">
                {pais === 'Brasil' ? 'Endereço Comercial' : pais === 'Portugal' ? 'Morada Comercial' : 'Endereço'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {/* CEP / Código Postal */}
                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    {pais === 'Brasil' ? 'CEP' : 'Código Postal'}
                  </label>
                  <Input 
                    type="text"
                    placeholder={pais === 'Brasil' ? '00000-000' : pais === 'Portugal' ? '1000-001' : 'ZIP / Postal Code'}
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 focus:border-[#e13a40] h-9 font-mono"
                  />
                </div>

                {/* Rua / Morada */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    {pais === 'Brasil' ? 'Rua / Logradouro' : pais === 'Portugal' ? 'Morada / Rua' : 'Endereço'}
                  </label>
                  <Input 
                    type="text"
                    placeholder={pais === 'Brasil' ? 'Nome da rua' : pais === 'Portugal' ? 'Rua das Flores, nº 10' : 'Endereço completo'}
                    value={endereço}
                    onChange={(e) => setEndereço(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 focus:border-[#e13a40] h-9"
                  />
                </div>

                {/* Número */}
                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Número</label>
                  <Input 
                    type="text"
                    placeholder="123"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 focus:border-[#e13a40] h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Bairro / Localidade */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    {pais === 'Brasil' ? 'Bairro' : pais === 'Portugal' ? 'Localidade / Freguesia' : 'Bairro / Região'}
                  </label>
                  <Input 
                    type="text"
                    placeholder="Bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 focus:border-[#e13a40] h-9"
                  />
                </div>

                {/* Cidade / Concelho */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    {pais === 'Brasil' ? 'Cidade' : pais === 'Portugal' ? 'Concelho' : 'Cidade'}
                  </label>
                  <Input 
                    type="text"
                    placeholder="Cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 focus:border-[#e13a40] h-9"
                  />
                </div>

                {/* Estado / Distrito */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    {pais === 'Brasil' ? 'Estado' : pais === 'Portugal' ? 'Distrito' : 'Estado / Província'}
                  </label>
                  <Input 
                    type="text"
                    placeholder={pais === 'Brasil' ? 'UF' : pais === 'Portugal' ? 'Lisboa' : 'Estado'}
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 focus:border-[#e13a40] h-9"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Projeto / Interesse (Conditional) */}
          {customFields.project_interest && (
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 border-b border-[#1f1f1f] pb-2">
                Interesse Principal
              </h3>
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Projeto / Serviço de Interesse</label>
                <Input 
                  type="text"
                  placeholder="Ex: Criação de Landing Page, Gestão de Anúncios..."
                  value={interesse}
                  onChange={(e) => setInteresse(e.target.value)}
                  className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 focus:border-[#e13a40] h-9"
                />
              </div>
            </div>
          )}

          {/* Observações Section (Conditional) */}
          {customFields.notes && (
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 border-b border-[#1f1f1f] pb-2">
                Observações
              </h3>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Informações Adicionais</label>
                <textarea
                  placeholder="Alguma observação ou comentário adicional?"
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  rows="3"
                  className="w-full bg-[#1a1a1a] border border-[#1f1f1f] rounded-xl p-3 text-xs text-white focus:border-[#e13a40] outline-none placeholder-zinc-600 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Submit Trigger */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#e13a40] hover:bg-[#c52f34] text-white font-bold py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-xs"
          >
            <UserPlus className="h-4 w-4" />
            <span>{isSubmitting ? 'Processando cadastro...' : (pageButtonText || 'Enviar Cadastro')}</span>
          </Button>

        </form>

        <p className="text-[10px] text-center text-zinc-600 font-medium">
          Seus dados serão protegidos e utilizados apenas para contato comercial com a <strong>{companyName}</strong>.
        </p>

      </div>
      </div>
      </div>
      </div>
    </div>
  );
}
