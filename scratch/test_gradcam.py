import os
import numpy as np
import tensorflow as tf
import tf_keras as keras
from tf_keras.preprocessing import image
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "skindisease.h5")

def get_gradcam_heatmap(img_array, model, last_conv_layer_name):
    # 1. Create a model that maps the input image to the activations of the last conv layer as well as the output predictions
    grad_model = keras.models.Model(
        inputs=[model.inputs],
        outputs=[model.get_layer(last_conv_layer_name).output, model.output]
    )

    # 2. Compute the gradient of the top predicted class for our input image with respect to the activations of the last conv layer
    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        pred_index = tf.argmax(predictions[0])
        class_channel = predictions[:, pred_index]

    # 3. This is the gradient of the output neuron (top predicted class) with regard to the output feature map of the last conv layer
    grads = tape.gradient(class_channel, conv_outputs)

    # 4. Vector of shape (32,), where each entry is the mean intensity of the gradient over a specific feature map channel
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # 5. Multiply each channel in the feature map array by "how important this channel is" with regard to the top predicted class
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    # 6. For visualization purpose, we will also normalize the heatmap between 0 & 1
    heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
    return heatmap.numpy(), pred_index.numpy()

try:
    if not os.path.isfile(MODEL_PATH):
        print("Model file not found")
        exit(1)
        
    model = keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully.")
    
    # Generate dummy input of shape (1, 64, 64, 3)
    dummy_input = np.random.rand(1, 64, 64, 3).astype(np.float32)
    
    heatmap, pred_idx = get_gradcam_heatmap(dummy_input, model, "conv2d")
    print(f"Grad-CAM Heatmap generated successfully! Shape: {heatmap.shape}, Predicted Class Index: {pred_idx}")
    
except Exception as e:
    import traceback
    print("Error during Grad-CAM generation:")
    traceback.print_exc()
