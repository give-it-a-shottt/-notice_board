import '../MainContainer.css';
import jungleLogo from '../asset/jungle.png';

const TEXT = {
  anonymous: '\uc775\uba85',
  edit: '\uc218\uc815',
  remove: '\uc0ad\uc81c',
  like: '\uc88b\uc544\uc694',
  dislike: '\uc2eb\uc5b4\uc694',
  empty:
    '\uc544\uc9c1\u0020\uac8c\uc2dc\uae00\uc774\u0020\uc5c6\uc2b5\ub2c8\ub2e4\u002e\u0020\uccab\u0020\uae00\uc744\u0020\uc791\uc131\ud574\ubcf4\uc138\uc694\u0021',
};

function PostCard({
  post,
  onOpen,
  onEdit,
  onDelete,
  onReact,
  currentUser,
}) {
  const currentUsername = currentUser && (currentUser.username || currentUser);
  const isAuthor =
    currentUsername &&
    currentUsername === (post.author || post.authorObj?.username);
  const likes = typeof post.likes === 'number' ? post.likes : 0;
  const dislikes = typeof post.dislikes === 'number' ? post.dislikes : 0;
  const viewerReaction =
    post.viewerReaction &&
    (post.viewerReaction === 'like' || post.viewerReaction === 'dislike')
      ? post.viewerReaction
      : null;

  const previewSource = post.content || post.body || '';
  const preview =
    previewSource.length > 120
      ? `${previewSource.slice(0, 120)}...`
      : previewSource;
  const thumbnail = post.imageUrl ? post.imageUrl : jungleLogo;

  return (
    <li className="post-card-horizontal">
      <div className="post-card-horizontal__layout">
        <button
          type="button"
          className="post-card-horizontal__button"
          onClick={() => onOpen(post)}
        >
          <div className="post-thumb">
            <img
              src={thumbnail}
              alt={post.title}
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.src = jungleLogo;
              }}
            />
          </div>

          <div className="post-text">
            <span className="company">{post.author || TEXT.anonymous}</span>
            <strong>{post.title}</strong>
            <p>{preview}</p>
            <time>{new Date(post.createdAt).toLocaleString()}</time>
          </div>
        </button>

        {isAuthor && (
          <div className="post-card-horizontal__actions">
            <button className="btn-secondary" onClick={() => onEdit(post)}>
              {TEXT.edit}
            </button>
            <button onClick={() => onDelete(post)}>{TEXT.remove}</button>
          </div>
        )}
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
    </li>
  );
}

function MainContainer({
  posts = [],
  onOpenPost = () => {},
  onEditPost = () => {},
  onDeletePost = () => {},
  onReactPost = () => {},
  currentUser,
}) {
  if (!posts || posts.length === 0) {
    return (
      <div className="content-card" style={{ padding: 32 }}>
        {TEXT.empty}
      </div>
    );
  }

  return (
    <div className="content-card">
      <ul className="post-list-horizontal">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onOpen={onOpenPost}
            onEdit={onEditPost}
            onDelete={onDeletePost}
            onReact={onReactPost}
            currentUser={currentUser}
          />
        ))}
      </ul>
    </div>
  );
}

export default MainContainer;
