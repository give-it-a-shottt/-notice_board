import React, { useState, useEffect } from 'react';
import { createPost, editPost } from '../api';

const TEXT = {
  loginRequired:
    '\ub85c\uadf8\uc778\u0020\ud6c4\u0020\uac8c\uc2dc\uae00\uc744\u0020\uc791\uc131\ud560\u0020\uc218\u0020\uc788\uc5b4\uc694\u002e',
  titleContentRequired:
    '\uc81c\ubaa9\uacfc\u0020\ub0b4\uc6a9\uc744\u0020\ubaa8\ub450\u0020\uc785\ub825\ud574\uc8fc\uc138\uc694\u002e',
  requestFailed: '\uc694\uccad\u0020\uc2e4\ud328',
  titlePlaceholder:
    '\uc81c\ubaa9\uc744\u0020\uc785\ub825\ud574\uc8fc\uc138\uc694',
  imagePlaceholder:
    '\ub300\ud45c\u0020\uc774\ubbf8\uc9c0\u0020\u0055\u0052\u004c\uc744\u0020\uc785\ub825\ud574\uc8fc\uc138\uc694\u0020\u0028\uc120\ud0dd\u0029',
  previewAlt: '\ubbf8\ub9ac\ubcf4\uae30',
  contentPlaceholder:
    '\ub0b4\uc6a9\uc744\u0020\uc785\ub825\ud574\uc8fc\uc138\uc694',
  cancel: '\ucde8\uc18c',
  submit: '\uac8c\uc2dc\ud558\uae30',
  update: '\uc218\uc815\ud558\uae30',
  editTitle: '\uac8c\uc2dc\uae00\u0020\uc218\uc815',
  newTitle: '\uc0c8\u0020\uac8c\uc2dc\uae00\u0020\uc791\uc131',
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
    <div className="content-card" style={{ marginBottom: 24 }}>
      <h2 style={{ marginTop: 0, marginBottom: 16 }}>
        {editing ? TEXT.editTitle : TEXT.newTitle}
      </h2>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={TEXT.titlePlaceholder}
        style={{ width: '100%', marginBottom: 8 }}
      />
      <input
        value={imageUrl}
        onChange={(event) => setImageUrl(event.target.value)}
        placeholder={TEXT.imagePlaceholder}
        style={{ width: '100%', marginBottom: 8 }}
      />
      {imageUrl.trim() && (
        <div
          style={{
            marginBottom: 12,
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid rgba(148, 163, 184, 0.22)',
            background: 'rgba(15, 23, 42, 0.04)',
          }}
        >
          <img
            src={imageUrl}
            alt={TEXT.previewAlt}
            style={{ width: '100%', maxHeight: 220, objectFit: 'cover' }}
          />
        </div>
      )}
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={TEXT.contentPlaceholder}
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
          {TEXT.cancel}
        </button>
        <button onClick={handleSave}>
          {editing ? TEXT.update : TEXT.submit}
        </button>
      </div>
    </div>
  );
}

export default PostEditor;
