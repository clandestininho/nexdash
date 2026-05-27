import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  FileText, 
  PlusCircle,
  TrendingUp, 
  AlertCircle, 
  Trash2,
  Search,
  Filter,
  Check,
  CreditCard,
  Users,
  Layers,
  Settings,
  Calendar,
  Sparkles,
  ChevronDown,
  X,
  MapPin,
  Percent,
  PlusSquare,
  Building
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

const INITIAL_TRANSACTIONS = [
  { id: 'tx-1', type: 'income', client: 'Marina Sousa', description: 'Identidade Visual - Entrada', category: 'Serviços', amount: 3500.00, date: '2026-05-20', status: 'received' },
  { id: 'tx-2', type: 'expense', client: 'Google Suite', description: 'Assinatura Google Workspace', category: 'Ferramentas e Software', amount: 89.90, date: '2026-05-18', status: 'paid' },
  { id: 'tx-3', type: 'income', client: 'Construtora Pernambuco', description: 'Consultoria Mensal', category: 'Consultoria', amount: 6000.00, date: '2026-05-15', status: 'received' },
  { id: 'tx-4', type: 'expense', client: 'HostGator', description: 'Hospedagem Web VPS', category: 'Infraestrutura', amount: 249.00, date: '2026-05-10', status: 'paid' },
  { id: 'tx-5', type: 'income', client: 'Carlos Silva', description: 'Social Media Integrada', category: 'Marketing e Tráfego', amount: 1500.00, date: '2026-05-05', status: 'pending' },
];

const INITIAL_SUPPLIERS = [
  { id: 'sup-1', name: 'Google Cloud Brasil', company: 'Google Inc.', doc: '06.990.590/0001-23', email: 'billing@google.com', phone: '(11) 99887-7665', obs: 'Cobranças mensais de servidores e Workspace' },
  { id: 'sup-2', name: 'HostGator Host', company: 'Endurance Group', doc: '10.552.122/0001-40', email: 'suporte@hostgator.com.br', phone: '(48) 3221-8888', obs: 'Hospedagem anual dos portfólios' },
  { id: 'sup-3', name: 'Adobe Systems', company: 'Adobe Inc.', doc: '02.441.900/0001-88', email: 'creative@adobe.com', phone: '0800-776-554', obs: 'Licenças mensais da Creative Cloud Suite' },
];

const INITIAL_CLIENTS_SUMMARY = [
  { id: 'cli-1', name: 'Marina Sousa', email: 'marina@design.com', items: 3, total: 4500.00, status: 'approved' },
  { id: 'cli-2', name: 'Construtora Pernambuco', email: 'contato@pernambuco.com', items: 12, total: 24000.00, status: 'approved' },
  { id: 'cli-3', name: 'Carlos Silva', email: 'carlos@empresa.com.br', items: 2, total: 3000.00, status: 'pending' },
];

const INITIAL_CATEGORIES_RECEIVABLE = ['Serviços', 'Produtos', 'Consultoria', 'Projetos', 'Assinaturas', 'Comissões', 'Outros'];
const INITIAL_CATEGORIES_PAYABLE = ['Ferramentas e Software', 'Marketing e Tráfego', 'Salários e Freelancers', 'Impostos e Taxas', 'Infraestrutura', 'Material de Escritório', 'Alimentação e Transporte', 'Outros'];

