import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button, Form, StatefulButton, Hyperlink,
} from '@openedx/paragon';
import LockIcon from './icons/LockIcon';

import SwitchContent from './SwitchContent';
import messages from './AccountSettingsPage.messages';
import FieldActionButton from './FieldActionButton';

import {
  openForm,
  closeForm,
} from './data/actions';
import { editableFieldSelector } from './data/selectors';
import CertificatePreference from './certificate-preference/CertificatePreference';

const HTTP_URL_PATTERN = /^https?:\/\//i;

const EditableField = (props) => {
  const {
    name,
    label,
    emptyLabel,
    type,
    value,
    userSuppliedValue,
    saveState,
    error,
    confirmationMessageDefinition,
    confirmationValue,
    helpText,
    onEdit,
    onCancel,
    onSubmit,
    onChange,
    isEditing,
    isEditable,
    isGrayedOut,
    ...others
  } = props;
  const id = `field-${name}`;
  const intl = useIntl();

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(name, new FormData(e.target).get(name));
  };

  const handleChange = (e) => {
    onChange(name, e.target.value);
  };

  const handleEdit = () => {
    onEdit(name);
  };

  const handleCancel = () => {
    onCancel(name);
  };

  const actionLabelMessageKey = value
    ? 'account.settings.editable.field.action.edit'
    : 'account.settings.editable.field.action.add';
  const actionVariant = value ? 'edit' : 'add';

  const renderEmptyLabel = () => (
    <span className="ac-empty">{emptyLabel}</span>
  );

  const renderValue = (rawValue) => {
    if (!rawValue) {
      return renderEmptyLabel();
    }
    let finalValue = rawValue;

    if (userSuppliedValue) {
      finalValue += `: ${userSuppliedValue}`;
    }

    if (name.startsWith('social_link_') && HTTP_URL_PATTERN.test(String(rawValue))) {
      return (
        <Hyperlink
          destination={rawValue}
          target="_blank"
          rel="noopener noreferrer"
          showLaunchIcon={false}
        >
          {finalValue}
        </Hyperlink>
      );
    }

    return finalValue;
  };

  const renderConfirmationMessage = () => {
    if (!confirmationMessageDefinition || !confirmationValue) {
      return null;
    }
    return (
      <span data-testid="editable-field-confirmation">
        {intl.formatMessage(confirmationMessageDefinition, {
          value: confirmationValue,
        })}
      </span>
    );
  };

  return (
    <SwitchContent
      expression={isEditing ? 'editing' : 'default'}
      cases={{
        editing: (
          <div className="ac-row ac-row-editing">
            <form className="ac-row-body ac-form" onSubmit={handleSubmit} data-testid="editable-field-form">
              <Form.Group
                controlId={id}
                isInvalid={error != null}
              >
                <Form.Label size="sm" className="ac-label d-block" htmlFor={id}>{label}</Form.Label>
                <Form.Control
                  data-hj-suppress
                  name={name}
                  id={id}
                  type={type}
                  value={value}
                  onChange={handleChange}
                  data-testid="editable-field-textbox"
                  {...others}
                />
                {!!helpText && <Form.Text>{helpText}</Form.Text>}
                {error != null && <Form.Control.Feedback hasIcon={false} data-testid="editable-field-error">{error}</Form.Control.Feedback>}
                {others.children}
              </Form.Group>
              <div className="ac-form-actions">
                <StatefulButton
                  type="submit"
                  className="mr-2"
                  state={saveState}
                  labels={{
                    default: intl.formatMessage(messages['account.settings.editable.field.action.save']),
                  }}
                  onClick={(e) => {
                    // Swallow clicks if the state is pending.
                    // We do this instead of disabling the button to prevent
                    // it from losing focus (disabled elements cannot have focus).
                    // Disabling it would causes upstream issues in focus management.
                    // Swallowing the onSubmit event on the form would be better, but
                    // we would have to add that logic for every field given our
                    // current structure of the application.
                    if (saveState === 'pending') { e.preventDefault(); }
                  }}
                  disabledStates={[]}
                  data-testid="editable-field-save"
                />
                <Button
                  variant="outline-primary"
                  onClick={handleCancel}
                  data-testid="editable-field-cancel"
                  data-clicked="cancel"
                >
                  {intl.formatMessage(messages['account.settings.editable.field.action.cancel'])}
                </Button>
              </div>
            </form>
            {['name', 'verified_name'].includes(name) && (
              <CertificatePreference fieldName={name} data-testid="editable-field-certificate-preference" />
            )}
          </div>
        ),
        default: (
          <div className="form-group ac-row">
            <div className="ac-row-body">
              <h6 className="ac-label" aria-level="3">{label}</h6>
              <p data-hj-suppress className={classNames('ac-value', { 'grayed-out': isGrayedOut, 'ac-empty': !value })}>{renderValue(value)}</p>
              <p className="ac-help">{renderConfirmationMessage() || helpText}</p>
            </div>
            <div className="ac-row-action">
              {isEditable ? (
                <FieldActionButton
                  label={intl.formatMessage(messages[actionLabelMessageKey])}
                  onClick={handleEdit}
                  testId="editable-field-edit"
                  clicked={actionVariant}
                  variant={actionVariant}
                />
              ) : null}
              {!isEditable && name === 'username' ? (
                <span className="ac-lock">
                  <LockIcon />
                  {intl.formatMessage(messages['account.settings.field.permanent'])}
                </span>
              ) : null}
            </div>
          </div>
        ),
      }}
    />
  );
};

EditableField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]),
  emptyLabel: PropTypes.node,
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  userSuppliedValue: PropTypes.string,
  saveState: PropTypes.oneOf(['default', 'pending', 'complete', 'error']),
  error: PropTypes.string,
  confirmationMessageDefinition: PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string.isRequired,
    description: PropTypes.string,
  }),
  confirmationValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  helpText: PropTypes.node,
  onEdit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  isEditable: PropTypes.bool,
  isGrayedOut: PropTypes.bool,
};

EditableField.defaultProps = {
  value: undefined,
  saveState: undefined,
  label: undefined,
  emptyLabel: undefined,
  error: undefined,
  confirmationMessageDefinition: undefined,
  confirmationValue: undefined,
  helpText: undefined,
  isEditing: false,
  isEditable: true,
  isGrayedOut: false,
  userSuppliedValue: undefined,
};

export default connect(editableFieldSelector, {
  onEdit: openForm,
  onCancel: closeForm,
})(EditableField);
