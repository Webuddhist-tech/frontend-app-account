import { call, put } from 'redux-saga/effects';
import { logError } from '@edx/frontend-platform/logging';
import { fetchAuthenticatedUser, getAuthenticatedUser, setAuthenticatedUser } from '@edx/frontend-platform/auth';

import { handleSaveSettings, handleSaveMultipleSettings } from './sagas';
import { saveMultipleSettingsFailure } from './actions';
import { refreshAuthenticatedUser } from './utils';

jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));

// The mocked auth service ignores its arguments, so these assert that the refresh was requested,
// never that a token was actually minted. End-to-end proof is manual.
const REFRESH_EFFECT = call(refreshAuthenticatedUser);

const drain = (generator, feed) => {
  const effects = [];
  let step = generator.next();
  while (!step.done) {
    effects.push(step.value);
    step = generator.next(feed);
  }
  return effects;
};

const countEffects = (effects, target) => effects.filter(e => JSON.stringify(e) === JSON.stringify(target)).length;

describe('handleSaveSettings', () => {
  const buildAction = (formId, commitValues, extendedProfile = {}) => ({
    payload: { formId, commitValues, extendedProfile },
  });

  it('refreshes the authenticated user when the name changed', () => {
    const effects = drain(handleSaveSettings(buildAction('name', 'New Name')), { name: 'New Name' });

    expect(effects).toContainEqual(REFRESH_EFFECT);
  });

  it('does not refresh when an unrelated field changed', () => {
    const effects = drain(handleSaveSettings(buildAction('country', 'US')), { country: 'US' });

    expect(effects).not.toContainEqual(REFRESH_EFFECT);
  });

  it('does not refresh when extendedProfile replaces commitData', () => {
    const extendedProfile = { extended_profile: [{ field_name: 'occupation', field_value: 'dev' }] };
    const effects = drain(handleSaveSettings(buildAction('name', 'New Name', extendedProfile)), {});

    expect(effects).not.toContainEqual(REFRESH_EFFECT);
  });

  it('refreshes only after the form has closed', () => {
    const effects = drain(handleSaveSettings(buildAction('name', 'New Name')), { name: 'New Name' });
    const refreshIndex = effects.findIndex(e => JSON.stringify(e) === JSON.stringify(REFRESH_EFFECT));

    expect(refreshIndex).toBe(effects.length - 1);
  });

  // No test here for "a refresh failure doesn't cause a false save failure": refreshAuthenticatedUser
  // never rethrows (see its own describe block below), so the `call(refreshAuthenticatedUser)` effect
  // can never reject from this saga's perspective — there's nothing for this saga's catch block to
  // receive. That guarantee belongs to, and is fully covered by, refreshAuthenticatedUser's own tests.
});

describe('handleSaveMultipleSettings', () => {
  const buildAction = settingsArray => ({ payload: { settingsArray, form: 'name' } });

  it('refreshes exactly once when name is among the saved settings', () => {
    const effects = drain(handleSaveMultipleSettings(buildAction([
      { formId: 'name', commitValues: 'New Name' },
      { formId: 'useVerifiedNameForCerts', commitValues: true },
    ])), {});

    expect(countEffects(effects, REFRESH_EFFECT)).toBe(1);
  });

  it('does not refresh when name is not among the saved settings', () => {
    const effects = drain(handleSaveMultipleSettings(buildAction([
      { formId: 'useVerifiedNameForCerts', commitValues: true },
    ])), {});

    expect(effects).not.toContainEqual(REFRESH_EFFECT);
    expect(effects).not.toContainEqual(saveMultipleSettingsFailure('should not happen'));
  });

  it('refreshes after the name patch succeeds even when a later item in the batch fails', () => {
    // Regression test: the refresh used to run only after the whole batch succeeded, so a name
    // patch that landed followed by a failing sibling patch (e.g. useVerifiedNameForCerts) meant
    // the JWT never refreshed despite the name having actually changed server-side.
    const generator = handleSaveMultipleSettings(buildAction([
      { formId: 'name', commitValues: 'New Name' },
      { formId: 'useVerifiedNameForCerts', commitValues: true },
    ]));
    const effects = [];

    effects.push(generator.next().value); // saveMultipleSettingsBegin
    effects.push(generator.next().value); // saveSettingsBegin (name)
    effects.push(generator.next().value); // call(patchSettings) for name
    effects.push(generator.next({}).value); // saveSettingsSuccess (name)
    effects.push(generator.next().value); // call(refreshAuthenticatedUser) — fires immediately
    effects.push(generator.next().value); // saveSettingsBegin (useVerifiedNameForCerts)
    effects.push(generator.next().value); // call(patchSettings) for useVerifiedNameForCerts

    const failureStep = generator.throw(new Error('cert save failed'));

    expect(effects).toContainEqual(REFRESH_EFFECT);
    expect(failureStep.value).toEqual(put(saveMultipleSettingsFailure('cert save failed')));
  });
});

describe('refreshAuthenticatedUser', () => {
  beforeEach(() => {
    logError.mockClear();
  });

  it('restores fields dropped by the forced refresh, without a second network call', () => {
    const previousUser = getAuthenticatedUser();
    const generator = refreshAuthenticatedUser();

    expect(generator.next().value).toEqual(call(fetchAuthenticatedUser, { forceRefresh: true }));
    expect(generator.next().value).toEqual(
      call(setAuthenticatedUser, { ...previousUser, ...getAuthenticatedUser() }),
    );
    expect(generator.next().done).toBe(true);
  });

  it('swallows and logs a failed refresh instead of rethrowing', () => {
    const generator = refreshAuthenticatedUser();
    generator.next();

    expect(generator.throw(new Error('refresh failed')).done).toBe(true);
    expect(logError).toHaveBeenCalledWith(expect.any(Error));
  });
});
