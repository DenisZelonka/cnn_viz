import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const UploadView = ({ onImageUpload, isModelLoading }) => {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles?.length > 0) {
            const file = acceptedFiles[0];
            const reader = new FileReader();
            reader.onload = () => {
                onImageUpload(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }, [onImageUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false
    });

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                    Visualization of Convolutional Filters
                </h1>
                <p className="text-lg text-slate-600 mb-10">
                    Upload any photo to inspect how a Convolutional Neural Network sees it.
                    Explore feature maps, visualize filters, and understand predictions layer by layer.
                </p>

                <div
                    {...getRootProps()}
                    className={`
            border-2 border-dashed rounded-3xl p-12 cursor-pointer transition-all duration-300
            flex flex-col items-center justify-center bg-white shadow-xl
            ${isDragActive ? 'border-blue-500 bg-blue-50/50 scale-102' : 'border-slate-300 hover:border-blue-400 hover:shadow-2xl'}
          `}
                >
                    <input {...getInputProps()} />
                    <div className="bg-blue-100 p-4 rounded-full mb-6">
                        <Upload className="h-10 w-10 text-blue-600" />
                    </div>
                    {isDragActive ? (
                        <p className="text-xl font-medium text-blue-600">Drop the image here...</p>
                    ) : (
                        <>
                            <p className="text-xl font-medium text-slate-800 mb-2">Drag & drop an image here</p>
                            <p className="text-slate-500">or click to select one from your device</p>
                        </>
                    )}
                </div>

                {isModelLoading && (
                    <div className="mt-8 flex items-center justify-center space-x-2 text-slate-500 animate-pulse">
                        <Zap className="h-5 w-5 text-amber-500" />
                        <span>Loading Neural Network Model (ResNet/MobileNet)...</span>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default UploadView;
