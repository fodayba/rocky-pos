# Backward Compatibility Testing Guide

This document outlines the testing procedures to verify backward compatibility for the onboarding feature.

## Test Scenarios

### 1. Existing Users (Migrated)

**Setup:**
- Run the migration script: `npm run migrate:onboarding`
- This marks all existing users with `onboardingCompleted: true`

**Expected Behavior:**
- ✅ Existing users can log in successfully
- ✅ Login response includes `onboardingCompleted: true`
- ✅ Users are redirected to dashboard (not onboarding)
- ✅ Users cannot access `/onboarding` route (redirected to dashboard)
- ✅ Users can access all protected routes (POS, inventory, reports, etc.)

**Test Steps:**
1. Create a user before running migration
2. Run migration script
3. Log in with the existing user
4. Verify redirect to dashboard
5. Attempt to navigate to `/onboarding`
6. Verify redirect back to dashboard

### 2. New Users (Post-Migration)

**Expected Behavior:**
- ✅ New users are assigned ADMIN role on signup
- ✅ New users have `onboardingCompleted: false`
- ✅ New users are redirected to `/onboarding` after login
- ✅ New users cannot access protected routes until onboarding is complete
- ✅ After completing onboarding, users can access all routes

**Test Steps:**
1. Sign up with a new account
2. Verify redirect to onboarding flow
3. Attempt to navigate to `/dashboard`
4. Verify redirect back to onboarding
5. Complete onboarding steps
6. Verify redirect to dashboard
7. Verify access to all protected routes

### 3. Onboarding Guard Behavior

**For Existing Users (onboardingCompleted: true):**
- ✅ Can access: `/dashboard`, `/pos`, `/customers`, `/inventory`, etc.
- ❌ Cannot access: `/onboarding` (redirected to dashboard)

**For New Users (onboardingCompleted: false):**
- ✅ Can access: `/onboarding`
- ❌ Cannot access: `/dashboard`, `/pos`, etc. (redirected to onboarding)

**For All Users:**
- ✅ Can access: `/login`, `/signup` (public routes)

## Automated Tests

### Backend Tests

Run backend tests to verify service behavior:

```bash
cd backend
npm test
```

**Test Coverage:**
- `auth.service.spec.ts` - Tests signup, login, and onboarding status
- `onboarding.service.spec.ts` - Tests onboarding flow and backward compatibility
- `onboarding.controller.spec.ts` - Tests API endpoints

**Key Test Cases:**
1. Signup assigns ADMIN role and initializes onboarding fields
2. Login response includes onboarding status
3. Migrated users have completed onboarding
4. New users have incomplete onboarding
5. Onboarding endpoints reject completed users
6. Onboarding endpoints allow incomplete users

### Frontend Tests

Run frontend tests to verify guard and component behavior:

```bash
npm test
```

**Test Coverage:**
- `onboarding.guard.spec.ts` - Tests route protection and redirects
- `auth.service.spec.ts` - Tests authentication with onboarding status
- `onboarding.component.spec.ts` - Tests onboarding flow

**Key Test Cases:**
1. Guard redirects incomplete users to onboarding
2. Guard redirects complete users away from onboarding
3. Guard allows access to appropriate routes
4. Onboarding component handles step navigation
5. Completion updates user status

## Manual Testing Checklist

### Pre-Migration Testing

- [ ] Create test users with various roles
- [ ] Verify users can log in and access the system
- [ ] Document current user count and roles

### Migration Testing

- [ ] Backup database before migration
- [ ] Run migration script: `npm run migrate:onboarding`
- [ ] Verify migration output shows correct counts
- [ ] Check database to confirm fields were added
- [ ] Verify all existing users have `onboardingCompleted: true`

### Post-Migration Testing

#### Existing Users
- [ ] Log in with existing admin user
- [ ] Verify redirect to dashboard (not onboarding)
- [ ] Verify access to all features (POS, inventory, reports)
- [ ] Attempt to navigate to `/onboarding`
- [ ] Verify redirect back to dashboard
- [ ] Log out and log in again to verify persistence

#### New Users
- [ ] Sign up with new account
- [ ] Verify ADMIN role is assigned
- [ ] Verify redirect to onboarding flow
- [ ] Attempt to navigate to `/dashboard`
- [ ] Verify redirect back to onboarding
- [ ] Complete welcome step
- [ ] Complete location setup step
- [ ] Complete onboarding
- [ ] Verify redirect to dashboard
- [ ] Verify access to all features
- [ ] Log out and log in again
- [ ] Verify redirect to dashboard (not onboarding)

#### Edge Cases
- [ ] Test with suspended user account
- [ ] Test with inactive user account
- [ ] Test session expiration during onboarding
- [ ] Test browser refresh during onboarding
- [ ] Test back button during onboarding
- [ ] Test direct URL navigation during onboarding

## Rollback Plan

If issues are discovered after migration:

1. **Restore Database Backup**
   ```bash
   mongorestore --uri="mongodb://localhost:27017/gas-metro" /path/to/backup
   ```

2. **Revert Code Changes**
   ```bash
   git revert <commit-hash>
   ```

3. **Clear User Sessions**
   - Users may need to log out and log in again
   - Consider clearing JWT tokens

## Success Criteria

Migration is successful when:

- ✅ All existing users can log in without seeing onboarding
- ✅ All new users see onboarding flow after signup
- ✅ Onboarding guard correctly routes users based on status
- ✅ No errors in application logs
- ✅ All automated tests pass
- ✅ Manual testing checklist is complete

## Troubleshooting

### Issue: Existing users see onboarding flow

**Cause:** Migration didn't run or failed
**Solution:** 
1. Check migration logs
2. Verify database fields: `db.users.findOne({}, {onboardingCompleted: 1})`
3. Re-run migration if needed

### Issue: New users don't see onboarding flow

**Cause:** Signup not setting onboardingCompleted to false
**Solution:**
1. Check auth service signup method
2. Verify User schema defaults
3. Check browser console for errors

### Issue: Guard not redirecting correctly

**Cause:** Auth service not returning onboarding status
**Solution:**
1. Check login response payload
2. Verify auth service stores onboarding status
3. Check guard logic in `onboarding.guard.ts`

## Database Queries for Verification

Check onboarding status of all users:
```javascript
db.users.find({}, { email: 1, onboardingCompleted: 1, onboardingCompletedAt: 1 })
```

Count users by onboarding status:
```javascript
db.users.aggregate([
  { $group: { _id: "$onboardingCompleted", count: { $sum: 1 } } }
])
```

Find users without onboarding fields:
```javascript
db.users.find({ onboardingCompleted: { $exists: false } })
```

Update specific user's onboarding status (if needed):
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { 
    $set: { 
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
      onboardingProgress: {
        welcomeViewed: true,
        locationSetup: true,
        completionViewed: true
      }
    }
  }
)
```
