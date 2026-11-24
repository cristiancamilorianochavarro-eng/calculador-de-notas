const NOTA_MIN = 1.0;
const NOTA_MAX = 5.0;
const NOTA_APROBAR = 3.5;
const CANTIDAD_NOTAS = 5;

const form = document.getElementById("form-notas");
const btnLimpiar = document.getElementById("btn-limpiar");
const vacio = document.getElementById("vacio");
const resultado = document.getElementById("resultado");

const nombresNotas = ["Nota 1", "Nota 2", "Nota 3", "Nota 4", "Nota 5"];

function mostrarError(idCampo, mensaje) {
  const input = document.getElementById(idCampo);
  const error = document.getElementById("error-" + idCampo);
  error.textContent = mensaje;
  if (mensaje) {
    input.setAttribute("aria-invalid", "true");
    input.setAttribute("aria-describedby", "error-" + idCampo);
  } else {
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");
  }
}

// Acepta "4.2" y "4,2". Devuelve NaN si no es un número válido.
function leerNota(texto) {
  const limpio = texto.trim().replace(",", ".");
  if (limpio === "" || !/^\d+(\.\d+)?$/.test(limpio)) return NaN;
  return parseFloat(limpio);
}

function validar() {
  let valido = true;
  let primerError = null;
  const notas = [];

  ["nombre", "apellido"].forEach((id) => {
    const input = document.getElementById(id);
    if (input.value.trim() === "") {
      mostrarError(id, "Escribe tu " + id + ".");
      valido = false;
      primerError = primerError || input;
    } else {
      mostrarError(id, "");
    }
  });

  for (let i = 1; i <= CANTIDAD_NOTAS; i++) {
    const id = "nota" + i;
    const input = document.getElementById(id);
    const valor = leerNota(input.value);

    if (Number.isNaN(valor) || valor < NOTA_MIN || valor > NOTA_MAX) {
      mostrarError(id, "Nota inválida. Escribe un valor entre 1.0 y 5.0.");
      valido = false;
      primerError = primerError || input;
    } else {
      mostrarError(id, "");
      notas.push(valor);
    }
  }

  if (!valido && primerError) primerError.focus();
  return { valido, notas };
}

function formatear(numero) {
  return numero.toFixed(1);
}

function dibujarGrafica(notas) {
  const grafica = document.getElementById("grafica");
  grafica.innerHTML = "";

  notas.forEach((nota, i) => {
    const fila = document.createElement("div");
    fila.className = "chart-row";

    const etiqueta = document.createElement("span");
    etiqueta.textContent = nombresNotas[i];

    const pista = document.createElement("div");
    pista.className = "chart-track";

    const barra = document.createElement("div");
    barra.className = "chart-bar" + (nota >= NOTA_APROBAR ? "" : " is-fail");
    pista.appendChild(barra);

    const valor = document.createElement("span");
    valor.className = "chart-value";
    valor.textContent = formatear(nota);

    fila.append(etiqueta, pista, valor);
    grafica.appendChild(fila);

    // Las barras crecen una tras otra
    setTimeout(() => {
      barra.style.width = (nota / NOTA_MAX) * 100 + "%";
    }, 150 + i * 140);
  });

  const linea = document.createElement("div");
  linea.className = "chart-pass-line";
  linea.setAttribute("aria-hidden", "true");
  grafica.appendChild(linea);
}

/* ---------- Efectos ---------- */
const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");
const flash = document.getElementById("flash");
const pagina = document.getElementById("pagina");
const reporte = document.getElementById("reporte");

let particulas = [];
let rafId = null;
let temporizador = null;
let rafNumero = null;

function ajustarCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", ajustarCanvas);
ajustarCanvas();

function aleatorio(min, max) {
  return min + Math.random() * (max - min);
}

function lanzarConfeti() {
  const colores = ["#f2c14e", "#ffe28a", "#3ddc97", "#ffffff", "#7fb4ff", "#ff9d5c"];
  const w = window.innerWidth;
  const h = window.innerHeight;

  // Dos cañones, uno en cada esquina inferior
  [0, 1].forEach((lado) => {
    for (let i = 0; i < 130; i++) {
      const grados = lado === 0 ? aleatorio(-85, -50) : aleatorio(-130, -95);
      const angulo = (grados * Math.PI) / 180;
      const velocidad = aleatorio(12, 27);
      particulas.push({
        tipo: "confeti",
        x: lado === 0 ? 0 : w,
        y: h,
        vx: Math.cos(angulo) * velocidad,
        vy: Math.sin(angulo) * velocidad,
        ancho: aleatorio(6, 12),
        alto: aleatorio(4, 8),
        giro: aleatorio(0, Math.PI * 2),
        vgiro: aleatorio(-0.3, 0.3),
        color: colores[Math.floor(Math.random() * colores.length)],
      });
    }
  });
  iniciarBucle();
}

