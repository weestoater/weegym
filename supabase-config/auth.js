/**
 * Authentication Service
 * Provides authentication operations for Supabase
 */

/**
 * Creates authentication service with the provided Supabase client
 * @param {import('@supabase/supabase-js').SupabaseClient} supabaseClient
 * @returns {Object} Authentication service methods
 */
export function createAuthService(supabaseClient) {
  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} [metadata] - Additional user metadata
   * @returns {Promise<Object>} Authentication data
   */
  async function signUp(email, password, metadata = {}) {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign in an existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication data
   */
  async function signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Sign out the current user
   */
  async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  }

  /**
   * Get the current session
   * @returns {Promise<Object|null>} Current session or null
   */
  async function getSession() {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();
    if (error) throw error;
    return session;
  }

  /**
   * Get the current user
   * @returns {Promise<Object|null>} Current user or null
   */
  async function getUser() {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser();
    if (error) throw error;
    return user;
  }

  /**
   * Subscribe to authentication state changes
   * @param {Function} callback - Callback function (event, session) => void
   * @returns {Object} Subscription object with unsubscribe method
   */
  function onAuthStateChange(callback) {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(callback);
    return subscription;
  }

  /**
   * Reset password for email
   * @param {string} email - User email
   */
  async function resetPassword(email) {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  /**
   * Update user information
   * @param {Object} updates - Object containing user updates
   */
  async function updateUser(updates) {
    const { data, error } = await supabaseClient.auth.updateUser(updates);
    if (error) throw error;
    return data;
  }

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>}
   */
  async function isAuthenticated() {
    const session = await getSession();
    return !!session;
  }

  return {
    signUp,
    signIn,
    signOut,
    getSession,
    getUser,
    onAuthStateChange,
    resetPassword,
    updateUser,
    isAuthenticated,
  };
}

/**
 * Default export for convenience
 */
export default createAuthService;
