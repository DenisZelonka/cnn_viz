import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';

const FeatureMapGrid = ({ activations, layerName }) => {
    const [canvases, setCanvases] = useState([]);

    useEffect(() => {
        if (!activations) return;

        const renderActivations = async () => {
            const [batch, h, w, c] = activations.shape;
            // Limit to first 64
            const numFilters = Math.min(c, 64);
            const newCanvases = [];

            const channels = tf.tidy(() => {
                const min = activations.min();
                const max = activations.max();
                const normalized = activations.sub(min).div(max.sub(min));
                return tf.unstack(normalized.squeeze([0]), 2).slice(0, numFilters);
            });

            for (let i = 0; i < numFilters; i++) {
                const tensor = channels[i];
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                await tf.browser.toPixels(tensor, canvas);
                newCanvases.push({ id: i, src: canvas.toDataURL() });
                tensor.dispose();
            }
            setCanvases(newCanvases);
        };

        renderActivations();
    }, [activations, layerName]);

    if (!activations) return <div className="text-center p-10">Loading activations...</div>;

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">
                Feature Maps (First {canvases.length})
                <span className="text-sm font-normal text-slate-500 ml-2">Layer: {layerName}</span>
            </h3>
            {/* Increased size by reducing columns: from grid-cols-4... to grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {canvases.map((item) => (
                    <div key={item.id} className="relative group">
                        <img
                            src={item.src}
                            alt={`Filter ${item.id}`}
                            className="w-full h-auto rounded border border-slate-200 shadow-sm bg-black custom-pixelated"
                            style={{ imageRendering: 'pixelated' }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                            <span className="text-white text-xs font-mono">{item.id}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeatureMapGrid;
