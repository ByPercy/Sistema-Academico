async function actualizarContador() {
  try {
    const res = await fetch("/api/total-estudiantes");
    const data = await res.json();

    console.log("📊 Datos recibidos de la DB:", data);

    const txtContador = document.getElementById("Cont_estud");

    if (txtContador) {
      // Usamos textContent para asegurar que se escriba sobre el "Cargando..."
      txtContador.textContent = data.total;
    }
  } catch (error) {
    console.error("❌ Error al pedir datos:", error);
  }
}

async function actualizarContadorCursos() {
  try {
    const res = await fetch("/api/total-cursos");
    const data = await res.json();

    const txtContador = document.getElementById("Cont_cursos");

    if (txtContador) {
      txtContador.textContent = data.total;
    }
  } catch (error) {
    console.error("❌ Error al pedir datos:", error);
  }
}

async function actualizarContadorDocentes() {
  //CODIGO MAS LIMPIO SIN TRY CATCH, SI HAY ERROR SE MOSTRARA EN LA CONSOLA//
  const res = await fetch("/api/total-docentes");
  const data = await res.json();

  const txtContador = document.getElementById("Cont_docentes");

  if (txtContador) {
    txtContador.textContent = data.total;
  }
}

// Supongamos que esta es tu función que trae los datos
async function porcetaje() {
  const res = await fetch("/api/estudiantes");
  const estudiantes = await res.json();

  //Calculamos el total y los aprobados
  const total = estudiantes.length;
  const aprobados = estudiantes.filter(
    (est) => est.estado === "Aprobado",
  ).length;

  //Calculamos el porcentaje (evitando dividir por cero si la tabla está vacía)
  const porcentaje = total > 0 ? ((aprobados / total) * 100).toFixed(1) : 0;

  //Lo mostramos en un elemento de tu UI
  document.getElementById("tasa-aprobacion").innerText = `${porcentaje}%`;
}

//Al iniciar, intenta cargar lo que haya en LocalStorage
let historialAcciones = JSON.parse(localStorage.getItem("historial")) || [];

function registrarAccion(mensaje) {
  const ahora = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const nuevaAccion = `[${ahora}] ${mensaje}`;

  historialAcciones.unshift(nuevaAccion);

  if (historialAcciones.length > 8) {
    historialAcciones.pop();
  }

  //Guardamos el array actualizado en LocalStorage
  localStorage.setItem("historial", JSON.stringify(historialAcciones));

  actualizarVistaHistorial();
}

function actualizarVistaHistorial() {
  const listaUI = document.getElementById("lista-actividad");

  // Limpiamos y volvemos a dibujar
  listaUI.innerHTML = historialAcciones
    .map(
      (accion) =>
        `<li style="border-bottom: 2px solid #0c0c0c80; margin-bottom: 3px;">${accion}</li>`,
    )
    .join("");
}

window.onload = function () {
  registrarAccion("📊 Inicio Dashboard");
  porcetaje();
  actualizarContador();
  actualizarContadorCursos();
  actualizarContadorDocentes();
};
