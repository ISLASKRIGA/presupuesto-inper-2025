import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Plus, ChevronDown, Sparkles, User, MessageCircle } from 'lucide-react';
import { BudgetDataset } from '../types/budget';
import { askGeminiBudgetBot } from '../services/geminiChatService';

interface ChatWidgetProps {
  dataset: BudgetDataset | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  keyIndex?: number;
  timestamp: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ dataset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeKeyNum, setActiveKeyNum] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      const response = await askGeminiBudgetBot(query, dataset, messages);
      setActiveKeyNum(response.keyIndex);

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: response.text,
        keyIndex: response.keyIndex,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'bot',
          text: 'Lo siento, ocurrió un error al consultar. Por favor intenta de nuevo.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`fixed z-50 font-sans transition-all duration-300 ${
      isOpen 
        ? 'inset-0 sm:inset-auto sm:bottom-6 sm:right-6' 
        : 'bottom-6 right-6'
    }`}>
      
      {/* Chat Modal Window (Full Screen on Mobile < sm, Floating Card on Desktop sm+) */}
      {isOpen && (
        <div className="w-full h-full sm:w-[420px] sm:h-[580px] max-h-[100vh] sm:max-h-[85vh] bg-gradient-to-b from-white via-white to-blue-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-none sm:rounded-[36px] border-0 sm:border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col sm:mb-4 animate-fadeIn">
          
          {/* Header */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
                title="Cerrar"
              >
                <X className="w-6 h-6 sm:w-5 sm:h-5" />
              </button>

              {/* INPER Emblem Logo */}
              <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg overflow-hidden shadow-xs border border-slate-200 flex-shrink-0">
                <img src="/inper_logo_rounded.png" alt="INPer Logo" className="w-full h-full object-cover" />
              </div>

              <div>
                <div className="flex items-center space-x-1">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-sm">Presupuesto IA</h3>
                  <span className="text-slate-400 text-xs font-semibold flex items-center">
                    INPer <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[10px] font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-700/50 font-bold">
              Key #{activeKeyNum}/7 🔄
            </div>
          </div>

          {/* Body Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 flex flex-col">
            
            {/* Initial Welcome Graphic State */}
            {messages.length === 0 && (
              <div className="my-auto flex flex-col items-center justify-center text-center px-4 space-y-5 animate-fadeIn">
                
                {/* INPER Emblem Graphic */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white p-2 shadow-xl border border-slate-200/80 flex items-center justify-center relative group">
                  <img src="/inper_logo_rounded.png" alt="INPer Emblem" className="w-full h-full object-contain rounded-2xl" />
                </div>

                {/* Platon Quote */}
                <div className="max-w-xs space-y-2">
                  <p className="text-xs italic text-slate-600 dark:text-slate-300 leading-relaxed font-serif">
                    "Trata bien a todos los que encuentres, pues cada persona libra una batalla que desconoces."
                  </p>
                  <p className="text-[11px] font-extrabold tracking-wider text-[#3C0C1F] dark:text-rose-400 uppercase">
                    — PLATÓN
                  </p>
                </div>

              </div>
            )}

            {/* Conversation Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#3C0C1F] to-[#5A1430] text-amber-300 flex items-center justify-center flex-shrink-0 shadow-xs border border-amber-400/30">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#3C0C1F] to-[#4A1027] text-white shadow-md rounded-br-none border border-amber-400/30'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 shadow-xs rounded-bl-none font-sans whitespace-pre-wrap'
                  }`}
                >
                  {msg.text}
                  <div className={`text-[9px] mt-1 text-right font-mono ${
                    msg.sender === 'user' ? 'text-amber-200/70' : 'text-slate-400'
                  }`}>
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white/80 dark:bg-slate-800/80 p-3 rounded-2xl w-fit border border-slate-200/80 dark:border-slate-700/80 shadow-xs animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span>Analizando presupuesto INPER 2025...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Bar */}
          <div className="p-3 sm:p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/80 sticky bottom-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 border border-slate-200 dark:border-slate-700 focus-within:border-amber-500 transition-all shadow-inner"
            >
              <button
                type="button"
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe tu consulta sobre el presupuesto..."
                className="flex-1 bg-transparent border-none text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3C0C1F] to-[#5E1532] text-amber-300 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:scale-105 transition-all border border-amber-400/30"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Floating Trigger Circular Bubble Button (Hidden when open on mobile) */}
      {(!isOpen) && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#3C0C1F] via-[#4A1027] to-[#5E1532] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group border-2 border-amber-400/50 relative"
          title="Abrir Presupuesto IA"
        >
          {/* INPER Logo inside Bubble */}
          <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400/60 shadow-xs">
            <img src="/inper_logo_rounded.png" alt="Presupuesto IA" className="w-full h-full object-cover" />
          </div>

          {/* Pulsing Notification Indicator */}
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-slate-900"></span>
          </span>
        </button>
      )}

    </div>
  );
};
