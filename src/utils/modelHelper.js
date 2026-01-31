import * as tf from '@tensorflow/tfjs';

const MODEL_URL = 'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json';
// Note: This is a Layers Model which allows easier access to layers.

let model = null;

export const loadModel = async () => {
    try {
        // Try loading as LayersModel first (cleaner for visualization)
        model = await tf.loadLayersModel(MODEL_URL);
        console.log('Model loaded (LayersModel)');

        // Warmup
        const zeros = tf.zeros([1, 224, 224, 3]);
        model.predict(zeros).dispose();
        zeros.dispose();

        return model;
    } catch (e) {
        console.error('Failed to load LayersModel', e);
        throw e;
    }
};

export const getModel = () => model;

export const getLayers = () => {
    if (!model) return [];
    // Filter for layers to visualize
    return model.layers
        .filter(l =>
            l.name.includes('conv') ||
            l.name.includes('depthwise') ||
            l.name.includes('batch') ||
            l.name.includes('activation') ||
            l.name.includes('relu')
        )
        .map(l => ({
            name: l.name,
            outputShape: l.outputShape
        }));
};

export const preprocessImage = (imageElement) => {
    return tf.tidy(() => {
        let tensor = tf.browser.fromPixels(imageElement)
            .resizeNearestNeighbor([224, 224])
            .toFloat();

        // Normalize to [-1, 1] for MobileNet
        const offset = tf.scalar(127.5);
        return tensor.sub(offset).div(offset).expandDims();
    });
};

export const predict = async (imageElement) => {
    if (!model) await loadModel();

    const tensor = preprocessImage(imageElement);
    const predictions = await model.predict(tensor).data();
    tensor.dispose();

    // Map to Imagenet classes
    let classes = {};
    try {
        const { fetchClasses } = await import('./imagenetClasses');
        classes = await fetchClasses();
    } catch (e) {
        console.warn('Could not load classes', e);
    }

    // classes is { index: name }
    const top5 = Array.from(predictions)
        .map((p, i) => ({ probability: p, className: classes[i] || `Class ${i}` }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 5);

    return top5;
};

export const getActivation = (imageElement, layerName) => {
    if (!model) return null;

    return tf.tidy(() => {
        const tensor = preprocessImage(imageElement);
        const layer = model.getLayer(layerName);

        // Create a new model that outputs the activation of the specific layer
        const subModel = tf.model({
            inputs: model.inputs,
            outputs: layer.output
        });

        const activation = subModel.predict(tensor);
        return activation;
    });
};
