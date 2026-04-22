/* ===================== */
/* 🎯 VARIABLES GLOBALES */
/* ===================== */

// 🔒 Persistencia real (simulada)
let numerosUsados = new Set(
    JSON.parse(localStorage.getItem("numerosUsados")) || []
);

let numerosSeleccionados = [];

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
    generarPanelAleatorio();
    document.getElementById("selector").classList.remove("hidden");
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
/* 🎯 CONFIRMAR ALEATORIO */
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
/* 🎯 GUARDAR ESTADO */
/* ===================== */

function guardarEstado() {
    localStorage.setItem("numerosUsados", JSON.stringify([...numerosUsados]));
}

/* ===================== */
/* 🎯 GENERAR NÚMEROS ALEATORIOS */
/* ===================== */

function generarNumeros(cantidad) {

    const contenedor = document.getElementById("listaNumeros");
    const resultados = document.getElementById("resultados");

    contenedor.innerHTML = "";
    resultados.classList.remove("hidden");

    let numerosFinales = [];
    let disponibles = obtenerDisponibles();

    if (disponibles.length === 0) {
        alert("🔥 TODOS LOS NÚMEROS HAN SIDO TOMADOS");
        return;
    }

    if (cantidad > disponibles.length) {
        cantidad = disponibles.length;
    }

    let mezclados = mezclarArray(disponibles);

    numerosFinales = mezclados.slice(0, cantidad);

    numerosFinales.forEach((num, index) => {

        numerosUsados.add(num);

        let div = document.createElement("div");
        div.classList.add("numero");
        div.textContent = "000";

        contenedor.appendChild(div);

        animarBoleta(div, num, index);
    });

    guardarEstado();
}

/* ===================== */
/* 🎯 OBTENER DISPONIBLES */
/* ===================== */

function obtenerDisponibles() {
    const disponibles = [];

    for (let i = 0; i < 1000; i++) {
        const num = i.toString().padStart(3, "0");

        if (!numerosUsados.has(num)) {
            disponibles.push(num);
        }
    }

    return disponibles;
}

/* ===================== */
/* 🎯 MEZCLAR ARRAY */
/* ===================== */

function mezclarArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

/* ===================== */
/* 🎯 PANEL ALEATORIO (100) */
/* ===================== */

function generarPanelAleatorio() {

    const disponibles = obtenerDisponibles();

    if (disponibles.length === 0) {
        alert("🔥 TODOS LOS NÚMEROS HAN SIDO TOMADOS");
        return;
    }

    const mezclados = mezclarArray(disponibles);
    const mostrar = mezclados.slice(0, 100);

    renderizarPanel(mostrar);
}

/* ===================== */
/* 🎯 RENDER PANEL */
/* ===================== */

function renderizarPanel(numeros) {

    const contenedor = document.getElementById("panelNumeros");

    contenedor.innerHTML = "";
    numerosSeleccionados = [];

    numeros.forEach(num => {

        let div = document.createElement("div");
        div.classList.add("numero");
        div.textContent = num;

        if (numerosUsados.has(num)) {
            div.classList.add("bloqueado");
        } else {
            div.addEventListener("click", () => seleccionarNumero(div, num));
        }

        contenedor.appendChild(div);
    });
}

/* ===================== */
/* 🎯 SELECCIONAR */
/* ===================== */

function seleccionarNumero(elemento, numero) {

    if (elemento.classList.contains("seleccionado")) {
        elemento.classList.remove("seleccionado");
        numerosSeleccionados = numerosSeleccionados.filter(n => n !== numero);
    } else {
        elemento.classList.add("seleccionado");
        numerosSeleccionados.push(numero);
    }

    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

/* ===================== */
/* 🎯 CONFIRMAR SELECCIÓN */
/* ===================== */

function confirmarSeleccion() {

    if (numerosSeleccionados.length === 0) {
        alert("Selecciona al menos un número");
        return;
    }

    numerosSeleccionados.forEach(num => {
        numerosUsados.add(num);
    });

    guardarEstado();

    mostrarNumerosAnimados(numerosSeleccionados);

    document.getElementById("selector").classList.add("hidden");
    document.getElementById("resultados").classList.remove("hidden");
}

/* ===================== */
/* 🎯 MOSTRAR RESULTADOS */
/* ===================== */

function mostrarNumerosAnimados(lista) {

    const contenedor = document.getElementById("listaNumeros");
    contenedor.innerHTML = "";

    lista.forEach((numero, index) => {
        setTimeout(() => {

            let div = document.createElement("div");
            div.classList.add("numero");

            div.textContent = numero;

            contenedor.appendChild(div);

        }, index * 120);
    });
}

/* ===================== */
/* 🎯 CERRAR */
/* ===================== */

function cerrarResultados() {
    document.getElementById("resultados").classList.add("hidden");
}

function cerrarSelector() {
    document.getElementById("selector").classList.add("hidden");
}

/* ===================== */
/* 🎰 ANIMACIÓN BOLETA */
/* ===================== */

function animarBoleta(elemento, numeroFinal, index) {

    let duracion = 800 + (index * 150);

    let intervalo = setInterval(() => {
        let n = Math.floor(Math.random() * 1000);
        elemento.textContent = n.toString().padStart(3, '0');
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
