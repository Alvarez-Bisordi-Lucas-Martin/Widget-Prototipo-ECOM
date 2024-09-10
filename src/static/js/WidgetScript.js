var script = {
    app_name: null, flujo_id: null, metadata: null, token: null, valid: false
}

function EcomWidget(client_id, client_secret, app_name, flujo_id=null, metadata=null) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.app_name = app_name;
    this.flujo_id = flujo_id;
    this.metadata = metadata;
    
    this.start = function() {
        // Función para cargar un archivo JS
        function cargarJS(url, callback) {
            var script = document.createElement("script");
            script.src = url;
            script.onload = callback;
            document.head.appendChild(script);
        }

        // Función para cargar un archivo CSS
        function cargarCSS(url) {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = url;
            document.head.appendChild(link);
        }
        
        cargarJS('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js', function() {
            cargarJS('../static/js/Urls.js', function() {
                // Obtiene el token de validación
                fetch(get_url_token(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        app_name: app_name,
                        client_id: client_id,
                        client_secret: client_secret
                    })
                })
                .then(response => response.json())
                .then(response => {
                    if (response.status) {
                        console.log(response);
                        script.token = response.data.access_token;
                        script.valid = true;
                        cargarWidgetPrototipo("valid");
                    } else {
                        console.error(response);
                        cargarWidgetPrototipo("error");
                    }
                })
                .catch(error => {
                    console.error('Error al obtener token:', error);
                    cargarWidgetPrototipo("error");
                });
                
                function cargarWidgetPrototipo(tipo_widget) {
                    // Carga el WidgetPrototipo
                    function crearWidgetHTML() {
                        var widgetHTML = `
                            <div class="widget-container" data-status="` + tipo_widget + `">
                                <div id="chat-circle" class="btn btn-raised">
                                    <div id="chat-overlay"></div>
                                    <i class="material-icons">chat</i>
                                </div>
                                <div class="chat-box">
                                    <div class="chat-box-header">
                                        ERROR DE ACTIVACION
                                        <span class="chat-box-toggle">
                                            <i class="material-icons">cancel</i>
                                        </span>
                                    </div>
                                    <div class="chat-box-body">
                                        <div class="chat-box-overlay"></div>
                                        <div class="chat-logs"></div>
                                    </div>
                                    <div class="chat-input">
                                        <form id="chat-form">
                                            <input type="text" id="chat-input" placeholder="Envía un mensaje..." autocomplete="off"/>
                                            <button type="submit" class="chat-submit" id="chat-submit">
                                                <i class="material-icons">send</i>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        `;
                        var widgetContainer = document.getElementById("chatbot-container");
                        widgetContainer.innerHTML = widgetHTML;
                    }
                    
                    cargarJS('https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.7/js/tether.min.js', function(){
                        cargarCSS('../static/css/WidgetPrototipo.css');
                        cargarCSS('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha.6/css/bootstrap.min.css');
                        cargarCSS('https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/4.0.2/bootstrap-material-design.css');
                        cargarCSS('https://fonts.googleapis.com/icon?family=Material+Icons');
                        cargarJS('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha.6/js/bootstrap.min.js', function() {
                            script.app_name = app_name;
                            script.flujo_id = flujo_id;
                            script.metadata = metadata;
                            cargarJS('../static/js/WidgetPrototipo.js', function(){
                                crearWidgetHTML();
                            });
                        });
                    });
                }
            });
        });
    };
}