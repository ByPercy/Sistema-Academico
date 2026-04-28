const inputBusqueda = document.getElementById("inputBusqueda");
const tabla = document
  .getElementById("tabla-estudiantes")
  .getElementsByTagName("tr");

inputBusqueda.addEventListener("keyup", function () {
  const texto = inputBusqueda.value.toLowerCase(); // Convertimos a minúsculas para que no importe si escriben "JUAN" o "juan"

  // Iniciamos en 1 para saltarnos el encabezado -->"thead"
  for (let i = 1; i < tabla.length; i++) {
    let mostrarFila = false;
    const celdas = tabla[i].getElementsByTagName("td");

    // Revisamos cada celda de la fila
    for (let j = 0; j < celdas.length; j++) {
      if (celdas[j].innerText.toLowerCase().indexOf(texto) > -1) {
        mostrarFila = true;
        break; // Si encontró coincidencia en una celda, no hace falta revisar las demás
      }
    }

    // Mostramos u ocultamos la fila
    tabla[i].style.display = mostrarFila ? "" : "none";
  }
});
