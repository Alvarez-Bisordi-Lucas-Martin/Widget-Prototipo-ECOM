/************************************** URLS **************************************/

const valores_de_entorno = {
    "local": {
        "base": "http://127.0.0.1:8003/api/v1/",
        "static": "../static/"
    },
    "test": {
        "base": "https://chatbot.ecomdev.ar/api/v1/",
        "static": "https://ecom-chatbot-widget.ecomdev.ar/"
    },
    "produccion": {
        "base": "https://chatbot.ecom.com.ar/api/v1/",
        "static": "https://chatbot.ecom.com.ar/"
    }
};

if (typeof config !== "undefined" && config.entorno_actual) { var entorno_actual = config.entorno_actual; }
else { var entorno_actual = "test"; }

function get_url_base() {
    return valores_de_entorno[entorno_actual]["base"];
}

function get_url_static() {
    return valores_de_entorno[entorno_actual]["static"];
}

function get_url_token() {
    return get_url_base() + "aplicaciones/token/";
}

function get_url_conversacion() {
    return get_url_base() + "mensajes/conversacion/";
}

/************************************* CHATBOT *************************************/

const LS_CHATBOT_KEY = "local_storage_chatbot";

const KEY_RESTABLECER_SESION = "@REINICIAR";

const KEYS = {
    KEY_RESTABLECER_SESION,
}

// Establecer valor para la longitud max del imput en el Chatbot
const LONGITUD = null;

class Chatbot {
    constructor(containerId, api_key, app_name, flujo_id, metadata=null, posicion=null, bubble_size=null) {
        // Credenciales del constructor
        this.api_key = api_key;
        this.app_name = app_name;
        this.flujo_id = flujo_id;
        this.metadata = JSON.stringify(metadata);
        this.posicion = posicion;
        this.bubble_size = bubble_size;

        // Credenciales del primer response
        this.token = null;
        this.sesion_id = null;
        this.parametros = null;

        // Validadores
        this.primer_mensaje = true;
        this.sesion_guardada = null;

        // Urls
        this.url_static = get_url_static();
        this.dominio = `${window.location.protocol}//${window.location.host}`;

        // Contenedores
        this.container = containerId;
        this.chatbotWidget = null;
        this.chatbotBubble = null;
        this.chatbotContainer = null;

        // Shadow Dom
        this.shadowRoot = null;

        this.wait_image = `${this.url_static}images/chatbot.svg`;
        this.es_mensaje_previo_generado = false;
    }

    cargarCSS(urls, callback) {
        var urls_cargadas = 0;
        
        urls.forEach((url) => {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = url;
            link.onload = () => {
                urls_cargadas++;
                if (urls_cargadas === urls.length) {
                    callback();
                }
            };
            this.shadowRoot.appendChild(link);
        });
    }
    
    start() {
        this.validate().then(valid => {
            if (valid) {
                if (this.parametros.mantiene_historial) {
                    this.sesion_guardada = this.getSessionHistory();
                }
                const css = (entorno_actual === 'test') ? [this.url_static + 'css/widget_chatbot.min.css'] : [this.url_static + 'css/widget_chatbot.css'];
                this.cargarCSS(css, () => {
                    this.crear_html();
                    this.modificar_parametros();
                    this.chatbotBubble.style.display = 'flex';
                    this.chatbotContainer.style.display = 'none';
                });
            }
        });
    }

