#!/usr/bin/env python3

import re
import time
import nltk
import spacy
import tiktoken
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from transformers import AutoTokenizer
from nltk.tokenize import word_tokenize
from typing import List, Dict, Any
import uvicorn

# Descargar recursos de NLTK
nltk.download('punkt', quiet=True)

app = FastAPI(
    title="Tokenizador API",
    description="API para comparar diferentes métodos de tokenización",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar archivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

class TextInput(BaseModel):
    text: str

class TokenizationResult(BaseModel):
    method: str
    tokens: List[str]
    execution_time: float
    token_count: int

# Función para medir el tiempo de ejecución
def medir_tiempo(func):
    def wrapper(*args, **kwargs):
        inicio = time.time()
        resultado = func(*args, **kwargs)
        fin = time.time()
        tiempo = (fin - inicio) * 1000
        return resultado, tiempo
    return wrapper

@app.get("/")
async def read_root():
    return FileResponse("static/index.html")

@app.post("/tokenize", response_model=List[TokenizationResult])
async def tokenize_text(input_data: TextInput):
    texto = input_data.text
    results = []

    # 1. Tokenización con expresiones regulares
    @medir_tiempo
    def tokenizar_regex():
        tokens_con_espacios = []
        last_end = 0

        for match in re.finditer(r'\b\w+\b|[^\w\s]', texto):
            start, end = match.span()
            if start > last_end:
                tokens_con_espacios.append(texto[last_end:start])
            tokens_con_espacios.append(match.group())
            last_end = end

        if last_end < len(texto):
            tokens_con_espacios.append(texto[last_end:])

        return [t for t in tokens_con_espacios if re.match(r'\b\w+\b|[^\w\s]', t)]

    tokens, tiempo = tokenizar_regex()
    results.append(TokenizationResult(
        method="Regex",
        tokens=tokens,
        execution_time=tiempo,
        token_count=len(tokens)
    ))

    # 2. Tokenización con NLTK
    @medir_tiempo
    def tokenizar_nltk():
        return word_tokenize(texto, language='spanish')

    tokens, tiempo = tokenizar_nltk()
    results.append(TokenizationResult(
        method="NLTK",
        tokens=tokens,
        execution_time=tiempo,
        token_count=len(tokens)
    ))

    # 3. Tokenización con spaCy
    @medir_tiempo
    def tokenizar_spacy():
        nlp = spacy.load("es_core_news_sm")
        doc = nlp(texto)
        return [token.text for token in doc]

    tokens, tiempo = tokenizar_spacy()
    results.append(TokenizationResult(
        method="spaCy",
        tokens=tokens,
        execution_time=tiempo,
        token_count=len(tokens)
    ))

    # 4. Tokenización con BERT
    @medir_tiempo
    def tokenizar_bert():
        tokenizer = AutoTokenizer.from_pretrained("dccuchile/bert-base-spanish-wwm-uncased")
        return tokenizer.tokenize(texto)

    try:
        tokens, tiempo = tokenizar_bert()
        results.append(TokenizationResult(
            method="BERT",
            tokens=tokens,
            execution_time=tiempo,
            token_count=len(tokens)
        ))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en tokenización BERT: {str(e)}")

    # 5. Tokenización con tiktoken
    @medir_tiempo
    def tokenizar_tiktoken():
        encoding = tiktoken.get_encoding("cl100k_base")
        tokens = encoding.encode(texto)
        return [encoding.decode([token]) for token in tokens]

    try:
        tokens, tiempo = tokenizar_tiktoken()
        results.append(TokenizationResult(
            method="tiktoken",
            tokens=tokens,
            execution_time=tiempo,
            token_count=len(tokens)
        ))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en tokenización tiktoken: {str(e)}")

    return results

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)