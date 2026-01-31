import React, { useEffect, useRef, useState } from 'react';
import { projectToRGB } from '../utils/visHelper';
import * as tf from '@tensorflow/tfjs';

const PcaProjector = ({ activations, layerName }) => {
    const canvasRef = useRef(null);
    const [originalShape, setOriginalShape] = useState(null);

    useEffect(() => {
        if (!activations) return;

        const [b, h, w, c] = activations.shape;
        setOriginalShape(`${h}x${w} (${c} filters)`);

        const draw = async () => {
            const rgbTensor = await projectToRGB(activations);
            if (rgbTensor && canvasRef.current) {
                await tf.browser.toPixels(rgbTensor, canvasRef.current);
                rgbTensor.dispose();
            }
        };
        draw();
    }, [activations]);

    return (
        // Flex-col ensures text is above image on all sizes
        <div className="mt-8 flex flex-col items-center bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Dimensional Reduction</h3>
            <p className="text-sm text-slate-500 mb-2 text-center max-w-lg">
                Projection of all channels into 3 RGB dimensions.
            </p>
            {originalShape && (
                <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded-full mb-6">
                    Original Size: {originalShape} → Resized to 224x224
                </div>
            )}

            <div className="relative p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                <canvas ref={canvasRef} className="rounded custom-pixelated w-full max-w-sm h-auto" />
            </div>
        </div>
    );
};

export default PcaProjector;
