import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [compressedImage, setCompressedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);

  const compressImage = async (imageFile) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };

    try {
      setLoading(true);
      setOriginalSize(imageFile.size);
      
      const compressedFile = await imageCompression(imageFile, options);
      setCompressedSize(compressedFile.size);
      
      const url = URL.createObjectURL(compressedFile);
      setCompressedImage(url);
      setLoading(false);
    } catch (error) {
      console.error('Error compressing image:', error);
      setLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/jpeg')) {
      compressImage(file);
    } else {
      alert('Please upload a JPEG image');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg']
    }
  });

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div 
          {...getRootProps()} 
          className={`p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-gray-900' 
              : 'border-gray-700 bg-gray-900 hover:border-gray-600'}`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-400">
            {isDragActive ? 'Drop the JPEG here...' : 'Drag and drop a JPEG here, or click to select file'}
          </p>
        </div>

        {loading && (
          <div className="mt-6 text-center">
            <p className="text-blue-400">Compressing image...</p>
          </div>
        )}

        {compressedImage && (
          <div className="mt-8 bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-800">
            <h3 className="text-xl font-medium text-white mb-4">Compressed Image</h3>
            {originalSize && compressedSize && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-800/50 p-4 rounded-xl">
                <p className="text-sm text-gray-400">
                  Original size: {(originalSize / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-sm text-gray-400">
                  Compressed size: {(compressedSize / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-sm text-blue-400 font-medium">
                  Compression ratio: {((1 - compressedSize / originalSize) * 100).toFixed(1)}%
                </p>
              </div>
            )}
            
            <motion.div 
              className="relative group"
              whileHover="hover"
              initial="initial"
            >
              <img 
                src={compressedImage} 
                alt="Compressed" 
                className="w-full rounded-xl" 
              />
              <motion.a
                href={compressedImage}
                download="compressed-image.jpg"
                className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl"
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
                  <Download className="w-12 h-12 text-white/90" />
                </motion.div>
              </motion.a>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
