// 1. Llenar los SELECT al cargar la página
async function cargarOpciones() {
  try {
    const [resEst, resCur] = await Promise.all([
      fetch("/api/estudiantes"),
      fetch("/api/cursos"),
    ]);

    const estudiantes = await resEst.json();
    const cursos = await resCur.json();

    const selectEst = document.getElementById("select-estud");
    const selectCur = document.getElementById("select-curso");

    // Llenar Estudiantes (Nota: usamos codigo_estudiante en minúsculas)
    selectEst.innerHTML = '<option value="">Selecciona Estudiante</option>';
    estudiantes.forEach((est) => {
      selectEst.innerHTML += `<option value="${est.codigo_estudiante}">${est.nombre}</option>`;
    });

    // Llenar Cursos (Nota: usamos codigo_curso en minúsculas)
    selectCur.innerHTML = '<option value="">Selecciona Curso</option>';
    cursos.forEach((cur) => {
      selectCur.innerHTML += `<option value="${cur.codigo_curso}">${cur.nombre_curso}</option>`;
    });
  } catch (error) {
    console.error("Error al cargar datos:", error);
  }
}

document
  .getElementById("btn-matricular")
  .addEventListener("click", async () => {
    // 1. CAPTURAMOS LOS ELEMENTOS COMPLETOS (para poder resetearlos después)
    const elEstudiante = document.getElementById("select-estud");
    const elCurso = document.getElementById("select-curso");

    // 2. EXTRAEMOS LOS VALORES PARA EL FETCH
    const idEst = elEstudiante.value;
    const idCur = elCurso.value;

    if (!idEst || !idCur) return alert("Selecciona ambos campos");

    try {
      const res = await fetch("/api/matricular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo_estudiante: idEst,
          codigo_curso: idCur,
        }),
      });

      const data = await res.json(); //capturqamos la respuesta del servidor (puede ser un mensaje o el objeto creado)

      if (res.ok) {
        alert("🎉 ¡Matrícula guardada correctamente!");

        // --- AHORA SÍ EL RESET FUNCIONARÁ ---
        // Usamos las variables que definimos al principio (elEstudiante y elCurso)
        elEstudiante.value = "";
        elCurso.value = "";
        // --- ACTUALIZAMOS LA TABLA ---
        console.log("Actualizando tabla...");
        await listarEstudiantes();
        registrarAccion(`🟢 Un Nuevo Matriculado`); // <--- AGREGAR ESTO
      } else {
        // Si el servidor responde con un error, mostramos el mensaje que nos dio
        alert("⭕" + data.error);
      }
    } catch (error) {
      console.error("Error en el proceso:", error);
    }
  });

async function listarEstudiantes() {
  try {
    const res = await fetch("/api/estudiantesMATRI");
    const datos = await res.json();

    const tabla = document.getElementById("tabla-cuerpo");
    if (!tabla) return;
    tabla.innerHTML = ""; // Limpiamos el "Cargando..."
    datos.forEach((reg) => {
      // Creamos una fila por cada estudiante
      console.log("Datos de un estudiante:", reg);
      const fila = `
                <tr>
                    <td>EST0${reg.codigo_estudiante}</td>
                    <td>${reg.nombre_estudiante}</td>
                    <td>CUR0${reg.codigo_curso}</td>
                    <td>${reg.nombre_curso}</td>
                    <td>${new Date(reg.fecha_registro).toLocaleString()}</td>
                    <td>
                        <button class="btn-delete" onclick="eliminarMatricula(${reg.codigo_matricula})"><img src="../icons/icon_basura.png" alt=""></button>
                    </td>
                </tr>
            `;

      tabla.innerHTML += fila;
    });

    console.log("✅ Tabla de estudiantes actualizada");
  } catch (error) {
    console.error("❌ Error al llenar la tabla:", error);
  }
}

async function eliminarMatricula(id) {
  // 1. Preguntamos al usuario para evitar errores
  if (!confirm("¿Estás seguro de que deseas eliminar esta matrícula?")) return;

  try {
    const res = await fetch(`/api/eliminar-matricula/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      // 🚨 AQUÍ ESTÁ EL SECRETO:
      // En lugar de F5, simplemente refrescamos los datos en pantalla
      await listarEstudiantes();
      registrarAccion(`🗑️ Se Eliminó la matrícula con ID: ${id}`);
    } else {
      alert("Error al intentar eliminar");
    }
  } catch (error) {
    console.error("Error en la petición:", error);
  }
}

window.onload = () => {
  listarEstudiantes();
  cargarOpciones();
  registrarAccion(`🔄 Ingresó a la sección de Matrículas`);
};
