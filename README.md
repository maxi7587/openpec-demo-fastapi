# 🧪 OpenSpec Workshop Demo — FastAPI (Order System)

## 🎯 Objetivo

Demostrar cómo:

* Detectar un bug real en un sistema
* Definir el comportamiento correcto con OpenSpec
* Implementar el fix alineado al spec

---

# 🚀 1. Setup inicial

## Crear entorno (opcional pero recomendado)

```bash
python -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows
```

## Instalar dependencias

```bash
pip install -r requirements.txt
```

---

# ▶️ 2. Levantar la app

```bash
uvicorn main:app --reload
```

👉 Abrir en el navegador:

* API: http://localhost:8000/order
* Docs interactivos: http://localhost:8000/docs

---

# 🧪 4. Probar la API

## Ver estado inicial

```bash
curl localhost:8000/order
```

👉 Respuesta esperada:

```json
{"status":"PENDING"}
```

---

## 🔴 Ejecutar acción inválida (BUG)

```bash
curl -X POST localhost:8000/ship
```

👉 Resultado:

```json
{"status":"SHIPPED"}
```

❗ **Problema:** el sistema permite enviar sin pagar

---

---

# 🧪 5. Tests

Tests are derived from the OpenSpec scenarios in `openspec/specs/order/spec.md` and `openspec/specs/ui/spec.md`.

## Run all tests

```bash
./run.sh test
```

## Run back-end tests only

```bash
./run.sh test be
```

Requires `pytest` and `httpx`:

```bash
pip install pytest httpx
```

## Run front-end tests only

```bash
./run.sh test fe
```

Requires Node.js 18+.

---

# 🧠 Takeaway

> OpenSpec no solo documenta el sistema.
> Define lo que está permitido.
