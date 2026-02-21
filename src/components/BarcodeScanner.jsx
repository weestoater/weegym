import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

/**
 * BarcodeScanner Component
 *
 * Provides barcode scanning functionality using the device camera.
 * Uses html5-qrcode library for barcode detection.
 * Optimized for iOS Safari compatibility.
 *
 * Note: Requires 'html5-qrcode' package to be installed:
 * npm install html5-qrcode
 */
function BarcodeScanner({ onScan, onClose }) {
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const scannerRef = useRef(null);
  const mountedRef = useRef(true);

  // Detect if running on iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  useEffect(() => {
    mountedRef.current = true;
    let html5QrCode = null;

    const getCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!mountedRef.current) return;

        setCameras(devices);

        // On iOS, prefer back camera (environment facing)
        const backCamera = devices.find(
          (device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("environment"),
        );

        setSelectedCamera(backCamera?.id || devices[0]?.id);
      } catch (err) {
        console.error("Error getting cameras:", err);
        if (mountedRef.current) {
          setError("Unable to access camera. Please check permissions.");
        }
      }
    };

    const initializeScanner = async () => {
      if (!selectedCamera) {
        await getCameras();
        return;
      }

      try {
        html5QrCode = new Html5Qrcode("barcode-reader", {
          formatsToSupport: [0, 1, 2, 3, 4, 5, 6, 7, 8], // All barcode types
          verbose: false,
        });

        scannerRef.current = html5QrCode;

        const config = {
          fps: 10, // Same FPS for all devices
          qrbox: 250, // Standard scan box size
          aspectRatio: 1.0,
          disableFlip: false,
        };

        await html5QrCode.start(
          selectedCamera,
          config,
          (decodedText) => {
            // Success callback
            console.log("Barcode scanned:", decodedText);
            if (onScan && mountedRef.current) {
              onScan(decodedText);
            }
            // Stop scanner after successful scan
            if (
              html5QrCode &&
              html5QrCode.getState() === Html5QrcodeScannerState.SCANNING
            ) {
              html5QrCode.stop().catch(console.error);
            }
          },
          () => {
            // Error callback (fires continuously while scanning)
            // We don't want to show these as they're just "no barcode found" messages
          },
        );

        if (mountedRef.current) {
          setIsScanning(true);
        }
      } catch (err) {
        console.error("Failed to initialize barcode scanner:", err);
        if (mountedRef.current) {
          let errorMessage = "Failed to initialize camera.";

          if (
            err.name === "NotAllowedError" ||
            err.name === "PermissionDeniedError"
          ) {
            errorMessage = isIOS
              ? "Camera permission denied. Tap 'aA' in Safari address bar, then Website Settings → Camera → Allow. Refresh page after enabling."
              : "Camera permission denied. Please allow camera access in your browser settings.";
          } else if (err.name === "NotFoundError") {
            errorMessage = "No camera found on this device.";
          } else if (err.name === "NotReadableError") {
            errorMessage =
              "Camera is already in use by another application. Close other apps and try again.";
          } else if (err.name === "OverconstrainedError") {
            errorMessage =
              "Camera doesn't meet requirements. Try using the back camera.";
          } else if (isIOS) {
            errorMessage =
              "Camera failed to start. Ensure Safari has camera permission: Settings → Safari → Camera → Allow. Then refresh this page.";
          }

          setError(errorMessage);
        }
      }
    };

    // iOS needs a longer delay for camera initialization
    const timeoutId = setTimeout(initializeScanner, isIOS ? 300 : 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);

      // Cleanup scanner on unmount
      if (html5QrCode) {
        try {
          if (html5QrCode.getState() === Html5QrcodeScannerState.SCANNING) {
            html5QrCode.stop().catch(console.error);
          }
        } catch (e) {
          console.error("Error during cleanup:", e);
        }
      }
    };
  }, [onScan, selectedCamera, isIOS]);

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

          {isIOS && (
            <div className="alert alert-warning small mb-3">
              <strong>📱 iOS Safari Users:</strong>
              <ol className="mb-0 mt-2 ps-3">
                <li>
                  Tap the <strong>"aA"</strong> button in Safari's address bar
                </li>
                <li>
                  Tap <strong>"Website Settings"</strong>
                </li>
                <li>
                  Change <strong>"Camera"</strong> to <strong>"Allow"</strong>
                </li>
                <li>Refresh this page (swipe down)</li>
              </ol>
              <small className="d-block mt-2">
                Alternative: Settings app → Safari → Camera → Allow
              </small>
            </div>
          )}

          <div className="alert alert-info small mb-3">
            <strong>Quick Fixes:</strong>
            <ul className="mb-0 mt-2">
              <li>Check browser permissions (tap/click 🔒 in address bar)</li>
              <li>Ensure you're on HTTPS (secure connection)</li>
              <li>Close other apps that might be using the camera</li>
              <li>Refresh the page after granting permissions</li>
            </ul>
          </div>

          <div className="d-grid gap-2">
            <button className="btn btn-primary" onClick={handleManualInput}>
              <i className="bi bi-keyboard me-2"></i>
              Enter Barcode Manually
            </button>
            {cameras.length > 1 && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setError(null);
                  setSelectedCamera(cameras[1]?.id || cameras[0]?.id);
                }}
              >
                <i className="bi bi-arrow-repeat me-2"></i>
                Try Different Camera
              </button>
            )}
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

        {isIOS && !isScanning && (
          <div className="alert alert-info small mb-3">
            <i className="bi bi-info-circle me-2"></i>
            <strong>First time?</strong> Safari will ask for camera permission.
            Tap "Allow" when prompted.
          </div>
        )}

        <div
          id="barcode-reader"
          className="mb-3"
          style={{ maxHeight: "300px", overflow: "hidden" }}
        ></div>

        {isScanning && (
          <div className="d-grid gap-2 mb-3">
            <button
              className="btn btn-outline-primary"
              onClick={handleManualInput}
            >
              <i className="bi bi-keyboard me-2"></i>
              Enter Manually Instead
            </button>
            {cameras.length > 1 && (
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  // Switch to the other camera
                  const currentIndex = cameras.findIndex(
                    (c) => c.id === selectedCamera,
                  );
                  const nextIndex = (currentIndex + 1) % cameras.length;
                  setSelectedCamera(cameras[nextIndex].id);
                }}
              >
                <i className="bi bi-arrow-repeat me-2"></i>
                Switch Camera
              </button>
            )}
          </div>
        )}

        <div className="alert alert-info mt-3 small">
          <i className="bi bi-info-circle me-2"></i>
          Position the barcode within the frame. Hold steady for automatic
          detection.
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
                <strong>On iPhone/iPad (Safari):</strong>
              </p>
              <ul className="mb-2">
                <li>
                  <strong>Quick fix:</strong> Tap "aA" in address bar → Website
                  Settings → Camera → Allow
                </li>
                <li>
                  <strong>Or:</strong> Settings app → Safari → Camera → Allow
                </li>
                <li>
                  <strong>Then:</strong> Swipe down to refresh this page
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
