import {
  FiGrid, FiUsers, FiBox, FiTag, FiLifeBuoy, FiUser, FiBell, FiMessageSquare,
  FiClipboard, FiRadio, FiFileText,
} from 'react-icons/fi';

export const navByRole = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/admin/tickets', label: 'Tickets', icon: FiLifeBuoy },
    { to: '/admin/users', label: 'Users', icon: FiUsers },
    { to: '/admin/resources', label: 'Resources', icon: FiBox },
    { to: '/admin/categories', label: 'Categories', icon: FiTag },
    { to: '/admin/saved-responses', label: 'Saved Responses', icon: FiClipboard },
    { to: '/admin/announcements', label: 'Announcements', icon: FiRadio },
    { to: '/admin/audit', label: 'Audit Log', icon: FiFileText },
    { to: '/admin/messages', label: 'Messages', icon: FiMessageSquare },
    { to: '/admin/notifications', label: 'Notifications', icon: FiBell },
    { to: '/admin/profile', label: 'Profile', icon: FiUser },
  ],
  agent: [
    { to: '/agent/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/agent/tickets', label: 'My Tickets', icon: FiLifeBuoy },
    { to: '/agent/saved-responses', label: 'Saved Responses', icon: FiClipboard },
    { to: '/agent/messages', label: 'Messages', icon: FiMessageSquare },
    { to: '/agent/notifications', label: 'Notifications', icon: FiBell },
    { to: '/agent/profile', label: 'Profile', icon: FiUser },
  ],
  client: [
    { to: '/client/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/client/tickets', label: 'My Tickets', icon: FiLifeBuoy },
    { to: '/client/resources', label: 'My Resources', icon: FiBox },
    { to: '/client/messages', label: 'Messages', icon: FiMessageSquare },
    { to: '/client/notifications', label: 'Notifications', icon: FiBell },
    { to: '/client/profile', label: 'Profile', icon: FiUser },
  ],
};
