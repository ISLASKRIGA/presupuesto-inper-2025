import { BudgetDataset } from '../types/budget';
import { formatCurrency, formatCompactCurrency } from './budgetService';

// Array of Gemini API keys loaded safely from environment variables (.env ignored by git)
const envKeysRaw = import.meta.env.VITE_GEMINI_API_KEYS || '';
const API_KEYS = envKeysRaw
  ? envKeysRaw.split(',').map(k => k.trim()).filter(Boolean)
  : [
      'DEMO_KEY_1',
      'DEMO_KEY_2',
      'DEMO_KEY_3',
      'DEMO_KEY_4',
      'DEMO_KEY_5',
      'DEMO_KEY_6',
      'DEMO_KEY_7'
    ];

let currentKeyIndex = 0;

export const getNextApiKey = (): { key: string; index: number; total: number } => {
  const key = API_KEYS[currentKeyIndex];
  const info = { key, index: currentKeyIndex + 1, total: API_KEYS.length };
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return info;
};

export const generateBudgetPromptContext = (dataset: BudgetDataset | null): string => {
  if (!dataset) return "No hay datos presupuestales cargados actualmente.";

  const totalMod = dataset.ac01_summary?.total?.mod || 1317064845;
  const totalDev = dataset.ac01_summary?.total?.dev || 1312927923;
  const cap1000 = dataset.ac01_summary?.["1000"]?.dev || 906482936;
  const cap2000 = dataset.ac01_summary?.["2000"]?.dev || 76595744;
  const cap3000 = dataset.ac01_summary?.["3000"]?.dev || 329849243;
  const ptda35201 = 1801934;

  return `
DATOS OFICIALES DEL PRESUPUESTO INPER 2025:
- Instituto: Instituto Nacional de Perinatología Isidro Espinosa de los Reyes (INPER)
- Techo Presupuestal Modificado (SHCP): ${formatCurrency(totalMod)} (${formatCompactCurrency(totalMod)})
- Ejercido/Devengado Total: ${formatCurrency(totalDev)} (${formatCompactCurrency(totalDev)}) - 99.7% ejecutado
- Saldo Disponible: ${formatCurrency(totalMod - totalDev)}
- Capítulo 1000 (Servicios Personales / Nómina Médicos y Enfermeras): ${formatCurrency(cap1000)} (${formatCompactCurrency(cap1000)})
- Capítulo 3000 (Servicios Generales / Mantenimiento, Luz, Lavandería): ${formatCurrency(cap3000)} (${formatCompactCurrency(cap3000)})
- Capítulo 2000 (Materiales y Suministros / Medicinas e Insumos): ${formatCurrency(cap2000)} (${formatCompactCurrency(cap2000)})
- Partida 35201 (Mantenimiento Equipo Médico): ${formatCurrency(ptda35201)} (${formatCompactCurrency(ptda35201)})
- Total de operaciones auditadas: ${dataset.records?.length || 3637} registros
- Total de proveedores registrados: 493 empresas
`;
};

export interface ChatResponse {
  text: string;
  keyIndex: number;
}

export const askGeminiBudgetBot = async (
  userQuery: string,
  dataset: BudgetDataset | null,
  history: { sender: string; text: string }[] = []
): Promise<ChatResponse> => {
  const context = generateBudgetPromptContext(dataset);

  const systemPrompt = `
Eres "Presupuesto IA", el asistente virtual oficial de inteligencia artificial del Instituto Nacional de Perinatología (INPER) - Dirección de Administración y Finanzas.
Tu objetivo es responder de forma precisa, clara, educada, institucional y transparente las preguntas del usuario sobre el presupuesto 2025 del hospital.

INSTRUCCIONES CLAVE:
1. Responde basándote estrictamente en los datos del contexto proporcionado.
2. Sé amable, conciso y directo.
3. Si te preguntan cifras, proporciona el valor exacto en MXN y su equivalente aproximado en millones de pesos para facilitar la comprensión.
4. Si te preguntan sobre el saldo restante o disponibilidad, menciona que quedan $4.14 MDP ($4,136,922 MXN).
5. Mantén un tono ejecutivo institucional pero muy fácil de entender.

CONTEXTO PRESUPUESTAL VIGENTE:
${context}
`;

  let lastError: Error | null = null;
  const attempts = API_KEYS.length;

  for (let i = 0; i < attempts; i++) {
    const { key, index } = getNextApiKey();
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

      const contents = [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nPregunta del usuario: ${userQuery}` }]
        }
      ];

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("No response text returned from Gemini API");
      }

      return { text, keyIndex: index };
    } catch (err: any) {
      console.warn(`Key #${index} failed (${err.message}), trying next key in pool...`);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini API keys failed.");
};