function lanzarCenizas() {
  const colores = ["#ff4d3d", "#ff8a3d", "#6b7390", "#4a2424"];
  const w = window.innerWidth;
  const h = window.innerHeight;

  for (let i = 0; i < 170; i++) {
    particulas.push({
      tipo: "ceniza",
      x: aleatorio(0, w),
      y: aleatorio(-h * 0.6, 0),
      vx: 0,
      vy: aleatorio(1.6, 4.2),
      radio: aleatorio(1.5, 4.5),
      fase: aleatorio(0, Math.PI * 2),
      balanceo: aleatorio(0.4, 1.4),
      color: colores[Math.floor(Math.random() * colores.length)],
    });
  }
  iniciarBucle();
}

function iniciarBucle() {
  if (rafId === null) rafId = requestAnimationFrame(bucle);
}

function bucle() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  ctx.clearRect(0, 0, w, h);

  particulas = particulas.filter((p) => p.y < h + 30 && p.x > -60 && p.x < w + 60);

  for (const p of particulas) {
    if (p.tipo === "confeti") {
      p.vx *= 0.992;
      p.vy = p.vy * 0.992 + 0.38;
      p.x += p.vx;
      p.y += p.vy;
      p.giro += p.vgiro;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.giro);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.ancho / 2, -p.alto / 2, p.ancho, p.alto);
      ctx.restore();
    } else {
      p.fase += 0.03;
      p.x += Math.sin(p.fase) * p.balanceo;
      p.y += p.vy;
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  if (particulas.length > 0) {
    rafId = requestAnimationFrame(bucle);
  } else {
    rafId = null;
    ctx.clearRect(0, 0, w, h);
  }
}

function detenerEfectos() {
  clearTimeout(temporizador);
  cancelAnimationFrame(rafNumero);
  particulas = [];
  if (rafId !== null) cancelAnimationFrame(rafId);
  rafId = null;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  flash.className = "";
  pagina.classList.remove("sacudir");
  reporte.classList.remove("win", "lose");
  resultado.classList.remove("win", "lose", "revelado");
}

function reiniciarAnimacion(elemento, clase) {
  elemento.classList.remove(clase);
  void elemento.offsetWidth; // fuerza el reflujo para repetir la animación
  elemento.classList.add(clase);
}

function contarHasta(elemento, destino, duracion, alTerminar) {
  const inicio = performance.now();
  function paso(ahora) {
    const t = Math.min((ahora - inicio) / duracion, 1);
    const suave = 1 - Math.pow(1 - t, 3);
    elemento.textContent = (destino * suave).toFixed(2);
    if (t < 1) {
      rafNumero = requestAnimationFrame(paso);
    } else {
      alTerminar();
    }
  }
  rafNumero = requestAnimationFrame(paso);
}

function revelar(aprueba) {
  resultado.classList.add("revelado", aprueba ? "win" : "lose");
  reporte.classList.add(aprueba ? "win" : "lose");

  if (reducirMovimiento) return;

  if (aprueba) {
    reiniciarAnimacion(flash, "flash-win");
    lanzarConfeti();
  } else {
    reiniciarAnimacion(flash, "flash-lose");
    reiniciarAnimacion(pagina, "sacudir");
    lanzarCenizas();
  }
}

function mostrarResultado(nombre, apellido, notas) {
  detenerEfectos();

  let suma = 0;
  let aprobadas = 0;
  let reprobadas = 0;

  for (const nota of notas) {
    suma += nota;
    if (nota >= NOTA_APROBAR) {
      aprobadas++;
    } else {
      reprobadas++;
    }
  }

  const promedio = suma / notas.length;
  const aprueba = promedio >= NOTA_APROBAR;

  document.getElementById("res-nombre").textContent = nombre + " " + apellido;
  document.getElementById("res-aprobadas").textContent = aprobadas;
  document.getElementById("res-reprobadas").textContent = reprobadas;
  document.getElementById("res-veredicto").textContent = aprueba ? "APROBADO" : "REPROBADO";
  document.getElementById("res-frase").textContent = aprueba ? "¡Qué pro!" : "¡Qué burro!";

  dibujarGrafica(notas);

  vacio.hidden = true;
  resultado.hidden = false;

  const numero = document.getElementById("res-promedio");
  if (reducirMovimiento) {
    numero.textContent = promedio.toFixed(2);
    revelar(aprueba);
    return;
  }

  numero.textContent = "0.00";
  contarHasta(numero, promedio, 1500, () => {
    numero.textContent = promedio.toFixed(2);
    revelar(aprueba);
  });
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const { valido, notas } = validar();
  if (!valido) return;

  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  mostrarResultado(nombre, apellido, notas);
});

btnLimpiar.addEventListener("click", () => {
  detenerEfectos();
  form.reset();
  ["nombre", "apellido", "nota1", "nota2", "nota3", "nota4", "nota5"].forEach((id) =>
    mostrarError(id, "")
  );
  resultado.hidden = true;
  vacio.hidden = false;
  document.getElementById("nombre").focus();
});

// Quita el error de un campo en cuanto la persona vuelve a escribir en él
form.addEventListener("input", (evento) => {
  if (evento.target.id) mostrarError(evento.target.id, "");
});
