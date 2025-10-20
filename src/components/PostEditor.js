import React, { useState, useEffect } from 'react';
import { createPost, editPost } from '../api';

function PostEditor({ onSave, onCancel, currentUser, editing }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || '');
      setContent(editing.content || editing.body || '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [editing]);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!currentUser) {
      alert('로그인 후 게시글을 작성할 수 있습니다.');
      return;
    }
    if (!trimmedTitle || !trimmedContent) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      if (editing) {
        const updated = await editPost(editing._id || editing.id, {
          title: trimmedTitle,
          body: trimmedContent,
        });
        onSave(updated);
      } else {
        const created = await createPost(trimmedTitle, trimmedContent);
        onSave(created);
      }
      setTitle('');
      setContent('');
    } catch (err) {
      alert(err.response?.message || err.message || '요청 실패');
    }
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="content-card" style={{ marginBottom: 24 }}>
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>
        {editing ? '게시글 수정' : '새 게시글 작성'}
      </h2>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="제목을 입력하세요"
        style={{ width: '100%', marginBottom: 8 }}
      />
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="내용을 입력하세요"
        rows={6}
        style={{ width: '100%' }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 12,
          gap: 8,
        }}
      >
        <button className="btn-secondary" onClick={handleCancel}>
          취소
        </button>
        <button onClick={handleSave}>
          {editing ? '수정하기' : '게시하기'}
        </button>
      </div>
    </div>
  );
}

export default PostEditor;
