import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Toast from "../components/Toast";

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for password reset token in URL
  useEffect(() => {
    const checkPasswordReset = async () => {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const type = hashParams.get("type");

      if (type === "recovery") {
        setIsResetMode(true);
        setIsLogin(false);
        setIsForgotPassword(false);
        setToast({
          message: "Please enter your new password below.",
          type: "info",
        });
      }
    };

    checkPasswordReset();
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Handle password reset
    if (isResetMode) {
      if (!password || !confirmPassword) {
        setToast({ message: "Please fill in all fields", type: "warning" });
        return;
      }

      if (password.length < 6) {
        setToast({
          message: "Password must be at least 6 characters",
          type: "warning",
        });
        return;
      }

      if (password !== confirmPassword) {
        setToast({ message: "Passwords do not match", type: "warning" });
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) throw error;

        setToast({
          message:
            "Password updated successfully! You can now sign in with your new password.",
          type: "success",
        });

        // Reset form and go back to login mode
        setTimeout(() => {
          setIsResetMode(false);
          setIsLogin(true);
          setPassword("");
          setConfirmPassword("");
        }, 2000);
      } catch (error) {
        console.error("Password reset error:", error);
        setToast({
          message:
            error.message || "Failed to update password. Please try again.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle forgot password request
    if (isForgotPassword) {
      if (!email) {
        setToast({ message: "Please enter your email", type: "warning" });
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });

        if (error) throw error;

        setToast({
          message:
            "Password reset email sent! Please check your email and spam folder.",
          type: "success",
        });

        setTimeout(() => {
          setIsForgotPassword(false);
          setIsLogin(true);
        }, 3000);
      } catch (error) {
        console.error("Forgot password error:", error);
        setToast({
          message:
            error.message || "Failed to send reset email. Please try again.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle normal login/signup
    if (!email || !password) {
      setToast({ message: "Please fill in all fields", type: "warning" });
      return;
    }

    if (!isLogin && !name) {
      setToast({ message: "Please enter your name", type: "warning" });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        // Small delay to ensure state is updated
        await new Promise((resolve) => setTimeout(resolve, 100));
        navigate("/");
      } else {
        await signUp(email, password, name);
        setToast({
          message:
            "Account created! Please check your email to verify your account.",
          type: "success",
        });
        // Optionally auto-login after signup
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      console.error("Auth error:", error);

      // Provide more specific error messages
      let errorMessage = "Authentication failed. Please try again.";

      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Please verify your email before signing in.";
      } else if (error.message?.includes("User already registered")) {
        errorMessage = "An account with this email already exists.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <i
                  className="bi bi-heart-pulse text-primary"
                  style={{ fontSize: "3rem" }}
                ></i>
                <h2 className="h4 mt-3">WeeGym Tracker</h2>
                <p className="text-muted">
                  {isResetMode
                    ? "Reset your password"
                    : isForgotPassword
                      ? "Forgot your password?"
                      : isLogin
                        ? "Sign in to your account"
                        : "Create a new account"}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {isResetMode && (
                  <>
                    {/* Password Reset Form */}
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        disabled={loading}
                        autoFocus
                      />
                      <small className="text-muted">
                        At least 6 characters
                      </small>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        disabled={loading}
                      />
                    </div>
                  </>
                )}

                {isForgotPassword && !isResetMode && (
                  <>
                    {/* Forgot Password Form */}
                    <div className="alert alert-info">
                      <small>
                        Enter your email address and we'll send you a link to
                        reset your password.
                      </small>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        disabled={loading}
                        autoFocus
                      />
                    </div>
                  </>
                )}

                {!isResetMode && !isForgotPassword && (
                  <>
                    {/* Normal Login/Signup Form */}
                    {!isLogin && (
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                          Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          disabled={loading}
                        />
                      </div>
                    )}

                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        disabled={loading}
                      />
                      {!isLogin && (
                        <small className="text-muted">
                          At least 6 characters
                        </small>
                      )}
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      {isResetMode
                        ? "Updating password..."
                        : isForgotPassword
                          ? "Sending reset link..."
                          : isLogin
                            ? "Signing in..."
                            : "Creating account..."}
                    </>
                  ) : (
                    <>
                      {isResetMode
                        ? "Update Password"
                        : isForgotPassword
                          ? "Send Reset Link"
                          : isLogin
                            ? "Sign In"
                            : "Sign Up"}
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-3">
                {!isResetMode && (
                  <>
                    {!isForgotPassword && (
                      <>
                        <button
                          className="btn btn-link text-decoration-none"
                          onClick={() => setIsLogin(!isLogin)}
                          disabled={loading}
                        >
                          {isLogin
                            ? "Don't have an account? Sign up"
                            : "Already have an account? Sign in"}
                        </button>
                        {isLogin && (
                          <div>
                            <button
                              className="btn btn-link text-decoration-none text-muted"
                              onClick={() => setIsForgotPassword(true)}
                              disabled={loading}
                            >
                              Forgot password?
                            </button>
                          </div>
                        )}
                      </>
                    )}
                    {isForgotPassword && (
                      <button
                        className="btn btn-link text-decoration-none"
                        onClick={() => {
                          setIsForgotPassword(false);
                          setIsLogin(true);
                        }}
                        disabled={loading}
                      >
                        Back to sign in
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
