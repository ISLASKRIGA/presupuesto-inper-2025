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
DATOS DE GOBERNANZA PRESUPUESTAL Y CUENTA PÚBLICA INPER 2025:
- Instituto: Instituto Nacional de Perinatología Isidro Espinosa de los Reyes (INPER)
- Dirección responsable: Dirección de Administración y Finanzas
- Techo Presupuestal Modificado (Autorizado por SHCP): ${formatCurrency(totalMod)} (${formatCompactCurrency(totalMod)})
- Presupuesto Devengado Ejercido: ${formatCurrency(totalDev)} (${formatCompactCurrency(totalDev)}) - 99.69% de eficiencia presupuestaria.
- Remanente por Ejercer en Tesorería (TESOFE): ${formatCurrency(totalMod - totalDev)} (0.31% del presupuesto total).
- Capítulo 1000 (Servicios Personales / Nómina de Médicos, Enfermeras y Especialistas): ${formatCurrency(cap1000)} (${formatCompactCurrency(cap1000)}) - Representa el 68.8% del gasto total del hospital.
- Capítulo 3000 (Servicios Generales, Subcontratación, Luz, Mantenimiento de Infraestructura): ${formatCurrency(cap3000)} (${formatCompactCurrency(cap3000)}) - Representa el 25.0% del gasto.
- Capítulo 2000 (Materiales y Suministros / Medicamentos, Material Quirúrgico y Reactivos): ${formatCurrency(cap2000)} (${formatCompactCurrency(cap2000)}) - Representa el 5.8% del gasto.
- Auditoría Especial Partida 35201 (Mantenimiento Equipo Médico de Alta Especialidad): ${formatCurrency(ptda35201)} (${formatCompactCurrency(ptda35201)}) - 100% de cumplimiento operativo en programas E23, M1 y E22.
- Total de dispersiones contables auditadas: ${dataset.records?.length || 3637} operaciones únicas.
- Padrón de Proveedores Adjudicados (LAASSP): 493 empresas.
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
ROL Y PERSONALIDAD:
Eres un Experto Senior en Finanzas Públicas y Gobernanza Hacendaria asignado a la Dirección de Administración y Finanzas del Instituto Nacional de Perinatología (INPER). 
Hablas y respondes EXACTAMENTE COMO UN HUMANO EXPERTO: de forma cercana, conversacional, fluida, natural y directa, como un colega financiero senior explicándole los números a la Directora o a un usuario interesado.

REGLAS DE COMUNICACIÓN HUMANA Y EXPERTA:
1. NUNCA suenes como un robot o un contestador automático ("Hola, soy un bot de IA..."). Saluda o responde de forma fluida, cálida y natural ("¡Hola! Mira, respondiendo a tu pregunta sobre los recursos del INPER...", "Con mucho gusto te platico sobre el gasto...").
2. Habla con dominio técnico de las Finanzas Públicas en México (SHCP, PEF, Ley de Presupuesto, TESOFE, Capítulos 1000/2000/3000, Ley de Adquisiciones LAASSP), pero explicando el "por qué" y el impacto práctico con claridad y amabilidad.
3. Al dar cifras del INPER 2025:
   - Menciona que la mayor cantidad del dinero del hospital se va en el Capítulo 1000 ($906.48 MDP / $906,482,936 MXN), que es la nómina del personal médico, doctores y enfermeras (68.8% del total).
   - Menciona que el segundo rubro más grande es el Capítulo 3000 ($329.85 MDP), usado para servicios generales, luz, agua y mantenimiento.
   - Y el Capítulo 2000 ($76.60 MDP) para medicinas e insumos médicos curativos.
4. Si preguntan sobre saldo o dinero disponible, aclara que quedan $4.14 MDP libres ($4,136,922 MXN) y que el hospital lleva una eficiencia de ejecución ejemplar del 99.69% sin subejercicio.
5. Mantén respuestas concisas, dinámicas, fáciles de leer y estructuradas con viñetas o párrafos breves.

DATOS OFICIALES Y CONTEXTO DEL INPER 2025:
${context}
`;

  // Build clean history array excluding any previous error messages
  const validHistory = history.filter(h => !h.text.includes('Lo siento, ocurrió un error'));
  
  // Format conversation turn contents
  const conversationContents: { role: string; parts: { text: string }[] }[] = [];
  
  validHistory.slice(-4).forEach(msg => {
    const role = msg.sender === 'user' ? 'user' : 'model';
    if (conversationContents.length === 0 || conversationContents[conversationContents.length - 1].role !== role) {
      conversationContents.push({
        role,
        parts: [{ text: msg.text }]
      });
    }
  });

  // Ensure strict role alternating before adding current prompt
  if (conversationContents.length > 0 && conversationContents[conversationContents.length - 1].role === 'user') {
    conversationContents.pop();
  }

  conversationContents.push({
    role: 'user',
    parts: [{ text: userQuery }]
  });

  let lastError: Error | null = null;
  const attempts = API_KEYS.length;

  for (let i = 0; i < attempts; i++) {
    const { key, index } = getNextApiKey();
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`;

      const payload = {
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: conversationContents
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
