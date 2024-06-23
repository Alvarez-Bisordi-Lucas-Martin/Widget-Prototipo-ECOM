const valores_de_entorno = {
    "local": {
        "base": "http://localhost:8000/api/v1/"
    },
    "test": {
        "base": "https://chatbot.ecomdev.ar/api/v1/"
    },
    "produccion": {
        "base": "https://chatbot.ecom.com.ar/api/v1/"
    }
};

function get_url_base(entorno) {
    return valores_de_entorno[entorno]["base"];
}

function get_url_mensaje(entorno) {
    return get_url_base(entorno) + "mensajes/";
}

function get_url_token(entorno) {
    return get_url_base(entorno) + "token/";
}

function get_url_app(entorno) {
    return get_url_base(entorno) + "app/";
}