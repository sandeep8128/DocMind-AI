import { useRef, useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import api from "../services/api";

function UploadBox({ onUploadSuccess }) {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    setMessage("");
    setError("");

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF file.");
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    validateAndSetFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    validateAndSetFile(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setMessage("");

      const formData = new FormData();

      // IMPORTANT: backend expects "document"
      formData.append("document", file);

      const response = await api.post(
        "/documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(
        response.data.message ||
          "PDF uploaded successfully!"
      );

      setFile(null);

      // Dashboard ko new document ki information bhejo
      if (onUploadSuccess) {
        onUploadSuccess(response.data.document);
      }

      // File input reset
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to upload document"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=Inter:wght@400;500;600&display=swap');
        .font-voice { font-family: 'Source Serif 4', Georgia, serif; }
        .font-ui { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`font-ui cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragOver
            ? "border-[#E8A33D] bg-[#FAEEDA]/40"
            : "border-[#D3D1C7] bg-white hover:border-[#E8A33D]/60 hover:bg-[#F1EFE8]/40"
        }`}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F1EFE8]">
          <Upload size={22} className="text-[#5F5E5A]" />
        </div>

        {file ? (
          <>
            <div className="flex items-center justify-center gap-2 text-[#993C1D]">
              <FileText size={18} />
              <p className="font-medium text-[14px]">{file.name}</p>
            </div>

            <p className="mt-1.5 text-[12.5px] text-[#888780]">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </>
        ) : (
          <>
            <h3 className="font-voice text-[17px] text-[#1A1D24]">
              Upload your document
            </h3>

            <p className="mt-1.5 text-[13px] text-[#888780]">
              Drop a PDF here, or click to browse
            </p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Upload Button */}
      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="font-ui mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A1D24] px-5 py-2.5 text-[14px] font-medium text-[#FAF8F3] transition-all hover:bg-[#2C2F38] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload size={16} />
          {uploading ? "Uploading & indexing..." : "Upload and index document"}
        </button>
      )}

      {/* Success */}
      {message && (
        <div className="font-ui mt-4 flex items-center gap-2 rounded-lg border border-[#5DCAA5] bg-[#E1F5EE] px-4 py-2.5 text-[13px] text-[#085041]">
          <CheckCircle size={16} />
          {message}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="font-ui mt-4 flex items-center gap-2 rounded-lg border border-[#F0997B] bg-[#FAECE7] px-4 py-2.5 text-[13px] text-[#712B13]">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}

export default UploadBox;