import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  FileText,
} from "lucide-react";

import api from "../services/api";

const DOC_LINES = [
  { w: "88%" },
  { w: "95%" },
  { w: "70%" },
  { w: "82%" },
  { w: "65%" },
  { w: "90%" },
  { w: "75%" },
  { w: "60%" },
  { w: "85%" },
];

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError("");
    }
  };

  // =========================================================
  // REGISTER
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await api.post(
        "/auth/register",
        formData
      );

      navigate("/login");
    } catch (err) {
      console.error(
        "Registration Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Registration failed. Check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen
        w-full
        flex
        bg-[#FAF8F3]
        overflow-x-hidden
      "
    >
      {/* =====================================================
          PAGE STYLES
      ===================================================== */}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=Inter:wght@400;500;600;700&display=swap');

        .font-voice {
          font-family: 'Source Serif 4', Georgia, serif;
        }

        .font-ui {
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* -----------------------------------------------
           HIGHLIGHT ANIMATION
        ------------------------------------------------ */

        @keyframes sweep {
          0%, 100% {
            opacity: 0.15;
          }

          50% {
            opacity: 0.9;
          }
        }

        .highlight-line {
          animation:
            sweep 3.2s ease-in-out infinite;
        }

        /* -----------------------------------------------
           FORM FADE
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

        .register-fade {
          animation:
            fadeUp 0.55s ease-out both;
        }

        /* -----------------------------------------------
           DOCUMENT CARD
        ------------------------------------------------ */

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .register-doc-card {
          animation:
            cardIn 0.65s ease-out both;
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

        .register-shimmer::after {
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
           SMALL MOBILE
        ------------------------------------------------ */

        @media (max-width: 420px) {
          .register-container {
            padding-left: 18px !important;
            padding-right: 18px !important;
          }

          .register-title {
            font-size: 25px !important;
          }

          .register-subtitle {
            font-size: 13px !important;
          }

          .register-input {
            font-size: 14px !important;
          }

          .register-button {
            font-size: 14px !important;
          }
        }

        /* -----------------------------------------------
           REDUCED MOTION
        ------------------------------------------------ */

        @media (prefers-reduced-motion: reduce) {
          .highlight-line,
          .register-fade,
          .register-doc-card,
          .register-shimmer::after {
            animation: none !important;
          }
        }
      `}</style>

      {/* =====================================================
          LEFT BRAND PANEL
          DESKTOP ONLY
      ===================================================== */}

      <div
        className="
          hidden
          lg:flex
          lg:w-[46%]
          bg-[#12151C]
          relative
          flex-col
          justify-between
          px-10
          xl:px-14
          py-10
          xl:py-12
          overflow-hidden
          min-h-screen
        "
      >
        {/* BACKGROUND */}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(560px circle at 18% 8%, rgba(232,163,61,0.10), transparent 60%), radial-gradient(480px circle at 85% 90%, rgba(93,202,165,0.08), transparent 60%)",
          }}
        />

        {/* ===================================================
            LOGO
        =================================================== */}

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div
              className="
                w-8
                h-8
                rounded-md
                flex
                items-center
                justify-center
              "
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
              className="
                font-ui
                text-[15px]
                font-semibold
                tracking-tight
              "
              style={{
                color: "#F1EFE8",
              }}
            >
              DocMind AI
            </span>
          </div>
        </div>

        {/* ===================================================
            PRODUCT STORY
        =================================================== */}

        <div className="relative z-10 max-w-sm">
          <h1
            className="
              font-voice
              text-[31px]
              xl:text-[34px]
              leading-[1.2]
              mb-4
            "
            style={{
              color: "#F1EFE8",
            }}
          >
            Every file, one place
            to ask anything.
          </h1>

          <p
            className="
              font-ui
              text-[13.5px]
              xl:text-[14px]
              leading-relaxed
            "
            style={{
              color: "#B4B2A9",
            }}
          >
            Create an account and start uploading
            contracts, reports, and research —
            DocMind indexes them the moment they land.
          </p>
        </div>

        {/* ===================================================
            DOCUMENT PREVIEW
        =================================================== */}

        <div
          className="
            register-doc-card
            relative
            z-10
            bg-[#1C202A]
            border
            border-[#2C2F38]
            rounded-xl
            p-5
            xl:p-6
            max-w-sm
          "
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="
                w-1.5
                h-1.5
                rounded-full
                bg-[#5DCAA5]
                flex-shrink-0
              "
            />

            <span
              className="
                font-ui
                text-[10.5px]
                xl:text-[11px]
                tracking-wide
                truncate
              "
              style={{
                color: "#888780",
              }}
            >
              indexing onboarding_notes.pdf
            </span>
          </div>

          <div className="space-y-2.5">
            {DOC_LINES.map((line, i) => (
              <div
                key={i}
                className="
                  h-2
                  rounded-sm
                  bg-[#2C2F38]
                  relative
                  overflow-hidden
                "
                style={{
                  width: line.w,
                }}
              >
                <div
                  className="
                    highlight-line
                    absolute
                    inset-0
                    bg-[#E8A33D]/40
                    rounded-sm
                  "
                  style={{
                    animationDelay: `${
                      i * 0.28
                    }s`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ===================================================
            BOTTOM TEXT
        =================================================== */}

        <p
          className="
            relative
            z-10
            font-ui
            text-[11.5px]
            xl:text-[12px]
          "
          style={{
            color: "#696760",
          }}
        >
          Secure document intelligence for your
          everyday work.
        </p>
      </div>

      {/* =====================================================
          RIGHT FORM PANEL
      ===================================================== */}

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
            register-container
            w-full
            max-w-[380px]
            register-fade
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
              className="
                w-9
                h-9
                rounded-lg
                flex
                items-center
                justify-center
              "
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
              className="
                font-ui
                text-[16px]
                font-semibold
              "
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
              register-title
              font-voice
              text-[26px]
              sm:text-[28px]
              text-[#1A1D24]
              mb-1.5
            "
          >
            Create your account
          </h2>

          <p
            className="
              register-subtitle
              font-ui
              text-[13.5px]
              text-[#5F5E5A]
              mb-7
              sm:mb-8
            "
          >
            Start reading your documents differently.
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
                register-fade
              "
            >
              <p
                className="
                  font-ui
                  text-[13px]
                  leading-5
                  break-words
                "
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
            {/* NAME */}

            <div>
              <label
                htmlFor="name"
                className="
                  block
                  font-ui
                  text-[12.5px]
                  font-medium
                  text-[#444441]
                  mb-1.5
                "
              >
                Name
              </label>

              <div className="relative">
                <User
                  size={16}
                  className="
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-[#B4B2A9]
                    pointer-events-none
                  "
                />

                <input
                  id="name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="
                    register-input
                    w-full
                    font-ui
                    text-[14px]
                    pl-10
                    pr-3.5
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
                    left-3.5
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
                    register-input
                    w-full
                    font-ui
                    text-[14px]
                    pl-10
                    pr-3.5
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
              <label
                htmlFor="password"
                className="
                  block
                  font-ui
                  text-[12.5px]
                  font-medium
                  text-[#444441]
                  mb-1.5
                "
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={16}
                  className="
                    absolute
                    left-3.5
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
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="
                    register-input
                    w-full
                    font-ui
                    text-[14px]
                    pl-10
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
                    top-1/2
                    -translate-y-1/2
                    w-7
                    h-7
                    rounded-md
                    flex
                    items-center
                    justify-center
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

            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              disabled={loading}
              className={`
                register-button
                relative
                overflow-hidden
                w-full
                flex
                items-center
                justify-center
                gap-1.5
                font-ui
                text-[14px]
                font-medium
                bg-[#1A1D24]
                text-[#FAF8F3]
                py-3
                rounded-xl
                mt-2
                hover:bg-[#2C2F38]
                active:scale-[0.99]
                transition-all
                disabled:opacity-60
                disabled:cursor-not-allowed
                ${
                  loading
                    ? "register-shimmer"
                    : ""
                }
              `}
            >
              {loading
                ? "Creating account..."
                : "Create account"}

              {!loading && (
                <ArrowRight size={15} />
              )}
            </button>
          </form>

          {/* =================================================
              LOGIN LINK
          ================================================= */}

          <p
            className="
              font-ui
              text-[13px]
              sm:text-[13.5px]
              text-[#5F5E5A]
              text-center
              mt-6
              sm:mt-7
            "
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="
                text-[#993C1D]
                font-medium
                hover:underline
              "
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;