import PropTypes from 'prop-types';
import AddIcon from './icons/AddIcon';
import EditIcon from './icons/EditIcon';

const FieldActionButton = ({
  label, onClick, testId, clicked, variant,
}) => (
  <button
    type="button"
    className="ac-btn ac-btn-ghost ac-edit"
    onClick={onClick}
    data-testid={testId}
    data-clicked={clicked}
  >
    {variant === 'add' ? <AddIcon /> : <EditIcon />}
    {label}
  </button>
);

FieldActionButton.propTypes = {
  label: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  testId: PropTypes.string,
  clicked: PropTypes.string,
  variant: PropTypes.oneOf(['add', 'edit']),
};

FieldActionButton.defaultProps = {
  testId: undefined,
  clicked: undefined,
  variant: 'edit',
};

export default FieldActionButton;
