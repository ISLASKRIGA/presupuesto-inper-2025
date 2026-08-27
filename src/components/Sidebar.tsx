import React, { useState } from 'react';
import { 
  BarChart3, 
  Table, 
  Users, 
  FolderTree, 
  Sun, 
  Moon,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { BudgetMetadata } from '../types/budget';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  metadata: BudgetMetadata;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  metadata,
  darkMode,
  setDarkMode
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'cuenta_publica', label: 'Cuenta Pública AC01', icon: FileText },
    { id: 'table', label: 'Operaciones', icon: Table },
    { id: 'proveedores', label: 'Proveedores', icon: Users },
    { id: 'partidas', label: 'Partidas', icon: FolderTree },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Floating Pill Top Header Bar for Mobile Screens (Institutional Burgundy #3C0C1F) */}
      <div className="lg:hidden sticky top-2 z-40 mx-3 my-2 bg-[#3C0C1F]/95 text-white px-4 py-2.5 rounded-full shadow-2xl border border-[#5A1430] backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-white/20 shadow-xs">
            <img src="/inper_logo_rounded.png" alt="INPER Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-xs font-black tracking-tight text-white flex items-center gap-1">
              PresupuestoINPER
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            </h2>
            <p className="text-[9px] text-amber-200/80 font-medium">Salud · Gobierno de México</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shadow-sm border border-white/15"
            title="Abrir Menú"
          >
            {mobileOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>

      {/* Backdrop Overlay for Mobile Drawer */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-screen w-80 lg:w-72 p-3 lg:p-6 flex-shrink-0 transition-all duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Floating Pill Sidebar Container in Institutional Burgundy (#3C0C1F) */}
        <div className="w-full h-full bg-gradient-to-b from-[#3C0C1F] via-[#2E0918] to-[#1E0510] text-white rounded-[32px] p-5 shadow-2xl flex flex-col justify-between border border-[#5E1532] relative overflow-hidden">
          
          {/* Top Content Area */}
          <div className="space-y-6 overflow-y-auto">
            
            {/* Official INPER Logo Card Badge */}
            <div className="bg-white rounded-2xl p-2.5 flex items-center justify-center shadow-lg border border-amber-100">
              <div className="flex items-center space-x-2.5 text-slate-900 font-extrabold text-xs">
                <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 shadow-xs border border-slate-200">
                  <img src="/inper_logo_rounded.png" alt="INPER Logo" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-900">INSTITUTO NACIONAL DE PERINATOLOGÍA</span>
                  <span className="block text-[9px] text-[#3C0C1F] font-extrabold">Isidro Espinosa de los Reyes</span>
                </div>
              </div>
            </div>

            {/* App Title & Subtitle */}
            <div className="px-2">
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                PresupuestoINPER
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              </h2>
              <p className="text-[11px] text-amber-200/80 font-medium">DIRECCIÓN DE ADMINISTRACIÓN Y FINANZAS</p>
            </div>

            {/* Main Menu Section */}
            <div className="space-y-1 pt-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300/60 px-3 block mb-2">
                MENÚ PRINCIPAL
              </span>

              {mainTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/20 text-amber-300 shadow-lg shadow-amber-500/10 border border-amber-400/40'
                        : 'text-rose-100/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-rose-200/70'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Bottom Actions Area */}
          <div className="pt-4 border-t border-[#5E1532] space-y-3">
            
            {/* Theme & Status Footer */}
            <div className="flex items-center justify-between px-2 pt-1">
              <div className="flex items-center space-x-2 text-[10px] text-amber-300 font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
                <span>Sistema Oficial</span>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 border border-white/15 transition-all"
                title="Cambiar Tema"
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-amber-200" />}
              </button>
            </div>

          </div>

        </div>

      </aside>
    </>
  );
};
