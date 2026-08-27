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
      const response = await askGeminiBudgetBot(query, dataset, []);
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[420px] h-[580px] bg-gradient-to-b from-white via-white to-blue-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-[36px] border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col mb-4 animate-fadeIn">
          
          {/* Header */}
          <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              {/* INPER Emblem Logo */}
              <div className="w-7 h-7 rounded-lg overflow-hidden shadow-xs border border-slate-200 flex-shrink-0">
                <img src="/inper_logo_rounded.png" alt="INPer Logo" className="w-full h-full object-cover" />
              </div>

              <div>
                <div className="flex items-center space-x-1">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Presupuesto IA</h3>
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
          <div className="flex-1 p-5 overflow-y-auto space-y-4 flex flex-col">
            
            {/* Initial Welcome Graphic State */}
            {messages.length === 0 && (
              <div className="my-auto flex flex-col items-center justify-center text-center px-4 space-y-5 animate-fadeIn">
                
                {/* INPER Emblem Graphic */}
                <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-xl border border-slate-200/80 flex items-center justify-center relative group">
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
                  <div className="w-7 h-7 rounded-full bg-[#3C0C1F] text-amber-300 flex items-center justify-center flex-shrink-0 mt-1 shadow-xs border border-amber-400/30">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[84%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#3C0C1F] text-white font-medium rounded-tr-xs shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 shadow-xs rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <div className="flex items-center justify-between text-[9px] opacity-70 mt-1.5 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                    <span>{msg.timestamp}</span>
                    {msg.keyIndex && (
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">Key #{msg.keyIndex}</span>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 text-slate-500 text-xs p-2">
                <Sparkles className="w-4 h-4 text-[#3C0C1F] animate-spin" />
                <span className="font-medium animate-pulse">Presupuesto IA está respondiendo...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Pill Input Footer */}
          <div className="p-4 bg-white/90 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2 bg-slate-100/90 dark:bg-slate-800/90 rounded-full px-4 py-2.5 border border-purple-200/60 dark:border-purple-900/40 focus-within:border-purple-500 transition-all shadow-xs"
            >
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder="Pregúntale a Presupuesto IA..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isTyping}
                className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />

              <button
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                className="w-8 h-8 rounded-full bg-[#3C0C1F] hover:bg-[#5A1430] text-amber-300 flex items-center justify-center disabled:opacity-40 transition-all shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Floating Circular Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#3C0C1F] via-[#4A1027] to-[#5E1532] text-white shadow-2xl border-2 border-amber-400/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 relative group overflow-hidden"
        title="Abrir Presupuesto IA"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {isOpen ? (
          <X className="w-6 h-6 text-amber-300 transition-transform group-hover:rotate-90" />
        ) : (
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 shadow-xs flex-shrink-0">
              <img src="/inper_logo_rounded.png" alt="INPer" className="w-full h-full object-cover" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
            </span>
          </div>
        )}
      </button>

    </div>
  );
};
