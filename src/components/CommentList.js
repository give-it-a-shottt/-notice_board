import React, { useState } from 'react';
import { deleteComment, editComment } from '../api';

const TEXT = {
  empty: '\uccab\u0020\ub313\uae00\uc744\u0020\ub0a8\uaca8\ubcf4\uc138\uc694\u002e',
  confirmDelete: '\ub313\uae00\uc744\u0020\uc0ad\uc81c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c\u003f',
  deleteFail: '\uc0ad\uc81c\u0020\uc2e4\ud328',
  editFail: '\uc218\uc815\u0020\uc2e4\ud328',
  cancel: '\ucde8\uc18c',
  save: '\uc800\uc7a5',
  edit: '\uc218\uc815',
  remove: '\uc0ad\uc81c',
};

function CommentList({ comments, postId, currentUser, onRefresh }) {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  if (!comments || comments.length === 0) {
    return <div className="comment-list__empty">{TEXT.empty}</div>;
  }

  const handleDelete = async (comment) => {
    if (!window.confirm(TEXT.confirmDelete)) return;
    try {
      await deleteComment(postId, comment._id || comment.id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.message || err.message || TEXT.deleteFail);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment._id || comment.id);
    setEditText(comment.content || comment.text || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const submitEdit = async (comment) => {
    try {
      await editComment(postId, comment._id || comment.id, editText);
      setEditingId(null);
      setEditText('');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.message || err.message || TEXT.editFail);
    }
  };

  return (
    <ul className="comment-list">
      {comments.map((comment) => {
        const id = comment._id || comment.id;
        const isAuthor =
          currentUser &&
          (currentUser === (comment.author?.username || comment.author) ||
            currentUser.username ===
              (comment.author?.username || comment.author));
        return (
          <li key={id} className="comment-list__item">
            <div className="comment-list__meta">
              {comment.author?.username || comment.author} -{' '}
              {new Date(comment.createdAt).toLocaleString()}
            </div>
            {editingId === id ? (
              <div className="comment-list__edit">
                <textarea
                  className="comment-list__textarea"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <div className="comment-list__actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={cancelEdit}
                  >
                    {TEXT.cancel}
                  </button>
                  <button type="button" onClick={() => submitEdit(comment)}>
                    {TEXT.save}
                  </button>
                </div>
              </div>
            ) : (
              <div className="comment-list__content">
                <div className="comment-list__body">
                  {comment.content || comment.text}
                </div>
                {isAuthor && (
                  <div className="comment-list__author-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => startEdit(comment)}
                    >
                      {TEXT.edit}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(comment)}
                    >
                      {TEXT.remove}
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default CommentList;
