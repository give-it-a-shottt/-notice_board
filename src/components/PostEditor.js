import React, { useState, useEffect } from 'react';
import { createPost, editPost } from '../api';

const TEXT = {
  loginRequired: '로그인 후 게시글을 작성할 수 있어요.',
  titleContentRequired: '제목과 내용을 모두 입력해주세요.',
  requestFailed: '요청 실패',
  titlePlaceholder: '제목을 입력해주세요',
  imagePlaceholder: '대표 이미지 URL을 입력해주세요 (선택)',
  previewAlt: '미리보기',
  contentPlaceholder: '내용을 입력해주세요',
  cancel: '취소',
  submit: '게시하기',
  update: '수정하기',
  editTitle: '게시글 수정',
  newTitle: '새 게시글 작성',
};

function PostEditor({ onSave, onCancel, currentUser, editing }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || '');
      setContent(editing.content || editing.body || '');
      setImageUrl(editing.imageUrl || '');
    } else {
      setTitle('');
      setContent('');
      setImageUrl('');
    }
  }, [editing]);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedImageUrl = imageUrl.trim();

    if (!currentUser) {
      alert(TEXT.loginRequired);
      return;
    }
    if (!trimmedTitle || !trimmedContent) {
      alert(TEXT.titleContentRequired);
      return;
    }

    try {
      if (editing) {
        const updated = await editPost(editing._id || editing.id, {
          title: trimmedTitle,
          body: trimmedContent,
          imageUrl: trimmedImageUrl || undefined,
        });
        onSave(updated);
      } else {
        const created = await createPost(
          trimmedTitle,
          trimmedContent,
          trimmedImageUrl || undefined
        );
        onSave(created);
      }
      setTitle('');
      setContent('');
      setImageUrl('');
    } catch (err) {
      alert(err.response?.message || err.message || TEXT.requestFailed);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setImageUrl('');
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="content-card post-editor">
      <h2 className="post-editor__title">
        {editing ? TEXT.editTitle : TEXT.newTitle}
      </h2>
      <input
        className="post-editor__input"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={TEXT.titlePlaceholder}
      />
      <input
        className="post-editor__input"
        value={imageUrl}
        onChange={(event) => setImageUrl(event.target.value)}
        placeholder={TEXT.imagePlaceholder}
      />
      {imageUrl.trim() && (
        <div className="post-editor__preview">
          <img
            src={imageUrl}
            alt={TEXT.previewAlt}
          />
        </div>
      )}
      <textarea
        className="post-editor__textarea"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={TEXT.contentPlaceholder}
        rows={6}
      />
      <div className="post-editor__actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={handleCancel}
        >
          {TEXT.cancel}
        </button>
        <button type="button" onClick={handleSave}>
          {editing ? TEXT.update : TEXT.submit}
        </button>
      </div>
    </div>
  );
}

export default PostEditor;
