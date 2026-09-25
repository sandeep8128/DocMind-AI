import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  FileText,
  LogOut,
  Trash2,
  Save,
  Eye,
  EyeOff,
  ShieldCheck,
  Settings as SettingsIcon,
  Files,
  Layers,
  LifeBuoy,
  Menu,
  X,
} from "lucide-react";

import api from "../services/api";

function Settings() {
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  // ==========================================
  // FETCH PROFILE
  // ==========================================

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);

        const response = await api.get("/auth/profile");

        const user = response.data?.user;

        if (user) {
          setProfile({
            name: user.name || "",
            email: user.email || "",
          });
        }
      } catch (error) {
        console.error("Profile Error:", error);

        setProfileError(
          error.response?.data?.message ||
            "Failed to load profile"
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // ==========================================
  // CLOSE MOBILE MENU
  // ==========================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // ==========================================
  // NAVIGATION
  // ==========================================

  const goTo = (path) => {
    closeMobileMenu();
    navigate(path);
  };

  // ==========================================
  // PROFILE CHANGE
  // ==========================================

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    setProfileMessage("");
    setProfileError("");
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!profile.name.trim()) {
      setProfileError("Name is required");
      return;
    }

    try {
      setSavingProfile(true);
      setProfileMessage("");
      setProfileError("");

      await api.put("/auth/profile", {
        name: profile.name.trim(),
      });

      setProfileMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error("Update Profile Error:", error);

      setProfileError(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // ==========================================
  // PASSWORD CHANGE
  // ==========================================

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));

    setPasswordMessage("");
    setPasswordError("");
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handleChangePassword = async (event) => {
    event.preventDefault();

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwords;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "All password fields are required"
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must contain at least 6 characters"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match"
      );
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordMessage("");
      setPasswordError("");

      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordMessage(
        "Password changed successfully."
      );
    } catch (error) {
      console.error(
        "Change Password Error:",
        error
      );

      setPasswordError(
        error.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  // ==========================================
  // DELETE ACCOUNT
  // ==========================================

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account?\n\nThis action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete("/auth/account");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    } catch (error) {
      console.error(
        "Delete Account Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete account"
      );
    }
  };

  // ==========================================
  // SIDEBAR CONTENT
  // ==========================================

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
              onClick={closeMobileMenu}
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
                style={{ color: "#B3B1A8" }}
              />
            </button>
          )}
        </div>

        {/* DOCUMENTS BUTTON */}

        <button
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
          {/* DOCUMENTS */}

          <button
            onClick={() => goTo("/dashboard")}
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg font-ui text-[13px] text-left w-full transition-colors"
            style={{ color: "#8E8C83" }}
          >
            <Files size={15} />
            Documents
          </button>

          {/* CHAT ALL */}

          <button
            onClick={() => goTo("/chat-all")}
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg font-ui text-[13px] text-left w-full transition-colors"
            style={{ color: "#8E8C83" }}
          >
            <Layers size={15} />
            Chat all docs
          </button>

          {/* SETTINGS */}

          <button
            onClick={() => goTo("/settings")}
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg font-ui text-[13px] text-left w-full"
            style={{
              color: "#F3F1EB",
              background:
                "rgba(255,255,255,0.06)",
            }}
          >
            <SettingsIcon size={15} />
            Settings
          </button>

          {/* HELP */}

          <button
            onClick={() => goTo("/help")}
            className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg font-ui text-[13px] text-left w-full"
            style={{ color: "#8E8C83" }}
          >
            <LifeBuoy size={15} />
            Help & Support
          </button>
        </nav>

        <div className="flex-1" />

        {/* LOGOUT */}

        <button
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

  // ==========================================
  // PASSWORD INPUT
  // ==========================================

  const PasswordInput = ({
    name,
    value,
    onChange,
    placeholder,
    visible,
    setVisible,
  }) => {
    return (
      <div className="relative w-full">
        <Lock
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#6E6C64" }}
        />

        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full min-w-0 rounded-lg pl-10 pr-10 py-2.5 outline-none font-ui text-[13px]"
          style={{
            background:
              "rgba(255,255,255,0.035)",
            border:
              "1px solid rgba(255,255,255,0.09)",
            color: "#F3F1EB",
          }}
        />

        <button
          type="button"
          onClick={() =>
            setVisible((prev) => !prev)
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
        >
          {visible ? (
            <EyeOff
              size={15}
              style={{ color: "#6E6C64" }}
            />
          ) : (
            <Eye
              size={15}
              style={{ color: "#6E6C64" }}
            />
          )}
        </button>
      </div>
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loadingProfile) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-5"
        style={{ background: "#0A0C10" }}
      >
        <div className="text-center">
          <div
            className="w-9 h-9 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{
              borderColor: "#E8A33D",
              borderTopColor: "transparent",
            }}
          />

          <p
            className="font-ui text-[13px]"
            style={{ color: "#8E8C83" }}
          >
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        background: "#0A0C10",
        color: "#F3F1EB",
      }}
    >
      <div className="flex min-h-screen">
        {/* =====================================
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

        {/* =====================================
            MOBILE DRAWER
        ====================================== */}

        {mobileMenuOpen && (
          <>
            {/* OVERLAY */}

            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMobileMenu}
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

        {/* =====================================
            MAIN
        ====================================== */}

        <div className="flex-1 min-w-0">
          {/* =====================================
              HEADER
          ====================================== */}

          <header
            className="sticky top-0 z-30 px-4 sm:px-5 lg:px-8 py-3.5 flex items-center justify-between"
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
            <div className="flex items-center gap-2.5 min-w-0">
              {/* MOBILE MENU */}

              <button
                onClick={() =>
                  setMobileMenuOpen(true)
                }
                className="w-9 h-9 rounded-lg flex items-center justify-center lg:hidden flex-shrink-0"
                style={{
                  background:
                    "rgba(255,255,255,0.045)",
                  border:
                    "1px solid rgba(255,255,255,0.08)",
                }}
                aria-label="Open menu"
              >
                <Menu
                  size={18}
                  style={{ color: "#B3B1A8" }}
                />
              </button>

              {/* MOBILE BACK */}

              <button
                onClick={() => navigate("/dashboard")}
                className="w-9 h-9 rounded-lg flex items-center justify-center lg:hidden flex-shrink-0"
                style={{
                  background:
                    "rgba(255,255,255,0.035)",
                }}
                aria-label="Back to dashboard"
              >
                <ArrowLeft
                  size={17}
                  style={{ color: "#B3B1A8" }}
                />
              </button>

              {/* SETTINGS ICON */}

              <div
                className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(150deg, #F4C77B 0%, #E8A33D 55%, #C97F1F 100%)",
                }}
              >
                <SettingsIcon
                  size={17}
                  className="text-[#2A1704]"
                />
              </div>

              {/* TITLE */}

              <div className="min-w-0">
                <p
                  className="font-ui text-[14px] font-semibold truncate"
                  style={{ color: "#F3F1EB" }}
                >
                  Settings
                </p>

                <p
                  className="hidden sm:block font-ui text-[10.5px] truncate"
                  style={{ color: "#6E6C64" }}
                >
                  Manage your DocMind AI account
                </p>
              </div>
            </div>

            {/* LOGOUT */}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 font-ui text-[12.5px] flex-shrink-0"
              style={{ color: "#8E8C83" }}
            >
              <LogOut size={15} />

              <span className="hidden sm:inline">
                Log out
              </span>
            </button>
          </header>

          {/* =====================================
              CONTENT
          ====================================== */}

          <main className="w-full max-w-4xl mx-auto px-4 sm:px-5 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16">
            {/* PAGE TITLE */}

            <div className="mb-6 sm:mb-8">
              <p
                className="font-ui text-[10px] sm:text-[10.5px] font-semibold tracking-[0.16em] mb-2"
                style={{ color: "#8E8C83" }}
              >
                ACCOUNT SETTINGS
              </p>

              <h1
                className="font-voice text-[25px] sm:text-[28px] lg:text-[32px] leading-tight"
                style={{ color: "#F6F4ED" }}
              >
                Manage your account
              </h1>

              <p
                className="font-ui text-[12px] sm:text-[13px] mt-2 leading-relaxed max-w-2xl"
                style={{ color: "#8E8C83" }}
              >
                Update your profile, security and
                application preferences.
              </p>
            </div>

            {/* =====================================
                PROFILE
            ====================================== */}

            <section
              className="rounded-2xl p-4 sm:p-6 mb-4 sm:mb-5"
              style={{
                background:
                  "rgba(255,255,255,0.035)",
                border:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      "rgba(232,163,61,0.1)",
                    border:
                      "1px solid rgba(232,163,61,0.2)",
                  }}
                >
                  <User
                    size={18}
                    style={{ color: "#F4C77B" }}
                  />
                </div>

                <div className="min-w-0">
                  <h2
                    className="font-ui text-[15px] font-semibold"
                    style={{ color: "#F3F1EB" }}
                  >
                    Profile
                  </h2>

                  <p
                    className="font-ui text-[11px] sm:text-[11.5px]"
                    style={{ color: "#6E6C64" }}
                  >
                    Your personal account information
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* NAME */}

                  <div className="min-w-0">
                    <label
                      className="block font-ui text-[11.5px] mb-2"
                      style={{ color: "#8E8C83" }}
                    >
                      Full name
                    </label>

                    <div className="relative">
                      <User
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{
                          color: "#6E6C64",
                        }}
                      />

                      <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={
                          handleProfileChange
                        }
                        className="w-full min-w-0 rounded-lg pl-10 pr-3 py-2.5 outline-none font-ui text-[13px]"
                        style={{
                          background:
                            "rgba(255,255,255,0.035)",
                          border:
                            "1px solid rgba(255,255,255,0.09)",
                          color: "#F3F1EB",
                        }}
                      />
                    </div>
                  </div>

                  {/* EMAIL */}

                  <div className="min-w-0">
                    <label
                      className="block font-ui text-[11.5px] mb-2"
                      style={{ color: "#8E8C83" }}
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <Mail
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{
                          color: "#6E6C64",
                        }}
                      />

                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full min-w-0 rounded-lg pl-10 pr-3 py-2.5 outline-none font-ui text-[13px] opacity-60 cursor-not-allowed"
                        style={{
                          background:
                            "rgba(255,255,255,0.025)",
                          border:
                            "1px solid rgba(255,255,255,0.07)",
                          color: "#F3F1EB",
                        }}
                      />
                    </div>

                    <p
                      className="font-ui text-[10px] mt-1.5"
                      style={{
                        color: "#5E5C55",
                      }}
                    >
                      Email cannot be changed.
                    </p>
                  </div>
                </div>

                {profileError && (
                  <p
                    className="font-ui text-[12px] mt-4 leading-relaxed"
                    style={{ color: "#F87171" }}
                  >
                    {profileError}
                  </p>
                )}

                {profileMessage && (
                  <p
                    className="font-ui text-[12px] mt-4 leading-relaxed"
                    style={{ color: "#3DDC97" }}
                  >
                    {profileMessage}
                  </p>
                )}

                <div className="flex justify-stretch sm:justify-end mt-5">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-ui text-[12.5px] font-medium disabled:opacity-50 w-full sm:w-auto"
                    style={{
                      background:
                        "linear-gradient(150deg, #F4C77B 0%, #E8A33D 60%, #D9922B 100%)",
                      color: "#3B2205",
                    }}
                  >
                    <Save size={14} />

                    {savingProfile
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            </section>

            {/* =====================================
                SECURITY
            ====================================== */}

            <section
              className="rounded-2xl p-4 sm:p-6 mb-4 sm:mb-5"
              style={{
                background:
                  "rgba(255,255,255,0.035)",
                border:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      "rgba(61,220,151,0.08)",
                    border:
                      "1px solid rgba(61,220,151,0.18)",
                  }}
                >
                  <ShieldCheck
                    size={18}
                    style={{
                      color: "#3DDC97",
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <h2
                    className="font-ui text-[15px] font-semibold"
                    style={{ color: "#F3F1EB" }}
                  >
                    Security
                  </h2>

                  <p
                    className="font-ui text-[11px] sm:text-[11.5px]"
                    style={{ color: "#6E6C64" }}
                  >
                    Keep your account secure
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword}>
                <div className="space-y-4">
                  {/* CURRENT PASSWORD */}

                  <div>
                    <label
                      className="block font-ui text-[11.5px] mb-2"
                      style={{ color: "#8E8C83" }}
                    >
                      Current password
                    </label>

                    <PasswordInput
                      name="currentPassword"
                      value={
                        passwords.currentPassword
                      }
                      onChange={
                        handlePasswordChange
                      }
                      placeholder="Enter current password"
                      visible={
                        showCurrentPassword
                      }
                      setVisible={
                        setShowCurrentPassword
                      }
                    />
                  </div>

                  {/* NEW + CONFIRM */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block font-ui text-[11.5px] mb-2"
                        style={{
                          color: "#8E8C83",
                        }}
                      >
                        New password
                      </label>

                      <PasswordInput
                        name="newPassword"
                        value={
                          passwords.newPassword
                        }
                        onChange={
                          handlePasswordChange
                        }
                        placeholder="Enter new password"
                        visible={
                          showNewPassword
                        }
                        setVisible={
                          setShowNewPassword
                        }
                      />
                    </div>

                    <div>
                      <label
                        className="block font-ui text-[11.5px] mb-2"
                        style={{
                          color: "#8E8C83",
                        }}
                      >
                        Confirm password
                      </label>

                      <PasswordInput
                        name="confirmPassword"
                        value={
                          passwords.confirmPassword
                        }
                        onChange={
                          handlePasswordChange
                        }
                        placeholder="Confirm new password"
                        visible={
                          showConfirmPassword
                        }
                        setVisible={
                          setShowConfirmPassword
                        }
                      />
                    </div>
                  </div>
                </div>

                {passwordError && (
                  <p
                    className="font-ui text-[12px] mt-4 leading-relaxed"
                    style={{ color: "#F87171" }}
                  >
                    {passwordError}
                  </p>
                )}

                {passwordMessage && (
                  <p
                    className="font-ui text-[12px] mt-4 leading-relaxed"
                    style={{ color: "#3DDC97" }}
                  >
                    {passwordMessage}
                  </p>
                )}

                <div className="flex justify-stretch sm:justify-end mt-5">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-ui text-[12.5px] font-medium disabled:opacity-50 w-full sm:w-auto"
                    style={{
                      background:
                        "rgba(255,255,255,0.07)",
                      border:
                        "1px solid rgba(255,255,255,0.1)",
                      color: "#F3F1EB",
                    }}
                  >
                    <Lock size={14} />

                    {passwordLoading
                      ? "Updating..."
                      : "Change Password"}
                  </button>
                </div>
              </form>
            </section>

            {/* =====================================
                DOCUMENT PREFERENCES
            ====================================== */}

            <section
              className="rounded-2xl p-4 sm:p-6 mb-4 sm:mb-5"
              style={{
                background:
                  "rgba(255,255,255,0.035)",
                border:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      "rgba(255,138,91,0.08)",
                    border:
                      "1px solid rgba(255,138,91,0.18)",
                  }}
                >
                  <FileText
                    size={18}
                    style={{
                      color: "#FF8A5B",
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <h2
                    className="font-ui text-[15px] font-semibold"
                    style={{ color: "#F3F1EB" }}
                  >
                    Document Preferences
                  </h2>

                  <p
                    className="font-ui text-[11px] sm:text-[11.5px]"
                    style={{ color: "#6E6C64" }}
                  >
                    Manage document upload limits
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* MAX PDF SIZE */}

                <div
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl p-4"
                  style={{
                    background:
                      "rgba(255,255,255,0.025)",
                    border:
                      "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="min-w-0">
                    <p
                      className="font-ui text-[13px] font-medium"
                      style={{
                        color: "#F3F1EB",
                      }}
                    >
                      Maximum PDF size
                    </p>

                    <p
                      className="font-ui text-[11px] mt-1 leading-relaxed"
                      style={{
                        color: "#6E6C64",
                      }}
                    >
                      Maximum file size allowed
                      for upload
                    </p>
                  </div>

                  <span
                    className="font-ui text-[12px] font-medium px-3 py-1.5 rounded-lg self-start sm:self-auto flex-shrink-0"
                    style={{
                      color: "#F4C77B",
                      background:
                        "rgba(232,163,61,0.08)",
                      border:
                        "1px solid rgba(232,163,61,0.18)",
                    }}
                  >
                    20 MB
                  </span>
                </div>

                {/* SUPPORTED FORMAT */}

                <div
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl p-4"
                  style={{
                    background:
                      "rgba(255,255,255,0.025)",
                    border:
                      "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="min-w-0">
                    <p
                      className="font-ui text-[13px] font-medium"
                      style={{
                        color: "#F3F1EB",
                      }}
                    >
                      Supported format
                    </p>

                    <p
                      className="font-ui text-[11px] mt-1 leading-relaxed"
                      style={{
                        color: "#6E6C64",
                      }}
                    >
                      Documents supported by
                      DocMind AI
                    </p>
                  </div>

                  <span
                    className="font-ui text-[12px] font-medium px-3 py-1.5 rounded-lg self-start sm:self-auto flex-shrink-0"
                    style={{
                      color: "#3DDC97",
                      background:
                        "rgba(61,220,151,0.08)",
                      border:
                        "1px solid rgba(61,220,151,0.18)",
                    }}
                  >
                    PDF
                  </span>
                </div>
              </div>
            </section>

            {/* =====================================
                ACCOUNT ACTIONS
            ====================================== */}

            <section
              className="rounded-2xl p-4 sm:p-6"
              style={{
                background:
                  "rgba(248,113,113,0.035)",
                border:
                  "1px solid rgba(248,113,113,0.16)",
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      "rgba(248,113,113,0.08)",
                    border:
                      "1px solid rgba(248,113,113,0.16)",
                  }}
                >
                  <Trash2
                    size={18}
                    style={{
                      color: "#F87171",
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <h2
                    className="font-ui text-[15px] font-semibold"
                    style={{
                      color: "#F3F1EB",
                    }}
                  >
                    Account Actions
                  </h2>

                  <p
                    className="font-ui text-[11px] sm:text-[11.5px]"
                    style={{
                      color: "#6E6C64",
                    }}
                  >
                    Manage your account session
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* LOGOUT */}

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-ui text-[12.5px] font-medium w-full sm:w-auto"
                  style={{
                    background:
                      "rgba(255,255,255,0.05)",
                    border:
                      "1px solid rgba(255,255,255,0.09)",
                    color: "#F3F1EB",
                  }}
                >
                  <LogOut size={14} />
                  Log out
                </button>

                {/* DELETE */}

                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-ui text-[12.5px] font-medium w-full sm:w-auto"
                  style={{
                    background:
                      "rgba(248,113,113,0.08)",
                    border:
                      "1px solid rgba(248,113,113,0.2)",
                    color: "#F87171",
                  }}
                >
                  <Trash2 size={14} />
                  Delete Account
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Settings;