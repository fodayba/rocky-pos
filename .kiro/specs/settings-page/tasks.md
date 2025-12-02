# Implementation Plan

- [x] 1. Extend backend schemas and create new models
- [x] 1.1 Update User schema with new fields
  - Add preferences object (theme, displayDensity, rememberMe, sessionTimeout)
  - Add notificationPreferences object (email and inApp categories)
  - Add lastPasswordChange, lastLoginIp fields
  - Add markedForDeletion and deletionScheduledFor fields
  - _Requirements: 2.1, 5.1, 6.1, 8.1, 11.4_

- [x] 1.2 Create ActivityLog schema
  - Create schema with userId, action, details, ipAddress, userAgent, timestamp fields
  - Add indexes for userId and timestamp
  - _Requirements: 9.3, 10.5_

- [x] 1.3 Create Session schema
  - Create schema with userId, token, ipAddress, userAgent, expiresAt, revoked, lastActivity fields
  - Add indexes for userId and token
  - _Requirements: 8.5_

- [x] 2. Create backend API endpoints for settings
- [x] 2.1 Create settings controller and service
  - Create SettingsController with routes for settings operations
  - Create SettingsService with business logic
  - _Requirements: All_

- [x] 2.2 Implement GET /api/users/:id/settings endpoint
  - Return user profile, preferences, notifications, and security settings
  - Include recent activity and session information
  - _Requirements: 2.1, 2.2, 2.3, 4.3, 5.1, 6.1, 8.2, 9.1, 9.2_

- [x] 2.3 Implement PATCH /api/users/:id/profile endpoint
  - Update user profile fields (fullName, email, phone)
  - Validate email format
  - Return updated profile
  - _Requirements: 2.4, 2.5_

- [x] 2.4 Implement POST /api/users/:id/password endpoint
  - Verify current password
  - Validate new password strength
  - Hash and update password
  - Update lastPasswordChange timestamp
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 2.5 Implement PATCH /api/users/:id/preferences endpoint
  - Update user preferences (theme, displayDensity, rememberMe, sessionTimeout)
  - Return updated preferences
  - _Requirements: 4.4, 6.2, 6.5, 8.1_

- [x] 2.6 Implement PATCH /api/users/:id/notifications endpoint
  - Update notification preferences
  - Return updated preferences
  - _Requirements: 5.4_

- [x] 2.7 Implement POST /api/users/:id/sessions/logout-all endpoint
  - Invalidate all sessions except current one
  - Return count of invalidated sessions
  - _Requirements: 8.5_

- [x] 2.8 Implement GET /api/users/:id/activity endpoint
  - Return recent activity logs (last 10 by default)
  - Support pagination with query parameters
  - _Requirements: 9.3, 9.4, 9.5_

- [x] 2.9 Implement POST /api/users/:id/export endpoint
  - Generate JSON export of user data
  - Include profile, preferences, and activity history
  - Create audit log entry
  - Return download URL
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 2.10 Implement POST /api/users/:id/delete endpoint
  - Verify password
  - Mark account for deletion (set markedForDeletion and deletionScheduledFor)
  - Send recovery email
  - Invalidate all sessions
  - _Requirements: 11.2, 11.4, 11.6_

- [x] 2.11 Write property test for authentication guard
  - **Property 1: Unauthenticated access is blocked**
  - **Validates: Requirements 1.3**

- [x] 2.12 Write property test for profile updates
  - **Property 2: Profile updates persist to backend**
  - **Validates: Requirements 2.4**

- [x] 2.13 Write property test for email validation
  - **Property 3: Email validation before save**
  - **Validates: Requirements 2.5**

- [x] 2.14 Write property tests for password validation
  - **Property 4: Password change requires current password**
  - **Property 5: Password confirmation must match**
  - **Property 6: Incorrect current password is rejected**
  - **Property 7: Password strength requirements enforced**
  - **Property 8: Successful password changes show feedback**
  - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**

- [x] 2.15 Write property test for session invalidation
  - **Property 14: Logout all sessions invalidates sessions**
  - **Validates: Requirements 8.5**

- [x] 2.16 Write property tests for data export
  - **Property 17: Data export generates complete JSON**
  - **Property 18: Data export provides download link**
  - **Property 19: Data exports are logged**
  - **Validates: Requirements 10.2, 10.3, 10.4, 10.5**

- [x] 2.17 Write property tests for account deletion
  - **Property 20: Account deletion requires password**
  - **Property 21: Account deletion marks account and logs out**
  - **Property 22: Deletion triggers email notification**
  - **Validates: Requirements 11.2, 11.4, 11.6**

- [-] 3. Create activity logging middleware
- [x] 3.1 Implement activity logging interceptor
  - Create interceptor to log user actions
  - Capture action type, details, IP address, user agent
  - Store in ActivityLog collection
  - _Requirements: 9.3, 9.4, 9.5, 10.5_

