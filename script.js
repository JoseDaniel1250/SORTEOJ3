/* ===================== */
/* 🎯 VARIABLES GLOBALES */
/* ===================== */
let paginaActual = 0;
let seleccionados = new Set();

// 🔒 Números únicos globales (000–999)
let numerosGlobales = new Set();

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

function accionElegir() {
    paginaActual = 0;
    seleccionados.clear();

    document.getElementById("selector").classList.remove("hidden");

    renderPagina(); // 🔥 TODO se controla desde aquí
}

function accionPesos() {
    alert("Función PESOS próximamente");
}

function accionAleatorio() {
    abrirModal();
}

/* ===================== */
/* 🎯 MODAL */
/* ===================== */

function abrirModal() {
    document.getElementById("modal").classList.remove("hidden");
}

function cerrarModal() {
    document.getElementById("modal").classList.add("hidden");
}

/* ===================== */
/* 🎯 CONFIRMAR */
/* ===================== */

function confirmar() {
    let cantidad = document.getElementById("cantidad").value;

    if (cantidad === "" || cantidad <= 0) {
        alert("Ingresa un número válido");
        return;
    }

    cerrarModal();

    generarNumeros(parseInt(cantidad));
}

/* ===================== */
/* 🎯 GENERAR NÚMEROS */
/* ===================== */

function generarNumeros(cantidad) {
    const contenedor = document.getElementById("listaNumeros");
    const resultados = document.getElementById("resultados");

    contenedor.innerHTML = "";
    resultados.classList.remove("hidden");

    let numerosFinales = [];
    let disponibles = 1000 - numerosGlobales.size;

    if (disponibles <= 0) {
        alert("Ya se generaron todos los números (000-999)");
        return;
    }

    if (cantidad > disponibles) {
        alert(`Solo quedan ${disponibles} números disponibles`);
        cantidad = disponibles;
    }

    while (numerosFinales.length < cantidad) {
        let numero = Math.floor(Math.random() * 1000);

        if (!numerosGlobales.has(numero)) {
            numerosGlobales.add(numero);
            numerosFinales.push(numero);
        }
    }

    numerosFinales.forEach((numeroFinal, index) => {

        let div = document.createElement("div");
        div.classList.add("numero");
        div.textContent = "000";

        contenedor.appendChild(div);

        animarBoleta(div, numeroFinal, index);
    });
}

/* ===================== */
/* 🎯 MOSTRAR NÚMEROS */
/* ===================== */

function mostrarNumerosAnimados(lista) {
    const contenedor = document.getElementById("listaNumeros");

    contenedor.innerHTML = "";

    lista.forEach((numero, index) => {
        setTimeout(() => {
            let div = document.createElement("div");
            div.classList.add("numero");

            div.textContent = numero.toString().padStart(3, '0');

            contenedor.appendChild(div);
        }, index * 150);
    });
}

/* ===================== */
/* 🎯 CERRAR RESULTADOS */
/* ===================== */

function cerrarResultados() {
    document.getElementById("resultados").classList.add("hidden");
}

/* TOUCH BOTÓN CONTINUAR */

const btnCerrar = document.querySelector('.btn-cerrar');

if (btnCerrar) {
    btnCerrar.addEventListener('touchstart', function () {
        this.classList.add('touch-active');
    });

    btnCerrar.addEventListener('touchend', function () {
        this.classList.remove('touch-active');
    });
}

/* ===================== */
/* 🎰 ANIMACIÓN BOLETA */
/* ===================== */

function animarBoleta(elemento, numeroFinal, index) {

    let duracion = 800 + (index * 150);
    let intervaloTiempo = 50;

    let intervalo = setInterval(() => {
        let n = Math.floor(Math.random() * 1000);
        elemento.textContent = n.toString().padStart(3, '0');
    }, intervaloTiempo);

    setTimeout(() => {
        clearInterval(intervalo);

        elemento.textContent = numeroFinal.toString().padStart(3, '0');

        elemento.style.transform = "scale(1.2)";
        setTimeout(() => {
            elemento.style.transform = "scale(1)";
        }, 150);

    }, duracion);
}

/* ===================== */
/* 🎯 RENDER PAGINADO */
/* ===================== */

function renderPagina() {
    const contenedor = document.getElementById("panelNumeros");
    const titulo = document.getElementById("tituloSelector");

    const btnAnterior = document.getElementById("btnAnterior");
    const btnSiguiente = document.getElementById("btnSiguiente");

    contenedor.innerHTML = "";

    let inicio = paginaActual * 100;
    let fin = inicio + 99;

    if (fin > 999) fin = 999;

   

    // 🔢 GENERAR NÚMEROS
    for (let i = inicio; i <= fin; i++) {

        let div = document.createElement("div");
        div.classList.add("numero");

        let numeroTexto = i.toString().padStart(3, '0');
        div.textContent = numeroTexto;

        // 🔒 bloqueados
        if (numerosGlobales.has(i)) {
            div.classList.add("bloqueado");
        } else {
            div.addEventListener("click", () => toggleSeleccion(div, i));
        }

        // ✅ seleccionados
        if (seleccionados.has(i)) {
            div.classList.add("seleccionado");
        }

        contenedor.appendChild(div);
    }

    // =====================
    // 🎛️ CONTROL DE BOTONES
    // =====================

    // 🔹 PRIMERA PÁGINA (000–099)
    if (paginaActual === 0) {
        btnAnterior.style.display = "none";
        btnSiguiente.style.display = "inline-block";
    }

    // 🔹 ÚLTIMA PÁGINA (900–999)
    else if ((paginaActual + 1) * 100 >= 1000) {
        btnAnterior.style.display = "inline-block";
        btnSiguiente.style.display = "none";
    }

    // 🔹 PÁGINAS INTERMEDIAS
    else {
        btnAnterior.style.display = "inline-block";
        btnSiguiente.style.display = "inline-block";
    }
}

/* ===================== */
/* 🎯 SELECCIÓN */
/* ===================== */

function toggleSeleccion(elemento, numero) {

    if (seleccionados.has(numero)) {
        seleccionados.delete(numero);
        elemento.classList.remove("seleccionado");
    } else {
        seleccionados.add(numero);
        elemento.classList.add("seleccionado");
    }
}

/* ===================== */
/* 🎯 PAGINACIÓN */
/* ===================== */

function siguientePagina() {
    if ((paginaActual + 1) * 100 < 1000) {
        paginaActual++;
        renderPagina();
    }
}

function anteriorPagina() {
    if (paginaActual > 0) {
        paginaActual--;
        renderPagina();
    }
}

/* ===================== */
/* 🎯 CONFIRMAR SELECCIÓN */
/* ===================== */

function confirmarSeleccion() {

    if (seleccionados.size === 0) {
        alert("Selecciona al menos un número");
        return;
    }

    let lista = Array.from(seleccionados);

    lista.forEach(n => numerosGlobales.add(n));

    document.getElementById("selector").classList.add("hidden");

    mostrarNumerosAnimados(lista);
    document.getElementById("resultados").classList.remove("hidden");
}

function cerrarSelector() {
    document.getElementById("selector").classList.add("hidden");
}


