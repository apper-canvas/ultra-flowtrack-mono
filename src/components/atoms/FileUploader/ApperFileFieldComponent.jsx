import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const ApperFileFieldComponent = ({ elementId, config }) => {
  // State for UI-driven values
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs for tracking lifecycle and preventing memory leaks
  const mountedRef = useRef(false);
  const elementIdRef = useRef(elementId);
  const existingFilesRef = useRef([]);

  // Update elementIdRef when elementId changes
  useEffect(() => {
    elementIdRef.current = elementId;
  }, [elementId]);

  // Memoize existingFiles to prevent unnecessary re-renders
  const memoizedExistingFiles = useMemo(() => {
    const files = config.existingFiles || [];
    // Return empty array if no files, otherwise check for actual changes
    if (!files || files.length === 0) return [];
    
    // Detect changes by comparing length and first file's ID/id
    const prevFiles = existingFilesRef.current;
    if (files.length !== prevFiles.length) return files;
    if (files.length > 0 && prevFiles.length > 0) {
      const currentFirstId = files[0]?.Id || files[0]?.id;
      const prevFirstId = prevFiles[0]?.Id || prevFiles[0]?.id;
      if (currentFirstId !== prevFirstId) return files;
    }
    
    return prevFiles; // No changes detected
  }, [config.existingFiles]);

  // Initial Mount Effect
  useEffect(() => {
    let mounted = true;
    
    const initializeSDK = async () => {
      if (!elementIdRef.current || !config) return;
      
      try {
        // Wait for ApperSDK to load - max 50 attempts × 100ms = 5 seconds
        let attempts = 0;
        while (!window.ApperSDK && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.ApperSDK) {
          throw new Error('ApperSDK not loaded. Please ensure the SDK script is included before this component.');
        }
        
        if (!mounted) return; // Component unmounted during wait
        
        const { ApperFileUploader } = window.ApperSDK;
        
        // Mount the file field with full config
        await ApperFileUploader.FileField.mount(elementIdRef.current, {
          ...config,
          existingFiles: memoizedExistingFiles
        });
        
        if (mounted) {
          mountedRef.current = true;
          setIsReady(true);
          setError(null);
          existingFilesRef.current = memoizedExistingFiles;
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setIsReady(false);
        }
      }
    };
    
    initializeSDK();
    
    // Cleanup on component destruction
    return () => {
      mounted = false;
      if (mountedRef.current && window.ApperSDK && elementIdRef.current) {
        try {
          const { ApperFileUploader } = window.ApperSDK;
          ApperFileUploader.FileField.unmount(elementIdRef.current);
        } catch (err) {
          console.error('Error unmounting file field:', err);
        }
      }
      mountedRef.current = false;
      setIsReady(false);
    };
  }, [elementId, config.fieldName, config.tableName, config.apperProjectId, config.apperPublicKey]);

  // File Update Effect
  useEffect(() => {
    if (!isReady || !window.ApperSDK || !config.fieldKey || !mountedRef.current) return;
    
    // Deep equality check with existing files
    const filesChanged = JSON.stringify(memoizedExistingFiles) !== JSON.stringify(existingFilesRef.current);
    if (!filesChanged) return;
    
    const updateFiles = async () => {
      try {
        const { ApperFileUploader } = window.ApperSDK;
        
        // Check format and convert if needed
        let filesToUpdate = memoizedExistingFiles;
        
        // Format detection: check for .Id vs .id property
        if (filesToUpdate.length > 0 && filesToUpdate[0].hasOwnProperty('Id')) {
          // Convert from API format to UI format
          filesToUpdate = ApperFileUploader.toUIFormat(filesToUpdate);
        }
        
        // Update files or clear field based on content
        if (filesToUpdate.length > 0) {
          await ApperFileUploader.FileField.updateFiles(config.fieldKey, filesToUpdate);
        } else {
          await ApperFileUploader.FileField.clearField(config.fieldKey);
        }
        
        existingFilesRef.current = memoizedExistingFiles;
      } catch (err) {
        setError(`Error updating files: ${err.message}`);
      }
    };
    
    updateFiles();
  }, [memoizedExistingFiles, isReady, config.fieldKey]);

  // Error UI
  if (error) {
    return (
      <motion.div 
        className="p-4 bg-error-50 border border-error-200 rounded-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center space-x-2">
          <ApperIcon name="AlertCircle" className="w-5 h-5 text-error-500" />
          <div>
            <h3 className="text-sm font-medium text-error-800">File Upload Error</h3>
            <p className="text-sm text-error-600 mt-1">{error}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main container - Always render with unique ID */}
      <div 
        id={elementIdRef.current} 
        className="min-h-[100px] border-2 border-dashed border-slate-300 rounded-lg bg-slate-50"
      >
        {/* Loading UI - Show when !isReady */}
        {!isReady && (
          <div className="flex items-center justify-center p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
              <span className="text-sm text-slate-600">Loading file uploader...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Help text */}
      <p className="text-xs text-slate-500 mt-2">
        You can attach files to provide additional context for this task.
      </p>
    </motion.div>
  );
};

export default ApperFileFieldComponent;