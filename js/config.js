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

    // Nombre del agente en el copyright del footer
    const copyrightNombreEl = document.getElementById('footer-copyright-nombre')
    if (copyrightNombreEl) copyrightNombreEl.textContent = config.nombre

    // Logos de typeform.html (header, overlay de carga, overlay OTP)
    const headerLogoTf = document.getElementById('tf-header-logo')
    if (headerLogoTf) headerLogoTf.textContent = config.nombre

    const loadingLogoTf = document.getElementById('tf-loading-logo')
    if (loadingLogoTf) loadingLogoTf.textContent = config.nombre

    const otpLogoTf = document.getElementById('tf-otp-logo')
    if (otpLogoTf) otpLogoTf.textContent = config.nombre

    // Nombre del agente en la tarjeta CTA de resultado.html
    const ctaNombreEl = document.getElementById('cta-nombre')
    if (ctaNombreEl) ctaNombreEl.textContent = config.nombre

    // ─── Datos legales (legal.html) ─────────────────────────────────────────
    // Si a un agente le falta algún dato legal se muestra "[pendiente de
    // completar]" en vez de dejar "Cargando..." para siempre en un aviso legal.
    const PENDIENTE = '[pendiente de completar]'

    const datosLegales = {
        nombre:    config.legal_nombre,
        nif:       config.legal_nif,
        domicilio: config.legal_domicilio,
        red:       config.legal_vinculo_red
    }

    document.querySelectorAll('[data-legal]').forEach(el => {
        const valor = datosLegales[el.dataset.legal]
        if (el.dataset.legal === 'red') {
            if (valor) el.textContent = valor   // la red es opcional: si no hay, se oculta el bloque
            return
        }
        el.textContent = valor || PENDIENTE
    })

    document.querySelectorAll('[data-legal-email]').forEach(el => {
        if (config.legal_email) {
            el.textContent = config.legal_email
            el.href = `mailto:${config.legal_email}`
        } else {
            el.textContent = PENDIENTE
        }
    })

    // Bloques que solo aplican si el agente pertenece a una red (ej. SAFTI)
    if (config.legal_vinculo_red) {
        document.querySelectorAll('[data-legal-red]').forEach(el => {
            el.hidden = false
        })
    }
})