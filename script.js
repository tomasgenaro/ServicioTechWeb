// Función que se ejecuta al cargar la página
window.onload = function() {

    // Clase para manejar el carrusel de imágenes
    class Carrusel {
        constructor(selector) {
            this.imagenes = document.querySelectorAll(selector + ' img');
            this.indiceActual = 0;
            this.intervalo = 3000; // Intervalo de transición en milisegundos
            this.iniciarCarrusel();
            this.agregarControles();
        }

        mostrarImagen(indice) {
            this.imagenes.forEach((img, i) => {
                img.style.opacity = (i === indice) ? 1 : 0;
            });
        }

        siguienteImagen() {
            this.indiceActual = (this.indiceActual + 1) % this.imagenes.length;
            this.mostrarImagen(this.indiceActual);
        }

        imagenAnterior() {
            this.indiceActual = (this.indiceActual - 1 + this.imagenes.length) % this.imagenes.length;
            this.mostrarImagen(this.indiceActual);
        }

        iniciarCarrusel() {
            this.intervaloId = setInterval(() => this.siguienteImagen(), this.intervalo);
        }

        detenerCarrusel() {
            clearInterval(this.intervaloId);
        }

        reiniciarCarrusel() {
            this.detenerCarrusel();
            this.iniciarCarrusel();
        }

        agregarControles() {
            const botonSiguiente = document.querySelector('.carousel-next');
            const botonAnterior = document.querySelector('.carousel-prev');

            botonSiguiente.addEventListener('click', () => {
                this.siguienteImagen();
                this.reiniciarCarrusel();
            });

            botonAnterior.addEventListener('click', () => {
                this.imagenAnterior();
                this.reiniciarCarrusel();
            });
        }
    }

    // Inicializa el carrusel
    const miCarrusel = new Carrusel('.carousel');

    // Función para copiar texto al portapapeles usando Clipboard API
    function copiarTextoAlPortapapeles(texto) {
        navigator.clipboard.writeText(texto).then(() => {
            alert('Texto copiado al portapapeles');
        }).catch(err => {
            console.error('Error al copiar: ', err);
        });
    }

    // Función para agregar botones de copiar
    function agregarBotonCopiar(enlace, tipo) {
        const botonCopiar = document.createElement('button');
        botonCopiar.textContent = 'Copiar';
        botonCopiar.addEventListener('click', () => {
            const texto = enlace.textContent.trim();
            copiarTextoAlPortapapeles(texto);
            alert(`${tipo} copiado: ` + texto);
        });
        enlace.parentNode.insertBefore(botonCopiar, enlace.nextSibling);
    }

    // Agrega botones de copiar para teléfono y correo electrónico
    const enlaceTelefono = document.querySelector('.contact-info a[href^="tel:"]');
    agregarBotonCopiar(enlaceTelefono, 'Número de teléfono');

    const enlaceEmail = document.querySelector('.contact-info a[href^="mailto:"]');
    agregarBotonCopiar(enlaceEmail, 'Correo electrónico');

    // Manejo del comportamiento de la burbuja de audio
    const audioBubble = document.querySelector('.audio-bubble');
    const closeButton = audioBubble.querySelector('.close-button');

    audioBubble.addEventListener('click', function () {
        audioBubble.classList.toggle('expanded');
    });

    closeButton.addEventListener('click', function (e) {
        e.stopPropagation(); // Evita la propagación del evento para evitar reexpandir
        audioBubble.classList.remove('expanded');
    });
};