import React, { useState } from 'react';
import { register, login } from '../api';
import { setAuth } from '../auth';

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
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }
    try {
      await register(id, pw);
      alert('회원가입이 완료되었습니다. 로그인해 주세요.');
      resetForm();
      setMode('login');
    } catch (err) {
      setError(err.response?.message || err.message || '회원가입 실패');
    }
  };

  const handleLogin = async () => {
    if (!id || !pw) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }
    try {
      const res = await login(id, pw);
      setAuth({ username: res.user.username, token: res.token });
      onLogin(res.user.username);
      resetForm();
      onClose();
    } catch (err) {
      setError(err.response?.message || err.message || '로그인 실패');
    }
  };

  const closeWithReset = () => {
    resetForm();
    onClose();
  };

  return (
    <div style={styles.backdrop} onClick={closeWithReset}>
      <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
        <h3>{mode === 'login' ? '로그인' : '회원가입'}</h3>
        <input
          placeholder="아이디"
          value={id}
          onChange={(event) => setId(event.target.value)}
        />
        <input
          placeholder="비밀번호"
          type="password"
          value={pw}
          onChange={(event) => setPw(event.target.value)}
        />
        {error && <div style={styles.error}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {mode === 'login' ? (
            <>
              <button onClick={handleLogin}>로그인</button>
              <button
                onClick={() => {
                  resetForm();
                  setMode('signup');
                }}
              >
                회원가입
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSignup}>계정 만들기</button>
              <button
                className="btn-secondary"
                onClick={() => {
                  resetForm();
                  setMode('login');
                }}
              >
                뒤로가기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },
  modal: {
    background: '#fff',
    padding: 20,
    borderRadius: 8,
    minWidth: 320,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  error: {
    color: '#dc2626',
    fontSize: 12,
  },
};

export default AuthModal;
