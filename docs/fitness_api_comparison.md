# Fitness Tracking API Comparison

## Executive Summary

For integrating fitness activity tracking (walks, bike rides, runs) into WeeGym, **Strava API is the recommended choice** due to ease of implementation, no approval wait time, and widespread adoption.

---

## API Comparison

| Feature                       | Strava API ⭐                        | Garmin Connect API             |
| ----------------------------- | ------------------------------------ | ------------------------------ |
| **Setup Time**                | Immediate                            | Days/weeks (requires approval) |
| **Authentication**            | OAuth 2.0 (simple)                   | OAuth 1.0a (complex)           |
| **Free Tier**                 | Yes (1,000 req/day)                  | Yes (with approval)            |
| **Documentation**             | Excellent                            | Good                           |
| **Community Support**         | Large                                | Moderate                       |
| **Rate Limits**               | 100/15min, 1000/day                  | Variable                       |
| **Webhooks**                  | Yes                                  | Yes                            |
| **Activity Types**            | All major types                      | All major types                |
| **Device Compatibility**      | Universal (most apps sync to Strava) | Garmin devices + synced apps   |
| **Implementation Complexity** | Low-Medium                           | Medium-High                    |

---

## Strava API Details

### Authentication Flow

```
1. User clicks "Connect to Strava"
2. Redirect to Strava authorization page
3. User authorizes WeeGym
4. Strava redirects back with authorization code
5. Exchange code for access + refresh tokens
6. Store tokens securely (encrypted)
7. Use access token for API calls
8. Refresh token when expired (every 6 hours)
```

### Available Data

- **Activities**: Runs, walks, rides, swims, hikes, workouts, etc.
- **Metrics**: Distance, duration, pace, speed, elevation, calories
- **Advanced**: Heart rate, power, cadence (if available from device)
- **Routes**: GPS coordinates, maps, elevation profiles
- **Social**: Kudos, comments, segments
- **Athlete**: Profile info, stats, PRs

### Rate Limits

- **Default**: 100 requests per 15 minutes, 1,000 per day
- **Can request increase** to 2,000/day for legitimate use
- Webhooks don't count against limits

### Cost

- **Free** for standard use
- No paid tiers - all features available

---

## Garmin Connect API Details

### Authentication Flow

```
1. Apply for developer account
2. Wait for approval (can take days/weeks)
3. Register application
4. Implement OAuth 1.0a flow (more complex)
5. User authorizes
6. Store tokens
7. Make API calls
```

### Available Data

- **Activities**: Activity files, summaries
- **Health**: Daily summaries, heart rate, sleep, stress
- **Wellness**: Steps, intensity minutes, body battery
- **User**: Profile, device info

### Rate Limits

- Variable based on approval level
- Generally sufficient for personal use apps

### Cost

- **Free** for approved developers
- Commercial use may require licensing

---

## Recommendation: Strava

### Why Strava?

✅ **Pros:**

1. **Immediate start** - no waiting for approval
2. **Simpler implementation** - OAuth 2.0 is easier than 1.0a
3. **Better documentation** - clear examples and guides
4. **Universal compatibility** - Garmin, Wahoo, Polar, Apple Watch, and many more devices sync to Strava
5. **Popular platform** - users likely already use it
6. **Active community** - more support and examples available
7. **Webhooks** - real-time activity updates

⚠️ **Cons:**

1. Rate limits (but sufficient for personal use)
2. Requires users to have/create Strava account

### Why Not Garmin (Initially)?

❌ **Cons:**

1. **Approval wait** - can't start immediately
2. **More complex auth** - OAuth 1.0a is harder to implement
3. **Limited audience** - only useful for Garmin device owners
4. **Setup overhead** - more bureaucracy

✅ **Pros:**

1. Direct device access (for Garmin owners)
2. More health metrics (sleep, stress, etc.)

### Best Strategy

**Phase 1**: Implement Strava API

- Covers 90% of users (most sync to Strava)
- Quick to implement
- Immediate value

**Phase 2** (Optional): Add Garmin API

- For users who prefer direct Garmin integration
- Only if there's demand
- Can run in parallel with Strava

---

## Integration Benefits for WeeGym

### Current State

- Manual entry for Active Wellbeing activities
- No automatic tracking

### After Strava Integration

1. **Automatic activity import** - walks, rides, runs
2. **Rich data** - distance, duration, calories, elevation
3. **Historical data** - import past activities
4. **Real-time sync** - with webhooks
5. **Reduced manual entry** - less friction
6. **Better insights** - combined with existing tracking

### Potential Features

- Convert Strava activities to Active Wellbeing logs
- Include Strava calories in Slimming World tracker
- Activity streaks and goals
- Compare gym workouts vs. outdoor activities
- Weekly/monthly activity summaries

---

## Technical Requirements

### Environment Variables Needed

```bash
VITE_STRAVA_CLIENT_ID=your_client_id
VITE_STRAVA_CLIENT_SECRET=your_client_secret
VITE_STRAVA_REDIRECT_URI=https://yourdomain.com/weegym/strava/callback
```

### Database Tables Required

1. **strava_connections** - User OAuth tokens
2. **strava_activities** - Synced activity data

### New Pages Required

1. **Strava Connect** - Connection management
2. **Strava Activities** - Activity list/viewer
3. **Strava Callback** - OAuth handler

### Estimated Implementation Time

- **Setup**: 15 minutes (user creates Strava app)
- **Development**: 8-12 hours
- **Testing**: 1-2 hours
- **Total**: ~1-2 days

---

## Security Considerations

1. **Token Storage**: Encrypt access tokens in database
2. **Client Secret**: Never expose in frontend code
3. **RLS Policies**: Ensure users can only access their own data
4. **Token Refresh**: Automatic before expiration
5. **Disconnect**: Secure token removal
6. **Callback Validation**: Verify state parameter

---

## Next Steps

See [strava_integration_plan.md](./strava_integration_plan.md) for detailed implementation steps.

**Quick Start:**

1. Create Strava API application at https://www.strava.com/settings/api
2. Save Client ID and Client Secret
3. Ready for development!

---

## References

- **Strava Developers**: https://developers.strava.com/
- **Garmin Developers**: https://developer.garmin.com/
- **OAuth 2.0 RFC**: https://oauth.net/2/
- **Strava API Playground**: https://developers.strava.com/playground/

---

_Document created: May 10, 2026_
