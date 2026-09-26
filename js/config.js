// ─── CONFIG · MULTI-TENANT ──────────────────────────────────────────────────
// Resuelve qué agente corresponde al dominio actual, consultando la vista
// pública (sin secretos) agentes_publico. El resto del sitio espera a que
// window.CONFIG esté listo antes de pintar nada específico del agente.

const CONFIG_SUPABASE_URL = 'https://pwbrsgqlqwykqfolvrbb.supabase.co'
const CONFIG_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3YnJzZ3FscXd5a3Fmb2x2cmJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODY3NDcsImV4cCI6MjEwMTg2Mjc0N30.MWAqpMdQ_6Ozxs6I88861PsK6LhBjMdV0WT6S69aX1E'

window.CONFIG = null
window.CONFIG_READY = (async () => {
    try {
        const dominio = window.location.hostname
        const res = await fetch(
            `${CONFIG_SUPABASE_URL}/rest/v1/agentes_publico?dominio=eq.${dominio}`,
            {
                headers: {
                    'apikey': CONFIG_SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${CONFIG_SUPABASE_ANON_KEY}`
                }
            }
        )
        const data = await res.json()

        if (!data || data.length === 0) {
            console.error('[CONFIG] No se encontró ningún agente para el dominio:', dominio)
            window.CONFIG = null
            return null
        }

        window.CONFIG = data[0]
        return window.CONFIG
    } catch (e) {
        console.error('[CONFIG] Error cargando la configuración del agente:', e)
        window.CONFIG = null
        return null
    }
})()

// ─── APLICAR CONFIG AL DOM ──────────────────────────────────────────────────
// Espera a que window.CONFIG esté listo y rellena los elementos que dependen
// del agente actual. Se ejecuta en todas las páginas que carguen config.js.

window.CONFIG_READY.then((config) => {
    if (!config) return // sin agente encontrado — dejamos el texto por defecto

    document.querySelectorAll('[id^="header-logo"]').forEach(el => {
        el.textContent = config.nombre
    })
    document.querySelectorAll('[id^="footer-titulo"]').forEach(el => {
        el.textContent = config.nombre
    })

    if (config.color_primario) {
        document.documentElement.style.setProperty('--primary', config.color_primario)
    }

    // Título de la pestaña del navegador
    document.title = `¿Cuánto vale tu vivienda? — Calculadora gratuita · ${config.nombre}`

    // Email de contacto del footer
    const emailEl = document.getElementById('footer-email')
    if (emailEl && config.email) {
        emailEl.textContent = config.email
        emailEl.href = `mailto:${config.email}`
    }
})