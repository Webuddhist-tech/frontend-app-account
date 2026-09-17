import { call, put } from 'redux-saga/effects';
import { logError } from '@edx/frontend-platform/logging';
import { fetchAuthenticatedUser, getAuthenticatedUser, setAuthenticatedUser } from '@edx/frontend-platform/auth';

// Other MFEs read `name` from the JWT claims rather than from an API, so re-minting the shared
// JWT cookie is the only way a name change reaches them without a re-login. `forceRefresh` is a
// real but undocumented option (AxiosJwtAuthService.js:266-268) — re-check it when upgrading
// @edx/frontend-platform.
export function* refreshAuthenticatedUser() {
  try {
    const previousUser = getAuthenticatedUser();
    yield call(fetchAuthenticatedUser, { forceRefresh: true });
    // fetchAuthenticatedUser replaces the user with JWT claims only, dropping fields this app
    // loads separately (e.g. profileImage). Restore them from the pre-refresh snapshot instead of
    // a second network round trip, and publish so the header re-renders with the new name.
    yield call(setAuthenticatedUser, { ...previousUser, ...getAuthenticatedUser() });
  } catch (e) {
    // Never rethrow: handleSaveSettings' catch would report a false save failure and rethrow,
    // escaping takeEvery and tearing down the root saga.
    logError(e);
  }
}

export default function* handleFailure(error, navigate, failureAction = null, failureRedirectPath = null) {
  if (error.fieldErrors && failureAction !== null) {
    yield put(failureAction({ fieldErrors: error.fieldErrors }));
  }
  logError(error);
  if (failureAction !== null) {
    yield put(failureAction(error.message));
  }
  if (failureRedirectPath !== null) {
    navigate(failureRedirectPath);
  }
}
