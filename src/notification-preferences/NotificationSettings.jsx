import React from 'react';
import { useSelector } from 'react-redux';

import { useIntl } from '@edx/frontend-platform/i18n';
import { Container, Hyperlink } from '@openedx/paragon';

import { selectShowPreferences } from './data/selectors';
import messages from './messages';
import NotificationPreferences from './NotificationPreferences';
import { useFeedbackWrapper } from '../hooks';

const NotificationSettings = () => {
  useFeedbackWrapper();
  const intl = useIntl();
  const showPreferences = useSelector(selectShowPreferences());

  return (
    showPreferences && (
      <Container className="notification-preferences ac-card px-0">
        <div className="ac-card-head">
          <h2 className="notification-heading ac-h2">
            {intl.formatMessage(messages.notificationHeading)}
          </h2>
          <div className="ac-card-note">
            {intl.formatMessage(messages.notificationCadenceDescription, {
              dailyTime: '22:00 UTC', weeklyTime: '22:00 UTC',
            })}
          </div>
          <div className="ac-card-note">
            {intl.formatMessage(messages.notificationPreferenceGuideBody)}
            <Hyperlink
              destination="https://edx.readthedocs.io/projects/open-edx-learner-guide/en/latest/sfd_notifications/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1"
            >
              {intl.formatMessage(messages.notificationPreferenceGuideLink)}
            </Hyperlink>
          </div>
        </div>
        <div className="ac-notification-body">
          <NotificationPreferences />
        </div>
      </Container>
    )
  );
};

export default NotificationSettings;
