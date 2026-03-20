"""Carga del dataset CIFAR-10 desde Keras."""

from tensorflow.keras.datasets import cifar10
from src.logger_config import logger

def get_cifar10_data():
    """Descarga/carga CIFAR-10 y devuelve arrays normalizados."""
    logger.info("Descargando/Cargando dataset CIFAR-10...")
    (x_train, y_train), (x_test, y_test) = cifar10.load_data()

    x_train = x_train.astype("float32") / 255.0
    x_test = x_test.astype("float32") / 255.0

    logger.info(f"Datos cargados: Train {x_train.shape}, Test {x_test.shape}")
    return (x_train, y_train), (x_test, y_test)


if __name__ == "__main__":
    get_cifar10_data()