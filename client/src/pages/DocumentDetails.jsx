import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  HardDrive,
  Layers,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Pencil,
  Trash2,
} from "lucide-react";

import api from "../services/api";

function DocumentDetails() {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isRenaming, setIsRenaming] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ==========================================
  // FETCH DOCUMENT
  // ==========================================

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/documents/${documentId}`);

        const foundDocument = response.data?.document;

        if (!foundDocument) {
          setError("Document not found");
          return;
        }

        setDocument(foundDocument);
        setNewFileName(foundDocument.fileName || "");
      } catch (err) {
        console.error("Document Details Error:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load document"
        );
      } finally {
        setLoading(false);
      }
    };

    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  // ==========================================
  // RENAME
  // ==========================================

  const handleRename = async () => {
    if (!newFileName.trim()) {
      return;
    }

    try {
      setRenameLoading(true);

      const response = await api.put(`/documents/${documentId}`, {
        fileName: newFileName.trim(),
      });

      setDocument((prev) => ({
        ...prev,
        fileName:
          response.data?.document?.fileName ||
          newFileName.trim(),
      }));

      setIsRenaming(false);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to rename document"
      );
    } finally {
      setRenameLoading(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${document?.fileName}"?\n\nThis will also delete its chat history and indexed data.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(true);

      await api.delete(`/documents/${documentId}`);

      navigate("/dashboard");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete document"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // ==========================================
  // SHARED AMBIENT BACKDROP (matches Dashboard.jsx)
  // ==========================================

  const AmbientBackdrop = () => (
    <>
      <style>{`
        @keyframes driftA {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(26px, 18px) scale(1.08); }
          66%  { transform: translate(-14px, 30px) scale(0.96); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes driftB {
          0%   { transform: translate(0px, 0px) scale(1); }
          40%  { transform: translate(-30px, 24px) scale(1.1); }
          75%  { transform: translate(18px, -16px) scale(0.94); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes driftC {
          0%   { transform: translate(0px, 0px) scale(1); }
          50%  { transform: translate(20px, -28px) scale(1.06); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.85; }
          50%      { opacity: 1; }
        }
        @keyframes gridPan {
          0%   { background-position: 0px 0px; }
          100% { background-position: 42px 84px; }
        }
        @keyframes docDrift1 {
          0%   { transform: translate(0px, 0px) rotate(-6deg); }
          50%  { transform: translate(24px, -34px) rotate(-3deg); }
          100% { transform: translate(0px, 0px) rotate(-6deg); }
        }
        @keyframes docDrift2 {
          0%   { transform: translate(0px, 0px) rotate(8deg); }
          50%  { transform: translate(-30px, 28px) rotate(11deg); }
          100% { transform: translate(0px, 0px) rotate(8deg); }
        }
        @keyframes docDrift3 {
          0%   { transform: translate(0px, 0px) rotate(-3deg); }
          50%  { transform: translate(20px, 26px) rotate(1deg); }
          100% { transform: translate(0px, 0px) rotate(-3deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .bg-blob, .bg-grid, .bg-doc { animation: none !important; }
        }
      `}</style>

      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(680px 420px at 12% -6%, rgba(232,163,61,0.16), transparent 60%),
            radial-gradient(560px 420px at 92% 8%, rgba(61,220,151,0.08), transparent 60%),
            radial-gradient(900px 620px at 50% 115%, rgba(255,138,91,0.07), transparent 60%)
          `,
        }}
      />

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="bg-blob absolute"
          style={{
            top: "-14%",
            left: "6%",
            width: "680px",
            height: "480px",
            background: "radial-gradient(closest-side, rgba(232,163,61,0.20), transparent 72%)",
            animation: "driftA 22s ease-in-out infinite, glowPulse 9s ease-in-out infinite",
            willChange: "transform, opacity",
          }}
        />
        <div
          className="bg-blob absolute"
          style={{
            top: "2%",
            right: "2%",
            width: "560px",
            height: "460px",
            background: "radial-gradient(closest-side, rgba(61,220,151,0.11), transparent 72%)",
            animation: "driftB 27s ease-in-out infinite, glowPulse 11s ease-in-out infinite",
            animationDelay: "0s, 2s",
            willChange: "transform, opacity",
          }}
        />
        <div
          className="bg-blob absolute"
          style={{
            bottom: "-18%",
            left: "28%",
            width: "900px",
            height: "620px",
            background: "radial-gradient(closest-side, rgba(255,138,91,0.09), transparent 70%)",
            animation: "driftC 32s ease-in-out infinite, glowPulse 13s ease-in-out infinite",
            animationDelay: "0s, 4s",
            willChange: "transform, opacity",
          }}
        />
      </div>

      <div
        className="bg-grid pointer-events-none fixed inset-0 z-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          maskImage: "radial-gradient(ellipse 70% 50% at 50% 0%, black 40%, transparent 100%)",
          animation: "gridPan 16s linear infinite",
        }}
      />

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden sm:block">
        {[
          { top: "10%", left: "3%", w: 88, anim: "docDrift1 26s ease-in-out infinite", opacity: 0.05 },
          { top: "60%", left: "1%", w: 66, anim: "docDrift3 21s ease-in-out infinite", opacity: 0.045, delay: "3s" },
          { top: "14%", right: "5%", w: 76, anim: "docDrift2 24s ease-in-out infinite", opacity: 0.05, delay: "1.5s" },
          { top: "66%", right: "4%", w: 96, anim: "docDrift1 30s ease-in-out infinite", opacity: 0.04, delay: "5s" },
        ].map((doc, i) => (
          <svg
            key={i}
            className="bg-doc absolute"
            style={{
              top: doc.top,
              left: doc.left,
              right: doc.right,
              width: doc.w,
              height: doc.w * 1.28,
              opacity: doc.opacity,
              animation: doc.anim,
              animationDelay: doc.delay || "0s",
            }}
            viewBox="0 0 60 76"
            fill="none"
          >
            <rect x="1" y="1" width="58" height="74" rx="6" stroke="#F4C77B" strokeWidth="2" />
            <line x1="11" y1="18" x2="49" y2="18" stroke="#F4C77B" strokeWidth="2" strokeLinecap="round" />
            <line x1="11" y1="29" x2="49" y2="29" stroke="#F4C77B" strokeWidth="2" strokeLinecap="round" />
            <line x1="11" y1="40" x2="38" y2="40" stroke="#F4C77B" strokeWidth="2" strokeLinecap="round" />
            <line x1="11" y1="55" x2="44" y2="55" stroke="#F4C77B" strokeWidth="2" strokeLinecap="round" />
            <line x1="11" y1="64" x2="30" y2="64" stroke="#F4C77B" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ))}
      </div>
    </>
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        className="min-h-screen relative flex items-center justify-center overflow-hidden"
        style={{ background: "#0A0C10" }}
      >
        <AmbientBackdrop />

        <div className="relative z-10 text-center">
          <div
            className="w-8 h-8 rounded-full animate-spin mx-auto mb-3"
            style={{
              border: "2px solid rgba(232,163,61,0.25)",
              borderTopColor: "#E8A33D",
            }}
          />

          <p className="font-ui text-[13px]" style={{ color: "#8E8C83" }}>
            Loading document...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !document) {
    return (
      <div
        className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden"
        style={{ background: "#0A0C10" }}
      >
        <AmbientBackdrop />

        <div className="relative z-10 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              background: "radial-gradient(circle at 30% 30%, rgba(255,138,91,0.22), transparent 70%), rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,138,91,0.25)",
            }}
          >
            <FileText size={22} style={{ color: "#FF8A5B" }} />
          </div>

          <h2 className="font-voice text-[22px] mb-2" style={{ color: "#F6F4ED" }}>
            Document not found
          </h2>

          <p className="font-ui text-[13px] mb-5" style={{ color: "#8E8C83" }}>
            {error || "This document may have been deleted."}
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 rounded-lg font-ui text-[13px] font-medium transition-transform hover:-translate-y-0.5"
            style={{
              color: "#3B2205",
              background: "linear-gradient(150deg, #F4C77B 0%, #E8A33D 60%, #D9922B 100%)",
              boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 8px 20px rgba(232,163,61,0.32)",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // FILE SIZE
  // ==========================================

  const fileSizeBytes = Number(document.fileSize) || 0;
  const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2);

  // ==========================================
  // DATE
  // ==========================================

  const uploadDate = document.createdAt
    ? new Date(document.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Unknown";

  // ==========================================
  // INFO CARDS
  // ==========================================

  const infoCards = [
    {
      label: "Pages",
      value: document.totalPages || document.pages || 0,
      icon: Layers,
      accent: "#3DDC97",
      glow: "rgba(61,220,151,0.16)",
    },
    {
      label: "File size",
      value: `${fileSizeMB} MB`,
      icon: HardDrive,
      accent: "#F4C77B",
      glow: "rgba(244,199,123,0.18)",
    },
    {
      label: "Text chunks",
      value: document.chunkCount || document.chunks || 0,
      icon: FileText,
      accent: "#B79CFF",
      glow: "rgba(183,156,255,0.16)",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "#0A0C10" }}>
      <AmbientBackdrop />

      {/* HEADER */}

      <header
        className="sticky top-0 z-30 px-5 sm:px-6 lg:px-10 py-3.5"
        style={{
          background: "rgba(10,12,16,0.72)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 font-ui text-[13.5px] font-medium transition-colors"
            style={{ color: "#B3B1A8" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F3F1EB")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#B3B1A8")}
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-[9px] flex items-center justify-center"
              style={{
                background: "linear-gradient(150deg, #F4C77B 0%, #E8A33D 55%, #C97F1F 100%)",
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.35) inset, 0 -6px 10px rgba(0,0,0,0.25) inset, 0 6px 16px rgba(232,163,61,0.35)",
              }}
            >
              <FileText size={17} className="text-[#2A1704]" strokeWidth={2.4} />
            </div>

            <span className="font-ui text-[15px] font-semibold" style={{ color: "#F3F1EB" }}>
              DocMind AI
            </span>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 lg:px-10 py-8 sm:py-10">
        {/* TITLE */}

        <div className="mb-7">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div className="flex items-start gap-4 min-w-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(255,138,91,0.22), transparent 70%), rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,138,91,0.25)",
                }}
              >
                <FileText size={23} style={{ color: "#FF8A5B" }} />
              </div>

              <div className="min-w-0">
                {isRenaming ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      autoFocus
                      className="font-ui text-[18px] px-3 py-1.5 rounded-lg outline-none"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(232,163,61,0.5)",
                        color: "#F3F1EB",
                      }}
                    />

                    <div className="flex gap-2">
                      <button
                        onClick={handleRename}
                        disabled={renameLoading}
                        className="px-3 py-1.5 rounded-lg font-ui text-[12.5px] font-medium"
                        style={{
                          color: "#3B2205",
                          background: "linear-gradient(150deg, #F4C77B 0%, #E8A33D 60%, #D9922B 100%)",
                        }}
                      >
                        {renameLoading ? "Saving..." : "Save"}
                      </button>

                      <button
                        onClick={() => {
                          setIsRenaming(false);
                          setNewFileName(document.fileName);
                        }}
                        className="px-3 py-1.5 rounded-lg font-ui text-[12.5px]"
                        style={{
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "#B3B1A8",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <h1
                    className="font-voice text-[25px] sm:text-[28px] truncate max-w-xl"
                    style={{ color: "#F6F4ED" }}
                  >
                    {document.fileName}
                  </h1>
                )}

                <p className="font-ui text-[13px] mt-1" style={{ color: "#8E8C83" }}>
                  Uploaded {uploadDate}
                </p>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRenaming(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-ui text-[12.5px] transition-colors"
                style={{ color: "#B3B1A8", border: "1px solid rgba(255,255,255,0.1)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "#F3F1EB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#B3B1A8";
                }}
              >
                <Pencil size={14} />
                Rename
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-ui text-[12.5px] transition-colors"
                style={{
                  color: "#F87171",
                  border: "1px solid rgba(248,113,113,0.28)",
                  background: "rgba(248,113,113,0.06)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248,113,113,0.12)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(248,113,113,0.06)")}
              >
                <Trash2 size={14} />
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>

        {/* DOCUMENT INFO */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {infoCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="relative rounded-2xl p-5 transition-transform duration-200"
                style={{
                  background: "linear-gradient(165deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015))",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.06) inset, 0 18px 30px -14px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = `0 1px 0 rgba(255,255,255,0.08) inset, 0 24px 36px -14px rgba(0,0,0,0.6), 0 0 24px ${card.glow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0px)";
                  e.currentTarget.style.boxShadow =
                    "0 1px 0 rgba(255,255,255,0.06) inset, 0 18px 30px -14px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.2)";
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${card.glow}, transparent 70%), rgba(255,255,255,0.04)`,
                    border: `1px solid ${card.glow}`,
                  }}
                >
                  <Icon size={17} style={{ color: card.accent }} />
                </div>

                <p className="font-voice text-[22px]" style={{ color: "#F6F4ED" }}>
                  {card.value}
                </p>

                <p className="font-ui text-[12.5px]" style={{ color: "#8E8C83" }}>
                  {card.label}
                </p>
              </div>
            );
          })}

          {/* Indexed status — its own accent since it's a state, not a count */}

          <div
            className="relative rounded-2xl p-5 transition-transform duration-200"
            style={{
              background: "linear-gradient(165deg, rgba(255,255,255,0.055), rgba(255,255,255,0.015))",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.06) inset, 0 18px 30px -14px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0px)";
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{
                background: document.isIndexed
                  ? "radial-gradient(circle at 30% 30%, rgba(61,220,151,0.16), transparent 70%), rgba(255,255,255,0.04)"
                  : "radial-gradient(circle at 30% 30%, rgba(244,199,123,0.18), transparent 70%), rgba(255,255,255,0.04)",
                border: document.isIndexed
                  ? "1px solid rgba(61,220,151,0.16)"
                  : "1px solid rgba(244,199,123,0.18)",
              }}
            >
              {document.isIndexed ? (
                <CheckCircle2 size={17} style={{ color: "#3DDC97" }} />
              ) : (
                <Clock3 size={17} style={{ color: "#F4C77B" }} />
              )}
            </div>

            <p className="font-ui text-[15px] font-medium mt-1" style={{ color: "#F6F4ED" }}>
              {document.isIndexed ? "Indexed" : "Processing"}
            </p>

            <p className="font-ui text-[12.5px] mt-1" style={{ color: "#8E8C83" }}>
              AI status
            </p>
          </div>
        </div>

        {/* ASK AI CARD — the hero moment of this page */}

        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "linear-gradient(165deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow:
              "0 1px 0 rgba(255,255,255,0.06) inset, 0 22px 44px -20px rgba(0,0,0,0.6)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(150deg, #F4C77B 0%, #E8A33D 55%, #C97F1F 100%)",
                    boxShadow: "0 1px 0 rgba(255,255,255,0.35) inset, 0 6px 14px rgba(232,163,61,0.3)",
                  }}
                >
                  <MessageSquare size={16} className="text-[#3B2205]" />
                </div>

                <h2 className="font-ui text-[15px] font-semibold" style={{ color: "#F3F1EB" }}>
                  Ask AI about this document
                </h2>
              </div>

              <p className="font-ui text-[13px] max-w-xl" style={{ color: "#8E8C83" }}>
                Ask questions and get answers directly from the content of this
                document.
              </p>
            </div>

            <button
              onClick={() => navigate(`/chat/${documentId}`)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-ui text-[13px] font-semibold transition-transform hover:-translate-y-0.5"
              style={{
                color: "#3B2205",
                background: "linear-gradient(150deg, #F4C77B 0%, #E8A33D 60%, #D9922B 100%)",
                boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 10px 22px rgba(232,163,61,0.35)",
              }}
            >
              <MessageSquare size={15} />
              Ask AI
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DocumentDetails;