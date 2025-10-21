import React, { useState } from 'react';
import CommentList from './CommentList';
import { addComment } from '../api';
import jungleLogo from '../asset/jungle.png';

const TEXT = {
  back: '\ubaa9\ub85d\uc73c\ub85c',
  author: '\uc791\uc131\uc790',
  edit: '\uc218\uc815',
  remove: '\uc0ad\uc81c',
  like: '\uc88b\uc544\uc694',
  dislike: '\uc2eb\uc5b4\uc694',
  comments: '\ub313\uae00',
  commentPlaceholder:
    '\ub313\uae00\uc744\u0020\uc785\ub825\ud574\uc8fc\uc138\uc694',
  commentSubmit: '\ub4f1\ub85d',
  commentFail: '\ub313\uae00\u0020\ub4f1\ub85d\u0020\uc2e4\ud328',
  anonymous: '\uc775\uba85',
  separator: '\u00b7',
};

function PostView({
  post,
  currentUser,
  onBack,
  onRefresh,
  onRequestLogin,
  onEditPost,
  onDeletePost,
  onReact,
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
      alert(err.response?.message || err.message || TEXT.commentFail);
    }
  };

  const likes = typeof post.likes === 'number' ? post.likes : 0;
  const dislikes = typeof post.dislikes === 'number' ? post.dislikes : 0;
  const viewerReaction =
    post.viewerReaction &&
    (post.viewerReaction === 'like' || post.viewerReaction === 'dislike')
      ? post.viewerReaction
      : null;
  const heroImage = post.imageUrl || jungleLogo;

  return (
    <div className="content-card">
      <button
        className="btn-secondary"
        onClick={onBack}
        style={{ marginBottom: 12 }}
      >
        {TEXT.back}
      </button>
      <h2>{post.title}</h2>
      <div style={{ color: 'rgba(17, 24, 39, 0.6)', marginBottom: 16 }}>
        {TEXT.author}{' '}
        {post.author?.username || post.author || TEXT.anonymous}{' '}
        {TEXT.separator}{' '}
        {new Date(post.createdAt).toLocaleString()}
        {currentUser &&
          (currentUser.username || currentUser) ===
            (post.author?.username || post.author) && (
            <span style={{ marginLeft: 12 }}>
              <button
                className="btn-secondary"
                onClick={() => onEditPost && onEditPost(post)}
              >
                {TEXT.edit}
              </button>
              <button
                onClick={() => onDeletePost && onDeletePost(post)}
                style={{ marginLeft: 8 }}
              >
                {TEXT.remove}
              </button>
            </span>
          )}
      </div>

      <div
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          marginBottom: 18,
        }}
      >
        <img
          src={heroImage}
          alt={post.title}
          style={{ width: '100%', maxHeight: 360, objectFit: 'cover' }}
          onError={(event) => {
            event.currentTarget.src = jungleLogo;
          }}
        />
      </div>

      <div className="reaction-toolbar">
        <button
          type="button"
          className={`reaction-button is-like${
            viewerReaction === 'like' ? ' is-active' : ''
          }`}
          aria-pressed={viewerReaction === 'like'}
          onClick={() => onReact && onReact(post.id, 'like')}
        >
          <span className="reaction-button__spark" aria-hidden="true" />
          <span className="reaction-button__label">{TEXT.like}</span>
          <span className="reaction-button__count">{likes}</span>
        </button>
        <button
          type="button"
          className={`reaction-button is-dislike${
            viewerReaction === 'dislike' ? ' is-active' : ''
          }`}
          aria-pressed={viewerReaction === 'dislike'}
          onClick={() => onReact && onReact(post.id, 'dislike')}
        >
          <span className="reaction-button__spark" aria-hidden="true" />
          <span className="reaction-button__label">{TEXT.dislike}</span>
          <span className="reaction-button__count">{dislikes}</span>
        </button>
      </div>

      <div style={{ whiteSpace: 'pre-wrap', marginBottom: 24, marginTop: 16 }}>
        {post.body || post.content}
      </div>

      <h4>{TEXT.comments}</h4>
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
          placeholder={TEXT.commentPlaceholder}
          style={{ flex: 1 }}
        />
        <button onClick={handleComment}>{TEXT.commentSubmit}</button>
      </div>
    </div>
  );
}

export default PostView;