- [x] 3.2 Write property test for activity logging
  - **Property 15: Activity entries have required fields**
  - **Property 16: Activity list updates on new actions**
  - **Validates: Requirements 9.4, 9.5**

- [x] 4. Create frontend settings service
- [x] 4.1 Create SettingsService
  - Implement getUserSettings() method
  - Implement updateProfile() method
  - Implement updatePreferences() method
  - Implement updateNotifications() method
  - Implement changePassword() method
  - Implement logoutAllSessions() method
  - Implement getRecentActivity() method
  - Implement requestDataExport() method
  - Implement deleteAccount() method
  - _Requirements: All_

- [x] 4.2 Write unit tests for SettingsService
  - Test all service methods make correct API calls
  - Test error handling for network failures
  - Test data transformation
  - _Requirements: All_

- [x] 5. Create main settings component and routing
- [x] 5.1 Create SettingsComponent
  - Create component with tab navigation
  - Implement tab switching logic
  - Implement unsaved changes detection
  - Add route guard for authentication
  - _Requirements: 1.2, 1.3, 1.4, 12.1, 12.2, 12.5_

- [x] 5.2 Add settings route to app routing
  - Add /settings route with auth guard
  - Configure route to load SettingsComponent
  - _Requirements: 1.2, 1.3, 1.4_

- [x] 5.3 Add settings link to navigation
  - Add settings link to main navigation menu
  - Add icon and label
  - _Requirements: 1.1, 1.2_

- [x] 5.4 Write unit tests for navigation and access
  - Test settings link exists in navigation
  - Test clicking settings link navigates correctly
  - Test unauthenticated access redirects to login
  - Test default tab is Profile
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 12.2_

- [x] 5.5 Write property test for unsaved changes warning
  - **Property 23: Unsaved changes warning on tab switch**
  - **Validates: Requirements 12.5**

- [x] 6. Create Profile tab component
- [x] 6.1 Create ProfileTabComponent
  - Create component with profile form
  - Display email, fullName, role, account creation date
  - Implement edit mode toggle
  - Implement save and cancel actions
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 6.2 Implement profile form validation
  - Add email format validation
  - Add required field validation
  - Display inline error messages
  - _Requirements: 2.5_

- [x] 6.3 Write unit tests for profile tab
  - Test profile fields display correctly
  - Test edit mode toggle
  - Test form validation
  - Test save calls service with correct data
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 7. Create Security tab component
- [x] 7.1 Create SecurityTabComponent
  - Create component with password change form
  - Create session management section
  - Display last password change date
  - Display active sessions count
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 8.4, 8.5_

- [x] 7.2 Implement password change form
  - Add fields for current password, new password, confirm password
  - Implement password strength indicator
  - Validate password requirements
  - Validate password match
  - Handle form submission
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 7.3 Implement session management
  - Display active sessions count
  - Add "Logout All Sessions" button
  - Implement logout all sessions action
  - _Requirements: 8.4, 8.5_

- [x] 7.4 Write unit tests for security tab
  - Test password form validation with specific weak passwords
  - Test password mismatch detection
  - Test logout all sessions button
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 8.4, 8.5_

- [-] 8. Create Preferences tab component
- [x] 8.1 Create PreferencesTabComponent
  - Create component with preference controls
  - Add language selector (integrate with LocaleService from localization feature)
  - Add theme selector (light, dark, system)
  - Add display density selector (compact, comfortable, spacious)
  - Add Remember Me toggle
  - Display session timeout (admin only)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 6.1, 6.2, 6.3, 6.4, 6.5, 8.1, 8.2, 8.3_

- [x] 8.2 Implement locale preview
  - Show example currency formatting for selected locale
  - Show example date formatting for selected locale
  - Update preview when locale changes
  - _Requirements: 4.5_

- [x] 8.3 Implement theme switching
  - Apply theme immediately on selection
  - Handle system default theme
  - Persist theme preference
  - _Requirements: 6.2, 6.3_

- [x] 8.4 Implement display density switching
  - Apply density immediately on selection
  - Update UI spacing based on density
  - Persist density preference
  - _Requirements: 6.5_

- [x] 8.5 Write property test for locale preview
  - **Property 9: Locale preview updates**
  - **Validates: Requirements 4.5**

- [x] 8.6 Write property test for theme changes
  - **Property 11: Theme changes apply immediately**
  - **Validates: Requirements 6.2**

- [x] 8.7 Write property test for density changes
  - **Property 12: Display density changes apply immediately**
  - **Validates: Requirements 6.5**

- [x] 8.8 Write unit tests for preferences tab
  - Test theme selector displays available themes
  - Test system default theme behavior
  - Test density selector displays options
  - Test admin-specific session timeout field
  - _Requirements: 4.1, 6.1, 6.3, 6.4, 8.2, 8.3_

