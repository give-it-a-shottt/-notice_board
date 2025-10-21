import React, { useState } from 'react';
import { register, login } from '../api';
import { setAuth } from '../auth';

const TEXT = {
  login: '\ub85c\uadf8\uc778',
  signup: '\ud68c\uc6d0\uac00\uc785',
  idPlaceholder: '\uc544\uc774\ub514',
  pwPlaceholder: '\ube44\ubc00\ubc88\ud638',
  requireBoth:
    '\uc544\uc774\ub514\uc640\u0020\ube44\ubc00\ubc88\ud638\ub97c\u0020\ubaa8\ub450\u0020\uc785\ub825\ud574\uc8fc\uc138\uc694\u002e',
  signupDone:
    '\ud68c\uc6d0\uac00\uc785\uc774\u0020\uc644\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4\u002e\u0020\ub85c\uadf8\uc778\ud574\u0020\uc8fc\uc138\uc694\u002e',
  signupFail: '\ud68c\uc6d0\uac00\uc785\u0020\uc2e4\ud328',
  loginFail: '\ub85c\uadf8\uc778\u0020\uc2e4\ud328',
  createAccount: '\uacc4\uc815\u0020\ub9cc\ub4e4\uae30',
  back: '\ub4a4\ub85c\uac00\uae30',
};

function AuthModal({ open, onClose, onLogin }) {
  const [mode, setMode] = useState('login');
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const resetForm = () => {
    setId('');
    setPw('');
    setError('');
  };

  const handleSignup = async () => {
    if (!id || !pw) {
      setError(TEXT.requireBoth);
      return;
    }
    try {
      await register(id, pw);
      alert(TEXT.signupDone);
      resetForm();
      setMode('login');
    } catch (err) {
      setError(err.response?.message || err.message || TEXT.signupFail);
    }
  };

  const handleLogin = async () => {
    if (!id || !pw) {
      setError(TEXT.requireBoth);
      return;
    }
    try {
      const res = await login(id, pw);
      setAuth({ username: res.user.username, token: res.token });
      onLogin(res.user.username);
      resetForm();
      onClose();
    } catch (err) {
      setError(err.response?.message || err.message || TEXT.loginFail);
    }
  };

  const closeWithReset = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="auth-modal" onClick={closeWithReset}>
      <div
        className="auth-modal__dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="auth-modal__title">
          {mode === 'login' ? TEXT.login : TEXT.signup}
        </h3>
        <input
          className="auth-modal__input"
          placeholder={TEXT.idPlaceholder}
          value={id}
          onChange={(event) => setId(event.target.value)}
        />
        <input
          className="auth-modal__input"
          placeholder={TEXT.pwPlaceholder}
          type="password"
          value={pw}
          onChange={(event) => setPw(event.target.value)}
        />
        {error && <div className="auth-modal__error">{error}</div>}

        <div className="auth-modal__actions">
          {mode === 'login' ? (
            <>
              <button type="button" onClick={handleLogin}>
                {TEXT.login}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMode('signup');
                }}
              >
                {TEXT.signup}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={handleSignup}>
                {TEXT.createAccount}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  resetForm();
                  setMode('login');
                }}
              >
                {TEXT.back}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
