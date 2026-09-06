
/* ESTA ES LA PARTE QUE INICIA LA CONEXION CON LA BASE DE DATOS*/
const SUPABASE_URL = "https://fyndoqudirtvgzsfxzwy.supabase.co";

const SUPABASE_KEY = "sb_publishable_48ViGSfpwKTrZpBKET4sKw_BRKZAxbZ";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

/* =============================== */
/* 🎰 OBTENER SORTEO ACTIVO */
/* =============================== */

let sorteoActivo = null;

async function obtenerSorteoActivo() {

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/sorteos?estado=eq.activo&select=id,nombre,estado,fecha_inicio,fecha_fin,premio,imagen,precio&limit=1`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!response.ok) {

            throw new Error(
                `Error HTTP: ${response.status}`
            );

        }

        const data = await response.json();

        if (!data || data.length === 0) {

            console.warn("⚠️ No existe un sorteo activo.");

            return;

        }

        sorteoActivo = data[0];

        console.log("🎰 SORTEO ACTIVO:", sorteoActivo);

        mostrarDatosSorteo();

        await obtenerBoletos();
        
iniciarRealtimeBoletos();

    } catch (error) {

        console.error(
            "❌ Error obteniendo el sorteo activo:",
            error
        );

    }

}

/* =============================== */
/* 🎨 MOSTRAR DATOS DEL SORTEO */
/* =============================== */

function mostrarDatosSorteo() {

    if (!sorteoActivo) return;

    const nombre = document.getElementById("premioNombre");
    const fecha = document.getElementById("premioFecha");
    const precio = document.getElementById("premioPrecio");
    const imagen = document.getElementById("premioImagen");


    /* =============================== */
    /* 🏆 PREMIO */
    /* =============================== */

    if (nombre && sorteoActivo.premio) {

        nombre.textContent =
            `🔥${sorteoActivo.premio}🔥`;

    }


    /* =============================== */
    /* 📅 FECHA */
    /* =============================== */

    if (fecha && sorteoActivo.fecha_fin) {

        fecha.textContent =
            `⏳${formatearFecha(sorteoActivo.fecha_fin)}⌛`;

    }


    /* =============================== */
    /* 💰 PRECIO */
    /* =============================== */

    if (precio && sorteoActivo.precio !== null) {

        const valor = new Intl.NumberFormat("es-CO")
            .format(sorteoActivo.precio);

        precio.textContent =
            `💸TAN SOLO $${valor} PARA GANAR💸`;

    }


    /* =============================== */
    /* 🖼️ IMAGEN */
    /* =============================== */

    if (imagen && sorteoActivo.imagen) {

        imagen.src = sorteoActivo.imagen;

    }

}

/* =============================== */
/* 📅 FORMATEAR FECHA */
/* =============================== */

function formatearFecha(fecha) {

    const fechaObj = new Date(fecha);

    const meses = [
        "ENERO",
        "FEBRERO",
        "MARZO",
        "ABRIL",
        "MAYO",
        "JUNIO",
        "JULIO",
        "AGOSTO",
        "SEPTIEMBRE",
        "OCTUBRE",
        "NOVIEMBRE",
        "DICIEMBRE"
    ];

    const dia = fechaObj
        .getDate()
        .toString()
        .padStart(2, "0");

    const mes = meses[
        fechaObj.getMonth()
    ];

    const año = fechaObj.getFullYear();

    return `${dia}/${mes}/${año}`;

}

obtenerSorteoActivo();

async function probarConexion() {

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/boletos?select=*`,
        {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`
            }
        }
    );

    const data = await response.json();

    console.log(data);
}

/*RESERVA DE NUMEROS*/
async function reservarNumeros(numeros) {

    if (!sorteoActivo) {

        console.error(
            "❌ No existe un sorteo activo."
        );

        return null;

    }

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/rpc/reservar_boletos`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                },

                body: JSON.stringify({

                    p_sorteo_id: sorteoActivo.id,

                    p_numeros: numeros

                })

            }
        );

        const data = await response.json();

        if (!response.ok) {

            console.error(
                "❌ Error en la reserva:",
                data
            );

            return null;

        }

        console.log(
            "🎟️ RESULTADO RESERVA:",
            data
        );

        return data;

    } catch (error) {

        console.error(
            "❌ Error conectando con la reserva:",
            error
        );

        return null;

    }

}

