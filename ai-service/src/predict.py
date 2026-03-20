"""Lógica de predicción CIFAR-10 desacoplada de la API."""

from pathlib import Path

import numpy as np
import tensorflow as tf
from PIL import Image

from src.config import MODEL_PATH
from src.logger_config import logger

CIFAR10_CLASSES = [
    "avion", "automovil", "pajaro", "gato", "ciervo",
    "perro", "rana", "caballo", "barco", "camion",
]

class Predictor:
    """Carga el modelo una vez y expone predict()."""

    def __init__(self, model_path: Path = MODEL_PATH):
        self._model_path = model_path
        self._model: tf.keras.Model | None = None

    def load(self) -> None:
        try:
            logger.info(f"Cargando modelo desde {self._model_path}...")
            if not self._model_path.exists():
                raise FileNotFoundError(f"No se ha encontrado el modelo en: {self._model_path}")
            self._model = tf.keras.models.load_model(str(self._model_path))
            logger.info("Modelo cargado correctamente.")
        except Exception as e:
            logger.error(f"Error al cargar el modelo: {e}")
            raise

    def predict(self, image: Image.Image) -> dict:
        """Recibe una PIL Image (RGB), retorna predicción."""
        if self._model is None:
            raise RuntimeError("El modelo no está cargado. Llama a load() primero.")

        img = image.convert("RGB").resize((32, 32))
        arr = np.array(img, dtype="float32") / 255.0
        arr = np.expand_dims(arr, axis=0)  # (1, 32, 32, 3)

        preds = self._model.predict(arr, verbose=0)
        idx = int(np.argmax(preds[0]))
        confidence = float(preds[0][idx])

        return {
            "prediction": CIFAR10_CLASSES[idx],
            "confidence": f"{confidence:.2%}",
            "class_index": idx,
        }