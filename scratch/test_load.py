import os
import warnings

# Suppress TensorFlow C++ and oneDNN warning/info logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Suppress general python warnings (Deprecation/User warnings)
warnings.filterwarnings('ignore', category=DeprecationWarning)
warnings.filterwarnings('ignore', category=UserWarning)

try:
    # Suppress TensorFlow Python API level warning logging
    import tensorflow as tf
    tf.get_logger().setLevel('ERROR')
    import tensorflow.python.util.deprecation as deprecation
    deprecation._PRINT_DEPRECATION_WARNINGS = False
except Exception:
    pass

import numpy as np
import tf_keras as keras


print("Imports successful")

# Use absolute path for model loading
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "skindisease.h5")

print(f"Loading model from: {MODEL_PATH}")

try:
    model = keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
