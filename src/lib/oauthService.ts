// Single Sign-On (SSO) Service for Google & LinkedIn Authentication
// Directly integrates with Google Identity Services (GSI) and LinkedIn OAuth

export interface OAuthUserProfile {
  provider: 'google' | 'linkedin';
  email: string;
  name: string;
  avatar?: string;
}

let cachedGoogleClientId: string | null = null;

export async function getGoogleClientId(): Promise<string> {
  if (cachedGoogleClientId) return cachedGoogleClientId;
  try {
    const res = await fetch('/api/auth/config');
    const data = await res.json();
    if (data.googleClientId) {
      cachedGoogleClientId = data.googleClientId;
      return data.googleClientId;
    }
  } catch (err) {
    console.warn('Could not fetch Google Client ID from server:', err);
  }
  return '332719444113-cb5v2neff6vceuj39bsafb4iq1rr5e82.apps.googleusercontent.com';
}

export async function ensureGoogleGsiLoaded(): Promise<boolean> {
  if ((window as any).google?.accounts?.oauth2?.initTokenClient) {
    return true;
  }
  return new Promise((resolve) => {
    let script = document.querySelector('script[src*="accounts.google.com/gsi/client"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if ((window as any).google?.accounts?.oauth2?.initTokenClient) {
        clearInterval(interval);
        resolve(true);
      } else if (attempts >= 25) {
        clearInterval(interval);
        resolve(Boolean((window as any).google?.accounts?.oauth2?.initTokenClient));
      }
    }, 100);
  });
}

/**
 * Initiates direct Google Single Sign-On using Google Identity Services (GIS/GSI).
 * Automatically extracts the user's name, email, and avatar from Google and registers/logs in the user.
 */
export async function triggerGoogleSSO({
  onSuccess,
  onError,
  onStart,
}: {
  onStart?: () => void;
  onSuccess: (user: any) => void;
  onError: (errorMsg: string) => void;
}): Promise<void> {
  if (onStart) onStart();

  const clientId = await getGoogleClientId();
  await ensureGoogleGsiLoaded();

  // Check if Google GSI SDK is loaded on window
  const google = (window as any).google;
  if (google?.accounts?.oauth2?.initTokenClient) {
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        prompt: 'select_account',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.warn('Google SSO token notice:', tokenResponse);
            onError(tokenResponse.error_description || 'Google sign-in was cancelled or closed.');
            return;
          }

          if (tokenResponse.access_token) {
            try {
              // Fetch the authenticated user's profile directly from Google API
              const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const profile = await userinfoRes.json();

              if (!profile.email) {
                onError('Google account did not return a verified email address.');
                return;
              }

              // Register/Login automatically in Locora AI backend
              const authRes = await fetch('/api/auth/social', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  provider: 'google',
                  email: profile.email,
                  name: profile.name || profile.given_name || profile.email.split('@')[0],
                  avatar: profile.picture,
                }),
              });

              const authData = await authRes.json();
              if (authRes.ok && authData.user) {
                onSuccess(authData.user);
              } else {
                onError(authData.error || 'Failed to authenticate user workspace.');
              }
            } catch (fetchErr: any) {
              console.error('Google profile fetch error:', fetchErr);
              onError('Could not retrieve user info from Google. Please try again.');
            }
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
      return;
    } catch (gsiErr: any) {
      console.warn('GSI client init error, falling back to popup:', gsiErr);
    }
  }

  // Fallback: Launch standard Google OAuth popup window
  try {
    const redirectUri = `${window.location.origin}/auth/callback`;
    const res = await fetch(`/api/auth/oauth/url?provider=google&redirectUri=${encodeURIComponent(redirectUri)}`);
    const data = await res.json();
    if (data.url) {
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      const popup = window.open(
        data.url,
        'oauth_google_sso',
        `width=${width},height=${height},left=${left},top=${top},status=yes,scrollbars=yes`
      );

      // Listen for message from callback popup
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.user) {
          window.removeEventListener('message', handleMessage);
          if (popup && !popup.closed) popup.close();
          onSuccess(event.data.user);
        }
      };
      window.addEventListener('message', handleMessage);
    } else {
      onError('Unable to initiate Google sign-in.');
    }
  } catch (err: any) {
    console.error('Google SSO launch error:', err);
    onError(err.message || 'Could not start Google sign-in.');
  }
}

/**
 * Initiates direct LinkedIn Single Sign-On.
 */
export async function triggerLinkedInSSO({
  onSuccess,
  onError,
  onStart,
}: {
  onStart?: () => void;
  onSuccess: (user: any) => void;
  onError: (errorMsg: string) => void;
}): Promise<void> {
  if (onStart) onStart();

  try {
    const redirectUri = `${window.location.origin}/auth/callback`;
    const res = await fetch(`/api/auth/oauth/url?provider=linkedin&redirectUri=${encodeURIComponent(redirectUri)}`);
    const data = await res.json();
    if (data.url) {
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      const popup = window.open(
        data.url,
        'oauth_linkedin_sso',
        `width=${width},height=${height},left=${left},top=${top},status=yes,scrollbars=yes`
      );

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.user) {
          window.removeEventListener('message', handleMessage);
          if (popup && !popup.closed) popup.close();
          onSuccess(event.data.user);
        }
      };
      window.addEventListener('message', handleMessage);
    } else {
      onError('Unable to initiate LinkedIn sign-in.');
    }
  } catch (err: any) {
    console.error('LinkedIn SSO launch error:', err);
    onError(err.message || 'Could not start LinkedIn sign-in.');
  }
}

/**
 * Initiates Google Analytics 4 (GA4) OAuth connection flow.
 * Obtains token for analytics.readonly and webmasters.readonly and syncs property with Locora database.
 */
export async function triggerGoogleAnalyticsOAuth({
  userEmail,
  onStart,
  onSuccess,
  onError,
}: {
  userEmail: string;
  onStart?: () => void;
  onSuccess: (ga4Data: any) => void;
  onError: (errorMsg: string) => void;
}): Promise<void> {
  if (onStart) onStart();

  const clientId = await getGoogleClientId();
  await ensureGoogleGsiLoaded();

  const google = (window as any).google;
  if (google?.accounts?.oauth2?.initTokenClient) {
    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly',
        prompt: 'consent',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.warn('GA4 OAuth token notice:', tokenResponse);
            onError(tokenResponse.error_description || 'Google Analytics connection was cancelled.');
            return;
          }

          if (tokenResponse.access_token) {
            try {
              const res = await fetch('/api/analytics/ga4/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: userEmail,
                  accessToken: tokenResponse.access_token,
                }),
              });
              const data = await res.json();
              if (res.ok && data.success) {
                onSuccess(data);
              } else {
                onError(data.error || 'Failed to link Google Analytics 4 property.');
              }
            } catch (err: any) {
              console.error('GA4 link server error:', err);
              onError(err.message || 'Could not complete GA4 connection on server.');
            }
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
      return;
    } catch (gsiErr: any) {
      console.warn('GSI client init error for GA4, falling back to direct link:', gsiErr);
    }
  }

  // Direct connection fallback
  try {
    const res = await fetch('/api/analytics/ga4/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        isDirectConnect: true,
      }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      onSuccess(data);
    } else {
      onError(data.error || 'Failed to connect Google Analytics 4.');
    }
  } catch (err: any) {
    onError(err.message || 'Connection to GA4 service failed.');
  }
}

