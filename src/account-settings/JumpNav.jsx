import { useEffect, useMemo, useState } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { breakpoints, useWindowSize } from '@openedx/paragon';
import classNames from 'classnames';
import { NavHashLink } from 'react-router-hash-link';
import { useSelector } from 'react-redux';
import { selectShowPreferences } from '../notification-preferences/data/selectors';
import jumpNavIcons from './JumpNavIcons';
import messages from './AccountSettingsPage.messages';

const ACTIVE_LINE_RATIO = 0.4;
const HEADER_OFFSET = 64;

const JumpNav = () => {
  const intl = useIntl();
  const { width: windowWidth } = useWindowSize();
  const stickToTop = windowWidth > breakpoints.small.minWidth;
  const showNotifications = useSelector(selectShowPreferences());
  const enableAccountDeletion = getConfig().ENABLE_ACCOUNT_DELETION;
  const links = [
    {
      id: 'basic-information',
      label: intl.formatMessage(messages['account.settings.section.account.information']),
    },
    {
      id: 'profile-information',
      label: intl.formatMessage(messages['account.settings.section.profile.information']),
    },
    {
      id: 'social-media',
      label: intl.formatMessage(messages['account.settings.section.social.media']),
    },
    ...(showNotifications ? [{
      id: 'notifications',
      label: intl.formatMessage(messages['notification.preferences.notifications.label']),
    }] : []),
    {
      id: 'site-preferences',
      label: intl.formatMessage(messages['account.settings.section.site.preferences']),
    },
    {
      id: 'linked-accounts',
      label: intl.formatMessage(messages['account.settings.section.linked.accounts']),
    },
  ];

  if (enableAccountDeletion) {
    links.push({
      id: 'delete-account',
      label: intl.formatMessage(messages['account.settings.jump.nav.delete.account']),
      danger: true,
    });
  }

  const sectionIds = useMemo(() => {
    const ids = links.map(({ id }) => id);
    return ids;
  }, [showNotifications, enableAccountDeletion, intl.locale]);
  const [activeId, setActiveId] = useState(() => sectionIds[0]);

  useEffect(() => {
    const updateActiveSection = () => {
      const line = window.innerHeight * ACTIVE_LINE_RATIO;
      let nextActiveId = sectionIds[0];

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) {
          return;
        }
        const { top, bottom } = el.getBoundingClientRect();
        if (top <= line && bottom > HEADER_OFFSET) {
          nextActiveId = id;
        }
      });

      setActiveId(nextActiveId);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    window.addEventListener('resize', updateActiveSection, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateActiveSection);
      window.removeEventListener('resize', updateActiveSection);
    };
  }, [sectionIds]);

  return (
    <nav
      className={classNames('jump-nav ac-nav', { 'jump-nav-sm position-sticky': stickToTop })}
      aria-label={intl.formatMessage(messages['account.settings.page.heading'])}
    >
      <ul className="list-unstyled ac-nav-list">
        {links.map(({
          id, label, danger,
        }) => {
          const Icon = jumpNavIcons[id];
          return (
            <li
              key={id}
              className={classNames({
                'is-active': activeId === id,
                'ac-nav-item-danger': danger,
              })}
            >
              <NavHashLink to={`#${id}`} className="ac-navlink" smooth>
                {Icon ? <Icon /> : null}
                <span>{label}</span>
              </NavHashLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default JumpNav;
