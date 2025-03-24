document.addEventListener("DOMContentLoaded", function () {
    // Clase Carrusel (sin cambios)
    class Carrusel {
        constructor(selector) {
            this.imagenes = document.querySelectorAll(selector + ' img');
            this.indiceActual = 0;
            this.intervalo = 3000;
            this.iniciarCarrusel();
            this.agregarControles();
            this.agregarIndicadores();
            this.iniciarDeslizamiento();
        }

        mostrarImagen(indice) {
            this.imagenes.forEach((img, i) => {
                img.style.opacity = i === indice ? 1 : 0;
            });
            this.actualizarIndicadores();
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
            document.querySelector('.carousel-next')?.addEventListener('click', () => {
                this.siguienteImagen();
                this.reiniciarCarrusel();
            });

            document.querySelector('.carousel-prev')?.addEventListener('click', () => {
                this.imagenAnterior();
                this.reiniciarCarrusel();
            });
        }

        agregarIndicadores() {
            const indicadores = document.querySelector('.carousel-indicators');
            if (!indicadores) return;

            indicadores.innerHTML = "";
            this.imagenes.forEach((_, i) => {
                const indicador = document.createElement('button');
                indicador.addEventListener('click', () => {
                    this.indiceActual = i;
                    this.mostrarImagen(this.indiceActual);
                    this.reiniciarCarrusel();
                });
                indicadores.appendChild(indicador);
            });
            this.actualizarIndicadores();
        }

        actualizarIndicadores() {
            document.querySelectorAll('.carousel-indicators button').forEach((btn, i) => {
                btn.classList.toggle('active', i === this.indiceActual);
            });
        }

        iniciarDeslizamiento() {
            let startX, endX;
            const umbral = 50;
            const carouselContainer = document.querySelector('.carousel');

            carouselContainer?.addEventListener('touchstart', (e) => startX = e.touches[0].clientX);
            carouselContainer?.addEventListener('touchmove', (e) => endX = e.touches[0].clientX);
            carouselContainer?.addEventListener('touchend', () => {
                if (!endX) return;
                if (startX - endX > umbral) this.siguienteImagen();
                else if (endX - startX > umbral) this.imagenAnterior();
                this.reiniciarCarrusel();
            });
        }
    }

    new Carrusel('.carousel');

    // Funciones para copiar texto al portapapeles (sin cambios)
    async function copiarTextoAlPortapapeles(texto, boton) {
        try {
            await navigator.clipboard.writeText(texto);
            mostrarToast('Texto copiado al portapapeles');
            boton.textContent = 'Copiado';
            setTimeout(() => boton.textContent = 'Copiar', 3000);
        } catch (err) {
            console.error('Error al copiar: ', err);
            mostrarToast('Error al copiar texto');
        }
    }

    function agregarBotonCopiar(enlace) {
        if (!enlace) return;
        const botonCopiar = document.createElement('button');
        botonCopiar.textContent = 'Copiar';
        botonCopiar.addEventListener('click', () => copiarTextoAlPortapapeles(enlace.textContent.trim(), botonCopiar));
        enlace.parentNode.insertBefore(botonCopiar, enlace.nextSibling);
    }

    agregarBotonCopiar(document.querySelector('.contact-info a[href^="tel:"]'));
    agregarBotonCopiar(document.querySelector('.contact-info a[href^="mailto:"]'));

    // Función para mostrar toasts (sin cambios)
    let toastTimeout;
    function mostrarToast(mensaje) {
        clearTimeout(toastTimeout);
        let toast = document.querySelector('.toast') || document.createElement('div');
        toast.className = 'toast hide';
        toast.textContent = mensaje;
        document.body.appendChild(toast);
        toast.offsetHeight;
        toast.classList.replace('hide', 'show');

        toastTimeout = setTimeout(() => {
            toast.classList.replace('show', 'hide');
            setTimeout(() => document.body.removeChild(toast), 500);
        }, 3000);
    }

    // Manejador de la burbuja de audio (sin cambios)
    const audioBubble = document.querySelector('.audio-bubble');
    if (audioBubble) {
        audioBubble.addEventListener('click', () => audioBubble.classList.toggle('expanded'));
        audioBubble.querySelector('.close-button')?.addEventListener('click', (e) => {
            e.stopPropagation();
            audioBubble.classList.remove('expanded');
        });
        document.addEventListener('click', (e) => {
            if (!audioBubble.contains(e.target)) audioBubble.classList.remove('expanded');
        });
    }

    // Manejador de envío de formulario con Formspree
const form = document.getElementById('contact-form');
if (form) {
    form.addEventListener("submit", function (event) {
        // No prevenir el envío si Formspree está funcionando
        event.preventDefault();

        // Asegúrate de que los datos del formulario se están enviando correctamente
        const formData = new FormData(form);

        // Verificar los datos antes de enviarlos
        formData.forEach((value, key) => {
            console.log(`${key}: ${value}`);
        });

        // Enviar el formulario usando fetch
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json' // Asegúrate de que Formspree acepte la solicitud
            }
        })
        .then(response => {
            // Comprobamos la respuesta del servidor
            if (response.ok) {
                mostrarToast('Mensaje enviado correctamente');
                form.reset();
            } else {
                console.error('Error al enviar el mensaje:', response.statusText);
                mostrarToast('Error al enviar el mensaje');
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
            mostrarToast('Error al enviar el mensaje');
        });
    });
  }
});
