import React, { useMemo } from 'react';

const TEXT = {
  title: '인기글',
  subtitle: '원하는 인기 기준으로 상위 글을 확인해보세요.',
  previewFallback: '내용 미리보기가 아직 없어요.',
  anonymous: '익명',
  like: '좋아요',
  views: '조회수',
  sortViews: '조회순',
  sortLikes: '좋아요순',
};

function PopularPosts({
  posts = [],
  onOpenPost = () => {},
  sortMode = 'views',
  onSortChange = () => {},
}) {
  const activeSort = sortMode === 'likes' ? 'likes' : 'views';

  const popularList = useMemo(() => {
    if (!Array.isArray(posts)) return [];
    const getTime = (value) => {
      const time = value ? new Date(value).getTime() : 0;
      return Number.isFinite(time) ? time : 0;
    };

    return [...posts]
      .map((post) => ({
        ...post,
        likes: typeof post.likes === 'number' ? post.likes : 0,
        views: typeof post.views === 'number' ? post.views : 0,
      }))
      .sort((a, b) => {
        if (activeSort === 'likes') {
          const likeDiff = b.likes - a.likes;
          if (likeDiff !== 0) return likeDiff;
          const viewDiff = b.views - a.views;
          if (viewDiff !== 0) return viewDiff;
        } else {
          const viewDiff = b.views - a.views;
          if (viewDiff !== 0) return viewDiff;
          const likeDiff = b.likes - a.likes;
          if (likeDiff !== 0) return likeDiff;
        }
        return getTime(b.createdAt) - getTime(a.createdAt);
      })
      .slice(0, 6);
  }, [posts, activeSort]);

  if (!popularList.length) return null;

  return (
    <section className="popular-section content-card">
      <header className="popular-section__header">
        <div>
          <h2>{TEXT.title}</h2>
          <span className="popular-section__subtitle">{TEXT.subtitle}</span>
        </div>
        <div className="popular-section__controls">
          {['views', 'likes'].map((option) => {
            const isActive = activeSort === option;
            const label = option === 'views' ? TEXT.sortViews : TEXT.sortLikes;
            return (
              <button
                key={option}
                type="button"
                className={`popular-sort-button${
                  isActive ? ' is-active' : ''
                }`}
                onClick={() => onSortChange(option)}
              >
                {label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="popular-grid">
        {popularList.map((post, index) => {
          const previewSource = post.content || post.body || '';
          const preview =
            previewSource.length > 80
              ? `${previewSource.slice(0, 80)}...`
              : previewSource;
          return (
            <button
              type="button"
              key={post.id || index}
              className="popular-card"
              onClick={() => onOpenPost(post)}
            >
              <span className="popular-card__glow" aria-hidden="true" />
              <span className="popular-card__rank">{index + 1}</span>
              <div className="popular-card__body">
                <h3>{post.title}</h3>
                <p>{preview || TEXT.previewFallback}</p>
                <div className="popular-card__meta">
                  <span className="popular-card__author">
                    {post.author || TEXT.anonymous}
                  </span>
                  <span className="popular-card__metric popular-card__metric--views">
                    {TEXT.views} {post.views.toLocaleString()}
                  </span>
                  <span className="popular-card__metric popular-card__metric--likes">
                    {TEXT.like} {post.likes.toLocaleString()}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default PopularPosts;


