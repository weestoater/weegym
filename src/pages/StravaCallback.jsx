import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { exchangeCodeForToken } from "../services/stravaService";

/**
 * StravaCallback Component
 * Handles OAuth callback from Strava and exchanges code for tokens
 */
function StravaCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Get authorization code and state from URL
      const code = searchParams.get("code");
      const state = searchParams.get("state"); // App name
      const errorParam = searchParams.get("error");

      // Check for error from Strava
      if (errorParam) {
        setStatus("error");
        setError(`Authorization failed: ${errorParam}`);
        setTimeout(() => navigate("/strava"), 3000);
        return;
      }

      // Check if code is present
      if (!code) {
        setStatus("error");
        setError("No authorization code received");
        setTimeout(() => navigate("/strava"), 3000);
        return;
      }

      try {
        setStatus("processing");

        // Determine app name (default to 'primary' if state not provided)
        const appName = state || "primary";
        console.log(`📱 Connecting ${appName} Strava app...`);

        // Exchange code for tokens
        await exchangeCodeForToken(code, appName);

        setStatus("success");

        // Redirect to Strava page after 1.5 seconds
        setTimeout(() => navigate("/strava"), 1500);
      } catch (err) {
        console.error("OAuth callback error:", err);
        setStatus("error");
        setError(err.message || "Failed to connect to Strava");
        setTimeout(() => navigate("/strava"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body text-center py-5">
              {status === "processing" && (
                <>
                  <div
                    className="spinner-border text-primary mb-3"
                    role="status"
                  >
                    <span className="visually-hidden">
                      Connecting to Strava...
                    </span>
                  </div>
                  <h4>Connecting to Strava...</h4>
                  <p className="text-muted">
                    Please wait while we complete the authorization.
                  </p>
                </>
              )}

              {status === "success" && (
                <>
                  <div className="mb-3">
                    <i
                      className="bi bi-check-circle-fill text-success"
                      style={{ fontSize: "4rem" }}
                    ></i>
                  </div>
                  <h4 className="text-success">Connected Successfully!</h4>
                  <p className="text-muted">Redirecting to Strava page...</p>
                </>
              )}

              {status === "error" && (
                <>
                  <div className="mb-3">
                    <i
                      className="bi bi-x-circle-fill text-danger"
                      style={{ fontSize: "4rem" }}
                    ></i>
                  </div>
                  <h4 className="text-danger">Connection Failed</h4>
                  <p className="text-muted">{error}</p>
                  <p className="text-muted small">
                    Redirecting back to Strava page...
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StravaCallback;
