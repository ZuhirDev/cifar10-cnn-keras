<div align="center">

# CIFAR-10 Image Classifier

**Clasificador de imágenes basado en CNN, desplegado como microservicios con Docker y Kubernetes.**

![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15-FF6F00?logo=tensorflow&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.x-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Shadcn_UI](https://img.shields.io/badge/shadcn%2Fui-000000?logo=shadcnui&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5?logo=kubernetes&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)

[Arquitectura](#arquitectura) · [Modelo](#el-modelo) · [Inicio Rápido](#inicio-rápido) · [API](#api-reference) · [Kubernetes](#despliegue-en-kubernetes) · [Dev Container](#desarrollo-con-dev-container)

</div>

---

## 📋 Tabla de Contenidos

- [¿Qué es este proyecto?](#-qué-es-este-proyecto)
- [El Modelo de ML](#-el-modelo-de-ml)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Orquestación con Kubernetes (K8s)](#-orquestación-con-kubernetes-k8s)
- [Puesta en Marcha](#-puesta-en-marcha)
- [Desarrollo con Dev Container (GPU)](#-desarrollo-con-dev-container-gpu)
- [API Reference (Endpoints)](#-api-reference-endpoints)

---

## 🧐 ¿Qué es este proyecto?

Este sistema implementa un clasificador de imágenes capaz de reconocer objetos de 10 categorías del dataset CIFAR-10. Utiliza un flujo de trabajo moderno: el usuario interactúa con un API Gateway seguro que gestiona la petición y delega la computación pesada a un servicio de inferencia especializado.

Las **10 clases** que puede reconocer son:

| Índice | Clase |
|--------|-------|
| 0 | ✈️ Avión |
| 1 | 🚗 Automóvil |
| 2 | 🐦 Pájaro |
| 3 | 🐱 Gato |
| 4 | 🦌 Ciervo |
| 5 | 🐶 Perro |
| 6 | 🐸 Rana |
| 7 | 🐴 Caballo |
| 8 | 🚢 Barco |
| 9 | 🚛 Camión |

---

## 🧠 El Modelo de ML

- **Dataset:** CIFAR-10 (60,000 imágenes de 32x32 píxeles).  
- **Arquitectura:** CNN con capas de Dropout y normalización para maximizar la precisión.  
- **Entrenamiento:** Puedes consultar el proceso detallado en el siguiente cuaderno -> [**cifar10_cnn_keras**](./ai-service/notebooks/cifar10_cnn_keras.ipynb)

---

## 🏗️ Arquitectura del Sistema

La clave del diseño es la separación de responsabilidades para garantizar seguridad y escalabilidad:

### api-gateway (Node.js/Express)
- **Proxy Inverso:** Único punto de entrada expuesto.
- **Seguridad:** Implementa Rate Limiting para evitar abusos.
- **Eficiencia:** Gestiona el I/O de archivos de imagen sin bloquear la lógica de IA.

### ai-service (Python/FastAPI + TensorFlow)
- **Privacidad:** Aislado en la red interna del clúster; no es accesible desde el exterior.
- **Inferencia:** Carga el modelo `.keras` y procesa las imágenes mediante TensorFlow.
- **Validación:** Uso de Pydantic para garantizar que los datos de entrada son correctos.

### frontend (React/Vite + shadcn/ui)
- **Interfaz Moderna:** Desarrollo de SPA con React y empaquetado ultra-rápido con Vite.
- **Funcionalidades:** Subida de imágenes tipo Drag & Drop, Galería de ejemplos integrados y monitorización visual del estado de salud del modelo en tiempo real.
- **Integración:** Servido en producción por el API Gateway, o de manera independiente usando el servidor de desarrollo de Vite.

---


## 📂 Estructura del Proyecto

```text
.

├── .devcontainer/          # Entorno de desarrollo aislado con GPU
├── ai-service/              # Microservicio de Inferencia (Python)
│   ├── app/                 # Código fuente FastAPI
│   ├── models/              # Modelos .keras entrenados
│   └── notebook/            # Entrenamiento y experimentación
├── api-gateway/             # Microservicio Proxy (Node.js)
│   ├── src/                 # Lógica de Express y Middleware
│   └── .env.example         # Configuración de variables
├── frontend/                # Interfaz de Usuario (React + Vite)
│   ├── src/                 # Componentes, lógica (App.tsx, ImageClassifier)
│   └── public/              # Assets estáticos y ejemplos
├── infrastructure/          # Archivos de Orquestación
    ├── docker-compose.yml   # Despliegue local rápido
    └── k8s/                 # Manifiestos (Deploy, Service, HPA)
```

---

## 🎡 Orquestación con Kubernetes (K8s)

El proyecto incluye manifiestos para un despliegue de grado de producción con las siguientes características:

- **Autoescalado Horizontal (HPA):** El sistema monitoriza el consumo de CPU de los Pods de IA. Si la carga supera el 50%, Kubernetes escala automáticamente de 2 a 5 réplicas.
- **Self-Healing:** Si un contenedor falla, Kubernetes lo detecta y lo reinicia automáticamente para mantener el "estado deseado".
- **Service Discovery:** Comunicación interna mediante nombres DNS (`http://ai-service-internal`), eliminando el uso de IPs estáticas.
- **Resource Management:** Cuotas de CPU y RAM definidas para evitar el agotamiento de recursos del nodo.

---

## 🚀 Puesta en Marcha

### Opción A: Despliegue en Kubernetes (Producción)
1. Desplegar los manifiestos:  
   ```bash
   kubectl apply -f infrastructure/k8s/
   ```

2. Verificar el estado del clúster:  
   ```bash
   kubectl get all
   ```

3. Probar el endpoint:  
   ```bash
   curl -X POST http://localhost:8080/predict -F "file=@assets/avion.jpg"
   ```
>Nota: En el despliegue de Kubernetes, el Horizontal Pod Autoscaler monitoriza el consumo y escalará los servicios automáticamente.

### Opción B: Docker Compose (Desarrollo)
1. Levantar servicios:  
   ```bash
   cd infrastructure
   docker compose up -d --build
   ```

2. Probar el endpoint (Puerto 3000):  
   ```bash
   curl -X POST http://localhost:3000/predict -F "file=@assets/avion.jpg"
   ```
### Opción C: Desarrollo Frontend Aislado (React + Vite)
Para trabajar exclusivamente en la interfaz web de manera local:
1. Navegar a la carpeta del frontend e instalar dependencias:
   ```bash
   cd frontend
   npm install
   ```
2. Compilar la aplicación y lanzar el servidor de previsualización de Vite:
   ```bash
   npm run build
   npm run preview
   ```
   > **Nota**: Alternativamente, puedes usar `npm run dev` para activar el Hot Module Replacement (HMR).

---

# 💻 Desarrollo con Dev Container (GPU)

El proyecto está configurado para **VS Code Dev Containers**, diseñado específicamente para el entorno de Python:

- **Aislamiento:** Entorno basado en `tensorflow/tensorflow:2.15.0-gpu-jupyter`.
- **Hardware:** Acceso directo a la GPU del host mediante NVIDIA Container Toolkit.
- **Comodidad:** Extensiones de Python, Jupyter y Pylance preconfiguradas.

## 📝 API Reference (Endpoints)

El **API Gateway** (Puerto 8080 en K8s / 3000 en Docker) expone las siguientes rutas:

---

### 1. Predicción de Imágenes

**POST** `/predict`

- **Descripción:** Endpoint principal. Recibe una imagen y la envía al servicio de IA para su clasificación.  
- **Body:** `multipart/form-data` con el campo `file`.  
- **Lógica:** El Gateway recibe el buffer de la imagen mediante **multer** y lo reenvía al servicio de IA usando **axios** y **form-data**.  
- **Seguridad:** Implementa un Rate Limit de 10 peticiones por minuto.  

**Ejemplo de uso (cURL):**
```bash
curl -X POST http://localhost:8080/predict -F "file=@assets/avion.jpg"
```

### 2. Estados de Salud (Health Checks)

**GET** `/`

- Mensaje de bienvenida simple para verificar que el Gateway responde. 

**GET** `/health`

- Comprueba el estado interno del API Gateway.

**GET** `/health/ai-service`

- Verificación en cascada: el Gateway intenta comunicarse con el servicio de IA (/health de Python).
- Permite diagnosticar rápidamente si el problema de conexión es del Gateway o del motor de inferencia.
