async function listarDocentes() {
  try {
    const res = await fetch("/api/docentes");
    const docentes = await res.json();

    const tabla = document.getElementById("tabla-cuerpo");
    tabla.innerHTML = ""; // Limpiamos el "Cargando..."

    docentes.forEach((doc) => {
      // Creamos una fila por cada docente
      console.log("Datos de un docente:", doc);
      const fila = `
                <tr>
                    <td>DOC0${doc.codigo_docente}</td>
                    <td>${doc.nombre}</td>
                    <td>${doc.correo}</td>
                    <td>${doc.telefono}</td>
                    <td>${doc.especialidad}</td>
                    <td>${doc.estado}</td>
                    <td>
                        <button onclick="editarDocente(${doc.codigo_docente})"><img src="../icons/icon_lapiz_negro.png" alt=""></button>
                        <button onclick="eliminarDocente(${doc.codigo_docente})"><img src="../icons/icon_basura.png" alt=""></button>
                    </td>
                </tr>
            `;
      tabla.innerHTML += fila;
    });
    console.log("✅ Tabla de docentes actualizada");
  } catch (error) {
    console.error("❌ Error al llenar la tabla:", error);
  }
}

// No olvides llamar a la función cuando cargue la página
window.onload = () => {
  listarDocentes(); // La nueva
  registrarAccion(`🧑‍🏫 Ingresó a la sección de Docentes`);
};

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

//////////////////////////////////////////
///////ABRIR VENTANA MODAL EDITAR////////
////////////////////////////////////////

let idSeleccionado = null; // Variable global para almacenar el ID del estudiante seleccionado
async function editarDocente(id) {
  idSeleccionado = id; // Guardamos el ID del estudiante que queremos editar

  const res = await fetch(`/api/docentes/${id}`); // Obtenemos los datos del docente seleccionado
  const datos = await res.json();

  document.getElementById("nombre-edit").value = datos.nombre;
  document.getElementById("especialidad-edit").value = datos.especialidad;
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
/////AGREGAR DOCENTE A BASE DE DATOS////
///////////////////////////////////////

document.getElementById("Registro").addEventListener("click", async () => {
  const datos = {
    nombre: document.getElementById("nombre").value,
    correo: document.getElementById("correo").value,
    telefono: document.getElementById("telefono").value,
    especialidad: document.getElementById("especialidad").value,
    estado: document.getElementById("estado").value,
  };

  if (
    !datos.nombre ||
    !datos.correo ||
    !datos.telefono ||
    !datos.especialidad ||
    !datos.estado
  ) {
    alert("Por favor, completa todos los campos.");
    return; //RETORNAMOS EL MENSAJE CADA QUE NO SE COMPLETE UN CAMPO
  }

  try {
    const res = await fetch("/api/agregar-docente", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    });

    if (res.ok) {
      alert("Docente agregado correctamente");

      modal.style.display = "none";
      listarDocentes(); // Actualizamos la tabla después de agregar
      registrarAccion(`✅ Se agregó al docente: ${datos.nombre}`);
    }
  } catch (error) {
    alert.error("Error al agregar el docente");
  }
});

const btnGuardarEdit = document.getElementById("Editar");

btnGuardarEdit.addEventListener("click", async () => {
  const nombreEditado = document.getElementById("nombre-edit").value;

  const datosEditados = {
    nombre: document.getElementById("nombre-edit").value,
    especialidad: document.getElementById("especialidad-edit").value,
    correo: document.getElementById("correo-edit").value,
    telefono: document.getElementById("telefono-edit").value,
    estado: document.getElementById("estado-edit").value,
  };

  try {
    const res = await fetch(`/api/editar-docentes/${idSeleccionado}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datosEditados),
    });

    if (res.ok) {
      alert("¡Docente actualizado correctamente!");
      document.getElementById("Overley-Editar").style.display = "none";
      listarDocentes(); // Actualizamos la tabla para reflejar los cambios
      registrarAccion(`✏️ Se actualizó al docente con ID: ${nombreEditado}`);
    } else {
      alert("Error al actualizar el docente.");
    }
  } catch (error) {
    console.error("Error al conectar:", error);
  }
});

/////////////////////////////////////////
///////////ELIMINAR DOCENTE/////////////
///////////////////////////////////////

async function eliminarDocente(id) {
  if (confirm("¿Estás seguro de eliminar este docente?")) {
    fetch(`/api/eliminar-docente/${id}`, { method: "DELETE" }).then((res) => {
      if (res.ok) {
        listarDocentes(); // Actualizamos la tabla después de eliminar
        registrarAccion(`🗑️ Se Eliminó al docente con ID: ${id}`); // <--- AGREGAR ESTO
      }
    });
  }
}