probarConexion();
/* ===================== */
/* 🎯 VARIABLES GLOBALES */
/* ===================== */

// 🔒 Persistencia real (simulada)

let numerosSeleccionados = [];
let boletosDB = [];
let boletosPorNumero = new Map();
let numerosRenderizados = [];
let siguienteNumero = 0;


const TOTAL_NUMEROS = 10000;

const BLOQUE = 1000;

/* ===================== */
/* 🎯 EFECTO TOUCH */
/* ===================== */

const botones = document.querySelectorAll('.btn-img');

botones.forEach(btn => {

    btn.addEventListener('touchstart', () => {
        btn.classList.add('touch-active');

        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    });

    btn.addEventListener('touchend', () => {
        btn.classList.remove('touch-active');
    });

    btn.addEventListener('touchcancel', () => {
        btn.classList.remove('touch-active');
    });

});

/* ===================== */
/* 🎯 FUNCIONES BOTONES */
/* ===================== */

let intervaloActualizacion;

async function accionElegir() {

    console.log("🎯 Abriendo selector de números...");

    generarPanelInicial();

    document.querySelector(".logo").classList.add("oculto");

    document.getElementById("selector").classList.remove("hidden");
}

function accionAleatorio() {
    abrirModal();
}

function cancelarResultados(){

    document.getElementById("resultados")
        .classList.add("hidden");

    document.getElementById("selector")
        .classList.add("hidden");

    document.getElementById("modal")
        .classList.add("hidden");

    document.querySelector(".logo")
        .classList.remove("oculto");

    clearInterval(intervaloActualizacion);

}

function accionPesos(){

    alert("Próximamente continuaremos con la compra.");

}

/* ===================== */
/* 🎯 MODAL */
/* ===================== */

function abrirModal() {

    // Ocultar logo
    document.querySelector(".logo")
        .classList.add("oculto");

    document.getElementById("modal")
        .classList.remove("hidden");

}

function cerrarModal() {

    document.getElementById("modal")
        .classList.add("hidden");

    // Mostrar logo nuevamente
    document.querySelector(".logo")
        .classList.remove("oculto");

}

/* ===================== */
/* 🎯 CONFIRMAR ALEATORIO */
/* ===================== */

async function confirmar() {
    let cantidad = document.getElementById("cantidad").value;

    if (cantidad === "" || cantidad <= 0) {
        alert("Ingresa un número válido");
        return;
    }

    cerrarModal();

    await generarNumeros(parseInt(cantidad));
}

/* ===================== */
/* 🎯 GUARDAR ESTADO */
/* ===================== */

function guardarEstado() {
    localStorage.setItem("numerosUsados", JSON.stringify([...numerosUsados]));
}

/* ===================== */
/* 🎯 GENERAR NÚMEROS ALEATORIOS */
/* ===================== */

async function generarNumeros(cantidad) {

    console.log("🎲 Generando números aleatorios...");

    if (!sorteoActivo) {
        alert("❌ No existe un sorteo activo.");
        return;
    }

    // Actualizamos el estado real desde Supabase
    await obtenerBoletos();

    // Obtener únicamente números disponibles
    const disponibles = boletosDB
        .filter(boleto => boleto.estado === "disponible")
        .map(boleto => boleto.numero);

    console.log("🎟️ Números disponibles:", disponibles.length);

    if (disponibles.length === 0) {
        alert("🔥 TODOS LOS NÚMEROS HAN SIDO TOMADOS");
        return;
    }

    // Si solicitan más números de los disponibles
    if (cantidad > disponibles.length) {
        cantidad = disponibles.length;
    }

    // Mezclar números disponibles
    const mezclados = mezclarArray([...disponibles]);

    // Elegir cantidad solicitada
    const candidatos = mezclados.slice(0, cantidad);

    console.log("🎲 Números seleccionados aleatoriamente:", candidatos);

    // Reservarlos realmente en Supabase
    const resultado = await reservarNumeros(candidatos);

    if (!resultado) {
        alert("❌ No fue posible realizar la reserva.");
        return;
    }

    console.log("🎟️ Resultado de la reserva aleatoria:", resultado);

    const reservados = resultado.numeros_reservados || [];
    const noReservados = resultado.no_reservados || [];

    if (reservados.length === 0) {
        alert("⚠️ Los números seleccionados ya no están disponibles. Intenta nuevamente.");
        return;
    }

    // Informar si hubo una carrera con otro usuario
    if (noReservados.length > 0) {
        alert(
            "⚠️ Algunos números ya fueron tomados:\n\n" +
            noReservados.join(", ") +
            "\n\nSe reservaron los demás."
        );
    }

    console.log("✅ Números finalmente reservados:", reservados);

    // Mostrar resultados
    document.querySelector(".logo").classList.add("oculto");

    document.getElementById("resultados").classList.remove("hidden");

    mostrarNumerosAnimados(reservados);
}



