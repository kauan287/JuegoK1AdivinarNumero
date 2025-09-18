// Configuración del juego móvil
const RONDAS_TOTALES = 5;
const MIN_NUM = 1;
const MAX_NUM = 100;

class MobileGuessGameApp {
    constructor() {
        this.mejorPuntuacion = null;
        this.reiniciarPartida();
        this.initializeElements();
        this.bindEvents();
        this.actualizarUI();
        this.loadBestScore();
        this.setupMobileFeatures();
    }

    initializeElements() {
        // Elementos del DOM móvil
        this.roundDisplay = document.getElementById('round-display');
        this.bestScoreDisplay = document.getElementById('best-score-display');
        this.numberInput = document.getElementById('number-input');
        this.guessBtn = document.getElementById('guess-btn');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.exitBtn = document.getElementById('exit-btn');
        this.resultDisplay = document.getElementById('result-display');
        this.totalScoreDisplay = document.getElementById('total-score-display');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        
        // Elementos de pista
        this.hintBtn = document.getElementById('hint-btn');
        this.hintDisplay = document.getElementById('hint-display');
        
        // Modal móvil
        this.modal = document.getElementById('modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
        this.modalClose = document.getElementById('modal-close');
        
        // Teclado virtual
        this.virtualKeyboard = document.getElementById('virtual-keyboard');
        this.keyButtons = document.querySelectorAll('.key-btn');
    }

    setupMobileFeatures() {
        // Detectar si es móvil
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Configurar viewport para móvil
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
        }
        
        // Configurar teclado virtual
        this.setupVirtualKeyboard();
        
        // Configurar vibración
        this.setupVibration();
        
        // Configurar gestos táctiles
        this.setupTouchGestures();
        
        // Prevenir zoom accidental
        this.preventZoom();
    }

