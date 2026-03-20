"""API REST para clasificación de imágenes CIFAR-10."""

from contextlib import asynccontextmanager
from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

from src.config import ALLOWED_EXTENSIONS, MAX_FILE_SIZE
from src.logger_config import logger
from src.predict import Predictor

predictor = Predictor()


# ── Lifecycle ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Carga el modelo al iniciar; libera al apagar."""
    predictor.load()
    yield
    logger.info("Servicio apagado.")


app = FastAPI(
    title="CIFAR-10 Prediction Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Endpoints ─────────────────────────────────────────────
@app.get("/")
def home():
    return {"message": "Servicio de clasificación CIFAR-10. Usa /docs para probar."}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    filename = file.filename or ""
    ext = ("." + filename.rsplit(".", 1)[-1]).lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Extensión no permitida. Usa: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Archivo demasiado grande (máx 10 MB).")

    try:
        image = Image.open(BytesIO(content))
        image.verify()
        image = Image.open(BytesIO(content))
    except (UnidentifiedImageError, Exception):
        logger.warning(f"Archivo rechazado, no es imagen válida: {filename}")
        raise HTTPException(status_code=400, detail="El archivo no es una imagen válida.")

    try:
        result = predictor.predict(image)
    except Exception as e:
        logger.error(f"Error en predicción: {e}")
        raise HTTPException(status_code=500, detail="Error interno al procesar la imagen.")

    logger.info(f"Predicción: {result['prediction']} ({result['confidence']})")
    return result