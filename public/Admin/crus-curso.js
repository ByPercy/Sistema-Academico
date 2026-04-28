/////////////////////////////////////////
///////////ABRIR VENTANA MODAL//////////
///////////////////////////////////////

const btnAbrir = document.getElementById("Agregar-estud");
const btnCerrar = document.getElementById("Cerrarmod");
const modal = document.getElementById("Overley");
const btnCancelar = document.getElementById("Cancelar");

//FUNCION PARA ABRIR VENTANA MODAL//
btnAbrir.addEventListener("click", () => {
  modal.style.display = "flex";
});

//FUNCION PARA CERRAR VENTANA MODAL//
btnCerrar.addEventListener("click", () => {
  modal.style.display = "none";
});

//FUNCION PARA CERRAR VENTANA BOTON CANCELAR//
btnCancelar.addEventListener("click", () => {
  modal.style.display = "none";
});

/////////////////////////////////////////
/////////////TABALA CURSOS//////////////
///////////////////////////////////////

async function ListarCursos() {
  try {
    const res = await fetch("/api/Cursos");
    const cursos = await res.json();

    const tabla = document.getElementById("tabla-cuerpo");
    tabla.innerHTML = ""; // Limpiamos el "Cargando..."

    cursos.forEach((cur) => {
      // Creamos una fila por cada curso
      console.log("Datos de un curso:", cur);
      const fila = `
                <tr>
                    <td>CUR0${cur.codigo_curso}</td>
                    <td>${cur.nombre_curso}</td>
                    <td>${cur.credito}</td>
                    <td>${cur.nombre}</td>
                    <td>${cur.horario}</td>
                    <td>${cur.estado}</td>
                    <td>
                        <button onclick="editarCurso(${cur.codigo_curso})"><img src="../icons/icon_lapiz_negro.png" alt=""></button> 
                        <button onclick="eliminarCurso(${cur.codigo_curso})"><img src="../icons/icon_basura.png" alt=""></button>
                    </td>
                </tr>
            `;
      tabla.innerHTML += fila;
    });
    console.log("✅ Tabla de cursos actualizada");
  } catch (error) {
    console.error("❌ Error al llenar la tabla:", error);
  }
}

async function cargarOpciones() {
  try {
    const [resDocen] = await Promise.all([fetch("/api/docentes")]);

    const docentes = await resDocen.json();

    const selectDocen = document.getElementById("Seleccion-Docente");

    selectDocen.innerHTML = '<option value="">Seleccione un docente</option>';

    docentes.forEach((docent) => {
      selectDocen.innerHTML += `<option value="${docent.codigo_docente}">${docent.nombre}</option>`;
    });
  } catch (error) {
    console.error("❌ Error al cargar opciones:", error);
  }
}

window.onload = function () {
  ListarCursos();
  cargarOpciones();
  registrarAccion(`📚 Ingresó a la sección de Cursos`);
};

/////////////////////////////////////////
///////////AGREGAR CURSO/////////////
///////////////////////////////////////
document.getElementById("Registro").addEventListener("click", async () => {
  // Capturamos todos los valores
  const datos = {
    nombre_curso: document.getElementById("nombre").value,
    credito: document.getElementById("creditos").value,
    codigo_docente: document.getElementById("Seleccion-Docente").value,
    horario: document.getElementById("horario").value,
    estado: document.getElementById("estado").value,
  };

  // Validación básica
  if (
    !datos.nombre_curso ||
    !datos.credito ||
    !datos.codigo_docente ||
    !datos.horario ||
    !datos.estado
  ) {
    return alert("Por favor, llena los campos obligatorios.");
  }

  try {
    const res = await fetch("/api/agregar-curso", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos), // Enviamos el objeto completo
    });

    if (res.ok) {
      alert("¡Curso guardado en el sistema!");
      // Limpiar todos los campos después de guardar
      document.querySelectorAll("input").forEach((i) => (i.value = ""));
      modal.style.display = "none"; // Cerramos el modal
      ListarCursos(); // Actualizamos la tabla
      registrarAccion(`✅ Se agregó al curso: ${datos.nombre_curso}`);
    }
  } catch (error) {
    console.error("Error al conectar:", error);
  }
});

/////////////////////////////////////////
/////////////ELIMINAR CURSO/////////////
///////////////////////////////////////

async function eliminarCurso(id) {
  if (confirm("¿Estás seguro de eliminar este curso?")) {
    fetch(`/api/eliminar-curso/${id}`, { method: "DELETE" }).then((res) => {
      if (res.ok) {
        ListarCursos(); // Actualizamos la tabla después de eliminar
        registrarAccion(`🗑️ Se Eliminó al curso con ID: ${id}`); // <--- AGREGAR ESTO
      }
    });
  }
}
