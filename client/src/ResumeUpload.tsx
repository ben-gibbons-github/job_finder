import React, { useState } from 'react';

interface ResumeUploadProps {
  onUpload?: (file: File) => void;
  onError?: (error: string) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUpload, onError }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const ACCEPTED_FORMATS = ['.txt', '.pdf', '.docx'];
  const ACCEPTED_MIME_TYPES = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const validateFile = (selectedFile: File): boolean => {
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!ACCEPTED_FORMATS.includes(fileExtension)) {
      const error = `Invalid file format. Accepted formats: ${ACCEPTED_FORMATS.join(', ')}`;
      onError?.(error);
      return false;
    }

    if (!ACCEPTED_MIME_TYPES.includes(selectedFile.type)) {
      const error = `Invalid file type. Accepted types: ${ACCEPTED_FORMATS.join(', ')}`;
      onError?.(error);
      return false;
    }

    return true;
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      onUpload?.(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    handleFileChange(selectedFile || null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    handleFileChange(droppedFile || null);
  };

  const handleRemove = () => {
    setFile(null);
  };

  return (
    <div className="resume-upload-container">
      <div
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="resume-input"
          accept=".txt,.pdf,.docx"
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
        <label htmlFor="resume-input" className="upload-label">
          <div className="upload-content">
            <p className="upload-icon">📄</p>
            <p className="upload-text">Drag and drop your resume here</p>
            <p className="upload-subtext">or click to select</p>
            <p className="upload-formats">Supported: .txt, .pdf, .docx</p>
          </div>
        </label>
      </div>

      {file && (
        <div className="file-info">
          <div className="file-details">
            <span className="file-icon">📎</span>
            <span className="file-name">{file.name}</span>
            <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
          </div>
          <button
            className="remove-button"
            onClick={handleRemove}
            aria-label="Remove file"
          >
            ✕
          </button>
        </div>
      )}

      <style>{`
        .resume-upload-container {
          width: 100%;
          max-width: 500px;
        }

        .upload-area {
          border: 2px dashed #cbd5e0;
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background-color: #f7fafc;
        }

        .upload-area:hover {
          border-color: #4299e1;
          background-color: #ebf8ff;
        }

        .upload-area.dragging {
          border-color: #4299e1;
          background-color: #ebf8ff;
          box-shadow: 0 0 10px rgba(66, 153, 225, 0.3);
        }

        .upload-label {
          cursor: pointer;
          display: block;
        }

        .upload-content {
          pointer-events: none;
        }

        .upload-icon {
          font-size: 40px;
          margin: 0 0 10px 0;
        }

        .upload-text {
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
          margin: 0 0 5px 0;
        }

        .upload-subtext {
          font-size: 14px;
          color: #718096;
          margin: 0 0 10px 0;
        }

        .upload-formats {
          font-size: 12px;
          color: #a0aec0;
          margin: 0;
        }

        .file-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          margin-top: 16px;
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 6px;
        }

        .file-details {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }

        .file-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .file-name {
          font-weight: 500;
          color: #166534;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-size {
          font-size: 12px;
          color: #86efac;
          flex-shrink: 0;
        }

        .remove-button {
          background-color: #dc2626;
          color: white;
          border: none;
          border-radius: 4px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.2s ease;
          flex-shrink: 0;
          margin-left: 8px;
        }

        .remove-button:hover {
          background-color: #b91c1c;
        }

        .remove-button:active {
          background-color: #991b1b;
        }
      `}</style>
    </div>
  );
};

export default ResumeUpload;
