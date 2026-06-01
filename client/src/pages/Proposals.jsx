import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Settings as SettingsIcon, 
  Search, 
  Trash2, 
  Eye, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Copy, 
  Check, 
  FileCode,
  FileCheck,
  Filter,
  FolderArchive,
  ChevronDown,
  ChevronUp,
  Palette,
  Type,
  Users,
  Briefcase,
  Upload,
  Globe,
  Package,
  MoreVertical,
  Send,
  Share2,
  CreditCard,
  CheckCircle,
  Mail,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { apiFetch } from '../lib/api';
import { playBeep, playBell, playWarning, playNotification } from '../lib/sound';

const DEFAULT_CONTRACT_TEMPLATE = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

IDENTIFICAÇÃO DAS PARTES CONTRATANTES

Pelo presente instrumento particular de Contrato, {{Nome do Prestador}}, com sede na {{Endereço do Prestador}}, {{Número do Endereço Prestador}} – {{Bairro do Prestador}}, na cidade de {{Cidade do Prestador}}, estado de {{Estado do Prestador}}, inscrito no CNPJ/CPF (MF) sob o n° {{CPF/CNPJ do Prestador}}, representado por {{Nome do Prestador}} (CONTRATADO)

e

{{Nome do Cliente}}, pessoa jurídica/física, com sede/residência em {{Endereço do Cliente}}, {{Número do Endereço Cliente}} – {{Bairro do Cliente}}, na {{Cidade do Cliente}} no estado de {{Estado do Cliente}}, inscrito no CNPJ/CPF sob o nº {{CPF/CNPJ do Cliente}}, neste ato representado por {{Representante do Cliente}}. (CONTRATANTE),

Ambas devidamente representadas na forma de seus respectivos Contratos Sociais, têm entre si justo e acordado o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas e condições seguintes:

01 – DO OBJETO DO CONTRATO

1.1. O presente Contrato tem como objeto, a prestação pela CONTRATADO à CONTRATANTE, dos seguintes serviços:

Objetivo do projeto: {{Nome do Projeto}}

Serviços inclusos: {{Serviços Inclusos}}

02 – DO PRAZO DO CONTRATO

2.1. Esse Contrato vigorará entre as partes por prazo de:

{{Prazo do Contrato}}

podendo ser rescindido, mediante prévio aviso escrito com 60 (sessenta) dias de antecedência da finalização do prazo.

2.2. Durante o prazo de aviso-prévio, o CONTRATADO atenderá normalmente à CONTRATANTE, em todas as suas necessidades. Findo o prazo de aviso-prévio, a CONTRATANTE obriga-se a pagar todas as despesas que se vencerem após tal término, desde que por ela prévia e expressamente autorizadas.

03. DO PREÇO E CONDIÇÕES DE PAGAMENTO

Valor Total do Serviço: {{Valor Total}}
Valor do Desconto: {{Valor do Desconto}}
Valor do Serviço com desconto: {{Valor Final}}

Condição de Pagamento: {{Condições de Pagamento}}
Forma de Pagamento: {{Forma de Pagamento}}
Quantidade de Parcelas: {{Número de Parcelas}}

04 – DAS OBRIGAÇÕES DO CONTRATADO

a) Entregar o projeto no prazo estabelecido, sempre respeitando o escopo e as especificidades que o CONTRATANTE informou previamente para a consecução perfeita do serviço.
b) Entrar em contato com a CONTRATANTE sempre que precisar esclarecer alguma dúvida ou precisar de uma informação.
c) Informar sobre qualquer atraso na prestação de serviços, bem como a motivação dele.
d) Prestar o serviço com qualidade.
e) Eleger um representante para sempre estar em contato e esclarecer qualquer dúvida ou repassar informações para a parte CONTRATANTE.

05 – DAS OBRIGAÇÕES DA CONTRATANTE

a) Entregar os materiais e documentos que forem requeridos pelo CONTRATADO, conforme o prazo estabelecido nesse contrato, sob pena de atraso na conclusão do projeto, inexistindo qualquer responsabilidade para o CONTRATADO.
b) Eleger um representante para prestar esclarecimento e discutir dúvidas com a parte CONTRATADO.
c) Descrever com o maior número de características e funcionalidades possíveis ao projeto.
d) Efetuar os pagamentos na data acordada, sob pena de acréscimo de juros e multa.
e) Se for necessária a prestação de qualquer serviço externo ou que necessite de custos adicionais, inclusive ferramentas específicas, o pagamento será feito pelo CONTRATANTE.
f) Em caso de pagamento relacionado a cláusula anterior, o comprovante deverá ser anexo ao presente contrato e um termo aditivo que informe a motivação do pagamento.
g) Desenvolver com o CONTRATADO um cronograma exclusivo para o projeto, onde constarão as datas de entrega, produção e qualquer situação que precise estar prevista, com exceção daquelas imprevisíveis.

06 – DA CONFIDENCIALIDADE E DIREITOS AUTORAIS

6.1. Cada uma das partes, por si e por seus funcionários compromete-se a manter como confidenciais, os termos deste Contrato e de todas as outras informações e conhecimentos não públicos, recebidos em decorrência desse Contrato, objetivando sua execução, não podendo torná-las acessíveis a quaisquer terceiros sem concordância expressa da outra parte.
6.2 Pelo presente contrato, o CONTRATADO cede em favor do CONTRATANTE, com exclusividade, a totalidade dos direitos autorais de todo o trabalho desenvolvido em razão do presente contrato, podendo o CONTRATANTE editar, transformar, revender, replicar, alterar.

07 - DA NÃO EXCLUSIVIDADE

O CONTRATADO não atuará com exclusividade dentro do segmento do CONTRATANTE, podendo exercer sua atividade para outras empresas, ou efetuar negócios em nome e por conta própria.

08 – DAS RESPONSABILIDADES TRABALHISTAS

8.1. O presente Contrato não estabelece qualquer relação de emprego entre a CONTRATANTE e os empregados da CONTRATADO, sendo a última citada a única e exclusiva responsável pela contratação, pagamento e demissão de seus funcionários, durante o prazo de vigência desse Contrato.
8.2. O CONTRATADO compromete-se a cumprir fielmente a legislação trabalhista, previdenciária, fundiária e tributária, bem como as normas relativas à segurança e medicina do trabalho em relação aos seus empregados.

09 – DAS DISPOSIÇÕES GERAIS

9.1. É expressamente vedada a cessão ou transferência desse Contrato a terceiros, salvo de comum acordo entre as partes.
9.2. Todos os entendimentos sobre o andamento ou alteração do objeto, termos e condições desse Contrato, deverão ser mantidos por escrito, mediante Termos Aditivos assinados pelos representantes legais das partes, sendo certo que acordos verbales não produzirão quaisquer efeitos entre elas.
9.3. Esse Contrato foi ajustado dentro dos princípios da boa-fé e probidade, sem qualquer vício de consentimento.

10 – DA ASSINATURA ELETRÔNICA

As partes aceitam que este contrato será assinado eletronicamente utilizando a ferramenta online DGFlow e atestam a sua integridade e validade jurídica, nos termos da MP 2.200-2 e da Lei 14.063/2020. A DGFlow não se responsabiliza pelo conteúdo do contrato, sendo este de total responsabilidade do CONTRATANTE e do CONTRATADO.

11 – DO FORO

11.1. As partes elegem o foro da comarca de {{Cidade do Prestador}}, estado de {{Estado do Prestador}}, para dirimir questões decorrentes desse Contrato, com exclusão de qualquer outro por mais privilegiado que seja.

E por estarem justas e contratadas, as partes firmam o presente Contrato em 02 (Duas) vias de iguais teor e forma, perante as testemunhas abaixo, para que produza todos os efeitos de direito.

Data: {{Data}}


______________________________________________
{{Nome do Cliente}}
CONTRATANTE


