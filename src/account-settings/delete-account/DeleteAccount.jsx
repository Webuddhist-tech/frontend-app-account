import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';

// Actions
import {
  deleteAccount,
  deleteAccountConfirmation,
  deleteAccountFailure,
  deleteAccountReset,
  deleteAccountCancel,
} from './data/actions';

// Messages
import messages from './messages';

// Components
import ConnectedConfirmationModal from './ConfirmationModal';
import ConnectedSuccessModal from './SuccessModal';
import BeforeProceedingBanner from './BeforeProceedingBanner';

export class DeleteAccount extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      password: '',
    };
  }

  handleSubmit = () => {
    if (this.state.password === '') {
      this.props.deleteAccountFailure('empty-password');
    } else {
      this.props.deleteAccount(this.state.password);
    }
  };

  handleCancel = () => {
    this.setState({ password: '' });
    this.props.deleteAccountCancel();
  };

  handlePasswordChange = (e) => {
    this.setState({ password: e.target.value.trim() });
    this.props.deleteAccountReset();
  };

  handleFinalClose = () => {
    global.location = getConfig().LOGOUT_URL;
  };

  render() {
    const {
      hasLinkedTPA, isVerifiedAccount, status, errorType, intl,
    } = this.props;
    const canDelete = isVerifiedAccount && !hasLinkedTPA;
    const supportArticleUrl = process.env.SUPPORT_URL_TO_UNLINK_SOCIAL_MEDIA_ACCOUNT;

    // TODO: We lack a good way of providing custom language for a particular site.  This is a hack
    // to allow edx.org to fulfill its business requirements.
    const deleteAccountText2MessageKey = getConfig().SITE_NAME === 'edX'
      ? 'account.settings.delete.account.text.2.edX'
      : 'account.settings.delete.account.text.2';

    const optInInstructionMessageId = getConfig().MARKETING_EMAILS_OPT_IN
      ? 'account.settings.delete.account.please.confirm'
      : 'account.settings.delete.account.please.activate';

    return (
      <div className="ac-delete-content">
        <div className="ac-card-head">
          <h2 className="section-heading ac-h2">
            {intl.formatMessage(messages['account.settings.delete.account.header'])}
          </h2>
          <p className="ac-card-note">
            {intl.formatMessage(messages['account.settings.delete.account.subheader'])}
          </p>
        </div>
        {
          this.props.canDeleteAccount ? (
            <div className="ac-delete-body">
              <p className="ac-help ac-delete-intro">
                {intl.formatMessage(
                  messages[deleteAccountText2MessageKey],
                  { siteName: getConfig().SITE_NAME },
                )}
              </p>
              <p className="ac-help">
                {intl.formatMessage(messages['account.settings.delete.account.text.3'])}
              </p>
              <p className="ac-delete-warning">
                {intl.formatMessage(
                  messages['account.settings.delete.account.text.warning'],
                  { siteName: getConfig().SITE_NAME },
                )}
              </p>
              <div className="ac-row-action ac-delete-action">
                <Button
                  variant="danger"
                  className="ac-btn-danger"
                  onClick={canDelete ? this.props.deleteAccountConfirmation : null}
                  disabled={!canDelete}
                >
                  {intl.formatMessage(messages['account.settings.delete.account.button'])}
                </Button>
              </div>
              {isVerifiedAccount ? null : (
                <BeforeProceedingBanner
                  instructionMessageId={optInInstructionMessageId}
                  supportArticleUrl="https://support.edx.org/hc/en-us/articles/115000940568-How-do-I-confirm-my-email"
                />
              )}
              {hasLinkedTPA ? (
                <BeforeProceedingBanner
                  instructionMessageId="account.settings.delete.account.please.unlink"
                  supportArticleUrl={supportArticleUrl}
                />
              ) : null}

              <ConnectedConfirmationModal
                status={status}
                errorType={errorType}
                onSubmit={this.handleSubmit}
                onCancel={this.handleCancel}
                onChange={this.handlePasswordChange}
                password={this.state.password}
              />

              <ConnectedSuccessModal status={status} onClose={this.handleFinalClose} />
            </div>
          ) : (
            <p className="ac-delete-body">{intl.formatMessage(messages['account.settings.cannot.delete.account.text'])}</p>
          )
        }

      </div>
    );
  }
}

DeleteAccount.propTypes = {
  deleteAccount: PropTypes.func.isRequired,
  deleteAccountConfirmation: PropTypes.func.isRequired,
  deleteAccountFailure: PropTypes.func.isRequired,
  deleteAccountReset: PropTypes.func.isRequired,
  deleteAccountCancel: PropTypes.func.isRequired,
  status: PropTypes.oneOf(['confirming', 'pending', 'deleted', 'failed']),
  errorType: PropTypes.oneOf(['empty-password', 'server']),
  hasLinkedTPA: PropTypes.bool,
  isVerifiedAccount: PropTypes.bool,
  canDeleteAccount: PropTypes.bool,
  intl: intlShape.isRequired,
};

DeleteAccount.defaultProps = {
  hasLinkedTPA: false,
  isVerifiedAccount: true,
  status: null,
  errorType: null,
  canDeleteAccount: true,
};

// Assume we're part of the accountSettings state.
const mapStateToProps = state => state.accountSettings.deleteAccount;

export default connect(
  mapStateToProps,
  {
    deleteAccount,
    deleteAccountConfirmation,
    deleteAccountFailure,
    deleteAccountReset,
    deleteAccountCancel,
  },
)(injectIntl(DeleteAccount));
