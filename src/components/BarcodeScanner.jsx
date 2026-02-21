import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Html5QrcodeScanner } from "html5-qrcode";

/**
 * BarcodeScanner Component
 *
 * Provides barcode scanning functionality using the device camera.
 * Uses html5-qrcode library for barcode detection.
 *
 * Note: Requires 'html5-qrcode' package to be installed:
 * npm install html5-qrcode
 */
function BarcodeScanner({ onScan, onClose }) {
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    let scanner = null;

    const initializeScanner = () => {
      try {
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
          supportedScanTypes: [0, 1, 2, 3, 4, 5, 6, 7, 8], // All barcode types
        };

        scanner = new Html5QrcodeScanner("barcode-reader", config, false);

        scanner.render(
          (decodedText) => {
            // Success callback
            console.log("Barcode scanned:", decodedText);
            if (onScan) {
              onScan(decodedText);
            }
            // Clear scanner after successful scan
            if (scanner) {
              scanner.clear().catch(console.error);
            }
          },
          () => {
            // Error callback (fires continuously while scanning)
            // We don't want to show these as they're just "no barcode found" messages
          },
        );

        scannerRef.current = scanner;
        setIsScanning(true);
      } catch (err) {
        console.error("Failed to initialize barcode scanner:", err);
        setError(
          err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
            ? "Camera permission denied. Please allow camera access in your browser settings."
            : err.name === "NotFoundError"
              ? "No camera found on this device."
              : "Failed to initialize camera. Please check your browser permissions and ensure you're using HTTPS.",
        );
      }
    };

    // Initialize scanner after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(initializeScanner, 100);

    return () => {
      clearTimeout(timeoutId);
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((err) => console.error("Error clearing scanner:", err));
      }
    };
  }, [onScan]);

  const handleManualInput = () => {
    const barcode = prompt("Enter barcode manually:");
    if (barcode && barcode.trim()) {
      onScan(barcode.trim());
    }
  };

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">
            <i className="bi bi-exclamation-triangle text-warning me-2"></i>
            Scanner Not Available
          </h5>
          <p className="text-muted mb-3">{error}</p>

          <div className="alert alert-info small mb-3">
            <strong>Quick Fixes:</strong>
            <ul className="mb-0 mt-2">
              <li>Check browser permissions (click 🔒 in address bar)</li>
              <li>Ensure you're on HTTPS (secure connection)</li>
              <li>Refresh the page after granting permissions</li>
              <li>Try a different browser if issues persist</li>
            </ul>
          </div>

          <div className="d-grid gap-2">
            <button className="btn btn-primary" onClick={handleManualInput}>
              <i className="bi bi-keyboard me-2"></i>
              Enter Barcode Manually
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">
            <i className="bi bi-camera me-2"></i>
            Scan Barcode
          </h5>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
            aria-label="Close scanner"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div id="barcode-reader" className="mb-3"></div>

        {isScanning && (
          <div className="d-grid gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={handleManualInput}
            >
              <i className="bi bi-keyboard me-2"></i>
              Enter Manually Instead
            </button>
          </div>
        )}

        <div className="alert alert-info mt-3 small">
          <i className="bi bi-info-circle me-2"></i>
          Position the barcode within the frame. The scanner will automatically
          detect it.
        </div>

        <div className="mt-3">
          <button
            className="btn btn-link btn-sm p-0 text-decoration-none"
            onClick={() => setShowHelp(!showHelp)}
          >
            <i
              className={`bi bi-${showHelp ? "chevron-up" : "chevron-down"} me-1`}
            ></i>
            {showHelp ? "Hide" : "Need help with camera permissions?"}
          </button>

          {showHelp && (
            <div className="alert alert-secondary mt-2 small">
              <strong>Camera Not Working?</strong>
              <hr className="my-2" />
              <p className="mb-2">
                <strong>On iPhone/iPad:</strong>
              </p>
              <ul className="mb-2">
                <li>Settings → Safari → Camera → Allow</li>
                <li>
                  Or tap "aA" in Safari address bar → Website Settings → Camera
                  → Allow
                </li>
              </ul>
              <p className="mb-2">
                <strong>On Android:</strong>
              </p>
              <ul className="mb-2">
                <li>Tap 🔒 next to URL → Permissions → Camera → Allow</li>
                <li>
                  Or Settings → Apps → Browser → Permissions → Camera → Allow
                </li>
              </ul>
              <p className="mb-2">
                <strong>On Desktop:</strong>
              </p>
              <ul className="mb-0">
                <li>Click 🔒 or camera icon in address bar</li>
                <li>Select "Allow" for camera access</li>
              </ul>
              <hr className="my-2" />
              <small className="text-muted">
                ⚠️ Camera requires HTTPS connection. Reload page after changing
                permissions.
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

BarcodeScanner.propTypes = {
  onScan: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BarcodeScanner;
