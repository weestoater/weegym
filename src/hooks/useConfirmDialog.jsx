import { useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";

/**
 * useConfirmDialog Hook
 * Manages confirm dialog state
 *
 * Usage:
 * const { confirmDialog, showConfirm } = useConfirmDialog();
 *
 * showConfirm({
 *   title: "Delete Session?",
 *   message: "This action cannot be undone.",
 *   onConfirm: () => deleteSession(id)
 * });
 *
 * {confirmDialog}
 */
export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "danger",
  });

  const showConfirm = ({
    title = "Confirm Action",
    message = "Are you sure?",
    onConfirm = () => {},
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
  }) => {
    setDialogState({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      variant,
    });
  };

  const hideConfirm = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const confirmDialog = (
    <ConfirmDialog {...dialogState} onCancel={hideConfirm} />
  );

  return {
    confirmDialog,
    showConfirm,
    hideConfirm,
  };
}

/**
 * Quick delete confirmation
 * Pre-configured for delete actions
 */
export function useDeleteConfirm() {
  const { confirmDialog, showConfirm } = useConfirmDialog();

  const confirmDelete = (itemName, onConfirm) => {
    showConfirm({
      title: "Delete Confirmation",
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm,
    });
  };

  return {
    deleteDialog: confirmDialog,
    confirmDelete,
  };
}
