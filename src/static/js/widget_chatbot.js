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

class Chatbot {
    constructor(containerId, client_id, client_secret, app_name, flujo_id=null, metadata=null) {
        // Credenciales del constructor
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.app_name = app_name;
        this.flujo_id = flujo_id;
        this.metadata = JSON.stringify(metadata);

        // Credenciales del primer response
        this.token = null;
        this.sesion_id = null;
        this.parametros = null;

        // Validadores
        this.valid = false;
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
        this.validate().then(() => {
            if (this.valid) {
                if (this.parametros.mantiene_historial) {
                    this.sesion_guardada = this.getSessionHistory();
                }
            }
            const css = [
                this.url_static + 'css/widget_chatbot.css'
            ];
            this.cargarCSS(css, () => {
                this.crear_html();
                this.modificar_parametros();
                this.chatbotBubble.style.display = 'flex';
                this.chatbotContainer.style.display = 'none';
            });
        });
    }

    validate() {
        if (!document.getElementById(this.container)) {
            console.error(`Container con ID: "${this.container}", no encontrado`);
            return;
        }
        this.container = document.getElementById(this.container);
        this.shadowRoot = this.container.attachShadow({ mode: 'open' });

        console.log("*********************** WIDGET DATA ***********************");
        console.log(" ");
        console.log("Client ID: " + this.client_id);
        console.log("Client Secret: " + this.client_secret);
        console.log("App Name: " + this.app_name);
        console.log("Flujo ID: " + this.flujo_id);
        console.log("Metadata: " + this.metadata);
        console.log("Entorno Actual: " + entorno_actual);
        console.log("Imports URL Base: " + this.url_static);
        console.log("Dominio: " + this.dominio);
        console.log(" ");
        console.log("************************ RESPONSES ************************");
        console.log(" ");

        return fetch(get_url_token(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                app_name: this.app_name,
                client_id: this.client_id,
                client_secret: this.client_secret,
                flujo_id: this.flujo_id
            })
        })
        .then(response => response.json())
        .then(response => {
            if (response.status) {
                console.log(response);
                this.token = response.data.access_token;
                if (this.dominio === response.data.dominio || this.dominio === 'file://') {
                    this.valid = true;
                }
                this.parametros = response.data.parametros;
            } else {
                console.error(response);
            }
        })
        .catch(error => {
            console.error('Error al obtener token: ', error);
        });
    }

    crear_html() {
        // Crea el contenedor del widget junto a su status
        this.chatbotWidget = document.createElement('div');
        this.chatbotWidget.id = 'chatbot-widget';
        if (this.valid) {
            this.chatbotWidget.setAttribute('data-status', 'valid');
        } else {
            this.chatbotWidget.setAttribute('data-status', 'invalid');
        }
        this.shadowRoot.appendChild(this.chatbotWidget);

        // Crear el burbuja del chatbot
        this.chatbotBubble = document.createElement('div');
        this.chatbotBubble.id = 'chatbot-bubble';
        var imagen_buble = this.parametros?.images?.image_buble || `${this.url_static}images/chatbot.svg`;
        this.chatbotBubble.innerHTML = `
        <div class="help-text">
            <p>ERROR DE ACTIVACION</p>
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
                <span id="chatbot-title">ERROR DE ACTIVACION</span>
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
            <div id="chatbot-body"></div>
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
        this.shadowRoot.getElementById("chatbot-input").focus();
    }
    
    openChat() {
        if (this.primer_mensaje && this.valid) {
            this.shadowRoot.getElementById("chatbot-input").disabled = true;
            // Mensaje Chatbot
            this.obtenerRespuestaAPI();
        }
        else if (this.primer_mensaje) {
            this.shadowRoot.getElementById("chatbot-input").disabled = true;

            setTimeout(() => {
                // Mensaje Chatbot Error
                this.addMessage({ contenido: "Para obtener asistencia, comunícate con el soporte técnico de Ecom", fecha_hora: new Date() }, 'chatbot');
                this.shadowRoot.getElementById("chatbot-input").disabled = false;
                this.shadowRoot.getElementById("chatbot-input").focus();
            }, 1000);

            this.primer_mensaje = false;
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
        const message = inputField.value.trim();
        if (message === '' || message.length > 25) {
            inputField.value = '';
            setTimeout(() => {
                this.shadowRoot.getElementById("chatbot-input").focus();
            }, 0);
            return
        }
        this.shadowRoot.getElementById("chatbot-input").disabled = true;

        // Mostrar mensaje del usuario
        this.addMessage({ contenido: message, fecha_hora: new Date() }, 'usuario');

        // Mostrar respuesta de la api
        if (this.valid) {
            this.obtenerRespuestaAPI(message);
        }
        else {
            setTimeout(() => {
                // Mensaje Chatbot Error
                this.addMessage({ contenido: "Para obtener asistencia, comunícate con el soporte técnico de Ecom", fecha_hora: new Date() }, 'chatbot');
                this.shadowRoot.getElementById("chatbot-input").disabled = false;
                this.shadowRoot.getElementById("chatbot-input").focus();
            }, 1000);
        }

        // Limpiar campo de entrada
        inputField.value = '';
    }

    addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);

        var imagen_chatbot = this.parametros?.images?.image_chatbot || `${this.url_static}images/chatbot_icon.svg`;
        var imagen_user = this.parametros?.images?.image_user || `${this.url_static}images/usuario.png`;
        var imagen = (sender === 'usuario') ? imagen_user : imagen_chatbot;
        let messageContent = `<span class="msg-avatar"><img src="${imagen}" alt="Avatar"></span>`;

        // Crear contenedor para el contenido del mensaje
        messageContent += `<div class="message-content">${message.contenido}`;

        // Agrega las opciones si están disponibles
        if (message.opciones) {
            for (let opcion of message.opciones) {
                messageContent += `<br>${opcion.orden}. ${opcion.mensaje}`;
            }
        }

        // Agrega la imagen si está disponible
        if (message.adjunto || message.bloque__archivo) {
            if (message.host) { message.adjunto = message.host + message.bloque__archivo }
            messageContent += `
                <div class="media">
                    <img src="${message.adjunto}" alt="Imagen" class="img-fluid mt-2 rounded">
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
    }
    
    // Función para crear el delay
    delay(delay) {
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // Función para obtener la respusta del Chatbot
    async obtenerRespuestaAPI(contenido=null) {
        try {
            var bodyData;
            if (this.primer_mensaje && this.sesion_guardada) {
                bodyData = JSON.stringify({
                    flujo_id: this.flujo_id,
                    sesion_id: this.sesion_guardada.sesion_id,
                    app_name: this.app_name
                });
            }
            else if (this.primer_mensaje) {
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
                    mensaje: contenido,
                    app_name: this.app_name
                });
            }
            const response = await fetch(get_url_conversacion(), {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + this.token,
                    'Content-Type': 'application/json'
                },
                body: bodyData
            }).then(response => response.json());

            if (response.status) {
                console.log(response);

                if (this.primer_mensaje) {
                    this.sesion_id = response.data.sesion_id;
                    this.primer_mensaje = false;
                    if (!this.sesion_guardada && this.parametros.mantiene_historial) {
                        this.saveSessionHistory();
                    }
                }

                for (let mensaje of response.data.mensajes) {
                    await this.delay(mensaje.delay * 1000);
                    // Mensaje Chatbot | Usuario
                    var sender = 'chatbot';
                    if (mensaje.remitente) { sender = mensaje.remitente }
                    this.addMessage(mensaje, sender);
                }
            } else {
                console.error(response);
                // Genera un mensaje de error en el chat
                this.addMessage({ contenido: response.data.error.error_content, fecha_hora: new Date() }, 'chatbot');
            }
        } catch (error) {
            console.error('Error al obtener el mensaje:', error);
            // Genera un mensaje de error en el chat
            this.addMessage({ contenido: "Error al obtener el mensaje", fecha_hora: new Date() }, 'chatbot');
        }

        this.shadowRoot.getElementById("chatbot-input").disabled = false;
        this.shadowRoot.getElementById("chatbot-input").focus();
    }

    // Función para obtener la fecha y hora actual formateada
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

    // Función para modificar el titulo del Chatbot
    modificar_parametros() {
        var title = this.shadowRoot.querySelector('#chatbot-title');
        if (title && this.valid) {
            title.textContent = this.parametros.titulo;
        }

        var help_text_conteiner = this.shadowRoot.querySelector('.help-text');
        if (help_text_conteiner && this.valid) {
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
        
        if (this.parametros && this.valid) {
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
            }

            if (this.parametros.images.image_chatbot) {
                if (!es_svg(this.parametros.images.image_chatbot)) {
                    chatbot_widget.style.setProperty('--width_chatbot', '40px');
                    chatbot_widget.style.setProperty('--height_chatbot', '40px');
                    chatbot_widget.style.setProperty('--border_radius_chatbot', '50%');
                }
            }
        } else {
            chatbot_widget.style.setProperty('--width_user', '40px');
            chatbot_widget.style.setProperty('--height_user', '40px');
            chatbot_widget.style.setProperty('--border_radius', '50%');
        }
    }

    saveSessionHistory() {
        const sesion_data = {
            client_id: this.client_id,
            client_secret: this.client_secret,
            app_name: this.app_name,
            flujo_id: this.flujo_id,
            sesion_id: this.sesion_id
        };
        try {
            localStorage.setItem(`sesion_data (${this.app_name}) (${this.flujo_id})`, JSON.stringify(sesion_data));
            console.log(`Sesion guardada en localStorage con ID: ${this.sesion_id}. Para la aplicacion: ${this.app_name}`);
        } catch (error) {
            console.error('Error al guardar la sesion en localStorage: ', error);
        }
    }

    getSessionHistory() {
        try {
            const sesion_data = JSON.parse(localStorage.getItem(`sesion_data (${this.app_name}) (${this.flujo_id})`));
            return sesion_data;
        } catch (error) {
            console.error(`Error al obtener la sesión de localStorage para la aplicacion ${this.app_name}: `, error);
            return null;
        }
    }
}
