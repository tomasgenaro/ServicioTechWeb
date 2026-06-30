document.addEventListener("DOMContentLoaded", function () {
    // Clase Carrusel
    class Carrusel {
        constructor(selector) {
            this.contenedor = document.querySelector(selector);
            this.imagenes = this.contenedor ? this.contenedor.querySelectorAll("img") : [];
            this.indiceActual = 0;
            this.intervalo = 3000;
            this.intervaloId = null;

            if (!this.contenedor || this.imagenes.length === 0) return;

            this.agregarControles();
            this.agregarIndicadores();
            this.iniciarDeslizamiento();
            this.mostrarImagen(this.indiceActual);
            this.iniciarAutoplayDiferido();
            this.optimizarEventosDePausa();
        }

        mostrarImagen(indice) {
            this.imagenes.forEach((img, i) => {
                const activa = i === indice;

                img.style.opacity = activa ? 1 : 0;
                img.setAttribute("aria-hidden", activa ? "false" : "true");
            });

            this.actualizarIndicadores();
        }

        siguienteImagen() {
            if (this.imagenes.length === 0) return;

            this.indiceActual = (this.indiceActual + 1) % this.imagenes.length;
            this.mostrarImagen(this.indiceActual);
        }

        imagenAnterior() {
            if (this.imagenes.length === 0) return;

            this.indiceActual = (this.indiceActual - 1 + this.imagenes.length) % this.imagenes.length;
            this.mostrarImagen(this.indiceActual);
        }

        iniciarCarrusel() {
            this.detenerCarrusel();
            this.intervaloId = setInterval(() => this.siguienteImagen(), this.intervalo);
        }

        detenerCarrusel() {
            if (this.intervaloId) {
                clearInterval(this.intervaloId);
                this.intervaloId = null;
            }
        }

        reiniciarCarrusel() {
            this.detenerCarrusel();
            this.iniciarCarrusel();
        }

        agregarControles() {
            const botonSiguiente = document.querySelector(".carousel-next");
            const botonAnterior = document.querySelector(".carousel-prev");

            botonSiguiente?.addEventListener("click", () => {
                this.siguienteImagen();
                this.reiniciarCarrusel();
            });

            botonAnterior?.addEventListener("click", () => {
                this.imagenAnterior();
                this.reiniciarCarrusel();
            });
        }

        agregarIndicadores() {
            const indicadores = document.querySelector(".carousel-indicators");
            if (!indicadores) return;

            indicadores.innerHTML = "";

            this.imagenes.forEach((_, i) => {
                const indicador = document.createElement("button");

                indicador.type = "button";
                indicador.setAttribute("aria-label", `Ver imagen ${i + 1}`);
                indicador.addEventListener("click", () => {
                    this.indiceActual = i;
                    this.mostrarImagen(this.indiceActual);
                    this.reiniciarCarrusel();
                });

                indicadores.appendChild(indicador);
            });

            this.actualizarIndicadores();
        }

        actualizarIndicadores() {
            const botones = document.querySelectorAll(".carousel-indicators button");

            botones.forEach((btn, i) => {
                const activo = i === this.indiceActual;

                btn.classList.toggle("active", activo);
                btn.setAttribute("aria-current", activo ? "true" : "false");
            });
        }

        iniciarDeslizamiento() {
            let startX = 0;
            let endX = 0;
            const umbral = 50;

            this.contenedor.addEventListener(
                "touchstart",
                (e) => {
                    startX = e.touches[0].clientX;
                    endX = startX;
                },
                { passive: true }
            );

            this.contenedor.addEventListener(
                "touchmove",
                (e) => {
                    endX = e.touches[0].clientX;
                },
                { passive: true }
            );

            this.contenedor.addEventListener("touchend", () => {
                const diferencia = startX - endX;

                if (Math.abs(diferencia) < umbral) return;

                if (diferencia > 0) {
                    this.siguienteImagen();
                } else {
                    this.imagenAnterior();
                }

                this.reiniciarCarrusel();

                startX = 0;
                endX = 0;
            });
        }

        iniciarAutoplayDiferido() {
            let autoplayIniciado = false;

            const iniciar = () => {
                if (autoplayIniciado) return;

                autoplayIniciado = true;
                this.iniciarCarrusel();
            };

            const iniciarPorInteraccion = () => {
                iniciar();

                window.removeEventListener("scroll", iniciarPorInteraccion);
                window.removeEventListener("touchstart", iniciarPorInteraccion);
                window.removeEventListener("click", iniciarPorInteraccion);
                window.removeEventListener("keydown", iniciarPorInteraccion);
            };

            window.addEventListener("scroll", iniciarPorInteraccion, { once: true, passive: true });
            window.addEventListener("touchstart", iniciarPorInteraccion, { once: true, passive: true });
            window.addEventListener("click", iniciarPorInteraccion, { once: true });
            window.addEventListener("keydown", iniciarPorInteraccion, { once: true });

            window.setTimeout(iniciar, 25000);
        }

        optimizarEventosDePausa() {
            this.contenedor.addEventListener("mouseenter", () => this.detenerCarrusel());
            this.contenedor.addEventListener("mouseleave", () => this.iniciarCarrusel());

            document.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    this.detenerCarrusel();
                } else {
                    this.iniciarCarrusel();
                }
            });
        }
    }

    new Carrusel(".carousel");

    // Función para mostrar notificaciones tipo toast
    let toastTimeout;

    function mostrarToast(mensaje) {
        clearTimeout(toastTimeout);

        let toast = document.querySelector(".toast");

        if (!toast) {
            toast = document.createElement("div");
            document.body.appendChild(toast);
        }

        toast.className = "toast hide";
        toast.textContent = mensaje;

        // Fuerza el reflow para reiniciar correctamente la animación.
        void toast.offsetHeight;

        toast.classList.replace("hide", "show");

        toastTimeout = setTimeout(() => {
            toast.classList.replace("show", "hide");

            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 500);
        }, 3000);
    }

    // Copiar texto al portapapeles
    async function copiarTextoAlPortapapeles(texto, boton) {
        const textoOriginalBoton = boton.textContent;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(texto);
            } else {
                copiarTextoConFallback(texto);
            }

            mostrarToast("Texto copiado al portapapeles");
            boton.textContent = "Copiado";

            setTimeout(() => {
                boton.textContent = textoOriginalBoton;
            }, 3000);
        } catch (err) {
            console.error("Error al copiar:", err);
            mostrarToast("Error al copiar texto");
        }
    }

    function copiarTextoConFallback(texto) {
        const textarea = document.createElement("textarea");

        textarea.value = texto;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.top = "-9999px";
        textarea.style.left = "-9999px";

        document.body.appendChild(textarea);
        textarea.select();

        const copiado = document.execCommand("copy");
        document.body.removeChild(textarea);

        if (!copiado) {
            throw new Error("No se pudo copiar el texto");
        }
    }

    function agregarBotonCopiar(enlace) {
        if (!enlace || !enlace.parentNode) return;

        const botonCopiar = document.createElement("button");

        botonCopiar.type = "button";
        botonCopiar.textContent = "Copiar";
        botonCopiar.setAttribute("aria-label", `Copiar ${enlace.textContent.trim()}`);

        botonCopiar.addEventListener("click", () => {
            copiarTextoAlPortapapeles(enlace.textContent.trim(), botonCopiar);
        });

        enlace.parentNode.insertBefore(botonCopiar, enlace.nextSibling);
    }

    agregarBotonCopiar(document.querySelector('.contact-info a[href^="tel:"]'));
    agregarBotonCopiar(document.querySelector('.contact-info a[href^="mailto:"]'));

    // Manejador para la burbuja de audio
    const audioBubble = document.querySelector(".audio-bubble");

    if (audioBubble) {
        const closeButton = audioBubble.querySelector(".close-button");
        const expandedContent = audioBubble.querySelector(".expanded-content");

        const cambiarEstadoAudioBubble = (expandido) => {
            audioBubble.classList.toggle("expanded", expandido);
            audioBubble.setAttribute("aria-expanded", expandido ? "true" : "false");
            audioBubble.setAttribute(
                "aria-label",
                expandido ? "Cerrar reproductor de audio" : "Abrir reproductor de audio"
            );
        };

        audioBubble.addEventListener("click", () => {
            cambiarEstadoAudioBubble(!audioBubble.classList.contains("expanded"));
        });

        audioBubble.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                cambiarEstadoAudioBubble(!audioBubble.classList.contains("expanded"));
            }
        });

        expandedContent?.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        closeButton?.addEventListener("click", (e) => {
            e.stopPropagation();
            cambiarEstadoAudioBubble(false);
        });

        document.addEventListener("click", (e) => {
            if (!audioBubble.contains(e.target)) {
                cambiarEstadoAudioBubble(false);
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                cambiarEstadoAudioBubble(false);
            }
        });
    }

    // Carga diferida del widget de reseñas ElfSight
    function cargarWidgetResenas() {
        const widgetResenas = document.querySelector("[data-elfsight-app-lazy]");
        const scriptExistente = document.querySelector('script[data-elfsight-platform="true"]');

        if (!widgetResenas || scriptExistente) return;

        const script = document.createElement("script");

        script.src = "https://static.elfsight.com/platform/platform.js";
        script.async = true;
        script.dataset.elfsightPlatform = "true";

        document.body.appendChild(script);
    }

    if ("requestIdleCallback" in window) {
        window.requestIdleCallback(cargarWidgetResenas, { timeout: 5000 });
    } else {
        window.setTimeout(cargarWidgetResenas, 3500);
    }

    // Envío de formulario
    const form = document.getElementById("contact-form");

    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            const botonEnviar = form.querySelector('button[type="submit"]');
            const textoOriginalBoton = botonEnviar ? botonEnviar.textContent : "";
            const formData = new FormData(form);

            try {
                if (botonEnviar) {
                    botonEnviar.disabled = true;
                    botonEnviar.textContent = "Enviando...";
                }

                const response = await fetch(form.action, {
                    method: "POST",
                    body: formData,
                    headers: {
                        Accept: "application/json"
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const data = await response.json();

                if (data.ok) {
                    mostrarToast("Mensaje enviado correctamente");
                    form.reset();
                } else {
                    throw new Error("Error en los datos enviados");
                }
            } catch (error) {
                console.error("Error al enviar el mensaje:", error);
                mostrarToast("Error al enviar el mensaje");
            } finally {
                if (botonEnviar) {
                    botonEnviar.disabled = false;
                    botonEnviar.textContent = textoOriginalBoton;
                }
            }
        });
    }
});