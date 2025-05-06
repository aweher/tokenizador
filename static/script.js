// Colores para los tokens
const TOKEN_COLORS = [
    '#FF5733', '#33A8FF', '#33FF57', '#D433FF', '#FFD433',
    '#FF33A8', '#33FFD4', '#A833FF', '#33FFA8', '#FF33D4'
];

// Texto por defecto
const DEFAULT_TEXT = "The couch has accepted me as one of its own, and I can't betray its trust.";

// Función para cargar el texto por defecto
function loadDefaultText() {
    try {
        console.log('Cargando texto por defecto...');
        setTextAndTokenize(DEFAULT_TEXT);
    } catch (error) {
        console.error('Error al cargar el texto por defecto:', error);
        showError(`Error al cargar el texto por defecto: ${error.message}`);
    }
}

// Función para establecer el texto y tokenizar
function setTextAndTokenize(text) {
    const textInput = document.getElementById('textInput');
    if (!textInput) {
        console.error('No se encontró el elemento textInput');
        return;
    }
    
    textInput.value = text;
    
    // Disparar el evento de tokenización automáticamente
    const form = document.getElementById('tokenizeForm');
    if (form) {
        console.log('Disparando tokenización automática...');
        form.dispatchEvent(new Event('submit'));
    } else {
        console.error('No se encontró el formulario de tokenización');
    }
}

// Cargar el texto por defecto cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando carga del texto...');
    loadDefaultText();
    
    // También intentar cargar el texto cuando el formulario esté listo
    const form = document.getElementById('tokenizeForm');
    if (form) {
        form.addEventListener('load', () => {
            console.log('Formulario cargado, intentando cargar texto nuevamente...');
            loadDefaultText();
        });
    }
});

// Función para generar un color aleatorio
function getRandomColor() {
    return TOKEN_COLORS[Math.floor(Math.random() * TOKEN_COLORS.length)];
}

// Función para crear un elemento token
function createTokenElement(token) {
    const span = document.createElement('span');
    span.className = 'token';
    span.textContent = token;
    span.style.color = getRandomColor();
    return span;
}

// Función para mostrar los resultados de tokenización
function displayTokenizationResults(results) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    results.forEach(result => {
        const container = document.createElement('div');
        container.className = 'token-container';

        // Título del método
        const title = document.createElement('h3');
        title.className = 'method-title';
        title.textContent = `Tokenización con ${result.method}`;
        container.appendChild(title);

        // Tiempo de ejecución
        const timeInfo = document.createElement('div');
        timeInfo.className = 'execution-time';
        timeInfo.textContent = `Tiempo de ejecución: ${result.execution_time.toFixed(2)} ms`;
        container.appendChild(timeInfo);

        // Número de tokens
        const countInfo = document.createElement('div');
        countInfo.className = 'token-count';
        countInfo.textContent = `Número de tokens: ${result.token_count}`;
        container.appendChild(countInfo);

        // Contenedor de tokens
        const tokensContainer = document.createElement('div');
        tokensContainer.className = 'tokens-display';

        // Mostrar tokens
        result.tokens.forEach(token => {
            if (token.trim() === '') {
                const space = document.createElement('span');
                space.className = 'token-space';
                tokensContainer.appendChild(space);
            } else {
                tokensContainer.appendChild(createTokenElement(token));
            }
        });

        container.appendChild(tokensContainer);
        resultsContainer.appendChild(container);
    });

    // Crear tabla comparativa
    createComparisonTable(results);
}

// Función para crear la tabla comparativa
function createComparisonTable(results) {
    const tableContainer = document.getElementById('comparisonTable');
    tableContainer.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'table table-striped comparison-table';

    // Crear encabezado
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Método', 'Número de Tokens', 'Tiempo (ms)'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Crear cuerpo de la tabla
    const tbody = document.createElement('tbody');
    results.forEach(result => {
        const row = document.createElement('tr');
        
        const methodCell = document.createElement('td');
        methodCell.textContent = result.method;
        row.appendChild(methodCell);

        const countCell = document.createElement('td');
        countCell.textContent = result.token_count;
        row.appendChild(countCell);

        const timeCell = document.createElement('td');
        timeCell.textContent = result.execution_time.toFixed(2);
        row.appendChild(timeCell);

        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    tableContainer.appendChild(table);
}

// Función para mostrar el spinner de carga
function showLoading() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
        <div class="loading">
            <div class="spinner-border loading-spinner text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Procesando texto...</p>
        </div>
    `;
}

// Función para mostrar errores
function showError(message) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = `
        <div class="alert alert-danger" role="alert">
            ${message}
        </div>
    `;
}

// Manejar el envío del formulario
document.getElementById('tokenizeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const textInput = document.getElementById('textInput');
    const text = textInput.value.trim();

    if (!text) {
        showError('Por favor, ingrese un texto para tokenizar');
        return;
    }

    showLoading();

    try {
        const response = await fetch('/tokenize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error en la tokenización');
        }

        const results = await response.json();
        displayTokenizationResults(results);
    } catch (error) {
        console.error('Error:', error);
        showError(`Error al procesar el texto: ${error.message}`);
    }
});