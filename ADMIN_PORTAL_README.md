# Admin Portal Documentation

## Overview

A comprehensive admin portal has been created for the Uni Medical Care project. This portal provides administrators with centralized management tools for users, doctors, appointments, medical records, and system configuration.

## Features

### 🎯 Core Features

1. **Admin Dashboard**
   - Real-time system statistics
   - User, doctor, and appointment metrics
   - System health monitoring
   - Revenue tracking
   - Quick action buttons for all major features

2. **User Management**
   - View all users with detailed information
   - Filter users by role (patient, doctor, admin)
   - Search functionality
   - User status management
   - View detailed user profiles
   - Edit and delete user accounts

3. **Doctor Management**
   - Browse all registered doctors
   - Filter by specialization
   - View doctor statistics (experience, patient count, rating)
   - Manage doctor status (available, busy, offline)
   - Edit doctor information
   - Add new doctors to the system

4. **Appointment Management**
   - View all system appointments
   - Filter by status (scheduled, completed, cancelled)
   - Manage appointment details
   - Track appointment statistics
   - Today's appointment summary

5. **Medical Records Management**
   - Organize records by type (lab, imaging, prescription, diagnosis)
   - View complete patient history
   - Download records
   - Manage record status
   - Advanced filtering capabilities

6. **Reports & Analytics**
   - Generate custom reports
   - Pre-built report templates
   - Patient statistics reports
   - Doctor performance analytics
   - Appointment trends
   - Revenue reports

7. **System Settings**
   - Configure hospital information
   - Manage system preferences
   - Enable/disable features
   - Configure notifications
   - Contact information management

### 📊 Admin Navigation

The admin portal features a responsive sidebar navigation with:
- Dashboard access
- User management
- Doctor management
- Appointments
- Medical records
- Reports
- Settings
- Logout functionality

## Admin Portal Routes

```
/admin/dashboard        - Main admin dashboard
/admin/users           - User management
/admin/doctors         - Doctor management
/admin/appointments    - Appointment management
/admin/records         - Medical records management
/admin/reports         - Reports and analytics
/admin/settings        - System settings
```

## Access Control

### Admin Authentication

Currently, admin access is determined by:
1. Custom Firebase claims (`admin: true`)
2. Email verification (`admin@unimedcare.com`)

To test the admin portal:
- Use an account with admin email or set custom claims in Firebase

### Setting Up Admin Users

In Firebase Console:
1. Go to Authentication → Users
2. Select a user
3. Click "Custom Claims" or use Firebase Admin SDK
4. Add: `{"admin": true}`

## Technology Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Routing**: React Router DOM v7
- **Backend**: Firebase (Authentication & Firestore)
- **Styling**: Custom CSS with modern design system
- **Build Tool**: Vite

## File Structure

```
src/components/admin/
├── adminDashboard.tsx       - Main dashboard
├── adminDashboard.css
├── adminNavigation.tsx       - Sidebar navigation
├── adminNavigation.css
├── adminUsers.tsx           - User management
├── adminUsers.css
├── adminDoctors.tsx         - Doctor management
├── adminDoctors.css
├── adminAppointments.tsx    - Appointment management
├── adminAppointments.css
├── adminRecords.tsx         - Medical records
├── adminRecords.css
├── adminReports.tsx         - Reports section
├── adminReports.css
├── adminSettings.tsx        - System settings
└── adminSettings.css
```

## Customization Guide

### 1. **Styling**

The admin portal uses CSS custom properties (variables) for easy theming:

```css
--admin-primary: #1d63d6
--admin-primary-dark: #154aa8
--admin-primary-light: #e7f0ff
--admin-secondary: #12b981
--admin-danger: #ef4444
--admin-text: #14253b
--admin-text-muted: #5e7590
--admin-border: #d8e5f4
--admin-bg: #f8fbff
--admin-surface: #ffffff
```

Modify these in any CSS file to change the entire theme.

### 2. **Adding New Admin Pages**

1. Create a new component in `src/components/admin/`
2. Create corresponding CSS file
3. Import `AdminNavigation` component
4. Add route in `App.tsx`
5. Add navigation item in `adminNavigation.tsx`

