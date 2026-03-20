"""Configuración centralizada del proyecto."""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv() 

# Rutas base
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
LOGS_DIR = BASE_DIR / "logs"

# Modelo
MODEL_FILENAME = os.getenv("MODEL_FILENAME", "cifar10_enhanced_20260319_220420.keras")
MODEL_PATH = MODELS_DIR / MODEL_FILENAME

# API
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp"}
