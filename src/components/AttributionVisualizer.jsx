import React, { useEffect, useRef, useState } from 'react';
import { computeSaliency } from '../utils/visHelper';
import * as tf from '@tensorflow/tfjs';

const AttributionVisualizer = ({ imageElement }) => {
    const canvasRef = useRef(null);
    const overlayRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const runSaliency = async () => {
        if (!imageElement) return;
        setLoading(true);
        try {
            const saliencyTensor = await computeSaliency(imageElement);
            if (saliencyTensor) {
                // saliencyTensor is [1, 224, 224, 1]
                const saliencyRank3 = saliencyTensor.squeeze([0]); // [224, 224, 1]

                // 1. Draw pure Saliency (Grayscale)
                await tf.browser.toPixels(saliencyRank3, canvasRef.current);

                // 2. Draw "Bitwise And" / Masked Image
                const imgTensor = tf.browser.fromPixels(imageElement)
                    .resizeNearestNeighbor([224, 224])
                    .toFloat()
                    .div(255); // [224, 224, 3]

                // Multiply: [224, 224, 3] * [224, 224, 1] (broadcasts last dim)
                const masked = imgTensor.mul(saliencyRank3);

                await tf.browser.toPixels(masked, overlayRef.current);

                masked.dispose();
                imgTensor.dispose();
                saliencyRank3.dispose();
                saliencyTensor.dispose();
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    useEffect(() => {
        runSaliency();
    }, [imageElement]);

    return (
        <div className="mt-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Importance Analysis</h3>
            <p className="text-sm text-slate-500 mb-6">
                Visualizing which pixels contributed most to the prediction.
            </p>

            <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold uppercase text-slate-400 mb-2">Saliency Map</span>
                    <div className="relative p-1 bg-white border border-slate-200 shadow-sm rounded-lg">
                        <canvas ref={canvasRef} className="rounded w-64 h-64" />
                    </div>
                </div>

                <div className="text-slate-300 font-bold text-xl">+</div>

                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold uppercase text-slate-400 mb-2">Focus (Masked Image)</span>
                    <div className="relative p-1 bg-white border border-slate-200 shadow-sm rounded-lg">
                        <canvas ref={overlayRef} className="rounded w-64 h-64" />
                    </div>
                </div>
            </div>

            {loading && <div className="text-center text-sm text-slate-400 mt-4 animate-pulse">Computing gradients...</div>}
        </div>
    );
};

export default AttributionVisualizer;
