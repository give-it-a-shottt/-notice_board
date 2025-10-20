import '../MainContainer.css';
import jungleLogo from '../asset/jungle.png';

function PostCard({ post, onOpen, onEdit, onDelete, currentUser }) {
  const currentUsername = currentUser && (currentUser.username || currentUser);
  const isAuthor =
    currentUsername &&
    currentUsername === (post.author || post.authorObj?.username);

  return (
    <li className="post-card-horizontal">
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <button
          type="button"
          className="post-card-horizontal__button"
          onClick={() => onOpen(post)}
          style={{
            flex: 1,
            textAlign: 'left',
            background: 'none',
            border: 'none',
            padding: 0,
          }}
        >
          <div className="post-thumb">
            <img
              src={jungleLogo}
              alt={post.title}
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="post-text">
            <span className="company">{post.author}</span>
            <strong>{post.title}</strong>
            <p>
              {post.content
                ? `${post.content.slice(0, 120)}${
                    post.content.length > 120 ? '...' : ''
                  }`
                : ''}
            </p>
            <time>{new Date(post.createdAt).toLocaleString()}</time>
          </div>
        </button>

        {isAuthor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn-secondary" onClick={() => onEdit(post)}>
              수정
            </button>
            <button onClick={() => onDelete(post)}>삭제</button>
          </div>
        )}
      </div>
    </li>
  );
}

function MainContainer({
  posts = [],
  onOpenPost = () => {},
  onEditPost = () => {},
  onDeletePost = () => {},
  currentUser,
}) {
  if (!posts || posts.length === 0) {
    return (
      <div className="content-card" style={{ color: '#0f172a', padding: 32 }}>
        아직 게시글이 없습니다. 첫 글을 작성해보세요!
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
            currentUser={currentUser}
          />
        ))}
      </ul>
    </div>
  );
}

export default MainContainer;
