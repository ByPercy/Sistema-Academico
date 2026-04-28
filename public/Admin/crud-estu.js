async function listarEstudiantes() {
  try {
    const res = await fetch("/api/estudiantes");
    const estudiantes = await res.json();

    const tabla = document.getElementById("tabla-cuerpo");
    tabla.innerHTML = ""; // Limpiamos el "Cargando..."

    estudiantes.forEach((est) => {
      // Creamos una fila por cada estudiante
      console.log("Datos de un estudiante:", est);
      const fila = `
                <tr>
                    <td>EST0${est.codigo_estudiante}</td>
                    <td>${est.nombre}</td>
                    <td>${est.correo}</td>
                    <td>${est.telefono}</td>
                    <td>${est.estado}</td>
                    <td>
                        <button onclick="editarEstudiante(${est.codigo_estudiante})"><img src="../icons/icon_lapiz_negro.png" alt=""></button>
                        <button onclick="eliminarEstudiante(${est.codigo_estudiante})"><img src="../icons/icon_basura.png" alt=""></button>
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

// No olvides llamar a la función cuando cargue la página
window.onload = () => {
  listarEstudiantes(); // La nueva
  registrarAccion(`🧑‍🎓 Ingresó a la sección de Estudiantes`);
};

/////////////////////////////////////////
/////ABRIR VENTANA MODAL REGISTRO///////
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

//FUNCION PARA CERRAR VENTANA MODAL AL HACER CLICK FUERA DE ELLA//
/*window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});*/

/////////////////////////////////////////
//////ABRIR VENTANA MODAL EDITAR////////
///////////////////////////////////////

let idSeleccionado = null; // Variable global para almacenar el ID del estudiante seleccionado
async function editarEstudiante(id) {
  idSeleccionado = id; // Guardamos el ID del estudiante que queremos editar

  const res = await fetch(`/api/estudiantes/${id}`); // Obtenemos los datos del estudiante seleccionado
  const datos = await res.json();

  document.getElementById("nombre-edit").value = datos.nombre;
  document.getElementById("correo-edit").value = datos.correo;
  document.getElementById("telefono-edit").value = datos.telefono;
  document.getElementById("estado-edit").value = datos.estado;

  document.getElementById("Overley-Editar").style.display = "flex"; // Abrimos el modal de edición
}

const btnCerrarEdit = document.getElementById("Cancelar-Edit");
const btnequis = document.getElementById("Cerraredit");

btnCerrarEdit.addEventListener("click", () => {
  document.getElementById("Overley-Editar").style.display = "none"; // Cerramos el modal de edición
});

btnequis.addEventListener("click", () => {
  document.getElementById("Overley-Editar").style.display = "none"; // Cerramos el modal de edición
});

/////////////////////////////////////////
/////////////GUARDAR EDICION////////////
///////////////////////////////////////

const btnGuardarEdit = document.getElementById("Editar");
btnGuardarEdit.addEventListener("click", async () => {
  const nombreEditado = document.getElementById("nombre-edit").value;

  const datosEditados = {
    nombre: document.getElementById("nombre-edit").value,
    correo: document.getElementById("correo-edit").value,
    telefono: document.getElementById("telefono-edit").value,
    estado: document.getElementById("estado-edit").value,
  };

  try {
    const res = await fetch(`/api/editar-estudiantes/${idSeleccionado}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosEditados),
    });

    if (res.ok) {
      alert("¡Estudiante actualizado correctamente!");
      document.getElementById("Overley-Editar").style.display = "none";
      listarEstudiantes(); // Actualizamos la tabla para reflejar los cambios
      registrarAccion(`✏️ Se actualizó al estudiante con ID: ${nombreEditado}`);
    } else {
      alert("Error al actualizar el estudiante.");
    }
  } catch (error) {
    console.error("Error al conectar:", error);
  }
});

/////////////////////////////////////////
///////////GUARDAR ESTUDIANTE///////////
///////////////////////////////////////
document.getElementById("Registro").addEventListener("click", async () => {
  // Capturamos todos los valores
  const datos = {
    nombre: document.getElementById("nombre").value,
    correo: document.getElementById("correo").value,
    telefono: document.getElementById("telefono").value,
    estado: document.getElementById("estado").value,
  };

  // Validación básica
  if (!datos.nombre || !datos.correo) {
    return alert("Por favor, llena los campos obligatorios.");
  }

  try {
    const res = await fetch("/api/agregar-estudiante", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos), // Enviamos el objeto completo
    });

    if (res.ok) {
      alert("¡Estudiante guardado en el sistema!"); // Limpiar todos los campos después de guardar
      document.querySelectorAll("input").forEach((i) => (i.value = ""));
      modal.style.display = "none"; // Cerramos el modal
      listarEstudiantes(); // Actualizamos la tabla
      registrarAccion(`✅ Se agregó al estudiante: ${datos.nombre}`);
    }
  } catch (error) {
    console.error("Error al conectar:", error);
  }
});

/////////////////////////////////////////
///////////ELIMINAR ESTUDIANTE//////////
///////////////////////////////////////
function eliminarEstudiante(id) {
  if (confirm("¿Estás seguro de eliminar este estudiante?")) {
    fetch(`/api/eliminar-estudiante/${id}`, { method: "DELETE" }).then(
      (res) => {
        if (res.ok) {
          listarEstudiantes(); // Actualizamos la tabla
          registrarAccion(`🗑️ Se Eliminó al estudiante con ID: ${id}`); // <--- AGREGAR ESTO
        }
      },
    );
  }
}