export default function Finance() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [transactions, setTransactions] = useState([]);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [clientsSummary, setClientsSummary] = useState(INITIAL_CLIENTS_SUMMARY);
  const [earningCategories, setEarningCategories] = useState(INITIAL_CATEGORIES_RECEIVABLE);
  const [spendingCategories, setSpendingCategories] = useState(INITIAL_CATEGORIES_PAYABLE);

  // Modals visibility toggles
  const [isVendaModalOpen, setIsVendaModalOpen] = useState(false);
  const [isDespesaModalOpen, setIsDespesaModalOpen] = useState(false);
  const [isCategoriasModalOpen, setIsCategoriasModalOpen] = useState(false);
  const [isFornecedorModalOpen, setIsFornecedorModalOpen] = useState(false);

  // Venda Rápida Form States
  const [vendaClient, setVendaClient] = useState('');
  const [vendaProduct, setVendaProduct] = useState('Serviços');
  const [vendaDesc, setVendaDesc] = useState('');
  const [vendaAmount, setVendaAmount] = useState('');
  const [vendaCurrency, setVendaCurrency] = useState('BRL');
  const [vendaDate, setVendaDate] = useState('');
  const [vendaMode, setVendaMode] = useState('À Vista'); // À Vista | Parcelado | Recorrente
  const [vendaStatus, setVendaStatus] = useState('received'); // received | pending
  const [vendaCategory, setVendaCategory] = useState('Serviços');
  const [vendaCreateTask, setVendaCreateTask] = useState(false);
  const [vendaObs, setVendaObs] = useState('');

  // Lançar Despesa Form States
  const [despesaSupplier, setDespesaSupplier] = useState('');
  const [despesaDesc, setDespesaDesc] = useState('');
  const [despesaAmount, setDespesaAmount] = useState('');
  const [despesaCurrency, setDespesaCurrency] = useState('BRL');
  const [despesaDate, setDespesaDate] = useState('');
  const [despesaStatus, setDespesaStatus] = useState('paid'); // paid | pending
  const [despesaType, setDespesaType] = useState('Avulsa'); // Avulsa | Recorrente
  const [despesaCategory, setDespesaCategory] = useState('Ferramentas e Software');
  const [despesaObs, setDespesaObs] = useState('');

  // Categorias Form States
  const [catActiveTab, setCatActiveTab] = useState('receber'); // receber | pagar
  const [newCatName, setNewCatName] = useState('');
  const [selectedCatColor, setSelectedCatColor] = useState('#e13a40');

  // Fornecedor Form States
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [fornecedorEmpresa, setFornecedorEmpresa] = useState('');
  const [fornecedorCPFCNPJ, setFornecedorCPFCNPJ] = useState('');
  const [fornecedorEmail, setFornecedorEmail] = useState('');
  const [fornecedorTelefone, setFornecedorTelefone] = useState('');
  const [fornecedorObs, setFornecedorObs] = useState('');

  // PIX Form States
  const [pixKeyType, setPixKeyType] = useState('CNPJ');
  const [pixKeyVal, setPixKeyVal] = useState('12.345.678/0001-99');
  const [pixBeneficiary, setPixBeneficiary] = useState('Estúdio Milla & Lipe LTDA');
  const [pixCity, setPixCity] = useState('Recife');
  const [pixDisplayRules, setPixDisplayRules] = useState('Apenas para pagamentos à vista e entradas');
  const [pixCustomMsg, setPixCustomMsg] = useState('Favor enviar o comprovante de pagamento via WhatsApp.');
  const [pixActiveState, setPixActiveState] = useState(true);

  // Search & Filtration
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const loadTxs = () => {
      const stored = localStorage.getItem('dgflow_transactions');
      if (stored) {
        setTransactions(JSON.parse(stored));
      } else {
        setTransactions(INITIAL_TRANSACTIONS);
        localStorage.setItem('dgflow_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
      }
    };
    loadTxs();

    // Listen to sidebar button calls
    const handleOpenVendaEvent = () => setIsVendaModalOpen(true);
    window.addEventListener('open-new-sale-modal', handleOpenVendaEvent);

    return () => {
      window.removeEventListener('open-new-sale-modal', handleOpenVendaEvent);
    };
  }, []);

  const saveTxs = (newTxs) => {
    setTransactions(newTxs);
    localStorage.setItem('dgflow_transactions', JSON.stringify(newTxs));
  };

  const handleAddVenda = (e) => {
    e.preventDefault();
    if (!vendaClient || !vendaAmount || !vendaDate || !vendaDesc) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    const newTx = {
      id: 'tx-' + Date.now(),
      type: 'income',
      client: vendaClient,
      description: vendaDesc,
      category: vendaCategory,
      amount: parseFloat(vendaAmount),
      date: vendaDate,
      status: vendaStatus,
      mode: vendaMode,
      currency: vendaCurrency,
      obs: vendaObs
    };

    saveTxs([newTx, ...transactions]);
    setIsVendaModalOpen(false);

    // If trigger checkbox active, dispatch new task event
    if (vendaCreateTask) {
      const taskEvent = new CustomEvent('dgflow_add_task_trigger', {
        detail: { text: `[PROJETO] ${vendaClient} - ${vendaDesc}`, client: vendaClient }
      });
      window.dispatchEvent(taskEvent);
    }

    // Reset Form
    setVendaClient('');
    setVendaDesc('');
    setVendaAmount('');
    setVendaDate('');
    setVendaObs('');
    setVendaCreateTask(false);
  };

  const handleAddDespesa = (e) => {
    e.preventDefault();
    if (!despesaSupplier || !despesaAmount || !despesaDate || !despesaDesc) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    const newTx = {
      id: 'tx-' + Date.now(),
      type: 'expense',
      client: despesaSupplier,
      description: despesaDesc,
      category: despesaCategory,
      amount: parseFloat(despesaAmount),
      date: despesaDate,
      status: despesaStatus,
      mode: despesaType,
      currency: despesaCurrency,
      obs: despesaObs
    };

    saveTxs([newTx, ...transactions]);
    setIsDespesaModalOpen(false);

    // Reset Form
    setDespesaSupplier('');
    setDespesaDesc('');
    setDespesaAmount('');
    setDespesaDate('');
    setDespesaObs('');
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (catActiveTab === 'receber') {
      setEarningCategories([...earningCategories, newCatName.trim()]);
    } else {
      setSpendingCategories([...spendingCategories, newCatName.trim()]);
    }
    setNewCatName('');
  };

  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (!fornecedorNome.trim()) {
      alert('O nome do fornecedor é obrigatório.');
      return;
    }

    const newSup = {
      id: 'sup-' + Date.now(),
      name: fornecedorNome,
      company: fornecedorEmpresa,
      doc: fornecedorCPFCNPJ,
      email: fornecedorEmail,
      phone: fornecedorTelefone,
      obs: fornecedorObs
    };

    setSuppliers([...suppliers, newSup]);
    setIsFornecedorModalOpen(false);

    // Clean form
    setFornecedorNome('');
    setFornecedorEmpresa('');
    setFornecedorCPFCNPJ('');
    setFornecedorEmail('');
    setFornecedorTelefone('');
    setFornecedorObs('');
  };

  const handleDeleteTx = (id) => {
    if (confirm('Deseja realmente excluir esta transação?')) {
      const filtered = transactions.filter(t => t.id !== id);
      saveTxs(filtered);
    }
  };

  // Calculations
  const totalReceitas = transactions
    .filter(t => t.type === 'income' && t.status === 'received')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingReceitas = transactions
    .filter(t => t.type === 'income' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = transactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingDespesas = transactions
    .filter(t => t.type === 'expense' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const lucroLiquido = totalReceitas - totalDespesas;

  // Filter list
  const filteredTxs = transactions.filter(t => {
    const matchesSearch = 
      t.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && t.type === filterType;
  });

  const catColorsPalette = [
    '#e13a40', '#ea580c', '#d97706', '#ca8a04', '#65a30d', '#16a34a', 
    '#059669', '#0d9488', '#0891b2', '#0284c7', '#2563eb', '#4f46e5', 
    '#7c3aed', '#9333ea', '#c084fc', '#db2777', '#e11d48'
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* Header Banner and Action Triggers */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-[#e13a40]" />
            Controle Financeiro
          </h1>
          <p className="text-xs text-zinc-500 mt-1 font-body">
            Faturamento líquido, relatórios Competência, PIX integrado e conciliação bancária unificada.
          </p>
        </div>

        {/* Dynamic click actions mapped field-by-field */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsVendaModalOpen(true)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-primary text-white font-semibold shadow-glow hover:shadow-xl hover:scale-105 transition-all duration-300 h-9 px-3.5 py-2 gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Venda Rápida</span>
          </button>
          
          <button
            onClick={() => setIsDespesaModalOpen(true)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 border border-[#1f1f1f] text-zinc-300 hover:text-white font-semibold transition-all duration-300 h-9 px-3.5 py-2 gap-2 hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>Lançar Despesa</span>
          </button>

          <button
            onClick={() => setIsCategoriasModalOpen(true)}
            className="px-3 py-2 rounded-lg border border-[#1f1f1f] bg-[#121212] text-zinc-300 hover:text-white text-xs font-semibold hover:bg-[#1a1a1a] transition-all"
          >
            Categorias
          </button>
        </div>
      </div>

      {/* Sub-Tabs Grid Selector - 10 tabs perfectly matching the deep-dive */}
      <div className="flex items-center gap-1 border-b border-[#1f1f1f] overflow-x-auto pb-1.5 scrollbar-thin">
        {[
          { id: 'visao-geral', label: 'Visão Geral' },
          { id: 'receber', label: 'Receber' },
          { id: 'pagar', label: 'Pagar' },
          { id: 'clientes', label: 'Clientes' },
          { id: 'fornecedores', label: 'Fornecedores' },
          { id: 'pix', label: 'PIX' },
          { id: 'recorrentes', label: 'Recorrentes' },
          { id: 'caixa', label: 'Caixa' },
          { id: 'notafiscal', label: 'Nota Fiscal' },
          { id: 'relatorios', label: 'Relatórios' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all shrink-0 font-body ${
              activeTab === tab.id
                ? 'border-[#e13a40] text-white bg-[#121212]/50'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. VISÃO GERAL */}
      {activeTab === 'visao-geral' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Receivables widget */}
            <Card className="bg-[#121212] border-[#1f1f1f] text-white shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center justify-between font-body">
                  <span>Receitas a Receber</span>
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-bold text-white font-body">
                  R$ {(totalReceitas + pendingReceitas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500">
                  <div>
                    <span className="block font-medium">Pago no Mês</span>
                    <span className="font-semibold text-emerald-400">R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span className="block font-medium">Pendente</span>
                    <span className="font-semibold text-zinc-300">R$ {pendingReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payables widget */}
            <Card className="bg-[#121212] border-[#1f1f1f] text-white shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center justify-between font-body">
                  <span>Despesas a Pagar</span>
                  <ArrowDownLeft className="h-4 w-4 text-rose-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-bold text-white font-body">
                  R$ {(totalDespesas + pendingDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500">
                  <div>
                    <span className="block font-medium">Liquidado</span>
                    <span className="font-semibold text-rose-400">R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span className="block font-medium">Pendente</span>
                    <span className="font-semibold text-zinc-300">R$ {pendingDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Net Profits widget */}
            <Card className="bg-[#121212] border-[#1f1f1f] text-white bg-gradient-to-br from-[#121212] to-[#1a1111]/30 shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between font-body">
                  <span>Resultado Líquido</span>
                  <TrendingUp className="h-4 w-4 text-[#e13a40]" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-black text-white font-body">
                  R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[10px] text-zinc-500 font-body leading-normal">
                  Relação direta Competência do mês atual acumulando total receitas liquidadas descontando saídas confirmadas.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Alerts Banner */}
          {pendingDespesas > 0 && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-400 font-body">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>Atenção: Há despesas registradas pendentes de liquidação. Lembre-se de anexar recibos para manter a contabilidade alinhada.</span>
            </div>
          )}

          {/* Unified cash transaction registry extrato */}
          <Card className="bg-[#121212] border-[#1f1f1f] text-white shadow-card">
            <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold">Extrato do Fluxo de Caixa</CardTitle>
                <CardDescription className="text-zinc-500 text-xs font-body">Histórico geral de entradas e saídas financeiras cadastradas no painel</CardDescription>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar movimentação..."
                    className="bg-[#1a1a1a] text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#1f1f1f] outline-none text-white focus:border-[#e13a40] placeholder-zinc-600 transition-all font-body"
                  />
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-[#1a1a1a] text-xs px-2.5 py-1.5 rounded-lg border border-[#1f1f1f] outline-none text-white focus:border-[#e13a40] transition-all font-body cursor-pointer"
                >
                  <option value="all">Todas as transações</option>
                  <option value="income">Apenas Receitas</option>
                  <option value="expense">Apenas Despesas</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#1f1f1f] text-zinc-500 bg-[#0a0a0a]/60 font-semibold uppercase text-[9px] tracking-wider font-body">
                      <th className="p-3 pl-6">Data</th>
                      <th className="p-3">Fluxo</th>
                      <th className="p-3">Entidade</th>
                      <th className="p-3">Descrição / Título</th>
                      <th className="p-3">Categoria</th>
                      <th className="p-3 text-right">Valor</th>
                      <th className="p-3">Faturamento</th>
                      <th className="p-3 text-center pr-6">Remover</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxs.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-12 text-zinc-600 font-body">Nenhum registro correspondente aos filtros.</td>
                      </tr>
                    ) : (
                      filteredTxs.map((tx) => (
                        <tr key={tx.id} className="border-b border-[#1f1f1f]/50 hover:bg-[#1a1a1a]/30 transition-all">
                          <td className="p-3 pl-6 font-mono text-zinc-500">{tx.date}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 font-semibold ${
                              tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                              {tx.type === 'income' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                              {tx.type === 'income' ? 'Entrada' : 'Saída'}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-white">{tx.client}</td>
                          <td className="p-3 text-zinc-400 font-body">{tx.description}</td>
                          <td className="p-3">
                            <span className="bg-[#1a1a1a] border border-[#1f1f1f] text-zinc-400 px-2 py-0.5 rounded text-[10px] font-body">
                              {tx.category}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-white font-mono">
                            {tx.currency === 'USD' ? '$' : tx.currency === 'EUR' ? '€' : 'R$'} {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              tx.status === 'received' || tx.status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}>
                              {tx.status === 'received' || tx.status === 'paid' ? 'Liquidado' : 'Pendente'}
                            </span>
                          </td>
                          <td className="p-3 text-center pr-6">
                            <button
                              onClick={() => handleDeleteTx(tx.id)}
                              className="text-zinc-600 hover:text-rose-500 p-1 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. RECEBER */}
      {activeTab === 'receber' && (
        <Card className="bg-[#121212] border-[#1f1f1f] text-white shadow-card">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Contas a Receber</CardTitle>
              <CardDescription className="text-zinc-500 text-xs font-body">Gestão de faturamento de contratos, produtos digitais e serviços prestados</CardDescription>
            </div>
            <button
              onClick={() => setIsVendaModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nova Receita</span>
            </button>
          </CardHeader>
          <CardContent className="px-0">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1f1f1f] text-zinc-500 bg-[#0a0a0a]/60 font-semibold uppercase text-[9px] tracking-wider">
                  <th className="p-3 pl-6">Data</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Descrição</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3 text-right">Valor</th>
                  <th className="p-3 pr-6">Faturamento</th>
                </tr>
              </thead>
              <tbody>
                {transactions.filter(t => t.type === 'income').length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-zinc-600">Nenhum faturamento registrado.</td>
                  </tr>
                ) : (
                  transactions.filter(t => t.type === 'income').map(tx => (
                    <tr key={tx.id} className="border-b border-[#1f1f1f]/50 hover:bg-[#1a1a1a]/30">
                      <td className="p-3 pl-6 font-mono text-zinc-500">{tx.date}</td>
                      <td className="p-3 font-semibold text-white">{tx.client}</td>
                      <td className="p-3 text-zinc-400 font-body">{tx.description}</td>
                      <td className="p-3"><span className="bg-[#1a1a1a] border border-[#1f1f1f] text-zinc-400 px-2 py-0.5 rounded">{tx.category}</span></td>
                      <td className="p-3 text-right font-bold text-white font-mono">R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 pr-6">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${
                          tx.status === 'received' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {tx.status === 'received' ? 'Liquidado' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 3. PAGAR */}
      {activeTab === 'pagar' && (
        <div className="space-y-6">
          <Card className="bg-[#121212] border-[#1f1f1f] text-white shadow-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Contas a Pagar</CardTitle>
                <CardDescription className="text-zinc-500 text-xs font-body">Gestão de saídas operacionais, licenças de design e custos fixos</CardDescription>
              </div>
              <button
                onClick={() => setIsDespesaModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white font-semibold text-xs transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nova Despesa</span>
              </button>
            </CardHeader>
            <CardContent className="px-0">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1f1f1f] text-zinc-500 bg-[#0a0a0a]/60 font-semibold uppercase text-[9px] tracking-wider">
                    <th className="p-3 pl-6">Data</th>
                    <th className="p-3">Fornecedor</th>
                    <th className="p-3">Descrição</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3 text-right">Valor</th>
                    <th className="p-3 pr-6">Liquidação</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.filter(t => t.type === 'expense').length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-zinc-600">Nenhuma despesa registrada.</td>
                    </tr>
                  ) : (
                    transactions.filter(t => t.type === 'expense').map(tx => (
                      <tr key={tx.id} className="border-b border-[#1f1f1f]/50 hover:bg-[#1a1a1a]/30">
                        <td className="p-3 pl-6 font-mono text-zinc-500">{tx.date}</td>
                        <td className="p-3 font-semibold text-white">{tx.client}</td>
                        <td className="p-3 text-zinc-400 font-body">{tx.description}</td>
                        <td className="p-3"><span className="bg-[#1a1a1a] border border-[#1f1f1f] text-zinc-400 px-2 py-0.5 rounded">{tx.category}</span></td>
                        <td className="p-3 text-right font-bold text-white font-mono font-body">R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-3 pr-6">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${
                            tx.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          }`}>
                            {tx.status === 'paid' ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. CLIENTES (NEW) */}
      {activeTab === 'clientes' && (
        <Card className="bg-[#121212] border-[#1f1f1f] text-white shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Fechamento por Cliente</CardTitle>
            <CardDescription className="text-zinc-500 text-xs font-body">Histórico consolidado e emissão de cobranças unificadas para prestação de serviços</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1f1f1f] text-zinc-500 bg-[#0a0a0a]/60 font-semibold uppercase text-[9px] tracking-wider">
                  <th className="p-3 pl-6">Cliente</th>
                  <th className="p-3">E-mail</th>
                  <th className="p-3 text-center">Contratos/Itens</th>
                  <th className="p-3 text-right">Volume Faturado</th>
                  <th className="p-3 text-center">Status Fechamento</th>
                  <th className="p-3 text-center pr-6">Ação</th>
                </tr>
              </thead>
              <tbody>
                {clientsSummary.map(cli => (
                  <tr key={cli.id} className="border-b border-[#1f1f1f]/50 hover:bg-[#1a1a1a]/30">
                    <td className="p-3 pl-6 font-semibold text-white flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-[#e13a40] to-orange-500 flex items-center justify-center text-[10px] font-bold text-white">
                        {cli.name.slice(0,2).toUpperCase()}
                      </div>
                      <span>{cli.name}</span>
                    </td>
                    <td className="p-3 text-zinc-400 font-mono">{cli.email}</td>
                    <td className="p-3 text-center text-zinc-300 font-semibold">{cli.items} propostas</td>
                    <td className="p-3 text-right font-bold text-white font-mono">R$ {cli.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${
                        cli.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {cli.status === 'approved' ? 'Fechado' : 'Aberto'}
                      </span>
                    </td>
                    <td className="p-3 text-center pr-6">
                      <button 
                        onClick={() => alert(`Link de Cobrança unificado enviado para ${cli.name}`)}
                        className="px-2.5 py-1 rounded bg-[#e13a40]/10 hover:bg-[#e13a40]/25 text-[#e13a40] text-[10px] font-bold transition-all"
                      >
                        Enviar Link
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 5. FORNECEDORES (NEW) */}
      {activeTab === 'fornecedores' && (
        <Card className="bg-[#121212] border-[#1f1f1f] text-white shadow-card">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Controle de Fornecedores</CardTitle>
              <CardDescription className="text-zinc-500 text-xs font-body">Banco de dados de prestadores de serviços terceirizados, APIs e ferramentas</CardDescription>
            </div>
            <button
              onClick={() => setIsFornecedorModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white font-semibold text-xs transition-all font-body"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Novo Fornecedor</span>
            </button>
          </CardHeader>
          <CardContent className="px-0">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1f1f1f] text-zinc-500 bg-[#0a0a0a]/60 font-semibold uppercase text-[9px] tracking-wider">
                  <th className="p-3 pl-6">Nome / Contato</th>
                  <th className="p-3">Empresa</th>
                  <th className="p-3 font-mono">CPF / CNPJ</th>
                  <th className="p-3">E-mail</th>
                  <th className="p-3">Telefone</th>
                  <th className="p-3 pr-6">Ações</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(sup => (
                  <tr key={sup.id} className="border-b border-[#1f1f1f]/50 hover:bg-[#1a1a1a]/30">
                    <td className="p-3 pl-6 font-semibold text-white flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-[#1a1a1a] flex items-center justify-center">
                        <Building className="h-3.5 w-3.5 text-zinc-500" />
                      </div>
                      <span>{sup.name}</span>
                    </td>
                    <td className="p-3 text-zinc-400 font-body">{sup.company || '-'}</td>
                    <td className="p-3 text-zinc-400 font-mono">{sup.doc || '-'}</td>
                    <td className="p-3 text-zinc-400 font-mono">{sup.email}</td>
                    <td className="p-3 text-zinc-400 font-mono">{sup.phone}</td>
                    <td className="p-3 pr-6 text-zinc-500 font-body">
                      <button 
                        onClick={() => alert(`Notas do fornecedor: ${sup.obs || 'Nenhuma observação registrada.'}`)}
                        className="text-[#e13a40] hover:underline text-[11px]"
                      >
                        Visualizar Notas
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 6. PIX SETTINGS */}
      {activeTab === 'pix' && (
        <Card className="bg-[#121212] border-[#1f1f1f] text-white shadow-card max-w-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-1.5">
              <CreditCard className="h-5 w-5 text-[#e13a40]" />
              Dados para Recebimento de PIX
            </CardTitle>
            <CardDescription className="text-zinc-500 text-xs font-body font-body">
              Chaves cadastrais utilizadas para automação dinâmica de QR Codes estáticos no pós-orçamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 font-body">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Tipo de Chave</label>
                <select 
                  value={pixKeyType}
                  onChange={(e) => setPixKeyType(e.target.value)}
                  className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40]"
                >
                  <option value="CNPJ">CNPJ</option>
                  <option value="CPF">CPF</option>
                  <option value="Celular">Celular</option>
                  <option value="E-mail">E-mail</option>
                  <option value="Aleatória">Chave Aleatória</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Chave PIX *</label>
                <Input
                  value={pixKeyVal}
                  onChange={(e) => setPixKeyVal(e.target.value)}
                  className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 focus:border-[#e13a40]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Nome do Beneficiário *</label>
                <Input
                  value={pixBeneficiary}
                  onChange={(e) => setPixBeneficiary(e.target.value)}
                  className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 focus:border-[#e13a40]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Cidade do Beneficiário *</label>
                <Input
                  value={pixCity}
                  onChange={(e) => setPixCity(e.target.value)}
                  className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 focus:border-[#e13a40]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-bold uppercase">Quando exibir PIX pós-orçamento</label>
              <select 
                value={pixDisplayRules}
                onChange={(e) => setPixDisplayRules(e.target.value)}
                className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40]"
              >
                <option value="Apenas para pagamentos à vista e entradas">Apenas para pagamentos à vista e entradas</option>
                <option value="Sempre exibir">Sempre exibir nas propostas</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-500 font-bold uppercase">Mensagem de Instrução</label>
              <textarea
                value={pixCustomMsg}
                onChange={(e) => setPixCustomMsg(e.target.value)}
                maxLength="200"
                rows="2.5"
                className="w-full bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-2.5 text-xs text-white placeholder-zinc-600 focus:border-[#e13a40] outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-[#1a1a1a]/50 border border-[#1f1f1f]">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Ativar PIX no Orçamento</span>
                <span className="text-[10px] text-zinc-500">Insere o QR Code e instruções de pagamento nas propostas comerciais</span>
              </div>
              <input 
                type="checkbox"
                checked={pixActiveState}
                onChange={(e) => setPixActiveState(e.target.checked)}
                className="h-4 w-4 text-[#e13a40] rounded border-[#1f1f1f] focus:ring-[#e13a40]/30 outline-none cursor-pointer"
              />
            </div>

            <div className="pt-2">
              <button 
                onClick={() => alert("Configurações de PIX salvas!")}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-[#e13a40] hover:from-orange-500 hover:to-[#c52f34] text-white text-xs font-semibold shadow-sm transition-all"
              >
                Salvar Chave PIX
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7. RECORRENTES (NEW) */}
      {activeTab === 'recorrentes' && (
        <div className="space-y-6 font-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-[#121212] border-[#1f1f1f] text-white">
              <CardContent className="pt-4 space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Assinaturas Ativas</span>
                <div className="text-2xl font-bold text-white">12 clientes</div>
                <p className="text-[9px] text-zinc-500">Contratos mensais ativos</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border-[#1f1f1f] text-white">
              <CardContent className="pt-4 space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">MRR Recorrente</span>
                <div className="text-2xl font-bold text-emerald-400">R$ 8.450,00</div>
                <p className="text-[9px] text-zinc-500">Faturamento recorrente mensal</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border-[#1f1f1f] text-white">
              <CardContent className="pt-4 space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">LTV Estimado</span>
                <div className="text-2xl font-bold text-white">R$ 10.140,00</div>
                <p className="text-[9px] text-zinc-500">Valor médio de ciclo anual</p>
              </CardContent>
            </Card>

            <Card className="bg-[#121212] border-[#1f1f1f] text-white">
              <CardContent className="pt-4 space-y-1">
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Taxa Churn</span>
                <div className="text-2xl font-bold text-rose-400">0%</div>
                <p className="text-[9px] text-zinc-500">Nenhum cancelamento nos 90 dias</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-[#121212] border-[#1f1f1f] text-white">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Histórico de Cobranças Recorrentes</CardTitle>
              <CardDescription className="text-zinc-500 text-xs">Exibição de boletos e parcelas agendadas pelo sistema SaaS de contratos</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1f1f1f] text-zinc-500 bg-[#0a0a0a]/60 font-semibold uppercase text-[9px]">
                    <th className="p-3 pl-6">Cliente</th>
                    <th className="p-3">Frequência</th>
                    <th className="p-3 font-mono">Próxima Parcela</th>
                    <th className="p-3 text-right">Valor Mensal</th>
                    <th className="p-3 pr-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#1f1f1f]/50 hover:bg-[#1a1a1a]/30">
                    <td className="p-3 pl-6 font-semibold text-white">Marina Sousa</td>
                    <td className="p-3 text-zinc-400">Mensal (SaaS)</td>
                    <td className="p-3 font-mono text-zinc-500">2026-06-20</td>
                    <td className="p-3 text-right font-bold text-white font-mono">R$ 1.500,00</td>
                    <td className="p-3 pr-6 text-center">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px]">ATIVO</span>
                    </td>
                  </tr>
                  <tr className="border-b border-[#1f1f1f]/50 hover:bg-[#1a1a1a]/30">
                    <td className="p-3 pl-6 font-semibold text-white">Construtora Pernambuco</td>
                    <td className="p-3 text-zinc-400">Semestral</td>
                    <td className="p-3 font-mono text-zinc-500">2026-11-15</td>
                    <td className="p-3 text-right font-bold text-white font-mono">R$ 4.000,00</td>
                    <td className="p-3 pr-6 text-center">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px]">ATIVO</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 8. CAIXA (NEW) */}
      {activeTab === 'caixa' && (
        <div className="space-y-6 font-body">
          <Card className="bg-[#121212] border-[#1f1f1f] text-white max-w-xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Roteamento de Contas e Caixa</CardTitle>
              <CardDescription className="text-zinc-500 text-xs">Configure carteiras digitais ou caixas locais para categorização de liquidez</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#1f1f1f] bg-[#1a1a1a]/50">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">Regras de Roteamento de Saldo</span>
                  <span className="text-[10px] text-zinc-500">Permite direcionar faturamento PIX para carteiras específicas</span>
                </div>
                <input 
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-[#e13a40] rounded border-[#1f1f1f] focus:ring-[#e13a40]/30 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 font-bold uppercase">Contas / Caixas Ativos</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded border border-[#1f1f1f] bg-[#1a1a1a]/30">
                    <span className="text-xs font-semibold text-white">Caixa Principal (Digital)</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">R$ 9.500,00</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded border border-[#1f1f1f] bg-[#1a1a1a]/30">
                    <span className="text-xs font-semibold text-white">Reserva de Emergência</span>
                    <span className="text-xs font-bold text-zinc-400 font-mono">R$ 0,00</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 9. NOTA FISCAL (NEW) */}
      {activeTab === 'notafiscal' && (
        <Card className="bg-[#121212] border-[#1f1f1f] text-white max-w-xl shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Emissão de Notas Fiscais (NFS-e)</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Configurações para integração governamental padrão nacional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 py-6 text-center font-body">
            <div className="mx-auto h-12 w-12 rounded-full bg-[#e13a40]/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-[#e13a40]" />
            </div>
            <h3 className="text-sm font-semibold text-white">Padrão Nacional de NFS-e</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto leading-normal">
              A DGFlow está atualizando os endpoints fiscais em conformidade com o novo portal nacional do Simples Nacional. Temporariamente desativado para cadastros de novas empresas.
            </p>
          </CardContent>
        </Card>
      )}

      {/* 10. RELATÓRIOS DRE */}
      {activeTab === 'relatorios' && (
        <Card className="bg-[#121212] border-[#1f1f1f] text-white shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Demonstração do Resultado do Exercício (DRE)</CardTitle>
            <CardDescription className="text-zinc-500 text-xs font-body">Demonstrativo Competência simplificado contendo receitas liquidadas e despesas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 max-w-lg mx-auto bg-[#0a0a0a]/80 p-5 rounded-xl border border-[#1f1f1f] font-body">
              <div className="flex justify-between items-center text-xs font-semibold py-1.5 border-b border-[#1f1f1f]">
                <span>(+) RECEITA OPERACIONAL BRUTA</span>
                <span className="text-emerald-400 font-mono font-bold">R$ {(totalReceitas + pendingReceitas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-xs pl-4 text-zinc-400 py-1">
                <span>Vendas Liquidadas (Recebidas)</span>
                <span className="font-mono">R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-xs pl-4 text-zinc-400 py-1">
                <span>Contratos em Aberto (Pendentes)</span>
                <span className="font-mono">R$ {pendingReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold py-1.5 border-b border-[#1f1f1f] mt-4">
                <span>(-) DESPESAS OPERACIONAIS</span>
                <span className="text-rose-400 font-mono font-bold">R$ {(totalDespesas + pendingDespesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-xs pl-4 text-zinc-400 py-1">
                <span>Impostos e Licenças Pagas</span>
                <span className="font-mono">R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-xs pl-4 text-zinc-400 py-1">
                <span>Custos Operacionais em Aberto</span>
                <span className="font-mono">R$ {pendingDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-black py-2.5 border-t border-[#1f1f1f] mt-6 bg-[#1a1a1a]/50 px-3 rounded">
                <span>(=) MARGEM LÍQUIDA OPERACIONAL</span>
                <span className="text-[#e13a40] font-mono font-bold text-base">R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL 2.1: NOVA VENDA RÁPIDA */}
      {isVendaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-body animate-fade-in">
          <div className="w-full max-w-lg rounded-xl bg-[#121212] border border-[#1f1f1f] text-white p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsVendaModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-white rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-1.5">
              <ArrowUpRight className="h-5 w-5 text-emerald-500" />
              Nova Venda Rápida
            </h2>
            <p className="text-zinc-500 text-xs mb-4">Cadastre um faturamento ou recebimento de serviço realizado.</p>
            
            <form onSubmit={handleAddVenda} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Cliente *</label>
                  <Input
                    required
                    value={vendaClient}
                    onChange={(e) => setVendaClient(e.target.value)}
                    placeholder="Marina Sousa"
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Serviços e Produtos *</label>
                  <select
                    value={vendaProduct}
                    onChange={(e) => setVendaProduct(e.target.value)}
                    className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40]"
                  >
                    <option value="Identidade Visual">Identidade Visual (R$ 3.500,00)</option>
                    <option value="Landing Page">Landing Page (R$ 1.800,00)</option>
                    <option value="Social Media">Social Media Mensal (R$ 1.500,00)</option>
                    <option value="Consultoria">Consultoria Técnica (R$ 5.000,00)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Descrição do Lançamento *</label>
                <Input
                  required
                  value={vendaDesc}
                  onChange={(e) => setVendaDesc(e.target.value)}
                  placeholder="Ex: Identidade Visual Completa - Entrada"
                  className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Valor Bruto *</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={vendaAmount}
                    onChange={(e) => setVendaAmount(e.target.value)}
                    placeholder="1500.00"
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Moeda</label>
                  <select
                    value={vendaCurrency}
                    onChange={(e) => setVendaCurrency(e.target.value)}
                    className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40]"
                  >
                    <option value="BRL">BRL (R$)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Vencimento *</label>
                  <Input
                    required
                    type="date"
                    value={vendaDate}
                    onChange={(e) => setVendaDate(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Categoria Financeira</label>
                  <select
                    value={vendaCategory}
                    onChange={(e) => setVendaCategory(e.target.value)}
                    className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40]"
                  >
                    {earningCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Horizonal Payment Modes Selection */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1.5">Modo de Pagamento</label>
                <div className="grid grid-cols-3 gap-2">
                  {['À Vista', 'Parcelado', 'Recorrente'].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setVendaMode(mode)}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                        vendaMode === mode
                          ? 'border-[#e13a40] bg-[#e13a40]/10 text-white'
                          : 'border-[#1f1f1f] bg-[#1a1a1a] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status toggles */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1.5">Status Financeiro</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVendaStatus('received')}
                    className={`py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      vendaStatus === 'received'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-[#1f1f1f] bg-[#1a1a1a] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Pago (Liquidado)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVendaStatus('pending')}
                    className={`py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      vendaStatus === 'pending'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                        : 'border-[#1f1f1f] bg-[#1a1a1a] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>A Receber (Pendente)</span>
                  </button>
                </div>
              </div>

              {/* Automation options switch */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#1f1f1f] bg-[#1a1a1a]/50">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">Gerar Tarefa ou Projeto</span>
                  <span className="text-[10px] text-zinc-500">Cria automaticamente um cartão na pipeline de tarefas vinculada</span>
                </div>
                <input 
                  type="checkbox"
                  checked={vendaCreateTask}
                  onChange={(e) => setVendaCreateTask(e.target.checked)}
                  className="h-4 w-4 text-[#e13a40] rounded border-[#1f1f1f] focus:ring-[#e13a40]/30 outline-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Observações (opcional)</label>
                <textarea
                  value={vendaObs}
                  onChange={(e) => setVendaObs(e.target.value)}
                  placeholder="Ex: Anotações fiscais, adiantamento combinado via e-mail..."
                  rows="2"
                  className="w-full bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-2 text-xs text-white focus:border-[#e13a40] outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsVendaModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#1f1f1f] text-zinc-400 hover:text-white hover:bg-zinc-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm"
                >
                  Lançar Receita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2.2: LANÇAR DESPESA */}
      {isDespesaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-body animate-fade-in">
          <div className="w-full max-w-lg rounded-xl bg-[#121212] border border-[#1f1f1f] text-white p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsDespesaModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-white rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-1.5">
              <ArrowDownLeft className="h-5 w-5 text-rose-500" />
              Lançar Despesa Operacional
            </h2>
            <p className="text-zinc-500 text-xs mb-4">Registre um custo operacional, ferramentas ou despesas terceirizadas.</p>
            
            <form onSubmit={handleAddDespesa} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Fornecedor *</label>
                  <Input
                    required
                    value={despesaSupplier}
                    onChange={(e) => setDespesaSupplier(e.target.value)}
                    placeholder="Adobe, AWS Cloud..."
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Categoria Financeira</label>
                  <select
                    value={despesaCategory}
                    onChange={(e) => setDespesaCategory(e.target.value)}
                    className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40]"
                  >
                    {spendingCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Descrição do Lançamento *</label>
                <Input
                  required
                  value={despesaDesc}
                  onChange={(e) => setDespesaDesc(e.target.value)}
                  placeholder="Ex: Assinatura Mensal Figma Editor"
                  className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Valor Bruto *</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={despesaAmount}
                    onChange={(e) => setDespesaAmount(e.target.value)}
                    placeholder="150.00"
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Moeda</label>
                  <select
                    value={despesaCurrency}
                    onChange={(e) => setDespesaCurrency(e.target.value)}
                    className="w-full bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#1f1f1f] p-2.5 outline-none focus:border-[#e13a40]"
                  >
                    <option value="BRL">BRL (R$)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Data de Vencimento *</label>
                  <Input
                    required
                    type="date"
                    value={despesaDate}
                    onChange={(e) => setDespesaDate(e.target.value)}
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Frequência</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Avulsa', 'Recorrente'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setDespesaType(type)}
                        className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                          despesaType === type
                            ? 'border-[#e13a40] bg-[#e13a40]/10 text-white'
                            : 'border-[#1f1f1f] bg-[#1a1a1a] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase block mb-1.5">Situação do Lançamento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDespesaStatus('paid')}
                    className={`py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      despesaStatus === 'paid'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-[#1f1f1f] bg-[#1a1a1a] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Pago (Liquidado)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDespesaStatus('pending')}
                    className={`py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      despesaStatus === 'pending'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                        : 'border-[#1f1f1f] bg-[#1a1a1a] text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span>A Pagar (Pendente)</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Observações (opcional)</label>
                <textarea
                  value={despesaObs}
                  onChange={(e) => setDespesaObs(e.target.value)}
                  placeholder="Ex: Anexo do invoice governamental, cartão corporativo..."
                  rows="2.5"
                  className="w-full bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-2 text-xs text-white focus:border-[#e13a40] outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsDespesaModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#1f1f1f] text-zinc-400 hover:text-white hover:bg-zinc-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white font-semibold shadow-sm"
                >
                  Lançar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2.3: CATEGORIAS FINANCEIRAS */}
      {isCategoriasModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-body animate-fade-in">
          <div className="w-full max-w-md rounded-xl bg-[#121212] border border-[#1f1f1f] text-white p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsCategoriasModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-white rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-1.5">
              <Layers className="h-5 w-5 text-[#e13a40]" />
              Categorias Financeiras
            </h2>

            {/* Internal Modal Tabs */}
            <div className="flex border-b border-[#1f1f1f] mb-4">
              <button
                type="button"
                onClick={() => setCatActiveTab('receber')}
                className={`flex-1 pb-2 text-xs font-semibold border-b-2 text-center transition-all ${
                  catActiveTab === 'receber' ? 'border-[#e13a40] text-white' : 'border-transparent text-zinc-500'
                }`}
              >
                Receitas (Receber)
              </button>
              <button
                type="button"
                onClick={() => setCatActiveTab('pagar')}
                className={`flex-1 pb-2 text-xs font-semibold border-b-2 text-center transition-all ${
                  catActiveTab === 'pagar' ? 'border-[#e13a40] text-white' : 'border-transparent text-zinc-500'
                }`}
              >
                Despesas (Pagar)
              </button>
            </div>

            {/* Add Category Form Inline */}
            <form onSubmit={handleAddCategory} className="space-y-4 mb-6">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Nome da nova Categoria</label>
                <div className="flex gap-2">
                  <Input
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Ex: Licenças, Viagens..."
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 flex-1"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white font-semibold text-xs shadow-sm"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Premium Circular Color Palettes Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Identificador Visual</label>
                <div className="flex flex-wrap gap-2">
                  {catColorsPalette.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedCatColor(color)}
                      className={`h-5 w-5 rounded-full border transition-all ${
                        selectedCatColor === color ? 'border-white scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </form>

            {/* Existing lists */}
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 font-bold uppercase">Categorias Cadastradas</label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2 scrollbar-thin">
                {(catActiveTab === 'receber' ? earningCategories : spendingCategories).map((cat, i) => (
                  <div key={cat} className="flex items-center justify-between p-2 rounded bg-[#1a1a1a] border border-[#1f1f1f] text-xs">
                    <div className="flex items-center gap-2">
                      <span 
                        className="h-2.5 w-2.5 rounded-full" 
                        style={{ backgroundColor: catColorsPalette[i % catColorsPalette.length] }} 
                      />
                      <span className="font-medium text-white">{cat}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase">Padrão</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2.4: NOVO FORNECEDOR */}
      {isFornecedorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-body animate-fade-in">
          <div className="w-full max-w-md rounded-xl bg-[#121212] border border-[#1f1f1f] text-white p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsFornecedorModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-zinc-500 hover:text-white rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-1.5">
              <Building className="h-5 w-5 text-[#e13a40]" />
              Cadastrar Novo Fornecedor
            </h2>
            <p className="text-zinc-500 text-xs mb-4">Adicione um novo prestador, licença ou API ao banco de fornecedores.</p>
            
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Nome Completo / Contato *</label>
                <Input
                  required
                  value={fornecedorNome}
                  onChange={(e) => setFornecedorNome(e.target.value)}
                  placeholder="Adobe Cloud Services"
                  className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Empresa / Razão</label>
                  <Input
                    value={fornecedorEmpresa}
                    onChange={(e) => setFornecedorEmpresa(e.target.value)}
                    placeholder="Adobe Systems Inc."
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">CPF / CNPJ</label>
                  <Input
                    value={fornecedorCPFCNPJ}
                    onChange={(e) => setFornecedorCPFCNPJ(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">E-mail</label>
                  <Input
                    type="email"
                    value={fornecedorEmail}
                    onChange={(e) => setFornecedorEmail(e.target.value)}
                    placeholder="billing@adobe.com"
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Telefone</label>
                  <Input
                    value={fornecedorTelefone}
                    onChange={(e) => setFornecedorTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="bg-[#1a1a1a] border-[#1f1f1f] text-white text-xs py-2 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase">Observações Internas (opcional)</label>
                <textarea
                  value={fornecedorObs}
                  onChange={(e) => setFornecedorObs(e.target.value)}
                  placeholder="Ex: Contato exclusivo do gerente de contas, vencimento mensal fixo..."
                  rows="3"
                  className="w-full bg-[#1a1a1a] border border-[#1f1f1f] rounded-lg p-2 text-xs text-white focus:border-[#e13a40] outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsFornecedorModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#1f1f1f] text-zinc-400 hover:text-white hover:bg-zinc-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white font-semibold shadow-sm"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
