import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  FileText,
  Send,
  Loader2,
  LogOut,
  Files,
  Layers,
  Settings,
  LifeBuoy,
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Plus,
  Menu,
  X,
  User,
} from "lucide-react";

import api from "../services/api";

function ChatAllDocuments() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // =========================================================
  // FETCH DOCUMENTS
  // =========================================================

  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);
      setError("");

      const response = await api.get("/documents");

      if (response.data.success) {
        setDocuments(response.data.documents || []);
      }
    } catch (error) {
      console.error("Documents Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load documents"
      );
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // =========================================================
  // ASK QUESTION
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    setError("");

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await api.post("/chat/all", {
        question: trimmedQuestion,
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Failed to get answer"
        );
      }

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.data.answer || "",
        retrievedChunks:
          response.data.retrievedChunks || [],
        sources: response.data.sources || [],
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "Chat All Documents Error:",
        error
      );

      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";

      setError(message);

      setMessages((prev) =>
        prev.filter(
          (item) => item.id !== userMessage.id
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ENTER KEY
  // =========================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleNewChat = () => {
    navigate("/dashboard");
    setMobileMenuOpen(false);
  };

  const navigateTo = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // =========================================================
  // RELEVANCE
  // =========================================================

  const getRelevance = (distance) => {
    if (
      distance === null ||
      distance === undefined
    ) {
      return null;
    }

    const value = Number(distance);

    if (Number.isNaN(value)) {
      return null;
    }

    if (value < 0.5) {
      return "Highly relevant";
    }

    if (value < 0.8) {
      return "Relevant";
    }

    return "Related";
  };

  // =========================================================
  // SOURCES
  // =========================================================

  const Sources = ({
    sources,
    retrievedChunks,
  }) => {
    const [open, setOpen] = useState(false);

    let sourceList = sources || [];

    if (
      sourceList.length === 0 &&
      retrievedChunks?.length > 0
    ) {
      sourceList = retrievedChunks.map(
        (text, index) => ({
          text,
          fileName: "Document",
          chunkIndex: index,
          distance: null,
        })
      );
    }

    if (sourceList.length === 0) {
      return null;
    }

    return (
      <div
        className="mt-4 rounded-xl overflow-hidden"
        style={{
          background:
            "rgba(255,255,255,0.03)",
          border:
            "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          type="button"
          onClick={() =>
            setOpen((prev) => !prev)
          }
          className="w-full flex items-center justify-between gap-3 px-3 sm:px-4 py-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  "rgba(232,163,61,0.08)",
                border:
                  "1px solid rgba(232,163,61,0.20)",
              }}
            >
              <BookOpen
                size={14}
                style={{
                  color: "#F4C77B",
                }}
              />
            </div>

            <div className="text-left min-w-0">
              <p
                className="text-[12.5px] font-semibold"
                style={{
                  color: "#F3F1EB",
                }}
              >
                Sources
              </p>

              <p
                className="text-[10.5px]"
                style={{
                  color: "#8E8C83",
                }}
              >
                {sourceList.length} relevant{" "}
                {sourceList.length === 1
                  ? "source"
                  : "sources"}
              </p>
            </div>
          </div>

          {open ? (
            <ChevronUp
              size={16}
              style={{
                color: "#8E8C83",
              }}
            />
          ) : (
            <ChevronDown
              size={16}
              style={{
                color: "#8E8C83",
              }}
            />
          )}
        </button>

        {open && (
          <div
            style={{
              borderTop:
                "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {sourceList.map(
              (source, index) => {
                const relevance =
                  getRelevance(
                    source.distance
                  );

                return (
                  <div
                    key={`${source.documentId || "document"}-${source.chunkIndex ?? index}-${index}`}
                    className="px-3 sm:px-4 py-4"
                    style={{
                      borderBottom:
                        index <
                        sourceList.length - 1
                          ? "1px solid rgba(255,255,255,0.06)"
                          : "none",
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                          style={{
                            background:
                              "rgba(255,138,91,0.08)",
                            border:
                              "1px solid rgba(255,138,91,0.20)",
                          }}
                        >
                          <FileText
                            size={13}
                            style={{
                              color:
                                "#FF8A5B",
                            }}
                          />
                        </div>

                        <div className="min-w-0">
                          <p
                            className="text-[12px] font-medium truncate"
                            style={{
                              color:
                                "#F3F1EB",
                            }}
                            title={
                              source.fileName
                            }
                          >
                            {source.fileName ||
                              "Document"}
                          </p>

                          <p
                            className="text-[10px]"
                            style={{
                              color:
                                "#8E8C83",
                            }}
                          >
                            Chunk{" "}
                            {(source.chunkIndex ??
                              index) + 1}
                          </p>
                        </div>
                      </div>

                      {relevance && (
                        <span
                          className="self-start text-[10px] px-2 py-1 rounded-full whitespace-nowrap"
                          style={{
                            background:
                              "rgba(61,220,151,0.12)",
                            color:
                              "#3DDC97",
                            border:
                              "1px solid rgba(61,220,151,0.20)",
                          }}
                        >
                          {relevance}
                        </span>
                      )}
                    </div>

                    <div className="sm:ml-9">
                      <p
                        className="text-[12px] leading-5 whitespace-pre-wrap break-words"
                        style={{
                          color: "#B3B1A8",
                        }}
                      >
                        {source.text ||
                          "No source text available."}
                      </p>

                      {source.distance !==
                        null &&
                        source.distance !==
                          undefined && (
                          <p
                            className="text-[10px] mt-2"
                            style={{
                              color:
                                "#6E6C64",
                            }}
                          >
                            Distance:{" "}
                            {Number(
                              source.distance
                            ).toFixed(4)}
                          </p>
                        )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    );
  };

  // =========================================================
  // AMBIENT BACKGROUND
  // =========================================================

  const AmbientBackdrop = () => (
    <>
      <style>{`
        @keyframes driftA {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }

          33% {
            transform: translate(26px, 18px) scale(1.08);
          }

          66% {
            transform: translate(-14px, 30px) scale(0.96);
          }
        }

        @keyframes driftB {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }

          40% {
            transform: translate(-30px, 24px) scale(1.1);
          }

          75% {
            transform: translate(18px, -16px) scale(0.94);
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.85;
          }

          50% {
            opacity: 1;
          }
        }

        @keyframes orbPulse {
          0%, 100% {
            box-shadow:
              0 0 0 0 rgba(232,163,61,0.35),
              0 1px 0 rgba(255,255,255,0.4) inset,
              0 -10px 18px rgba(0,0,0,0.22) inset;
          }

          50% {
            box-shadow:
              0 0 0 14px rgba(232,163,61,0),
              0 1px 0 rgba(255,255,255,0.4) inset,
              0 -10px 18px rgba(0,0,0,0.22) inset;
          }
        }

        @keyframes typingDot {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }

          30% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }

        @keyframes bubbleIn {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bg-blob,
          .orb {
            animation: none !important;
          }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="bg-blob absolute"
          style={{
            top: "-16%",
            left: "10%",
            width: "min(620px, 90vw)",
            height: "440px",
            background:
              "radial-gradient(closest-side, rgba(232,163,61,0.15), transparent 72%)",
            animation:
              "driftA 24s ease-in-out infinite, glowPulse 10s ease-in-out infinite",
          }}
        />

        <div
          className="bg-blob absolute"
          style={{
            top: "6%",
            right: "0%",
            width: "min(500px, 75vw)",
            height: "420px",
            background:
              "radial-gradient(closest-side, rgba(61,220,151,0.08), transparent 72%)",
            animation:
              "driftB 29s ease-in-out infinite, glowPulse 12s ease-in-out infinite",
          }}
        />
      </div>
    </>
  );

  // =========================================================
  // SIDEBAR CONTENT
  // =========================================================

  const SidebarContent = ({
    mobile = false,
  }) => (
    <div className="h-full flex flex-col">
      {/* LOGO */}

      <div className="flex items-center justify-between mb-6 px-1">
        <button
          onClick={() =>
            navigateTo("/dashboard")
          }
          className="flex items-center gap-2 min-w-0"
        >
          <div
            className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0"
            style={{
              background:
                "linear-gradient(150deg, #F4C77B 0%, #E8A33D 55%, #C97F1F 100%)",
            }}
          >
            <FileText
              size={15}
              className="text-[#2A1704]"
            />
          </div>

          <span
            className="text-sm font-semibold truncate"
            style={{
              color: "#F3F1EB",
            }}
          >
            DocMind AI
          </span>
        </button>

        {mobile && (
          <button
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background:
                "rgba(255,255,255,0.05)",
              border:
                "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <X
              size={17}
              style={{
                color: "#B3B1A8",
              }}
            />
          </button>
        )}
      </div>

      {/* SEARCH */}

      <div className="mb-4">
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
            style={{
              color: "#6E6C64",
            }}
          />

          <span
            className="text-xs"
            style={{
              color: "#696760",
            }}
          >
            Search
          </span>
        </div>
      </div>

      {/* NEW CHAT */}

      <button
        onClick={handleNewChat}
        className="flex items-center justify-center gap-2 text-[13px] font-medium px-3 py-2.5 rounded-xl mb-6"
        style={{
          background:
            "linear-gradient(165deg, rgba(232,163,61,0.16), rgba(232,163,61,0.05))",
          border:
            "1px solid rgba(232,163,61,0.30)",
          color: "#F4C77B",
        }}
      >
        <Plus size={15} />
        New Chat
      </button>

      {/* FEATURES */}

      <p
        className="text-[10.5px] font-semibold tracking-wide mb-2 px-1"
        style={{
          color: "#5E5C55",
        }}
      >
        Features
      </p>

      <nav className="flex flex-col gap-0.5 mb-6">
        <button
          onClick={() =>
            navigateTo("/dashboard")
          }
          className="flex items-center gap-2.5 text-[13px] px-2.5 py-2.5 rounded-lg text-left"
          style={{
            color: "#8E8C83",
          }}
        >
          <Files size={15} />
          Documents
        </button>

        <button
          onClick={() =>
            navigateTo("/chat-all")
          }
          className="flex items-center gap-2.5 text-[13px] px-2.5 py-2.5 rounded-lg text-left"
          style={{
            color: "#F3F1EB",
            background:
              "rgba(255,255,255,0.06)",
          }}
        >
          <Layers size={15} />
          Chat all docs
        </button>

        <button
          onClick={() =>
            navigateTo("/settings")
          }
          className="flex items-center gap-2.5 text-[13px] px-2.5 py-2.5 rounded-lg text-left"
          style={{
            color: "#8E8C83",
          }}
        >
          <Settings size={15} />
          Settings
        </button>

        <button
          onClick={() =>
            navigateTo("/help")
          }
          className="flex items-center gap-2.5 text-[13px] px-2.5 py-2.5 rounded-lg text-left"
          style={{
            color: "#8E8C83",
          }}
        >
          <LifeBuoy size={15} />
          Help & Support
        </button>
      </nav>

      {/* DOCUMENTS */}

      <p
        className="text-[10.5px] font-semibold tracking-wide mb-2 px-1"
        style={{
          color: "#5E5C55",
        }}
      >
        Your Documents
      </p>

      <div className="space-y-1 overflow-y-auto max-h-[45vh] pr-1">
        {documents.length === 0 ? (
          <p
            className="text-[11px] px-2.5 py-2"
            style={{
              color: "#6E6C64",
            }}
          >
            No documents
          </p>
        ) : (
          documents.map((doc) => (
            <button
              key={doc._id}
              onClick={() =>
                navigateTo(
                  `/chat/${doc._id}`
                )
              }
              className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-left"
              style={{
                color: "#8E8C83",
              }}
            >
              <FileText
                size={14}
                className="flex-shrink-0"
                style={{
                  color: "#FF8A5B",
                }}
              />

              <span className="text-xs truncate">
                {doc.fileName || "Document"}
              </span>
            </button>
          ))
        )}
      </div>

      <div className="flex-1" />

      {/* ACCOUNT */}

      <div
        className="rounded-xl p-3 mb-3"
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
              style={{
                color: "#E8A33D",
              }}
            />
          </div>

          <div className="min-w-0">
            <p
              className="text-xs font-medium"
              style={{
                color: "#C5C3BB",
              }}
            >
              My Account
            </p>

            <button
              onClick={handleLogout}
              className="text-[10px] mt-0.5"
              style={{
                color: "#77756E",
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE EXTRA */}

      {mobile && (
        <div className="pb-3">
          <p
            className="text-[10px] text-center"
            style={{
              color: "#55534E",
            }}
          >
            DocMind AI
          </p>
        </div>
      )}
    </div>
  );

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: "#0A0C10",
      }}
    >
      <AmbientBackdrop />

      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[100] lg:hidden"
          style={{
            background:
              "rgba(0,0,0,0.65)",
            backdropFilter: "blur(5px)",
          }}
          onClick={() =>
            setMobileMenuOpen(false)
          }
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-[285px] max-w-[88vw] p-4 overflow-y-auto"
            style={{
              background: "#101216",
              borderRight:
                "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                "20px 0 60px rgba(0,0,0,0.45)",
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      <div className="relative z-10 flex min-h-screen">
        {/* ===================================================
            DESKTOP SIDEBAR
        =================================================== */}

        <aside
          className="hidden lg:flex flex-col w-[248px] flex-shrink-0 h-screen sticky top-0 px-4 py-5"
          style={{
            borderRight:
              "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <SidebarContent />
        </aside>

        {/* ===================================================
            MAIN
        =================================================== */}

        <div className="flex-1 min-w-0">
          {/* =================================================
              TOP NAV
          ================================================= */}

          <header
            className="sticky top-0 z-30 px-3 sm:px-5 lg:px-8 py-3 flex items-center justify-between"
            style={{
              background:
                "rgba(10,12,16,0.82)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter:
                "blur(16px)",
              borderBottom:
                "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* MOBILE MENU */}

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 lg:hidden"
                style={{
                  background:
                    "rgba(255,255,255,0.04)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Menu
                  size={18}
                  style={{
                    color: "#B3B1A8",
                  }}
                />
              </button>

              {/* BACK */}

              <button
                type="button"
                onClick={handleBack}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 lg:hidden"
                style={{
                  background:
                    "rgba(255,255,255,0.04)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <ArrowLeft
                  size={17}
                  style={{
                    color: "#B3B1A8",
                  }}
                />
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="hidden lg:flex items-center gap-1.5 text-[13px] font-medium flex-shrink-0"
                style={{
                  color: "#B3B1A8",
                }}
              >
                <ArrowLeft size={15} />
                Dashboard
              </button>

              {/* TITLE */}

              <div
                className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(150deg, #F4C77B 0%, #E8A33D 55%, #C97F1F 100%)",
                }}
              >
                <Layers
                  size={17}
                  className="text-[#2A1704]"
                />
              </div>

              <div className="min-w-0">
                <p
                  className="text-[13px] font-semibold truncate"
                  style={{
                    color: "#F3F1EB",
                  }}
                >
                  Chat All Documents
                </p>

                <p
                  className="hidden sm:block text-[10.5px] truncate"
                  style={{
                    color: "#6E6C64",
                  }}
                >
                  Ask questions across all your
                  documents
                </p>
              </div>
            </div>

            {/* MOBILE LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  "rgba(255,255,255,0.04)",
                border:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <LogOut
                size={15}
                style={{
                  color: "#B3B1A8",
                }}
              />
            </button>
          </header>

          {/* =================================================
              CHAT AREA
          ================================================= */}

          <main className="relative max-w-3xl mx-auto px-3 sm:px-5 lg:px-8 py-6 sm:py-8 pb-40">
            {/* LOADING DOCUMENTS */}

            {loadingDocuments && (
              <div className="flex flex-col items-center justify-center text-center py-20">
                <Loader2
                  size={25}
                  className="animate-spin mb-4"
                  style={{
                    color: "#E8A33D",
                  }}
                />

                <p
                  className="text-[13px]"
                  style={{
                    color: "#8E8C83",
                  }}
                >
                  Loading your documents...
                </p>
              </div>
            )}

            {/* EMPTY STATE */}

            {!loadingDocuments &&
              messages.length === 0 &&
              !error && (
                <div className="min-h-[55vh] flex flex-col items-center justify-center text-center px-3">
                  <div
                    className="orb w-16 h-16 rounded-full flex items-center justify-center mb-6"
                    style={{
                      background:
                        "radial-gradient(circle at 32% 28%, #F4C77B, #D9922B 60%, #B87418 100%)",
                      animation:
                        "orbPulse 3.2s ease-in-out infinite",
                    }}
                  >
                    <Layers
                      size={24}
                      style={{
                        color: "#3B2205",
                      }}
                    />
                  </div>

                  <p
                    className="text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] mb-2"
                    style={{
                      color: "#8E8C83",
                    }}
                  >
                    DOCUMENT LIBRARY
                  </p>

                  <h1
                    className="text-2xl sm:text-[30px] mb-2"
                    style={{
                      color: "#F6F4ED",
                    }}
                  >
                    Ask all your documents
                  </h1>

                  <p
                    className="text-[13px] leading-6 max-w-md"
                    style={{
                      color: "#8E8C83",
                    }}
                  >
                    Ask a question and DocMind AI
                    will search across your uploaded
                    documents to find the answer.
                  </p>

                  <div className="mt-6">
                    <div
                      className="px-3 py-1.5 rounded-full"
                      style={{
                        background:
                          "rgba(232,163,61,0.08)",
                        border:
                          "1px solid rgba(232,163,61,0.20)",
                      }}
                    >
                      <span
                        className="text-[11px]"
                        style={{
                          color: "#F4C77B",
                        }}
                      >
                        {documents.length}{" "}
                        {documents.length === 1
                          ? "document"
                          : "documents"}{" "}
                        available
                      </span>
                    </div>
                  </div>
                </div>
              )}

            {/* ERROR */}

            {error && (
              <div
                className="mb-5 rounded-xl px-4 py-3"
                style={{
                  background:
                    "rgba(248,113,113,0.08)",
                  border:
                    "1px solid rgba(248,113,113,0.25)",
                }}
              >
                <p
                  className="text-[13px] break-words"
                  style={{
                    color: "#F87171",
                  }}
                >
                  {error}
                </p>
              </div>
            )}

            {/* =================================================
                MESSAGES
            ================================================= */}

            <div className="space-y-6 sm:space-y-7">
              {messages.map((message) => {
                const isUser =
                  message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={
                      isUser
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                    style={{
                      animation:
                        "bubbleIn 0.25s ease-out",
                    }}
                  >
                    <div
                      className={
                        isUser
                          ? "max-w-[92%] sm:max-w-[80%]"
                          : "w-full"
                      }
                    >
                      {isUser ? (
                        <div
                          className="rounded-2xl rounded-br-md px-4 py-3"
                          style={{
                            background:
                              "linear-gradient(165deg, rgba(232,163,61,0.22), rgba(232,163,61,0.08))",
                            border:
                              "1px solid rgba(232,163,61,0.28)",
                            boxShadow:
                              "0 10px 22px -12px rgba(232,163,61,0.35)",
                          }}
                        >
                          <p
                            className="text-[13.5px] leading-6 whitespace-pre-wrap break-words"
                            style={{
                              color: "#F9F1E2",
                            }}
                          >
                            {message.content}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start gap-2.5 sm:gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{
                                background:
                                  "linear-gradient(150deg, #F4C77B 0%, #E8A33D 55%, #C97F1F 100%)",
                                boxShadow:
                                  "0 1px 0 rgba(255,255,255,0.35) inset, 0 6px 14px rgba(232,163,61,0.3)",
                              }}
                            >
                              <Layers
                                size={15}
                                className="text-[#3B2205]"
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p
                                className="text-[11px] font-semibold mb-1.5"
                                style={{
                                  color: "#8E8C83",
                                }}
                              >
                                DocMind AI
                              </p>

                              <div
                                className="rounded-2xl rounded-tl-md px-3.5 sm:px-4 py-3.5"
                                style={{
                                  background:
                                    "rgba(255,255,255,0.035)",
                                  border:
                                    "1px solid rgba(255,255,255,0.08)",
                                }}
                              >
                                <div
                                  className="text-[13.5px] leading-6 whitespace-pre-wrap break-words"
                                  style={{
                                    color:
                                      "#F3F1EB",
                                  }}
                                >
                                  {message.content}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="ml-0 sm:ml-11">
                            <Sources
                              sources={
                                message.sources
                              }
                              retrievedChunks={
                                message.retrievedChunks
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* AI LOADING */}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(150deg, #F4C77B 0%, #E8A33D 55%, #C97F1F 100%)",
                      }}
                    >
                      <Layers
                        size={15}
                        className="text-[#3B2205]"
                      />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="text-[11px] font-semibold mb-2"
                        style={{
                          color: "#8E8C83",
                        }}
                      >
                        DocMind AI
                      </p>

                      <div
                        className="flex items-center gap-2 rounded-2xl rounded-tl-md px-3.5 sm:px-4 py-3"
                        style={{
                          background:
                            "rgba(255,255,255,0.035)",
                          border:
                            "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <span className="flex items-center gap-1 flex-shrink-0">
                          {[0, 1, 2].map(
                            (dot) => (
                              <span
                                key={dot}
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius:
                                    "50%",
                                  background:
                                    "#E8A33D",
                                  display:
                                    "inline-block",
                                  animation:
                                    "typingDot 1.1s ease-in-out infinite",
                                  animationDelay: `${dot * 0.15}s`,
                                }}
                              />
                            )
                          )}
                        </span>

                        <span
                          className="text-[12px] sm:text-[13px]"
                          style={{
                            color: "#8E8C83",
                          }}
                        >
                          Searching all your
                          documents...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* =================================================
              QUESTION INPUT
          ================================================= */}

          <div
            className="fixed bottom-0 left-0 lg:left-[248px] right-0 z-30"
            style={{
              background:
                "rgba(10,12,16,0.90)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter:
                "blur(16px)",
              borderTop:
                "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="max-w-3xl mx-auto px-3 sm:px-5 lg:px-8 py-3 sm:py-4">
              <form
                onSubmit={handleSubmit}
                className="flex items-end gap-2 rounded-2xl p-2"
                style={{
                  background:
                    "rgba(255,255,255,0.045)",
                  border:
                    "1px solid rgba(255,255,255,0.1)",
                  boxShadow:
                    "0 1px 0 rgba(255,255,255,0.05) inset, 0 16px 32px -18px rgba(0,0,0,0.6)",
                }}
              >
                <textarea
                  value={question}
                  onChange={(event) =>
                    setQuestion(
                      event.target.value
                    )
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about all your documents..."
                  rows={1}
                  disabled={loading}
                  className="flex-1 resize-none bg-transparent border-0 outline-none text-[13px] sm:text-[13.5px] px-2 py-2 max-h-32 placeholder:text-[#66645D]"
                  style={{
                    color: "#F3F1EB",
                  }}
                />

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !question.trim()
                  }
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-35 disabled:cursor-not-allowed"
                  style={{
                    background:
                      loading ||
                      !question.trim()
                        ? "rgba(255,255,255,0.08)"
                        : "linear-gradient(150deg, #F4C77B 0%, #E8A33D 60%, #D9922B 100%)",
                    color:
                      loading ||
                      !question.trim()
                        ? "#8E8C83"
                        : "#3B2205",
                    boxShadow:
                      loading ||
                      !question.trim()
                        ? "none"
                        : "0 1px 0 rgba(255,255,255,0.4) inset, 0 8px 18px rgba(232,163,61,0.35)",
                  }}
                >
                  {loading ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </form>

              <p
                className="text-[10px] sm:text-[10.5px] text-center mt-2"
                style={{
                  color: "#6E6C64",
                }}
              >
                Enter to send · Shift + Enter
                for a new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatAllDocuments;