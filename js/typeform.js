// ─── ESTADO ───────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 14
let currentStep = 1
let map = null
let mapMarker = null

const datos = {
    es_propietario: null,
    quiere_vender: null,
    plazo_venta: null,
    valor_percibido: null,
    cp: null,
    direccion: null,
    tipo_inmueble: null,
    superficie: null,
    habitaciones: null,
    banos: null,
    planta: null,
    ascensor: null,
    estado: null,
    tieneTerraza: null,
    m2Terraza: null,
    tieneParking: null,
    tieneTrastero: null,
}

let precios = null

const STEP_NAMES = {
    1: 'Es Propietario',
    2: 'Quiere Vender',
    3: 'Plazo Venta',
    4: 'Valor Percibido',
    5: 'Direccion',
    6: 'Tipo Inmueble',
    7: 'Superficie',
    8: 'Habitaciones',
    9: 'Banos',
    10: 'Planta Ascensor',
    11: 'Estado',
    12: 'Terraza',
    13: 'Extras',
    14: 'Datos Contacto'
}

// ─── CARGAR DATOS ─────────────────────────────────────────────────────────────

async function cargarPrecios() {
    const response = await fetch('data/precios.json')
    precios = await response.json()
}

// ─── CALCULAR TIPO DE LEAD ────────────────────────────────────────────────────

function calcularTipoLead() {
    if (datos.es_propietario && datos.quiere_vender) {
        if (datos.plazo_venta === '3 meses') return 'caliente'
        if (datos.plazo_venta === '6 meses') return 'tibio'
        return 'frio'
    }
    if (datos.es_propietario && !datos.quiere_vender) return 'frio'
    return 'curioso'
}

// ─── PROGRESO ─────────────────────────────────────────────────────────────────

function actualizarProgreso(step) {
    const pct = Math.round((step / TOTAL_STEPS) * 100)
    document.getElementById('progress-fill').style.width = `${pct}%`
    document.getElementById('progress-text').textContent = `${step} de ${TOTAL_STEPS}`
}

// ─── ADAPTAR STEP 3 ───────────────────────────────────────────────────────────

function adaptarStep3() {
    const titulo    = document.getElementById('step3-titulo')
    const subtitulo = document.getElementById('step3-subtitulo')
    const opciones  = document.getElementById('step3-opciones')

    if (datos.quiere_vender) {
        titulo.textContent    = '¿En qué plazo te gustaría venderla?'
        subtitulo.textContent = 'Esto nos ayuda a preparar la mejor estrategia para ti'
        opciones.innerHTML = `
            <button class="tf-option" data-value="3 meses" onclick="selectOption(this, 'plazo_venta', 3)">
                <span class="tf-option__icon">⚡</span>
                <span class="tf-option__label">Menos de 3 meses</span>
                <span class="tf-option__desc">Lo antes posible</span>
            </button>
            <button class="tf-option" data-value="6 meses" onclick="selectOption(this, 'plazo_venta', 3)">
                <span class="tf-option__icon">📅</span>
                <span class="tf-option__label">Entre 3 y 6 meses</span>
            </button>
            <button class="tf-option" data-value="1 año" onclick="selectOption(this, 'plazo_venta', 3)">
                <span class="tf-option__icon">🗓️</span>
                <span class="tf-option__label">Entre 6 meses y 1 año</span>
            </button>
            <button class="tf-option" data-value="más de 1 año" onclick="selectOption(this, 'plazo_venta', 3)">
                <span class="tf-option__icon">🔮</span>
                <span class="tf-option__label">Más de 1 año</span>
                <span class="tf-option__desc">Todavía explorando opciones</span>
            </button>
        `
    } else {
        titulo.textContent    = '¿En qué horizonte temporal lo contemplarías?'
        subtitulo.textContent = 'Aunque no sea ahora, nos ayuda a entender tus planes'
        opciones.innerHTML = `
            <button class="tf-option" data-value="menos de 1 año" onclick="selectOption(this, 'plazo_venta', 3)">
                <span class="tf-option__icon">📅</span>
                <span class="tf-option__label">En menos de 1 año</span>
            </button>
            <button class="tf-option" data-value="1 a 3 años" onclick="selectOption(this, 'plazo_venta', 3)">
                <span class="tf-option__icon">🗓️</span>
                <span class="tf-option__label">Entre 1 y 3 años</span>
            </button>
            <button class="tf-option" data-value="más de 3 años" onclick="selectOption(this, 'plazo_venta', 3)">
                <span class="tf-option__icon">🔮</span>
                <span class="tf-option__label">Más de 3 años</span>
            </button>
            <button class="tf-option" data-value="indefinido" onclick="selectOption(this, 'plazo_venta', 3)">
                <span class="tf-option__icon">🤷</span>
                <span class="tf-option__label">No lo tengo claro</span>
            </button>
        `
    }

    datos.plazo_venta = null
}

