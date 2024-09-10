const valores_de_entorno = {
    "local": {
        "base": "http://127.0.0.1:8003/api/v1/"
    },
    "test": {
        "base": "https://chatbot.ecomdev.ar/api/v1/"
    },
    "produccion": {
        "base": "https://chatbot.ecom.com.ar/api/v1/"
    }
};

const entorno = "local";

function get_url_base() {
    return valores_de_entorno[entorno]["base"];
}

function get_url_token() {
    return get_url_base(entorno) + "aplicaciones/token/";
}

function get_url_conversacion() {
    return get_url_base(entorno) + "mensajes/conversacion/";
}