import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  FileText,
  Search,
  MessageCircle,
  Upload,
  Bot,
  ShieldCheck,
  Mail,
  LifeBuoy,
  Menu,
  X,
  Files,
  Layers,
  Settings,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

const HelpSupport = () => {
  const navigate = useNavigate();

  // ======================================
  // STATE
  // ======================================

  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const [showContactForm, setShowContactForm] =
    useState(false);

  const [supportForm, setSupportForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [sending, setSending] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  // ======================================
  // FAQ DATA
  // ======================================

  const faqs = [
    {
      category: "Documents",
      icon: FileText,
      question: "How do I upload a PDF?",
      answer:
        "Go to the Dashboard and click the New Upload button or use the Upload PDF section. Select a PDF file up to 20 MB. DocMind AI will process and index the document so you can ask questions about it.",
    },
    {
      category: "Documents",
      icon: Upload,
      question: "What type of files can I upload?",
      answer:
        "Currently, DocMind AI supports PDF documents. The maximum supported file size is 20 MB.",
    },
    {
      category: "AI Chat",
      icon: Bot,
      question: "How does document chat work?",
      answer:
        "DocMind AI processes your uploaded document, creates searchable document chunks, retrieves relevant information for your question, and then generates an answer using that retrieved context.",
    },
    {
      category: "AI Chat",
      icon: MessageCircle,
      question: "What if the AI cannot find my answer?",
      answer:
        "Make sure the information exists in the uploaded document. You can also try asking your question in a more specific way.",
    },
    {
      category: "Account",
      icon: ShieldCheck,
      question: "How can I change my password?",
      answer:
        "Open Settings from the sidebar, go to the Security section, enter your current password and your new password, then click Change Password.",
    },
    {
      category: "Account",
      icon: ShieldCheck,
      question: "How can I update my profile?",
      answer:
        "Open Settings, go to the Profile section, update your name, and click Save Changes.",
    },
    {
      category: "Chat",
      icon: MessageCircle,
      question: "Can I chat with all my documents?",
      answer:
        "The Chat All Documents feature is designed to let you ask questions across your document library. Availability can depend on your current plan.",
    },
    {
      category: "Account",
      icon: ShieldCheck,
      question: "Is my password stored securely?",
      answer:
        "Your password is stored as a bcrypt hash rather than plain text.",
    },
  ];

  // ======================================
  // FILTER FAQ
  // ======================================

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return faqs;
    }

    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query)
    );
  }, [search]);

  // ======================================
  // NAVIGATION
  // ======================================

  const goTo = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  // ======================================
  // SUPPORT SUBMIT
  // ======================================

  const handleSupportSubmit = async (e) => {
    e.preventDefault();

    if (sending) return;

    try {
      const name = supportForm.name.trim();
      const email = supportForm.email.trim();
      const message = supportForm.message.trim();

      if (!name || !email || !message) {
        alert("Please fill all fields.");
        return;
      }

      setSending(true);

      const response = await api.post("/support", {
        name,
        email,
        message,
      });

      if (response.data?.success) {
        alert("Support request sent successfully!");

        setSupportForm({
          name: "",
          email: "",
          message: "",
        });

        setShowContactForm(false);
      } else {
        alert(
          response.data?.message ||
            "Failed to submit support request."
        );
      }
    } catch (error) {
      console.error("❌ Support Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to send support request."
      );
    } finally {
      setSending(false);
    }
  };

  // ======================================
  // LOGOUT
  // ======================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  // ======================================
  // SIDEBAR
  // ======================================

  const SidebarContent = ({ mobile = false }) => {
    return (
      <div className="flex flex-col h-full">
        {/* LOGO */}

        <div className="flex items-center justify-between px-1 mb-6">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  "linear-gradient(150deg, #F4C77B 0%, #E8A33D 55%, #C97F1F 100%)",
              }}
            >
              <FileText
                size={14}
                className="text-[#2A1704]"
              />
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
              type="button"
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
              aria-label="Close menu"
            >
              <X
                size={17}
                style={{ color: "#B3B1A8" }}
              />
            </button>
          )}
        </div>

        {/* DOCUMENTS */}

        <button
          type="button"
          onClick={() => goTo("/dashboard")}
          className="flex items-center gap-2 font-ui text-[13px] font-medium px-3 py-2.5 rounded-lg mb-6 w-full text-left"
          style={{
            background:
              "linear-gradient(165deg, rgba(232,163,61,0.16), rgba(232,163,61,0.05))",
            border:
              "1px solid rgba(232,163,61,0.3)",
            color: "#F4C77B",
          }}
        >
          <Files size={15} />
          Documents
        </button>

        {/* FEATURES */}

        <p
          className="font-ui text-[10.5px] font-semibold tracking-wide mb-2 px-1"
          style={{ color: "#5E5C55" }}
        >
          Features
        </p>

        <nav className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => goTo("/dashboard")}
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg font-ui text-[13px] text-left w-full"
            style={{ color: "#8E8C83" }}
          >
            <Files size={15} />
            Documents
          </button>

          <button
            type="button"
            onClick={() => goTo("/chat-all")}
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg font-ui text-[13px] text-left w-full"
            style={{ color: "#8E8C83" }}
          >
            <Layers size={15} />
            Chat all docs
          </button>

          <button
            type="button"
            onClick={() => goTo("/settings")}
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg font-ui text-[13px] text-left w-full"
            style={{ color: "#8E8C83" }}
          >
            <Settings size={15} />
            Settings
          </button>

          <button
            type="button"
            onClick={() => goTo("/help")}
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg font-ui text-[13px] text-left w-full"
            style={{
              color: "#F3F1EB",
              background:
                "rgba(255,255,255,0.06)",
            }}
          >
            <LifeBuoy size={15} />
            Help & Support
          </button>
        </nav>

        <div className="flex-1" />

        {/* LOGOUT */}

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg font-ui text-[13px] text-left w-full"
          style={{ color: "#8E8C83" }}
        >
          <LogOut size={15} />
          Log out
        </button>
      </div>
    );
  };

  // ======================================
  // RENDER
  // ======================================

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: "#08090C",
        color: "#F3F1EB",
      }}
    >
      <div className="flex min-h-screen">
        {/* ======================================
            DESKTOP SIDEBAR
        ====================================== */}

        <aside
          className="hidden lg:flex flex-col w-[248px] flex-shrink-0 h-screen sticky top-0 px-4 py-5"
          style={{
            borderRight:
              "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <SidebarContent />
        </aside>

        {/* ======================================
            MOBILE DRAWER
        ====================================== */}

        {mobileMenuOpen && (
          <>
            {/* OVERLAY */}

            <button
              type="button"
              aria-label="Close navigation"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            />

            {/* DRAWER */}

            <aside
              className="fixed left-0 top-0 bottom-0 z-50 w-[280px] max-w-[85vw] px-4 py-5 lg:hidden shadow-2xl"
              style={{
                background: "#0D1015",
                borderRight:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <SidebarContent mobile />
            </aside>
          </>
        )}

        {/* ======================================
            MAIN
        ====================================== */}

        <div className="flex-1 min-w-0">
          {/* ======================================
              HEADER
          ====================================== */}

          <header
            className="h-[64px] flex items-center justify-between px-4 sm:px-5 lg:px-8 sticky top-0 z-30"
            style={{
              background:
                "rgba(8,9,12,0.94)",
              borderBottom:
                "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter:
                "blur(12px)",
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* MOBILE MENU */}

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                className="w-9 h-9 rounded-lg flex items-center justify-center lg:hidden flex-shrink-0"
                style={{
                  background:
                    "rgba(255,255,255,0.05)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  color: "#A8A69D",
                }}
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>

              {/* BACK BUTTON */}

              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard")
                }
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                style={{
                  background:
                    "rgba(255,255,255,0.05)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                  color: "#A8A69D",
                }}
              >
                <ArrowLeft size={16} />
              </button>

              <div className="min-w-0">
                <h1
                  className="font-ui text-[14px] sm:text-[15px] font-semibold truncate"
                  style={{ color: "#F3F1EB" }}
                >
                  Help & Support
                </h1>

                <p
                  className="hidden sm:block font-ui text-[11px] truncate"
                  style={{ color: "#6E6C64" }}
                >
                  Get help with DocMind AI
                </p>
              </div>
            </div>

            {/* DASHBOARD */}

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
              className="font-ui text-[12px] px-3 py-1.5 rounded-lg flex-shrink-0"
              style={{
                color: "#C8C5BC",
                background:
                  "rgba(255,255,255,0.05)",
                border:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span className="hidden sm:inline">
                Dashboard
              </span>

              <span className="sm:hidden">
                Home
              </span>
            </button>
          </header>

          {/* ======================================
              MAIN CONTENT
          ====================================== */}

          <main className="w-full max-w-5xl mx-auto px-4 sm:px-5 lg:px-8 py-7 sm:py-10">
            {/* ======================================
                HERO
            ====================================== */}

            <section className="text-center mb-8 sm:mb-10">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background:
                    "linear-gradient(150deg, #F4C77B 0%, #E8A33D 55%, #C97F1F 100%)",
                  boxShadow:
                    "0 10px 35px rgba(232,163,61,0.18)",
                }}
              >
                <LifeBuoy
                  size={23}
                  className="sm:hidden"
                  style={{ color: "#2A1704" }}
                />

                <LifeBuoy
                  size={25}
                  className="hidden sm:block"
                  style={{ color: "#2A1704" }}
                />
              </div>

              <p
                className="font-ui text-[9.5px] sm:text-[10px] font-semibold tracking-[0.18em] mb-2"
                style={{ color: "#B58A48" }}
              >
                SUPPORT CENTER
              </p>

              <h2
                className="font-ui text-2xl sm:text-3xl lg:text-4xl font-semibold"
                style={{ color: "#F3F1EB" }}
              >
                How can we help?
              </h2>

              <p
                className="font-ui text-[12px] sm:text-sm mt-3 px-3 leading-relaxed"
                style={{ color: "#8E8C83" }}
              >
                Find answers to common questions about
                DocMind AI.
              </p>
            </section>

            {/* ======================================
                SEARCH
            ====================================== */}

            <div className="w-full max-w-2xl mx-auto mb-8 sm:mb-12">
              <div
                className="flex items-center gap-3 px-3.5 sm:px-4 py-3 rounded-xl"
                style={{
                  background:
                    "rgba(255,255,255,0.035)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Search
                  size={17}
                  className="flex-shrink-0"
                  style={{ color: "#6E6C64" }}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search for help..."
                  className="flex-1 min-w-0 bg-transparent outline-none font-ui text-[13px] sm:text-sm"
                  style={{
                    color: "#F3F1EB",
                  }}
                />
              </div>
            </div>

            {/* ======================================
                FAQ
            ====================================== */}

            <section>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div>
                  <h3
                    className="font-ui text-base sm:text-lg font-semibold"
                    style={{ color: "#F3F1EB" }}
                  >
                    Frequently Asked Questions
                  </h3>

                  <p
                    className="font-ui text-[11px] sm:text-[12px] mt-1"
                    style={{ color: "#6E6C64" }}
                  >
                    Quick answers to common questions.
                  </p>
                </div>

                <span
                  className="font-ui text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full self-start sm:self-auto"
                  style={{
                    color: "#A8A69D",
                    background:
                      "rgba(255,255,255,0.05)",
                  }}
                >
                  {filteredFaqs.length} questions
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {filteredFaqs.length === 0 ? (
                  <div
                    className="rounded-xl p-7 sm:p-8 text-center"
                    style={{
                      background:
                        "rgba(255,255,255,0.025)",
                      border:
                        "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <Search
                      size={22}
                      className="mx-auto mb-3"
                      style={{
                        color: "#5E5C55",
                      }}
                    />

                    <p
                      className="font-ui text-sm"
                      style={{
                        color: "#A8A69D",
                      }}
                    >
                      No matching questions found.
                    </p>
                  </div>
                ) : (
                  filteredFaqs.map((faq, index) => {
                    const Icon = faq.icon;
                    const isOpen =
                      openIndex === index;

                    return (
                      <div
                        key={faq.question}
                        className="rounded-xl overflow-hidden transition-all"
                        style={{
                          background: isOpen
                            ? "rgba(255,255,255,0.045)"
                            : "rgba(255,255,255,0.025)",
                          border:
                            "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenIndex(
                              isOpen ? null : index
                            )
                          }
                          className="w-full flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-3.5 sm:py-4 text-left"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background:
                                "rgba(232,163,61,0.08)",
                              border:
                                "1px solid rgba(232,163,61,0.16)",
                            }}
                          >
                            <Icon
                              size={15}
                              style={{
                                color: "#D9A653",
                              }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className="font-ui text-[12.5px] sm:text-[13px] font-medium leading-5"
                              style={{
                                color: "#E9E6DE",
                              }}
                            >
                              {faq.question}
                            </p>

                            <p
                              className="font-ui text-[9.5px] sm:text-[10px] mt-0.5"
                              style={{
                                color: "#69675F",
                              }}
                            >
                              {faq.category}
                            </p>
                          </div>

                          <ChevronDown
                            size={16}
                            className="transition-transform flex-shrink-0"
                            style={{
                              color: "#77746B",
                              transform: isOpen
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            }}
                          />
                        </button>

                        {isOpen && (
                          <div
                            className="px-3.5 sm:px-4 pb-4 pl-[54px] sm:pl-[60px] pr-4"
                            style={{
                              color: "#9A988E",
                            }}
                          >
                            <p className="font-ui text-[11.5px] sm:text-[12px] leading-5">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* ======================================
                CONTACT SUPPORT
            ====================================== */}

            <section
              className="mt-8 sm:mt-10 rounded-2xl p-4 sm:p-6 lg:p-7"
              style={{
                background:
                  "linear-gradient(145deg, rgba(232,163,61,0.10), rgba(255,255,255,0.025))",
                border:
                  "1px solid rgba(232,163,61,0.20)",
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "rgba(232,163,61,0.10)",
                      border:
                        "1px solid rgba(232,163,61,0.20)",
                    }}
                  >
                    <Mail
                      size={18}
                      style={{
                        color: "#F4C77B",
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <h3
                      className="font-ui text-[15px] font-semibold"
                      style={{ color: "#F3F1EB" }}
                    >
                      Still need help?
                    </h3>

                    <p
                      className="font-ui text-[11px] sm:text-[12px] mt-1 leading-5"
                      style={{ color: "#8E8C83" }}
                    >
                      If you couldn't find an answer,
                      contact our support team.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowContactForm(true)
                  }
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-ui text-[12px] font-semibold w-full lg:w-auto flex-shrink-0"
                  style={{
                    color: "#3B2205",
                    background:
                      "linear-gradient(150deg, #F4C77B 0%, #E8A33D 60%, #D9922B 100%)",
                  }}
                >
                  <Mail size={14} />
                  Contact Support
                </button>
              </div>
            </section>

            {/* ======================================
                CONTACT FORM
            ====================================== */}

            {showContactForm && (
              <section
                className="mt-4 rounded-2xl p-4 sm:p-6 lg:p-7"
                style={{
                  background:
                    "rgba(255,255,255,0.025)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="min-w-0">
                    <h3
                      className="font-ui text-[15px] font-semibold"
                      style={{ color: "#F3F1EB" }}
                    >
                      Contact Support
                    </h3>

                    <p
                      className="font-ui text-[11px] sm:text-[12px] mt-1 leading-5"
                      style={{ color: "#77746B" }}
                    >
                      Tell us about your issue and
                      we'll get back to you.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowContactForm(false)
                    }
                    className="font-ui text-[12px] flex-shrink-0"
                    style={{ color: "#77746B" }}
                  >
                    Cancel
                  </button>
                </div>

                <form
                  onSubmit={handleSupportSubmit}
                  className="flex flex-col gap-4"
                >
                  {/* NAME */}

                  <div>
                    <label
                      className="block font-ui text-[11px] mb-1.5"
                      style={{ color: "#9A988E" }}
                    >
                      Name
                    </label>

                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={supportForm.name}
                      onChange={(e) =>
                        setSupportForm({
                          ...supportForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 rounded-lg outline-none font-ui text-[12px]"
                      style={{
                        background:
                          "rgba(255,255,255,0.04)",
                        border:
                          "1px solid rgba(255,255,255,0.08)",
                        color: "#F3F1EB",
                      }}
                    />
                  </div>

                  {/* EMAIL */}

                  <div>
                    <label
                      className="block font-ui text-[11px] mb-1.5"
                      style={{ color: "#9A988E" }}
                    >
                      Email
                    </label>

                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={supportForm.email}
                      onChange={(e) =>
                        setSupportForm({
                          ...supportForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 rounded-lg outline-none font-ui text-[12px]"
                      style={{
                        background:
                          "rgba(255,255,255,0.04)",
                        border:
                          "1px solid rgba(255,255,255,0.08)",
                        color: "#F3F1EB",
                      }}
                    />
                  </div>

                  {/* MESSAGE */}

                  <div>
                    <label
                      className="block font-ui text-[11px] mb-1.5"
                      style={{ color: "#9A988E" }}
                    >
                      Message
                    </label>

                    <textarea
                      rows={5}
                      placeholder="Describe your issue..."
                      value={supportForm.message}
                      onChange={(e) =>
                        setSupportForm({
                          ...supportForm,
                          message: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 rounded-lg outline-none resize-none font-ui text-[12px]"
                      style={{
                        background:
                          "rgba(255,255,255,0.04)",
                        border:
                          "1px solid rgba(255,255,255,0.08)",
                        color: "#F3F1EB",
                      }}
                    />
                  </div>

                  {/* BUTTONS */}

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setShowContactForm(false)
                      }
                      disabled={sending}
                      className="px-5 py-2.5 rounded-lg font-ui text-[12px] disabled:opacity-50 w-full sm:w-auto"
                      style={{
                        color: "#A8A69D",
                        background:
                          "rgba(255,255,255,0.05)",
                        border:
                          "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={sending}
                      className="px-5 py-2.5 rounded-lg font-ui text-[12px] font-semibold disabled:opacity-50 w-full sm:w-auto"
                      style={{
                        color: "#3B2205",
                        background:
                          "linear-gradient(150deg, #F4C77B 0%, #E8A33D 60%, #D9922B 100%)",
                      }}
                    >
                      {sending
                        ? "Sending..."
                        : "Send Message"}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* ======================================
                FOOTER
            ====================================== */}

            <p
              className="font-ui text-[10px] text-center mt-8 pb-2"
              style={{ color: "#4F4D47" }}
            >
              DocMind AI • Help & Support
            </p>
          </main>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;