    validate() {
        return new Promise((resolve) => {
            if (!document.getElementById(this.container)) {
                console.error(`Container con ID: "${this.container}", no encontrado`);
                return resolve(false);
            }
            this.container = document.getElementById(this.container);
            this.shadowRoot = this.container.attachShadow({ mode: 'open' });

            fetch(get_url_token(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    app_name: this.app_name,
                    dominio: this.dominio,
                    api_key: this.api_key,
                    flujo_id: this.flujo_id
                })
            })
            .then(response => response.json())
            .then(response => {
                if (response.status) {
                    this.token = response.data.access_token;
                    this.parametros = response.data.parametros;
                    resolve(true);
                } else {
                    console.error('Error al validar el chatbot');
                    resolve(false);
                }
            })
            .catch(error => {
                console.error('Error al obtener token');
                resolve(false);
            });
        });
    }

    crear_html() {
        // Crea el contenedor del widget
        this.chatbotWidget = document.createElement('div');
        this.chatbotWidget.id = 'chatbot-widget';
        this.shadowRoot.appendChild(this.chatbotWidget);

        // Crear el burbuja del chatbot
        this.chatbotBubble = document.createElement('div');
        this.chatbotBubble.id = 'chatbot-bubble';
        var imagen_buble = this.parametros?.images?.image_buble || `${this.url_static}images/chatbot.svg`;
        this.chatbotBubble.innerHTML = `
        <div class="help-text">
            <p></p>
            <span class="tooltip-arrow"></span>
        </div>
        <div class="icon">
            <img src="${imagen_buble}" alt="Chatbot Icon">
        </div>
        `;
        this.chatbotWidget.appendChild(this.chatbotBubble);

        // Crear el contenedor del chatbot
        this.chatbotContainer = document.createElement('div');
        this.chatbotContainer.id = 'chatbot-container';
        this.chatbotContainer.innerHTML = `
            <div id="chatbot-header">
                <span id="chatbot-title"></span>
                <span id="chatbot-full">
                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                        <g id="SVGRepo_iconCarrier">
                            <path d="M6 9.99739C6.01447 8.29083 6.10921 7.35004 6.72963 6.72963C7.35004 6.10921 8.29083 6.01447 9.99739 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M6 14.0007C6.01447 15.7072 6.10921 16.648 6.72963 17.2684C7.35004 17.8888 8.29083 17.9836 9.99739 17.998" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M17.9976 9.99739C17.9831 8.29083 17.8883 7.35004 17.2679 6.72963C16.6475 6.10921 15.7067 6.01447 14.0002 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M17.9976 14.0007C17.9831 15.7072 17.8883 16.648 17.2679 17.2684C16.6475 17.8888 15.7067 17.9836 14.0002 17.998" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </g>
                    </svg>
                </span>
                <span id="chatbot-expandir">
                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                        <g id="SVGRepo_iconCarrier">
                            <path d="M12 12L17 7M17 7H13.25M17 7V10.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 12L7 17M7 17H10.75M7 17V13.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </g>
                    </svg>
                </span>
                <span id="chatbot-close">
                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                        <g id="SVGRepo_iconCarrier">
                            <path d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </g>
                    </svg>
                </span>
            </div>
            <div id="chatbot-body">
                <div id="wait-message" class="chat-message chatbot">
                    <span class="msg-avatar">
                        <img src="${this.wait_image}" alt="Avatar">
                    </span>
                    <div class="message-content">
                        <span class="wave">●</span><span class="wave">●</span><span class="wave">●</span>
                    </div>
                </div>
            </div>
            <div id="chatbot-input-container">
                <input type="text" id="chatbot-input" placeholder="Escribe un mensaje..." autocomplete="off"/>
                <button id="chatbot-send">
                    <img src="${this.url_static}images/send.svg" alt="Enviar Icon">
                </button>
            </div>`;
        this.chatbotWidget.appendChild(this.chatbotContainer);
        
        // Agregar eventos
        this.chatbotBubble.addEventListener('click', this.openChat.bind(this));
        this.shadowRoot.getElementById('chatbot-close').addEventListener('click', this.closeChat.bind(this));
        this.shadowRoot.getElementById('chatbot-expandir').addEventListener('click', this.expandir.bind(this));
        this.shadowRoot.getElementById('chatbot-full').addEventListener('click', this.full.bind(this));
        this.shadowRoot.getElementById('chatbot-send').addEventListener('click', this.sendMessage.bind(this));

        // Evento para enviar mensaje al presionar Enter
        this.shadowRoot.getElementById('chatbot-input').addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    expandir() {
        this.chatbotContainer.classList.toggle('expanded');
        this.chatbotContainer.classList.remove('full');
        this.shadowRoot.getElementById("chatbot-input").focus();
    }

    full() {
        this.chatbotContainer.classList.toggle('full');
        this.chatbotContainer.classList.remove('expanded');
        this.shadowRoot.getElementById("chatbot-input").focus();
    }
    
    openChat() {
        if (this.primer_mensaje) {
            this.shadowRoot.getElementById("chatbot-input").disabled = true;
            // Mensaje Chatbot
            this.obtenerRespuestaAPI();
        }
        else {
            setTimeout(() => {
                this.shadowRoot.getElementById("chatbot-input").focus();
            }, 0);
        }
        
        this.chatbotContainer.style.display = 'flex';
        this.chatbotBubble.style.display = 'none';
    }

    closeChat() {
        this.chatbotContainer.style.display = 'none';
        this.chatbotBubble.style.display = 'flex';
    }

    sendMessage() {
        const inputField = this.shadowRoot.getElementById('chatbot-input');
        var message = inputField.value.trim();
        if (message === '' || (LONGITUD !== null && message.length > LONGITUD)) {
            inputField.value = '';
            setTimeout(() => {
                this.shadowRoot.getElementById("chatbot-input").focus();
            }, 0);
            return;
        }
        this.shadowRoot.getElementById("chatbot-input").disabled = true;

        // Mostrar mensaje del usuario
        this.addMessage({ contenido: '<p>' + message + '</p>', es_generado: false, fecha_hora: new Date() }, 'usuario');
        
        // Mostrar respuesta de la api
        this.obtenerRespuestaAPI(message);

        // Limpiar campo de entrada
        inputField.value = '';
    }

    addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);

        var imagen_chatbot = this.parametros?.images?.image_chatbot || `${this.url_static}images/chatbot_icon.svg`;
        var imagen_user = this.parametros?.images?.image_user || `${this.url_static}images/usuario.png`;
        var imagen = (sender === 'usuario') ? imagen_user : imagen_chatbot;
        let messageContent;
        // if (message.es_generado === true) {
        //     imagen = `${this.url_static}images/chatbot_estrellas_amarillas.svg`;
        //     this.wait_image = imagen;
        //     messageContent = `<span class="msg-avatar"><img src="${imagen}" alt="Avatar" style="width:40px; height:40px;"></span>`;
        // }
        // else {
        //     this.wait_image = imagen_chatbot;
        //     messageContent = `<span class="msg-avatar"><img src="${imagen}" alt="Avatar"></span>`;
        // }

        // if (this.es_mensaje_previo_generado === true) {
        //     imagen = `${this.url_static}images/chatbot_estrellas_amarillas.svg`;
        //     this.wait_image = imagen;
        // }
        // else {
        //     this.wait_image = imagen_chatbot;
        // }

        messageContent = `<span class="msg-avatar"><img src="${imagen}" alt="Avatar"></span>`;
        this.wait_image = imagen_chatbot;
        
        if (message.contenido === null) { message.contenido = '' }

        // Crear contenedor para el contenido del mensaje
        messageContent += `<div class="message-content">${message.contenido}`;

        // Agrega las opciones si están disponibles
        if (message.opciones) {
            for (let opcion of message.opciones) {
                const mensaje = opcion.mensaje.length > 7 ? opcion.mensaje.substring(3, opcion.mensaje.length - 4) : opcion.mensaje;
                messageContent += `<p><strong>${opcion.orden}.</strong> ${mensaje}</p>`;
            }
        }

        // Agrega la imagen si está disponible
        if (message.adjunto) {
            messageContent += `
                <div class="media">
                    <img src="data:image/${message.adjunto_extension};base64,${message.adjunto}" alt="Imagen" class="img-fluid mt-2 rounded">
                </div>`;
        }
        
        messageContent += `  <div class="timestamp"> ${this.formatear_fecha(message.fecha_hora)} </div>`;

        // Cerrar el div del contenido
        messageContent += `</div>`;

        // Asignar el contenido al elemento
        messageElement.innerHTML = messageContent;

        // Añadir el nuevo mensaje al cuerpo del chat
        var chatBody = this.shadowRoot.getElementById('chatbot-body');
        chatBody.appendChild(messageElement);

        // Desplazarse hacia abajo al enviar mensaje
        chatBody.scrollTop = chatBody.scrollHeight;

        this.ocultarWaitMessage();
    }

    // Funcion para mover el mensaje de espera al final del chat
    moveWaitMessageToEnd() {
        const chatBody = this.shadowRoot.getElementById('chatbot-body');
        const messageToMove = chatBody.querySelector('#wait-message');
        const imgElement = messageToMove.querySelector('img');
        imgElement.src = this.wait_image;
        messageToMove.style.display = 'flex';
        // if (this.es_mensaje_previo_generado === true) {
        //     imgElement.style.width = '40px';
        //     imgElement.style.height = '40px';
        // }
        // else {
        //     imgElement.style.width = 'var(--width_chatbot)';
        //     imgElement.style.height = 'var(--height_chatbot)';
        // }
        chatBody.appendChild(messageToMove);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Funcion para ocultar el mensaje de espera
    ocultarWaitMessage() {
        const messageToHide = this.shadowRoot.getElementById('wait-message');
        messageToHide.style.display = 'none';
    }
    
    // Funcion para crear el delay
    delay(delay) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Funcion para obtener la respusta del Chatbot
    async obtenerRespuestaAPI(contenido=null) {
        var bodyData;

        if (contenido && contenido.toUpperCase() == KEY_RESTABLECER_SESION) {
            this.sesion_guardada = null;
        }
        
        if (this.primer_mensaje && this.sesion_guardada) {
            bodyData = JSON.stringify({
                flujo_id: this.flujo_id,
                sesion_id: this.sesion_guardada.sesion_id,
                app_name: this.app_name
            });
        }
        else if (this.primer_mensaje || contenido && contenido.toUpperCase() == KEY_RESTABLECER_SESION) {
            bodyData = JSON.stringify({
                flujo_id: this.flujo_id,
                metadata: this.metadata,
                app_name: this.app_name
            });
        }
        else {
            bodyData = JSON.stringify({
                flujo_id: this.flujo_id,
                sesion_id: this.sesion_id,
                app_name: this.app_name,
                mensaje: contenido
            });
        }

        try {
            const response = await fetch(get_url_conversacion(), {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + this.token,
                    'Content-Type': 'application/json'
                },
                body: bodyData
            }).then(response => response.json());
            if (response.status) {
                if (this.primer_mensaje) {
                    this.sesion_id = response.data.sesion_id;
                    this.primer_mensaje = false;
                    if (!this.sesion_guardada && this.parametros.mantiene_historial) {
                        this.saveSessionHistory();
                    }
                } else if (contenido.toUpperCase() == KEY_RESTABLECER_SESION) {
                    this.sesion_id = response.data.sesion_id;
                    ecom_chatbot_clear(false);
                    if (this.parametros.mantiene_historial) {
                        this.saveSessionHistory();
                    }
                }

                for (let mensaje of response.data.mensajes) {
                    this.moveWaitMessageToEnd();
                    
                    await this.delay(mensaje.delay * 1000);
                    // Mensaje Chatbot | Usuario
                    var sender = 'chatbot';
                    if (mensaje.remitente) { sender = mensaje.remitente }
                    // this.es_mensaje_previo_generado = mensaje.es_generado;
                    this.addMessage(mensaje, sender);
                }
            } else {
                this.moveWaitMessageToEnd();

                // Genera un mensaje de error en el chat
                this.addMessage({ contenido: response.message, es_generado: false, fecha_hora: new Date() }, 'chatbot');
            }
        } catch (error) {
            this.moveWaitMessageToEnd();

            console.error('Error al obtener el mensaje');
            // Genera un mensaje de error en el chat
            this.addMessage({ contenido: "<p>Error al obtener el mensaje</p>", es_generado: false, fecha_hora: new Date() }, 'chatbot');
        }

        this.shadowRoot.getElementById("chatbot-input").disabled = false;
        this.shadowRoot.getElementById("chatbot-input").focus();
    }

    // Funcion para obtener la fecha y hora actual formateada
    formatear_fecha(fecha) {
        if (!(fecha instanceof Date)) {
            fecha = new Date(fecha);
        }
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        const horas = String(fecha.getHours()).padStart(2, '0');
        const minutos = String(fecha.getMinutes()).padStart(2, '0');
        
        return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
    }

    // Funcion para modificar el titulo del Chatbot
    modificar_parametros() {
        var bubble = this.shadowRoot.querySelector('#chatbot-bubble');
        var container = this.shadowRoot.querySelector('#chatbot-container');
        
        bubble.style.zIndex = '10000';
        container.style.zIndex = '10000';
        
        if (this.posicion === 'izq') {
            bubble.style.right = '';
            bubble.style.left = '20px';
            container.style.right = '';
            container.style.left = '20px';
        }

        var helpText = this.shadowRoot.querySelector('#chatbot-bubble .help-text');
        var icon = this.shadowRoot.querySelector('#chatbot-bubble .icon');
        var iconImage = this.shadowRoot.querySelector('#chatbot-bubble .icon img');
        var tooltipArrow = this.shadowRoot.querySelector('#chatbot-bubble .help-text .tooltip-arrow');

        if (this.bubble_size === 'small') {
            // Reducir los tamaños un 25%
            bubble.style.transform = 'scale(0.75)';
            helpText.style.fontSize = '10.5px';
            helpText.style.maxWidth = '150px';
            icon.style.width = '45px';
            icon.style.height = '45px';
            iconImage.style.width = '22.5px';
            iconImage.style.height = '22.5px';
            tooltipArrow.style.borderTop = '7.5px solid transparent';
            tooltipArrow.style.borderBottom = '7.5px solid transparent';
            tooltipArrow.style.borderLeft = '7.5px solid var(--fondo_txt_help)';
            tooltipArrow.style.right = '-7.5px';
            helpText.style.marginRight = '7.5px';
        }
        else if (this.bubble_size === 'big') {
            // Aumentar los tamaños un 25%
            bubble.style.transform = 'scale(1.25)';
            helpText.style.fontSize = '17.5px';
            helpText.style.maxWidth = '250px';
            icon.style.width = '75px';
            icon.style.height = '75px';
            iconImage.style.width = '37.5px';
            iconImage.style.height = '37.5px';
            tooltipArrow.style.borderTop = '12.5px solid transparent';
            tooltipArrow.style.borderBottom = '12.5px solid transparent';
            tooltipArrow.style.borderLeft = '12.5px solid var(--fondo_txt_help)';
            tooltipArrow.style.right = '-12.5px';
            helpText.style.marginRight = '12.5px';
        }

        var title = this.shadowRoot.querySelector('#chatbot-title');
        if (title) {
            title.textContent = this.parametros.titulo;
        }

        var help_text_conteiner = this.shadowRoot.querySelector('.help-text');
        if (help_text_conteiner) {
            if (this.parametros.texto_ayuda) {
                help_text_conteiner.querySelector('p').textContent = this.parametros.texto_ayuda;
            } else {
                help_text_conteiner.style.display = 'none';
            }
        }

        var chatbot_widget = this.shadowRoot.querySelector('#chatbot-widget');
        
        function updateColor(variable, value) {
            chatbot_widget.style.setProperty(variable, value);
        }

        function es_svg(url) {
            return url.slice(-4).toLowerCase() === '.svg';
        }

        updateColor('--primary', this.parametros.colors.primary_color);
        updateColor('--hover', this.parametros.colors.hover_color);
        updateColor('--fondo_mensaje_user', this.parametros.colors.fondo_mensaje_user_color);
        updateColor('--fondo_mensaje_chatbot', this.parametros.colors.fondo_mensaje_chatbot_color);
        updateColor('--fondo_icon_chatbot', this.parametros.colors.fondo_icon_chatbot_color);
        updateColor('--fondo_icon_usuario', this.parametros.colors.fondo_icon_usuario_color);
        updateColor('--fondo_buble', this.parametros.colors.fondo_buble_color);
        updateColor('--fondo_txt_help', this.parametros.colors.fondo_txt_help_color);
        updateColor('--txt_user', this.parametros.colors.txt_user_color);
        updateColor('--txt_chatbot', this.parametros.colors.txt_chatbot_color);
        updateColor('--txt_timestamp_chatbot', this.parametros.colors.txt_timestamp_chatbot_color);
        updateColor('--txt_timestamp_user', this.parametros.colors.txt_timestamp_user_color);
        updateColor('--txt_help', this.parametros.colors.txt_help_color);
        updateColor('--txt_titulo', this.parametros.colors.txt_titulo_color);

        if (this.parametros.images.image_user) {
            if (!es_svg(this.parametros.images.image_user)) {
                chatbot_widget.style.setProperty('--width_user', '40px');
                chatbot_widget.style.setProperty('--height_user', '40px');
                chatbot_widget.style.setProperty('--border_radius_user', '50%');
            }
        } else {
            chatbot_widget.style.setProperty('--width_user', '40px');
            chatbot_widget.style.setProperty('--height_user', '40px');
            chatbot_widget.style.setProperty('--border_radius_user', '50%');
        }

        if (this.parametros.images.image_chatbot) {
            if (!es_svg(this.parametros.images.image_chatbot)) {
                chatbot_widget.style.setProperty('--width_chatbot', '40px');
                chatbot_widget.style.setProperty('--height_chatbot', '40px');
                chatbot_widget.style.setProperty('--border_radius_chatbot', '50%');
            }
        }
    }

    saveSessionHistory() {
        const sesion_data = {
            api_key: this.api_key,
            app_name: this.app_name,
            flujo_id: this.flujo_id,
            sesion_id: this.sesion_id
        };
        try {
            localStorage.setItem(`local_storage_chatbot`, JSON.stringify(sesion_data));
        } catch (error) {
            console.error('Error al guardar la sesion en localStorage');
        }
    }

    getSessionHistory() {
        try {
            const sesion_data = JSON.parse(localStorage.getItem(LS_CHATBOT_KEY));
            return sesion_data;
        } catch (error) {
            console.error(`Error al obtener los campos del localStorage`);
            return null;
        }
    }
}

function ecom_chatbot_clear(reload=true) {
    try {
        localStorage.removeItem(LS_CHATBOT_KEY);
        if (reload) {
            location.reload();
        }
    } catch (error) {
        console.error('Error al limpiar la clave ' + LS_CHATBOT_KEY);
    }
}
