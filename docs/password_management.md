# Password Management for Admin Users

## Overview

The manage users area now includes password management functionality that allows admin users to reset passwords for other users. This feature is available in the **Edit User** section of the Profile Manager.

## Current Implementation

### Password Reset via Email

The primary method for password management is sending a password reset email to the user. This is a secure, built-in Supabase feature that:

1. Generates a secure, time-limited reset token
2. Sends an email to the user with a reset link
3. Allows the user to create their own new password
4. Expires the token after use or timeout

**How to use:**

1. Navigate to Profile Manager → Manage Users
2. Select the user you want to manage
3. Scroll to the "Password Management" section
4. Click "Send Reset Email"
5. The user will receive an email with password reset instructions

### Direct Password Change (Currently via Email)

The "Change Password Directly" feature currently sends a password reset email as well, since direct password changes require server-side implementation. The form is present to:

- Validate the new password meets requirements
- Provide a consistent UI for future enhancements
- Prepare for Edge Function implementation

## Future Enhancement: Direct Password Change via Edge Function

To enable instant password changes without requiring email verification, you can set up a Supabase Edge Function with admin privileges.

### Why Edge Functions?

Direct password changes require the Supabase Admin API with a service role key. This key has full access to your database and should **never** be exposed in client-side code. Edge Functions run server-side and can safely use the service role key.

### Setting Up the Edge Function

#### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

#### Step 2: Initialize Supabase Functions

```bash
supabase init
supabase functions new change-user-password
```

#### Step 3: Create the Function

Create `supabase/functions/change-user-password/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Get the current user from the auth header
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if current user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Get request body
    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      throw new Error("Missing userId or newPassword");
    }

    if (newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // Update user password using admin API
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Password updated successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
```

#### Step 4: Deploy the Function

```bash
supabase functions deploy change-user-password --no-verify-jwt
```

#### Step 5: Set Environment Variables

In your Supabase Dashboard:

1. Go to Edge Functions
2. Select `change-user-password`
3. Set the following environment variables:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (from Settings > API)

#### Step 6: Update the Client Code

In `src/components/EditUser.jsx`, update the `handlePasswordChange` function:

```javascript
const handlePasswordChange = async (e) => {
  e.preventDefault();
  setPasswordError("");
  setPasswordSuccess("");

  // Validate passwords
  if (!passwordForm.newPassword) {
    setPasswordError("Please enter a new password");
    return;
  }

  if (passwordForm.newPassword.length < 6) {
    setPasswordError("Password must be at least 6 characters");
    return;
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    setPasswordError("Passwords do not match");
    return;
  }

  if (
    !confirm(
      `Are you sure you want to change the password for ${user.display_name}?`,
    )
  ) {
    return;
  }

  try {
    setChangingPassword(true);

    // Get current user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Not authenticated");
    }

    // Call Edge Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/change-user-password`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.user_id,
          newPassword: passwordForm.newPassword,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to change password");
    }

    setPasswordSuccess(
      "Password changed successfully! The user can now log in with the new password.",
    );
    setPasswordForm({ newPassword: "", confirmPassword: "" });
  } catch (err) {
    console.error("Failed to change password:", err);
    setPasswordError(err.message || "Failed to change password");
  } finally {
    setChangingPassword(false);
  }
};
```

## Security Considerations

### Email-Based Reset (Current)

- ✅ Secure by default
- ✅ Token expires after use or timeout
- ✅ User confirms password via email
- ✅ No risk of service role key exposure
- ⚠️ Requires email delivery
- ⚠️ User must check email

### Edge Function (Future)

- ✅ Instant password change
- ✅ No email required
- ✅ Service role key secured server-side
- ✅ Admin verification in function
- ⚠️ Requires Edge Function setup
- ⚠️ More complex implementation

## Testing

### Test Password Reset Email

1. Log in as admin
2. Go to Profile Manager → Manage Users
3. Select a test user
4. Click "Send Reset Email"
5. Check the user's email inbox
6. Verify the reset link works

### Test Direct Password Change (After Edge Function Setup)

1. Log in as admin
2. Go to Profile Manager → Manage Users
3. Select a test user
4. Enter a new password (min 6 characters)
5. Confirm the password
6. Click "Set Password"
7. Try logging in as that user with the new password

## Troubleshooting

### Password Reset Email Not Received

1. Check spam/junk folder
2. Verify email is correct in Supabase Auth
3. Check Supabase email settings
4. Review email delivery logs in Supabase Dashboard

### Edge Function Errors

1. Check function logs in Supabase Dashboard
2. Verify service role key is set correctly
3. Ensure admin check is working (test with console.log)
4. Verify CORS headers are set correctly

### Permission Denied

1. Ensure logged-in user has `is_admin = true` in user_profiles
2. Check RLS policies on user_profiles table
3. Verify authentication token is valid

## Best Practices

1. **Always confirm before changing passwords** - The UI includes confirmation dialogs
2. **Log password changes** - Consider adding audit logging for security
3. **Notify users** - Send a notification email when password is changed
4. **Use strong passwords** - Enforce minimum length and complexity
5. **Limit admin access** - Only trusted staff should have admin privileges

## Future Enhancements

- [ ] Implement Edge Function for direct password changes
- [ ] Add password strength meter
- [ ] Add audit log for password changes
- [ ] Send notification email on password change
- [ ] Add password history (prevent reuse)
- [ ] Add temporary password feature
- [ ] Add bulk password reset functionality

---

**Version**: 1.0  
**Date**: February 2026  
**Author**: WeeGym Development Team
