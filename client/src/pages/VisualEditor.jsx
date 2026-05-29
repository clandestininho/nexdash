import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Eye, 
  Save, 
  Plus, 
  Type, 
  ImageIcon, 
  Users, 
  MousePointer, 
  Menu as MenuIcon, 
  Grid, 
  Info, 
  Palette, 
  Sparkles, 
  RotateCcw,
  Star
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { apiFetch } from '../lib/api';

export default function VisualEditor() {
  const navigate = useNavigate();
  const [canvasSize, setCanvasSize] = useState('desktop'); // desktop, tablet, mobile
  const [activeLeftTab, setActiveLeftTab] = useState('elements');
  const [activeRightTab, setActiveRightTab] = useState('content');

  // Page editable state
  const [badgeText, setBadgeText] = useState('Design Profissional');
  const [mainTitle, setMainTitle] = useState('Nexfy');
  const [subtitleText, setSubtitleText] = useState('subtítulo impactante');
  const [descText, setDescText] = useState('Transformando ideias em realidade');
  const [buttonText, setButtonText] = useState('Começar Agora');
  const [secondaryBtnText, setSecondaryBtnText] = useState('Ver Portfólio');
  
  // Custom logo image or hero placeholder
  const [heroImage, setHeroImage] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#e13a40');
  const [isSaving, setIsSaving] = useState(false);

  // Load existing settings from SQLite on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await apiFetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.page_badge_text) setBadgeText(data.page_badge_text);
          if (data.page_main_title) setMainTitle(data.page_main_title);
          if (data.page_subtitle_text) setSubtitleText(data.page_subtitle_text);
          if (data.page_desc_text) setDescText(data.page_desc_text);
          if (data.page_button_text) setButtonText(data.page_button_text);
          if (data.page_secondary_btn_text) setSecondaryBtnText(data.page_secondary_btn_text);
          if (data.page_hero_image) setHeroImage(data.page_hero_image);
          if (data.page_primary_color) setPrimaryColor(data.page_primary_color);
        }
      } catch (err) {
        console.error('[VisualEditor] Error loading saved settings:', err);
      }
    };
    loadSettings();
  }, []);

  const headlineSuggestions = [
    "Design que transforma marcas em experiências memoráveis",
    "Criando identidades visuais que conectam e convertem",
    "Do conceito à execução: design com propósito"
  ];

  const handleApplyHeadline = (text) => {
    setDescText(text);
  };

  const handleReset = () => {
    setBadgeText('Design Profissional');
    setMainTitle('Nexfy');
    setSubtitleText('subtítulo impactante');
    setDescText('Transformando ideias em realidade');
    setButtonText('Começar Agora');
    setSecondaryBtnText('Ver Portfólio');
    setHeroImage('');
    setPrimaryColor('#e13a40');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const pageData = {
        badgeText,
        mainTitle,
        subtitleText,
        descText,
        buttonText,
        secondaryBtnText,
        heroImage,
        primaryColor
      };
      localStorage.setItem('dgflow_custom_page_data', JSON.stringify(pageData));

      // Save to server SQLite settings table dynamically
      const res = await apiFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_badge_text: badgeText,
          page_main_title: mainTitle,
          page_subtitle_text: subtitleText,
          page_desc_text: descText,
          page_button_text: buttonText,
          page_secondary_btn_text: secondaryBtnText,
          page_hero_image: heroImage,
          page_primary_color: primaryColor
        })
      });

      if (res.ok) {
        alert("Alterações visuais salvas com sucesso no banco de dados e aplicadas ao seu modelo de site público!");
        navigate('/pages');
      } else {
        alert("Falha técnica ao salvar no banco de dados. Alterações mantidas localmente.");
      }
    } catch (err) {
      console.error('[VisualEditor] Error saving customized page settings:', err);
      alert("Erro de conexão ao salvar configurações no banco de dados. Alterações mantidas apenas no navegador.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b] text-zinc-100 flex flex-col overflow-hidden font-body h-screen">
      
      {/* HEADER BAR (exact copy of screenshot 5) */}
      <header className="h-14 border-b border-[#1f1f23] bg-[#0c0c0e]/85 backdrop-blur-md px-4 flex items-center justify-between shrink-0">
        
        {/* Left header group */}
        <div className="flex items-center gap-4">
          <span className="text-[#e13a40] font-black tracking-tighter text-lg select-none">dgflow</span>
          <button 
            onClick={() => navigate('/pages')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-white text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar</span>
          </button>
          <span className="h-4 w-px bg-zinc-800" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Editor Visual</span>
        </div>

        {/* Center Canvas sizing selectors */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-850">
          <button 
            onClick={() => setCanvasSize('desktop')}
            className={`p-1.5 rounded-md transition-colors ${canvasSize === 'desktop' ? 'bg-[#e13a40] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Desktop Mode"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setCanvasSize('tablet')}
            className={`p-1.5 rounded-md transition-colors ${canvasSize === 'tablet' ? 'bg-[#e13a40] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Tablet Mode"
          >
            <Tablet className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setCanvasSize('mobile')}
            className={`p-1.5 rounded-md transition-colors ${canvasSize === 'mobile' ? 'bg-[#e13a40] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Mobile Mode"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>

        {/* Right header buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => alert("A prévia em tempo real está ativa no centro da tela!")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 text-zinc-300 hover:text-white text-xs font-semibold"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Preview</span>
          </button>
          
          <button 
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#e13a40] hover:bg-[#c52f34] text-white font-semibold text-xs transition-colors shadow-md shadow-[#e13a40]/10"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Salvar</span>
          </button>
        </div>

      </header>

      {/* THREE-COLUMN WORKSPACE BODY */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLUMN: Sidebar Elements (width: 64) */}
        <aside className="w-64 border-r border-[#1f1f23] bg-[#0c0c0e] flex flex-col shrink-0 overflow-y-auto">
          
          {/* Elements vs Config tabs */}
          <div className="flex border-b border-[#1f1f23]">
            <button 
              onClick={() => setActiveLeftTab('elements')}
              className={`flex-1 py-3 text-xs font-semibold border-b-2 text-center transition-colors ${
                activeLeftTab === 'elements' ? 'border-[#e13a40] text-white' : 'border-transparent text-zinc-400 hover:text-zinc-250'
              }`}
            >
              Elementos
            </button>
            <button 
              onClick={() => setActiveLeftTab('config')}
              className={`flex-1 py-3 text-xs font-semibold border-b-2 text-center transition-colors ${
                activeLeftTab === 'config' ? 'border-[#e13a40] text-white' : 'border-transparent text-zinc-400 hover:text-zinc-250'
              }`}
            >
              Config
            </button>
          </div>

          <div className="p-4 space-y-6">
            
            {/* Add block button */}
            <button className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-orange-600/90 to-red-500/90 hover:from-orange-500 hover:to-red-400 text-white font-extrabold text-xs shadow-md shadow-[#e13a40]/5 flex items-center justify-center gap-1.5 uppercase tracking-wider transition-all">
              <Plus className="h-3.5 w-3.5" />
              <span>Adicionar Bloco</span>
            </button>

            {/* Elements Categories */}
            {activeLeftTab === 'elements' ? (
              <div className="space-y-5">
                
                {/* HERO Elements */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">HERO</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Type, label: 'Headline' },
                      { icon: ImageIcon, label: 'Imagem' },
                      { icon: Users, label: 'Prova Social' },
                      { icon: MousePointer, label: 'Botão CTA' }
                    ].map((el, i) => (
                      <div 
                        key={i}
                        className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/60 hover:border-zinc-800 hover:bg-zinc-950 cursor-grab flex flex-col items-center justify-center gap-1 text-center group transition-all"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", el.label)}
                      >
                        <el.icon className="h-4 w-4 text-zinc-500 group-hover:text-[#e13a40] transition-colors" />
                        <span className="text-[9px] text-zinc-400 font-semibold leading-none mt-1">{el.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* OUTRAS SEÇÕES Elements */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">OUTRAS SEÇÕES</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: MenuIcon, label: 'Menu' },
                      { icon: ImageIcon, label: 'Logo' },
                      { icon: Info, label: 'Sobre' },
                      { icon: MousePointer, label: 'CTA Final' }
                    ].map((el, i) => (
                      <div 
                        key={i}
                        className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/60 hover:border-zinc-800 hover:bg-zinc-950 cursor-grab flex flex-col items-center justify-center gap-1 text-center group transition-all"
                        draggable
                      >
                        <el.icon className="h-4 w-4 text-zinc-500 group-hover:text-[#e13a40] transition-colors" />
                        <span className="text-[9px] text-zinc-400 font-semibold leading-none mt-1">{el.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ESTILO Section */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">ESTILO</span>
                  <div className="space-y-1.5">
                    {[
                      { icon: Palette, label: 'Cores' },
                      { icon: Sparkles, label: 'Templates de Estilo' },
                      { icon: Grid, label: 'Modelo de Layout' },
                      { icon: ImageIcon, label: 'Carregar Template' }
                    ].map((el, i) => (
                      <div 
                        key={i}
                        className="p-2 rounded-lg border border-zinc-900 bg-zinc-950/40 hover:border-zinc-850 hover:bg-zinc-950/80 cursor-pointer flex items-center gap-2 group transition-all"
                      >
                        <el.icon className="h-3.5 w-3.5 text-zinc-500 group-hover:text-[#e13a40]" />
                        <span className="text-[10px] text-zinc-300 font-semibold">{el.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-4 text-xs text-zinc-400 leading-relaxed">
                <p>Configurações globais da página.</p>
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Meta Title</label>
                    <input 
                      type="text" 
                      defaultValue="Nexfy | Estúdio de Design Premium" 
                      className="w-full bg-[#101014] text-xs border border-zinc-850 p-2 rounded text-white outline-none focus:border-[#e13a40]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Meta Description</label>
                    <textarea 
                      defaultValue="Design corporativo de alto valor para elevar o preço de marcas." 
                      rows="3" 
                      className="w-full bg-[#101014] text-xs border border-zinc-850 p-2 rounded text-white outline-none focus:border-[#e13a40]"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

        </aside>

        {/* CENTER COLUMN: Canvas View (variable size based on canvasSize) */}
        <main className="flex-1 bg-[#09090b] overflow-auto flex items-center justify-center p-8 relative">
          
          {/* Ambient Background Lights */}
          <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-[#e13a40]/10 blur-[90px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-orange-600/5 blur-[90px] pointer-events-none" />

          {/* Sizable Canvas Container */}
          <div 
            className="bg-[#09090b] border border-zinc-850 rounded-2xl overflow-hidden shadow-2xl relative transition-all duration-300 flex flex-col min-h-[500px]"
            style={{
              width: canvasSize === 'desktop' ? '100%' : canvasSize === 'tablet' ? '768px' : '375px',
              maxWidth: '100%',
              aspectRatio: canvasSize === 'desktop' ? '16/9' : 'auto'
            }}
          >
            
            {/* Visual page content simulated */}
            <div className="flex-1 p-6 md:p-10 flex flex-col justify-between h-full text-zinc-100 overflow-y-auto">
              
              {/* Fake Nav bar */}
              <div className="flex items-center justify-between border-b border-zinc-900/60 pb-4 mb-6">
                <span className="font-black text-sm tracking-wider text-white">
                  {mainTitle.toUpperCase()}
                </span>
                
                <button 
                  className="px-3.5 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all"
                  style={{
                    backgroundColor: `${primaryColor}1a`,
                    borderColor: `${primaryColor}40`,
                    color: primaryColor
                  }}
                >
                  Contato
                </button>
              </div>

              {/* Main Landing Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center flex-1 py-4">
                
                {/* Left side text fields (dynamically bound to state) */}
                <div className="md:col-span-3 space-y-4 text-left">
                  <div className="space-y-2.5">
                    
                    {/* Badge text */}
                    <span 
                      className="text-[9px] font-extrabold tracking-widest uppercase block px-2 py-0.5 rounded border w-fit"
                      style={{
                        color: primaryColor,
                        backgroundColor: `${primaryColor}1a`,
                        borderColor: `${primaryColor}26`
                      }}
                    >
                      {badgeText}
                    </span>

                    {/* Headline */}
                    <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight max-w-sm">
                      {mainTitle} <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">{subtitleText}</span>
                    </h1>

                    {/* Subtitle / Description */}
                    <p className="text-zinc-400 text-[11px] leading-relaxed max-w-sm">
                      {descText}
                    </p>

                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <button 
                      className="px-4 py-2 rounded-lg text-white text-[10px] font-extrabold shadow-md uppercase tracking-wider transition-all"
                      style={{
                        backgroundColor: primaryColor,
                        boxShadow: `0 4px 12px ${primaryColor}26`
                      }}
                    >
                      {buttonText} →
                    </button>
                    <button className="px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-300 text-[10px] font-extrabold uppercase tracking-wider transition-all">
                      {secondaryBtnText}
                    </button>
                  </div>

                  {/* Rating Bubbles */}
                  <div className="flex items-center gap-2 pt-4">
                    <div className="flex items-center -space-x-1.5 shrink-0">
                      {[1,2,3,4].map(idx => (
                        <div key={idx} className="h-5 w-5 rounded-full border border-zinc-950 bg-zinc-850 text-[7px] flex items-center justify-center font-bold text-zinc-400 shrink-0 overflow-hidden">
                          {idx === 4 ? '+100' : <img src={`https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=60&auto=format&fit=crop`} alt="" className="object-cover w-full h-full" />}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} className="h-2.5 w-2.5 text-amber-400 fill-amber-400 shrink-0" />)}
                      </div>
                      <span className="text-[8px] text-zinc-500 font-bold tracking-wide uppercase mt-0.5">+100 Clientes Corporativos</span>
                    </div>
                  </div>

                </div>

                {/* Right side image upload dotted container (Screenshot 5) */}
                <div className="md:col-span-2 aspect-[4/3] rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-950/40 hover:bg-zinc-950/80 hover:border-zinc-700 transition-all flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none space-y-2">
                  
                  {heroImage ? (
                    <div className="w-full h-full rounded-lg overflow-hidden relative group">
                      <img src={heroImage} alt="Uploaded hero" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-[10px] font-bold text-white bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">Trocar Imagem</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="h-8 w-8 rounded-full bg-zinc-900/60 border border-zinc-850 flex items-center justify-center text-zinc-400 text-lg font-bold">
                        +
                      </span>
                      <div>
                        <span className="text-[10px] text-zinc-300 font-bold block">Adicionar Imagem</span>
                        <span className="text-[8px] text-zinc-600 block">Carregar imagem corporativa</span>
                      </div>
                    </>
                  )}

                </div>

              </div>

              {/* Bottom banner block */}
              <div className="relative mt-8 pt-6 border-t border-zinc-900/60 text-center">
                <span className="text-[9px] text-zinc-500 font-semibold block">Soluções completas para transformar sua marca corporativa</span>
              </div>

            </div>

          </div>

        </main>

        {/* RIGHT COLUMN: Sidebar Properties Editor (width: 80) */}
        <aside className="w-80 border-l border-[#1f1f23] bg-[#0c0c0e] flex flex-col shrink-0 overflow-y-auto">
          
          {/* Properties Tab Header */}
          <div className="p-4 border-b border-[#1f1f23] flex items-center justify-between bg-zinc-950/20">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">Editar Seção</h3>
            <button 
              onClick={handleReset}
              className="text-zinc-500 hover:text-white p-1 hover:bg-zinc-900 rounded"
              title="Restaurar Padrão"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex border-b border-[#1f1f23] text-xs">
            <button 
              onClick={() => setActiveRightTab('content')}
              className={`flex-1 py-2.5 text-center font-bold border-b-2 transition-colors ${
                activeRightTab === 'content' ? 'border-[#e13a40] text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Conteúdo
            </button>
            <button 
              onClick={() => setActiveRightTab('style')}
              className={`flex-1 py-2.5 text-center font-bold border-b-2 transition-colors ${
                activeRightTab === 'style' ? 'border-[#e13a40] text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Estilo
            </button>
          </div>

          {/* Form Properties (Screenshot 5) */}
          <div className="p-4 space-y-4">
            
            {activeRightTab === 'content' ? (
              <div className="space-y-4">
                
                {/* Badge text input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block">Badge (Texto pequeno acima)</label>
                  <Input 
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="bg-[#101014] border-zinc-850 text-white text-xs"
                  />
                </div>

                {/* Main Title input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block">Título Principal</label>
                  <Input 
                    value={mainTitle}
                    onChange={(e) => setMainTitle(e.target.value)}
                    className="bg-[#101014] border-zinc-850 text-white text-xs"
                  />
                </div>

                {/* Subtitle Text input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block">Subtítulo Colorido</label>
                  <Input 
                    value={subtitleText}
                    onChange={(e) => setSubtitleText(e.target.value)}
                    className="bg-[#101014] border-zinc-850 text-white text-xs"
                  />
                </div>

                {/* Description Textarea */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block">Subtítulo / Descrição</label>
                  <textarea 
                    rows="3"
                    value={descText}
                    onChange={(e) => setDescText(e.target.value)}
                    className="w-full bg-[#101014] text-xs border border-zinc-850 rounded-lg p-2.5 outline-none text-white focus:border-[#e13a40]"
                  />
                </div>

                {/* Call-to-actions buttons name */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block">Botão Primário</label>
                    <Input 
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      className="bg-[#101014] border-zinc-850 text-white text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block">Botão Secundário</label>
                    <Input 
                      value={secondaryBtnText}
                      onChange={(e) => setSecondaryBtnText(e.target.value)}
                      className="bg-[#101014] border-zinc-850 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Image URL helper */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block">URL da Imagem Hero</label>
                  <Input 
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="bg-[#101014] border-zinc-850 text-white text-xs font-mono"
                  />
                </div>

                {/* Headline AI Suggestions (Screenshot 5) */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">💡 Sugestões de Headlines</span>
                  
                  <div className="space-y-2">
                    {headlineSuggestions.map((hl, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleApplyHeadline(hl)}
                        className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/30 hover:border-[#e13a40]/40 hover:bg-zinc-950/70 cursor-pointer text-[10px] text-zinc-400 hover:text-white leading-normal transition-all"
                      >
                        {hl}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Visual styling toggles */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block">Paleta de Destaque</label>
                  <div className="flex gap-2">
                    {['#e13a40', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'].map(c => (
                      <button
                        key={c}
                        onClick={() => setPrimaryColor(c)}
                        className={`h-6 w-6 rounded-full border cursor-pointer transition-all hover:scale-110 ${primaryColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0c0c0e] border-white' : 'border-zinc-850'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block">Arredondamento das Bordas</label>
                  <select className="w-full bg-[#101014] text-xs border border-zinc-850 p-2 rounded text-zinc-300 outline-none">
                    <option>2xl Premium (Padrão)</option>
                    <option>Arredondado Total</option>
                    <option>Quadrado Reto</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block">Tipografia do Site</label>
                  <select className="w-full bg-[#101014] text-xs border border-zinc-850 p-2 rounded text-zinc-300 outline-none">
                    <option>Outfit / DM Sans (Premium)</option>
                    <option>Inter / System Sans</option>
                    <option>Playfair Display / Serif</option>
                  </select>
                </div>

              </div>
            )}

          </div>

        </aside>

      </div>

    </div>
  );
}
