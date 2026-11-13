/**
 * ConfirmDialog Component
 * Reusable confirmation dialog for destructive actions
 */
/**
 * Confirmation modal dialog
 * More user-friendly than window.confirm()
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether dialog is visible
 * @param {Function} props.onConfirm - Called when user confirms
 * @param {Function} props.onCancel - Called when user cancels
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Dialog message/description
 * @param {string} props.confirmText - Confirm button text (default: "Confirm")
 * @param {string} props.cancelText - Cancel button text (default: "Cancel")
 * @param {string} props.variant - Button variant: "danger", "warning", "primary"
 */
export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onCancel}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show"
        style={{ display: "block", zIndex: 1050 }}
        tabIndex="-1"
        role="dialog"
        aria-labelledby="confirmDialogTitle"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="confirmDialogTitle">
                {title}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onCancel}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <p className="mb-0">{message}</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className={`btn btn-${variant}`}
                onClick={() => {
                  onConfirm();
                  onCancel();
                }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ConfirmDialog;
