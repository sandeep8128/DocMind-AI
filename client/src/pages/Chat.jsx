import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  FileText,
  Send,
  Loader2,
  LogOut,
  BookOpen,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Plus,
  Files,
  Layers,
  Settings,
  LifeBuoy,
  Search,
  Menu,
  X,
  Download,
  User,
} from "lucide-react";

import api from "../services/api";
import jsPDF from "jspdf";

/* =========================================================
   AMBIENT BACKGROUND
========================================================= */

const AmbientBackdrop = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute rounded-full blur-3xl opacity-20"
        style={{
          width: "min(620px, 80vw)",
          height: "min(620px, 80vw)",
          top: "-180px",
          right: "-180px",
          background:
            "radial-gradient(circle, rgba(232,163,61,0.18), transparent 70%)",
        }}
      />

      <div
        className="absolute rounded-full blur-3xl opacity-10"
        style={{
          width: "min(520px, 70vw)",
          height: "min(520px, 70vw)",
          bottom: "-220px",
          left: "-180px",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)",
        }}
      />
    </div>
  );
};

/* =========================================================
   SOURCES
========================================================= */

const Sources = ({ sources }) => {
  const [open, setOpen] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 w-full max-w-3xl">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all"
        style={{
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen size={15} style={{ color: "#E8A33D" }} />

          <span
            className="text-sm font-medium"
            style={{ color: "#D8D6CF" }}
          >
            Sources
          </span>

          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(232,163,61,0.12)",
              color: "#E8A33D",
            }}
          >
            {sources.length}
          </span>
        </div>

        {open ? (
          <ChevronUp size={16} style={{ color: "#8E8C84" }} />
        ) : (
          <ChevronDown size={16} style={{ color: "#8E8C84" }} />
        )}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {sources.map((source, index) => {
            const distance =
              typeof source.distance === "number"
                ? source.distance
                : null;

            let relevance = "Relevant";

            if (distance !== null) {
              if (distance < 0.35) {
                relevance = "Highly relevant";
              } else if (distance < 0.65) {
                relevance = "Relevant";
              } else {
                relevance = "Related";
              }
            }

            return (
              <div
                key={`${source.chunkIndex}-${index}`}
                className="rounded-xl p-4"
                style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText
                      size={14}
                      style={{ color: "#E8A33D", flexShrink: 0 }}
                    />

                    <span
                      className="text-xs truncate"
                      style={{ color: "#A9A79F" }}
                    >
                      {source.fileName || "Document"}
                    </span>
                  </div>

                  <span
                    className="self-start sm:self-auto text-[11px] px-2 py-1 rounded-full whitespace-nowrap"
                    style={{
                      background: "rgba(232,163,61,0.10)",
                      color: "#DCA14A",
                    }}
                  >
                    {relevance}
                  </span>
                </div>

                <p
                  className="text-sm leading-6 whitespace-pre-wrap break-words"
                  style={{ color: "#B8B6AE" }}
                >
                  {source.text}
                </p>

                {source.chunkIndex !== undefined && (
                  <div
                    className="mt-3 text-[11px]"
                    style={{ color: "#77756E" }}
                  >
                    Chunk {source.chunkIndex + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const Chat = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [messages, setMessages] = useState([]);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [newChatUploading, setNewChatUploading] = useState(false);
  const [error, setError] = useState("");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const newChatFileInputRef = useRef(null);

  /* =========================================================
     AUTO SCROLL
  ========================================================= */

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 50);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  /* =========================================================
     FETCH CHAT HISTORY
  ========================================================= */

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setLoadingHistory(true);
        setError("");

        const response = await api.get(
          `/chat/${documentId}/history`
        );

        const data = response.data;

        setDocument(data.document);

        const history = data.chats || [];

        const formattedMessages = [];

        history.forEach((chat) => {
          formattedMessages.push({
            id: `${chat._id}-question`,
            role: "user",
            content: chat.question,
            createdAt: chat.createdAt,
          });

          formattedMessages.push({
            id: `${chat._id}-answer`,
            role: "assistant",
            content: chat.answer,
            sources: chat.sources || [],
            retrievedChunks: chat.retrievedChunks || [],
            createdAt: chat.createdAt,
          });
        });

        setMessages(formattedMessages);
      } catch (err) {
        console.error("Chat history error:", err);

        setError(
          err?.response?.data?.message ||
            "Failed to load chat history"
        );
      } finally {
        setLoadingHistory(false);
      }
    };

    if (documentId) {
      fetchChatHistory();
    }
  }, [documentId]);

  /* =========================================================
     AUTO RESIZE TEXTAREA
  ========================================================= */

  const handleQuestionChange = (e) => {
    const value = e.target.value;

    setQuestion(value);

    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = "auto";

      textarea.style.height = `${Math.min(
        textarea.scrollHeight,
        150
      )}px`;
    }
  };

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!question.trim() || loading) {
      return;
    }

    const currentQuestion = question.trim();

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: currentQuestion,
    };

    setMessages((prev) => [...prev, userMessage]);

    setQuestion("");
    setError("");
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const response = await api.post("/chat", {
        question: currentQuestion,
        documentId,
      });

      const data = response.data;

      const assistantMessage = {
        id: data.chatId || `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer,
        sources: data.sources || [],
        retrievedChunks: data.retrievedChunks || [],
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);
    } catch (err) {
      console.error("Chat error:", err);

      const message =
        err?.response?.data?.message ||
        "Failed to generate answer. Please try again.";

      setError(message);

      const errorMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "Sorry, I couldn't generate an answer right now. Please try again.",
        isError: true,
      };

      setMessages((prev) => [
        ...prev,
        errorMessage,
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     ENTER KEY
  ========================================================= */

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      handleSubmit();
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /* =========================================================
     NEW CHAT FILE
  ========================================================= */

  const handleNewChatFile = async (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    try {
      setNewChatUploading(true);
      setError("");

      const formData = new FormData();

      formData.append("file", file);

      const response = await api.post(
        "/documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newDocument =
        response.data?.document ||
        response.data?.data?.document;

      if (!newDocument?._id) {
        throw new Error(
          "Document uploaded but ID was not returned."
        );
      }

      navigate(`/chat/${newDocument._id}`);
      setMobileMenuOpen(false);
    } catch (err) {
      console.error("New chat upload error:", err);

      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to upload document."
      );
    } finally {
      setNewChatUploading(false);

      if (newChatFileInputRef.current) {
        newChatFileInputRef.current.value = "";
      }
    }
  };

  /* =========================================================
     EXPORT CHAT AS PDF
  ========================================================= */

  const exportChatAsPDF = () => {
    if (!messages.length) {
      setError("There is no chat to export.");
      return;
    }

    try {
      const pdf = new jsPDF();

      const margin = 15;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      let y = 20;

      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");

      pdf.text(
        "DocMind AI - Chat Export",
        margin,
        y
      );

      y += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      if (document?.fileName) {
        pdf.text(
          `Document: ${document.fileName}`,
          margin,
          y
        );

        y += 8;
      }

      const addWrappedText = (
        text,
        fontSize = 10,
        bold = false
      ) => {
        pdf.setFontSize(fontSize);

        pdf.setFont(
          "helvetica",
          bold ? "bold" : "normal"
        );

        const lines = pdf.splitTextToSize(
          String(text || ""),
          pageWidth - margin * 2
        );

        lines.forEach((line) => {
          if (y > pageHeight - 20) {
            pdf.addPage();
            y = 20;
          }

          pdf.text(line, margin, y);

          y += fontSize * 0.5 + 3;
        });

        y += 4;
      };

      /*
       * Convert message list into Q&A pairs.
       *
       * Old code expected a "chats" variable,
       * but this component actually stores chat history
       * inside "messages".
       */
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];

        if (message.role !== "user") {
          continue;
        }

        const nextMessage = messages[i + 1];

        addWrappedText(
          `Q: ${message.content}`,
          11,
          true
        );

        if (
          nextMessage &&
          nextMessage.role === "assistant"
        ) {
          addWrappedText(
            `A: ${nextMessage.content}`,
            10,
            false
          );
        }

        y += 3;
      }

      pdf.save(
        `DocMind-Chat-${Date.now()}.pdf`
      );
    } catch (err) {
      console.error("PDF export error:", err);

      setError("Failed to export chat as PDF.");
    }
  };

  /* =========================================================
     SIDEBAR
  ========================================================= */

  const SidebarContent = ({ mobile = false }) => {
    return (
      <div className="h-full flex flex-col">
        {/* LOGO */}

        <div className="px-5 py-5 flex items-center justify-between">
          <button
            onClick={() => {
              navigate("/dashboard");
              if (mobile) {
                setMobileMenuOpen(false);
              }
            }}
            className="flex items-center gap-3"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #E8A33D, #B8791E)",
                boxShadow:
                  "0 8px 25px rgba(232,163,61,0.18)",
              }}
            >
              <FileText
                size={18}
                color="#17130D"
              />
            </div>

            <div className="text-left">
              <div
                className="text-sm font-semibold"
                style={{ color: "#F0EEE7" }}
              >
                DocMind AI
              </div>

              <div
                className="text-[10px]"
                style={{ color: "#77756E" }}
              >
                Document Intelligence
              </div>
            </div>
          </button>

          {mobile && (
            <button
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "rgba(255,255,255,0.05)",
                border:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <X
                size={18}
                style={{ color: "#B3B1A8" }}
              />
            </button>
          )}
        </div>

        {/* NEW CHAT */}

        <div className="px-4 mb-5">
          <input
            ref={newChatFileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handleNewChatFile}
          />

          <button
            onClick={() => {
              newChatFileInputRef.current?.click();
            }}
            disabled={newChatUploading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all disabled:opacity-60"
            style={{
              background:
                "linear-gradient(135deg, rgba(232,163,61,0.16), rgba(232,163,61,0.07))",
              border:
                "1px solid rgba(232,163,61,0.22)",
              color: "#E8A33D",
            }}
          >
            {newChatUploading ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Plus size={15} />
            )}

            <span className="text-sm font-medium">
              {newChatUploading
                ? "Uploading..."
                : "New Chat"}
            </span>
          </button>
        </div>

        {/* SEARCH */}

        <div className="px-4 mb-5">
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{
              background:
                "rgba(255,255,255,0.025)",
              border:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Search
              size={14}
              style={{ color: "#6F6D67" }}
            />

            <span
              className="text-xs"
              style={{ color: "#696760" }}
            >
              Search
            </span>
          </div>
        </div>

        {/* NAVIGATION */}

        <nav className="px-3 flex flex-col gap-1">
          <button
            onClick={() => {
              navigate("/dashboard");

              if (mobile) {
                setMobileMenuOpen(false);
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
            style={{
              color: "#A5A39B",
            }}
          >
            <Files size={16} />
            <span className="text-sm">
              Documents
            </span>
          </button>

          <button
            onClick={() => {
              navigate("/chat-all");

              if (mobile) {
                setMobileMenuOpen(false);
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
            style={{
              color: "#A5A39B",
            }}
          >
            <Layers size={16} />
            <span className="text-sm">
              Chat all docs
            </span>
          </button>

          <button
            onClick={() => {
              navigate("/settings");

              if (mobile) {
                setMobileMenuOpen(false);
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
            style={{
              color: "#A5A39B",
            }}
          >
            <Settings size={16} />
            <span className="text-sm">
              Settings
            </span>
          </button>

          <button
            onClick={() => {
              navigate("/help");

              if (mobile) {
                setMobileMenuOpen(false);
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
            style={{
              color: "#A5A39B",
            }}
          >
            <LifeBuoy size={16} />
            <span className="text-sm">
              Help & Support
            </span>
          </button>
        </nav>

        {/* CURRENT DOCUMENT */}

        <div className="px-4 mt-7">
          <div
            className="text-[10px] uppercase tracking-[0.18em] mb-3"
            style={{ color: "#62605A" }}
          >
            Current document
          </div>

          <div
            className="rounded-xl p-3"
            style={{
              background:
                "rgba(232,163,61,0.055)",
              border:
                "1px solid rgba(232,163,61,0.12)",
            }}
          >
            <div className="flex items-start gap-2.5">
              <FileText
                size={15}
                style={{
                  color: "#E8A33D",
                  marginTop: 2,
                  flexShrink: 0,
                }}
              />

              <div className="min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: "#C9C6BC" }}
                  title={document?.fileName}
                >
                  {document?.fileName ||
                    "Loading document..."}
                </p>

                <p
                  className="text-[10px] mt-1"
                  style={{ color: "#77756E" }}
                >
                  Active chat
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SPACER */}

        <div className="flex-1" />

        {/* BOTTOM */}

        <div className="px-4 pb-4">
          <div
            className="rounded-xl p-3"
            style={{
              background:
                "rgba(255,255,255,0.025)",
              border:
                "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "rgba(232,163,61,0.10)",
                  border:
                    "1px solid rgba(232,163,61,0.18)",
                }}
              >
                <User
                  size={14}
                  style={{ color: "#E8A33D" }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className="text-xs font-medium truncate"
                  style={{ color: "#C5C3BB" }}
                >
                  My Account
                </div>

                <button
                  onClick={handleLogout}
                  className="text-[10px] mt-0.5"
                  style={{ color: "#77756E" }}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* =========================================================
     LOADING HISTORY
  ========================================================= */

  if (loadingHistory) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "#0D0D0C",
          color: "#F0EEE7",
        }}
      >
        <AmbientBackdrop />

        <div className="relative flex flex-col items-center gap-4">
          <Loader2
            size={30}
            className="animate-spin"
            style={{ color: "#E8A33D" }}
          />

          <p
            className="text-sm"
            style={{ color: "#8E8C84" }}
          >
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: "#0D0D0C",
        color: "#F0EEE7",
      }}
    >
      <AmbientBackdrop />

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside
        className="hidden lg:block fixed left-0 top-0 bottom-0 z-40 w-[248px]"
        style={{
          background:
            "rgba(15,15,14,0.96)",
          borderRight:
            "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[90] lg:hidden"
          style={{
            background:
              "rgba(0,0,0,0.62)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() =>
            setMobileMenuOpen(false)
          }
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-[290px] max-w-[86vw]"
            style={{
              background: "#111110",
              borderRight:
                "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                "20px 0 60px rgba(0,0,0,0.35)",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <main className="lg:ml-[248px] min-h-screen relative">
        {/* ===================================================
            HEADER
        =================================================== */}

        <header
          className="sticky top-0 z-30 h-[64px] sm:h-[70px] flex items-center justify-between px-3 sm:px-5 lg:px-8"
          style={{
            background:
              "rgba(13,13,12,0.88)",
            borderBottom:
              "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* MOBILE MENU */}

            <button
              onClick={() =>
                setMobileMenuOpen(true)
              }
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background:
                  "rgba(255,255,255,0.04)",
                border:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Menu
                size={18}
                style={{ color: "#C5C3BB" }}
              />
            </button>

            {/* BACK */}

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background:
                  "rgba(255,255,255,0.04)",
                border:
                  "1px solid rgba(255,255,255,0.07)",
              }}
              title="Back to dashboard"
            >
              <ArrowLeft
                size={17}
                style={{ color: "#B3B1A8" }}
              />
            </button>

            {/* DOCUMENT */}

            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="hidden sm:flex w-8 h-8 rounded-lg items-center justify-center shrink-0"
                style={{
                  background:
                    "rgba(232,163,61,0.10)",
                  border:
                    "1px solid rgba(232,163,61,0.15)",
                }}
              >
                <FileText
                  size={15}
                  style={{ color: "#E8A33D" }}
                />
              </div>

              <div className="min-w-0">
                <div
                  className="text-sm font-medium truncate max-w-[170px] sm:max-w-[280px] lg:max-w-[420px]"
                  style={{ color: "#DAD8D0" }}
                  title={document?.fileName}
                >
                  {document?.fileName ||
                    "Document Chat"}
                </div>

                <div
                  className="hidden sm:block text-[10px] mt-0.5"
                  style={{ color: "#6F6D67" }}
                >
                  Ask questions about this document
                </div>
              </div>
            </div>
          </div>

          {/* HEADER ACTIONS */}

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={exportChatAsPDF}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
              style={{
                background:
                  "rgba(255,255,255,0.035)",
                border:
                  "1px solid rgba(255,255,255,0.07)",
                color: "#A8A69F",
              }}
              title="Export chat as PDF"
            >
              <Download size={14} />
              <span className="text-xs">
                Export
              </span>
            </button>

            {/* MOBILE EXPORT */}

            <button
              onClick={exportChatAsPDF}
              className="sm:hidden w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "rgba(255,255,255,0.035)",
                border:
                  "1px solid rgba(255,255,255,0.07)",
              }}
              title="Export chat"
            >
              <Download
                size={15}
                style={{ color: "#A8A69F" }}
              />
            </button>

            {/* MOBILE LOGOUT */}

            <button
              onClick={handleLogout}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "rgba(255,255,255,0.035)",
                border:
                  "1px solid rgba(255,255,255,0.07)",
              }}
              title="Log out"
            >
              <LogOut
                size={15}
                style={{ color: "#A8A69F" }}
              />
            </button>
          </div>
        </header>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="px-3 sm:px-5 lg:px-8 pt-4">
            <div
              className="max-w-3xl mx-auto rounded-xl px-4 py-3 text-sm"
              style={{
                background:
                  "rgba(220,80,70,0.08)",
                border:
                  "1px solid rgba(220,80,70,0.18)",
                color: "#D99A94",
              }}
            >
              {error}
            </div>
          </div>
        )}

        {/* ===================================================
            CHAT CONTENT
        =================================================== */}

        <div className="px-3 sm:px-5 lg:px-8 pt-5 sm:pt-8 pb-40">
          <div className="max-w-3xl mx-auto">
            {/* EMPTY CHAT */}

            {messages.length === 0 && !loading && (
              <div className="min-h-[55vh] flex flex-col items-center justify-center text-center px-3">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(232,163,61,0.15), rgba(232,163,61,0.05))",
                    border:
                      "1px solid rgba(232,163,61,0.18)",
                  }}
                >
                  <MessageSquare
                    size={26}
                    style={{ color: "#E8A33D" }}
                  />
                </div>

                <h1
                  className="text-xl sm:text-2xl font-semibold"
                  style={{ color: "#E7E4DC" }}
                >
                  Ask your document
                </h1>

                <p
                  className="mt-2 max-w-md text-sm leading-6"
                  style={{ color: "#77756E" }}
                >
                  Ask a question about the uploaded
                  document and DocMind AI will find
                  relevant information for you.
                </p>
              </div>
            )}

            {/* =================================================
                MESSAGES
            ================================================= */}

            <div className="space-y-7 sm:space-y-8">
              {messages.map((message) => {
                const isUser =
                  message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isUser
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`${
                        isUser
                          ? "max-w-[90%] sm:max-w-[82%]"
                          : "w-full"
                      }`}
                    >
                      {/* USER MESSAGE */}

                      {isUser ? (
                        <div className="flex justify-end">
                          <div
                            className="rounded-2xl rounded-br-md px-4 py-3.5 sm:px-5 sm:py-4"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(232,163,61,0.15), rgba(232,163,61,0.08))",
                              border:
                                "1px solid rgba(232,163,61,0.18)",
                            }}
                          >
                            <p
                              className="text-sm leading-6 whitespace-pre-wrap break-words"
                              style={{
                                color: "#DDD9CE",
                              }}
                            >
                              {message.content}
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* ASSISTANT MESSAGE */
                        <div>
                          <div className="flex items-start gap-3">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                              style={{
                                background:
                                  "rgba(232,163,61,0.09)",
                                border:
                                  "1px solid rgba(232,163,61,0.15)",
                              }}
                            >
                              <FileText
                                size={14}
                                style={{
                                  color: "#E8A33D",
                                }}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div
                                className="text-[11px] font-medium mb-2"
                                style={{
                                  color: "#8E8C84",
                                }}
                              >
                                DocMind AI
                              </div>

                              <div
                                className="text-sm leading-7 whitespace-pre-wrap break-words"
                                style={{
                                  color: message.isError
                                    ? "#D99A94"
                                    : "#C9C6BE",
                                }}
                              >
                                {message.content}
                              </div>

                              <Sources
                                sources={
                                  message.sources
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading && (
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background:
                        "rgba(232,163,61,0.09)",
                      border:
                        "1px solid rgba(232,163,61,0.15)",
                    }}
                  >
                    <FileText
                      size={14}
                      style={{
                        color: "#E8A33D",
                      }}
                    />
                  </div>

                  <div className="pt-1">
                    <div
                      className="text-[11px] font-medium mb-2"
                      style={{
                        color: "#8E8C84",
                      }}
                    >
                      DocMind AI
                    </div>

                    <div
                      className="flex items-center gap-2 text-sm"
                      style={{
                        color: "#77756E",
                      }}
                    >
                      <Loader2
                        size={14}
                        className="animate-spin"
                        style={{
                          color: "#E8A33D",
                        }}
                      />

                      <span>
                        Searching your document...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* ===================================================
            INPUT AREA
        =================================================== */}

        <div
          className="fixed bottom-0 left-0 lg:left-[248px] right-0 z-30 px-3 sm:px-5 lg:px-8 pb-3 sm:pb-5 pt-4"
          style={{
            background:
              "linear-gradient(to top, rgba(13,13,12,1) 65%, rgba(13,13,12,0))",
          }}
        >
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="relative"
            >
              <div
                className="rounded-2xl p-2 sm:p-2.5 flex items-end gap-2"
                style={{
                  background:
                    "rgba(20,20,19,0.96)",
                  border:
                    "1px solid rgba(255,255,255,0.09)",
                  boxShadow:
                    "0 12px 45px rgba(0,0,0,0.35)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={question}
                  onChange={handleQuestionChange}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  rows={1}
                  placeholder="Ask anything about this document..."
                  className="flex-1 resize-none bg-transparent outline-none px-2.5 sm:px-3 py-2.5 text-sm leading-6 placeholder:text-[#5F5D57]"
                  style={{
                    color: "#D9D6CE",
                    maxHeight: "150px",
                  }}
                />

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !question.trim()
                  }
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(135deg, #E8A33D, #C98528)",
                    color: "#18130B",
                    boxShadow:
                      question.trim() && !loading
                        ? "0 6px 20px rgba(232,163,61,0.16)"
                        : "none",
                  }}
                  title="Send message"
                >
                  {loading ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={17} />
                  )}
                </button>
              </div>

              <div
                className="text-center text-[10px] mt-2 px-2"
                style={{ color: "#56544E" }}
              >
                Enter to send · Shift + Enter for new line
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;