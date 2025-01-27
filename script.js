window.onload = function() {
    // Clase para manejar el carrusel de imágenes
    class Carrusel {
        constructor(selector) {
            // Selecciona todas las imágenes dentro del elemento del carrusel
            this.imagenes = document.querySelectorAll(selector + ' img');
            this.indiceActual = 0; // Índice de la imagen actualmente visible
            this.intervalo = 3000; // Intervalo de tiempo para el deslizamiento automático (en milisegundos)
            this.iniciarCarrusel(); // Inicia el carrusel automáticamente
            this.agregarControles(); // Agrega los controles de navegación al carrusel
            this.agregarIndicadores(); // Agrega los indicadores (puntos) al carrusel
            this.iniciarDeslizamiento(); // Habilita el deslizamiento por toques en dispositivos móviles
        }

        // Muestra la imagen en el índice proporcionado
        mostrarImagen(indice) {
            this.imagenes.forEach((img, i) => {
                img.style.opacity = (i === indice) ? 1 : 0; // Cambia la opacidad de las imágenes
            });
            this.actualizarIndicadores(); // Actualiza los indicadores según la imagen actual
        }

        // Avanza a la siguiente imagen
        siguienteImagen() {
            this.indiceActual = (this.indiceActual + 1) % this.imagenes.length;
            this.mostrarImagen(this.indiceActual);
        }

        // Muestra la imagen anterior
        imagenAnterior() {
            this.indiceActual = (this.indiceActual - 1 + this.imagenes.length) % this.imagenes.length;
            this.mostrarImagen(this.indiceActual);
        }

        // Inicia el carrusel con el intervalo de tiempo establecido
        iniciarCarrusel() {
            this.intervaloId = setInterval(() => this.siguienteImagen(), this.intervalo);
        }

        // Detiene el carrusel
        detenerCarrusel() {
            clearInterval(this.intervaloId);
        }

        // Reinicia el carrusel (detiene y vuelve a iniciar)
        reiniciarCarrusel() {
            this.detenerCarrusel();
            this.iniciarCarrusel();
        }

        // Agrega los botones de control (siguiente y anterior)
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

        // Agrega los indicadores (puntos) al carrusel
        agregarIndicadores() {
            const indicadores = document.querySelector('.carousel-indicators');
            this.imagenes.forEach((_, i) => {
                const indicador = document.createElement('button');
                indicador.addEventListener('click', () => {
                    this.indiceActual = i;
                    this.mostrarImagen(this.indiceActual);
                    this.reiniciarCarrusel();
                });
                indicadores.appendChild(indicador);
            });
            this.actualizarIndicadores(); // Inicializa los indicadores
        }

        // Actualiza el estado de los indicadores (puntos) según la imagen actual
        actualizarIndicadores() {
            const indicadores = document.querySelectorAll('.carousel-indicators button');
            indicadores.forEach((btn, i) => {
                btn.classList.toggle('active', i === this.indiceActual);
            });
        }

        // Habilita el deslizamiento por toques en dispositivos móviles
        iniciarDeslizamiento() {
            let startX, endX;

            // Maneja el inicio del toque
            const handleTouchStart = (e) => {
                startX = e.touches[0].clientX;
            };

            // Maneja el movimiento del toque
            const handleTouchMove = (e) => {
                endX = e.touches[0].clientX;
            };

            // Maneja el fin del toque
            const handleTouchEnd = () => {
                if (startX - endX > 50) {
                    this.siguienteImagen();
                } else if (endX - startX > 50) {
                    this.imagenAnterior();
                }
                this.reiniciarCarrusel();
            };

            const carouselContainer = document.querySelector('.carousel');
            carouselContainer.addEventListener('touchstart', handleTouchStart);
            carouselContainer.addEventListener('touchmove', handleTouchMove);
            carouselContainer.addEventListener('touchend', handleTouchEnd);
        }
    }

    // Inicializa el carrusel con el selector '.carousel'
    const miCarrusel = new Carrusel('.carousel');

    // Copia texto al portapapeles y muestra una notificación
    function copiarTextoAlPortapapeles(texto, boton) {
        navigator.clipboard.writeText(texto).then(() => {
            mostrarToast('Texto copiado al portapapeles');
            boton.textContent = 'Copiado'; // Cambia el texto del botón
            setTimeout(() => {
                boton.textContent = 'Copiar'; // Restaura el texto después de 3 segundos
            }, 3000);
        }).catch(err => {
            console.error('Error al copiar: ', err);
            mostrarToast('Error al copiar texto');
        });
    }

    // Agrega un botón de copiar al enlace
    function agregarBotonCopiar(enlace, tipo) {
        const botonCopiar = document.createElement('button');
        botonCopiar.textContent = 'Copiar';
        botonCopiar.addEventListener('click', () => {
            const texto = enlace.textContent.trim();
            copiarTextoAlPortapapeles(texto, botonCopiar);
        });
        enlace.parentNode.insertBefore(botonCopiar, enlace.nextSibling);
    }

    // Agrega botón de copiar al enlace de teléfono
    const enlaceTelefono = document.querySelector('.contact-info a[href^="tel:"]');
    if (enlaceTelefono) {
        agregarBotonCopiar(enlaceTelefono, 'Número de teléfono');
    }

    // Agrega botón de copiar al enlace de email
    const enlaceEmail = document.querySelector('.contact-info a[href^="mailto:"]');
    if (enlaceEmail) {
        agregarBotonCopiar(enlaceEmail, 'Correo electrónico');
    }

    let toastTimeout;
    // Muestra una notificación temporal
    function mostrarToast(mensaje) {
        clearTimeout(toastTimeout);

        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast hide'; // Inicialmente oculto
            document.body.appendChild(toast);
        }

        toast.textContent = mensaje;

        // Forzar un reflow para aplicar la transición desde el estado inicial
        toast.offsetHeight;

        toast.classList.remove('hide');
        toast.classList.add('show');

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            toast.classList.add('hide');
            setTimeout(() => {
                if (!document.querySelector('.toast.show')) {
                    document.body.removeChild(toast);
                }
            }, 500);
        }, 3000);
    }

    // Maneja la burbuja de audio
    const audioBubble = document.querySelector('.audio-bubble');
    const closeButton = audioBubble ? audioBubble.querySelector('.close-button') : null;

    if (audioBubble) {
        audioBubble.addEventListener('click', function () {
            audioBubble.classList.toggle('expanded');
        });

        if (closeButton) {
            closeButton.addEventListener('click', function (e) {
                e.stopPropagation();
                audioBubble.classList.remove('expanded');
            });
        }

        document.addEventListener('click', function (e) {
            if (!audioBubble.contains(e.target) && audioBubble.classList.contains('expanded')) {
                audioBubble.classList.remove('expanded');
            }
        });
    }
};

// vacia automáticamente el formulario después de enviarlo
document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");

    form.addEventListener("submit", function(event) {
        setTimeout(() => {
            form.reset();  // Vacía el formulario después de enviarlo
        }, 500);  // Pequeño retraso para asegurar que se envíe correctamente antes de vaciar
    });
});
