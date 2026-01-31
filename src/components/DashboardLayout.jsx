import React, { useMemo } from 'react';
import { Layers, Github, RefreshCw } from 'lucide-react';

const DashboardLayout = ({ children, resetApp, currentLayer, onLayerSelect, layers = [] }) => {

    const groupedLayers = useMemo(() => {
        const groups = {};
        layers.forEach(layer => {
            const match = layer.name.match(/_(\d+)/) || layer.name.match(/(\d+)/);
            const groupKey = match ? `Block ${match[1]}` : 'Initial';
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(layer);
        });
        return groups;
    }, [layers]);

    const getLayerStyle = (name) => {
        if (name.endsWith('_bn') || name.includes('batch')) {
            return 'bg-amber-100 text-amber-800 border-amber-200';
        }
        if (name.endsWith('relu') || name.includes('activation')) {
            return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        }
        if (name.includes('conv') || name.includes('depthwise')) {
            return 'bg-red-100 text-red-800 border-red-200';
        }
        return 'bg-slate-100 text-slate-600 border-slate-200';
    };

    const getReadableName = (name) => {
        // Determine context (Depthwise vs Pointwise)
        let suffix = "";
        if (name.includes('dw')) suffix = " (Depthwise)";
        else if (name.includes('pw')) suffix = " (Pointwise)";
        else if (name.includes('depthwise')) suffix = " (Depthwise)";

        if (name.includes('_bn') || name.includes('batch')) {
            return `Batch Normalization${suffix}`;
        }
        if (name.includes('relu') || name.includes('activation')) {
            return `Activation${suffix}`; // "Activation (Depthwise)" etc.
        }
        // Determine Type
        if (name.includes('conv')) {
            if ((name.includes('dw') || name.includes('depthwise')) && (!name.includes('_bn') && !name.includes('relu'))) return "Convolution (Depthwise)";
            if (name.includes('pw') || name.includes('pointwise') && (!name.includes('_bn') && !name.includes('relu'))) return "Convolution (Pointwise)";
            return "Convolution";
        }


        return name;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center cursor-pointer" onClick={resetApp}>
                            <Layers className="h-8 w-8 text-blue-600 mr-3" />
                            <span className="font-bold text-xl tracking-tight">NeuralVis</span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={resetApp}
                                className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>New Image</span>
                            </button>
                            <div className="h-6 w-px bg-slate-200 mx-2"></div>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-800">
                                <Github className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                </div>

                {layers.length > 0 && (
                    <div className="border-t border-slate-100 bg-white shadow-inner overflow-x-auto">
                        <div className="max-w-7xl mx-auto px-4 py-3">
                            <div className="flex space-x-8 min-w-max">
                                {Object.entries(groupedLayers).sort((a, b) => {
                                    const numA = parseInt(a[0].replace(/\D/g, '')) || 0;
                                    const numB = parseInt(b[0].replace(/\D/g, '')) || 0;
                                    return numA - numB;
                                }).map(([groupName, groupLayers]) => (
                                    <div key={groupName} className="flex flex-col space-y-2">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pl-1">
                                            {groupName}
                                        </span>
                                        <div className="flex space-x-2">
                                            {groupLayers.map(layer => (
                                                <button
                                                    key={layer.name}
                                                    onClick={() => onLayerSelect(layer.name)}
                                                    className={`px-3 py-1.5 text-xs font-mono rounded border transition-all ${currentLayer === layer.name
                                                        ? 'ring-2 ring-offset-1 ring-slate-900 shadow-md font-bold'
                                                        : 'hover:brightness-95 opacity-80 hover:opacity-100'
                                                        } ${getLayerStyle(layer.name)}`}
                                                    title={layer.name}
                                                >
                                                    {getReadableName(layer.name)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
