import React from 'react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const RequestInProgressAlert = () => (
  <div className="ac-reset-note">
    <FontAwesomeIcon className="ac-reset-note-icon" icon={faExclamationTriangle} aria-hidden="true" />
    <p>
      <FormattedMessage
        id="account.settings.editable.field.password.reset.button.forbidden"
        defaultMessage="Your previous request is in progress, please try again in few moments."
        description="A message displayed when a previous password reset request is still in progress."
      />
    </p>
  </div>
);

export default RequestInProgressAlert;
