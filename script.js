// Esta función se ejecuta cuando la página cargao completamente
window.onload = function() {

    // Selecciona todas las imágenes dentro del carrusel
    const imagenesCarousel = document.querySelectorAll('.carousel img');
    let indiceActual = 0; // Inicializa el índice de la imagen actual en 0

    // Función para mostrar una imagen específica del carrusel
    function mostrarImagen(indice) {
        imagenesCarousel.forEach((imagen, i) => {
            // Establece la opacidad de la imagen a 1 si es la imagen actual, de lo contrario a 0
            imagen.style.opacity = (i === indice) ? 1 : 0;
        });
    }

    // Función para mostrar la siguiente imagen en el carrusel
    function siguienteImagen() {
        // Incrementa el índice actual y usa el operador módulo para volver al inicio si es necesario
        indiceActual = (indiceActual + 1) % imagenesCarousel.length;
        // Muestra la nueva imagen actual
        mostrarImagen(indiceActual);
    }

    // Configura un intervalo para cambiar la imagen cada 3 segundos
    setInterval(siguienteImagen, 3000);

    // Función para copiar texto al portapapeles
    function copiarTextoAlPortapapeles(texto) {
        const areaTexto = document.createElement("textarea"); // Crea un elemento textarea
        document.body.appendChild(areaTexto); // Añade el textarea al cuerpo del documento
        areaTexto.value = texto; // Establece el valor del textarea al texto a copiar
        areaTexto.select(); // Selecciona el contenido del textarea
        document.execCommand("copy"); // Ejecuta el comando de copiar
        document.body.removeChild(areaTexto); // Elimina el textarea del documento
    }

    // Selecciona el enlace de teléfono en la sección de información de contacto
    const enlaceTelefono = document.querySelector('.contact-info a[href^="tel:"]');
    // Crea un botón para copiar el número de teléfono
    const botonCopiarTelefono = document.createElement('button');
    botonCopiarTelefono.textContent = 'Copiar'; // Establece el texto del botón
    botonCopiarTelefono.addEventListener('click', () => {
        // Al hacer clic, copia el texto del número de teléfono al portapapeles
        const numeroTelefono = enlaceTelefono.textContent.trim();
        copiarTextoAlPortapapeles(numeroTelefono);
        alert('Número de teléfono copiado: ' + numeroTelefono); // Muestra una alerta confirmando la copia
    });
    // Inserta el botón de copiar después del enlace de teléfono
    enlaceTelefono.parentNode.insertBefore(botonCopiarTelefono, enlaceTelefono.nextSibling);

    // Selecciona el enlace de correo electrónico en la sección de información de contacto
    const enlaceEmail = document.querySelector('.contact-info a[href^="mailto:"]');
    // Crea un botón para copiar el correo electrónico
    const botonCopiarEmail = document.createElement('button');
    botonCopiarEmail.textContent = 'Copiar'; // Establece el texto del botón
    botonCopiarEmail.addEventListener('click', () => {
        // Al hacer clic, copia el texto del correo electrónico al portapapeles
        const email = enlaceEmail.textContent.trim();
        copiarTextoAlPortapapeles(email);
        alert('Correo electrónico copiado: ' + email); // Muestra una alerta confirmando la copia
    });
    // Inserta el botón de copiar después del enlace de correo electrónico
    enlaceEmail.parentNode.insertBefore(botonCopiarEmail, enlaceEmail.nextSibling);
};
