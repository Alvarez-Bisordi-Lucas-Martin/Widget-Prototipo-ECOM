## Ofuscación y Minimización

1. **Ejecutar para el CSS:**
    - npm install terser
    - terser src/static/js/widget_chatbot.js -o src/static/js/widget_chatbot.min.js -m -c

2. **Ejecutar para el JS:**
    - npm install cssnano-cli
    - cssnano src/static/css/widget_chatbot.css src/static/css/widget_chatbot.min.css

## Desploy image using Docker
    - docker build -t python/chatbot_widget .
    - docker run -it  --env-file .env -p 9000:8088 python/chatbot_widget

## Configuración de Credenciales

1. **Crea el archivo de configuración:**
   - Crea un archivo `config.js` en la carpeta src del proyecto con el siguiente contenido:

    ```javascript
    var config = {
        api_key: 'tu_client_secret',
        app_name: 'tu_app_name',
        flujo_id: 'tu_flujo_id',
        metadata: {
            'username': 'tu_username',
            'first_name': 'tu_first_name',
            'last_name': 'tu_last_name'
        },
        // local | test
        entorno_actual: 'tu_entorno_actual',
        // local | test | github
        url_script: 'tu_url_script',
        // izq | der
        posicion: 'der',
        // small | medium | big
        bubble_size: 'medium'
    };

    if (config.entorno_actual === 'test') {
        config.api_key = 'tu_client_secret_dev',
        config.app_name = 'tu_app_name_dev',
        config.flujo_id = 'tu_flujo_id_dev'
    }
    
    if (config.url_script === 'local') {
        config.url_script = '../static/js/widget_chatbot.js'
    }
    else if (config.url_script === 'test') {
        config.url_script = 'http://ecom-chatbot-widget.ecomdev.ar/js/widget_chatbot.min.js'
    }
    else {
        config.url_script = 'https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/src/static/js/widget_chatbot.js'
    }
    ```
