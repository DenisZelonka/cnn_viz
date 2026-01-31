import React, { useState, useEffect } from 'react';
import FeatureMapGrid from './FeatureMapGrid';
import PcaProjector from './PcaProjector';
import AttributionVisualizer from './AttributionVisualizer';
import { getActivation } from '../utils/modelHelper';

const LayerVisualizer = ({ model, layerName, imageElement }) => {
    const [activations, setActivations] = useState(null);
    const [viewMode, setViewMode] = useState('activations');

    useEffect(() => {
        if (!model || !layerName || !imageElement) return;

        const actPromise = getActivation(imageElement, layerName);
        if (actPromise) {
            setActivations(actPromise);
        }

        return () => {
        };
    }, [model, layerName, imageElement]);

    useEffect(() => {
        return () => {
            if (activations) {
                try {
                    activations.dispose();
                } catch (e) { }
            }
        }
    }, [activations]);

    return (
        <div className="space-y-6">
            <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
                {['activations', 'pca', 'attribution'].map(mode => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`pb-2 px-3 text-sm font-medium whitespace-nowrap transition-colors capitalize ${viewMode === mode
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {mode === 'pca' ? '3D Projection' : mode === 'attribution' ? 'Importance (Saliency)' : mode}
                    </button>
                ))}
            </div>

            {viewMode === 'activations' && (
                <FeatureMapGrid activations={activations} layerName={layerName} />
            )}

            {viewMode === 'pca' && (
                <PcaProjector activations={activations} layerName={layerName} />
            )}

            {viewMode === 'attribution' && (
                <AttributionVisualizer imageElement={imageElement} />
            )}
        </div>
    );
};

export default LayerVisualizer;
