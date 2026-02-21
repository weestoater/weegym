import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";

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
  const [hasLibrary, setHasLibrary] = useState(false);
  const scannerRef = useRef(null);
  const readerRef = useRef(null);

  const initScanner = useCallback(
    (Html5QrcodeScanner) => {
      if (!scannerRef.current) return;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        supportedScanTypes: [0, 1, 2, 3, 4, 5, 6, 7, 8], // All barcode types
      };

      const scanner = new Html5QrcodeScanner("barcode-reader", config, false);

      scanner.render(
        (decodedText) => {
          // Success callback
          console.log("Barcode scanned:", decodedText);
          if (onScan) {
            onScan(decodedText);
          }
          // Clear scanner after successful scan
          scanner.clear().catch(console.error);
        },
        () => {
          // Error callback (fires continuously while scanning)
          // We don't want to show these as they're just "no barcode found" messages
        },
      );

      readerRef.current = scanner;
    },
    [onScan],
  );

  useEffect(() => {
    // Check if html5-qrcode library is available
    const checkLibrary = async () => {
      try {
        const { Html5QrcodeScanner } = await import("html5-qrcode");
        setHasLibrary(true);
        initScanner(Html5QrcodeScanner);
      } catch (err) {
        console.error("html5-qrcode library not found:", err);
        setError(
          "Barcode scanner library not installed. Please install html5-qrcode package.",
        );
        setHasLibrary(false);
      }
    };

    checkLibrary();

    return () => {
      // Cleanup scanner on unmount
      if (readerRef.current) {
        readerRef.current.clear().catch(console.error);
      }
    };
  }, [initScanner]);

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

        <div id="barcode-reader" ref={scannerRef} className="mb-3"></div>

        {hasLibrary && (
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
      </div>
    </div>
  );
}

BarcodeScanner.propTypes = {
  onScan: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BarcodeScanner;
