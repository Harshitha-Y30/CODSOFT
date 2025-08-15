import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle

resnet_model = ResNet50(weights='imagenet')
model_new = Model(resnet_model.input, resnet_model.layers[-2].output)

def extract_features(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    features = model_new.predict(img_array, verbose=0)
    return features
dummy_vocab = {
    "startseq": 1, "a": 2, "man": 3, "riding": 4, "horse": 5, "endseq": 6
}
inv_vocab = {v: k for k, v in dummy_vocab.items()}
def generate_caption(features):
    return "a man riding horse"
if __name__ == "__main__":
    img_path = "test.jpg"  # replace with your own image
    features = extract_features(img_path)
    caption = generate_caption(features)
    print("Generated Caption:", caption)
