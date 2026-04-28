document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const usuario = document.querySelector('input[type="text"]').value;
    const password = document.querySelector('input[type="password"]').value;
    const rol = document.querySelector("select").value;

    if (usuario === "admin" && password === "1234" && rol === "Administrador") {
      alert("Bienvenido Administrador");
      window.location.href = "/../Admin/admin.html";
    } else if (
      usuario === "docente" &&
      password === "1234" &&
      rol === "Docente"
    ) {
      alert("Bienvenido Docente");
      window.location.href = "/public/Profesor/docente.html";
    } else if (
      usuario === "estudiante" &&
      password === "1234" &&
      rol === "Estudiante"
    ) {
      alert("Bienvenido Estudiante");
      window.location.href = "../public/Estudiante/estudiante.html";
    } else {
      alert("Usuario, contraseña o rol incorrecto");
    }
  });
