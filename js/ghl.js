// ─── GOHIGHLEVEL · WEBHOOK DE LEADS ────────────────────────────────────────────
// Pasa por una Edge Function de Supabase para no exponer la URL real del
// webhook de GHL en el navegador. La función busca el webhook del agente en la
// base de datos a partir de su agente_id. Si falla, no debe romper el flujo
// del usuario (mismo criterio que Meta CAPI).

const GHL_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/ghl`

async function enviarGHL(payload, agenteId) {
    if (!agenteId) return
    try {
        await fetch(GHL_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ agente_id: agenteId, payload })
        })
    } catch (e) {
        console.warn('GHL webhook error:', e)
    }
}
