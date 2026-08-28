import { BudgetDataset } from '../types/budget';
import { formatCurrency, formatCompactCurrency } from './budgetService';

const envKeysRaw = (import.meta as any).env?.VITE_GEMINI_API_KEYS || '';
const API_KEYS: string[] = envKeysRaw
  ? envKeysRaw.split(',').map((k: string) => k.trim()).filter(Boolean)
  : [];

let currentKeyIndex = 0;

const getNextApiKey = (): { key: string; index: number } => {
  const key = API_KEYS[currentKeyIndex];
  const index = currentKeyIndex + 1;
  currentKeyIndex = (currentKeyIndex + 1) % Math.max(API_KEYS.length, 1);
  return { key, index };
};

const buildSystemPrompt = (dataset: BudgetDataset | null): string => {
  const totalMod = dataset?.ac01_summary?.total?.mod || 1317064845;
  const totalDev = dataset?.ac01_summary?.total?.dev || 1312927923;
  const cap1000 = dataset?.ac01_summary?.["1000"]?.dev || 906482936;
  const cap2000 = dataset?.ac01_summary?.["2000"]?.dev || 76595744;
  const cap3000 = dataset?.ac01_summary?.["3000"]?.dev || 329849243;
  const efic = ((totalDev / totalMod) * 100).toFixed(2);

  return `Eres el Dr. Rodrigo Vega Montiel, Consultor Senior en Finanzas Públicas del Sector Salud (22 años SHCP/SSA/INPER). Hablas como humano experto: directo, cálido, técnico pero accesible. Usa "En mi experiencia...", "Lo que veo aquí es...", "Te recomiendo...". Jamás menciones que eres IA.

Responde SIEMPRE en español. Párrafos breves o viñetas. Nunca bloques densos. Si es simple, 2-4 líneas.

DATOS INPER 2025 (AC01 Oficial):
- Techo SHCP Modificado: ${formatCurrency(totalMod)}
- Devengado Ejercido: ${formatCurrency(totalDev)} (${efic}% eficiencia)
- Remanente TESOFE: ${formatCurrency(totalMod - totalDev)}
- Cap 1000 Nómina: ${formatCompactCurrency(cap1000)} (68.8%)
- Cap 3000 Servicios: ${formatCompactCurrency(cap3000)} (25.0%)
- Cap 2000 Materiales/Med: ${formatCompactCurrency(cap2000)} (5.8%)
- Partida 35201 Electromedicina: $1,801,934 (100% cumplido)
- Operaciones auditadas: ${dataset?.records?.length || 3637} | Proveedores LAASSP: 493`;
};

const buildContents = (
  userQuery: string,
  history: { sender: string; text: string }[]
): { role: string; parts: { text: string }[] }[] => {
  const contents: { role: string; parts: { text: string }[] }[] = [];

  // Last 4 valid messages, alternating roles
  const valid = history.filter(h => !h.text.includes('ocurrió un error')).slice(-4);
  for (const msg of valid) {
    const role = msg.sender === 'user' ? 'user' : 'model';
    if (contents.length === 0 || contents[contents.length - 1].role !== role) {
      contents.push({ role, parts: [{ text: msg.text }] });
    }
  }

  // Must end with user turn
  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    contents.pop();
  }
  contents.push({ role: 'user', parts: [{ text: userQuery }] });
  return contents;
};

export interface ChatStreamCallbacks {
  onChunk: (delta: string) => void;
  onDone: (keyIndex: number) => void;
  onError: (err: Error) => void;
}

export const streamGeminiBudgetBot = async (
  userQuery: string,
  dataset: BudgetDataset | null,
  history: { sender: string; text: string }[],
  callbacks: ChatStreamCallbacks
): Promise<void> => {
  const systemPrompt = buildSystemPrompt(dataset);
  const contents = buildContents(userQuery, history);
  const payload = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    const { key, index } = getNextApiKey();
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse&key=${key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error?.message || res.statusText;
        // Rate limit / quota → try next key
        if (res.status === 429 || res.status === 503) {
          lastError = new Error(`Key #${index} quota: ${msg}`);
          continue;
        }
        throw new Error(`HTTP ${res.status}: ${msg}`);
      }

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (!json || json === '[DONE]') continue;
          try {
            const parsed = JSON.parse(json);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) callbacks.onChunk(text);
          } catch {
            // malformed chunk — skip
          }
        }
      }

      callbacks.onDone(index);
      return;
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini key #${attempt + 1} failed: ${err.message}`);
    }
  }

  callbacks.onError(lastError || new Error('All API keys failed'));
};
