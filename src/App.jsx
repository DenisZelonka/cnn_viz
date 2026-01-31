import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from './components/DashboardLayout';
import UploadView from './components/UploadView';
import LayerVisualizer from './components/LayerVisualizer';
import { loadModel, getLayers, predict } from './utils/modelHelper';
import * as tf from '@tensorflow/tfjs';

function App() {
  const [model, setModel] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [layers, setLayers] = useState([]);
  const [currentLayer, setCurrentLayer] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isModelLoading, setIsModelLoading] = useState(true);

  const imageRef = useRef(null);

  useEffect(() => {
    // Load model on mount
    const initModel = async () => {
      try {
        await tf.ready(); // Wait for backend
        const loadedModel = await loadModel();
        setModel(loadedModel);
        setLayers(getLayers());
        setIsModelLoading(false);
      } catch (err) {
        console.error("Model load failed", err);
        setIsModelLoading(false);
      }
    };
    initModel();
  }, []);

  const handleImageUpload = (src) => {
    setImageSrc(src);
    // Reset state
    setPredictions([]);
    setCurrentLayer(null);
  };

  const handleImageLoad = async () => {
    if (model && imageRef.current) {
      // Run prediction
      const preds = await predict(imageRef.current);
      setPredictions(preds);
      // Select first conv layer by default
      if (layers.length > 0) {
        setCurrentLayer(layers[0].name);
      }
    }
  };

  const resetApp = () => {
    setImageSrc(null);
    setPredictions([]);
    setCurrentLayer(null);
  };

  return (
    <DashboardLayout
      resetApp={resetApp}
      currentLayer={currentLayer}
      onLayerSelect={setCurrentLayer}
      layers={layers}
    >
      {!imageSrc ? (
        <UploadView onImageUpload={handleImageUpload} isModelLoading={isModelLoading} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar: Original Image & Predictions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Input Image</h3>
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Input"
                onLoad={handleImageLoad}
                className="w-full rounded-lg"
                crossOrigin="anonymous"
              />
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Predictions</h3>
              <div className="space-y-3">
                {predictions.map((p, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700 truncate w-3/4">{p.className}</span>
                      <span className="text-slate-500">{(p.probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 ">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${p.probability * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {predictions.length === 0 && <p className="text-sm text-slate-400">Analyzing...</p>}
              </div>
            </div>
          </div>

          {/* Main Content: Visualization */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[500px]">
            {currentLayer ? (
              <LayerVisualizer
                model={model}
                layerName={currentLayer}
                imageElement={imageRef.current}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                Select a layer to visualize
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default App;
