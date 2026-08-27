import React from 'react';
import { 
  BarChart3, 
  Table, 
  Users, 
  FolderTree, 
  RefreshCw, 
  CheckCircle2, 
  Building2, 
  Sun, 
  Moon,
  Settings
} from 'lucide-react';
import { BudgetMetadata } from '../types/budget';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  metadata: BudgetMetadata;
  isSyncing: boolean;
  onRefresh: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  metadata,
  isSyncing,
  onRefresh,
  darkMode,
  setDarkMode
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'cuenta_publica', label: 'Cuenta Pública AC01', icon: Building2 },
    { id: 'table', label: 'Operaciones', icon: Table },
    { id: 'proveedores', label: 'Proveedores', icon: Users },
    { id: 'partidas', label: 'Partidas', icon: FolderTree },
    { id: 'sync', label: 'Drive & Sync', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Institution Name */}
          <div className="flex items-center space-x-3.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">INPER</span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-200/60 dark:border-blue-500/30">
                  Presupuesto 2024-2025
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Instituto Nacional de Perinatología</p>
            </div>
          </div>

          {/* iOS Segmented Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/90 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md shadow-slate-200/60 dark:shadow-none'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sync Status & Dark/Light Mode Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Sheet Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-slate-800/80 border border-emerald-200/80 dark:border-slate-700 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-800 dark:text-slate-300 font-semibold text-[11px]">Drive Conectado</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              title="Sincronizar datos"
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isSyncing ? 'Sincronizando...' : 'Actualizar'}</span>
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
              title="Cambiar tema (iPhone Blanco / Oscuro)"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-200/80 dark:border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-2 rounded-xl text-xs flex flex-col items-center space-y-1 ${
                  isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
