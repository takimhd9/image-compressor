import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [compressedImages, setCompressedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const simulateProgress = async (fileName) => {
    for (let progress = 0; progress <= 100; progress += 2) {
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: progress
      }));
      await new Promise(resolve => setTimeout(resolve, 40));
    }
  };

  const compressImage = async (imageFile) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };

    try {
      const compressedFile = await imageCompression(imageFile, options);
      const url = URL.createObjectURL(compressedFile);
      
      return {
        url,
        originalSize: imageFile.size,
        compressedSize: compressedFile.size,
        name: imageFile.name
      };
    } catch (error) {
      console.error('Error compressing image:', error);
      return null;
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    setLoading(true);
    const validFiles = acceptedFiles.filter(file => file.type.startsWith('image/jpeg'));
    
    if (validFiles.length !== acceptedFiles.length) {
      alert('Some files were skipped. Please upload only JPEG images.');
    }

    const newFiles = validFiles.map(file => ({
      name: file.name,
      processing: true,
      progress: 0
    }));
    
    setCompressedImages(prev => [...prev, ...newFiles]);

    // Process each file
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      
      // Wait for progress simulation to complete
      await simulateProgress(file.name);
      
      // Update the progress in compressedImages as well
      setCompressedImages(prev => prev.map(item =>
        item.name === file.name
          ? { ...item, progress: 100 }
          : item
      ));

      // Compress the image
      const compressedResult = await compressImage(file);

      if (compressedResult) {
        setCompressedImages(prev => prev.map(item => 
          item.name === file.name 
            ? { 
                ...compressedResult, 
                processing: false,
                progress: 100
              }
            : item
        ));
      }

      // Small delay before starting the next file
      if (i < validFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    setLoading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg']
    }
  });

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div 
          {...getRootProps()} 
          className={`p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-gray-900' 
              : 'border-gray-700 bg-gray-900 hover:border-gray-600'}`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-400">
            {isDragActive ? 'Drop the JPEGs here...' : 'Drag and drop JPEG files here, or click to select files'}
          </p>
        </div>

        {loading && (
          <div className="mt-6 text-center">
            <p className="text-blue-400">Compressing images...</p>
          </div>
        )}

        <motion.div 
          className="mt-8 space-y-4"
          layout
        >
          {compressedImages.map((image, index) => (
            <motion.div
              key={image.name + index}
              className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              layout
            >
              <div className="flex items-center gap-4 p-4">
                <motion.div 
                  className="relative w-24 h-24 flex-shrink-0"
                  whileHover="hover"
                  initial="initial"
                >
                  {!image.processing && image.progress === 100 ? (
                    <>
                      <img 
                        src={image.url} 
                        alt="Compressed" 
                        className="w-24 h-24 object-cover rounded-lg" 
                      />
                      <motion.a
                        href={image.url}
                        download={`compressed-${image.name}`}
                        className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center"
                        variants={{
                          initial: { opacity: 0 },
                          hover: { opacity: 1 }
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          variants={{
                            initial: { scale: 0.8, opacity: 0 },
                            hover: { scale: 1, opacity: 1 }
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <Download className="w-6 h-6 text-white/90" />
                        </motion.div>
                      </motion.a>
                    </>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gray-800 flex items-center justify-center">
                      <motion.div 
                        className="w-12 h-12 rounded-full border-2 border-blue-500/30"
                        style={{
                          borderRightColor: 'rgb(59 130 246)',
                        }}
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    </div>
                  )}
                </motion.div>

                <div className="flex-grow min-w-0">
                  <h3 className="text-sm font-medium text-white mb-1 truncate">
                    {image.name}
                  </h3>
                  {!image.processing && image.progress === 100 ? (
                    <div className="flex gap-4 text-xs">
                      <p className="text-gray-400">
                        {(image.originalSize / 1024 / 1024).toFixed(2)} MB
                        <span className="mx-2">→</span>
                        {(image.compressedSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-blue-400">
                        {((1 - image.compressedSize / image.originalSize) * 100).toFixed(1)}% saved
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs text-gray-400">
                        Processing...
                      </div>
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress[image.name] || image.progress || 0}%` }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default App;
