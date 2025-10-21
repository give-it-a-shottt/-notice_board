import React, { useState } from 'react';
import { register, login } from '../api';
import { setAuth } from '../auth';

const TEXT = {
  login: '로그인',
  signup: '회원가입',
  idPlaceholder: '아이디',
  pwPlaceholder: '비밀번호',
  requireBoth: '아이디와 비밀번호를 모두 입력해주세요.',
  signupDone: '회원가입이 완료되었습니다. 로그인해 주세요.',
  signupFail: '회원가입 실패',
  loginFail: '로그인 실패',
  createAccount: '계정 만들기',
  back: '뒤로가기',
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
