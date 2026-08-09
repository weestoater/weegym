/**
 * useSessionManager Hook
 * Manages CRUD operations, loading state, and toast notifications for session-based pages
 */
import { useState, useEffect } from "react";
import { formatErrorMessage } from "../utils/errorUtils";

/**
 * Generic session manager hook
 * Handles loading, saving, updating, deleting sessions with toast notifications
 *
 * @param {Object} config - Configuration object
 * @param {Function} config.loadFn - Function to load sessions (e.g., getCardioSessions)
 * @param {Function} config.saveFn - Function to save new session
 * @param {Function} config.updateFn - Function to update existing session
 * @param {Function} config.deleteFn - Function to delete session
 * @param {Object} config.messages - Custom toast messages
 * @returns {Object} Session management state and functions
 */
export function useSessionManager({
  loadFn,
  saveFn,
  updateFn,
  deleteFn,
  messages = {},
}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const defaultMessages = {
    loadError: "Failed to load sessions. Please try again.",
    saveSuccess: "Session logged successfully!",
    saveError: "Failed to save session. Please try again.",
    updateSuccess: "Session updated successfully!",
    updateError: "Failed to update session. Please try again.",
    deleteSuccess: "Session deleted successfully",
    deleteError: "Failed to delete session. Please try again.",
    deleteConfirm: "Are you sure you want to delete this session?",
  };

  const msg = { ...defaultMessages, ...messages };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await loadFn();
      setSessions(data || []);
    } catch (error) {
      console.error("Failed to load sessions:", error);
      const errorMessage = formatErrorMessage(error, msg.loadError);
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSession = async (
    sessionData,
    isUpdate = false,
    sessionId = null,
  ) => {
    try {
      console.log("🔄 Saving session:", { sessionData, isUpdate, sessionId });
      if (isUpdate && updateFn) {
        await updateFn(sessionId, sessionData);
        setToast({ message: msg.updateSuccess, type: "success" });
      } else {
        const result = await saveFn(sessionData);
        console.log("✅ Save result:", result);
        setToast({ message: msg.saveSuccess, type: "success" });
      }
      await loadSessions();
      return true;
    } catch (error) {
      console.error("❌ Failed to save session:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        status: error?.status,
      });
      const errorMessage = formatErrorMessage(
        error,
        isUpdate ? msg.updateError : msg.saveError,
      );
      setToast({
        message: errorMessage,
        type: "error",
      });
      return false;
    }
  };

  const deleteSession = async (id) => {
    if (!confirm(msg.deleteConfirm)) {
      return false;
    }

    try {
      await deleteFn(id);
      await loadSessions();
      setToast({ message: msg.deleteSuccess, type: "success" });
      return true;
    } catch (error) {
      console.error("Failed to delete session:", error);
      const errorMessage = formatErrorMessage(error, msg.deleteError);
      setToast({ message: errorMessage, type: "error" });
      return false;
    }
  };

  return {
    sessions,
    loading,
    toast,
    setToast,
    loadSessions,
    saveSession,
    deleteSession,
  };
}

/**
 * useEditableForm Hook
 * Manages edit state and form population for editable session forms
 *
 * @param {Function} resetFormFn - Function to reset form to initial state
 * @param {Function} setViewFn - Function to change view (e.g., setActiveView)
 * @returns {Object} Edit management state and functions
 */
export function useEditableForm(resetFormFn, setViewFn) {
  const [editingSession, setEditingSession] = useState(null);

  const startEdit = (session, populateFormFn) => {
    populateFormFn(session);
    setEditingSession(session);
    if (setViewFn) {
      setViewFn("log");
    }
  };

  const cancelEdit = () => {
    resetFormFn();
    setEditingSession(null);
  };

  const resetAfterSubmit = () => {
    resetFormFn();
    setEditingSession(null);
    if (setViewFn) {
      setViewFn("history");
    }
  };

  return {
    editingSession,
    isEditing: !!editingSession,
    startEdit,
    cancelEdit,
    resetAfterSubmit,
  };
}

/**
 * useViewToggle Hook
 * Manages view state for pages with multiple views (e.g., log vs history)
 *
 * @param {string} initialView - Initial view name (default: "log")
 * @returns {Object} View state and setter
 */
export function useViewToggle(initialView = "log") {
  const [activeView, setActiveView] = useState(initialView);

  return {
    activeView,
    setActiveView,
    isLogView: activeView === "log",
    isHistoryView: activeView === "history",
  };
}

/**
 * useFormFields Hook
 * Manages form field state with reset capability
 *
 * @param {Object} initialFields - Initial field values
 * @returns {Object} Field values, setters, and reset function
 */
export function useFormFields(initialFields) {
  const [fields, setFields] = useState(initialFields);

  const updateField = (fieldName, value) => {
    setFields((prev) => ({ ...prev, [fieldName]: value }));
  };

  const resetFields = () => {
    setFields(initialFields);
  };

  const setFieldsFromSession = (session, fieldMapping) => {
    const newFields = {};
    Object.keys(fieldMapping).forEach((formField) => {
      const sessionField = fieldMapping[formField];
      let value = session[sessionField];

      // Convert to string for form inputs, handle nulls
      if (value !== null && value !== undefined) {
        // Special handling for date fields - convert ISO timestamp to YYYY-MM-DD
        if (formField === "date" || formField.toLowerCase().includes("date")) {
          value = new Date(value).toISOString().split("T")[0];
        } else {
          value = value.toString();
        }
      } else {
        value = "";
      }

      newFields[formField] = value;
    });
    setFields({ ...initialFields, ...newFields });
  };

  return {
    fields,
    updateField,
    resetFields,
    setFieldsFromSession,
  };
}

export default useSessionManager;
