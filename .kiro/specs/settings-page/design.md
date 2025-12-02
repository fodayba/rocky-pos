# Design Document: Settings Page

## Overview

This design implements a comprehensive settings page for the Gas Metro application, providing users with a centralized interface to manage their profile, security, preferences, and account settings. The page uses a tabbed interface for organization and integrates with existing backend services while adding new endpoints for settings-specific functionality. The design emphasizes usability, immediate feedback, and data safety.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Settings Page Component                     │
│                                                               │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ Profile  │ Security │  Prefs   │  Notify  │ Advanced │  │
│  │   Tab    │   Tab    │   Tab    │   Tab    │   Tab    │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│         │          │          │          │          │        │
│         └──────────┴──────────┴──────────┴──────────┘        │
│                            │                                  │
│                            ▼                                  │
│                  ┌──────────────────┐                        │
│                  │ SettingsService  │                        │
│                  └──────────────────┘                        │
│                            │                                  │
└────────────────────────────┼──────────────────────────────────┘
                             │
                             ▼
                ┌────────────────────────┐
                │   Backend API          │
                │                        │
                │  /api/users/:id        │
                │  /api/users/:id/       │
                │    preferences         │
                │  /api/users/:id/       │
                │    password            │
                │  /api/users/:id/       │
                │    sessions            │
                │  /api/users/:id/       │
                │    export              │
                │  /api/users/:id/       │
                │    delete              │
                └────────────────────────┘
```

### Component Hierarchy

```
SettingsComponent
├── ProfileTabComponent
│   ├── ProfileFormComponent
│   └── AccountInfoComponent
├── SecurityTabComponent
│   ├── PasswordChangeComponent
│   └── SessionManagementComponent
├── PreferencesTabComponent
│   ├── LanguageSelectorComponent (from localization feature)
│   ├── ThemeSelectorComponent
│   └── DisplayDensitySelectorComponent
├── NotificationsTabComponent
│   └── NotificationPreferencesComponent
└── AdvancedTabComponent
    ├── DataExportComponent
    ├── RecentActivityComponent
    └── DangerZoneComponent
```

## Components and Interfaces

### 1. SettingsComponent (Main Container)

The root component managing tab navigation and shared state.

```typescript
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  currentTab: SettingsTab = 'profile';
  user$: Observable<User>;
  hasUnsavedChanges = false;
  
  constructor(
    private settingsService: SettingsService,
    private authService: AuthService,
    private router: Router
  ) {}
  
  switchTab(tab: SettingsTab): void;
  canDeactivate(): boolean | Observable<boolean>;
}

type SettingsTab = 'profile' | 'security' | 'preferences' | 'notifications' | 'advanced';
```

### 2. SettingsService

Central service for all settings-related operations.

```typescript
interface UserSettings {
  profile: UserProfile;
  preferences: UserPreferences;
  notifications: NotificationPreferences;
  security: SecuritySettings;
}

interface UserProfile {
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  employeeId?: string;
  primaryLocation?: Location;
  createdAt: Date;
  lastLogin?: Date;
}

interface UserPreferences {
  locale: string;
  theme: 'light' | 'dark' | 'system';
  displayDensity: 'compact' | 'comfortable' | 'spacious';
  rememberMe: boolean;
  sessionTimeout?: number;
}

interface NotificationPreferences {
  email: {
    sales: boolean;
    inventory: boolean;
    system: boolean;
    security: boolean;
  };
  inApp: {
    sales: boolean;
    inventory: boolean;
    system: boolean;
    security: boolean;
  };
}

interface SecuritySettings {
  lastPasswordChange?: Date;
  activeSessions: number;
  twoFactorEnabled: boolean;
}

interface RecentActivity {
  id: string;
  action: string;
  timestamp: Date;
  details: string;
  ipAddress?: string;
}

