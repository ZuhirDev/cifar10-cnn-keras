"""Script de entrenamiento del modelo CIFAR-10."""

from datetime import datetime
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.callbacks import EarlyStopping
from src.config import MODELS_DIR
from src.data_loader import get_cifar10_data
from src.logger_config import logger

TRAIN_EPOCHS = 50
TRAIN_BATCH_SIZE = 32

def build_model() -> tf.keras.Model:
    """Arquitectura CNN optimizada para CIFAR-10."""
    model = models.Sequential([
        # CNN
        layers.Conv2D(32, (3, 3), activation="relu", padding="same", input_shape=(32, 32, 3)),
        layers.BatchNormalization(),

        layers.Conv2D(32, (3, 3), activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.2),

        layers.Conv2D(64, (3, 3), activation="relu", padding="same"),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.3),

        # Dense
        layers.Flatten(),
        layers.Dense(128, activation="relu"),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(10, activation="softmax"),
    ])

    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    return model


def train():
    logger.info("Iniciando proceso de entrenamiento...")

    (x_train, y_train), (x_test, y_test) = get_cifar10_data()

    model = build_model()
    logger.info("Arquitectura del modelo construida y compilada.")

    early_stopping = EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True)

    logger.info(f"Entrenando por {TRAIN_EPOCHS} epocas, batch_size={TRAIN_BATCH_SIZE}...")
    model.fit(
        x_train, y_train,
        epochs=TRAIN_EPOCHS,
        batch_size=TRAIN_BATCH_SIZE,
        validation_split=0.2,
        callbacks=[early_stopping],
        verbose=1,
    )

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_path = MODELS_DIR / f"cifar10_enhanced_{timestamp}.keras"
    model.save(str(model_path))
    logger.info(f"Modelo guardado: {model_path}")

    loss, acc = model.evaluate(x_test, y_test, verbose=0)
    logger.info(f"Resultado Final -> Accuracy: {acc:.4f} | Loss: {loss:.4f}")


if __name__ == "__main__":
    train()