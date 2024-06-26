function widget(client_id, client_secret, app_name) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.app_name = app_name;
    
    this.start = function() {
        //Función para cargar un archivo JS.
        function cargarJS(url, callback) {
            var script = document.createElement("script");
            script.src = url;
            script.onload = callback;
            document.head.appendChild(script);
        }

        //Función para cargar un archivo CSS.
        function cargarCSS(url) {
            var link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = url;
            document.head.appendChild(link);
        }

        cargarJS('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js', function() {
            cargarJS('../ModeloWidgetScript/Urls.js', function() {
                var token = null;
                var entorno_actual = 'local';
                
                //Obtiene el token de validación.
                $.ajax({
                    url: get_url_token(entorno_actual),
                    type: 'POST',
                    data: {
                        client_id: client_id,
                        client_secret: client_secret
                    },
                    success: function(response) {
                        console.log('Token obtenido:', response);
                        token = response.data.access_token;

                        //Valida la aplicación.
                        $.ajax({
                            url: get_url_app(entorno_actual, app_name),
                            type: 'GET',
                            headers: {
                                'Authorization': 'Bearer ' + token
                            },
                            data: {
                                app_name: app_name
                            },
                            success: function(response) {
                                console.log('Información de la aplicación obtenida:', response);
                                cargarWidgetPrototipo();
                            },
                            error: function(xhr, status, error) {
                                console.error('Error al obtener información de la aplicación:', error);
                                cargarWidgetError();
                            }
                        });
                    },
                    error: function(xhr, status, error) {
                        console.error('Error al obtener token:', error);
                        cargarWidgetError();
                    }
                });
                
                function cargarWidgetPrototipo() {
                    //Carga el WidgetPrototipo.
                    function crearWidgetHTML() {
                        var widgetHTML = `
                            <div class="widget-container">
                                <div id="chat-circle" class="btn btn-raised">
                                    <div id="chat-overlay"></div>
                                    <i class="material-icons">chat</i>
                                </div>
                                <div class="chat-box">
                                    <div class="chat-box-header">
                                        ECOM IA - CHAT BOT
                                        <span class="chat-box-toggle">
                                            <i class="material-icons">close</i>
                                        </span>
                                    </div>
                                    <div class="chat-box-body">
                                        <div class="chat-box-overlay"></div>
                                        <div class="chat-logs"></div>
                                    </div>
                                    <div class="chat-input">
                                        <form id="chat-form">
                                            <input type="text" id="chat-input" placeholder="Envía un mensaje..."/>
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
                        cargarCSS('../ModeloWidgetPrototipo/WidgetPrototipo.css');
                        cargarCSS('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha.6/css/bootstrap.min.css');
                        cargarCSS('https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/4.0.2/bootstrap-material-design.css');
                        cargarCSS('https://fonts.googleapis.com/icon?family=Material+Icons');
                        cargarJS('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha.6/js/bootstrap.min.js', function() {
                            cargarJS('../ModeloWidgetScript/WidgetPrototipo.js', function(){
                                crearWidgetHTML();
                            });
                        });
                    });
                }

                function cargarWidgetError() {
                    //Carga el WidgetError.
                    function crearWidgetHTML() {
                        var widgetHTML = `
                            <div class="widget-container">
                                <div id="chat-circle" class="btn btn-raised">
                                    <div id="chat-overlay"></div>
                                    <i class="material-icons">feedback</i>
                                </div>
                                <div class="chat-box">
                                    <div class="chat-box-header">
                                        ERROR DE ACTIVACIÓN
                                        <span class="chat-box-toggle">
                                            <i class="material-icons">close</i>
                                        </span>
                                    </div>
                                    <div class="chat-box-body">
                                        <div class="chat-box-overlay"></div>
                                        <div class="chat-logs"></div>
                                    </div>
                                    <div class="chat-input">
                                        <form id="chat-form">
                                            <input type="text" id="chat-input" placeholder="Envía un mensaje..."/>
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
                        cargarCSS('../ModeloWidgetError/WidgetError.css');
                        cargarCSS('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha.6/css/bootstrap.min.css');
                        cargarCSS('https://cdnjs.cloudflare.com/ajax/libs/bootstrap-material-design/4.0.2/bootstrap-material-design.css');
                        cargarCSS('https://fonts.googleapis.com/icon?family=Material+Icons');
                        cargarJS('https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha.6/js/bootstrap.min.js', function() {
                            cargarJS('../ModeloWidgetError/WidgetError.js', function(){
                                crearWidgetHTML();
                            });
                        });
                    });
                }
            });
        });
    };
}