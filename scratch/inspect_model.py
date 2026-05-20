import os
import tf_keras as keras

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "skindisease.h5")

if os.path.isfile(MODEL_PATH):
    try:
        model = keras.models.load_model(MODEL_PATH)
        print("Model summary:")
        model.summary()
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print("Model file not found")
