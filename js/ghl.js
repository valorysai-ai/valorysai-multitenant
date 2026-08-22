// ─── GOHIGHLEVEL · WEBHOOK DE LEADS ────────────────────────────────────────────
// Pasa por una Edge Function de Supabase para no exponer la URL real del
// webhook de GHL en el navegador. Si falla, no debe romper el flujo del usuario
// (mismo criterio que Meta CAPI).

const GHL_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/rapid-handler`

async function enviarGHL(payload) {
    try {
        await fetch(GHL_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(payload)
        })
    } catch (e) {
        console.warn('GHL webhook error:', e)
    }
}