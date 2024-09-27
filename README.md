## Configuración de Credenciales

1. **Crea el archivo de configuración:**
   - Crea un archivo `config.js` en la carpeta src del proyecto con el siguiente contenido:

    ```javascript
    var config = {
        client_id: 'tu_client_id',
        client_secret: 'tu_client_secret',
        app_name: 'tu_app_name',
        flujo_id: 'tu_flujo_id',
        metadata: {
            'username': 'tu_username',
            'first_name': 'tu_first_name',
            'last_name': 'tu_last_name',
            'fecha_hora': new Date()
        },
        // local | test
        entorno_actual: 'tu_entorno_actual',
        // local | test | github
        url_script: 'tu_url_script'
    };

    if (config.entorno_actual === 'test') {
        config.client_id = 'tu_client_id_dev',
        config.client_secret = 'tu_client_secret_dev',
        config.app_name = 'tu_app_name_dev',
        config.flujo_id = 'tu_flujo_id_dev'
    }
    
    if (config.url_script === 'local') {
        config.url_script = '../static/js/widget_chatbot.js'
    }
    else if (config.url_script === 'test') {
        config.url_script = 'http://ecom-chatbot-widget.ecomdev.ar/js/widget_chatbot.js'
    }
    else {
        config.url_script = 'https://alvarez-bisordi-lucas-martin.github.io/Widget-Prototipo-ECOM/src/static/js/widget_chatbot.js'
    }
    ```