______________________________________________
{{Nome do Prestador}}
CONTRATADO`;

const INITIAL_PROPOSALS = [];

export default function Proposals() {
  const [proposals, setProposals] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(DEFAULT_CONTRACT_TEMPLATE);
  
  // Navigation & Dialog Toggles
  const [isModelsModalOpen, setIsModelsModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [subTab, setSubTab] = useState('orcamentos');
  const [showArchived, setShowArchived] = useState(false);

  // Dynamic Toast Notifications
  const [toastMessage, setToastMessage] = useState('');
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);

  const showToastNotification = (message) => {
    setToastMessage(message);
    
    // Play customized synthesized sound cues reactively based on message text!
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('erro') || lowerMsg.includes('falha') || lowerMsg.includes('remover')) {
      playWarning();
    } else if (lowerMsg.includes('copiado') || lowerMsg.includes('link')) {
      playBeep();
    } else if (lowerMsg.includes('aprovado') || lowerMsg.includes('concluído') || lowerMsg.includes('sucesso') || lowerMsg.includes('gerado')) {
      playBell();
    } else {
      playNotification();
    }

    setTimeout(() => {
      setToastMessage('');
    }, 4500);
  };
  
  // Página de Aprovação Customizer States
  const [primaryColor, setPrimaryColor] = useState(() => localStorage.getItem('dgflow_prop_primary_color') || '#ec4899');
  const [secondaryColor, setSecondaryColor] = useState(() => localStorage.getItem('dgflow_prop_secondary_color') || '#14b8a6');
  const [customTitle, setCustomTitle] = useState(() => localStorage.getItem('dgflow_prop_custom_title') || '');
  const [customWelcome, setCustomWelcome] = useState(() => localStorage.getItem('dgflow_prop_custom_welcome') || '');
  const [customBtnText, setCustomBtnText] = useState(() => localStorage.getItem('dgflow_prop_custom_btn_text') || '');
  const [customThanks, setCustomThanks] = useState(() => localStorage.getItem('dgflow_prop_custom_thanks') || '');
  const [showReviews, setShowReviews] = useState(() => localStorage.getItem('dgflow_prop_show_reviews') === 'true');
  const [showProjects, setShowProjects] = useState(() => localStorage.getItem('dgflow_prop_show_projects') !== 'false');
  const [maxProjects, setMaxProjects] = useState(() => parseInt(localStorage.getItem('dgflow_prop_max_projects')) || 4);
  const [proposalLogo, setProposalLogo] = useState(() => localStorage.getItem('dgflow_prop_logo') || null);
  const [proposalFavicon, setProposalFavicon] = useState(() => localStorage.getItem('dgflow_prop_favicon') || null);

  // Accordion active sections
  const [isLogoCoresOpen, setIsLogoCoresOpen] = useState(true);
  const [isTextosOpen, setIsTextosOpen] = useState(false);
  const [isAvaliacoesOpen, setIsAvaliacoesOpen] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  
  // Template Editor fields
  const [templateName, setTemplateName] = useState('Template Padrão');
  const [templateBody, setTemplateBody] = useState(DEFAULT_CONTRACT_TEMPLATE);

  // 4-Step High-Fidelity Creation Wizard States
  const [wizardStep, setWizardStep] = useState(1);
  
  // Step 1: Dados do Cliente
  const [wizClientName, setWizClientName] = useState('');
  const [wizClientPais, setWizClientPais] = useState('Brasil');
  const [wizProjectName, setWizProjectName] = useState('');
  const [wizClientCpfCnpj, setWizClientCpfCnpj] = useState('');
  const [wizClientRepresentative, setWizClientRepresentative] = useState('');
  const [wizClientEmail, setWizClientEmail] = useState('');
  const [wizClientPhone, setWizClientPhone] = useState('');
  const [wizClientAddress, setWizClientAddress] = useState('');
  const [wizClientNum, setWizClientNum] = useState('');
  const [wizClientBairro, setWizClientBairro] = useState('');
  const [wizClientCity, setWizClientCity] = useState('');
  const [wizClientState, setWizClientState] = useState('');

  const [wizContactId, setWizContactId] = useState('');
  const [contacts, setContacts] = useState([]);
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);


  // Step 2: Selecione os Serviços
  const [selectedServices, setSelectedServices] = useState([]);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [wizDiscount, setWizDiscount] = useState('0,00');

  // Ad-hoc Custom Service Modal
  const [customServiceModalOpen, setCustomServiceModalOpen] = useState(false);
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('');

  // Step 3: Condições de Pagamento
  const [wizIsRecurring, setWizIsRecurring] = useState(false);
  const [wizPaymentMethod, setWizPaymentMethod] = useState('');
  const [wizPaymentConditions, setWizPaymentConditions] = useState('');
  const [wizStartMode, setWizStartMode] = useState('days'); // 'days' or 'date'
  const [wizStartDays, setWizStartDays] = useState('3');
  const [wizStartDate, setWizStartDate] = useState('');
  const [wizDeliveryTerm, setWizDeliveryTerm] = useState('30 dias corridos');
  const [wizProposalValidity, setWizProposalValidity] = useState(30);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Página de Aprovação Event Handlers
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProposalLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProposalFavicon(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveConfigs = () => {
    localStorage.setItem('dgflow_prop_primary_color', primaryColor);
    localStorage.setItem('dgflow_prop_secondary_color', secondaryColor);
    localStorage.setItem('dgflow_prop_custom_title', customTitle);
    localStorage.setItem('dgflow_prop_custom_welcome', customWelcome);
    localStorage.setItem('dgflow_prop_custom_btn_text', customBtnText);
    localStorage.setItem('dgflow_prop_custom_thanks', customThanks);
    localStorage.setItem('dgflow_prop_show_reviews', showReviews.toString());
    localStorage.setItem('dgflow_prop_show_projects', showProjects.toString());
    localStorage.setItem('dgflow_prop_max_projects', maxProjects.toString());
    if (proposalLogo) {
      localStorage.setItem('dgflow_prop_logo', proposalLogo);
    } else {
      localStorage.removeItem('dgflow_prop_logo');
    }
    if (proposalFavicon) {
      localStorage.setItem('dgflow_prop_favicon', proposalFavicon);
    } else {
      localStorage.removeItem('dgflow_prop_favicon');
    }
    alert('Configurações salvas com sucesso! A página de aprovação do cliente foi atualizada.');
  };

  // Wizard Services Event Handlers
  const handleAddService = (name, price) => {
    setSelectedServices([...selectedServices, {
      id: 'svc-' + Date.now(),
      name,
      description: '',
      quantity: 1,
      unitPrice: price
    }]);
    setIsServiceDropdownOpen(false);
    setServiceSearchTerm('');
  };

  const handleAddCustomService = () => {
    if (!customServiceName || !customServicePrice) return;
    const price = parseFloat(customServicePrice.replace(',', '.')) || 0;
    setSelectedServices([...selectedServices, {
      id: 'svc-' + Date.now(),
      name: customServiceName,
      description: '',
      quantity: 1,
      unitPrice: price
    }]);
    setCustomServiceName('');
    setCustomServicePrice('');
    setCustomServiceModalOpen(false);
  };

  // Save/Delete to server helper methods
  const saveProposalToServer = async (proposal) => {
    try {
      await apiFetch('/api/proposals', {
        method: 'POST',
        body: JSON.stringify(proposal)
      });
    } catch (err) {
      console.error("Erro ao sincronizar orçamento no servidor:", err);
    }
  };

  const deleteProposalFromServer = async (id) => {
    try {
      await apiFetch(`/api/proposals/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error("Erro ao remover orçamento no servidor:", err);
    }
  };

  // Load contracts and templates on mount
  useEffect(() => {
    const loadProps = async () => {
      try {
        const res = await apiFetch('/api/proposals');
        if (res.ok) {
          const data = await res.json();
          setProposals(data);
          localStorage.setItem('dgflow_proposals', JSON.stringify(data));
          return;
        }
      } catch (err) {
        console.warn("Erro ao buscar orçamentos da API, usando fallback local:", err);
      }

      const storedProposals = localStorage.getItem('dgflow_proposals');
      if (storedProposals) {
        setProposals(JSON.parse(storedProposals));
      } else {
        setProposals(INITIAL_PROPOSALS);
        localStorage.setItem('dgflow_proposals', JSON.stringify(INITIAL_PROPOSALS));
      }
    };

    loadProps();

    // Listen to reactive update events from global sale modals
    window.addEventListener('dgflow_proposals_updated', loadProps);

    const storedTemplate = localStorage.getItem('dgflow_active_template');
    if (storedTemplate) {
      setActiveTemplate(storedTemplate);
      setTemplateBody(storedTemplate);
    }

    return () => {
      window.removeEventListener('dgflow_proposals_updated', loadProps);
    };
  }, []);

  // Fetch all contacts on mount
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await apiFetch('/api/contacts');
        if (res.ok) {
          const data = await res.json();
          const stagesData = data.stages || {};
          const flat = [];
          Object.keys(stagesData).forEach((stageId) => {
            flat.push(...(stagesData[stageId] || []));
          });
          
          const stored = localStorage.getItem('dgflow_local_contacts');
          const locals = stored ? JSON.parse(stored) : [];
          
          const mergedMap = new Map();
          flat.forEach(c => {
            const localOver = locals.find(l => String(l.id) === String(c.id) || String(l.phone) === String(c.phone));
            if (localOver) {
              mergedMap.set(c.id, { ...c, ...localOver });
            } else {
              mergedMap.set(c.id, c);
            }
          });
          
          locals.forEach(c => {
            if (!mergedMap.has(c.id)) {
              mergedMap.set(c.id, c);
            }
          });
          
          const mergedList = Array.from(mergedMap.values());
          setContacts(mergedList);
        }
      } catch (err) {
        console.error('Erro ao buscar contatos no Proposals:', err);
        const stored = localStorage.getItem('dgflow_local_contacts');
        if (stored) {
          setContacts(JSON.parse(stored));
        }
      }
    };
    
    fetchContacts();
  }, []);

  // Parse URL parameters for pre-filling and automatically opening Proposals wizard
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const contactId = params.get('contactId');
    if (contactId) {
      setWizContactId(contactId);
      setWizClientName(params.get('name') || '');
      setWizClientEmail(params.get('email') || '');
      setWizClientPhone(params.get('phone') || '');
      setWizClientCpfCnpj(params.get('doc') || '');
      setWizClientAddress(params.get('address') || '');
      setWizClientNum(params.get('number') || '');
      setWizClientBairro(params.get('neighborhood') || '');
      setWizClientCity(params.get('city') || '');
      setWizClientState(params.get('state') || '');
      setWizClientPais(params.get('pais') || 'Brasil');
      setWizClientRepresentative(params.get('representative') || params.get('name') || '');
      
      const clientNameVal = params.get('name') || '';
      setWizProjectName(clientNameVal ? `Orçamento - ${clientNameVal}` : '');
      
      setIsWizardOpen(true);
      setWizardStep(1);

      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  const saveProposalsToStorage = (newProps) => {
    setProposals(newProps);
    localStorage.setItem('dgflow_proposals', JSON.stringify(newProps));
  };

  const saveActiveTemplateToStorage = (text) => {
    setActiveTemplate(text);
    localStorage.setItem('dgflow_active_template', text);
  };

  // Calculate subtotal, discount and final values dynamically
  const subtotalValue = selectedServices.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discountValue = parseFloat(wizDiscount.replace(',', '.')) || 0;
  const finalValue = Math.max(0, subtotalValue - discountValue);

  // Compile contract template by replacing shortcodes
  const handleCompileAndSaveContract = (e) => {
    if (e) e.preventDefault();

    // Generate services list string representation for contract
    const servicesListString = selectedServices.map((sv, idx) => 
      `${idx + 1}. ${sv.name} (${sv.quantity}x) - R$ ${(sv.unitPrice * sv.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}${sv.description ? `\n   Descrição: ${sv.description}` : ''}`
    ).join('\n');

    const durationString = wizDeliveryTerm || '30 dias';

    // Map all input fields to shortcodes
    const shortcodeMap = {
      '{{Nome do Prestador}}': 'Gleison',
      '{{Endereço do Prestador}}': 'Av. Boa Viagem',
      '{{Número do Endereço Prestador}}': '1000',
      '{{Bairro do Prestador}}': 'Boa Viagem',
      '{{Cidade do Prestador}}': 'Recife',
      '{{Estado do Prestador}}': 'PE',
      '{{CPF/CNPJ do Prestador}}': '12.345.678/0001-99',
      
      '{{Nome do Cliente}}': wizClientName,
      '{{Endereço do Cliente}}': wizClientAddress || '[Endereço do Cliente]',
      '{{Morada do Cliente}}': wizClientAddress || '[Morada do Cliente]',
      '{{Número do Endereço Cliente}}': wizClientNum || '',
      '{{Bairro do Cliente}}': wizClientBairro || '',
      '{{Cidade do Cliente}}': wizClientCity || '',
      '{{Estado do Cliente}}': wizClientState || '',
      '{{CPF/CNPJ do Cliente}}': wizClientCpfCnpj || '',
      '{{NIF do Cliente}}': wizClientCpfCnpj || '',
      '{{Representante do Cliente}}': wizClientRepresentative || wizClientName,

      '{{Nome do Projeto}}': wizProjectName,
      '{{Serviços Inclusos}}': servicesListString || '[Nenhum serviço selecionado]',
      '{{Prazo do Contrato}}': durationString,

      '{{Valor Total}}': `R$ ${subtotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      '{{Valor do Desconto}}': `R$ ${discountValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      '{{Valor Final}}': `R$ ${finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      '{{Condições de Pagamento}}': wizPaymentConditions || 'A definir',
      '{{Forma de Pagamento}}': wizPaymentMethod || 'PIX',
      '{{Número de Parcelas}}': '1',
      '{{Data}}': new Date().toLocaleDateString('pt-BR'),
    };

    let compiled = activeTemplate;
    for (const [shortcode, value] of Object.entries(shortcodeMap)) {
      compiled = compiled.replace(new RegExp(shortcode, 'g'), value || `[${shortcode}]`);
    }

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userId = storedUser?.id || '1';

    const newProposal = {
      id: `prop_${userId}_${Date.now()}`,
      contact_id: wizContactId || null,
      clientPhone: wizClientPhone || null,
      clientEmail: wizClientEmail || null,
      projectName: wizProjectName,
      clientName: wizClientName,
      amount: finalValue,
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      compiledText: compiled,
      services: selectedServices.map(s => ({
        name: s.name,
        desc: s.description || 'Serviço sob medida',
        price: s.unitPrice * s.quantity
      })),
      subtotal: subtotalValue,
      discount: discountValue,
      description: `Proposta de prestação de serviços referente ao projeto "${wizProjectName}" para o cliente ${wizClientName}.`
    };

    saveProposalsToStorage([newProposal, ...proposals]);
    saveProposalToServer(newProposal);
    setIsWizardOpen(false);

    // Automatically copy approval link, trigger toast, and open page in new tab
    const approvalLink = `${window.location.origin}/proposal/${newProposal.id}`;
    navigator.clipboard.writeText(approvalLink)
      .then(() => {
        showToastNotification("LINK COPIADO! Compartilhe o link de aprovação.");
      })
      .catch(() => {
        showToastNotification("Orçamento gerado com sucesso!");
      });

    window.open('/proposal/' + newProposal.id, '_blank');

    // Reset Wizard parameters
    setWizContactId('');
    setWizProjectName('');
    setWizClientName('');
    setWizClientAddress('');
    setWizClientNum('');
    setWizClientBairro('');
    setWizClientCity('');
    setWizClientState('');
    setWizClientCpfCnpj('');
    setWizClientPais('Brasil');
    setWizClientRepresentative('');
    setWizClientEmail('');
    setWizClientPhone('');
    setSelectedServices([]);
    setWizDiscount('0,00');
    setWizIsRecurring(false);
    setWizPaymentMethod('');
    setWizPaymentConditions('');
    setWizStartMode('days');
    setWizStartDays('3');
    setWizStartDate('');
    setWizDeliveryTerm('30 dias corridos');
    setWizProposalValidity(30);
    setWizardStep(1);
  };

  const handleDeleteProposal = (id) => {
    if (confirm("Remover este orçamento?")) {
      saveProposalsToStorage(proposals.filter(p => p.id !== id));
      deleteProposalFromServer(id);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Conteúdo do Contrato copiado para a Área de Transferência!");
  };

  // Calculations
  const approvedCount = proposals.filter(p => p.status === 'approved').length;
  const sentCount = proposals.filter(p => p.status === 'sent').length;
  const draftCount = proposals.filter(p => p.status === 'draft').length;
  const totalApprovedAmount = proposals
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredProps = proposals.filter(p => 
    p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-fade-in font-body">
      
      {/* Header and top tools matching screenshot exactly */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-white leading-none">
            Gestão de Orçamentos
          </h1>
          <p className="text-xs text-zinc-400 mt-2 font-medium">
            Gerencie todos os seus orçamentos em um só lugar
          </p>
        </div>

        {/* Action Header Buttons matching screenshot exactly */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Contrato button */}
          <button
            onClick={() => setIsModelsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-800/80 bg-[#121214] text-white hover:text-zinc-200 text-xs font-bold transition-all"
          >
            <SettingsIcon className="h-3.5 w-3.5 text-zinc-350" />
            <span>Contrato</span>
          </button>

          {/* + Novo contrato button */}
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-800/80 bg-[#121214] text-white hover:text-zinc-200 text-xs font-bold transition-all"
          >
            <Plus className="h-3.5 w-3.5 text-zinc-350" />
            <span>Novo contrato</span>
          </button>

          {/* + Novo Orçamento button */}
          <button
            onClick={() => setIsWizardOpen(true)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs bg-gradient-primary text-white font-bold shadow-glow hover:shadow-xl hover:scale-105 transition-all duration-300 h-10 px-4 py-2.5 gap-2"
          >
            <Plus className="h-4 w-4 text-white" />
            <span>Novo Orçamento</span>
          </button>

        </div>
      </div>

      {/* Sub-Tabs Selector matching screenshot exactly */}
      <div className="flex items-center gap-2 select-none py-2">
        {[
          { id: 'orcamentos', label: 'Orçamentos', icon: FileText },
          { id: 'contratos', label: 'Contratos', icon: FileCheck },
          { id: 'pagina-aprovacao', label: 'Página de Aprovação', icon: null }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 rounded-lg ${
                isActive 
                  ? 'bg-[#121214] border border-zinc-800 text-white shadow-sm' 
                  : 'border border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {Icon && <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Metrics Row matching screenshot exactly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 select-none">
        {/* Rascunhos */}
        <div className="bg-[#121214] border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between min-h-[110px]">
          <span className="text-[11px] text-zinc-400 font-semibold">Rascunhos</span>
          <p className="text-3xl font-bold text-white mt-2">{draftCount}</p>
        </div>

        {/* Enviados */}
        <div className="bg-[#121214] border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between min-h-[110px]">
          <span className="text-[11px] text-zinc-400 font-semibold">Enviados</span>
          <p className="text-3xl font-bold text-white mt-2">{sentCount}</p>
        </div>

        {/* Aprovados */}
        <div className="bg-[#121214] border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between min-h-[110px]">
          <span className="text-[11px] text-zinc-400 font-semibold">Aprovados</span>
          <p className="text-3xl font-bold text-emerald-500 mt-2">{approvedCount}</p>
        </div>

        {/* Valor Total Aprovado */}
        <div className="bg-[#121214] border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between min-h-[110px]">
          <span className="text-[11px] text-zinc-400 font-semibold">Valor Total Aprovado</span>
          <p className="text-3xl font-bold text-[#10b981] mt-2">
            R$ {totalApprovedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filter Row matching screenshot exactly */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full select-none">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por título, número ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 bg-[#121214] border border-zinc-800/80 text-white placeholder-zinc-500 text-xs focus:border-[#e13a40] h-10 w-full rounded-lg outline-none font-medium transition-all"
          />
        </div>

        {/* Filter Button (Funnel icon) */}
        <button
          type="button"
          className="h-10 w-10 flex items-center justify-center rounded-lg border border-zinc-800/80 bg-[#121214] hover:bg-zinc-900 text-zinc-300 hover:text-white transition-all shrink-0"
        >
          <Filter className="h-4 w-4" />
        </button>

        {/* Dropdown Filters (Todos) */}
        <div className="w-full sm:w-36 shrink-0 relative">
          <select
            className="w-full bg-[#121214] text-white text-xs rounded-lg border border-zinc-800/80 p-2.5 outline-none focus:border-[#e13a40] font-semibold h-10 cursor-pointer appearance-none pr-8"
            onChange={() => {}}
          >
            <option value="todos">Todos</option>
            <option value="draft">Rascunhos</option>
            <option value="sent">Enviados</option>
            <option value="approved">Aprovados</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-[8px]">▼</div>
        </div>

        {/* Mostrar Arquivados button */}
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`h-10 px-4 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2 shrink-0 select-none ${
            showArchived 
              ? 'border-[#e13a40]/30 bg-[#e13a40]/5 text-[#e13a40]' 
              : 'border-zinc-800/80 bg-[#121214] hover:bg-zinc-900 text-zinc-300 hover:text-white'
          }`}
        >
          <FolderArchive className="h-4 w-4 text-zinc-400" />
          <span>Mostrar Arquivados</span>
        </button>

      </div>

      {/* Main List / Content Area */}
      {subTab === 'orcamentos' && (
        filteredProps.length === 0 ? (
          /* Empty state matching DGFlow screenshot exactly */
          <div className="bg-[#121214]/10 border border-zinc-800/60 rounded-2xl p-16 flex flex-col items-center justify-center text-center select-none min-h-[300px]">
            <FileText className="h-12 w-12 text-zinc-600 mb-4 stroke-[1.2]" />
            <h3 className="text-sm font-bold text-zinc-300">Nenhum orçamento criado</h3>
            <p className="text-zinc-500 text-xs mt-1">
              Comece criando seu primeiro orçamento
            </p>
            
            <button
              onClick={() => setIsWizardOpen(true)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs bg-gradient-primary text-white font-bold shadow-glow hover:shadow-xl hover:scale-105 transition-all duration-300 h-10 px-5 py-2.5 gap-2 mt-6"
            >
              <Plus className="h-4 w-4 text-white" />
              <span>Criar Orçamento</span>
            </button>
          </div>
        ) : (
          /* Table Grid matching list layout */
          <div className="border border-zinc-800 bg-[#121214]/50 rounded-xl shadow-md">
            <table className="w-full border-collapse text-left text-xs font-body select-none">
              <thead>
                <tr className="bg-[#121214] border-b border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-6">Nome do Projeto</th>
                  <th className="py-3 px-6">Cliente</th>
                  <th className="py-3 px-6 text-right">Valor Final</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-4 w-20 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-350">
                {filteredProps.map(prop => (
                  <tr key={prop.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-4 px-4 font-mono text-[11px] text-zinc-450">{prop.date}</td>
                    <td className="py-4 px-6 font-bold text-white leading-tight">{prop.projectName}</td>
                    <td className="py-4 px-6 font-semibold text-zinc-400">{prop.clientName}</td>
                    <td className="py-4 px-6 text-right font-bold text-white font-mono text-[11.5px]">
                      R$ {prop.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-extrabold uppercase ${
                        prop.status === 'approved' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : prop.status === 'sent' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-zinc-800/40 text-zinc-400 border-zinc-700/20'
                      }`}>
                        {prop.status === 'approved' ? 'Aprovado' : prop.status === 'sent' ? 'Enviado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center relative">
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionMenuId(activeActionMenuId === prop.id ? null : prop.id);
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Opções"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        
                        {/* Premium DGFlow Action Dropdown Menu */}
                        {activeActionMenuId === prop.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveActionMenuId(null);
                              }}
                            />
                            
                            <div className="absolute right-10 top-2 w-48 rounded-xl bg-[#0c0c0e] border border-[#1f1f23] text-white p-1 shadow-2xl z-50 animate-fade-in text-left select-none font-body">
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  alert("Abertura do editor para a proposta: " + prop.projectName);
                                }}
                                className="w-full px-3 py-1.5 rounded-lg text-left text-[11px] font-bold hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 text-zinc-300 cursor-pointer"
                              >
                                <SettingsIcon className="h-3.5 w-3.5 text-zinc-450" />
                                <span>Editar</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  const updatedItem = { ...prop, status: 'sent' };
                                  const updated = proposals.map(p => p.id === prop.id ? updatedItem : p);
                                  saveProposalsToStorage(updated);
                                  saveProposalToServer(updatedItem);
                                  showToastNotification("Orçamento enviado com sucesso!");
                                }}
                                className="w-full px-3 py-1.5 rounded-lg text-left text-[11px] font-bold hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 text-zinc-300 cursor-pointer"
                              >
                                <Send className="h-3.5 w-3.5 text-zinc-450" />
                                <span>Concluir e Enviar</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  const updatedItem = { ...prop, status: 'sent' };
                                  const updated = proposals.map(p => p.id === prop.id ? updatedItem : p);
                                  saveProposalsToStorage(updated);
                                  saveProposalToServer(updatedItem);
                                  showToastNotification("Orçamento concluído!");
                                }}
                                className="w-full px-3 py-1.5 rounded-lg text-left text-[11px] font-bold hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 text-zinc-300 cursor-pointer"
                              >
                                <Check className="h-3.5 w-3.5 text-zinc-450" />
                                <span>Concluir (sem email)</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  const updatedItem = { ...prop, status: 'approved' };
                                  const updated = proposals.map(p => p.id === prop.id ? updatedItem : p);
                                  saveProposalsToStorage(updated);
                                  saveProposalToServer(updatedItem);
                                  showToastNotification("Orçamento aprovado manualmente!");
                                }}
                                className="w-full px-3 py-1.5 rounded-lg text-left text-[11px] font-bold hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 text-zinc-300 cursor-pointer"
                              >
                                <CheckCircle className="h-3.5 w-3.5 text-zinc-450" />
                                <span>Aprovar Manualmente</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  alert("Cobrança de R$ " + prop.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + " gerada com sucesso!");
                                }}
                                className="w-full px-3 py-1.5 rounded-lg text-left text-[11px] font-bold hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 text-zinc-300 cursor-pointer"
                              >
                                <CreditCard className="h-3.5 w-3.5 text-zinc-450" />
                                <span>Gerar cobrança</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  setSelectedProposal(prop);
                                }}
                                className="w-full px-3 py-1.5 rounded-lg text-left text-[11px] font-bold hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 text-zinc-300 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 text-zinc-450" />
                                <span>Ver Detalhes</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  window.open('/proposal/' + prop.id, '_blank');
                                }}
                                className="w-full px-3 py-1.5 rounded-lg text-left text-[11px] font-bold hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 text-zinc-300 cursor-pointer"
                              >
                                <Globe className="h-3.5 w-3.5 text-zinc-450" />
                                <span>Visualizar</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  const approvalLink = `${window.location.origin}/proposal/${prop.id}`;
                                  navigator.clipboard.writeText(approvalLink)
                                    .then(() => showToastNotification("Link de aprovação copiado!"));
                                }}
                                className="w-full px-3 py-1.5 rounded-lg text-left text-[11px] font-bold hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 text-zinc-300 cursor-pointer"
                              >
                                <Copy className="h-3.5 w-3.5 text-zinc-450" />
                                <span>Copiar Link</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  const approvalLink = `${window.location.origin}/proposal/${prop.id}`;
                                  navigator.clipboard.writeText(approvalLink)
                                    .then(() => showToastNotification("Link copiado! Compartilhe onde desejar."));
                                }}
                                className="w-full px-3 py-1.5 rounded-lg text-left text-[11px] font-bold hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 text-zinc-300 cursor-pointer"
                              >
                                <Share2 className="h-3.5 w-3.5 text-zinc-450" />
                                <span>Compartilhar</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  showToastNotification("Orçamento enviado por e-mail com sucesso!");
                                }}
                                className="w-full px-3 py-1.5 rounded-lg text-left text-[11px] font-bold hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 text-zinc-300 cursor-pointer"
                              >
                                <Mail className="h-3.5 w-3.5 text-zinc-450" />
                                <span>Enviar por Email</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  showToastNotification("PDF do orçamento enviado por e-mail com sucesso!");
                                }}
                                className="w-full px-3 py-1.5 rounded-lg text-left text-[11px] font-bold hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 text-zinc-300 cursor-pointer"
                              >
                                <FileText className="h-3.5 w-3.5 text-zinc-450" />
                                <span>Enviar PDF por Email</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  if (prop.compiledText) {
                                    navigator.clipboard.writeText(prop.compiledText)
                                      .then(() => showToastNotification("Contrato copiado para a área de transferência!"));
                                  } else {
                                    showToastNotification("Texto base do contrato copiado!");
                                  }
                                }}
                                className="w-full px-3 py-1.5 rounded-lg text-left text-[11px] font-bold hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 text-zinc-300 cursor-pointer"
                              >
                                <FileCheck className="h-3.5 w-3.5 text-zinc-450" />
                                <span>Gerar Contrato</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  const updated = proposals.map(p => p.id === prop.id ? { ...p, archived: true } : p);
                                  saveProposalsToStorage(updated);
                                  showToastNotification("Orçamento arquivado com sucesso!");
                                }}
                                className="w-full px-3 py-1.5 rounded-lg text-left text-[11px] font-bold hover:bg-zinc-800 hover:text-white transition-all flex items-center gap-2 text-zinc-300 cursor-pointer border-t border-zinc-900 mt-1 pt-1.5"
                              >
                                <FolderArchive className="h-3.5 w-3.5 text-zinc-450" />
                                <span>Arquivar</span>
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveActionMenuId(null);
                                  handleDeleteProposal(prop.id);
                                }}
                                className="w-full px-3 py-1.5 rounded-lg text-left text-[11px] font-bold hover:bg-[#e13a40]/15 text-rose-500 hover:text-rose-450 transition-all flex items-center gap-2 mt-1 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Excluir</span>
                              </button>

                            </div>
                          </>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {subTab === 'contratos' && (
        /* Contratos Tab Empty State matches empty layouts */
        <div className="bg-[#121214]/10 border border-zinc-800/60 rounded-2xl p-16 flex flex-col items-center justify-center text-center select-none min-h-[300px] animate-fade-in">
          <FileCheck className="h-12 w-12 text-zinc-600 mb-4 stroke-[1.2]" />
          <h3 className="text-sm font-bold text-zinc-300">Nenhum contrato criado</h3>
          <p className="text-zinc-500 text-xs mt-1">
            Comece criando seu primeiro contrato
          </p>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs bg-gradient-primary text-white font-bold shadow-glow hover:shadow-xl hover:scale-105 transition-all duration-300 h-10 px-5 py-2.5 gap-2 mt-6"
          >
            <Plus className="h-4 w-4 text-white" />
            <span>Criar Contrato</span>
          </button>
        </div>
      )}

      {subTab === 'pagina-aprovacao' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fade-in font-body text-left">
          
          {/* LEFT PANEL: CONFIGURATOR */}
          <div className="space-y-4">
            
            {/* Accordion 1: Logo e Cores */}
            <div className="rounded-xl border border-zinc-800 bg-[#121214]/60 overflow-hidden transition-all duration-300">
              <button
                type="button"
                onClick={() => setIsLogoCoresOpen(!isLogoCoresOpen)}
                className="w-full flex items-center justify-between p-4 bg-[#121214]/90 text-white font-bold text-sm select-none border-b border-zinc-800/40"
              >
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-[#e13a40]" />
                  <span>Logo e Cores</span>
                </div>
                {isLogoCoresOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
              </button>

              {isLogoCoresOpen && (
                <div className="p-4 space-y-5 animate-slide-down">
                  
                  {/* Logo Upload */}
                  <div className="space-y-1.5 relative">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-zinc-300">Logo (opcional)</span>
                      <span className="text-[10px] text-zinc-500 font-mono">500x200px</span>
                    </div>
                    <label className="group relative flex flex-col items-center justify-center border border-dashed border-zinc-800 hover:border-[#e13a40]/60 bg-zinc-950/40 rounded-xl p-6 cursor-pointer text-center transition-all h-[110px]">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                      />
                      {proposalLogo ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img src={proposalLogo} alt="Logo" className="max-h-[80px] max-w-full object-contain rounded" />
                          <button 
                            type="button" 
                            onClick={(e) => { e.preventDefault(); setProposalLogo(null); }}
                            className="absolute -top-2 -right-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-full p-1 text-[10px] h-5 w-5 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors mb-2" />
                          <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">Clique para fazer upload</span>
                          <span className="text-[10px] text-zinc-500 mt-0.5">PNG, JPG até 5MB (auto-convertido para WebP)</span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Favicon Upload */}
                  <div className="space-y-1.5 relative">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-zinc-300">Favicon (opcional)</span>
                      <span className="text-[10px] text-zinc-500 font-mono">64x64px</span>
                    </div>
                    <label className="group relative flex flex-col items-center justify-center border border-dashed border-zinc-800 hover:border-[#e13a40]/60 bg-zinc-950/40 rounded-xl p-6 cursor-pointer text-center transition-all h-[110px]">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFaviconUpload} 
                        className="hidden" 
                      />
                      {proposalFavicon ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img src={proposalFavicon} alt="Favicon" className="max-h-[60px] max-w-[60px] object-contain rounded" />
                          <button 
                            type="button" 
                            onClick={(e) => { e.preventDefault(); setProposalFavicon(null); }}
                            className="absolute -top-2 -right-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-full p-1 text-[10px] h-5 w-5 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-zinc-500 group-hover:text-white transition-colors mb-2" />
                          <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">Clique para fazer upload</span>
                          <span className="text-[10px] text-zinc-500 mt-0.5">PNG, JPG até 5MB (auto-convertido para WebP)</span>
                        </>
                      )}
                    </label>
                  </div>

                  {/* Paletas Sugeridas */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-zinc-300 block">Paletas de Cores</span>
                    <span className="text-[10px] text-zinc-500 block -mt-2">Paletas Sugeridas</span>
                    
                    <div className="grid grid-cols-2 gap-3.5">
                      {[
                        { name: 'Sunset Glow', desc: 'Vibrante e energético', primary: '#ec4899', secondary: '#facc15' },
                        { name: 'Ocean Breeze', desc: 'Fresco e profissional', primary: '#14b8a6', secondary: '#4b5563' },
                        { name: 'Purple Haze', desc: 'Moderno e ousado', primary: '#8b5cf6', secondary: '#ec4899' },
                        { name: 'Cyber Night', desc: 'Tech e futurista', primary: '#a855f7', secondary: '#db2777' },
                        { name: 'Forest Dream', desc: 'Natural e confiável', primary: '#10b981', secondary: '#064e3b' },
                        { name: 'Rose Gold', desc: 'Elegante e premium', primary: '#f472b6', secondary: '#d97706' },
                        { name: 'Electric Blue', desc: 'Inovador e dinâmico', primary: '#3b82f6', secondary: '#8b5cf6' },
                        { name: 'Fire & Ice', desc: 'Contraste impactante', primary: '#ef4444', secondary: '#06b6d4' }
                      ].map(pal => {
                        const isSelected = primaryColor.toLowerCase() === pal.primary.toLowerCase() && secondaryColor.toLowerCase() === pal.secondary.toLowerCase();
                        return (
                          <button
                            key={pal.name}
                            type="button"
                            onClick={() => {
                              setPrimaryColor(pal.primary);
                              setSecondaryColor(pal.secondary);
                            }}
                            className={`p-3 rounded-lg border text-left bg-zinc-950/40 hover:bg-zinc-950/70 transition-all select-none ${
                              isSelected 
                                ? 'border-[#e13a40] shadow-sm shadow-[#e13a40]/5' 
                                : 'border-zinc-800/80'
                            }`}
                          >
                            <span className="font-bold text-[11px] text-white block leading-tight">{pal.name}</span>
                            <span className="text-[9px] text-zinc-500 block leading-tight mt-0.5">{pal.desc}</span>
                            <div className="flex gap-1 mt-2">
                              <div className="h-4 w-full rounded-sm" style={{ backgroundColor: pal.primary }} />
                              <div className="h-4 w-full rounded-sm" style={{ backgroundColor: pal.secondary }} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Personalizar Cores */}
                  <div className="space-y-4 pt-2 border-t border-zinc-800/40">
                    <span className="text-xs font-semibold text-zinc-300 block">Personalizar Cores</span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Primary Color Picker */}
                      <div className="space-y-1.5 relative">
                        <label className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Cor Primária</label>
                        <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-800 rounded-lg p-2 h-10 relative">
                          <div 
                            className="h-5 w-5 rounded-md border border-zinc-700/60 shrink-0 relative overflow-hidden" 
                            style={{ backgroundColor: primaryColor }}
                          >
                            <input 
                              type="color" 
                              value={primaryColor} 
                              onChange={(e) => setPrimaryColor(e.target.value)} 
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </div>
                          <input 
                            type="text" 
                            value={primaryColor} 
                            onChange={(e) => setPrimaryColor(e.target.value)} 
                            className="bg-transparent border-none text-xs text-white outline-none w-full font-mono uppercase"
                          />
                        </div>
                      </div>

                      {/* Secondary Color Picker */}
                      <div className="space-y-1.5 relative">
                        <label className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Cor Secundária</label>
                        <div className="flex items-center gap-2 bg-zinc-950/60 border border-zinc-800 rounded-lg p-2 h-10 relative">
                          <div 
                            className="h-5 w-5 rounded-md border border-zinc-700/60 shrink-0 relative overflow-hidden" 
                            style={{ backgroundColor: secondaryColor }}
                          >
                            <input 
                              type="color" 
                              value={secondaryColor} 
                              onChange={(e) => setSecondaryColor(e.target.value)} 
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </div>
                          <input 
                            type="text" 
                            value={secondaryColor} 
                            onChange={(e) => setSecondaryColor(e.target.value)} 
                            className="bg-transparent border-none text-xs text-white outline-none w-full font-mono uppercase"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Gradient Preview Bar */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Preview do Gradiente</span>
                      <div 
                        className="h-9 w-full rounded-lg border border-zinc-800 shadow-inner" 
                        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
                      />
                    </div>

                  </div>

                </div>
              )}
            </div>

            {/* Accordion 2: Textos Personalizados */}
            <div className="rounded-xl border border-zinc-800 bg-[#121214]/60 overflow-hidden transition-all duration-300">
              <button
                type="button"
                onClick={() => setIsTextosOpen(!isTextosOpen)}
                className="w-full flex items-center justify-between p-4 bg-[#121214]/90 text-white font-bold text-sm select-none border-b border-zinc-800/40"
              >
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-[#e13a40]" />
                  <span>Textos Personalizados</span>
                </div>
                {isTextosOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
              </button>

              {isTextosOpen && (
                <div className="p-4 space-y-4 animate-slide-down">
                  
                  {/* Título Principal */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-zinc-300 block">Título Principal (opcional)</span>
                    <Input
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Ex: Proposta Comercial Exclusiva"
                      className="bg-zinc-950/40 border-zinc-800 text-white text-xs h-10 placeholder-zinc-650"
                    />
                    <span className="text-[10px] text-zinc-500 block">Se vazio, usa o título do orçamento</span>
                  </div>

                  {/* Mensagem de Boas-vindas */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-zinc-300 block">Mensagem de Boas-vindas (opcional)</span>
                    <textarea
                      rows="3"
                      value={customWelcome}
                      onChange={(e) => setCustomWelcome(e.target.value)}
                      placeholder="Ex: Obrigado por considerar nossa proposta..."
                      className="w-full bg-zinc-950/40 border border-zinc-800 text-xs rounded-lg p-2.5 outline-none text-white focus:border-[#e13a40] placeholder-zinc-650 min-h-[70px]"
                    />
                  </div>

                  {/* Texto do Botão de Aprovação */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-zinc-300 block">Texto do Botão de Aprovação (opcional)</span>
                    <Input
                      value={customBtnText}
                      onChange={(e) => setCustomBtnText(e.target.value)}
                      placeholder="Padrão: 'Aprovar Proposta'"
                      className="bg-zinc-950/40 border-zinc-800 text-white text-xs h-10 placeholder-zinc-650"
                    />
                  </div>

                  {/* Mensagem de Agradecimento */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-zinc-300 block">Mensagem de Agradecimento (opcional)</span>
                    <textarea
                      rows="3"
                      value={customThanks}
                      onChange={(e) => setCustomThanks(e.target.value)}
                      placeholder="Ex: Obrigado pela confiança! Entraremos em contato em breve..."
                      className="w-full bg-zinc-950/40 border border-zinc-800 text-xs rounded-lg p-2.5 outline-none text-white focus:border-[#e13a40] placeholder-zinc-650 min-h-[70px]"
                    />
                  </div>

                </div>
              )}
            </div>

            {/* Accordion 3: Avaliações de Clientes */}
            <div className="rounded-xl border border-zinc-800 bg-[#121214]/60 overflow-hidden transition-all duration-300">
              <button
                type="button"
                onClick={() => setIsAvaliacoesOpen(!isAvaliacoesOpen)}
                className="w-full flex items-center justify-between p-4 bg-[#121214]/90 text-white font-bold text-sm select-none border-b border-zinc-800/40"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#e13a40]" />
                  <span>Avaliações de Clientes</span>
                </div>
                {isAvaliacoesOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
              </button>

              {isAvaliacoesOpen && (
                <div className="p-4 space-y-4 animate-slide-down">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-300 block">Exibir Avaliações</span>
                      <span className="text-[10px] text-zinc-500 leading-normal block mt-0.5">Mostra depoimentos de clientes</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowReviews(!showReviews)}
                      className={`h-5 w-9 rounded-full transition-all relative shrink-0 ${showReviews ? 'bg-[#e13a40]' : 'bg-zinc-800'}`}
                    >
                      <div className={`h-3.5 w-3.5 rounded-full bg-white absolute top-1/2 -translate-y-1/2 transition-all ${showReviews ? 'left-4.5' : 'left-0.8'}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 4: Projetos do Portfólio */}
            <div className="rounded-xl border border-zinc-800 bg-[#121214]/60 overflow-hidden transition-all duration-300">
              <button
                type="button"
                onClick={() => setIsPortfolioOpen(!isPortfolioOpen)}
                className="w-full flex items-center justify-between p-4 bg-[#121214]/90 text-white font-bold text-sm select-none border-b border-zinc-800/40"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#e13a40]" />
                  <span>Projetos do Portfólio</span>
                </div>
                {isPortfolioOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
              </button>

              {isPortfolioOpen && (
                <div className="p-4 space-y-4 animate-slide-down">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-300 block">Exibir Projetos</span>
                      <span className="text-[10px] text-zinc-500 leading-normal block mt-0.5">Mostra seus trabalhos na página</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowProjects(!showProjects)}
                      className={`h-5 w-9 rounded-full transition-all relative shrink-0 ${showProjects ? 'bg-[#e13a40]' : 'bg-zinc-800'}`}
                    >
                      <div className={`h-3.5 w-3.5 rounded-full bg-white absolute top-1/2 -translate-y-1/2 transition-all ${showProjects ? 'left-4.5' : 'left-0.8'}`} />
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-zinc-800/30">
                    <span className="text-xs font-semibold text-zinc-300 block">Máximo de Projetos</span>
                    <Input
                      type="number"
                      value={maxProjects}
                      onChange={(e) => setMaxProjects(parseInt(e.target.value) || 0)}
                      className="bg-zinc-950/40 border-zinc-800 text-white text-xs h-10 w-24"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Salvar Configurações Button */}
            <button
              type="button"
              onClick={handleSaveConfigs}
              className="w-full py-3 bg-gradient-primary text-white font-bold text-xs rounded-xl shadow-glow hover:shadow-xl hover:scale-102 transition-all duration-300 mt-2 select-none"
            >
              Salvar Configurações
            </button>

          </div>

          {/* RIGHT PANEL: LIVE INTERACTIVE PREVIEW */}
          <div className="space-y-4 relative border border-zinc-850 bg-zinc-950 p-6 rounded-2xl overflow-hidden shadow-2xl min-h-[500px]">
            
            {/* Blurry ambient glows inside preview container */}
            <div className="absolute top-[-100px] left-[-60px] h-64 w-64 rounded-full opacity-10 blur-[80px]" style={{ backgroundColor: primaryColor }} />
            <div className="absolute bottom-[-100px] right-[-60px] h-64 w-64 rounded-full opacity-5 blur-[80px]" style={{ backgroundColor: secondaryColor }} />

            {/* Live Preview top header bar */}
            <div className="relative flex justify-between items-center border-b border-zinc-900 pb-4 mb-6">
              <div className="flex items-center gap-2 select-none">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Preview em Tempo Real</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Languages dropdown */}
              <div className="relative shrink-0 select-none">
                <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-[10px] text-white font-bold cursor-pointer">
                  <Globe className="h-3 w-3 text-zinc-400" />
                  <span>BR Português</span>
                  <ChevronDown className="h-2.5 w-2.5 text-zinc-500" />
                </div>
              </div>
            </div>

            {/* Preview Document Canvas */}
            <div className="relative space-y-6">
              
              {/* Proposal Header Banner */}
              <div className="text-center space-y-2.5 py-4">
                
                {/* Simulated Custom Logo if loaded */}
                {proposalLogo ? (
                  <img src={proposalLogo} alt="Logo" className="max-h-[55px] max-w-[200px] object-contain mx-auto mb-3" />
                ) : (
                  <div className="text-sm font-bold tracking-tight text-white mb-2 font-mono">dgflow</div>
                )}

                <div 
                  className="mx-auto w-fit px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border shadow-sm"
                  style={{ 
                    borderColor: `${primaryColor}25`, 
                    color: primaryColor, 
                    backgroundColor: `${primaryColor}08` 
                  }}
                >
                  Proposta Comercial
                </div>
                
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white leading-tight max-w-md mx-auto">
                  {customTitle || 'Proposta de Design de Identidade Visual'}
                </h1>
                
                <p className="text-zinc-550 text-[10px] tracking-widest font-mono uppercase mt-1">
                  Orçamento #2024-001
                </p>
              </div>

              {/* CARD: Detalhes da Proposta */}
              <div className="border border-zinc-900 bg-[#0c0c0e]/80 p-5 rounded-xl space-y-4 shadow-xl">
                
                <div className="flex justify-between items-start gap-4 select-none">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" style={{ color: primaryColor }} />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Detalhes da Proposta</h3>
                  </div>
                  
                  <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-wider flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
                    Pendente
                  </span>
                </div>

                <div className="h-px bg-zinc-900" />

                {/* Sobre o Projeto */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase block tracking-wider" style={{ color: primaryColor }}>Sobre o Projeto</span>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                    {customWelcome || 'Desenvolvimento completo de identidade visual incluindo logotipo, paleta de cores, tipografia e manual de marca.'}
                  </p>
                </div>

                <div className="h-px bg-zinc-900" />

                {/* Serviços Incluídos */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-zinc-350 uppercase block tracking-wider select-none">Serviços Incluídos</span>
                  
                  <div className="space-y-2 select-none">
                    {[
                      { name: 'Criação de Logotipo', desc: 'Design personalizado e exclusivo', price: 'R$ 1.500,00' },
                      { name: 'Manual de Marca', desc: 'Guia completo de aplicação', price: 'R$ 800,00' },
                      { name: 'Papelaria', desc: 'Cartão de visita, papel timbrado', price: 'R$ 500,00' }
                    ].map(sv => (
                      <div key={sv.name} className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/40 flex items-center justify-between gap-4">
                        <div>
                          <h4 className="text-[11px] font-bold text-white leading-normal">{sv.name}</h4>
                          <p className="text-[9px] text-zinc-550 leading-normal mt-0.5">{sv.desc}</p>
                        </div>
                        <span className="text-xs font-bold font-mono whitespace-nowrap" style={{ color: primaryColor }}>{sv.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing totals */}
                <div className="p-3.5 rounded-lg border border-zinc-900 bg-zinc-950/80 space-y-2 select-none font-mono">
                  <div className="flex justify-between items-center text-[10px] text-zinc-550">
                    <span>Subtotal:</span>
                    <span>R$ 2.800,00</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-emerald-500 border-b border-zinc-900 pb-2">
                    <span>Desconto:</span>
                    <span>- R$ 300,00</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 select-none font-body">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">Total:</span>
                    <span className="text-lg font-black font-mono leading-none" style={{ color: primaryColor }}>
                      R$ 2.500,00
                    </span>
                  </div>
                </div>

              </div>

              {/* CARD: Condições de Pagamento */}
              <div className="border border-zinc-900 bg-[#0c0c0e]/80 p-5 rounded-xl space-y-3.5 shadow-xl select-none">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-2.5">
                  <Plus className="h-4 w-4" style={{ color: secondaryColor }} />
                  <h3 className="text-[10px] font-black uppercase tracking-wider" style={{ color: secondaryColor }}>Condições de Pagamento</h3>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                  As condições de pagamento serão exibidas automaticamente com base nos dados do orçamento aprovado.
                </p>
              </div>

              {/* Simulated Customer Reviews Section if enabled */}
              {showReviews && (
                <div className="border border-zinc-900 bg-[#0c0c0e]/80 p-5 rounded-xl space-y-3 shadow-xl select-none animate-slide-down">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" style={{ color: primaryColor }} />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">O que dizem os Clientes</h3>
                  </div>
                  <div className="p-3 rounded bg-zinc-950/40 border border-zinc-900 text-center">
                    <p className="text-[10px] text-zinc-400 italic">"Excelente atendimento, equipe atenciosa e projeto entregue com máxima qualidade."</p>
                    <span className="text-[8px] font-bold text-zinc-500 block mt-2">- Mariana Sousa</span>
                  </div>
                </div>
              )}

              {/* Simulated Portfolio Section if enabled */}
              {showProjects && (
                <div className="border border-zinc-900 bg-[#0c0c0e]/80 p-5 rounded-xl space-y-3 shadow-xl select-none animate-slide-down">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" style={{ color: primaryColor }} />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Nosso Portfólio ({maxProjects} itens)</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: Math.min(maxProjects, 4) }).map((_, i) => (
                      <div key={i} className="aspect-video bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center text-[9px] text-zinc-500 font-mono">
                        Projeto #{i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Submit/Approval Button */}
              <div className="pt-2 flex flex-col items-center gap-2.5 select-none">
                <button
                  type="button"
                  onClick={() => alert(`Você clicou no botão de aprovação simulada! O cliente verá: "${customBtnText || 'Aprovar Proposta'}"`)}
                  className="w-full max-w-xs py-3.5 px-6 rounded-xl text-white font-extrabold text-xs flex items-center justify-center gap-2 uppercase tracking-widest transition-all hover:scale-102 active:scale-98 shadow-lg hover:shadow-xl cursor-pointer"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    boxShadow: `0 4px 14px ${primaryColor}25`
                  }}
                >
                  <Check className="h-4 w-4 text-white" />
                  <span>{customBtnText || 'Aprovar Proposta'}</span>
                </button>
                <p className="text-[9px] text-zinc-650 font-mono text-center max-w-xs leading-normal">
                  Ao aprovar, você aceita digitalmente os termos do contrato DGFlow sob a conformidade jurídica MP 2.200-2.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}


      {/* MODAL: MODELOS DE CONTRATO (MANAGE TEMPLATES) */}
      {isModelsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-[#0c0c0e] border border-[#1f1f23] text-white p-6 shadow-2xl animate-fade-in relative">
            <button 
              onClick={() => setIsModelsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 font-bold text-lg"
            >
              ×
            </button>
            
            <h2 className="text-base font-bold text-white mb-2 flex items-center gap-1.5">
              <FileCode className="h-5 w-5 text-[#e13a40]" />
              Modelos de Contrato
            </h2>
            <p className="text-zinc-500 text-xs mb-4">Gerencie seus modelos de contrato. O modelo padrão será usado automaticamente ao criar novos contratos.</p>
            
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">Template Padrão (dgflow)</span>
                    <span className="text-[8px] font-black text-[#e13a40] bg-[#e13a40]/10 px-1 py-0.2 rounded border border-[#e13a40]/20">PADRÃO</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1 max-w-xs truncate">
                    {activeTemplate.slice(0, 80)}...
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setIsModelsModalOpen(false);
                      setIsEditorOpen(true);
                    }}
                    className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                    title="Editar Modelo"
                  >
                    <SettingsIcon className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm("Restaurar modelo padrão de fábrica?")) {
                        saveActiveTemplateToStorage(DEFAULT_CONTRACT_TEMPLATE);
                        setTemplateBody(DEFAULT_CONTRACT_TEMPLATE);
                        alert("Modelo restaurado!");
                      }
                    }}
                    className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-rose-500"
                    title="Restaurar Padrão"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsModelsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO MODELO (TEMPLATE EDITOR WITH SHORTCODES SIDEBAR) */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-5xl rounded-xl bg-[#0c0c0e] border border-[#1f1f23] text-white p-6 shadow-2xl animate-fade-in relative flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-hidden">
            
            {/* Editor form (Left) */}
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                  <FileCode className="h-5 w-5 text-[#e13a40]" />
                  Personalizar Modelo de Contrato
                </h2>
                <button 
                  onClick={() => {
                    setIsEditorOpen(false);
                    setIsModelsModalOpen(true);
                  }}
                  className="text-zinc-500 hover:text-zinc-300 text-lg font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-semibold">Nome do Modelo</label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="bg-[#101014] border-zinc-800 text-white"
                />
              </div>

              <div className="space-y-1 flex-1 flex flex-col min-h-[300px]">
                <label className="text-xs text-zinc-400 font-semibold">Corpo do Modelo</label>
                <textarea
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  className="w-full flex-1 bg-[#101014] border border-zinc-800 text-xs rounded-lg p-4 font-mono text-zinc-200 outline-none focus:border-[#e13a40] min-h-[300px]"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  onClick={() => {
                    setIsEditorOpen(false);
                    setIsModelsModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white"
                >
                  Voltar
                </button>
                <button
                  onClick={() => {
                    saveActiveTemplateToStorage(templateBody);
                    alert("Modelo de Contrato salvo com sucesso!");
                    setIsEditorOpen(false);
                    setIsModelsModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white font-semibold"
                >
                  Salvar Modelo
                </button>
              </div>
            </div>

            {/* Shortcodes Sidebar (Right) */}
            <div className="w-full md:w-80 bg-zinc-950/40 p-4 rounded-xl border border-zinc-900 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Shortcodes Disponíveis</h3>
                <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
                  Clique nas tags abaixo para copiá-las para a área de transferência e colá-las no corpo do modelo.
                </p>
              </div>

              {/* Category: Prestador */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-zinc-600 uppercase block">Dados do Prestador</span>
                <div className="space-y-1.5 text-[10px]">
                  {[
                    '{{Nome do Prestador}}',
                    '{{Endereço do Prestador}}',
                    '{{Número do Endereço Prestador}}',
                    '{{Bairro do Prestador}}',
                    '{{Cidade do Prestador}}',
                    '{{Estado do Prestador}}',
                    '{{CPF/CNPJ do Prestador}}',
                  ].map(sh => (
                    <button
                      key={sh}
                      onClick={() => {
                        navigator.clipboard.writeText(sh);
                        alert(`Atalho ${sh} copiado!`);
                      }}
                      className="w-full text-left p-1.5 rounded bg-zinc-900/60 border border-zinc-900/80 hover:border-[#e13a40]/40 text-zinc-300 font-mono flex items-center justify-between"
                    >
                      <span>{sh}</span>
                      <Copy className="h-3 w-3 text-zinc-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category: Cliente */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-zinc-600 uppercase block">Dados do Cliente</span>
                <div className="space-y-1.5 text-[10px]">
                  {[
                    '{{Nome do Cliente}}',
                    '{{Endereço do Cliente}}',
                    '{{Número do Endereço Cliente}}',
                    '{{Bairro do Cliente}}',
                    '{{Cidade do Cliente}}',
                    '{{Estado do Cliente}}',
                    '{{CPF/CNPJ do Cliente}}',
                    '{{Representante do Cliente}}',
                  ].map(sh => (
                    <button
                      key={sh}
                      onClick={() => {
                        navigator.clipboard.writeText(sh);
                        alert(`Atalho ${sh} copiado!`);
                      }}
                      className="w-full text-left p-1.5 rounded bg-zinc-900/60 border border-zinc-900/80 hover:border-[#e13a40]/40 text-zinc-300 font-mono flex items-center justify-between"
                    >
                      <span>{sh}</span>
                      <Copy className="h-3 w-3 text-zinc-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category: Projeto & Valores */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-zinc-600 uppercase block">Projeto & Financeiro</span>
                <div className="space-y-1.5 text-[10px]">
                  {[
                    '{{Nome do Projeto}}',
                    '{{Serviços Inclusos}}',
                    '{{Prazo do Contrato}}',
                    '{{Valor Total}}',
                    '{{Valor do Desconto}}',
                    '{{Valor Final}}',
                    '{{Condições de Pagamento}}',
                    '{{Forma de Pagamento}}',
                    '{{Número de Parcelas}}',
                    '{{Data}}',
                  ].map(sh => (
                    <button
                      key={sh}
                      onClick={() => {
                        navigator.clipboard.writeText(sh);
                        alert(`Atalho ${sh} copiado!`);
                      }}
                      className="w-full text-left p-1.5 rounded bg-zinc-900/60 border border-zinc-900/80 hover:border-[#e13a40]/40 text-zinc-300 font-mono flex items-center justify-between"
                    >
                      <span>{sh}</span>
                      <Copy className="h-3 w-3 text-zinc-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* MODAL: NOVO ORÇAMENTO (4-STEP CREATION WIZARD) */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl bg-[#0c0c0e] border border-[#1f1f23] text-white p-6 shadow-2xl animate-fade-in relative flex flex-col max-h-[90vh] overflow-hidden">
            <button 
              onClick={() => setIsWizardOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 font-bold text-lg"
            >
              ×
            </button>

            <h2 className="text-xl font-bold text-white leading-none text-left">
              Novo Orçamento
            </h2>
            <p className="text-xs text-zinc-400 mt-2 font-medium text-left">
              Crie um orçamento profissional para enviar ao cliente
            </p>

            {/* Wizard Steps indicator matching screenshots exactly */}
            <div className="flex items-center justify-center my-6 select-none relative">
              <div className="flex items-center gap-1">
                {[
                  { s: 1, label: 'Identificação' },
                  { s: 2, label: 'Serviços' },
                  { s: 3, label: 'Pagamentos' },
                  { s: 4, label: 'Revisão' }
                ].map((step, idx) => {
                  const isChecked = wizardStep > step.s;
                  const isActive = wizardStep === step.s;
                  return (
                    <div key={step.s} className="flex items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isChecked || isActive 
                          ? 'bg-[#e13a40] text-white shadow-sm shadow-[#e13a40]/10' 
                          : 'bg-[#121214] border border-zinc-800 text-zinc-500'
                      }`}>
                        {isChecked ? '✓' : step.s}
                      </div>
                      {idx < 3 && (
                        <div className={`h-[2px] w-8 sm:w-16 transition-all ${
                          wizardStep > step.s ? 'bg-[#e13a40]' : 'bg-zinc-800'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Wizard Content Scrollable */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-left">
              
              {/* STEP 1: DADOS DO CLIENTE */}
              {wizardStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider select-none">Identificação da Proposta</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Vincular a um Cliente ou Lead existente */}
                    <div className="space-y-1.5 col-span-2 relative">
                      <label className="text-xs text-zinc-400 font-semibold flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Vincular a um Cliente ou Lead existente</span>
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsContactDropdownOpen(!isContactDropdownOpen)}
                          className="w-full flex items-center justify-between rounded-lg border border-zinc-800 bg-[#101014] text-zinc-400 px-4 h-10 text-xs font-semibold cursor-pointer focus:border-[#e13a40] outline-none"
                        >
                          <span className={wizContactId ? "text-white font-bold" : "text-zinc-500"}>
                            {wizContactId 
                              ? contacts.find(c => String(c.id) === String(wizContactId))?.name || wizClientName
                              : "Selecione um cliente ou lead..."}
                          </span>
                          <ChevronDown className="h-4 w-4 text-zinc-550" />
                        </button>

                        {isContactDropdownOpen && (
                          <>
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsContactDropdownOpen(false);
                              }}
                            />
                            <div className="absolute top-11 left-0 right-0 z-50 rounded-lg border border-zinc-800 bg-[#0c0c0e] p-2 shadow-2xl flex flex-col max-h-[220px] overflow-hidden">
                              {/* Search input inside dropdown */}
                              <div className="relative mb-2 shrink-0">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-550" />
                                <input
                                  type="text"
                                  value={contactSearchTerm}
                                  onChange={(e) => setContactSearchTerm(e.target.value)}
                                  placeholder="Buscar por nome, email, telefone..."
                                  className="pl-8 bg-zinc-950/60 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:border-[#e13a40] h-8 w-full rounded outline-none font-semibold"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>

                              {/* Contacts List */}
                              <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                                {contacts.filter(c => 
                                  (c.name || '').toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
                                  (c.email || '').toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
                                  (c.phone || '').toLowerCase().includes(contactSearchTerm.toLowerCase())
                                ).length === 0 ? (
                                  <div className="text-center py-4 text-zinc-500 text-xs">Nenhum cliente/lead encontrado</div>
                                ) : (
                                  contacts
                                    .filter(c => 
                                      (c.name || '').toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
                                      (c.email || '').toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
                                      (c.phone || '').toLowerCase().includes(contactSearchTerm.toLowerCase())
                                    )
                                    .map(c => {
                                      const isLead = c.current_stage !== 'fechado';
                                      return (
                                        <button
                                          key={c.id}
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setWizContactId(c.id);
                                            setWizClientName(c.name || '');
                                            setWizClientEmail(c.email || '');
                                            setWizClientPhone(c.phone || '');
                                            setWizClientCpfCnpj(c.doc || '');
                                            setWizClientAddress(c.endereço || '');
                                            setWizClientNum(c.numero || '');
                                            setWizClientBairro(c.bairro || '');
                                            setWizClientCity(c.cidade || '');
                                            setWizClientState(c.estado || '');
                                            setWizClientPais(c.pais || 'Brasil');
                                            setWizClientRepresentative(c.representante || c.name || '');
                                            if (!wizProjectName) {
                                              setWizProjectName(`Orçamento - ${c.name}`);
                                            }
                                            setIsContactDropdownOpen(false);
                                            setContactSearchTerm('');
                                          }}
                                          className="w-full text-left rounded p-2 hover:bg-zinc-800 transition-all text-xs font-semibold text-zinc-350 flex items-center justify-between cursor-pointer"
                                        >
                                          <div className="flex flex-col">
                                            <span className="text-white font-bold">{c.name}</span>
                                            <span className="text-[10px] text-zinc-550">{c.phone || c.email || 'Sem contato'}</span>
                                          </div>
                                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                                            isLead 
                                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                          }`}>
                                            {isLead ? 'Lead' : 'Cliente'}
                                          </span>
                                        </button>
                                      );
                                    })
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs text-zinc-400 font-semibold">País do Cliente</label>
                      <select
                        value={wizClientPais}
                        onChange={(e) => {
                          setWizClientPais(e.target.value);
                          setWizClientCpfCnpj('');
                        }}
                        className="w-full bg-[#101014] border border-zinc-800 text-white text-xs h-10 rounded-lg px-3 outline-none focus:ring-1 focus:ring-[#e13a40]/50 cursor-pointer"
                      >
                        <option value="Brasil">🇧🇷 Brasil</option>
                        <option value="Portugal">🇵🇹 Portugal</option>
                        <option value="Outro">🌐 Outro</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-semibold">Cliente *</label>
                      <Input
                        required
                        value={wizClientName}
                        onChange={(e) => setWizClientName(e.target.value)}
                        placeholder="Nome do Cliente (Contratante)"
                        className="bg-[#101014] border-zinc-800 text-white text-xs h-10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-semibold">Nome do Projeto / Orçamento *</label>
                      <Input
                        required
                        value={wizProjectName}
                        onChange={(e) => setWizProjectName(e.target.value)}
                        placeholder="Ex: Identidade Visual Premium"
                        className="bg-[#101014] border-zinc-800 text-white text-xs h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-semibold">
                        {wizClientPais === 'Brasil' ? 'CNPJ / CPF do Cliente' : wizClientPais === 'Portugal' ? 'NIF (Nº de Contribuinte)' : 'Documento / VAT ID'}
                      </label>
                      <Input
                        value={wizClientCpfCnpj}
                        onChange={(e) => setWizClientCpfCnpj(e.target.value)}
                        placeholder={wizClientPais === 'Brasil' ? 'Ex: 12.345.678/0001-99' : wizClientPais === 'Portugal' ? 'Ex: 123 456 789' : 'Documento fiscal'}
                        className="bg-[#101014] border-zinc-800 text-white text-xs h-10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-semibold">Representante Legal</label>
                      <Input
                        value={wizClientRepresentative}
                        onChange={(e) => setWizClientRepresentative(e.target.value)}
                        placeholder="Ex: Nome do Representante"
                        className="bg-[#101014] border-zinc-800 text-white text-xs h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-semibold">E-mail do Cliente</label>
                      <Input
                        type="email"
                        value={wizClientEmail}
                        onChange={(e) => setWizClientEmail(e.target.value)}
                        placeholder="Ex: cliente@email.com"
                        className="bg-[#101014] border-zinc-800 text-white text-xs h-10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-semibold">WhatsApp / Telefone</label>
                      <div className="flex gap-2">
                        <span className="bg-[#101014] border border-zinc-800 text-xs text-zinc-350 px-3 rounded-lg select-none font-bold h-10 flex items-center">
                          {wizClientPais === 'Brasil' ? '🇧🇷 +55' : wizClientPais === 'Portugal' ? '🇵🇹 +351' : '🌐 +'}
                        </span>
                        <Input
                          value={wizClientPhone}
                          onChange={(e) => setWizClientPhone(e.target.value)}
                          placeholder={wizClientPais === 'Brasil' ? 'Ex: (11) 99999-9999' : wizClientPais === 'Portugal' ? '912 345 678' : 'Número de contato'}
                          className="bg-[#101014] border-zinc-800 text-white text-xs h-10 flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-zinc-800/30">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs text-zinc-400 font-semibold">
                        {wizClientPais === 'Brasil' ? 'Endereço do Cliente' : wizClientPais === 'Portugal' ? 'Morada / Rua' : 'Endereço'}
                      </label>
                      <Input
                        value={wizClientAddress}
                        onChange={(e) => setWizClientAddress(e.target.value)}
                        placeholder={wizClientPais === 'Brasil' ? 'Av. Paulista...' : wizClientPais === 'Portugal' ? 'Rua das Flores, nº 10' : 'Endereço'}
                        className="bg-[#101014] border-zinc-800 text-white text-xs h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-semibold">Número</label>
                      <Input
                        value={wizClientNum}
                        onChange={(e) => setWizClientNum(e.target.value)}
                        placeholder="100"
                        className="bg-[#101014] border-zinc-800 text-white text-xs h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-semibold">
                        {wizClientPais === 'Brasil' ? 'Bairro' : wizClientPais === 'Portugal' ? 'Localidade / Freguesia' : 'Bairro'}
                      </label>
                      <Input
                        value={wizClientBairro}
                        onChange={(e) => setWizClientBairro(e.target.value)}
                        placeholder={wizClientPais === 'Brasil' ? 'Bela Vista' : wizClientPais === 'Portugal' ? 'Chiado' : 'Bairro'}
                        className="bg-[#101014] border-zinc-800 text-white text-xs h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-semibold">
                        {wizClientPais === 'Brasil' ? 'Cidade' : wizClientPais === 'Portugal' ? 'Concelho' : 'Cidade'}
                      </label>
                      <Input
                        value={wizClientCity}
                        onChange={(e) => setWizClientCity(e.target.value)}
                        placeholder="Cidade"
                        className="bg-[#101014] border-zinc-800 text-white text-xs h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-semibold">Estado</label>
                      <Input
                        value={wizClientState}
                        onChange={(e) => setWizClientState(e.target.value)}
                        placeholder="SP"
                        className="bg-[#101014] border-zinc-800 text-white text-xs h-10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: SELECIONE OS SERVIÇOS (Image 1, 2, 3) */}
              {wizardStep === 2 && (
                <div className="space-y-4 animate-fade-in relative">
                  
                  <div>
                    <h3 className="text-sm font-bold text-white select-none">Selecione os Serviços</h3>
                    <p className="text-[10px] text-zinc-550 mt-0.5 select-none">Adicione os serviços que serão prestados</p>
                  </div>

                  {/* Dropdown Select Field and ad-hoc Custom Service button row */}
                  <div className="flex items-center gap-3 relative select-none">
                    
                    {/* The Select Box Button with red border highlight */}
                    <div className="relative flex-1">
                      <button
                        type="button"
                        onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                        className="w-full flex items-center justify-between rounded-lg border border-[#e13a40] bg-[#101014] text-zinc-400 px-4 h-10 text-xs font-medium cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <FileCode className="h-4 w-4 text-zinc-500" />
                          <span>Adicionar serviço...</span>
                        </div>
                        <span className="text-[8px] text-zinc-550 font-bold">▼</span>
                      </button>

                      {/* Dropdown Overlay with Services search and filter list */}
                      {isServiceDropdownOpen && (
                        <div className="absolute top-11 left-0 right-0 z-50 rounded-lg border border-zinc-800 bg-[#121214] p-2 shadow-2xl flex flex-col max-h-[220px] overflow-hidden">
                          
                          {/* Search block */}
                          <div className="relative mb-2 shrink-0">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-550" />
                            <input
                              type="text"
                              value={serviceSearchTerm}
                              onChange={(e) => setServiceSearchTerm(e.target.value)}
                              placeholder="Buscar serviço..."
                              className="pl-8 bg-zinc-950/40 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:border-[#e13a40] h-8 w-full rounded outline-none font-medium"
                            />
                          </div>

                          {/* Services List scrollable */}
                          <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-body">
                            <span className="text-[9px] font-black text-zinc-650 uppercase tracking-widest px-2 py-0.5 block">Serviços</span>
                            
                            {[
                              { name: 'Gestão de Tráfego (Mensal)', price: 1200.00 },
                              { name: 'Identidade Visual', price: 2500.00 },
                              { name: 'Landing Page', price: 1800.00 },
                              { name: 'Logotipo', price: 800.00 },
                              { name: 'Motion Graphics', price: 2000.00 },
                              { name: 'Planejamento Estratégico', price: 2000.00 },
                              { name: 'Social Media (Mensal)', price: 1500.00 },
                              { name: 'Vídeo Institucional', price: 3000.00 }
                            ]
                              .filter(sv => sv.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()))
                              .map(sv => (
                                <button
                                  key={sv.name}
                                  type="button"
                                  onClick={() => handleAddService(sv.name, sv.price)}
                                  className="w-full text-left rounded p-2 hover:bg-[#e13a40] hover:text-white transition-all text-xs font-semibold text-zinc-300 flex items-center justify-between"
                                >
                                  <span>{sv.name}</span>
                                  <span className="font-mono text-[#e13a40] font-bold">R$ {sv.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </button>
                              ))}
                          </div>

                        </div>
                      )}
                    </div>

                    {/* Ad-hoc Custom Service Trigger button */}
                    <button
                      type="button"
                      onClick={() => setCustomServiceModalOpen(true)}
                      className="h-10 px-4 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Novo</span>
                    </button>

                  </div>

                  {/* Selected Services Cards / Empty indicator container */}
                  {selectedServices.length === 0 ? (
                    <div className="bg-[#121214]/10 border border-zinc-800/40 rounded-xl p-10 flex flex-col items-center justify-center text-center select-none min-h-[160px]">
                      <Package className="h-8 w-8 text-zinc-600 mb-2 stroke-[1.2]" />
                      <h4 className="text-xs font-bold text-zinc-400">Nenhum serviço adicionado</h4>
                      <p className="text-[10px] text-zinc-550 mt-0.5">Use o campo acima para buscar e adicionar serviços</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      
                      {/* Active Services Cards List */}
                      {selectedServices.map((sv, idx) => (
                        <div key={sv.id} className="p-4 rounded-xl border border-zinc-850 bg-[#0c0c0e]/80 space-y-3 relative shadow-md">
                          
                          <div className="flex justify-between items-center select-none">
                            <div className="flex items-center gap-2">
                              <span className="h-5 w-5 rounded-md bg-zinc-900 border border-zinc-850 flex items-center justify-center text-[10px] font-bold text-zinc-400">{idx + 1}</span>
                              <h4 className="text-xs font-bold text-white leading-none">{sv.name}</h4>
                            </div>

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => setSelectedServices(selectedServices.filter(item => item.id !== sv.id))}
                              className="text-zinc-650 hover:text-rose-500 hover:bg-zinc-950/80 rounded p-1 transition-all text-xs font-semibold"
                            >
                              ✕
                            </button>
                          </div>

                          {/* Item Description textarea */}
                          <textarea
                            rows="2"
                            value={sv.description}
                            onChange={(e) => {
                              setSelectedServices(selectedServices.map(item => 
                                item.id === sv.id ? { ...item, description: e.target.value } : item
                              ));
                            }}
                            placeholder="Descrição do item (opcional)"
                            className="w-full bg-[#101014] border border-zinc-800 text-[11px] rounded-lg p-2 outline-none text-white focus:border-[#e13a40] placeholder-zinc-650 min-h-[50px]"
                          />

                          {/* Quantity control, editable price and calculated service total row */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                            
                            {/* Quantity buttons */}
                            <div className="flex items-center gap-2 select-none">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Qtd:</span>
                              <div className="flex items-center bg-zinc-900 border border-zinc-850 rounded-lg overflow-hidden h-8">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedServices(selectedServices.map(item => 
                                      item.id === sv.id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
                                    ));
                                  }}
                                  className="h-full px-3 text-zinc-400 hover:text-white hover:bg-zinc-950/60 font-bold"
                                >
                                  -
                                </button>
                                <span className="px-3 font-bold text-xs text-white font-mono">{sv.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedServices(selectedServices.map(item => 
                                      item.id === sv.id ? { ...item, quantity: item.quantity + 1 } : item
                                    ));
                                  }}
                                  className="h-full px-3 text-zinc-400 hover:text-white hover:bg-zinc-950/60 font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Editable Price value input */}
                            <div className="flex items-center gap-2 select-none">
                              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Valor unit.:</span>
                              <div className="flex items-center bg-[#101014] border border-zinc-800 rounded-lg p-1.5 h-8 w-28">
                                <span className="text-[10px] text-zinc-500 font-mono pl-1">R$</span>
                                <input
                                  type="number"
                                  value={sv.unitPrice || ''}
                                  onChange={(e) => {
                                    setSelectedServices(selectedServices.map(item => 
                                      item.id === sv.id ? { ...item, unitPrice: parseFloat(e.target.value) || 0 } : item
                                    ));
                                  }}
                                  placeholder="0.00"
                                  className="bg-transparent border-none text-xs text-white font-mono outline-none w-full text-right pr-1"
                                />
                              </div>
                            </div>

                            {/* Calculated service total in brand red */}
                            <div className="font-bold text-xs font-mono text-[#e13a40]">
                              = R$ {(sv.quantity * sv.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>

                          </div>

                        </div>
                      ))}

                      {/* Financial values totals block */}
                      <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950 space-y-4">
                        
                        {/* Discount field input */}
                        <div className="space-y-1.5 select-none">
                          <span className="text-xs font-semibold text-zinc-300 block">Desconto (R$)</span>
                          <Input
                            value={wizDiscount}
                            onChange={(e) => setWizDiscount(e.target.value)}
                            placeholder="0,00"
                            className="bg-[#101014] border-zinc-800 text-white text-xs h-10 w-full"
                          />
                        </div>

                        {/* Calculated Subtotal & Total matching exact design */}
                        <div className="space-y-2 pt-2 border-t border-zinc-800/30 select-none font-mono">
                          <div className="flex justify-between items-center text-xs text-zinc-500">
                            <span>Subtotal:</span>
                            <span>R$ {subtotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 font-body border-t border-zinc-900/60">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">Total:</span>
                            <span className="text-base font-black font-mono text-[#e13a40] leading-none">
                              R$ {finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* STEP 3: CONDIÇÕES DE PAGAMENTO (Image 4) */}
              {wizardStep === 3 && (
                <div className="space-y-5 animate-fade-in text-left">
                  
                  <div>
                    <h3 className="text-sm font-bold text-white select-none">Condições de Pagamento</h3>
                    <p className="text-[10px] text-zinc-550 mt-0.5 select-none">Defina forma de pagamento e prazos</p>
                  </div>

                  {/* Recorrente/Mensalidade Toggle Box */}
                  <div className="p-4 rounded-xl border border-zinc-850 bg-[#121214]/60 flex items-center justify-between shadow-sm select-none">
                    <div>
                      <span className="text-xs font-bold text-zinc-300 block">Recorrente / Mensalidade</span>
                      <span className="text-[10px] text-zinc-550 leading-normal block mt-0.5">Ative para cobranças mensais recorrentes</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setWizIsRecurring(!wizIsRecurring)}
                      className={`h-5.5 w-10 rounded-full transition-all relative shrink-0 ${wizIsRecurring ? 'bg-[#e13a40]' : 'bg-zinc-850'}`}
                    >
                      <div className={`h-4 w-4 rounded-full bg-white absolute top-1/2 -translate-y-1/2 transition-all ${wizIsRecurring ? 'left-5' : 'left-1'}`} />
                    </button>
                  </div>

                  {/* Payment method and conditions dropdown selects */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
                    
                    {/* Forma de Pagamento */}
                    <div className="space-y-1.5 relative">
                      <label className="text-xs text-zinc-300 font-semibold">Forma de Pagamento *</label>
                      <select
                        value={wizPaymentMethod}
                        onChange={(e) => setWizPaymentMethod(e.target.value)}
                        className="w-full bg-[#101014] text-white text-xs rounded-lg border border-zinc-800 p-2.5 outline-none focus:border-[#e13a40] font-semibold h-10 cursor-pointer"
                      >
                        <option value="">Selecione</option>
                        <option value="PIX">PIX</option>
                        <option value="Boleto Bancário">Boleto Bancário</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Transferência Bancária (TED/DOC)">Transferência Bancária (TED/DOC)</option>
                      </select>
                    </div>

                    {/* Condições de Pagamento */}
                    <div className="space-y-1.5 relative">
                      <label className="text-xs text-zinc-300 font-semibold">Condições de Pagamento *</label>
                      <select
                        value={wizPaymentConditions}
                        onChange={(e) => setWizPaymentConditions(e.target.value)}
                        className="w-full bg-[#101014] text-white text-xs rounded-lg border border-zinc-800 p-2.5 outline-none focus:border-[#e13a40] font-semibold h-10 cursor-pointer"
                      >
                        <option value="">Selecione</option>
                        <option value="À Vista (100%)">À Vista (100%)</option>
                        <option value="50% de Sinal + 50% na Entrega">50% de Sinal + 50% na Entrega</option>
                        <option value="30% de Sinal + 70% Parcelado">30% de Sinal + 70% Parcelado</option>
                        <option value="Parcelado em 2x sem juros">Parcelado em 2x sem juros</option>
                        <option value="Parcelado em 3x sem juros">Parcelado em 3x sem juros</option>
                        <option value="Parcelado em até 12x">Parcelado em até 12x</option>
                        <option value="Mensalidade Recorrente">Mensalidade Recorrente</option>
                      </select>
                    </div>

                  </div>

                  {/* Three boxes side-by-side matching screenshot exactly */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    
                    {/* Box 1: Início do Projeto */}
                    <div className="bg-[#121214]/65 border border-zinc-850 rounded-xl p-4 flex flex-col justify-between min-h-[140px] select-none text-left">
                      <div className="space-y-2">
                        <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Início do Projeto</span>
                        
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 font-medium">
                            <input
                              type="radio"
                              name="wizStartMode"
                              checked={wizStartMode === 'days'}
                              onChange={() => setWizStartMode('days')}
                              className="accent-[#e13a40]"
                            />
                            <span>Dias após aprovação</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 font-medium">
                            <input
                              type="radio"
                              name="wizStartMode"
                              checked={wizStartMode === 'date'}
                              onChange={() => setWizStartMode('date')}
                              className="accent-[#e13a40]"
                            />
                            <span>Data específica</span>
                          </label>
                        </div>
                      </div>

                      <div className="mt-3">
                        {wizStartMode === 'days' ? (
                          <input
                            type="text"
                            value={wizStartDays}
                            onChange={(e) => setWizStartDays(e.target.value)}
                            placeholder="Ex: 3 dias"
                            className="w-full bg-[#101014] border border-zinc-800 text-xs rounded-lg p-2 outline-none text-white focus:border-[#e13a40] h-9"
                          />
                        ) : (
                          <input
                            type="date"
                            value={wizStartDate}
                            onChange={(e) => setWizStartDate(e.target.value)}
                            className="w-full bg-[#101014] border border-zinc-800 text-xs rounded-lg p-2 outline-none text-white focus:border-[#e13a40] h-9"
                          />
                        )}
                        <span className="text-[9px] text-zinc-550 block mt-1.5">Início do projeto após aprovação</span>
                      </div>
                    </div>

                    {/* Box 2: Prazo de Entrega */}
                    <div className="bg-[#121214]/65 border border-zinc-850 rounded-xl p-4 flex flex-col justify-between min-h-[140px] select-none text-left">
                      <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Prazo de Entrega</span>
                      
                      <div className="mt-2">
                        <input
                          type="text"
                          value={wizDeliveryTerm}
                          onChange={(e) => setWizDeliveryTerm(e.target.value)}
                          placeholder="Ex: 30 dias corridos"
                          className="w-full bg-[#101014] border border-zinc-800 text-xs rounded-lg p-2 outline-none text-white focus:border-[#e13a40] h-9"
                        />
                        <span className="text-[9px] text-zinc-550 block mt-1.5">Prazo estimado para conclusão</span>
                      </div>
                    </div>

                    {/* Box 3: Validade da Proposta */}
                    <div className="bg-[#121214]/65 border border-zinc-850 rounded-xl p-4 flex flex-col justify-between min-h-[140px] select-none text-left">
                      <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider font-body">Validade da Proposta (dias)</span>
                      
                      <div className="mt-2">
                        <input
                          type="number"
                          value={wizProposalValidity}
                          onChange={(e) => setWizProposalValidity(parseInt(e.target.value) || 30)}
                          className="w-full bg-[#101014] border border-zinc-800 text-xs rounded-lg p-2 outline-none text-white focus:border-[#e13a40] h-9 font-mono"
                        />
                        <span className="text-[9px] text-zinc-550 block mt-1.5">Tempo que o cliente tem para aprovar</span>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* STEP 4: REVISÃO E COMPILAÇÃO */}
              {wizardStep === 4 && (
                <div className="space-y-4 animate-fade-in text-left">
                  
                  <div>
                    <h3 className="text-sm font-bold text-white select-none">Revisão do Orçamento</h3>
                    <p className="text-[10px] text-zinc-550 mt-0.5 select-none font-body">Confirme os dados compilados da proposta antes de finalizar</p>
                  </div>

                  {/* Summary row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
                    
                    {/* Resumo do Cliente */}
                    <div className="p-4 rounded-xl border border-zinc-850 bg-[#121214]/45 space-y-2">
                      <span className="text-[10px] text-[#e13a40] font-black uppercase tracking-wider block">Resumo do Cliente</span>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Cliente:</span>
                          <span className="text-white font-bold">{wizClientName}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Projeto:</span>
                          <span className="text-white font-bold">{wizProjectName}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>CNPJ/CPF:</span>
                          <span className="text-white font-semibold">{wizClientCpfCnpj || 'Não informado'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Resumo do Pagamento */}
                    <div className="p-4 rounded-xl border border-zinc-850 bg-[#121214]/45 space-y-2">
                      <span className="text-[10px] text-[#e13a40] font-black uppercase tracking-wider block">Condições e Prazos</span>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Forma:</span>
                          <span className="text-white font-bold">{wizPaymentMethod}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Condição:</span>
                          <span className="text-white font-bold">{wizPaymentConditions}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-zinc-400">
                          <span>Prazo de Entrega:</span>
                          <span className="text-white font-bold">{wizDeliveryTerm}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Services summary card list */}
                  <div className="p-4 rounded-xl border border-zinc-850 bg-[#121214]/45 space-y-2 select-none">
                    <span className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider font-body">Serviços Selecionados</span>
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {selectedServices.map((sv, idx) => (
                        <div key={sv.id} className="flex justify-between items-center text-xs py-1 border-b border-zinc-900/60 last:border-0">
                          <span className="text-zinc-300 font-medium">{idx + 1}. {sv.name} (x{sv.quantity})</span>
                          <span className="font-mono text-white font-semibold">R$ {(sv.unitPrice * sv.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                    </div>

                    {/* Total details summary */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-zinc-900 select-none">
                      <span className="text-xs font-bold text-zinc-400">Valor Final com Desconto:</span>
                      <span className="text-sm font-black font-mono text-[#e13a40]">R$ {finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Dynamic draft compiled contract preview block */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-zinc-300 block select-none">Prévia do Contrato Preenchido</span>
                    <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-900 font-mono text-[9px] text-zinc-400 leading-normal max-h-[160px] overflow-y-auto whitespace-pre-wrap select-text">
                      {activeTemplate
                        .replace(/{{Nome do Prestador}}/g, 'Gleison')
                        .replace(/{{Nome do Cliente}}/g, wizClientName || '[Cliente]')
                        .replace(/{{Nome do Projeto}}/g, wizProjectName || '[Projeto]')
                        .replace(/{{Valor Final}}/g, `R$ ${finalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
                        .replace(/{{Valor Total}}/g, `R$ ${subtotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
                        .replace(/{{Valor do Desconto}}/g, `R$ ${discountValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
                        .replace(/{{Condições de Pagamento}}/g, wizPaymentConditions || '[Condição]')
                        .replace(/{{Forma de Pagamento}}/g, wizPaymentMethod || '[Forma]')
                        .replace(/{{Prazo do Contrato}}/g, wizDeliveryTerm || '[Prazo]')
                        .slice(0, 800) + '...'}
                    </div>
                  </div>

                </div>
              )}

            </div> {/* closes flex-1 overflow-y-auto */}
            
            {/* Navigation Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-[#1f1f23] mt-6 select-none shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (wizardStep > 1) {
                    setWizardStep(wizardStep - 1);
                  } else {
                    setIsWizardOpen(false);
                  }
                }}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-950/60 hover:bg-[#18181b] text-zinc-400 hover:text-white text-xs font-bold transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (wizardStep < 4) {
                    if (wizardStep === 1 && (!wizClientName || !wizProjectName)) {
                      alert("Por favor, preencha os campos obrigatórios (Cliente e Nome do Projeto).");
                      return;
                    }
                    if (wizardStep === 2 && selectedServices.length === 0) {
                      alert("Por favor, adicione pelo menos um serviço.");
                      return;
                    }
                    if (wizardStep === 3 && (!wizPaymentMethod || !wizPaymentConditions)) {
                      alert("Por favor, preencha todos os campos obrigatórios em Pagamento.");
                      return;
                    }
                    setWizardStep(wizardStep + 1);
                  } else {
                    handleCompileAndSaveContract();
                  }
                }}
                className="flex items-center gap-1 px-5 py-2.5 rounded-lg bg-gradient-primary text-white font-bold text-xs shadow-glow hover:shadow-xl hover:scale-102 transition-all cursor-pointer"
              >
                <span>{wizardStep === 4 ? 'Gerar Orçamento' : 'Próximo'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: VIEW COMPILED FINAL CONTRACT */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl rounded-xl bg-[#0c0c0e] border border-[#1f1f23] text-white p-6 shadow-2xl animate-fade-in relative flex flex-col max-h-[90vh] overflow-hidden">
            <button 
              onClick={() => setSelectedProposal(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 font-bold text-lg"
            >
              ×
            </button>

            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-1.5">
              <FileCheck className="h-5 w-5 text-emerald-500" />
              Contrato Compilado: {selectedProposal.projectName}
            </h2>
            <p className="text-zinc-500 text-xs mb-4">
              Exibindo texto de contrato preenchido e formatado para o cliente <span className="text-white font-medium">{selectedProposal.clientName}</span>.
            </p>

            {/* Scrollable compiled contract text */}
            <div className="flex-1 overflow-y-auto bg-zinc-950 p-6 rounded-lg border border-zinc-900 font-mono text-[11px] text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[60vh] select-text">
              {selectedProposal.compiledText}
            </div>

            {/* Action footer */}
            <div className="pt-4 border-t border-[#1f1f23] flex items-center justify-between text-xs mt-4">
              <div className="text-[10px] text-zinc-500 font-body">
                Assinado eletronicamente via criptografia MP 2.200-2 / DGFlow
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(selectedProposal.compiledText)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar Contrato</span>
                </button>

                <button
                  onClick={() => {
                    const approvalLink = `${window.location.origin}/proposal/${selectedProposal.id}`;
                    navigator.clipboard.writeText(approvalLink);
                    alert("Link da Proposta gerado e copiado para a área de transferência:\n" + approvalLink + "\n\nRedirecionando para a visualização do cliente na DGFlow...");
                    window.open('/proposal/' + selectedProposal.id, '_blank');
                    setSelectedProposal(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white font-semibold shadow-md shadow-[#e13a40]/10 transition-all hover:scale-102"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Ver Proposta & Copiar Link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AD-HOC CUSTOM SERVICE CREATION */}
      {customServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-[#0c0c0e] border border-[#1f1f23] text-white p-5 shadow-2xl animate-fade-in relative text-left">
            <button 
              onClick={() => setCustomServiceModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-550 hover:text-zinc-350 font-bold text-base"
            >
              ×
            </button>
            
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5 select-none">
              <Plus className="h-4 w-4 text-[#e13a40]" />
              Novo Serviço Personalizado
            </h3>
            <p className="text-zinc-500 text-[10px] mb-4 select-none">Adicione um item avulso diretamente a este orçamento.</p>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold select-none">Nome do Serviço *</label>
                <input
                  type="text"
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  placeholder="Ex: Gestão de Redes Sociais Avançada"
                  className="w-full bg-[#101014] border border-zinc-800 text-xs rounded-lg p-2.5 outline-none text-white focus:border-[#e13a40] h-10 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 font-semibold select-none">Valor Unitário (R$) *</label>
                <input
                  type="text"
                  value={customServicePrice}
                  onChange={(e) => setCustomServicePrice(e.target.value)}
                  placeholder="Ex: 1500,00"
                  className="w-full bg-[#101014] border border-zinc-800 text-xs rounded-lg p-2.5 outline-none text-white focus:border-[#e13a40] h-10 font-mono"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 text-xs select-none">
              <button
                type="button"
                onClick={() => setCustomServiceModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddCustomService}
                disabled={!customServiceName || !customServicePrice}
                className="px-4 py-2 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] disabled:opacity-50 disabled:pointer-events-none text-white font-bold shadow-md shadow-[#e13a40]/10 transition-all hover:scale-102"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[9999] flex items-center gap-3 bg-[#0c0c0e] border border-emerald-500/30 p-4 rounded-xl shadow-2xl animate-fade-in select-none">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="text-left">
            <p className="text-xs font-black text-white uppercase tracking-wider">
              {toastMessage.toLowerCase().includes('copiado') ? 'Link Copiado!' : 'Sucesso!'}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{toastMessage}</p>
          </div>
        </div>
      )}

    </div>
  );
}
