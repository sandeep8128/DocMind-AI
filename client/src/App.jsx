import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import DocumentDetails from "./pages/DocumentDetails";
import ChatAllDocuments from "./pages/ChatAllDocuments";
import Settings from "./pages/Settings";
import HelpSupport from "./pages/HelpSupport";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        {/* Document Chat */}
        <Route path="/chat/:documentId" element={<Chat />} />

        <Route path="/document/:documentId" element={<DocumentDetails />} />

        <Route path="/settings" element={<Settings />} />

        <Route path="/help" element={<HelpSupport />} />

        <Route path="/chat-all" element={<ChatAllDocuments />} />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