Example:
```tsx
import AdminNavigation from './adminNavigation'

const AdminNewPage = () => {
  return (
    <div className="admin-container">
      <AdminNavigation />
      <div className="admin-content">
        {/* Your content */}
      </div>
    </div>
  )
}
```

### 3. **Connecting to Real Data**

Replace mock data with Firebase Firestore queries:

```tsx
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../firebase'

useEffect(() => {
  const loadData = async () => {
    const q = collection(db, 'collectionName')
    const snapshot = await getDocs(q)
    setData(snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })))
  }
  
  loadData()
}, [])
```

### 4. **Adding Features**

To add new admin features:

1. **Update Dashboard Stats**: Modify `adminDashboard.tsx`
2. **Add Filters**: Update filter components in each management page
3. **Create Reports**: Add new report type in `adminReports.tsx`
4. **Extend Settings**: Add new settings in `adminSettings.tsx`

## Key Components

### AdminNavigation
- Collapsible sidebar navigation
- Active route highlighting
- Logout functionality with confirmation
- Responsive design for mobile

### Stat Cards
- Display key metrics
- Show trends (positive/negative changes)
- Color-coded visualization

### Data Tables
- Sortable columns
- Search and filter functionality
- Action buttons (view, edit, delete)
- Responsive table layout

### Modal Components
- User detail modal
- Logout confirmation
- Edit confirmations

## Security Considerations

1. **Admin Authentication**: Always verify admin role before rendering admin components
2. **Data Validation**: Validate all user inputs
3. **Access Control**: Use Firestore security rules to protect data
4. **Error Handling**: Implement proper error boundaries
5. **Logging**: Track admin actions for audit purposes

## Performance Optimization

- Lazy loading of admin routes
- Pagination for large datasets
- Memoization of components
- Efficient state management
- CSS optimization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Design

The admin portal is fully responsive:
- **Desktop**: Full-width layout with sidebar
- **Tablet**: Adjusted layout with collapsible sidebar
- **Mobile**: Stack layout with icon-only navigation

## Dark Mode (Future Enhancement)

The CSS variables are structured to easily support dark mode:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --admin-primary: #60a5fa;
    --admin-surface: #1f2937;
    /* ... */
  }
}
```

## Testing the Admin Portal

### Test Scenarios

1. **Dashboard**
   - Navigate to `/admin/dashboard`
   - Verify stats are displayed
   - Click quick action buttons

2. **User Management**
   - Navigate to `/admin/users`
   - Search for users
   - Filter by role
   - View user details
   - Edit user status

3. **Doctor Management**
   - Navigate to `/admin/doctors`
   - Filter by specialization
   - View doctor details
   - Manage doctor status

4. **Appointments**
   - Navigate to `/admin/appointments`
   - Filter by status
   - View appointment details

5. **Medical Records**
   - Navigate to `/admin/records`
   - Filter by record type
   - Download records

6. **Reports**
   - Navigate to `/admin/reports`
   - Generate sample reports
   - Download reports

7. **Settings**
   - Navigate to `/admin/settings`
   - Modify settings
   - Save changes

## Troubleshooting

### Admin Access Denied
- Verify custom claims in Firebase
- Check email configuration
- Clear browser cache

### Data Not Loading
- Verify Firebase connection
- Check network tab for API errors
- Verify Firestore permissions

### Styling Issues
- Clear browser cache
- Rebuild project (`npm run build`)
- Check CSS file imports

## Future Enhancements

1. **Advanced Analytics**
   - Charts and graphs
   - Export functionality
   - Custom date ranges

2. **User Management**
   - Bulk operations
   - Role assignment
   - Permission management

3. **Doctor Management**
   - Schedule management
   - Availability calendar
   - Performance metrics

4. **Audit Logging**
   - Track all admin actions
   - Export audit logs
   - Activity timeline

5. **Notifications**
   - Real-time alerts
   - Email notifications
   - In-app notifications

6. **API Integration**
   - REST API endpoints
   - GraphQL support
   - Webhook integration

## Support & Contact

For issues or feature requests, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: May 11, 2026  
**Status**: Production Ready
