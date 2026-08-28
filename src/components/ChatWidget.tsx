import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Plus, ChevronDown, Sparkles, User, RotateCcw } from 'lucide-react';
import { BudgetDataset } from '../types/budget';
import { streamGeminiBudgetBot } from '../services/geminiChatService';

interface ChatWidgetProps {
  dataset: BudgetDataset | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  keyIndex?: number;
  timestamp: string;
  streaming?: boolean;
}

interface InspirationalPhrase {
  text: string;
  author: string;
}

const INSPIRATIONAL_PHRASES: InspirationalPhrase[] = [
  { text: "Todo lo puedo en Cristo que me fortalece.", author: "Filipenses 4:13" },
  { text: "El Señor es mi pastor; nada me faltará.", author: "Salmo 23:1" },
  { text: "El corazón alegre es buena medicina.", author: "Proverbios 17:22" },
  { text: "Confía en el Señor con todo tu corazón, y no te apoyes en tu propia prudencia.", author: "Proverbios 3:5" },
  { text: "Porque yo sé los pensamientos que tengo acerca de vosotros, pensamientos de paz y no de mal.", author: "Jeremías 29:11" },
  { text: "Clama a mí, y yo te responderé, y te enseñaré cosas grandes y ocultas.", author: "Jeremías 33:3" },
  { text: "Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes.", author: "Josué 1:9" },
  { text: "Los que esperan en el Señor renovarán sus fuerzas; levantarán alas como las águilas.", author: "Isaías 40:31" },
  { text: "La respuesta blanda quita la ira; mas la palabra áspera hace subir el furor.", author: "Proverbios 15:1" },
  { text: "Fuerza y honor son su vestidura; y se ríe de lo por venir.", author: "Proverbios 31:25" },
  { text: "La fe es la certeza de lo que se espera, la convicción de lo que no se ve.", author: "Hebreos 11:1" },
  { text: "Pidan, y se les dará; busquen, y encontrarán; llamen, y se les abrirá.", author: "Mateo 7:7" },
  { text: "No nos cansemos, pues, de hacer bien; porque a su tiempo segaremos.", author: "Gálatas 6:9" },
  { text: "Bienaventurados los pacificadores, porque ellos serán llamados hijos de Dios.", author: "Mateo 5:9" },
  { text: "El Señor te guardará de todo mal; él guardará tu alma.", author: "Salmo 121:7" },
  { text: "Pon en manos del Señor todas tus obras, y tus proyectos se cumplirán.", author: "Proverbios 16:3" },
  { text: "Sobre toda cosa guardada, guarda tu corazón; porque de él mana la vida.", author: "Proverbios 4:23" },
  { text: "Trata bien a todos los que encuentres, pues cada persona libra una batalla que desconoces.", author: "Platón" },
  { text: "La paciencia es la compañera de la sabiduría.", author: "San Agustín" },
  { text: "El bien que no se comparte se pierde.", author: "Francisco de Asís" },
];

export const ChatWidget: React.FC<ChatWidgetProps> = ({ dataset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeKeyNum, setActiveKeyNum] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [powerPhrase, setPowerPhrase] = useState<InspirationalPhrase>(INSPIRATIONAL_PHRASES[0]);

  useEffect(() => {
    if (isOpen) {
      const randomIndex = Math.floor(Math.random() * INSPIRATIONAL_PHRASES.length);
      setPowerPhrase(INSPIRATIONAL_PHRASES[randomIndex]);
    }
  }, [isOpen]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const resetChat = () => {
    setMessages([]);
    setIsTyping(false);
    setInputMessage('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (isOpen && messages.length > 0) scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isTyping) return;

    const ts = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: ts()
    };

    const botId = 'bot-' + Date.now();
    const botMsg: ChatMessage = {
      id: botId,
      sender: 'bot',
      text: '',
      timestamp: ts(),
      streaming: true
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    await streamGeminiBudgetBot(query, dataset, [...messages, userMsg], {
      onChunk: (delta) => {
        setMessages(prev =>
          prev.map(m => m.id === botId ? { ...m, text: m.text + delta } : m)
        );
      },
      onDone: (keyIndex) => {
        setActiveKeyNum(keyIndex);
        setMessages(prev =>
          prev.map(m => m.id === botId ? { ...m, streaming: false } : m)
        );
        setIsTyping(false);
      },
      onError: () => {
        setMessages(prev =>
          prev.map(m => m.id === botId
            ? { ...m, text: 'Lo siento, ocurrió un error al consultar. Por favor intenta de nuevo.', streaming: false }
            : m)
        );
        setIsTyping(false);
      }
    });
  };

  return (
    <div className={`fixed z-50 font-sans transition-all duration-300 ${
      isOpen
        ? 'inset-0 sm:inset-auto sm:bottom-6 sm:right-6'
        : 'bottom-6 right-6'
    }`}>

      {isOpen && (
        <div className="w-full h-full sm:w-[420px] sm:h-[580px] max-h-[100vh] sm:max-h-[85vh] bg-gradient-to-b from-white via-white to-blue-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 rounded-none sm:rounded-[36px] border-0 sm:border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col sm:mb-4 animate-fadeIn">

          {/* Header */}
          <div className="p-4 sm:p-5 flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
              >
                <X className="w-6 h-6 sm:w-5 sm:h-5" />
              </button>
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
            <button
              onClick={resetChat}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              title="Reiniciar conversación"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 flex flex-col">

            {messages.length === 0 && (
              <div className="my-auto flex flex-col items-center justify-center text-center px-4 space-y-5 animate-fadeIn">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white p-2 shadow-xl border border-slate-200/80 flex items-center justify-center">
                  <img src="/inper_logo_rounded.png" alt="INPer Emblem" className="w-full h-full object-contain rounded-2xl" />
                </div>
                <div className="max-w-xs space-y-2">
                  <p className="text-xs italic text-slate-600 dark:text-slate-300 leading-relaxed font-serif">
                    "{powerPhrase.text}"
                  </p>
                  <p className="text-[11px] font-extrabold tracking-wider text-[#3C0C1F] dark:text-rose-400 uppercase">— {powerPhrase.author}</p>
                </div>
              </div>
            )}

            {messages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end my-1">
                    <div className="bg-[#f0f4f9] dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-2.5 rounded-2xl max-w-[85%] text-xs font-medium shadow-xs">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="my-2 w-full">
                  <div className="w-full text-slate-800 dark:text-slate-100 text-xs sm:text-sm leading-relaxed font-sans whitespace-pre-wrap">
                    {msg.text.replace(/\*/g, '') || (
                      msg.streaming ? (
                        <div className="flex items-center gap-1.5 py-2">
                          <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : ''
                    )}
                    {msg.streaming && msg.text && (
                      <span className="inline-block w-1.5 h-3 bg-[#3C0C1F] dark:bg-rose-400 animate-pulse rounded-sm align-middle ml-1" />
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/80 sticky bottom-0">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 border border-slate-200 dark:border-slate-700 focus-within:border-amber-500 transition-all shadow-inner"
            >
              <button type="button" className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
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

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#3C0C1F] via-[#4A1027] to-[#5E1532] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-amber-400/50 relative"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-amber-400/60 shadow-xs">
            <img src="/inper_logo_rounded.png" alt="Presupuesto IA" className="w-full h-full object-cover" />
          </div>
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-slate-900"></span>
          </span>
        </button>
      )}

    </div>
  );
};