    setupVirtualKeyboard() {
        // Mostrar/ocultar teclado virtual
        this.numberInput.addEventListener('focus', () => {
            if (this.isMobile) {
                this.showVirtualKeyboard();
            }
        });
        
        this.numberInput.addEventListener('blur', () => {
            if (this.isMobile) {
                setTimeout(() => this.hideVirtualKeyboard(), 200);
            }
        });
        
        // Configurar botones del teclado virtual
        this.keyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const key = btn.dataset.key;
                this.handleVirtualKey(key);
            });
        });
    }

    handleVirtualKey(key) {
        const input = this.numberInput;
        const currentValue = input.value;
        
        switch(key) {
            case 'backspace':
                input.value = currentValue.slice(0, -1);
                break;
            case 'enter':
                this.onIntentar();
                break;
            default:
                if (currentValue.length < 3) { // Limitar a 3 dígitos
                    input.value = currentValue + key;
                }
                break;
        }
        
        // Trigger input event para validación
        input.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Vibración táctil
        this.vibrate(50);
    }

    showVirtualKeyboard() {
        this.virtualKeyboard.classList.add('show');
        this.virtualKeyboard.style.display = 'block';
    }

    hideVirtualKeyboard() {
        this.virtualKeyboard.classList.remove('show');
        setTimeout(() => {
            this.virtualKeyboard.style.display = 'none';
        }, 300);
    }

    setupVibration() {
        // Verificar soporte de vibración
        this.vibrationSupported = 'vibrate' in navigator;
    }

    vibrate(pattern = 100) {
        if (this.vibrationSupported && this.isMobile) {
            navigator.vibrate(pattern);
        }
    }

    setupTouchGestures() {
        // Configurar gestos de swipe
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Swipe hacia arriba para nueva partida
            if (Math.abs(diffY) > Math.abs(diffX) && diffY > 50) {
                this.onNuevaPartida();
                this.vibrate([100, 50, 100]);
            }
        });
    }

    preventZoom() {
        // Prevenir zoom con doble tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    bindEvents() {
        // Botones principales
        this.guessBtn.addEventListener('click', () => this.onIntentar());
        this.newGameBtn.addEventListener('click', () => this.onNuevaPartida());
        this.exitBtn.addEventListener('click', () => this.onSalir());
        this.hintBtn.addEventListener('click', () => this.onPista());
        this.modalClose.addEventListener('click', () => this.closeModal());

        // Enter en el input
        this.numberInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.onIntentar();
            }
        });

        // Cerrar modal al hacer click fuera
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Validación en tiempo real del input
        this.numberInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (value < MIN_NUM || value > MAX_NUM) {
                e.target.setCustomValidity(`El número debe estar entre ${MIN_NUM} y ${MAX_NUM}`);
            } else {
                e.target.setCustomValidity('');
            }
        });

        // Mejorar experiencia táctil
        this.setupTouchFeedback();
    }

    setupTouchFeedback() {
        // Feedback táctil para botones
        const buttons = [this.guessBtn, this.newGameBtn, this.exitBtn, this.hintBtn];
        
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', () => {
                btn.style.transform = 'scale(0.95)';
                this.vibrate(30);
            });
            
            btn.addEventListener('touchend', () => {
                btn.style.transform = 'scale(1)';
            });
        });
    }

    reiniciarPartida() {
        this.rondaActual = 1;
        this.puntuacionTotal = 0;
        this.secreto = this.generarNumeroSecreto();
        this.partidaActiva = true;
        this.pistaUsadaEnPartida = false;
        this.pistaDesbloqueada = false;
        this.ecuacionActual = null;
        this.respuestaEcuacion = null;
    }

    generarNumeroSecreto() {
        return Math.floor(Math.random() * (MAX_NUM - MIN_NUM + 1)) + MIN_NUM;
    }

    generarPista() {
        const numero = this.secreto;
        const totalNumeros = 100;
        const numerosDescartados = 25;
        
        const todosNumeros = [];
        for (let i = MIN_NUM; i <= MAX_NUM; i++) {
            todosNumeros.push(i);
        }
        
        const numerosDisponibles = todosNumeros.filter(n => n !== numero);
        
        for (let i = numerosDisponibles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numerosDisponibles[i], numerosDisponibles[j]] = [numerosDisponibles[j], numerosDisponibles[i]];
        }
        
        const numerosDescartadosLista = numerosDisponibles.slice(0, numerosDescartados);
        numerosDescartadosLista.sort((a, b) => a - b);
        
        let pista = "PISTA: El número NO es: ";
        const rangos = this.crearRangos(numerosDescartadosLista);
        
        if (rangos.length === 1) {
            const rango = rangos[0];
            if (rango.inicio === rango.fin) {
                pista += rango.inicio;
            } else {
                pista += `${rango.inicio}-${rango.fin}`;
            }
        } else {
            const rangosTexto = rangos.map(rango => {
                if (rango.inicio === rango.fin) {
                    return rango.inicio;
                } else {
                    return `${rango.inicio}-${rango.fin}`;
                }
            });
            pista += rangosTexto.join(", ");
        }
        
        return pista;
    }
    
    crearRangos(numeros) {
        if (numeros.length === 0) return [];
        
        const rangos = [];
        let inicioActual = numeros[0];
        let finActual = numeros[0];
        
        for (let i = 1; i < numeros.length; i++) {
            if (numeros[i] === finActual + 1) {
                finActual = numeros[i];
            } else {
                rangos.push({ inicio: inicioActual, fin: finActual });
                inicioActual = numeros[i];
                finActual = numeros[i];
            }
        }
        
        rangos.push({ inicio: inicioActual, fin: finActual });
        return rangos;
    }

    generarEcuacion() {
        const a = Math.floor(Math.random() * 9) + 2;
        const x = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        const c = a * x + b;

        const ecuacion = `${a}x + ${b} = ${c}`;
        
        return {
            ecuacion: ecuacion,
            respuesta: x
        };
    }

    verificarRetoPuntuacion(puntos) {
        return puntos > 90;
    }

    verificarRetoEcuacion(respuestaUsuario) {
        return parseInt(respuestaUsuario) === this.respuestaEcuacion;
    }

    desbloquearPista() {
        this.pistaDesbloqueada = true;
        this.ecuacionActual = null;
        this.respuestaEcuacion = null;
        this.actualizarUI();
        this.vibrate([100, 50, 100]); // Vibración de éxito
    }

    onNuevaPartida() {
        this.reiniciarPartida();
        this.resultDisplay.textContent = '';
        this.resultDisplay.className = 'mobile-result-display';
        this.hintDisplay.textContent = '';
        this.hintDisplay.className = 'mobile-hint-display';
        this.numberInput.value = '';
        this.actualizarUI();
        this.numberInput.focus();
        this.vibrate([50, 50, 50]); // Vibración de reinicio
    }

    onIntentar() {
        if (!this.partidaActiva) {
            return;
        }

        const valorTexto = this.numberInput.value.trim();
        
        if (!valorTexto) {
            this.mostrarError('Por favor, introduce un número.');
            return;
        }

        const intento = parseInt(valorTexto);
        if (isNaN(intento)) {
            this.mostrarError('Por favor, introduce un número válido.');
            return;
        }

        if (intento < MIN_NUM || intento > MAX_NUM) {
            this.mostrarError(`El número debe estar entre ${MIN_NUM} y ${MAX_NUM}.`);
            return;
        }

        const diferencia = Math.abs(intento - this.secreto);
        const puntos = Math.max(0, 100 - diferencia);
        this.puntuacionTotal += puntos;

        this.mostrarResultado(intento, diferencia, puntos);

        if (this.rondaActual >= RONDAS_TOTALES) {
            this.finalizarPartida();
        } else {
            this.rondaActual++;
            this.secreto = this.generarNumeroSecreto();
            this.hintDisplay.textContent = '';
            this.hintDisplay.className = 'mobile-hint-display';
        }

        this.numberInput.value = '';
        this.actualizarUI();
        
        // Vibración según resultado
        if (diferencia === 0) {
            this.vibrate([200, 100, 200]); // Éxito perfecto
        } else if (diferencia <= 5) {
            this.vibrate([150, 50, 150]); // Muy cerca
        } else {
            this.vibrate(100); // Intento normal
        }
    }

    mostrarResultado(intento, diferencia, puntos) {
        let mensaje = `Ronda ${this.rondaActual}: Tu número ${intento}, era ${this.secreto}. `;
        mensaje += `Diferencia: ${diferencia}. Puntos: ${puntos}.`;

        if (!this.pistaDesbloqueada && this.verificarRetoPuntuacion(puntos)) {
            mensaje += ` ¡RETO CUMPLIDO! Pista desbloqueada.`;
            this.desbloquearPista();
        }

        this.resultDisplay.textContent = mensaje;
        
        this.resultDisplay.className = 'mobile-result-display';
        if (diferencia === 0) {
            this.resultDisplay.classList.add('success');
        } else if (diferencia <= 5) {
            this.resultDisplay.classList.add('warning');
        } else if (diferencia >= 20) {
            this.resultDisplay.classList.add('error');
        }

        this.animateScore();
    }

    animateScore() {
        const scoreElement = this.totalScoreDisplay;
        scoreElement.style.transform = 'scale(1.2)';
        scoreElement.style.color = '#48bb78';
        
        setTimeout(() => {
            scoreElement.style.transform = 'scale(1)';
            scoreElement.style.color = '';
        }, 300);
    }

    finalizarPartida() {
        this.partidaActiva = false;
        let mensaje = `🎉 ¡Partida terminada!<br><br>`;
        mensaje += `Puntuación final: <strong>${this.puntuacionTotal}</strong><br><br>`;

        let esMejorPuntuacion = false;
        if (this.mejorPuntuacion === null || this.puntuacionTotal > this.mejorPuntuacion) {
            this.mejorPuntuacion = this.puntuacionTotal;
            this.saveBestScore();
            mensaje += `🏆 ¡Nueva mejor puntuación!`;
            esMejorPuntuacion = true;
            this.vibrate([200, 100, 200, 100, 200]); // Vibración de victoria
        } else {
            mensaje += `Mejor puntuación: ${this.mejorPuntuacion}`;
            this.vibrate([300, 100, 300]); // Vibración de finalización
        }

        this.mostrarModal(
            esMejorPuntuacion ? '¡Nueva Mejor Puntuación!' : 'Partida Terminada',
            mensaje
        );
    }

    mostrarModal(titulo, mensaje) {
        this.modalTitle.innerHTML = `<span class="icon-trophy"></span>${titulo}`;
        this.modalMessage.innerHTML = mensaje;
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    mostrarError(mensaje) {
        this.resultDisplay.textContent = mensaje;
        this.resultDisplay.className = 'mobile-result-display error';
        
        this.numberInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            this.numberInput.style.animation = '';
        }, 500);
        
        this.vibrate([100, 50, 100, 50, 100]); // Vibración de error
    }

    actualizarUI() {
        this.roundDisplay.textContent = `${this.rondaActual}/${RONDAS_TOTALES}`;
        this.totalScoreDisplay.textContent = this.puntuacionTotal;
        
        if (this.mejorPuntuacion !== null) {
            this.bestScoreDisplay.textContent = this.mejorPuntuacion;
        }
        
        const progreso = (this.rondaActual / RONDAS_TOTALES) * 100;
        this.progressFill.style.width = `${progreso}%`;
        this.progressText.textContent = `Ronda ${this.rondaActual} de ${RONDAS_TOTALES}`;
        
        this.guessBtn.disabled = !this.partidaActiva;
        this.numberInput.disabled = !this.partidaActiva;
        this.hintBtn.disabled = !this.partidaActiva || this.pistaUsadaEnPartida;
        
        if (!this.partidaActiva) {
            this.guessBtn.style.opacity = '0.6';
            this.guessBtn.style.cursor = 'not-allowed';
        } else {
            this.guessBtn.style.opacity = '1';
            this.guessBtn.style.cursor = 'pointer';
        }

        if (this.pistaUsadaEnPartida) {
            this.hintBtn.innerHTML = '<span class="icon-lightbulb"></span><span>Pista usada</span>';
        } else if (this.pistaDesbloqueada) {
            this.hintBtn.innerHTML = '<span class="icon-lightbulb"></span><span>Pista disponible</span>';
        } else {
            this.hintBtn.innerHTML = '<span class="icon-lightbulb"></span><span>Desbloquear pista</span>';
        }
    }

    onPista() {
        if (!this.partidaActiva || this.pistaUsadaEnPartida) {
            return;
        }

        if (!this.pistaDesbloqueada) {
            const ecuacionData = this.generarEcuacion();
            this.ecuacionActual = ecuacionData.ecuacion;
            this.respuestaEcuacion = ecuacionData.respuesta;
            
            // Usar modal móvil en lugar de prompt
            this.mostrarModalEcuacion();
            return;
        }

        const pista = this.generarPista();
        this.hintDisplay.textContent = pista;
        this.hintDisplay.className = 'mobile-hint-display show';
        this.pistaUsadaEnPartida = true;
        this.actualizarUI();
        this.vibrate([100, 50, 100]); // Vibración de pista
    }

    mostrarModalEcuacion() {
        const modalContent = `
            <div class="ecuacion-modal">
                <h3>🧮 ¡RETO MATEMÁTICO!</h3>
                <p>Resuelve esta ecuación para desbloquear la pista:</p>
                <div class="ecuacion-display">${this.ecuacionActual}</div>
                <input type="number" id="ecuacion-input" placeholder="¿Cuánto vale x?" class="ecuacion-input">
                <div class="ecuacion-buttons">
                    <button id="ecuacion-submit" class="ecuacion-btn primary">Resolver</button>
                    <button id="ecuacion-cancel" class="ecuacion-btn secondary">Cancelar</button>
                </div>
            </div>
        `;
        
        this.modalMessage.innerHTML = modalContent;
        this.modal.style.display = 'block';
        
        // Configurar eventos del modal de ecuación
        setTimeout(() => {
            const ecuacionInput = document.getElementById('ecuacion-input');
            const submitBtn = document.getElementById('ecuacion-submit');
            const cancelBtn = document.getElementById('ecuacion-cancel');
            
            ecuacionInput.focus();
            
            submitBtn.addEventListener('click', () => {
                const respuesta = ecuacionInput.value;
                if (this.verificarRetoEcuacion(respuesta)) {
                    this.closeModal();
                    this.desbloquearPista();
                    this.vibrate([200, 100, 200]); // Vibración de éxito
                } else {
                    this.mostrarError(`Incorrecto. La respuesta era ${this.respuestaEcuacion}. Intenta conseguir más de 90 puntos en una ronda para desbloquear la pista automáticamente.`);
                    this.closeModal();
                    this.vibrate([100, 50, 100, 50, 100]); // Vibración de error
                }
            });
            
            cancelBtn.addEventListener('click', () => {
                this.closeModal();
            });
            
            ecuacionInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    submitBtn.click();
                }
            });
        }, 100);
    }

    onSalir() {
        if (confirm('¿Estás seguro de que quieres salir del juego?')) {
            this.vibrate([100, 50, 100]); // Vibración de salida
            window.close();
            if (window.close() === undefined) {
                alert('Puedes cerrar esta pestaña para salir del juego.');
            }
        }
    }

    saveBestScore() {
        if (this.mejorPuntuacion !== null) {
            localStorage.setItem('mobileGuessGameBestScore', this.mejorPuntuacion.toString());
        }
    }

    loadBestScore() {
        const saved = localStorage.getItem('mobileGuessGameBestScore');
        if (saved !== null) {
            this.mejorPuntuacion = parseInt(saved);
            this.bestScoreDisplay.textContent = this.mejorPuntuacion;
        }
    }
}

