// ─── CONFIGURACIÓN SUPABASE ───────────────────────────────────────────────────

const SUPABASE_URL = 'https://aoauaprfomyzssovoebf.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_s53gKxpAyPcUihgX6RX7gA_VlNL79kj'

// ─── GUARDAR LEAD CON REINTENTOS ──────────────────────────────────────────────

async function enviarASupabase(lead) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(lead)
    })
    return response.ok
}

async function guardarLead(lead) {
    // Intentar hasta 3 veces con delay creciente
    for (let intento = 1; intento <= 3; intento++) {
        try {
            const ok = await enviarASupabase(lead)
            if (ok) {
                // Limpiar lead pendiente si había uno guardado
                localStorage.removeItem('lead_pendiente')
                // Enviar a Meta Conversions API
                await enviarMetaConversion(lead)
                return true
            }
        } catch (error) {
            console.warn(`Intento ${intento}/3 fallido:`, error)
        }

        // Esperar antes del siguiente intento (1s, 2s)
        if (intento < 3) {
            await new Promise(resolve => setTimeout(resolve, intento * 1000))
        }
    }

    // Los 3 intentos fallaron — guardar en localStorage para reintento futuro
    try {
        localStorage.setItem('lead_pendiente', JSON.stringify({
            lead,
            timestamp: new Date().toISOString()
        }))
        console.warn('Lead guardado en localStorage para reintento posterior')
    } catch (e) {
        console.error('No se pudo guardar en localStorage:', e)
    }

    return false
}

// ─── REENVIAR LEAD PENDIENTE ──────────────────────────────────────────────────

async function reenviarLeadPendiente() {
    try {
        const pendiente = localStorage.getItem('lead_pendiente')
        if (!pendiente) return

        const { lead, timestamp } = JSON.parse(pendiente)

        // Solo reintentar si tiene menos de 24 horas
        const horas = (Date.now() - new Date(timestamp)) / 3600000
        if (horas > 24) {
            localStorage.removeItem('lead_pendiente')
            return
        }

        const ok = await enviarASupabase(lead)
        if (ok) {
            localStorage.removeItem('lead_pendiente')
            console.log('Lead pendiente reenviado correctamente')
        }
    } catch (e) {
        console.error('Error al reenviar lead pendiente:', e)
    }
}

// ─── META CONVERSIONS API ─────────────────────────────────────────────────────

async function enviarMetaConversion(lead) {
    try {
        const SUPABASE_FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1/clever-task`

        await fetch(SUPABASE_FUNCTIONS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
                email:                lead.email,
                telefono:             lead.telefono,
                nombre:               lead.nombre,
                precio_estimado_bajo: lead.precio_estimado_bajo,
                precio_estimado_alto: lead.precio_estimado_alto,
                // ─── NUEVO: para deduplicación y mejor Event Match Quality ───
                event_id:             lead.event_id,
                event_source_url:     lead.event_source_url,
                fbc:                  lead.fbc,
                fbp:                  lead.fbp,
                user_agent:           navigator.userAgent
            })
        })
    } catch (e) {
        console.warn('Meta Conversions API error:', e)
    }
}

// ─── MARCAR TELÉFONO VERIFICADO (tras OTP correcto) ───────────────────────────

async function marcarTelefonoVerificado(eventId) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/leads?event_id=eq.${eventId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ telefono_verificado: true })
        })
        return response.ok
    } catch (e) {
        console.warn('Error marcando teléfono verificado:', e)
        return false
    }
}