import React, { useState } from 'react';
import { deleteComment, editComment } from '../api';

function CommentList({ comments, postId, currentUser, onRefresh }) {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  if (!comments || comments.length === 0) {
    return <div style={{ color: '#666' }}>첫 댓글을 남겨보세요.</div>;
  }

  const handleDelete = async (comment) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      await deleteComment(postId, comment._id || comment.id);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.response?.message || err.message || '삭제 실패');
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
      alert(err.response?.message || err.message || '수정 실패');
    }
  };

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {comments.map((comment) => {
        const id = comment._id || comment.id;
        const isAuthor =
          currentUser &&
          (currentUser === (comment.author?.username || comment.author) ||
            currentUser.username ===
              (comment.author?.username || comment.author));
        return (
          <li
            key={id}
            style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}
          >
            <div style={{ fontSize: 12, color: '#666' }}>
              {comment.author?.username || comment.author} -{' '}
              {new Date(comment.createdAt).toLocaleString()}
            </div>
            {editingId === id ? (
              <div>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={{ width: '100%' }}
                />
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    justifyContent: 'flex-end',
                    marginTop: 8,
                  }}
                >
                  <button className="btn-secondary" onClick={cancelEdit}>
                    취소
                  </button>
                  <button onClick={() => submitEdit(comment)}>저장</button>
                </div>
              </div>
            ) : (
              <div>
                <div>{comment.content || comment.text}</div>
                {isAuthor && (
                  <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                    <button
                      className="btn-secondary"
                      onClick={() => startEdit(comment)}
                    >
                      수정
                    </button>
                    <button onClick={() => handleDelete(comment)}>삭제</button>
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