// CSS adicional para animaciones móviles (inyectado dinámicamente)
const mobileStyle = document.createElement('style');
mobileStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
        20%, 40%, 60%, 80% { transform: translateX(8px); }
    }
    
    .mobile-result-display {
        animation: fadeIn 0.5s ease-in-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .ecuacion-modal {
        text-align: center;
    }
    
    .ecuacion-display {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary-color);
        margin: 16px 0;
        padding: 16px;
        background: #f7fafc;
        border-radius: 12px;
        border: 2px solid var(--primary-color);
    }
    
    .ecuacion-input {
        width: 100%;
        padding: 16px;
        border: 2px solid var(--border-color);
        border-radius: 12px;
        font-size: 1.2rem;
        text-align: center;
        margin: 16px 0;
    }
    
    .ecuacion-buttons {
        display: flex;
        gap: 12px;
        margin-top: 16px;
    }
    
    .ecuacion-btn {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: var(--transition);
    }
    
    .ecuacion-btn.primary {
        background: var(--success-color);
        color: white;
    }
    
    .ecuacion-btn.secondary {
        background: var(--text-secondary);
        color: white;
    }
    
    .ecuacion-btn:active {
        transform: scale(0.95);
    }
`;
document.head.appendChild(mobileStyle);

// Inicializar el juego móvil cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new MobileGuessGameApp();
});

// Prevenir el cierre accidental de la ventana
window.addEventListener('beforeunload', (e) => {
    const game = window.mobileGameApp;
    if (game && game.partidaActiva) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Tu partida actual se perderá.';
        return e.returnValue;
    }
});

// Configurar PWA básico
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registrado: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registro falló: ', registrationError);
            });
    });
}