// ─── NAVEGACIÓN ───────────────────────────────────────────────────────────────

function showStep(from, to, direction) {
    const fromEl = document.getElementById(`step-${from}`)
    const toEl   = document.getElementById(`step-${to}`)

    toEl.style.transition = 'none'
    toEl.style.transform  = direction === 'back' ? 'translateX(-60px)' : 'translateX(60px)'
    toEl.style.opacity    = '0'
    toEl.style.position   = 'absolute'
    toEl.classList.remove('active', 'exit-left')

    toEl.offsetHeight

    fromEl.style.transition = ''
    fromEl.style.transform  = direction === 'back' ? 'translateX(60px)' : 'translateX(-60px)'
    fromEl.style.opacity    = '0'

    toEl.style.transition = ''
    toEl.style.transform  = 'translateX(0)'
    toEl.style.opacity    = '1'
    toEl.style.position   = 'relative'

    setTimeout(() => {
        fromEl.classList.remove('active')
        fromEl.style.cssText = ''
        fromEl.style.position = 'absolute'

        toEl.classList.add('active')
        toEl.style.cssText = ''

        actualizarProgreso(to)
        currentStep = to

        const input = toEl.querySelector('.tf-input')
        if (input) setTimeout(() => input.focus(), 100)

        restaurarSeleccion(to)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 600)
}

function nextStep(from) {
    if (!validarStep(from)) return

    if (from === 2) adaptarStep3()

    if (typeof fbq !== 'undefined') {
        fbq('trackCustom', 'StepCompleted', {
            step_number: from,
            step_name: STEP_NAMES[from] || `Step ${from}`
        })
    }

    showStep(from, from + 1, 'forward')
}

function prevStep(from) {
    if (from <= 1) return
    showStep(from, from - 1, 'back')
}

// ─── VALIDACIONES ─────────────────────────────────────────────────────────────

function validarStep(step) {
    switch(step) {
        case 1:
            if (datos.es_propietario === null) {
                mostrarError('Selecciona una opción para continuar')
                return false
            }
            return true
        case 2:
            if (datos.quiere_vender === null) {
                mostrarError('Selecciona una opción para continuar')
                return false
            }
            return true
        case 3:
            if (!datos.plazo_venta) {
                mostrarError('Selecciona el plazo previsto')
                return false
            }
            return true
        case 4:
            const vp = document.getElementById('tf-valor-percibido').value
            datos.valor_percibido = vp ? parseInt(vp) : null
            return true
        case 5:
            if (!datos.cp) {
                mostrarError('Introduce una dirección o código postal válido')
                return false
            }
            return true
        case 6:
            if (!datos.tipo_inmueble) {
                mostrarError('Selecciona el tipo de inmueble')
                return false
            }
            return true
        case 7:
            const sup = parseFloat(document.getElementById('tf-superficie').value)
            if (isNaN(sup) || sup < 25) {
                shakeInput('tf-superficie', 'La superficie mínima es 25 m²')
                return false
            }
            if (sup > 500) {
                shakeInput('tf-superficie', 'Para superficies mayores de 500 m², contacta directamente')
                return false
            }
            datos.superficie = sup
            return true
        case 8:
            if (!datos.habitaciones) {
                mostrarError('Selecciona el número de habitaciones')
                return false
            }
            return true
        case 9:
            if (!datos.banos) {
                mostrarError('Selecciona el número de baños')
                return false
            }
            return true
        case 10:
            if (!datos.planta) {
                mostrarError('Selecciona la planta y si tiene ascensor')
                return false
            }
            return true
        case 11:
            if (!datos.estado) {
                mostrarError('Selecciona el estado de conservación')
                return false
            }
            return true
        case 12:
            if (datos.tieneTerraza === null) {
                mostrarError('Selecciona la opción de terraza')
                return false
            }
            return true
        case 13:
            if (datos.tieneParking === null) {
                mostrarError('Selecciona los extras')
                return false
            }
            return true
        default:
            return true
    }
}

// ─── ERRORES Y FEEDBACK ───────────────────────────────────────────────────────

function shakeInput(id, mensaje) {
    const el = document.getElementById(id)
    el.style.borderBottomColor = '#ef4444'
    el.classList.add('shake')
    setTimeout(() => {
        el.classList.remove('shake')
        el.style.borderBottomColor = ''
    }, 600)
    mostrarError(mensaje)
}

function mostrarError(mensaje) {
    const prev = document.querySelector('.tf-error')
    if (prev) prev.remove()

    const err = document.createElement('p')
    err.className = 'tf-error'
    err.textContent = '⚠️ ' + mensaje
    err.style.cssText = 'color:#ef4444;font-size:14px;margin-top:8px;animation:fadeIn 0.2s ease'

    const activeStep = document.querySelector('.tf-step.active .tf-nav')
    if (activeStep) activeStep.before(err)

    setTimeout(() => err.remove(), 3000)
}

// ─── SELECCIÓN DE OPCIONES ────────────────────────────────────────────────────

function selectOption(el, campo, step) {
    el.closest('.tf-options').querySelectorAll('.tf-option').forEach(o => {
        o.classList.remove('selected')
    })
    el.classList.add('selected')

    const valor = el.dataset.value

    switch(campo) {
        case 'es_propietario':
            datos.es_propietario = valor === 'true'
            break
        case 'quiere_vender':
            datos.quiere_vender = valor === 'true'
            break
        case 'plazo_venta':
            datos.plazo_venta = valor
            break
        case 'tipo_inmueble':
            datos.tipo_inmueble = parseInt(valor)
            break
        case 'habitaciones':
            datos.habitaciones = parseInt(valor)
            break
        case 'banos':
            datos.banos = parseInt(valor)
            break
        case 'planta_ascensor':
            const [planta, ascensor] = valor.split('|')
            datos.planta   = planta
            datos.ascensor = ascensor === 'true'
            break
        case 'estado':
            datos.estado = valor
            break
        case 'terraza':
            const [tieneTerraza, m2] = valor.split('|')
            datos.tieneTerraza = tieneTerraza === 'true'
            datos.m2Terraza    = parseFloat(m2)
            break
        case 'extras':
            const [parking, trastero] = valor.split('|')
            datos.tieneParking  = parking === 'true'
            datos.tieneTrastero = trastero === 'true'
            break
    }

    if (step < 14) {
        setTimeout(() => nextStep(step), 300)
    }
}

// ─── RESTAURAR SELECCIÓN AL VOLVER ATRÁS ──────────────────────────────────────

function restaurarSeleccion(step) {
    const stepEl = document.getElementById(`step-${step}`)

    switch(step) {
        case 1:
            if (datos.es_propietario !== null) {
                stepEl.querySelectorAll('.tf-option').forEach(o => {
                    if (o.dataset.value === String(datos.es_propietario)) o.classList.add('selected')
                })
            }
            break
        case 2:
            if (datos.quiere_vender !== null) {
                stepEl.querySelectorAll('.tf-option').forEach(o => {
                    if (o.dataset.value === String(datos.quiere_vender)) o.classList.add('selected')
                })
            }
            break
        case 3:
            if (datos.plazo_venta) {
                stepEl.querySelectorAll('.tf-option').forEach(o => {
                    if (o.dataset.value === datos.plazo_venta) o.classList.add('selected')
                })
            }
            break
        case 4:
            if (datos.valor_percibido) {
                document.getElementById('tf-valor-percibido').value = datos.valor_percibido
            }
            break
        case 5:
            if (datos.direccion) {
                document.getElementById('tf-direccion').value = datos.direccion
                if (/^\d{5}$/.test(datos.direccion)) {
                    buscarPorCP(datos.direccion)
                } else {
                    buscarDireccion(datos.direccion)
                }
            }
            break
        case 6:
            if (datos.tipo_inmueble) {
                stepEl.querySelectorAll('.tf-option').forEach(o => {
                    if (parseInt(o.dataset.value) === datos.tipo_inmueble) o.classList.add('selected')
                })
            }
            break
        case 7:
            if (datos.superficie) {
                document.getElementById('tf-superficie').value = datos.superficie
            }
            break
        case 8:
            if (datos.habitaciones) {
                stepEl.querySelectorAll('.tf-option').forEach(o => {
                    if (parseInt(o.dataset.value) === datos.habitaciones) o.classList.add('selected')
                })
            }
            break
        case 9:
            if (datos.banos) {
                stepEl.querySelectorAll('.tf-option').forEach(o => {
                    if (parseInt(o.dataset.value) === datos.banos) o.classList.add('selected')
                })
            }
            break
        case 10:
            if (datos.planta) {
                const val = `${datos.planta}|${datos.ascensor}`
                stepEl.querySelectorAll('.tf-option').forEach(o => {
                    if (o.dataset.value === val) o.classList.add('selected')
                })
            }
            break
        case 11:
            if (datos.estado) {
                stepEl.querySelectorAll('.tf-option').forEach(o => {
                    if (o.dataset.value === datos.estado) o.classList.add('selected')
                })
            }
            break
        case 12:
            if (datos.tieneTerraza !== null) {
                stepEl.querySelectorAll('.tf-option').forEach(o => {
                    const [tiene, m2] = o.dataset.value.split('|')
                    if (tiene === String(datos.tieneTerraza) && parseFloat(m2) === datos.m2Terraza) {
                        o.classList.add('selected')
                    }
                })
            }
            break
        case 13:
            if (datos.tieneParking !== null) {
                const val = `${datos.tieneParking}|${datos.tieneTrastero}`
                stepEl.querySelectorAll('.tf-option').forEach(o => {
                    if (o.dataset.value === val) o.classList.add('selected')
                })
            }
            break
    }
}

// ─── MAPA — BUSCAR POR CP ─────────────────────────────────────────────────────

async function buscarPorCP(cp) {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?postalcode=${cp}&country=ES&format=json&limit=1&addressdetails=1`
        )
        const data = await res.json()

        if (data.length === 0) {
            document.getElementById('tf-map-label').textContent = '❌ Código postal no encontrado'
            datos.cp = null
            return
        }

        const result = data[0]
        const ciudad = result.address?.city || result.address?.town || result.address?.village || result.display_name.split(',')[0]

        datos.cp = cp
        datos.direccion = cp
        document.getElementById('tf-map-label').textContent = `📍 ${ciudad} · CP ${cp}`
        document.getElementById('tf-map').classList.add('visible')

        if (!map) {
            map = L.map('tf-map', { zoomControl: false, attributionControl: false })
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
        }

        map.setView([result.lat, result.lon], 13)

        if (mapMarker) mapMarker.remove()
        mapMarker = L.circleMarker([result.lat, result.lon], {
            radius: 10,
            fillColor: '#10b981',
            color: '#059669',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map)

    } catch (e) {
        console.error('Error buscando CP:', e)
    }
}

// ─── MAPA — BUSCAR POR DIRECCIÓN ─────────────────────────────────────────────

async function buscarDireccion(direccion) {
    if (direccion.length < 5) return

    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(direccion)}&countrycodes=es&format=json&limit=1&addressdetails=1`
        )
        const data = await res.json()

        if (data.length === 0) {
            document.getElementById('tf-map-label').textContent = '❌ Dirección no encontrada'
            datos.cp = null
            return
        }

        const result = data[0]
        const cp = result.address?.postcode
        const ciudad = result.address?.city || result.address?.town || result.address?.village || result.display_name.split(',')[0]

        if (!cp) {
            document.getElementById('tf-map-label').textContent = '⚠️ No se encontró el código postal — prueba añadiendo la ciudad'
            datos.cp = null
            return
        }

        datos.cp = cp
        datos.direccion = direccion
        document.getElementById('tf-map-label').textContent = `📍 ${ciudad} · CP ${cp}`
        document.getElementById('tf-map').classList.add('visible')

        if (!map) {
            map = L.map('tf-map', { zoomControl: false, attributionControl: false })
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
        }

        map.setView([result.lat, result.lon], 15)

        if (mapMarker) mapMarker.remove()
        mapMarker = L.circleMarker([result.lat, result.lon], {
            radius: 10,
            fillColor: '#10b981',
            color: '#059669',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map)

    } catch (e) {
        console.error('Error buscando dirección:', e)
    }
}

// ─── OVERLAY DE CARGA ─────────────────────────────────────────────────────────

async function mostrarOverlayCarga() {
    return new Promise((resolve) => {
        const overlay = document.getElementById('tf-loading-overlay')
        overlay.classList.add('visible')

        const pasos = [
            { id: 'loading-step-1', delay: 0,    duracion: 1200 },
            { id: 'loading-step-2', delay: 1200, duracion: 1400 },
            { id: 'loading-step-3', delay: 2600, duracion: 1100 },
            { id: 'loading-step-4', delay: 3700, duracion: 1000 },
        ]

        pasos.forEach((paso) => {
            setTimeout(() => {
                document.getElementById(paso.id).classList.add('visible', 'active')
            }, paso.delay)

            setTimeout(() => {
                document.getElementById(paso.id).classList.remove('active')
                document.getElementById(paso.id).classList.add('done')
            }, paso.delay + paso.duracion)
        })

        setTimeout(() => {
            overlay.classList.add('fade-out')
            setTimeout(() => resolve(), 600)
        }, 4900)
    })
}

// ─── SUBMIT LEAD ──────────────────────────────────────────────────────────────

async function submitLead() {
    if (document.getElementById('tf-honeypot').value) {
        window.location.href = 'resultado.html'
        return
    }

    const nombre         = document.getElementById('tf-nombre').value.trim()
    const email          = document.getElementById('tf-email').value.trim()
    const telefono       = document.getElementById('tf-telefono').value.trim()
    const prefijo        = document.getElementById('tf-prefijo').value
    const rgpd           = document.getElementById('tf-rgpd').checked
    const rgpd_marketing = document.getElementById('tf-rgpd-marketing').checked

    if (!nombre) { mostrarError('Introduce tu nombre'); return }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mostrarError('Introduce un email válido'); return
    }
    if (!telefono) { mostrarError('Introduce tu número de teléfono'); return }
    if (!rgpd) { mostrarError('Debes aceptar la política de privacidad'); return }

    const formulario = {
        cp:                    datos.cp,
        superficie:            datos.superficie,
        habitaciones:          datos.habitaciones,
        banos:                 datos.banos,
        planta:                datos.planta,
        ascensor:              datos.ascensor,
        estado:                datos.estado,
        clase_finca_urbana_id: datos.tipo_inmueble,
        tieneTerraza:          datos.tieneTerraza,
        m2Terraza:             datos.m2Terraza,
        tieneParking:          datos.tieneParking,
        tieneTrastero:         datos.tieneTrastero,
        anio:                  null,
    }

    const resultado = calcularValoracion(formulario, precios)
    if (resultado.error) { mostrarError(resultado.error); return }

    sessionStorage.setItem('resultado',  JSON.stringify(resultado))
    sessionStorage.setItem('formulario', JSON.stringify(formulario))

    const btn = document.getElementById('btn-step-14')
    btn.classList.add('tf-btn--loading')
    btn.disabled = true

    const lead = {
        nombre,
        email,
        telefono:              `${prefijo}${telefono.replace(/\s/g, '')}`,
        cp:                    datos.cp,
        direccion:             datos.direccion,
        superficie:            datos.superficie,
        habitaciones:          datos.habitaciones,
        banos:                 datos.banos,
        planta:                datos.planta,
        ascensor:              datos.ascensor,
        tiene_terraza:         datos.tieneTerraza,
        tiene_parking:         datos.tieneParking,
        tipo_inmueble:         datos.tipo_inmueble === 14 ? 'Piso' : 'Casa',
        estado:                datos.estado,
        precio_estimado_bajo:  resultado.rangoBajo,
        precio_estimado_alto:  resultado.rangoAlto,
        nivel_dato:            resultado.nivel,
        rgpd:                  true,
        rgpd_marketing,
        agente:                new URLSearchParams(window.location.search).get('agente') || 'ivan-lopez-safti',
        es_propietario:        datos.es_propietario,
        quiere_vender:         datos.quiere_vender,
        plazo_venta:           datos.plazo_venta,
        valor_percibido:       datos.valor_percibido,
        tipo_lead:             calcularTipoLead(),
        created_at:            new Date().toISOString()
    }

    guardarLead(lead).then(enviado => {
        if (!enviado) sessionStorage.setItem('supabase_error', 'true')
    }).catch(() => {})

    await mostrarOverlayCarga()

    if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
            content_name: 'Valoracion Inmobiliaria',
            content_category: datos.tipo_inmueble === 14 ? 'Piso' : 'Casa',
            value: resultado.valorCentral,
            currency: 'EUR'
        })
    }

    window.location.href = 'resultado.html'
}

// ─── TECLADO ──────────────────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        const activeStep = document.querySelector('.tf-step.active')
        if (!activeStep) return
        const step = parseInt(activeStep.id.replace('step-', ''))
        if (step < 14) nextStep(step)
    }
})

// ─── INICIALIZAR ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    await cargarPrecios()
    await reenviarLeadPendiente()

    document.getElementById('step-1').classList.add('active')
    actualizarProgreso(1)

    let buscarTimeout = null
    document.getElementById('tf-direccion').addEventListener('input', e => {
        const valor = e.target.value.trim()
        datos.cp = null
        clearTimeout(buscarTimeout)
        if (valor.length >= 3) {
            buscarTimeout = setTimeout(() => {
                if (/^\d{5}$/.test(valor)) {
                    buscarPorCP(valor)
                } else if (valor.length >= 5) {
                    buscarDireccion(valor)
                }
            }, 600)
        }
    })
})