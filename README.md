# API de Tokenización

Esta API permite comparar diferentes métodos de tokenización para texto en español, incluyendo Regex, NLTK, spaCy, BERT y tiktoken.

## Requisitos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)
- Docker y Docker Compose (opcional)

## Instalación

### Método 1: Instalación Local

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd tokenizador
```

2. Crear un entorno virtual (opcional pero recomendado):
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. Instalar las dependencias:
```bash
pip install -r requirements.txt
```

4. Descargar el modelo de spaCy para español:
```bash
python -m spacy download es_core_news_sm
```

### Método 2: Usando Docker

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd tokenizador
```

2. Construir y ejecutar con Docker Compose:
```bash
docker-compose up --build
```

## Uso

### Método 1: Instalación Local

1. Iniciar el servidor:
```bash
python app.py
```

2. La API estará disponible en `http://localhost:8000`

### Método 2: Usando Docker

1. La aplicación se inicia automáticamente al ejecutar `docker-compose up`
2. La API estará disponible en `http://localhost:8000`

## Características

- Interfaz web interactiva
- Visualización de tokens con colores
- Medición de tiempo de ejecución
- Tabla comparativa de resultados
- Recarga automática de código en desarrollo
- Soporte para Docker con hot-reload

## Endpoints

### POST /tokenize
Envía texto para ser tokenizado por diferentes métodos.

Ejemplo de uso con curl:
```bash
curl -X POST "http://localhost:8000/tokenize" \
     -H "Content-Type: application/json" \
     -d '{"text": "Los hermanos sean unidos porque esa es la ley primera"}'
```

La respuesta incluirá los resultados de tokenización de cada método, incluyendo:
- Método utilizado
- Lista de tokens
- Tiempo de ejecución
- Número total de tokens

## Métodos de Tokenización

1. **Regex**: Tokenización básica usando expresiones regulares
2. **NLTK**: Tokenización usando la biblioteca NLTK
3. **spaCy**: Tokenización usando el modelo de spaCy para español
4. **BERT**: Tokenización usando el modelo BERT en español
5. **tiktoken**: Tokenización usando el tokenizador de OpenAI 

## Desarrollo

El proyecto está configurado con hot-reload tanto para desarrollo local como para Docker. Los cambios en el código se reflejarán automáticamente sin necesidad de reiniciar el servidor. 