/* ===================== */
/* 🎯 MEZCLAR ARRAY */
/* ===================== */

function mezclarArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function generarPanelInicial() {

    panel.innerHTML = "";

    numerosSeleccionados = [];

    siguienteNumero = 0;

    cargarSiguienteBloque();

    activarScrollInfinito();

}

function cargarSiguienteBloque(){

    const panel = document.getElementById("panelNumeros");

    const limite = Math.min(
        siguienteNumero + BLOQUE,
        TOTAL_NUMEROS
    );

    for(let i = siguienteNumero; i < limite; i++){

        const numero = i.toString().padStart(4,"0");

        const div = document.createElement("div");

div.className = "numero";

div.textContent = numero;

// NUEVO
div.id = "n-" + numero;

        // Buscar estado en la BD
       const boleto = boletosPorNumero.get(numero);

        if(boleto && boleto.estado !== "disponible"){

            div.classList.add("bloqueado");

        }else{

            div.onclick = () => seleccionarNumero(div, numero);

        }

        panel.appendChild(div);

    }

    siguienteNumero = limite;

}
async function cargarHastaBloque(bloqueObjetivo){

    while(
        siguienteNumero < (bloqueObjetivo + 1) * BLOQUE &&
        siguienteNumero < TOTAL_NUMEROS
    ){

        cargarSiguienteBloque();

        await new Promise(resolve => setTimeout(resolve, 0));

    }

}
/* ==========================================
   BUSCADOR INTELIGENTE
========================================== */

const buscador = document.getElementById("buscadorNumero");

buscador.addEventListener("input", async () => {

    const valor = buscador.value.trim();

    if (valor.length !== 4) return;

    const numero = parseInt(valor);

    if (isNaN(numero)) return;

    const bloque = Math.floor(numero / BLOQUE);

    await cargarHastaBloque(bloque);

    const objetivo = document.getElementById("n-" + valor);

    if (!objetivo) return;

    // Scroll hasta el número
    objetivo.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

    // Si ya estaba bloqueado no hacer nada
    if (objetivo.classList.contains("bloqueado")) return;

    // Si no estaba seleccionado lo seleccionamos automáticamente
    if (!objetivo.classList.contains("seleccionado")) {

        objetivo.classList.add("seleccionado");

        numerosSeleccionados.push(valor);

        // Actualizar contador
        const contador = document.getElementById("contadorSeleccionados");

        if (contador) {

            contador.textContent = numerosSeleccionados.length;

        }

        // Vibración en móviles
        if (navigator.vibrate) {

            navigator.vibrate(40);

        }

    }

});

function activarScrollInfinito(){

    const panel=document.getElementById("panelNumeros");

    panel.onscroll=()=>{

        const cercaDelFinal=

            panel.scrollTop+
            panel.clientHeight>=
            panel.scrollHeight-300;

        if(cercaDelFinal){

            if(siguienteNumero<TOTAL_NUMEROS){

                cargarSiguienteBloque();

            }

        }

    };

}


/* ===================== */
/* 🎯 SELECCIONAR */
/* ===================== */

function seleccionarNumero(elemento, numero){

    if(elemento.classList.contains("bloqueado")) return;

    if(elemento.classList.contains("seleccionado")){

        elemento.classList.remove("seleccionado");

        numerosSeleccionados =
            numerosSeleccionados.filter(n => n !== numero);

    }else{

        elemento.classList.add("seleccionado");

        numerosSeleccionados.push(numero);

    }

    // Actualizar contador
    const contador = document.getElementById("contadorSeleccionados");

    if(contador){

        contador.textContent = numerosSeleccionados.length;

    }

    if(navigator.vibrate){

        navigator.vibrate(40);

    }

}

/* ===================== */
/* 🎯 CONFIRMAR SELECCIÓN */
/* ===================== */

