import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { StatefulButton } from '@openedx/paragon';

import { resetPassword } from './data/actions';
import messages from './messages';
import ConfirmationAlert from './ConfirmationAlert';
import RequestInProgressAlert from './RequestInProgressAlert';

const ResetPassword = (props) => {
  const { email, status } = props;
  const intl = useIntl();

  const showPasswordActions = status !== 'complete' && status !== 'forbidden';

  return (
    <div className="form-group ac-row ac-password-row">
      <div className="ac-row-body">
        <h6 className="ac-label" aria-level="3">
          <FormattedMessage
            id="account.settings.editable.field.password.reset.label"
            defaultMessage="Password"
            description="The password label in account settings"
          />
        </h6>
        {showPasswordActions ? (
          <StatefulButton
            variant="primary"
            className="ac-btn ac-btn-primary"
            state={status}
            onClick={(e) => {
              // Swallow clicks if the state is pending.
              // We do this instead of disabling the button to prevent
              // it from losing focus (disabled elements cannot have focus).
              // Disabling it would causes upstream issues in focus management.
              // Swallowing the onSubmit event on the form would be better, but
              // we would have to add that logic for every field given our
              // current structure of the application.
              if (status === 'pending') {
                e.preventDefault();
              }
              props.resetPassword(email);
            }}
            disabledStates={[]}
            labels={{
              default: intl.formatMessage(messages['account.settings.editable.field.password.reset.button']),
            }}
          />
        ) : null}
        {showPasswordActions ? (
          <p className="ac-help">
            {intl.formatMessage(messages['account.settings.editable.field.password.reset.help'])}
          </p>
        ) : null}
        {status === 'complete' ? <ConfirmationAlert email={email} /> : null}
        {status === 'forbidden' ? <RequestInProgressAlert /> : null}
      </div>
    </div>
  );
};

ResetPassword.propTypes = {
  email: PropTypes.string,
  resetPassword: PropTypes.func.isRequired,
  status: PropTypes.string,
};

ResetPassword.defaultProps = {
  email: '',
  status: null,
};

const mapStateToProps = state => state.accountSettings.resetPassword;

export default connect(
  mapStateToProps,
  {
    resetPassword,
  },
)(ResetPassword);
