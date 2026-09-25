import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FileText,
  Upload,
  Search,
  MessageSquare,
  HardDrive,
  Files,
  ArrowRight,
  ArrowUpRight,
  Loader2,
  Crown,
  Layers,
  Plus,
  Settings,
  LifeBuoy,
  User,
  Menu,
  X,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ==========================================
  // STATES
  // ==========================================

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [search, setSearch] = useState("");

  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActionId, setMobileActionId] = useState(null);

  const [stats, setStats] = useState({
    documents: 0,
    questionsAsked: 0,
    storageUsed: 0,
  });

  // ==========================================
  // BILLING
  // ==========================================

  const [billing, setBilling] = useState({
    plan: "free",
    usage: {
      uploads: 0,
      maxUploads: 5,
      questionsThisMonth: 0,
      maxQuestionsPerMonth: 20,
    },
    limits: {
      maxDocuments: 5,
      maxFileSizeMB: 20,
      multiDocChat: false,
      exportChat: false,
    },
  });

  const [upgrading, setUpgrading] = useState(false);

  // ==========================================
  // BILLING STATUS
  // ==========================================

  const fetchBillingStatus = async () => {
    try {
      const response = await api.get("/billing/status");

      if (response.data.success) {
        setBilling({
          plan: response.data.plan,
          usage: response.data.usage,
          limits: response.data.limits,
        });
      }
    } catch (error) {
      console.error("Fetch Billing Status Error:", error);
    }
  };

  // ==========================================
  // UPGRADE
  // ==========================================

  const handleUpgrade = async () => {
    try {
      setUpgrading(true);

      // 1. Create Razorpay order from backend
      const orderRes = await api.post("/billing/create-order");

      if (!orderRes.data.success) {
        alert(orderRes.data.message || "Could not start upgrade");
        return;
      }

      const { orderId, amount, currency = "INR", keyId, mock } = orderRes.data;

      // 2. Development/mock mode
      if (mock) {
        const verifyRes = await api.post("/billing/verify", {
          orderId,
          paymentId: "mock_payment",
          razorpayOrderId: orderId,
          signature: "mock_signature",
        });

        if (verifyRes.data.success) {
          alert("Upgraded to Pro! 🎉");
          await fetchBillingStatus();
        } else {
          alert(verifyRes.data.message || "Upgrade verification failed");
        }

        return;
      }

      // 3. Real Razorpay checkout
      if (!window.Razorpay) {
        alert("Razorpay Checkout is not loaded. Please refresh the page.");
        return;
      }

      if (!keyId) {
        alert("Razorpay Key ID is missing from server response.");
        return;
      }

      const options = {
        key: keyId,

        amount: amount,

        currency,

        name: "DocMind AI",

        description: "DocMind AI Pro Plan",

        order_id: orderId,

        theme: {
          color: "#E8A33D",
        },

        handler: async function (response) {
          try {
            setUpgrading(true);

            const verifyRes = await api.post("/billing/verify", {
              orderId,
              paymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              alert("Payment successful! Welcome to DocMind Pro 🎉");

              await fetchBillingStatus();
            } else {
              alert(verifyRes.data.message || "Payment verification failed");
            }
          } catch (error) {
            console.error("Payment Verification Error:", error);

            alert(
              error.response?.data?.message || "Payment verification failed",
            );
          } finally {
            setUpgrading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setUpgrading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Razorpay Payment Failed:", response.error);

        alert(
          response.error?.description || "Payment failed. Please try again.",
        );

        setUpgrading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("Upgrade Error:", error);

      alert(
        error.response?.data?.message || "Upgrade failed. Please try again.",
      );
    } finally {
      setUpgrading(false);
    }
  };

  // ==========================================
  // FETCH DOCUMENTS
  // ==========================================

  const fetchDocuments = async () => {
    try {
      setLoading(true);

      const response = await api.get("/documents");

      if (response.data.success) {
        setDocuments(response.data.documents || []);
      }
    } catch (error) {
      console.error("Fetch Documents Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH STATS
  // ==========================================

  const fetchStats = async () => {
    try {
      const response = await api.get("/chat/stats");

      if (response.data.success && response.data.stats) {
        setStats({
          documents: Number(response.data.stats.documents) || 0,

          questionsAsked: Number(response.data.stats.questionsAsked) || 0,

          storageUsed: Number(response.data.stats.storageUsed) || 0,
        });
      }
    } catch (error) {
      console.error("Fetch Stats Error:", error);

      setStats((prev) => ({
        ...prev,
        documents: documents.length,
      }));
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchDocuments();
    fetchStats();
    fetchBillingStatus();
  }, []);

  // ==========================================
  // CLOSE MOBILE MENU WHEN ROUTING
  // ==========================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ==========================================
  // NAVIGATION
  // ==========================================

  const goTo = (path) => {
    closeMobileMenu();
    navigate(path);
  };

  // ==========================================
  // UPLOAD
  // ==========================================

  const handleUpload = async (file) => {
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      alert("Please upload a PDF file only.");
      return;
    }

    const isPro = billing.plan === "pro";
    const maxSizeMB =
      Number(billing.limits.maxFileSizeMB) || (isPro ? 500 : 20);
    const maxSize = maxSizeMB * 1024 * 1024;

    if (file.size > maxSize) {
      alert(`PDF size must be less than ${maxSizeMB} MB on your current plan.`);
      return;
    }

    const uploads = Number(billing.usage.uploads) || 0;
    const maxUploads = billing.usage.maxUploads;

    if (!isPro && maxUploads !== null && uploads >= Number(maxUploads)) {
      alert(
        `You have reached the free upload limit of ${maxUploads} PDFs. Upgrade to Pro to upload more documents.`,
      );
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("document", file);

      const response = await api.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert("PDF uploaded and indexed successfully!");

        await Promise.all([
          fetchDocuments(),
          fetchStats(),
          fetchBillingStatus(),
        ]);
      } else {
        alert(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload Error:", error);

      if (error.response?.data?.code === "UPLOAD_LIMIT_REACHED") {
        await fetchBillingStatus();
      }

      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload document",
      );
    } finally {
      setUploading(false);
      setDragOver(false);
    }
  };
  // ==========================================
  // FILE INPUT
  // ==========================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleUpload(file);
    }

    event.target.value = "";
  };

  // ==========================================
  // DRAG
  // ==========================================

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!uploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragOver(false);

    if (uploading) return;

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleUpload(file);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (documentId, fileName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${fileName}"?`,
    );

    if (!confirmDelete) return;

    try {
      const response = await api.delete(`/documents/${documentId}`);

      if (response.data.success) {
        setDocuments((prev) =>
          prev.filter((doc) => (doc._id || doc.id) !== documentId),
        );

        setMobileActionId(null);

        await fetchStats();

        alert("Document deleted successfully!");
      }
    } catch (error) {
      console.error("Delete Document Error:", error);

      alert(error.response?.data?.message || "Failed to delete document");
    }
  };

  // ==========================================
  // RENAME
  // ==========================================

  const handleRename = async (documentId) => {
    const trimmedName = renameValue.trim();

    if (!trimmedName) {
      alert("File name is required");
      return;
    }

    try {
      const response = await api.put(`/documents/${documentId}`, {
        fileName: trimmedName,
      });

      if (response.data.success) {
        setDocuments((prev) =>
          prev.map((doc) =>
            (doc._id || doc.id) === documentId
              ? {
                  ...doc,
                  fileName: response.data.document.fileName,
                }
              : doc,
          ),
        );

        setRenamingId(null);
        setRenameValue("");
        setMobileActionId(null);
      }
    } catch (error) {
      console.error("Rename Error:", error);

      alert(error.response?.data?.message || "Failed to rename document");
    }
  };

  // ==========================================
  // OPEN DOCUMENT
  // ==========================================

  const openDocument = (documentId) => {
    if (!documentId) {
      console.error("Document ID missing");
      return;
    }

    closeMobileMenu();

    navigate(`/document/${documentId}`);
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredDocuments = documents.filter((document) => {
    const name = document.fileName || document.name || "";

    return name.toLowerCase().includes(search.toLowerCase());
  });

  // ==========================================
  // TOTAL PAGES
  // ==========================================

  const totalPages = documents.reduce(
    (total, document) =>
      total + Number(document.totalPages || document.pages || 0),
    0,
  );

  // ==========================================
  // STORAGE
  // ==========================================

  const totalStorage = documents.reduce(
    (total, document) => total + (Number(document.fileSize) || 0),
    0,
  );

  const storageMB = (totalStorage / (1024 * 1024)).toFixed(2);

  // ==========================================
  // RECENT DOCUMENTS
  // ==========================================

  const recentDocuments = documents.slice(0, 6);

  // ==========================================
  // ACTION CARDS
  // ==========================================

  const actionCards = [
    {
      title: "Upload a PDF",

      description: "Drop in a new document and DocMind indexes it for search.",

      icon: Upload,

      accent: "#FF8A5B",

      glow: "rgba(255,138,91,0.18)",

      onClick: () => fileInputRef.current?.click(),
    },

    {
      title: "Chat all documents",

      description: billing.limits.multiDocChat
        ? "Ask one question across every document you've uploaded."
        : "Pro feature — ask across your whole library at once.",

      icon: Layers,

      accent: "#3DDC97",

      glow: "rgba(61,220,151,0.16)",

      onClick: () => navigate("/chat-all"),

      locked: !billing.limits.multiDocChat,
    },

    {
      title: "Continue last chat",

      description:
        documents.length > 0
          ? `Pick up where you left off on ${
              documents[0].fileName || "your document"
            }.`
          : "Upload a document to start your first conversation.",

      icon: MessageSquare,

      accent: "#F4C77B",

      glow: "rgba(244,199,123,0.18)",

      onClick: () =>
        documents.length > 0
          ? navigate(`/chat/${documents[0]._id || documents[0].id}`)
          : fileInputRef.current?.click(),
    },
  ];

  // ==========================================
  // SIDEBAR COMPONENT
  // ==========================================

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* LOGO */}

      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-[9px] flex items-center justify-center"
            style={{
              background:
                "linear-gradient(150deg, #F4C77B 0%, #E8A33D 55%, #C97F1F 100%)",
            }}
          >
            <FileText size={15} className="text-[#2A1704]" strokeWidth={2.4} />
          </div>

          <span
            className="font-ui text-[14px] font-semibold"
            style={{ color: "#F3F1EB" }}
          >
            DocMind AI
          </span>
        </div>

        {mobile && (
          <button
            onClick={closeMobileMenu}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "#B3B1A8",
            }}
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* NEW UPLOAD */}

      <button
        onClick={() => {
          closeMobileMenu();
          fileInputRef.current?.click();
        }}
        className="flex items-center gap-2 font-ui text-[13px] font-medium px-3 py-2.5 rounded-lg mb-6 transition-all"
        style={{
          background:
            "linear-gradient(165deg, rgba(232,163,61,0.16), rgba(232,163,61,0.05))",

          border: "1px solid rgba(232,163,61,0.3)",

          color: "#F4C77B",
        }}
      >
        <Plus size={15} />
        New Upload
      </button>

      {/* FEATURES */}

      <p
        className="font-ui text-[10.5px] font-semibold tracking-wide mb-2 px-1"
        style={{ color: "#5E5C55" }}
      >
        Features
      </p>

      <nav className="flex flex-col gap-1 mb-6">
        {/* Documents */}

        <button
          onClick={() => goTo("/dashboard")}
          className="flex items-center gap-2.5 font-ui text-[13px] px-2.5 py-2.5 rounded-lg text-left transition-colors"
          style={{
            color: "#F3F1EB",
            background: "rgba(255,255,255,0.06)",
          }}
        >
          <Files size={15} />
          Documents
        </button>

        {/* Chat All */}

        <button
          onClick={() => goTo("/chat-all")}
          className="flex items-center gap-2.5 font-ui text-[13px] px-2.5 py-2.5 rounded-lg text-left transition-colors"
          style={{ color: "#8E8C83" }}
        >
          <Layers size={15} />
          Chat all docs
        </button>

        {/* Settings */}

        <button
          onClick={() => goTo("/settings")}
          className="flex items-center gap-2.5 font-ui text-[13px] px-2.5 py-2.5 rounded-lg text-left transition-colors"
          style={{ color: "#8E8C83" }}
        >
          <Settings size={15} />
          Settings
        </button>

        {/* Help */}

        <button
          onClick={() => goTo("/help")}
          className="flex items-center gap-2.5 font-ui text-[13px] px-2.5 py-2.5 rounded-lg text-left transition-colors"
          style={{ color: "#8E8C83" }}
        >
          <LifeBuoy size={15} />
          Help & Support
        </button>
      </nav>

      {/* DOCUMENTS */}

      <p
        className="font-ui text-[10.5px] font-semibold tracking-wide mb-2 px-1"
        style={{ color: "#5E5C55" }}
      >
        Your Documents
      </p>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1 min-h-0">
        {recentDocuments.length === 0 && (
          <p
            className="font-ui text-[12px] px-2.5 py-2"
            style={{ color: "#5E5C55" }}
          >
            No documents yet
          </p>
        )}

        {recentDocuments.map((document) => {
          const documentId = document._id || document.id;

          return (
            <button
              key={documentId}
              onClick={() => openDocument(documentId)}
              className="font-ui text-[12.5px] px-2.5 py-2.5 rounded-lg text-left truncate transition-colors"
              style={{ color: "#9A988E" }}
            >
              {document.fileName || document.name || "Untitled document"}
            </button>
          );
        })}
      </div>

      {/* UPGRADE */}

      {billing.plan !== "pro" && (
        <div
          className="mt-4 rounded-xl p-3.5 flex-shrink-0"
          style={{
            background:
              "linear-gradient(165deg, rgba(232,163,61,0.16), rgba(232,163,61,0.04))",

            border: "1px solid rgba(232,163,61,0.28)",
          }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Crown size={13} style={{ color: "#F4C77B" }} />

            <span
              className="font-ui text-[12.5px] font-semibold"
              style={{ color: "#F3F1EB" }}
            >
              Upgrade to Pro
            </span>
          </div>

          <p
            className="font-ui text-[11px] leading-4 mb-3"
            style={{ color: "#9A988E" }}
          >
            Up to 500 MB PDFs, unlimited uploads, multi-doc chat, and chat
            export.
          </p>

          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="w-full flex items-center justify-center gap-1.5 font-ui text-[12px] font-semibold py-2 rounded-lg disabled:opacity-60"
            style={{
              color: "#3B2205",
              background:
                "linear-gradient(150deg, #F4C77B 0%, #E8A33D 60%, #D9922B 100%)",
            }}
          >
            {upgrading ? "Upgrading..." : "Upgrade Now"}
          </button>
        </div>
      )}

      {/* LOGOUT ON MOBILE */}

      {mobile && (
        <button
          onClick={handleLogout}
          className="mt-4 flex items-center gap-2.5 font-ui text-[13px] px-2.5 py-2.5 rounded-lg text-left"
          style={{
            color: "#F87171",
            border: "1px solid rgba(248,113,113,0.18)",
          }}
        >
          <Trash2 size={15} />
          Logout
        </button>
      )}
    </div>
  );

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: "#0A0C10",
      }}
    >
      {/* ======================================
          ANIMATIONS
      ====================================== */}

      <style>{`
        @keyframes driftA {
          0% {
            transform: translate(0px, 0px) scale(1);
          }

          33% {
            transform: translate(26px, 18px) scale(1.08);
          }

          66% {
            transform: translate(-14px, 30px) scale(0.96);
          }

          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes driftB {
          0% {
            transform: translate(0px, 0px) scale(1);
          }

          40% {
            transform: translate(-30px, 24px) scale(1.1);
          }

          75% {
            transform: translate(18px, -16px) scale(0.94);
          }

          100% {
            transform: translate(0px, 0px) scale(1);
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

        @media (prefers-reduced-motion: reduce) {
          .bg-blob,
          .orb {
            animation: none !important;
          }
        }
      `}</style>

      {/* ======================================
          BACKGROUND
      ====================================== */}

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="bg-blob absolute"
          style={{
            top: "-14%",
            left: "10%",
            width: "680px",
            height: "480px",
            background:
              "radial-gradient(closest-side, rgba(232,163,61,0.16), transparent 72%)",
            animation:
              "driftA 24s ease-in-out infinite, glowPulse 10s ease-in-out infinite",
          }}
        />

        <div
          className="bg-blob absolute"
          style={{
            top: "4%",
            right: "0%",
            width: "560px",
            height: "460px",
            background:
              "radial-gradient(closest-side, rgba(61,220,151,0.09), transparent 72%)",
            animation:
              "driftB 29s ease-in-out infinite, glowPulse 12s ease-in-out infinite",
          }}
        />
      </div>

      {/* ======================================
          MOBILE SIDEBAR OVERLAY
      ====================================== */}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          style={{
            background: "rgba(0,0,0,0.68)",
            backdropFilter: "blur(5px)",
          }}
          onClick={closeMobileMenu}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-[min(86vw,300px)] p-4 shadow-2xl"
            style={{
              background: "#0D1015",
              borderRight: "1px solid rgba(255,255,255,0.08)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <SidebarContent mobile />
          </aside>
        </div>
      )}

      <div className="relative z-10 flex">
        {/* ======================================
            DESKTOP SIDEBAR
        ====================================== */}

        <aside
          className="hidden lg:flex flex-col w-[248px] flex-shrink-0 h-screen sticky top-0 px-4 py-5"
          style={{
            borderRight: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <SidebarContent />
        </aside>

        {/* ======================================
            MAIN
        ====================================== */}

        <div className="flex-1 min-w-0">
          {/* ======================================
              TOP BAR
          ====================================== */}

          <header
            className="sticky top-0 z-30 px-4 sm:px-6 lg:px-9 py-3.5 flex items-center justify-between"
            style={{
              background: "rgba(10,12,16,0.78)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {/* LEFT */}

            <div className="flex items-center gap-3">
              {/* MOBILE MENU */}

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#B3B1A8",
                }}
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>

              {/* MOBILE LOGO */}

              <div className="flex items-center gap-2 lg:hidden">
                <div
                  className="w-8 h-8 rounded-[9px] flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(150deg, #F4C77B 0%, #E8A33D 55%, #C97F1F 100%)",
                  }}
                >
                  <FileText
                    size={16}
                    className="text-[#2A1704]"
                    strokeWidth={2.4}
                  />
                </div>

                <span
                  className="font-ui text-[14px] sm:text-[15px] font-semibold"
                  style={{ color: "#F3F1EB" }}
                >
                  DocMind AI
                </span>
              </div>

              {/* DESKTOP PLAN */}

              <span
                className="hidden lg:inline-flex items-center gap-1.5 font-ui text-[12.5px] font-medium px-3 py-1.5 rounded-full"
                style={{
                  color: billing.plan === "pro" ? "#F4C77B" : "#9A988E",

                  background: "rgba(255,255,255,0.05)",

                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                {billing.plan === "pro" && <Crown size={11} />}
                DocMind AI · {billing.plan === "pro" ? "Pro" : "Free"} plan
              </span>
            </div>

            {/* RIGHT */}

            <div className="flex items-center gap-2 sm:gap-4">
              <span
                className="hidden md:inline font-ui text-[13px] font-medium"
                style={{ color: "#F3F1EB" }}
              >
                Dashboard
              </span>

              {billing.plan !== "pro" && (
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="hidden sm:flex items-center gap-1.5 font-ui text-[12.5px] font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60"
                  style={{
                    color: "#3B2205",
                    background:
                      "linear-gradient(150deg, #F4C77B 0%, #E8A33D 60%, #D9922B 100%)",
                  }}
                >
                  <Crown size={13} />

                  {upgrading ? "Upgrading..." : "Upgrade"}
                </button>
              )}

              {/* PROFILE */}

              <button
                onClick={() => navigate("/settings")}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                title="Profile & Settings"
              >
                <User
                  size={15}
                  style={{
                    color: "#B3B1A8",
                  }}
                />
              </button>
            </div>
          </header>

          {/* ======================================
              MAIN CONTENT
          ====================================== */}

          <main className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-9 py-8 sm:py-12 lg:py-14">
            {/* ==================================
                HERO
            ================================== */}

            <div className="flex flex-col items-center text-center mb-8 sm:mb-9">
              <div
                className="orb w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-5 sm:mb-6"
                style={{
                  background:
                    "radial-gradient(circle at 32% 28%, #F4C77B, #D9922B 60%, #B87418 100%)",

                  animation: "orbPulse 3.2s ease-in-out infinite",
                }}
              >
                <FileText size={24} className="text-[#3B2205] sm:hidden" />

                <FileText
                  size={26}
                  className="text-[#3B2205] hidden sm:block"
                />
              </div>

              <p
                className="font-ui text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] mb-2"
                style={{ color: "#8E8C83" }}
              >
                WELCOME BACK
              </p>

              <h1
                className="font-voice text-[25px] leading-tight sm:text-[32px]"
                style={{ color: "#F6F4ED" }}
              >
                Turn your PDFs into answers
              </h1>

              <p
                className="font-ui text-[12px] sm:text-[13px] mt-2 max-w-md px-4"
                style={{ color: "#6E6C64" }}
              >
                Upload a document and ask questions using AI-powered document
                search.
              </p>
            </div>

            {/* ==================================
                UPLOAD
            ================================== */}

            <label
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                group relative block w-full rounded-2xl cursor-pointer
                transition-all duration-200 mb-5
                ${uploading ? "pointer-events-none opacity-70" : ""}
              `}
              style={{
                background: dragOver
                  ? "linear-gradient(165deg, rgba(232,163,61,0.14), rgba(232,163,61,0.03))"
                  : "rgba(255,255,255,0.04)",

                border: dragOver
                  ? "1px solid rgba(232,163,61,0.6)"
                  : "1px solid rgba(255,255,255,0.1)",

                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.05) inset, 0 20px 40px -20px rgba(0,0,0,0.6)",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                disabled={uploading}
                onChange={handleFileChange}
              />

              <div className="flex items-center gap-3 px-4 sm:px-5 py-4 sm:py-5">
                {uploading ? (
                  <Loader2
                    size={18}
                    className="animate-spin flex-shrink-0"
                    style={{
                      color: "#E8A33D",
                    }}
                  />
                ) : (
                  <Upload
                    size={18}
                    className="flex-shrink-0"
                    style={{
                      color: "#F4C77B",
                    }}
                  />
                )}

                <span
                  className="font-ui text-[13px] sm:text-[14px] leading-5"
                  style={{
                    color: uploading ? "#8E8C83" : "#B3B1A8",
                  }}
                >
                  {uploading
                    ? "Uploading your PDF..."
                    : "Drop a PDF here, or click to browse..."}
                </span>
              </div>

              <div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-3"
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <span
                  className="self-start font-ui text-[10.5px] sm:text-[11.5px] px-2.5 py-1 rounded-full"
                  style={{
                    color: "#9A988E",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  PDF only · Max {billing.limits.maxFileSizeMB || 20} MB
                </span>

                <span
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 font-ui text-[12px] sm:text-[12.5px] font-semibold px-3.5 py-2 rounded-lg"
                  style={{
                    color: "#3B2205",
                    background:
                      "linear-gradient(150deg, #F4C77B 0%, #E8A33D 60%, #D9922B 100%)",

                    boxShadow:
                      "0 1px 0 rgba(255,255,255,0.4) inset, 0 8px 18px rgba(232,163,61,0.32)",
                  }}
                >
                  <Upload size={13} strokeWidth={2.3} />
                  Upload PDF
                </span>
              </div>
            </label>

            {/* ==================================
                ACTION CARDS
            ================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8 sm:mb-11">
              {actionCards.map((card) => {
                const Icon = card.icon;

                return (
                  <button
                    key={card.title}
                    onClick={card.onClick}
                    className="relative text-left rounded-2xl p-4 sm:p-4.5 transition-all duration-200 min-h-[145px]"
                    style={{
                      background:
                        "linear-gradient(165deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",

                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.transform = "translateY(-3px)";

                      event.currentTarget.style.boxShadow = `0 18px 30px -16px ${card.glow}`;
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = "translateY(0px)";

                      event.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${card.glow}, transparent 70%), rgba(255,255,255,0.04)`,

                          border: `1px solid ${card.glow}`,
                        }}
                      >
                        <Icon
                          size={15}
                          style={{
                            color: card.accent,
                          }}
                        />
                      </div>

                      <ArrowUpRight
                        size={15}
                        style={{
                          color: "#5E5C55",
                        }}
                      />
                    </div>

                    <p
                      className="font-ui text-[13.5px] font-semibold mb-1 flex items-center gap-1.5"
                      style={{
                        color: "#F3F1EB",
                      }}
                    >
                      {card.title}

                      {card.locked && (
                        <Crown
                          size={11}
                          style={{
                            color: "#F4C77B",
                          }}
                        />
                      )}
                    </p>

                    <p
                      className="font-ui text-[12px] leading-5"
                      style={{
                        color: "#8E8C83",
                      }}
                    >
                      {card.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* ==================================
                STATS
            ================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8 sm:mb-9">
              {[
                {
                  label: "Documents",
                  value: stats.documents || documents.length,
                  icon: Files,
                },

                {
                  label: "Questions asked",
                  value: stats.questionsAsked || 0,
                  icon: MessageSquare,
                },

                {
                  label: "Uploads",
                  value:
                    billing.usage.maxUploads === null
                      ? `${billing.usage.uploads || 0} / Unlimited`
                      : `${billing.usage.uploads || 0} / ${billing.usage.maxUploads || 5}`,
                  icon: Upload,
                },

                {
                  label: "Storage used",
                  value:
                    stats.storageUsed !== undefined &&
                    stats.storageUsed !== null
                      ? `${stats.storageUsed} MB`
                      : `${storageMB} MB`,
                  icon: HardDrive,
                },
              ].map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-xl px-4 py-3.5 flex items-center gap-3"
                    style={{
                      background: "rgba(255,255,255,0.03)",

                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <Icon
                      size={16}
                      style={{
                        color: "#6E6C64",
                      }}
                      className="flex-shrink-0"
                    />

                    <div className="min-w-0">
                      <p
                        className="font-ui text-[14px] font-semibold truncate"
                        style={{
                          color: "#F3F1EB",
                        }}
                      >
                        {stat.value}
                      </p>

                      <p
                        className="font-ui text-[10.5px]"
                        style={{
                          color: "#6E6C64",
                        }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ==================================
                DOCUMENT HEADER
            ================================== */}

            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center justify-between gap-3">
                <h2
                  className="font-ui text-[14px] font-semibold"
                  style={{
                    color: "#F3F1EB",
                  }}
                >
                  All documents
                  {documents.length > 0 && (
                    <span
                      className="font-ui text-[11px] sm:text-[12px] font-normal ml-2"
                      style={{
                        color: "#6E6C64",
                      }}
                    >
                      {documents.length} · {totalPages} pages
                    </span>
                  )}
                </h2>
              </div>

              {documents.length > 0 && (
                <div className="relative w-full">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{
                      color: "#5E5C55",
                    }}
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search documents"
                    className="font-ui text-[12.5px] w-full pl-8 pr-3 py-2.5 rounded-lg outline-none"
                    style={{
                      background: "rgba(255,255,255,0.04)",

                      border: "1px solid rgba(255,255,255,0.09)",

                      color: "#F3F1EB",
                    }}
                  />
                </div>
              )}
            </div>

            {/* ==================================
                LOADING
            ================================== */}

            {loading ? (
              <div
                className="rounded-2xl py-14 flex flex-col items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.03)",

                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Loader2
                  size={22}
                  className="animate-spin mb-3"
                  style={{
                    color: "#E8A33D",
                  }}
                />

                <p
                  className="font-ui text-[13px]"
                  style={{
                    color: "#8E8C83",
                  }}
                >
                  Loading documents...
                </p>
              </div>
            ) : documents.length > 0 ? (
              filteredDocuments.length > 0 ? (
                <div
                  className="rounded-2xl overflow-visible sm:overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.03)",

                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {filteredDocuments.map((document, index) => {
                    const documentId = document._id || document.id;

                    const pages = document.totalPages || document.pages || 0;

                    const indexed = document.isIndexed ?? document.indexed;

                    const menuOpen = mobileActionId === documentId;

                    return (
                      <div
                        key={documentId || index}
                        className="relative"
                        style={{
                          borderBottom:
                            index < filteredDocuments.length - 1
                              ? "1px solid rgba(255,255,255,0.07)"
                              : "none",
                        }}
                      >
                        <div
                          onClick={() => openDocument(documentId)}
                          className="w-full flex items-start sm:items-center gap-3 sm:gap-4 px-3.5 sm:px-5 py-4 text-left cursor-pointer transition-colors"
                          style={{
                            background: "transparent",
                          }}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.background =
                              "rgba(255,255,255,0.035)";
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.background =
                              "transparent";
                          }}
                        >
                          {/* ICON */}

                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background:
                                "radial-gradient(circle at 30% 30%, rgba(255,138,91,0.22), transparent 70%), rgba(255,255,255,0.04)",

                              border: "1px solid rgba(255,138,91,0.25)",
                            }}
                          >
                            <FileText
                              size={14}
                              style={{
                                color: "#FF8A5B",
                              }}
                            />
                          </div>

                          {/* DOCUMENT INFO */}

                          <div className="flex-1 min-w-0">
                            {renamingId === documentId ? (
                              <div
                                className="flex flex-col sm:flex-row sm:items-center gap-2"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <input
                                  autoFocus
                                  value={renameValue}
                                  onChange={(event) =>
                                    setRenameValue(event.target.value)
                                  }
                                  onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                      handleRename(documentId);
                                    }

                                    if (event.key === "Escape") {
                                      setRenamingId(null);

                                      setRenameValue("");
                                    }
                                  }}
                                  className="w-full px-2.5 py-2 rounded-md font-ui text-[12px] sm:text-[13px] outline-none"
                                  style={{
                                    background: "rgba(255,255,255,0.05)",

                                    border: "1px solid rgba(232,163,61,0.5)",

                                    color: "#F3F1EB",
                                  }}
                                />

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleRename(documentId)}
                                    className="px-2.5 py-1.5 rounded-md font-ui text-[11px]"
                                    style={{
                                      background: "#F3F1EB",
                                      color: "#0A0C10",
                                    }}
                                  >
                                    Save
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRenamingId(null);

                                      setRenameValue("");
                                    }}
                                    className="px-2.5 py-1.5 rounded-md font-ui text-[11px]"
                                    style={{
                                      border:
                                        "1px solid rgba(255,255,255,0.12)",
                                      color: "#B3B1A8",
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p
                                className="font-ui text-[12.5px] sm:text-[13px] font-medium truncate pr-2"
                                style={{
                                  color: "#F3F1EB",
                                }}
                              >
                                {document.fileName ||
                                  document.name ||
                                  "Untitled document"}
                              </p>
                            )}

                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span
                                className="font-ui text-[10.5px] sm:text-[11px]"
                                style={{
                                  color: "#6E6C64",
                                }}
                              >
                                {pages} {pages === 1 ? "page" : "pages"}
                              </span>

                              <span
                                style={{
                                  color: "#3E3C36",
                                }}
                              >
                                •
                              </span>

                              <span
                                className="font-ui text-[10.5px] sm:text-[11px]"
                                style={{
                                  color: indexed ? "#3DDC97" : "#F4C77B",
                                }}
                              >
                                {indexed ? "Indexed" : "Processing"}
                              </span>
                            </div>
                          </div>

                          {/* DESKTOP ACTIONS */}

                          <div
                            className="hidden sm:flex items-center gap-2 flex-shrink-0"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setRenamingId(documentId);

                                setRenameValue(document.fileName || "");
                              }}
                              className="px-2.5 py-1.5 text-[11.5px] font-ui font-medium rounded-lg"
                              style={{
                                color: "#B3B1A8",

                                border: "1px solid rgba(255,255,255,0.1)",
                              }}
                            >
                              Rename
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(documentId, document.fileName)
                              }
                              className="px-2.5 py-1.5 text-[11.5px] font-ui font-medium rounded-lg"
                              style={{
                                color: "#F87171",

                                border: "1px solid rgba(248,113,113,0.28)",
                              }}
                            >
                              Delete
                            </button>

                            <ArrowRight
                              size={15}
                              style={{
                                color: "#5E5C55",
                              }}
                            />
                          </div>

                          {/* MOBILE MENU */}

                          <div
                            className="sm:hidden relative flex-shrink-0"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setMobileActionId(menuOpen ? null : documentId)
                              }
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{
                                background: "rgba(255,255,255,0.05)",

                                border: "1px solid rgba(255,255,255,0.08)",

                                color: "#9A988E",
                              }}
                            >
                              <MoreVertical size={16} />
                            </button>

                            {menuOpen && (
                              <div
                                className="absolute right-0 top-9 z-40 w-32 rounded-xl p-1.5 shadow-2xl"
                                style={{
                                  background: "#15181E",

                                  border: "1px solid rgba(255,255,255,0.1)",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRenamingId(documentId);

                                    setRenameValue(document.fileName || "");

                                    setMobileActionId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left font-ui text-[12px]"
                                  style={{
                                    color: "#B3B1A8",
                                  }}
                                >
                                  <Pencil size={13} />
                                  Rename
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(documentId, document.fileName)
                                  }
                                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left font-ui text-[12px]"
                                  style={{
                                    color: "#F87171",
                                  }}
                                >
                                  <Trash2 size={13} />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="rounded-2xl py-12 px-5 text-center"
                  style={{
                    background: "rgba(255,255,255,0.03)",

                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Search
                    size={20}
                    className="mx-auto mb-3"
                    style={{
                      color: "#6E6C64",
                    }}
                  />

                  <p
                    className="font-ui text-[13.5px] font-medium"
                    style={{
                      color: "#F3F1EB",
                    }}
                  >
                    No documents found
                  </p>

                  <p
                    className="font-ui text-[12px] mt-1"
                    style={{
                      color: "#8E8C83",
                    }}
                  >
                    Try a different search term.
                  </p>
                </div>
              )
            ) : (
              <div
                className="rounded-2xl py-12 px-5 text-center"
                style={{
                  background: "rgba(255,255,255,0.03)",

                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <FileText
                  size={22}
                  className="mx-auto mb-3"
                  style={{
                    color: "#6E6C64",
                  }}
                />

                <p
                  className="font-ui text-[13.5px] font-medium"
                  style={{
                    color: "#F3F1EB",
                  }}
                >
                  No documents yet
                </p>

                <p
                  className="font-ui text-[12px] mt-1"
                  style={{
                    color: "#8E8C83",
                  }}
                >
                  Upload your first PDF above to get started.
                </p>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-ui text-[12px] font-semibold"
                  style={{
                    color: "#3B2205",
                    background:
                      "linear-gradient(150deg, #F4C77B 0%, #E8A33D 60%, #D9922B 100%)",
                  }}
                >
                  <Upload size={13} />
                  Upload PDF
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