async function confirmarSeleccion() {

    if (numerosSeleccionados.length === 0) {
        alert("Selecciona al menos un número");
        return;
    }

    console.log("🎟️ Intentando reservar:", numerosSeleccionados);

    // Guardamos una copia de lo que el usuario intentó reservar
    const numerosIntentados = [...numerosSeleccionados];

    // Intentar reservar directamente en Supabase
    const resultado = await reservarNumeros(numerosIntentados);

    if (!resultado) {
        alert("❌ No fue posible realizar la reserva.");
        return;
    }

    console.log("🎟️ Resultado de reserva manual:", resultado);

    const reservados = resultado.numeros_reservados || [];
    const noReservados = resultado.no_reservados || [];

    console.log("✅ Reservados:", reservados);
    console.log("⚠️ No reservados:", noReservados);

    // Si ninguno pudo reservarse
    if (reservados.length === 0) {

        alert(
            "⚠️ Ninguno de los números seleccionados está disponible.\n\n" +
            "Otro usuario pudo haberlos reservado."
        );

        // Actualizamos inmediatamente el estado visual
        await obtenerBoletos();

        generarPanelInicial();

        numerosSeleccionados = [];
        document.getElementById("contadorSeleccionados").textContent = "0";

        return;
    }

    // Si algunos fueron tomados por otro usuario
    if (noReservados.length > 0) {

        alert(
            "⚠️ Algunos números ya fueron tomados:\n\n" +
            noReservados.join(", ") +
            "\n\nLos demás fueron reservados durante 10 minutos."
        );

        // Actualizar la información del selector
        await obtenerBoletos();
    }

    // Mostrar únicamente los que realmente consiguió este usuario
    numerosSeleccionados = [...reservados];

    console.log(
        "🎯 Números que pasan a resultados:",
        numerosSeleccionados
    );

    // Mostrar resultados
    document.querySelector(".logo").classList.add("oculto");

    document.getElementById("selector").classList.add("hidden");

    document.getElementById("resultados").classList.remove("hidden");

    mostrarNumerosAnimados(reservados);
}

/* ===================== */
/* 🎯 MOSTRAR RESULTADOS */
/* ===================== */

function mostrarNumerosAnimados(lista){

    const contenedor = document.getElementById("listaNumeros");

    contenedor.innerHTML = "";

    lista.forEach((numero,index)=>{

        const ficha=document.createElement("div");

        ficha.className="numero resultado";

        ficha.textContent="0000";

        contenedor.appendChild(ficha);

        let vueltas=0;

        const efecto=setInterval(()=>{

            ficha.textContent=Math.floor(Math.random()*10000)
                .toString()
                .padStart(4,"0");

            vueltas++;

            if(vueltas>18){

                clearInterval(efecto);

                ficha.textContent=numero;

                ficha.classList.add("revelado");

            }

        },45);

    });

}

/* ===================== */
/* 🎯 CERRAR */
/* ===================== */

function cerrarSelector() {

    clearInterval(intervaloActualizacion);

    document.getElementById("selector")
        .classList.add("hidden");

    // Volver a mostrar el logo
    document.querySelector(".logo")
        .classList.remove("oculto");

}

/* ===================== */
/* 🎰 ANIMACIÓN BOLETA */
/* ===================== */

function animarBoleta(elemento, numeroFinal, index) {

    let duracion = 800 + (index * 150);

    let intervalo = setInterval(() => {
        let n = Math.floor(Math.random() * 1000);
        elemento.textContent = n.toString().padStart(4, '0');
    }, 50);

    setTimeout(() => {
        clearInterval(intervalo);

        elemento.textContent = numeroFinal;

        elemento.style.transform = "scale(1.2)";
        setTimeout(() => {
            elemento.style.transform = "scale(1)";
        }, 150);

    }, duracion);
}

/* ===================== */
/*  AGREGAR BOLETOS */
/* ===================== */

