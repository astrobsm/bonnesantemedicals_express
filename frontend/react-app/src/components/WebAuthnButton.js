import React, { useState } from 'react';

/**
 * WebAuthnButton
 * A ready-to-use React component for biometric authentication using WebAuthn (FIDO2).
 *
 * Props:
 *   onSuccess: function(userId) - called with the userId after successful authentication
 *   userId: number|string - the user's unique ID (from your app's session/auth)
 *   action: 'IN' | 'OUT' - attendance action
 *   onError: function(error) - optional error handler
 *
 * Usage:
 *   <WebAuthnButton userId={user.id} action="IN" onSuccess={handleSuccess} />
 */
const WebAuthnButton = ({ userId, action, onSuccess, onError }) => {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleWebAuthn = async () => {
    setStatus('pending');
    setMessage('Authenticating with biometrics...');
    try {
      // This is a simplified demo. In production, use a library like simplewebauthn.
      // You must have previously registered a credential for this user.
      const publicKey = {
        challenge: Uint8Array.from('random_challenge_string', c => c.charCodeAt(0)),
        timeout: 60000,
        userVerification: 'preferred',
      };
      const assertion = await navigator.credentials.get({ publicKey });
      // If successful, call onSuccess with userId
      setStatus('success');
      setMessage('Biometric authentication successful!');
      if (onSuccess) onSuccess(userId, action);
    } catch (err) {
      setStatus('error');
      setMessage('Biometric authentication failed.');
      if (onError) onError(err);
    }
  };

  return (
    <div>
      <button onClick={handleWebAuthn} disabled={status === 'pending'}>
        {status === 'pending' ? 'Authenticating...' : 'Authenticate with Fingerprint/FaceID'}
      </button>
      {message && <div style={{ marginTop: 8 }}>{message}</div>}
    </div>
  );
};

export default WebAuthnButton;
