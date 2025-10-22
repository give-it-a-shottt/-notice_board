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
  categoryLabel: '카테고리',
  categoryPlaceholder: '카테고리를 선택해주세요 (선택)',
};

const CATEGORY_OPTIONS = [
  { value: 'game', label: '게임' },
  { value: 'study', label: '공부' },
  { value: 'dev', label: '개발' },
];

function PostEditor({ onSave, onCancel, currentUser, editing }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || '');
      setContent(editing.content || editing.body || '');
      setImageUrl(editing.imageUrl || '');
      setCategory(
        typeof editing.category === 'string'
          ? editing.category.trim().toLowerCase()
          : '',
      );
    } else {
      setTitle('');
      setContent('');
      setImageUrl('');
      setCategory('');
    }
  }, [editing]);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const trimmedImageUrl = imageUrl.trim();
    const trimmedCategory = category.trim();
    const normalizedCategory = trimmedCategory
      ? trimmedCategory.toLowerCase()
      : '';

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
          category: normalizedCategory || null,
        });
        onSave(updated);
      } else {
        const created = await createPost(
          trimmedTitle,
          trimmedContent,
          trimmedImageUrl || undefined,
          normalizedCategory || undefined,
        );
        onSave(created);
      }
      setTitle('');
      setContent('');
      setImageUrl('');
      setCategory('');
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
      <label className="post-editor__label" htmlFor="post-editor-category">
        <span>{TEXT.categoryLabel}</span>
        <select
          id="post-editor-category"
          className="post-editor__input"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">{TEXT.categoryPlaceholder}</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value || 'default'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
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