- [x] 9. Create Notifications tab component
- [x] 9.1 Create NotificationsTabComponent
  - Create component with notification toggles
  - Organize toggles by category (sales, inventory, system, security)
  - Separate email and in-app notification sections
  - Implement auto-save on toggle change
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 9.2 Write property test for notification saves
  - **Property 10: Notification preferences save immediately**
  - **Validates: Requirements 5.4**

- [x] 9.3 Write unit tests for notifications tab
  - Test notification toggles display correctly
  - Test toggles organized by category
  - Test toggle changes call service
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 10. Create Advanced tab component
- [x] 10.1 Create AdvancedTabComponent
  - Create component with advanced sections
  - Add location display section
  - Add recent activity section
  - Add data export section
  - Add danger zone section
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 9.1, 9.2, 9.3, 9.4, 10.1, 11.1_

- [x] 10.2 Implement location display
  - Display assigned location name and address
  - Handle no location assignment case
  - Make read-only for non-admin users
  - Allow editing for admin users
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 10.3 Implement recent activity display
  - Load and display last 10 activities
  - Show action type, timestamp, and details
  - Format timestamps using locale settings
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 10.4 Implement data export
  - Add "Export My Data" button
  - Handle export request
  - Show loading state during generation
  - Provide download link when ready
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 10.5 Implement account deletion
  - Add "Delete Account" button in danger zone
  - Show password confirmation modal
  - Show final warning with consequences
  - Handle deletion confirmation
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 10.6 Write property test for location read-only
  - **Property 13: Location is read-only for non-admins**
  - **Validates: Requirements 7.4**

- [x] 10.7 Write unit tests for advanced tab
  - Test location display with no assignment (edge case)
  - Test recent activity displays correctly
  - Test admin-specific location editing
  - Test data export button
  - Test account deletion button in danger zone
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 9.1, 9.2, 9.3, 10.1, 11.1_

- [x] 11. Implement toast notifications and feedback
- [x] 11.1 Create toast notification service (if not exists)
  - Implement success toast method
  - Implement error toast method
  - Implement info toast method
  - _Requirements: 13.1, 13.2_

- [x] 11.2 Add toast notifications to all save operations
  - Show success toast on successful save
  - Show error toast on failed save with details
  - _Requirements: 13.1, 13.2_

- [x] 11.3 Add loading states to all forms
  - Disable save buttons during save operations
  - Show loading indicators during saves
  - Re-enable buttons after completion
  - _Requirements: 13.3, 13.4, 13.5_

- [x] 11.4 Write property tests for save feedback
  - **Property 24: Success feedback on save**
  - **Property 25: Error feedback on save failure**
  - **Property 26: Save button disabled during save**
  - **Property 27: Loading indicator during save**
  - **Property 28: Save button re-enabled after completion**
  - **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5**

- [x] 12. Implement error handling
- [x] 12.1 Add form validation error handling
  - Display inline errors for invalid email
  - Display inline errors for weak passwords
  - Display inline errors for password mismatch
  - Display inline errors for empty required fields
  - _Requirements: 2.5, 3.3, 3.4, 3.7_

- [x] 12.2 Add backend error handling
  - Handle network timeouts with retry option
  - Handle 401 errors with redirect to login
  - Handle 403 errors with permission message
  - Handle 409 errors (e.g., email conflict)
  - Handle 500 errors with generic message
  - _Requirements: Error Handling section_

- [x] 12.3 Write unit tests for error handling
  - Test invalid email format displays error
  - Test weak password displays error
  - Test network timeout shows retry option
  - Test 401 redirects to login
  - _Requirements: Error Handling section_

- [x] 13. Add accessibility features
- [x] 13.1 Implement keyboard navigation
  - Ensure all tabs accessible via keyboard
  - Ensure all forms accessible via keyboard
  - Add proper tab order
  - _Requirements: Accessibility section_

- [x] 13.2 Add ARIA labels and roles
  - Add ARIA labels to all interactive elements
  - Add ARIA roles to tab navigation
  - Add ARIA live regions for toast notifications
  - Announce validation errors to screen readers
  - _Requirements: Accessibility section_

- [x] 13.3 Implement focus management
  - Maintain focus when switching tabs
  - Focus first error on validation failure
  - Return focus after modal close
  - _Requirements: Accessibility section_

- [x] 14. Style settings page
- [x] 14.1 Create settings page styles
  - Style tab navigation
  - Style form layouts
  - Style danger zone section
  - Ensure consistent styling across tabs
  - Implement responsive design for mobile
  - _Requirements: 12.1, 12.3, 12.4_

- [x] 14.2 Implement theme support
  - Ensure styles work in light mode
  - Ensure styles work in dark mode
  - Ensure sufficient color contrast
  - _Requirements: 6.1, 6.2, Accessibility section_

- [x] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
