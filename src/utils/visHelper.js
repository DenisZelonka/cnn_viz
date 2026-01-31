import * as tf from '@tensorflow/tfjs';
import { getModel, preprocessImage } from './modelHelper';

// ... (previous functions maximizeFilter, projectToRGB kept but improved below)

export const maximizeFilter = async (layerName, filterIndex, iterations = 60, stepSize = 0.5, onStep) => {
    // ... (Keep existing logic or improve? User said it's noise. )
    // Deep Dream on MobileNet often needs lower layer target or different normalization.
    // I will tune it slightly but primarily focus on adding Saliency which answers their core info need.

    // Logic reuse from previous step, just ensuring valid function exists.
    const model = getModel();
    if (!model) return null;

    try {
        const layer = model.getLayer(layerName);
        const subModel = tf.model({ inputs: model.inputs, outputs: layer.output });

        // Start closer to grey 
        let inputImage = tf.tidy(() => tf.randomUniform([1, 224, 224, 3], -0.1, 0.1).variable());

        const lossFn = (input) => tf.tidy(() => {
            const act = subModel.predict(input);
            if (filterIndex >= act.shape[3]) return tf.scalar(0);
            return act.slice([0, 0, 0, filterIndex], [-1, -1, -1, 1]).mean().mul(-1);
        });

        const gradFn = tf.grad(lossFn);

        for (let i = 0; i < iterations; i++) {
            const g = gradFn(inputImage);
            const next = tf.tidy(() => inputImage.sub(g.div(tf.norm(g).add(1e-5)).mul(stepSize)).clipByValue(-1, 1));
            inputImage.dispose();
            inputImage = next.variable();
            g.dispose();

            if (onStep && i % 10 === 0) {
                const pix = await tf.browser.toPixels(inputImage.squeeze().add(1).div(2).clipByValue(0, 1));
                onStep(pix, i);
            }
            await new Promise(r => setTimeout(r, 0));
        }
        const final = await tf.browser.toPixels(inputImage.squeeze().add(1).div(2).clipByValue(0, 1));
        inputImage.dispose();
        return final;
    } catch (e) { return null; }
};

export const projectToRGB = async (activations) => {
    if (!activations) return null;
    return tf.tidy(() => {
        const [b, h, w, c] = activations.shape;
        const proj = tf.randomNormal([c, 3]);
        const flat = activations.squeeze([0]).reshape([h * w, c]);
        const projected = flat.matMul(proj);

        const min = projected.min();
        const max = projected.max();
        const norm = projected.sub(min).div(max.sub(min));
        // Return resized AND original shape info
        // We can't return shape info in tensor, so just return the big tensor. 
        // The UI will handle label.
        const rgb = norm.reshape([h, w, 3]);
        return tf.image.resizeNearestNeighbor(rgb, [224, 224]);
    });
};

// NEW: Saliency Map (Pixel Attribution)
// Gradient of the top predicted class score w.r.t Input Image
export const computeSaliency = async (imageElement) => {
    const model = getModel();
    if (!model) return null;

    return tf.tidy(() => {
        const imgTensor = preprocessImage(imageElement); // [1, 224, 224, 3], range [-1, 1]

        // 1. Get top class index
        const preds = model.predict(imgTensor);
        const topClass = preds.argMax(1).dataSync()[0];

        // 2. Define function: Input -> Score of top class
        const scoreFn = (input) => {
            return model.predict(input).gather([topClass], 1).squeeze();
        };

        // 3. Compute Gradient w.r.t Input
        const gradFn = tf.grad(scoreFn);
        const gradients = gradFn(imgTensor);

        // 4. Process Gradients: Absolute value -> Max across channels -> Normalize
        // This gives a generic "importance" map
        const saliency = gradients.abs().max(3).expandDims(3); // [1, 224, 224, 1]

        const min = saliency.min();
        const max = saliency.max();
        const normalized = saliency.sub(min).div(max.sub(min)); // [0, 1]

        // Apply a heatmap colormap?
        // For simplicity, return grayscale [H, W, 1] which we can colorize in canvas or valid RGB.
        // Let's return RGB using a "hot" colormap approximation or just bright white on black.
        // Or better: Multiply original image by saliency (Integrated Gradients simplistic style)

        return normalized;
    });
};