async function obtenerBoletos() {

    if (!sorteoActivo) {

        console.warn(
            "⚠️ No se pueden obtener boletos porque no hay sorteo activo."
        );

        return;

    }

    try {

        const todosLosBoletos = [];

        const TAMANO_BLOQUE = 1000;

        for (
            let inicio = 0;
            inicio < TOTAL_NUMEROS;
            inicio += TAMANO_BLOQUE
        ) {

            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/boletos?sorteo_id=eq.${sorteoActivo.id}&select=numero,estado&order=numero&limit=${TAMANO_BLOQUE}&offset=${inicio}`,
                {
                    headers: {
                        apikey: SUPABASE_KEY,
                        Authorization: `Bearer ${SUPABASE_KEY}`
                    }
                }
            );

            if (!response.ok) {

                throw new Error(
                    `Error HTTP: ${response.status}`
                );

            }

            const data = await response.json();

            todosLosBoletos.push(...data);

            console.log(
                `📦 Bloque ${inicio} - ${inicio + data.length - 1}:`,
                data.length
            );

            if (data.length < TAMANO_BLOQUE) {

                break;

            }

        }

        boletosDB = todosLosBoletos;

        // Crear índice rápido por número
boletosPorNumero.clear();

for (const boleto of boletosDB) {
    boletosPorNumero.set(boleto.numero, boleto);
}

console.log(
    `🎟️ BOLETOS DEL SORTEO ${sorteoActivo.id}:`,
    boletosDB
);

console.log(
    "📊 TOTAL BOLETOS CARGADOS:",
    boletosDB.length
);

console.log(
    "⚡ ÍNDICE DE BOLETOS:",
    boletosPorNumero.size
);

    } catch (error) {

        console.error(
            "❌ Error obteniendo boletos:",
            error
        );

    }

}

function iniciarRealtimeBoletos() {

    if (!sorteoActivo) {
        console.warn("⚠️ No se puede iniciar Realtime: no hay sorteo activo.");
        return;
    }

    console.log(
        `📡 Iniciando Realtime para boletos del sorteo ${sorteoActivo.id}...`
    );

    supabaseClient
        .channel(`boletos-sorteo-${sorteoActivo.id}`)
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "boletos",
                filter: `sorteo_id=eq.${sorteoActivo.id}`
            },
            (payload) => {

                console.log("⚡ CAMBIO REALTIME:", payload);

                const boletoActualizado = payload.new;

                if (!boletoActualizado) {
                    return;
                }

                // Buscar el boleto dentro de nuestra memoria local
                const indice = boletosDB.findIndex(
    boleto => boleto.numero === boletoActualizado.numero
);

if (indice !== -1) {

    boletosDB[indice] = {
        ...boletosDB[indice],
        ...boletoActualizado
    };

} else {

    boletosDB.push(boletoActualizado);

}

// Actualizar también el índice rápido
boletosPorNumero.set(
    boletoActualizado.numero,
    boletoActualizado
);

                console.log(
                    `🔄 Boleto ${boletoActualizado.numero} actualizado a: ${boletoActualizado.estado}`
                );

                // Si el selector está abierto,
                // actualizar visualmente el número
                const selector = document.getElementById("selector");

                if (
                    selector &&
                    !selector.classList.contains("hidden")
                ) {
                    actualizarNumeroVisual(
                        boletoActualizado.numero,
                        boletoActualizado.estado
                    );
                }
            }
        )
        .subscribe((status, error) => {

            console.log("📡 Estado Realtime:", status);

            if (status === "SUBSCRIBED") {

                console.log(
                    `✅ Realtime conectado para sorteo ${sorteoActivo.id}`
                );

            }

            if (
                status === "CHANNEL_ERROR" ||
                status === "TIMED_OUT"
            ) {

                console.error(
                    "❌ Error conectando Realtime:",
                    error
                );

            }

        });
}

function actualizarNumeroVisual(numero, estado) {

    const elemento = document.getElementById(`n-${numero}`);

    if (!elemento) {
        return;
    }

    // Número disponible
    if (estado === "disponible") {

        elemento.classList.remove("bloqueado");

        elemento.classList.remove("seleccionado");

        elemento.style.pointerEvents = "auto";

        return;
    }

    // Número reservado o comprado
    elemento.classList.add("bloqueado");

    elemento.classList.remove("seleccionado");

    elemento.style.pointerEvents = "none";

    // Si el número estaba seleccionado localmente,
    // eliminarlo de nuestra selección
    numerosSeleccionados = numerosSeleccionados.filter(
        numeroSeleccionado => numeroSeleccionado !== numero
    );

    const contador = document.getElementById(
        "contadorSeleccionados"
    );

    if (contador) {
        contador.textContent = numerosSeleccionados.length;
    }
}



