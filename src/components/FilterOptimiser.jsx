import React, { useState, useRef, useEffect } from 'react';
import { maximizeFilter } from '../utils/visHelper';
import { Play, RotateCcw } from 'lucide-react';

const FilterOptimiser = ({ layerName }) => {
    const [filterIndex, setFilterIndex] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const canvasRef = useRef(null);

    const runOptimization = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        setProgress(0);

        // Clear canvas
        const ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 224, 224);

        // Run
        try {
            const result = await maximizeFilter(layerName, filterIndex, 60, 0.05, (pixels, iter) => {
                // Live preview not fully implemented to save perf, usually just final result
                // But let's try updating progress
                setProgress(Math.round((iter / 60) * 100));
            });

            if (result) {
                const imageData = new ImageData(result, 224, 224);
                ctx.putImageData(imageData, 0, 0);
            }
        } catch (e) {
            console.error(e);
        }

        setIsProcessing(false);
        setProgress(100);
    };

    return (
        <div className="mt-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Filter Pattern Visualization (Deep Dream)</h3>
            <p className="text-sm text-slate-500 mb-6">
                See what pattern maximizes the activation of a specific filter.
                This reveals what this specific neuron is "looking for".
            </p>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex flex-col space-y-4 w-full md:w-1/3">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Filter Index used: {filterIndex}</label>
                        <input
                            type="number"
                            min="0"
                            max="511"
                            value={filterIndex}
                            onChange={(e) => setFilterIndex(parseInt(e.target.value))}
                            className="w-full border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        onClick={runOptimization}
                        disabled={isProcessing}
                        className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${isProcessing ? 'bg-slate-300 text-slate-500' : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {isProcessing ? (
                            <span>Optimizing... {progress}%</span>
                        ) : (
                            <>
                                <Play className="h-4 w-4" />
                                <span>Visualize Pattern</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="relative">
                    <canvas
                        ref={canvasRef}
                        width={224}
                        height={224}
                        className="bg-black rounded-lg shadow-inner border border-slate-300"
                    />
                    <div className="absolute top-2 right-2 text-xs text-white/50 font-mono">224x224</div>
                </div>
            </div>
        </div>
    );
};

export default FilterOptimiser;
