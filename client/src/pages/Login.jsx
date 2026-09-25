import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  FileText,
  ShieldCheck,
} from "lucide-react";

import api from "../services/api";
import "../App.css";

// =========================================================
// DOCUMENT PREVIEW DATA
// =========================================================

const DOC_LINES = [
  { w: "88%" },
  { w: "72%" },
  { w: "94%" },
  { w: "64%", highlight: true },
  { w: "80%" },
  { w: "58%" },
];

// =========================================================
// LOGIN
// =========================================================

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =======================================================
  // INPUT CHANGE
  // =======================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Remove previous error when user starts typing again
    if (error) {
      setError("");
    }
  };

  // =======================================================
  // LOGIN
  // =======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        "/auth/login",
        formData
      );

      const token = response.data.token;

      localStorage.setItem("token", token);

      // Store user if backend sends it
      if (response.data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Login Error:", err);

      setError(
        err.response?.data?.message ||
          "Login failed. Check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex bg-[#FAF8F3] overflow-x-hidden"
    >
      {/* ===================================================
          PAGE STYLES
      =================================================== */}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=Inter:wght@400;500;600;700&display=swap');

        .font-voice {
          font-family: 'Source Serif 4', Georgia, serif;
        }

        .font-ui {
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* -----------------------------------------------
           DOCUMENT CARD
        ------------------------------------------------ */

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(14px) rotate(-2.2deg);
          }

          to {
            opacity: 1;
            transform: translateY(0) rotate(-2.2deg);
          }
        }

        .doc-card {
          animation:
            cardIn 0.8s cubic-bezier(.2,.7,.3,1)
            0.15s both;
        }

        /* -----------------------------------------------
           HIGHLIGHT
        ------------------------------------------------ */

        @keyframes highlightSweep {
          0%, 8% {
            background-size: 0% 100%;
          }

          22%, 78% {
            background-size: 100% 100%;
          }

          92%, 100% {
            background-size: 0% 100%;
          }
        }

        .doc-highlight {
          background-image:
            linear-gradient(
              #E8A33D66,
              #E8A33D66
            );

          background-repeat: no-repeat;
          background-position: left center;

          animation:
            highlightSweep 9s ease-in-out infinite;

          animation-delay: 1.1s;
        }

        /* -----------------------------------------------
           ANSWER
        ------------------------------------------------ */

        @keyframes answerIn {
          0%, 24% {
            opacity: 0;
            transform: translateY(4px);
          }

          32%, 80% {
            opacity: 1;
            transform: translateY(0);
          }

          92%, 100% {
            opacity: 0;
            transform: translateY(4px);
          }
        }

        .doc-answer {
          animation:
            answerIn 9s ease-in-out infinite;

          animation-delay: 1.1s;
        }

        /* -----------------------------------------------
           FORM ANIMATION
        ------------------------------------------------ */

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-up {
          animation:
            fadeUp 0.55s ease-out both;
        }

        /* -----------------------------------------------
           BUTTON SHIMMER
        ------------------------------------------------ */

        @keyframes shimmer {
          0% {
            transform: translateX(-120%);
          }

          100% {
            transform: translateX(120%);
          }
        }

        .btn-shimmer::after {
          content: "";
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              115deg,
              transparent,
              rgba(255,255,255,0.16),
              transparent
            );

          animation:
            shimmer 1.3s ease-in-out infinite;
        }

        /* -----------------------------------------------
           MOBILE DOCUMENT CARD
        ------------------------------------------------ */

        @media (max-width: 1023px) {
          .mobile-login-card {
            display: block;
          }
        }

        /* -----------------------------------------------
           SMALL MOBILE
        ------------------------------------------------ */

        @media (max-width: 420px) {
          .login-container {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }

          .login-title {
            font-size: 25px !important;
          }

          .login-subtitle {
            font-size: 13px !important;
          }

          .login-input {
            font-size: 14px !important;
          }

          .login-button {
            font-size: 14px !important;
          }
        }

        /* -----------------------------------------------
           REDUCED MOTION
        ------------------------------------------------ */

        @media (prefers-reduced-motion: reduce) {
          .doc-card,
          .doc-highlight,
          .doc-answer,
          .fade-up,
          .btn-shimmer::after {
            animation: none !important;
          }
        }
      `}</style>

      {/* ===================================================
          LEFT BRAND PANEL
          DESKTOP ONLY
      =================================================== */}

      <div
        className="
          hidden
          lg:flex
          lg:w-[45%]
          bg-[#12151C]
          relative
          flex-col
          justify-between
          px-10
          xl:px-16
          py-10
          xl:py-14
          min-h-screen
        "
      >
        {/* BACKGROUND GLOW */}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(560px circle at 18% 8%, rgba(232,163,61,0.10), transparent 60%), radial-gradient(480px circle at 85% 90%, rgba(93,202,165,0.08), transparent 60%)",
          }}
        />

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="relative flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{
              background: "#E8A33D",
            }}
          >
            <FileText
              size={17}
              className="text-[#412402]"
              strokeWidth={2.25}
            />
          </div>

          <span
            className="font-ui text-[15px] font-semibold tracking-tight"
            style={{
              color: "#F1EFE8",
            }}
          >
            DocMind AI
          </span>
        </div>

        {/* =================================================
            PRODUCT STORY
        ================================================= */}

        <div className="relative max-w-[380px]">
          <h1
            className="font-voice text-[32px] xl:text-[36px] leading-[1.18] mb-4"
            style={{
              color: "#F1EFE8",
            }}
          >
            Your documents,
            <br />
            finally understood.
          </h1>

          <p
            className="font-ui text-[14px] xl:text-[14.5px] leading-relaxed mb-8 xl:mb-10"
            style={{
              color: "#ADAB9F",
            }}
          >
            DocMind reads, indexes, and answers
            questions across every file you give it —
            contracts, reports, research, all searchable
            in seconds.
          </p>

          {/* =================================================
              DOCUMENT PREVIEW
          ================================================= */}

          <div
            className="
              doc-card
              bg-[#F7F3EA]
              rounded-lg
              shadow-[0_24px_60px_-12px_rgba(0,0,0,0.55)]
              p-5
              w-[300px]
              max-w-full
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                mb-4
                pb-3
                border-b
                border-[#E3DDCC]
              "
            >
              <span
                className="font-ui text-[11.5px] font-medium"
                style={{
                  color: "#4A4740",
                }}
              >
                Q3_report.pdf
              </span>

              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4C9C7C]" />

                <span
                  className="font-ui text-[10.5px]"
                  style={{
                    color: "#8A8779",
                  }}
                >
                  reading
                </span>
              </span>
            </div>

            <div className="space-y-2">
              {DOC_LINES.map((line, i) => (
                <div
                  key={i}
                  className={`
                    h-[7px]
                    rounded-sm
                    bg-[#2A281F]/12
                    ${
                      line.highlight
                        ? "doc-highlight"
                        : ""
                    }
                  `}
                  style={{
                    width: line.w,
                  }}
                />
              ))}
            </div>

            <div
              className="
                doc-answer
                mt-4
                pt-3.5
                border-t
                border-[#E3DDCC]
                flex
                gap-2.5
              "
            >
              <div
                className="
                  w-5
                  h-5
                  rounded-full
                  bg-[#E8A33D]
                  flex-shrink-0
                  flex
                  items-center
                  justify-center
                  mt-0.5
                "
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#412402]" />
              </div>

              <p
                className="font-voice text-[12.5px] leading-snug italic"
                style={{
                  color: "#3A3830",
                }}
              >
                Revenue grew 18% year over year,
                led by enterprise renewals.
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <p
          className="relative font-ui text-[12.5px]"
          style={{
            color: "#7C7A70",
          }}
        >
          Used daily by legal, finance and research
          teams to move through paperwork faster.
        </p>
      </div>

      {/* ===================================================
          RIGHT / FORM PANEL
      =================================================== */}

      <div
        className="
          flex-1
          flex
          items-center
          justify-center
          px-4
          sm:px-6
          py-8
          sm:py-12
          min-h-screen
        "
      >
        <div
          className="
            login-container
            w-full
            max-w-[380px]
            fade-up
          "
        >
          {/* =================================================
              MOBILE LOGO
          ================================================= */}

          <div
            className="
              lg:hidden
              flex
              items-center
              justify-center
              gap-2.5
              mb-8
              sm:mb-10
            "
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(145deg, #F4C77B, #E8A33D)",
              }}
            >
              <FileText
                size={18}
                className="text-[#412402]"
                strokeWidth={2.25}
              />
            </div>

            <span
              className="font-ui text-[16px] font-semibold"
              style={{
                color: "#1A1D24",
              }}
            >
              DocMind AI
            </span>
          </div>

          {/* =================================================
              TITLE
          ================================================= */}

          <h2
            className="
              login-title
              font-voice
              text-[27px]
              sm:text-[29px]
              text-[#1A1D24]
              mb-1.5
            "
          >
            Welcome back
          </h2>

          <p
            className="
              login-subtitle
              font-ui
              text-[13.5px]
              text-[#5F5E5A]
              mb-7
              sm:mb-8
            "
          >
            Sign in to keep working with your
            documents.
          </p>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="
                mb-5
                px-3.5
                py-3
                rounded-xl
                bg-[#FAECE7]
                border
                border-[#F0997B]
                fade-up
              "
            >
              <p
                className="font-ui text-[13px] leading-5 break-words"
                style={{
                  color: "#712B13",
                }}
              >
                {error}
              </p>
            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* EMAIL */}

            <div>
              <label
                htmlFor="email"
                className="
                  block
                  font-ui
                  text-[12.5px]
                  font-medium
                  text-[#444441]
                  mb-1.5
                "
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  size={16}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-[#B4B2A9]
                    pointer-events-none
                  "
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="
                    login-input
                    w-full
                    font-ui
                    text-[14.5px]
                    pl-11
                    pr-4
                    py-3
                    rounded-xl
                    border
                    border-[#D3D1C7]
                    bg-white
                    text-[#1A1D24]
                    placeholder:text-[#B4B2A9]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#E8A33D]/40
                    focus:border-[#E8A33D]
                    transition-colors
                  "
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div>
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <label
                  htmlFor="password"
                  className="
                    block
                    font-ui
                    text-[12.5px]
                    font-medium
                    text-[#444441]
                  "
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="
                    font-ui
                    text-[12.5px]
                    text-[#993C1D]
                    hover:underline
                    whitespace-nowrap
                  "
                >
                  Forgot?
                </Link>
              </div>

              <div className="relative">
                <Lock
                  size={16}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-[#B4B2A9]
                    pointer-events-none
                  "
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="
                    login-input
                    w-full
                    font-ui
                    text-[14.5px]
                    pl-11
                    pr-11
                    py-3
                    rounded-xl
                    border
                    border-[#D3D1C7]
                    bg-white
                    text-[#1A1D24]
                    placeholder:text-[#B4B2A9]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#E8A33D]/40
                    focus:border-[#E8A33D]
                    transition-colors
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="
                    absolute
                    right-3.5
                    sm:right-4
                    top-1/2
                    -translate-y-1/2
                    w-7
                    h-7
                    flex
                    items-center
                    justify-center
                    rounded-md
                    text-[#888780]
                    hover:text-[#444441]
                    hover:bg-[#F3F1EB]
                    transition-colors
                  "
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className={`
                login-button
                relative
                overflow-hidden
                w-full
                flex
                items-center
                justify-center
                gap-1.5
                font-ui
                text-[14.5px]
                font-medium
                bg-[#1A1D24]
                text-[#FAF8F3]
                py-3
                rounded-xl
                mt-2
                hover:bg-[#2C2F38]
                active:scale-[0.99]
                transition-all
                disabled:opacity-90
                disabled:cursor-not-allowed
                ${
                  loading
                    ? "btn-shimmer"
                    : ""
                }
              `}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}

              {!loading && (
                <ArrowRight size={15} />
              )}
            </button>
          </form>

          {/* =================================================
              SECURITY NOTE
          ================================================= */}

          <p
            className="
              font-ui
              text-[11.5px]
              sm:text-[12px]
              text-[#8A8880]
              text-center
              mt-5
              flex
              items-center
              justify-center
              gap-1.5
            "
          >
            <ShieldCheck
              size={13}
              className="text-[#8A8880] flex-shrink-0"
            />

            <span>
              Your data stays encrypted, always.
            </span>
          </p>

          {/* =================================================
              REGISTER
          ================================================= */}

          <p
            className="
              font-ui
              text-[13px]
              sm:text-[13.5px]
              text-[#5F5E5A]
              text-center
              mt-6
            "
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              className="
                text-[#993C1D]
                font-medium
                hover:underline
              "
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;