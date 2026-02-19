import { useState, useCallback } from 'react';
import { uploadModel } from '../lib/api';

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const upload = useCallback(async (file) => {
    // Validate file
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['glb', 'gltf'].includes(ext)) {
      setError('Only .glb and .gltf files are supported');
      return null;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File is too large. Maximum size is 50MB.');
      return null;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress phases
      setUploadProgress(20);
      const data = await uploadModel(file);
      setUploadProgress(100);

      if (data.success) {
        return data;
      } else {
        setError(data.message || 'Upload failed');
        return null;
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Upload failed';
      setError(message);
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { upload, uploading, uploadProgress, error, clearError };
}
