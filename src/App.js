import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import './App.css';

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
    <div className="App">
      <div className="container">
        <div {...getRootProps()} className="dropzone">
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the JPEG here...</p>
          ) : (
            <p>Drag and drop a JPEG here, or click to select file</p>
          )}
        </div>

        {loading && <p>Compressing image...</p>}

        {compressedImage && (
          <div className="result">
            <h3>Compressed Image:</h3>
            {originalSize && compressedSize && (
              <div className="size-comparison">
                <p>Original size: {(originalSize / 1024 / 1024).toFixed(2)} MB</p>
                <p>Compressed size: {(compressedSize / 1024 / 1024).toFixed(2)} MB</p>
                <p>Compression ratio: {((1 - compressedSize / originalSize) * 100).toFixed(1)}%</p>
              </div>
            )}
            <img src={compressedImage} alt="Compressed" />
            <a href={compressedImage} download="compressed-image.jpg" className="download-btn">
              Download Compressed Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