class SettingsService {
  getUserSettings(userId: string): Observable<UserSettings>;
  updateProfile(userId: string, profile: Partial<UserProfile>): Observable<UserProfile>;
  updatePreferences(userId: string, prefs: Partial<UserPreferences>): Observable<UserPreferences>;
  updateNotifications(userId: string, notifs: NotificationPreferences): Observable<NotificationPreferences>;
  changePassword(userId: string, data: PasswordChangeData): Observable<void>;
  logoutAllSessions(userId: string): Observable<void>;
  getRecentActivity(userId: string, limit: number): Observable<RecentActivity[]>;
  requestDataExport(userId: string): Observable<{ downloadUrl: string }>;
  deleteAccount(userId: string, password: string): Observable<void>;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

### 3. ProfileTabComponent

Manages user profile information display and editing.

```typescript
@Component({
  selector: 'app-profile-tab',
  templateUrl: './profile-tab.component.html'
})
export class ProfileTabComponent implements OnInit {
  profileForm: FormGroup;
  user: User;
  isEditing = false;
  isSaving = false;
  
  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private toastService: ToastService
  ) {}
  
  initForm(): void;
  toggleEdit(): void;
  saveProfile(): void;
  cancelEdit(): void;
}
```

### 4. SecurityTabComponent

Handles password changes and session management.

```typescript
@Component({
  selector: 'app-security-tab',
  templateUrl: './security-tab.component.html'
})
export class SecurityTabComponent {
  passwordForm: FormGroup;
  isChangingPassword = false;
  securitySettings: SecuritySettings;
  
  changePassword(): void;
  logoutAllSessions(): void;
  validatePasswordStrength(password: string): PasswordStrength;
}

interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}
```

### 5. PreferencesTabComponent

Manages display and localization preferences.

```typescript
@Component({
  selector: 'app-preferences-tab',
  templateUrl: './preferences-tab.component.html'
})
export class PreferencesTabComponent implements OnInit {
  preferences: UserPreferences;
  availableThemes = ['light', 'dark', 'system'];
  availableDensities = ['compact', 'comfortable', 'spacious'];
  
  updateTheme(theme: string): void;
  updateDensity(density: string): void;
  updateRememberMe(enabled: boolean): void;
  previewFormatting(): void;
}
```

### 6. NotificationsTabComponent

Manages notification preferences.

```typescript
@Component({
  selector: 'app-notifications-tab',
  templateUrl: './notifications-tab.component.html'
})
export class NotificationsTabComponent implements OnInit {
  notificationPreferences: NotificationPreferences;
  
  toggleEmailNotification(category: string): void;
  toggleInAppNotification(category: string): void;
  saveNotificationPreferences(): void;
}
```

### 7. AdvancedTabComponent

Handles data export, activity viewing, and account deletion.

```typescript
@Component({
  selector: 'app-advanced-tab',
  templateUrl: './advanced-tab.component.html'
})
export class AdvancedTabComponent implements OnInit {
  recentActivity: RecentActivity[];
  isExporting = false;
  showDeleteConfirmation = false;
  
  loadRecentActivity(): void;
  exportData(): void;
  initiateAccountDeletion(): void;
  confirmAccountDeletion(password: string): void;
}
```

## Data Models

### Extended User Schema

Add new fields to existing User schema:

```typescript
@Schema({ timestamps: true })
export class User extends Document {
  // ... existing fields ...
  
  // New fields for settings
  @Prop({
    type: Object,
    default: {
      theme: 'system',
      displayDensity: 'comfortable',
      rememberMe: false,
      sessionTimeout: 3600
    }
  })
  preferences: {
    theme: 'light' | 'dark' | 'system';
    displayDensity: 'compact' | 'comfortable' | 'spacious';
    rememberMe: boolean;
    sessionTimeout: number;
  };
  
  @Prop({
    type: Object,
    default: {
      email: { sales: true, inventory: true, system: true, security: true },
      inApp: { sales: true, inventory: true, system: true, security: true }
    }
  })
  notificationPreferences: {
    email: {
      sales: boolean;
      inventory: boolean;
      system: boolean;
      security: boolean;
    };
    inApp: {
      sales: boolean;
      inventory: boolean;
      system: boolean;
      security: boolean;
    };
  };
  
  @Prop()
  lastPasswordChange: Date;
  
  @Prop()
  lastLoginIp: string;
  
  @Prop({ default: false })
  markedForDeletion: boolean;
  
  @Prop()
  deletionScheduledFor: Date;
}
```

### Activity Log Schema

New schema for tracking user activities:

```typescript
@Schema({ timestamps: true })
export class ActivityLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  
  @Prop({ required: true })
  action: string; // 'login', 'logout', 'password_change', 'settings_update', etc.
  
  @Prop({ type: Object })
  details: Record<string, any>;
  
  @Prop()
  ipAddress: string;
  
  @Prop()
  userAgent: string;
  
  @Prop({ default: Date.now })
  timestamp: Date;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
```

### Session Schema

For managing active sessions:

```typescript
@Schema({ timestamps: true })
export class Session extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  
  @Prop({ required: true })
  token: string;
  
  @Prop()
  ipAddress: string;
  
  @Prop()
  userAgent: string;
  
  @Prop({ required: true })
  expiresAt: Date;
  
  @Prop({ default: false })
  revoked: boolean;
  
  @Prop({ default: Date.now })
  lastActivity: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Acceptance Criteria Testing Prework

1.1 THE Application SHALL provide a settings link in the main navigation menu
Thoughts: This is about UI structure, testing that a specific element exists.
Testable: yes - example

1.2 WHEN a User clicks the settings link THEN the Application SHALL navigate to the settings page
Thoughts: This is testing navigation behavior for a specific action.
Testable: yes - example

1.3 THE settings page SHALL be accessible only to authenticated users
Thoughts: This applies to all access attempts. We can test that unauthenticated requests are rejected.
Testable: yes - property

1.4 WHEN an unauthenticated user attempts to access the settings page THEN the Application SHALL redirect them to the login page
Thoughts: This is testing specific redirect behavior for unauthenticated access.
Testable: yes - example

2.1 THE settings page SHALL display the User's current email address
Thoughts: This is testing that a specific field is displayed.
Testable: yes - example

2.2 THE settings page SHALL display the User's current full name
Thoughts: This is testing that a specific field is displayed.
Testable: yes - example

2.3 THE settings page SHALL display the User's current role
Thoughts: This is testing that a specific field is displayed.
Testable: yes - example

2.4 WHEN a User updates their full name THEN the Application SHALL save the change to the backend
Thoughts: This applies to all name updates. We can test that any valid name update results in a backend call.
Testable: yes - property

2.5 WHEN a User updates their email address THEN the Application SHALL validate the email format before saving
Thoughts: This applies to all email updates. We can test that invalid emails are rejected and valid ones are accepted.
Testable: yes - property

2.6 THE settings page SHALL display the User's account creation date as read-only information
Thoughts: This is testing that a specific field is displayed and not editable.
Testable: yes - example

3.1 THE settings page SHALL provide a password change section
Thoughts: This is about UI structure.
Testable: yes - example

3.2 WHEN a User initiates a password change THEN the Application SHALL require the current password
Thoughts: This applies to all password change attempts. We can test that attempts without current password are rejected.
Testable: yes - property

3.3 WHEN a User enters a new password THEN the Application SHALL require password confirmation
Thoughts: This is about form validation behavior.
Testable: yes - property

3.4 WHEN the new password and confirmation do not match THEN the Application SHALL display an error message
Thoughts: This applies to all mismatched password attempts.
Testable: yes - property

3.5 WHEN the current password is incorrect THEN the Application SHALL display an error message
Thoughts: This applies to all incorrect password attempts.
Testable: yes - property

3.6 WHEN a password change succeeds THEN the Application SHALL display a success message
Thoughts: This applies to all successful password changes.
Testable: yes - property

3.7 THE Application SHALL enforce password strength requirements (minimum 8 characters, at least one uppercase, one lowercase, one number)
Thoughts: This applies to all password inputs. We can test that weak passwords are rejected.
Testable: yes - property

4.1 THE settings page SHALL display a language selector with available locales
Thoughts: This is testing that a specific UI element exists.
Testable: yes - example

4.2 WHEN a User selects a language THEN the Application SHALL update the interface to that language
Thoughts: This is covered by the localization spec.
Testable: no (duplicate)

4.3 THE settings page SHALL display the User's current locale selection
Thoughts: This is testing that a specific field is displayed.
Testable: yes - example

4.4 WHEN a User changes their locale THEN the Application SHALL persist the preference to their profile
Thoughts: This is covered by the localization spec.
Testable: no (duplicate)

4.5 THE settings page SHALL show a preview of how currency and dates will be formatted for the selected locale
Thoughts: This applies to all locales. We can test that preview updates when locale changes.
Testable: yes - property

5.1 THE settings page SHALL display notification preference options
Thoughts: This is about UI structure.
Testable: yes - example

5.2 THE settings page SHALL provide toggles for email notifications
Thoughts: This is about UI structure.
Testable: yes - example

5.3 THE settings page SHALL provide toggles for in-app notifications
Thoughts: This is about UI structure.
Testable: yes - example

5.4 WHEN a User changes a notification preference THEN the Application SHALL save the change immediately
Thoughts: This applies to all notification preference changes.
Testable: yes - property

5.5 THE settings page SHALL organize notification preferences by category (sales, inventory, system alerts)
Thoughts: This is about UI organization.
Testable: yes - example

6.1 THE settings page SHALL provide a theme selector (light mode, dark mode, system default)
Thoughts: This is about UI structure.
Testable: yes - example

6.2 WHEN a User selects a theme THEN the Application SHALL apply it immediately
Thoughts: This applies to all theme selections.
Testable: yes - property

6.3 WHEN a User selects system default theme THEN the Application SHALL respect the operating system's theme preference
Thoughts: This is testing specific system theme behavior.
Testable: yes - example

6.4 THE settings page SHALL provide options for display density (compact, comfortable, spacious)
Thoughts: This is about UI structure.
Testable: yes - example

6.5 WHEN a User changes display density THEN the Application SHALL update the UI spacing immediately
Thoughts: This applies to all density changes.
Testable: yes - property

7.1 THE settings page SHALL display the User's assigned location name
Thoughts: This is testing that a specific field is displayed.
Testable: yes - example

7.2 THE settings page SHALL display the location address
Thoughts: This is testing that a specific field is displayed.
Testable: yes - example

7.3 WHEN a User has no assigned location THEN the settings page SHALL display a message indicating no assignment
Thoughts: This is an edge case for location display.
Testable: edge-case

7.4 THE location assignment SHALL be read-only for regular users
Thoughts: This applies to all non-admin users.
Testable: yes - property

7.5 WHEN a User is an administrator THEN the settings page SHALL allow changing location assignments
Thoughts: This is testing admin-specific behavior.
Testable: yes - example

8.1 THE settings page SHALL provide an option to enable/disable "Remember Me" functionality
Thoughts: This is about UI structure.
Testable: yes - example

8.2 THE settings page SHALL display the User's current session timeout setting
Thoughts: This is testing that a specific field is displayed.
Testable: yes - example

8.3 WHEN a User is an administrator THEN the settings page SHALL allow configuring session timeout duration
Thoughts: This is testing admin-specific behavior.
Testable: yes - example

8.4 THE settings page SHALL provide a button to log out of all other sessions
Thoughts: This is about UI structure.
Testable: yes - example

8.5 WHEN a User clicks log out all sessions THEN the Application SHALL invalidate all other active sessions for that User
Thoughts: This applies to all session logout attempts.
Testable: yes - property

9.1 THE settings page SHALL display the User's last login date and time
Thoughts: This is testing that a specific field is displayed.
Testable: yes - example

9.2 THE settings page SHALL display the User's last login IP address
Thoughts: This is testing that a specific field is displayed.
Testable: yes - example

9.3 THE settings page SHALL display a list of recent actions (last 10 activities)
Thoughts: This is testing that a specific list is displayed.
Testable: yes - example

9.4 WHEN displaying recent activities THEN the Application SHALL show the action type, timestamp, and relevant details
Thoughts: This applies to all activities. We can test that each activity has required fields.
Testable: yes - property

9.5 THE recent activity list SHALL update when the User performs new actions
Thoughts: This is testing real-time update behavior.
Testable: yes - property

10.1 THE settings page SHALL provide a button to request data export
Thoughts: This is about UI structure.
Testable: yes - example

10.2 WHEN a User requests data export THEN the Application SHALL generate a JSON file containing their profile and activity data
Thoughts: This applies to all export requests.
Testable: yes - property

10.3 WHEN data export is complete THEN the Application SHALL provide a download link
Thoughts: This applies to all successful exports.
Testable: yes - property

10.4 THE exported data SHALL include profile information, preferences, and activity history
Thoughts: This applies to all exports. We can test that exported JSON contains required sections.
Testable: yes - property

10.5 THE Application SHALL log all data export requests for audit purposes
Thoughts: This applies to all export requests.
Testable: yes - property

11.1 THE settings page SHALL provide an account deletion option in a clearly marked danger zone
Thoughts: This is about UI structure.
Testable: yes - example

11.2 WHEN a User initiates account deletion THEN the Application SHALL require password confirmation
Thoughts: This applies to all deletion attempts.
Testable: yes - property

11.3 WHEN a User confirms account deletion THEN the Application SHALL display a final warning with consequences
Thoughts: This is testing specific UI behavior for deletion confirmation.
Testable: yes - example

11.4 WHEN account deletion is confirmed THEN the Application SHALL mark the account for deletion and log the User out
Thoughts: This applies to all confirmed deletions.
Testable: yes - property

11.5 THE Application SHALL retain account data for 30 days before permanent deletion to allow recovery
Thoughts: This is about data retention policy, not immediately testable in unit tests.
Testable: no

11.6 WHEN an account is marked for deletion THEN the User SHALL receive an email with recovery instructions
Thoughts: This applies to all account deletions.
Testable: yes - property

12.1 THE settings page SHALL organize settings into tabs or sections (Profile, Security, Preferences, Notifications, Advanced)
Thoughts: This is about UI structure.
Testable: yes - example

12.2 WHEN a User navigates to the settings page THEN the Application SHALL display the Profile section by default
Thoughts: This is testing default state behavior.
Testable: yes - example

12.3 THE settings page SHALL provide clear visual separation between sections
Thoughts: This is about visual design, not functionally testable.
Testable: no

12.4 THE settings page SHALL use consistent styling and layout across all sections
Thoughts: This is about visual design, not functionally testable.
Testable: no

12.5 WHEN a User switches between sections THEN the Application SHALL preserve unsaved changes with a warning
Thoughts: This applies to all section switches with unsaved changes.
Testable: yes - property

13.1 WHEN a User saves a setting THEN the Application SHALL display a success toast notification
Thoughts: This applies to all successful saves.
Testable: yes - property

13.2 WHEN a setting fails to save THEN the Application SHALL display an error toast with details
Thoughts: This applies to all failed saves.
Testable: yes - property

13.3 THE settings page SHALL disable save buttons while a save operation is in progress
Thoughts: This applies to all save operations.
Testable: yes - property

13.4 THE settings page SHALL show a loading indicator during save operations
Thoughts: This applies to all save operations.
Testable: yes - property

13.5 WHEN a save operation completes THEN the Application SHALL re-enable the save button
Thoughts: This applies to all completed save operations.
Testable: yes - property

### Property Reflection

After reviewing the prework, several criteria are redundant or covered by other specs:
- 4.2 and 4.4 are covered by the localization spec
- Many UI structure tests (examples) can be combined into integration tests
- Visual design criteria (12.3, 12.4) are not functionally testable

### Properties

Property 1: Unauthenticated access is blocked
*For any* unauthenticated request to the settings page, the application should reject access and redirect to login
**Validates: Requirements 1.3**

Property 2: Profile updates persist to backend
*For any* valid profile field update (name, email, phone), the application should make a backend API call to save the change
**Validates: Requirements 2.4**

Property 3: Email validation before save
*For any* email update attempt, the application should validate the email format and reject invalid formats before making backend calls
**Validates: Requirements 2.5**

Property 4: Password change requires current password
*For any* password change attempt without a valid current password, the application should reject the request
**Validates: Requirements 3.2**

Property 5: Password confirmation must match
*For any* password change attempt where new password and confirmation don't match, the application should display an error
**Validates: Requirements 3.3, 3.4**

Property 6: Incorrect current password is rejected
*For any* password change attempt with incorrect current password, the application should reject it and display an error
**Validates: Requirements 3.5**

Property 7: Password strength requirements enforced
*For any* password that doesn't meet strength requirements (8+ chars, uppercase, lowercase, number), the application should reject it
**Validates: Requirements 3.7**

Property 8: Successful password changes show feedback
*For any* successful password change, the application should display a success message
**Validates: Requirements 3.6**

Property 9: Locale preview updates
*For any* locale selection, the preview should display currency and date formatting for that locale
**Validates: Requirements 4.5**

Property 10: Notification preferences save immediately
*For any* notification preference toggle, the application should save the change to the backend immediately
**Validates: Requirements 5.4**

Property 11: Theme changes apply immediately
*For any* theme selection, the application should apply the theme to the UI immediately
**Validates: Requirements 6.2**

Property 12: Display density changes apply immediately
*For any* display density selection, the application should update UI spacing immediately
**Validates: Requirements 6.5**

Property 13: Location is read-only for non-admins
*For any* non-admin user, the location assignment field should be read-only and not editable
**Validates: Requirements 7.4**

Property 14: Logout all sessions invalidates sessions
*For any* user requesting to logout all sessions, the application should invalidate all other active sessions for that user
**Validates: Requirements 8.5**

Property 15: Activity entries have required fields
*For any* activity displayed in recent activity list, it should contain action type, timestamp, and details
**Validates: Requirements 9.4**

Property 16: Activity list updates on new actions
*For any* new user action, the recent activity list should update to include the new action
**Validates: Requirements 9.5**

Property 17: Data export generates complete JSON
*For any* data export request, the generated file should contain profile information, preferences, and activity history
**Validates: Requirements 10.2, 10.4**

Property 18: Data export provides download link
*For any* successful data export, the application should provide a download link
**Validates: Requirements 10.3**

Property 19: Data exports are logged
*For any* data export request, the application should create an audit log entry
**Validates: Requirements 10.5**

Property 20: Account deletion requires password
*For any* account deletion attempt, the application should require password confirmation
**Validates: Requirements 11.2**

Property 21: Account deletion marks account and logs out
*For any* confirmed account deletion, the application should mark the account for deletion and log the user out
**Validates: Requirements 11.4**

Property 22: Deletion triggers email notification
*For any* account marked for deletion, the application should send an email with recovery instructions
**Validates: Requirements 11.6**

Property 23: Unsaved changes warning on tab switch
*For any* tab switch when there are unsaved changes, the application should display a warning
**Validates: Requirements 12.5**

Property 24: Success feedback on save
*For any* successful settings save, the application should display a success toast notification
**Validates: Requirements 13.1**

Property 25: Error feedback on save failure
*For any* failed settings save, the application should display an error toast with details
**Validates: Requirements 13.2**

Property 26: Save button disabled during save
*For any* save operation in progress, the save button should be disabled
**Validates: Requirements 13.3**

Property 27: Loading indicator during save
*For any* save operation in progress, a loading indicator should be visible
**Validates: Requirements 13.4**

Property 28: Save button re-enabled after completion
*For any* completed save operation, the save button should be re-enabled
**Validates: Requirements 13.5**

## Error Handling

### Form Validation Errors

1. **Invalid Email Format**: Display inline error, prevent submission
2. **Weak Password**: Display strength indicator, prevent submission until requirements met
3. **Password Mismatch**: Display inline error, prevent submission
4. **Empty Required Fields**: Display inline errors, prevent submission

### Backend Errors

1. **Network Timeout**: Display error toast, keep form data, allow retry
2. **Unauthorized (401)**: Redirect to login page
3. **Forbidden (403)**: Display error message explaining insufficient permissions
4. **Conflict (409)**: Display error (e.g., email already in use)
5. **Server Error (500)**: Display generic error toast, log details

### Session Management Errors

1. **Failed to Logout Sessions**: Display error toast, show which sessions failed
2. **Session Expired**: Redirect to login with message

### Data Export Errors

1. **Export Generation Failed**: Display error toast with retry option
2. **Export Too Large**: Display message suggesting date range filter
3. **Download Failed**: Provide alternative download method

### Account Deletion Errors

1. **Incorrect Password**: Display error, allow retry
2. **Deletion Failed**: Display error toast, log issue for support
3. **Email Send Failed**: Mark account for deletion anyway, log email failure

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **Navigation and Access**:
   - Test settings link exists in navigation
   - Test clicking settings link navigates to settings page
   - Test unauthenticated access redirects to login
   - Test default tab is Profile

2. **Form Validation**:
   - Test email validation with specific invalid formats
   - Test password strength with specific weak passwords
   - Test password mismatch detection
   - Test required field validation

3. **UI State Management**:
   - Test theme selector displays available themes
   - Test notification toggles display correctly
   - Test location display for users with no assignment (edge case)
   - Test admin-specific fields visibility

4. **Data Display**:
   - Test profile fields display user data
   - Test recent activity displays last 10 items
   - Test session info displays correctly

### Property-Based Tests

Property-based tests will verify universal behaviors using fast-check library:

1. **Authentication**: Generate random auth states, verify access control
2. **Profile Updates**: Generate random valid profile data, verify backend calls
3. **Email Validation**: Generate random strings, verify validation logic
4. **Password Validation**: Generate random passwords, verify strength requirements
5. **Notification Preferences**: Generate random preference combinations, verify saves
6. **Theme/Density Changes**: Generate random selections, verify immediate application
7. **Data Export**: Generate random user data, verify export completeness
8. **Activity Logging**: Generate random actions, verify activity entries have required fields
9. **Save Feedback**: Generate random save outcomes, verify appropriate feedback
10. **Tab Switching**: Generate random unsaved states, verify warning behavior

Each property-based test will run a minimum of 100 iterations.

### Integration Tests

1. **End-to-End Profile Update**: Edit profile → Save → Verify backend call → Verify success toast
2. **Password Change Flow**: Enter passwords → Submit → Verify backend call → Verify success
3. **Theme Switching**: Select theme → Verify UI updates → Reload page → Verify persistence
4. **Data Export Flow**: Request export → Wait for generation → Download file → Verify contents
5. **Account Deletion Flow**: Initiate → Confirm → Verify logout → Verify email sent

## Implementation Notes

### Security Considerations

1. **Password Handling**: Never send plain passwords to frontend, always hash on backend
2. **Session Management**: Use secure tokens, implement CSRF protection
3. **Data Export**: Sanitize exported data, don't include sensitive system information
4. **Account Deletion**: Implement soft delete with recovery period
5. **Audit Logging**: Log all sensitive operations (password changes, exports, deletions)

### Performance Considerations

1. **Lazy Loading**: Load tabs on-demand rather than all at once
2. **Debouncing**: Debounce auto-save operations to reduce backend calls
3. **Caching**: Cache user settings in frontend to reduce API calls
4. **Pagination**: Paginate recent activity if list grows large

### Accessibility

1. **Keyboard Navigation**: All tabs and forms accessible via keyboard
2. **Screen Readers**: Proper ARIA labels on all interactive elements
3. **Focus Management**: Maintain focus when switching tabs
4. **Error Announcements**: Announce validation errors to screen readers
5. **Color Contrast**: Ensure sufficient contrast in all themes

### Future Extensibility

The architecture supports:
- Additional settings tabs (Billing, Integrations, etc.)
- Two-factor authentication settings
- API key management
- Webhook configuration
- Custom notification rules
- Advanced security settings (IP whitelisting, etc.)
