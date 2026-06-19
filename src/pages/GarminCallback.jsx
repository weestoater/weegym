import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  exchangeTokens,
  syncDailySteps,
  isMockMode,
} from "../services/garminService";

/**
 * GarminCallback Component
 * Handles OAuth 1.0a callback from Garmin
 * Also handles mock mode callback for development
 */
function GarminCallback() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    handleCallback();
  }, [user, navigate, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCallback = async () => {
    try {
      setStatus("processing");

      if (isMockMode) {
        // Mock mode - simulate token exchange
        console.log("🔧 MOCK MODE: Simulating OAuth callback");

        await exchangeTokens("mock_token", "mock_verifier");

        // Simulate initial sync
        setStatus("syncing");
        await syncDailySteps(user.id, { daysBack: 30 });

        setStatus("success");

        // Redirect after success
        setTimeout(() => {
          navigate("/garmin");
        }, 2000);

        return;
      }

      // Real OAuth flow
      const oauthToken = searchParams.get("oauth_token");
      const oauthVerifier = searchParams.get("oauth_verifier");

      if (!oauthToken || !oauthVerifier) {
        throw new Error("Missing OAuth parameters");
      }

      // Exchange tokens
      console.log("📝 Exchanging OAuth tokens...");
      await exchangeTokens(oauthToken, oauthVerifier);

      // Initial sync
      setStatus("syncing");
      console.log("🔄 Starting initial data sync...");
      await syncDailySteps(user.id, { daysBack: 30 });

      setStatus("success");

      // Redirect to Garmin page
      setTimeout(() => {
        navigate("/garmin");
      }, 2000);
    } catch (err) {
      console.error("Error in Garmin callback:", err);
      setError(err.message || "Failed to connect to Garmin");
      setStatus("error");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card text-center">
            <div className="card-body p-5">
              {status === "processing" && (
                <>
                  <div
                    className="spinner-border text-primary mb-3"
                    style={{ width: "3rem", height: "3rem" }}
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h3>Connecting to Garmin...</h3>
                  <p className="text-muted">
                    Please wait while we set up your connection
                  </p>
                </>
              )}

              {status === "syncing" && (
                <>
                  <div
                    className="spinner-border text-success mb-3"
                    style={{ width: "3rem", height: "3rem" }}
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h3>Syncing Your Data...</h3>
                  <p className="text-muted">Importing your step history</p>
                </>
              )}

              {status === "success" && (
                <>
                  <i
                    className="bi bi-check-circle text-success"
                    style={{ fontSize: "5rem" }}
                  ></i>
                  <h3 className="mt-3">Successfully Connected!</h3>
                  <p className="text-muted">
                    Redirecting to your step tracker...
                  </p>
                  {isMockMode && (
                    <p className="text-info small mt-3">
                      <i className="bi bi-info-circle me-1"></i>
                      Mock data has been generated for demonstration
                    </p>
                  )}
                </>
              )}

              {status === "error" && (
                <>
                  <i
                    className="bi bi-x-circle text-danger"
                    style={{ fontSize: "5rem" }}
                  ></i>
                  <h3 className="mt-3">Connection Failed</h3>
                  <div className="alert alert-danger mt-3">{error}</div>
                  <button
                    className="btn btn-primary mt-3"
                    onClick={() => navigate("/garmin")}
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GarminCallback;
