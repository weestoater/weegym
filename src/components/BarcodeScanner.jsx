import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Quagga from "@ericblade/quagga2";

/**
 * BarcodeScanner Component
 *
 * Provides barcode scanning functionality using the device camera.
 * Uses Quagga2 library for reliable barcode detection.
 * Optimized for iOS Safari compatibility with EAN/UPC barcodes.
 *
 * Note: Requires '@ericblade/quagga2' package to be installed:
 * npm install @ericblade/quagga2 --legacy-peer-deps
 */
function BarcodeScanner({ onScan, onClose }) {
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(Date.now());
  const [lastDetection, setLastDetection] = useState(null);
  const scannerRef = useRef(null);
  const mountedRef = useRef(true);
  const scanStartTimeRef = useRef(Date.now());
  const detectedCodes = useRef(new Map()); // Track detected codes with confidence

  // Detect if running on iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  useEffect(() => {
    mountedRef.current = true;

    const initializeScanner = () => {
      try {
        Quagga.init(
          {
            inputStream: {
              name: "Live",
              type: "LiveStream",
              target: scannerRef.current,
              constraints: {
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 },
                facingMode: "environment", // Use back camera
                aspectRatio: { min: 1, max: 2 },
              },
            },
            locator: {
              patchSize: isIOS ? "medium" : "large",
              halfSample: isIOS, // Better performance on iOS
            },
            numOfWorkers: navigator.hardwareConcurrency || 4,
            decoder: {
              readers: [
                "ean_reader", // EAN-13, EAN-8 (most food products in Europe)
                "ean_8_reader",
                "upc_reader", // UPC-A, UPC-E (most food products in USA)
                "upc_e_reader",
                "code_128_reader", // Some packaged goods
                "code_39_reader",
              ],
              debug: {
                drawBoundingBox: true,
                showFrequency: false,
                drawScanline: true,
                showPattern: false,
              },
            },
            locate: true,
            frequency: 10, // Scan attempts per second
          },
          (err) => {
            if (err) {
              console.error("Quagga initialization failed:", err);
              if (mountedRef.current) {
                let errorMessage = "Failed to initialize camera.";

                if (
                  err.name === "NotAllowedError" ||
                  err.name === "PermissionDeniedError"
                ) {
                  errorMessage = isIOS
                    ? "Camera permission denied. Tap 'aA' in Safari address bar, then Website Settings → Camera → Allow. Refresh page after enabling."
                    : "Camera permission denied. Please allow camera access in your browser settings.";
                } else if (
                  err.name === "NotFoundError" ||
                  err.message?.includes("no device")
                ) {
                  errorMessage = "No camera found on this device.";
                } else if (err.name === "NotReadableError") {
                  errorMessage =
                    "Camera is already in use by another application. Close other apps and try again.";
                } else if (isIOS && err.message?.includes("constraints")) {
                  errorMessage =
                    "Camera configuration not supported. Ensure Safari has camera permission.";
                }

                setError(errorMessage);
              }
              return;
            }

            if (mountedRef.current) {
              Quagga.start();
              setIsScanning(true);
            }
          },
        );

        // Handle detected barcodes
        Quagga.onDetected((result) => {
          if (!mountedRef.current) return;

          const code = result.codeResult.code;
          const confidence =
            result.codeResult.decodedCodes.reduce(
              (sum, code) => sum + (code.error || 0),
              0,
            ) / result.codeResult.decodedCodes.length;

          // Track attempts
          setScanAttempts((prev) => prev + 1);
          setLastScanTime(Date.now());

          // Only accept high-confidence reads (lower error is better)
          if (confidence < 0.1) {
            // Track this code
            const count = (detectedCodes.current.get(code) || 0) + 1;
            detectedCodes.current.set(code, count);

            // Show feedback
            setLastDetection({ code, confidence: (1 - confidence) * 100 });

            // If we've seen this code 2+ times, it's likely correct
            if (count >= 2) {
              console.log(
                "Barcode detected:",
                code,
                "confidence:",
                (1 - confidence) * 100,
              );
              if (mountedRef.current) {
                setScanSuccess(true);
                Quagga.stop();

                // Small delay to show success feedback
                setTimeout(() => {
                  if (mountedRef.current) {
                    onScan(code);
                  }
                }, 500);
              }
            }
          }
        });

        // Track processing attempts
        Quagga.onProcessed((result) => {
          if (!mountedRef.current) return;

          const now = Date.now();
          const elapsed = (now - scanStartTimeRef.current) / 1000;
          if (elapsed > 1) {
            // Update after first second
            setScanAttempts((prev) => {
              const newCount = prev + 1;
              return newCount;
            });
            setLastScanTime(now);
          }
        });
      } catch (err) {
        console.error("Scanner initialization error:", err);
        if (mountedRef.current) {
          setError("Failed to start scanner: " + err.message);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(initializeScanner, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);

      try {
        Quagga.stop();
        Quagga.offDetected();
        Quagga.offProcessed();
      } catch (e) {
        console.error("Error during cleanup:", e);
      }
    };
  }, [onScan, isIOS]);

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
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const scanRate =
    scanAttempts > 0
      ? Math.round(
          scanAttempts / ((Date.now() - scanStartTimeRef.current) / 1000),
        )
      : 0;

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">
            <i className="bi bi-upc-scan me-2"></i>
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

        {scanSuccess && (
          <div className="alert alert-success mb-3">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong>Barcode detected!</strong> Loading product info...
          </div>
        )}

        {isScanning && !scanSuccess && (
          <div className="mb-3">
            <div className="alert alert-info mb-2 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                >
                  <span className="visually-hidden">Scanning...</span>
                </div>
                <span>
                  <strong>Scanning active</strong>
                </span>
              </div>
              <div className="text-end small">
                <div>
                  <strong>{scanAttempts}</strong> scans
                </div>
                <div className="text-muted">{scanRate}/sec</div>
              </div>
            </div>

            {lastDetection && (
              <div className="alert alert-success small mb-2 py-2">
                <i className="bi bi-bullseye me-2"></i>
                <strong>Possible match:</strong> {lastDetection.code} (
                {lastDetection.confidence.toFixed(0)}% confidence)
              </div>
            )}

            {scanAttempts > 30 && !lastDetection && (
              <div className="alert alert-warning small mb-2 py-2">
                <i className="bi bi-lightbulb me-2"></i>
                <strong>Tips:</strong> Hold barcode flat and steady. Ensure good
                lighting. Move {scanAttempts > 60 ? "much " : ""}closer or
                further away.
              </div>
            )}
          </div>
        )}

        <div
          ref={scannerRef}
          style={{
            position: "relative",
            width: "100%",
            minHeight: "250px",
            maxHeight: "400px",
            overflow: "hidden",
            marginBottom: "1rem",
            backgroundColor: "#000",
          }}
        />

        {isScanning && (
          <div className="d-grid gap-2 mb-3">
            {/* Activity Indicator */}
            <div className="small text-center mb-2">
              {Date.now() - lastScanTime < 2000 ? (
                <span className="text-success">
                  <i
                    className="bi bi-circle-fill me-1"
                    style={{
                      fontSize: "0.5rem",
                      animation: "pulse 1s ease-in-out infinite",
                    }}
                  ></i>
                  Camera Active
                </span>
              ) : (
                <span className="text-warning">
                  <i className="bi bi-exclamation-circle me-1"></i>
                  Waiting for barcode... Position barcode in green box
                </span>
              )}
            </div>

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
          <strong>Quagga2 Scanner:</strong> Position the barcode within the
          frame. The scanner will automatically detect EAN/UPC barcodes (most
          food products).
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
