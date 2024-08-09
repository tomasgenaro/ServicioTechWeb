window.onload = function() {
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
                img.style.opacity = (i === indice) ? 1 : 0;
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
            this.actualizarIndicadores();
        }

        actualizarIndicadores() {
            const indicadores = document.querySelectorAll('.carousel-indicators button');
            indicadores.forEach((btn, i) => {
                btn.classList.toggle('active', i === this.indiceActual);
            });
        }

        iniciarDeslizamiento() {
            let startX, endX;

            const handleTouchStart = (e) => {
                startX = e.touches[0].clientX;
            };

            const handleTouchMove = (e) => {
                endX = e.touches[0].clientX;
            };

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

    const miCarrusel = new Carrusel('.carousel');

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

    function agregarBotonCopiar(enlace, tipo) {
        const botonCopiar = document.createElement('button');
        botonCopiar.textContent = 'Copiar';
        botonCopiar.addEventListener('click', () => {
            const texto = enlace.textContent.trim();
            copiarTextoAlPortapapeles(texto, botonCopiar);
        });
        enlace.parentNode.insertBefore(botonCopiar, enlace.nextSibling);
    }

    const enlaceTelefono = document.querySelector('.contact-info a[href^="tel:"]');
    agregarBotonCopiar(enlaceTelefono, 'Número de teléfono');

    const enlaceEmail = document.querySelector('.contact-info a[href^="mailto:"]');
    agregarBotonCopiar(enlaceEmail, 'Correo electrónico');

    let toastTimeout;
    function mostrarToast(mensaje) {
        clearTimeout(toastTimeout);

        let toast = document.querySelector('.toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }

        toast.textContent = mensaje;
        toast.style.opacity = '1';

        toastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.style.opacity === '0') {
                    document.body.removeChild(toast);
                }
            }, 500);
        }, 3000);
    }

    const audioBubble = document.querySelector('.audio-bubble');
    const closeButton = audioBubble.querySelector('.close-button');

    audioBubble.addEventListener('click', function () {
        audioBubble.classList.toggle('expanded');
    });

    closeButton.addEventListener('click', function (e) {
        e.stopPropagation();
        audioBubble.classList.remove('expanded');
    });

    document.addEventListener('click', function (e) {
        if (!audioBubble.contains(e.target) && audioBubble.classList.contains('expanded')) {
            audioBubble.classList.remove('expanded');
        }
    });
};