import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { Hyperlink, StatefulButton } from '@openedx/paragon';

import Alert from '../Alert';
import { disconnectAuth } from './data/actions';

const GoogleMark = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const ProviderMark = ({ id, name }) => {
  if (id && id.toLowerCase().includes('google')) {
    return <GoogleMark />;
  }

  return (
    <span className="ac-linked-mark-initial" aria-hidden="true">
      {name?.charAt(0)?.toUpperCase()}
    </span>
  );
};

ProviderMark.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
};

ProviderMark.defaultProps = {
  id: undefined,
  name: '',
};

class ThirdPartyAuth extends Component {
  onClickDisconnect = (e) => {
    e.preventDefault();
    const providerId = e.currentTarget.getAttribute('data-provider-id');
    if (this.props.disconnectionStatuses[providerId] === 'pending') {
      return;
    }
    const disconnectUrl = e.currentTarget.getAttribute('data-disconnect-url');
    this.props.disconnectAuth(disconnectUrl, providerId);
  };

  renderProviderBody(name, id, connected) {
    const displayName = name?.charAt(0)?.toUpperCase() + name?.slice(1);

    return (
      <div className="ac-linked">
        <span className="ac-linked-mark">
          <ProviderMark id={id} name={name} />
        </span>
        <span className="ac-linked-copy">
          <h6 className="ac-linked-name" aria-level="3">{displayName}</h6>
          <span className="ac-linked-state">
            {connected ? (
              <FormattedMessage
                id="account.settings.sso.account.linked.as"
                defaultMessage="Linked as {email}"
                description="Status text when a third-party account is linked"
                values={{ email: this.props.userEmail }}
              />
            ) : (
              <FormattedMessage
                id="account.settings.sso.account.not.connected"
                defaultMessage="Not linked"
                description="A status indicating that a third-party account is not linked"
              />
            )}
          </span>
        </span>
      </div>
    );
  }

  renderUnconnectedProvider(url, name, id) {
    return (
      <>
        <div className="ac-row-body">
          {this.renderProviderBody(name, id, false)}
        </div>
        <div className="ac-row-action">
          <Hyperlink destination={url} className="ac-btn ac-btn-ghost">
            <FormattedMessage
              id="account.settings.sso.connect.account"
              defaultMessage="Connect"
              description="Button label to connect a third-party account"
            />
          </Hyperlink>
        </div>
      </>
    );
  }

  renderConnectedProvider(url, name, id) {
    const hasError = this.props.errors[id];

    return (
      <>
        <div className="ac-row-body">
          {this.renderProviderBody(name, id, true)}
          {hasError ? (
            <Alert className="alert-danger ac-modal-error">
              <FormattedMessage
                id="account.settings.sso.account.disconnect.error"
                defaultMessage="There was a problem disconnecting this account. Contact support if the problem persists."
                description="A message displayed when an error occurred while disconnecting a third party account"
              />
            </Alert>
          ) : null}
        </div>
        <div className="ac-row-action">
          <StatefulButton
            className="ac-btn ac-btn-ghost"
            state={this.props.disconnectionStatuses[id]}
            labels={{
              default: (
                <FormattedMessage
                  id="account.settings.sso.disconnect.account"
                  defaultMessage="Disconnect"
                  description="Button label to disconnect a linked third-party account"
                />
              ),
            }}
            onClick={this.onClickDisconnect}
            disabledStates={[]}
            data-disconnect-url={url}
            data-provider-id={id}
          />
        </div>
      </>
    );
  }

  renderProvider({
    name, disconnectUrl, connectUrl, connected, id,
  }) {
    return (
      <div className="form-group ac-row ac-linked-row" key={id}>
        {
          connected
            ? this.renderConnectedProvider(disconnectUrl, name, id)
            : this.renderUnconnectedProvider(connectUrl, name, id)
        }
      </div>
    );
  }

  renderNoProviders() {
    return (
      <FormattedMessage
        id="account.settings.sso.no.providers"
        defaultMessage="No accounts can be linked at this time."
        description="Displayed when no third-party accounts are available for the user to link to their account on the platform."
      />
    );
  }

  render() {
    if (this.props.providers === undefined) {
      return null;
    }

    if (this.props.providers.length === 0) {
      return this.renderNoProviders();
    }

    return this.props.providers.map(this.renderProvider, this);
  }
}

ThirdPartyAuth.propTypes = {
  providers: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    disconnectUrl: PropTypes.string,
    connectUrl: PropTypes.string,
    connected: PropTypes.bool,
    id: PropTypes.string,
  })),
  disconnectionStatuses: PropTypes.objectOf(PropTypes.oneOf([null, 'pending', 'complete', 'error'])),
  errors: PropTypes.objectOf(PropTypes.bool),
  disconnectAuth: PropTypes.func.isRequired,
  userEmail: PropTypes.string,
};

ThirdPartyAuth.defaultProps = {
  providers: undefined,
  disconnectionStatuses: {},
  errors: {},
  userEmail: '',
};

const mapStateToProps = state => state.accountSettings.thirdPartyAuth;

export default connect(
  mapStateToProps,
  {
    disconnectAuth,
  },
)(ThirdPartyAuth);
