import React from 'react';
import NotificationNavIcon from './icons/NotificationNavIcon';

const navIconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

// Matches the profile icon in the LMS/MFE header user dropdown (user_dropdown.html).
export const AccountInformationIcon = () => (
  <svg {...navIconProps}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const ProfileInformationIcon = () => (
  <svg {...navIconProps}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="7" y1="9" x2="13" y2="9" />
    <line x1="7" y1="14" x2="17" y2="14" />
  </svg>
);

export const SocialMediaIcon = () => (
  <svg {...navIconProps}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.6" y1="10.6" x2="15.4" y2="6.4" />
    <line x1="8.6" y1="13.4" x2="15.4" y2="17.6" />
  </svg>
);

// svgrepo notification-12 (stroke outline).
export const NotificationsIcon = () => (
  <NotificationNavIcon />
);

export const SitePreferencesIcon = () => (
  <svg {...navIconProps}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h10M18 18h2" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="16" cy="18" r="2" />
  </svg>
);

// svgrepo link-chain (3 segments: two hooks + center bar).
export const LinkedAccountsIcon = () => (
  <svg
    {...navIconProps}
    viewBox="-2 -2 28 28"
    strokeWidth={2.2}
  >
    <path d="M10.57 5.8l2.71-2.72a5.4 5.4 0 0 1 7.64 7.64L18.2 13.43" />
    <path d="M5.8 10.57L3.08 13.28a5.4 5.4 0 0 0 7.64 7.64l2.71-2.72" />
    <line x1="16.77" y1="7.23" x2="7.23" y2="16.77" />
  </svg>
);

// Stroke outline of Paragon Delete / DeleteOutline (trash bin for account deletion).
export const DeleteAccountIcon = () => (
  <svg {...navIconProps}>
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

export default {
  'basic-information': AccountInformationIcon,
  'profile-information': ProfileInformationIcon,
  'social-media': SocialMediaIcon,
  notifications: NotificationsIcon,
  'site-preferences': SitePreferencesIcon,
  'linked-accounts': LinkedAccountsIcon,
  'delete-account': DeleteAccountIcon,
};
