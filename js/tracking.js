// ─── TRACKING · CAPTURA DE PARÁMETROS PARA META CAPI ──────────────────────────
// Se ejecuta en cada página. Guarda fbclid/UTMs en sessionStorage para que
// viajen con el usuario de index.html → typeform.html y estén disponibles
// en el momento del submit del lead.

function captureUrlParams() {
    const params = new URLSearchParams(window.location.search)

    const tracking = {
        fbclid:       params.get('fbclid') || null,
        utm_source:   params.get('utm_source') || null,
        utm_medium:   params.get('utm_medium') || null,
        utm_campaign: params.get('utm_campaign') || null,
        utm_content:  params.get('utm_content') || null,
        utm_term:     params.get('utm_term') || null,
        gclid:        params.get('gclid') || null,
        landing_url:  window.location.href,
        referrer:     document.referrer || null,
        captured_at:  Date.now(),
    }

    const existente        = sessionStorage.getItem('tracking_params')
    const hayTrackingNuevo = tracking.fbclid || tracking.utm_source || tracking.gclid

    // No pisamos una sesión de tracking válida si el usuario navega
    // internamente sin parámetros nuevos en la URL (p. ej. index.html → typeform.html)
    if (!existente || hayTrackingNuevo) {
        sessionStorage.setItem('tracking_params', JSON.stringify(tracking))
    }

    // Generamos manualmente el valor _fbc (formato requerido por Meta) a partir
    // del fbclid. No dependemos de que el Pixel haya podido escribir la cookie,
    // porque con Consent Mode revocado el Pixel no escribe cookies.
    if (tracking.fbclid) {
        sessionStorage.setItem('fbc_manual', `fb.1.${Date.now()}.${tracking.fbclid}`)
    }

    return tracking
}

function getTrackingParams() {
    const raw = sessionStorage.getItem('tracking_params')
    return raw ? JSON.parse(raw) : {}
}

function getCookie(nombre) {
    const match = document.cookie.match(new RegExp('(^| )' + nombre + '=([^;]+)'))
    return match ? match[2] : null
}

// Preferimos la cookie real del Pixel (si hubo consentimiento);
// si no existe, caemos al valor generado manualmente a partir del fbclid de la URL.
function getFbc() {
    return getCookie('_fbc') || sessionStorage.getItem('fbc_manual') || null
}

// _fbp solo lo escribe el propio Pixel de Meta cuando hay consentimiento — no se simula.
function getFbp() {
    return getCookie('_fbp') || null
}

document.addEventListener('DOMContentLoaded', captureUrlParams)