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
    <div className="content-card post-view">
      <button
        type="button"
        className="btn-secondary post-view__back"
        onClick={onBack}
      >
        {TEXT.back}
      </button>
      <h2 className="post-view__title">{post.title}</h2>
      <div className="post-view__meta">
        {TEXT.author}{' '}
        {post.author?.username || post.author || TEXT.anonymous}{' '}
        {TEXT.separator}{' '}
        {new Date(post.createdAt).toLocaleString()}
        {currentUser &&
          (currentUser.username || currentUser) ===
            (post.author?.username || post.author) && (
            <span className="post-view__meta-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => onEditPost && onEditPost(post)}
              >
                {TEXT.edit}
              </button>
              <button
                type="button"
                onClick={() => onDeletePost && onDeletePost(post)}
              >
                {TEXT.remove}
              </button>
            </span>
          )}
      </div>

      <div className="post-view__hero">
        <img
          src={heroImage}
          alt={post.title}
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

      <div className="post-view__body">
        {post.body || post.content}
      </div>

      <h4 className="post-view__comments-title">{TEXT.comments}</h4>
      <CommentList
        comments={post.comments || []}
        postId={post._id || post.id}
        currentUser={currentUser}
        onRefresh={onRefresh}
      />

      <div className="post-view__comment-form">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={TEXT.commentPlaceholder}
        />
        <button type="button" onClick={handleComment}>
          {TEXT.commentSubmit}
        </button>
      </div>
    </div>
  );
}

export default PostView;
