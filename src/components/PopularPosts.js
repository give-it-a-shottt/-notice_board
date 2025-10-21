import React, { useMemo } from 'react';

const TEXT = {
  title: '\uc778\uae30\uae00',
  subtitle:
    '\uc88b\uc544\uc694\u0020\uc21c\uc73c\ub85c\u0020\uac00\uc7a5\u0020\ud56b\ud55c\u0020\uae00\uc774\uc5d0\uc694',
  previewFallback:
    '\ub0b4\uc6a9\u0020\ubbf8\ub9ac\ubcf4\uae30\uac00\u0020\uc544\uc9c1\u0020\uc5c6\uc5b4\uc694\u002e',
  anonymous: '\uc775\uba85',
  like: '  \uc88b\uc544\uc694',
};

function PopularPosts({ posts = [], onOpenPost = () => {} }) {
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
      }))
      .sort((a, b) => {
        const likeDiff = b.likes - a.likes;
        if (likeDiff !== 0) return likeDiff;
        return getTime(b.createdAt) - getTime(a.createdAt);
      })
      .slice(0, 4);
  }, [posts]);

  if (!popularList.length) return null;

  return (
    <section className="popular-section content-card">
      <header className="popular-section__header">
        <div>
          <h2>{TEXT.title}</h2>
          <span className="popular-section__subtitle">{TEXT.subtitle}</span>
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
                  <span className="popular-card__likes">
                    {post.likes} {TEXT.like}
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
