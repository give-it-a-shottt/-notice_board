import React, { useState } from 'react';
import CommentList from './CommentList';
import { addComment } from '../api';

function PostView({
  post,
  currentUser,
  onBack,
  onRefresh,
  onRequestLogin,
  onEditPost,
  onDeletePost,
}) {
  const [text, setText] = useState('');

  if (!post) return null;

  const handleComment = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!currentUser) {
      onRequestLogin();
      return;
    }
    try {
      await addComment(post._id || post.id, trimmed);
      if (onRefresh) onRefresh();
      setText('');
    } catch (err) {
      alert(err.response?.message || err.message || '댓글 등록 실패');
    }
  };

  return (
    <div className="content-card">
      <button
        className="btn-secondary"
        onClick={onBack}
        style={{ marginBottom: 12 }}
      >
        목록으로
      </button>
      <h2>{post.title}</h2>
      <div style={{ color: '#666', marginBottom: 12 }}>
        작성자 {post.author?.username || post.author} -{' '}
        {new Date(post.createdAt).toLocaleString()}
        {currentUser &&
          (currentUser.username || currentUser) ===
            (post.author?.username || post.author) && (
            <span style={{ marginLeft: 12 }}>
              <button
                className="btn-secondary"
                onClick={() => onEditPost && onEditPost(post)}
              >
                수정
              </button>
              <button
                onClick={() => onDeletePost && onDeletePost(post)}
                style={{ marginLeft: 8 }}
              >
                삭제
              </button>
            </span>
          )}
      </div>
      <div style={{ whiteSpace: 'pre-wrap', marginBottom: 16 }}>
        {post.body || post.content}
      </div>

      <h4>댓글</h4>
      <CommentList
        comments={post.comments || []}
        postId={post._id || post.id}
        currentUser={currentUser}
        onRefresh={onRefresh}
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="댓글을 입력하세요"
          style={{ flex: 1 }}
        />
        <button onClick={handleComment}>등록</button>
      </div>
    </div>
  );
}

export default PostView;
