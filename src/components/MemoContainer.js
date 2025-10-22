import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '../App.css';
import MainContainer from './MainContainer';
import AuthModal from './AuthModal';
import PostEditor from './PostEditor';
import PostView from './PostView';
import Pagination from './Pagination';
import PopularPosts from './PopularPosts';
import { getUser, clearAuth } from '../auth';
import { fetchPosts, deletePost, incrementPostViews } from '../api';

const PAGE_SIZE = 5;

const CATEGORY_VIEW_MAP = {
  gameBoard: 'game',
  studyBoard: 'study',
  devBoard: 'dev',
};
const VALID_CATEGORY_VALUES = new Set(Object.values(CATEGORY_VIEW_MAP));

const POPULAR_SORT_OPTIONS = [
  { id: 'views', labelKey: 'sortViews' },
  { id: 'likes', labelKey: 'sortLikes' },
];

const VIEW_LABEL = {
  home: '메인 피드',
  today: '오늘의 소식',
  popular: '인기글',
  search: '검색',
  support: '고객센터',
  myPosts: '내가 쓴 글',
  gameBoard: '게임 게시판',
  studyBoard: '공부 게시판',
  devBoard: '개발 게시판',
};

const TEXT = {
  confirmDelete: '이 게시글을 정말 삭제하시겠어요? 되돌릴 수 없어요.',
  deleteFail: '삭제 실패',
  todayTitle: '오늘의 소식',
  todaySubtitle: '따끈따끈한 최신글을 바로 만나보세요.',
  popularTitle: '인기글',
  popularSubtitle: '조회순과 좋아요순 중 원하는 기준으로 정렬해보세요.',
  searchTitle: '제목으로 검색',
  searchSubtitle: '키워드를 입력하면 제목에 포함된 글을 찾아드릴게요.',
  searchPlaceholder: '예: Jungle 업데이트',
  searchEmptyTitle: '검색어를 입력해 주세요.',
  searchEmptyBody: '검색은 최소 1글자 이상 입력해야 해요.',
  searchNoResultTitle: '검색 결과가 없어요.',
  searchNoResultBody: '철자를 다시 확인하거나 다른 키워드로 검색해보세요.',
  supportTitle: '고객센터',
  supportBody: '2025 10월 23일부로 운영이 중지되었습니다.',
  supportNote: '궁금한 점이 있다면 Jungle 커뮤니티에서 서로 도와주세요.',
  myPostsTitle: '내가 쓴 글 페이지',
  myPostsSubtitle: '내가 작성한 게시글만 모아봤어요.',
  myPostsNeedLogin: '로그인하면 내가 쓴 글을 한눈에 볼 수 있어요.',
  gameTitle: '게임 게시판 페이지',
  gameSubtitle: '최신 게임 소식과 공략을 공유해 보세요.',
  studyTitle: '공부 게시판 페이지',
  studySubtitle: '공부 기록과 팁을 함께 나눠요.',
  devTitle: '개발 게시판 페이지',
  devSubtitle: '개발 관련 소식과 노하우를 공유해요.',
  sortViews: '조회순',
  sortLikes: '좋아요순',
  toggleClose: '작성 닫기',
  toggleOpen: '글쓰기',
  welcomeSuffix: '님 환영해요',
  logout: '로그아웃',
  login: '로그인',
};

function MemoContainer({ activeView = 'home', onChangeView = () => {} }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getUser());
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [page, setPage] = useState(1);
  const [reactions, setReactions] = useState(() => {
    try {
      const stored = localStorage.getItem('mp_post_reactions');
      if (!stored) return {};
      const parsed = JSON.parse(stored);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  });
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [popularSort, setPopularSort] = useState('views');

  const currentUsername =
    currentUser && (currentUser.username || currentUser) ?
      currentUser.username || currentUser :
      '';
  const isLoggedIn = Boolean(currentUsername);

  const mapServerPost = useCallback((post) => {
    if (!post) return null;
    const rawCategory =
      typeof post.category === 'string'
        ? post.category
        : typeof post.metadata?.category === 'string'
        ? post.metadata.category
        : '';
    const normalizedCategory = rawCategory
      ? rawCategory.toString().trim().toLowerCase()
      : '';
    const categoryValue = VALID_CATEGORY_VALUES.has(normalizedCategory)
      ? normalizedCategory
      : '';

    return {
      _id: post._id,
      id: post._id,
      title: post.title || '',
      body: post.body || '',
      content: post.body || '',
      imageUrl: post.imageUrl || (post.assets && post.assets.cover) || '',
      author:
        post.author && post.author.username
          ? post.author.username
          : post.author || '',
      authorObj: post.author,
      createdAt: post.createdAt,
      category: categoryValue,
      views:
        typeof post.views === 'number'
          ? post.views
          : typeof post.metrics?.views === 'number'
          ? post.metrics.views
          : 0,
      likes:
        typeof post.likes === 'number'
          ? post.likes
          : typeof post.reactions?.likes === 'number'
          ? post.reactions.likes
          : 0,
      dislikes:
        typeof post.dislikes === 'number'
          ? post.dislikes
          : typeof post.reactions?.dislikes === 'number'
          ? post.reactions.dislikes
          : 0,
      comments: Array.isArray(post.comments) ? post.comments : [],
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.removeItem('mp_post_views');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('mp_current_user', JSON.stringify(currentUser));
      } catch {
        /* ignore */
      }
    } else {
      localStorage.removeItem('mp_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    setShowEditor(false);
    setSelectedPostId(null);
    if (activeView !== 'home') {
      setPage(1);
    }
    if (activeView !== 'search') {
      setSearchInput('');
      setSearchTerm('');
    }
  }, [activeView]);

  useEffect(() => {
    try {
      localStorage.setItem('mp_post_reactions', JSON.stringify(reactions));
    } catch {
      /* ignore */
    }
  }, [reactions]);

  async function loadPosts() {
    try {
      const data = await fetchPosts();
      const mapped = (data || [])
        .map(mapServerPost)
        .filter((post) => post && post.id);
      setPosts(mapped);
    } catch (err) {
      console.error('Failed to load posts', err);
    }
  }

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setReactions((prev) => {
      const next = { ...prev };
      let changed = false;
      const postIds = new Set();

      posts.forEach((post) => {
        const id = post.id;
        if (!id) return;
        postIds.add(id);
        if (!next[id]) {
          next[id] = {
            likes:
              typeof post.likes === 'number'
                ? post.likes
                : typeof post.reactions?.likes === 'number'
                ? post.reactions.likes
                : 0,
            dislikes:
              typeof post.dislikes === 'number'
                ? post.dislikes
                : typeof post.reactions?.dislikes === 'number'
                ? post.reactions.dislikes
                : 0,
            viewer: null,
          };
          changed = true;
          return;
        }

        const serverLikes =
          typeof post.likes === 'number'
            ? post.likes
            : typeof post.reactions?.likes === 'number'
            ? post.reactions.likes
            : next[id].likes;
        const serverDislikes =
          typeof post.dislikes === 'number'
            ? post.dislikes
            : typeof post.reactions?.dislikes === 'number'
            ? post.reactions.dislikes
            : next[id].dislikes;

        if (
          (typeof serverLikes === 'number' && serverLikes > next[id].likes) ||
          (typeof serverDislikes === 'number' &&
            serverDislikes > next[id].dislikes)
        ) {
          next[id] = {
            ...next[id],
            likes: Math.max(next[id].likes, serverLikes || 0),
            dislikes: Math.max(next[id].dislikes, serverDislikes || 0),
          };
          changed = true;
        }
      });

      Object.keys(next).forEach((key) => {
        if (!postIds.has(key)) {
          delete next[key];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [posts]);


  const decoratedPosts = useMemo(() => {
    return posts.map((post) => {
      const reaction = reactions[post.id] || {};
      return {
        ...post,
        views: Math.max(typeof post.views === 'number' ? post.views : 0, 0),
        likes:
          typeof reaction.likes === 'number'
            ? reaction.likes
            : typeof post.likes === 'number'
            ? post.likes
            : 0,
        dislikes:
          typeof reaction.dislikes === 'number'
            ? reaction.dislikes
            : typeof post.dislikes === 'number'
            ? post.dislikes
            : 0,
        viewerReaction:
          reaction.viewer &&
          (reaction.viewer === 'like' || reaction.viewer === 'dislike')
            ? reaction.viewer
            : null,
      };
    });
  }, [posts, reactions]);

  const myPosts = useMemo(() => {
    if (!currentUsername) return [];
    return decoratedPosts.filter((post) => {
      const authorName =
        post.author ||
        post.authorObj?.username ||
        post.authorObj?.name ||
        '';
      return authorName === currentUsername;
    });
  }, [decoratedPosts, currentUsername]);

  const getCategoryPosts = useCallback(
    (viewId) => {
      const categoryValue = CATEGORY_VIEW_MAP[viewId];
      if (!categoryValue) return [];
      return decoratedPosts.filter(
        (post) => post.category === categoryValue,
      );
    },
    [decoratedPosts],
  );

  const visiblePosts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return decoratedPosts.slice(start, start + PAGE_SIZE);
  }, [page, decoratedPosts]);

  const latestPosts = useMemo(() => {
    return [...decoratedPosts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [decoratedPosts]);

  const popularFeed = useMemo(() => {
    const activeSort = popularSort === 'likes' ? 'likes' : 'views';
    const getTime = (value) => {
      const time = value ? new Date(value).getTime() : 0;
      return Number.isFinite(time) ? time : 0;
    };

    return [...decoratedPosts].sort((a, b) => {
      const aLikes = typeof a.likes === 'number' ? a.likes : 0;
      const bLikes = typeof b.likes === 'number' ? b.likes : 0;
      const aViews = typeof a.views === 'number' ? a.views : 0;
      const bViews = typeof b.views === 'number' ? b.views : 0;

      if (activeSort === 'likes') {
        const likeDiff = bLikes - aLikes;
        if (likeDiff !== 0) return likeDiff;
        const viewDiff = bViews - aViews;
        if (viewDiff !== 0) return viewDiff;
      } else {
        const viewDiff = bViews - aViews;
        if (viewDiff !== 0) return viewDiff;
        const likeDiff = bLikes - aLikes;
        if (likeDiff !== 0) return likeDiff;
      }

      return getTime(b.createdAt) - getTime(a.createdAt);
    });
  }, [decoratedPosts, popularSort]);

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const keyword = searchTerm.toLowerCase();
    return decoratedPosts.filter((post) =>
      (post.title || '').toLowerCase().includes(keyword),
    );
  }, [searchTerm, decoratedPosts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 200);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (selectedPostId && !posts.some((post) => post.id === selectedPostId)) {
      setSelectedPostId(null);
    }
  }, [posts, selectedPostId]);

  const toggleEditor = () => {
    if (!currentUser) {
      setAuthOpen(true);
      return;
    }
    if (activeView !== 'home') {
      onChangeView('home');
    }
    setSelectedPostId(null);
    setShowEditor((prev) => !prev);
  };

  const handleLogin = (id) => {
    setCurrentUser({ username: id });
    setShowEditor(false);
  };

  const handleLogout = () => {
    clearAuth();
    setCurrentUser(null);
    setShowEditor(false);
    setSelectedPostId(null);
  };

  const handlePostSaved = async (post) => {
    await loadPosts();
    setShowEditor(false);
    setPage(1);
    onChangeView('home');
    if (post && (post._id || post.id)) {
      setSelectedPostId(post._id || post.id);
    }
  };

  const handleEditPost = (post) => {
    setSelectedPostId(post.id);
    setShowEditor(true);
  };

  const handleDeletePost = async (post) => {
    if (!window.confirm(TEXT.confirmDelete)) return;
    try {
      await deletePost(post._id || post.id);
      await loadPosts();
      setSelectedPostId(null);
    } catch (err) {
      alert(err.response?.message || err.message || TEXT.deleteFail);
    }
  };

  const handleOpenPost = async (post) => {
    if (!post || !post.id) return;
    setShowEditor(false);
    setSelectedPostId(post.id);
    try {
      const updated = await incrementPostViews(post.id);
      const mapped = mapServerPost(updated);
      if (mapped && mapped.id) {
        let replaced = false;
        setPosts((prev) => {
          const next = prev.map((item) => {
            if (item.id === mapped.id) {
              replaced = true;
              return { ...item, ...mapped };
            }
            return item;
          });
          return replaced ? next : prev;
        });
        if (!replaced) {
          await loadPosts();
        }
      } else {
        await loadPosts();
      }
    } catch (err) {
      console.error('Failed to increment post views', err);
    }
  };

  const handleClosePost = () => setSelectedPostId(null);

  const handleReactPost = (postId, action) => {
    if (!postId || (action !== 'like' && action !== 'dislike')) return;
    setReactions((prev) => {
      const current = prev[postId] || {};
      const decorated = decoratedPosts.find((post) => post.id === postId);
      const baseLikes =
        typeof current.likes === 'number'
          ? current.likes
          : decorated && typeof decorated.likes === 'number'
          ? decorated.likes
          : 0;
      const baseDislikes =
        typeof current.dislikes === 'number'
          ? current.dislikes
          : decorated && typeof decorated.dislikes === 'number'
          ? decorated.dislikes
          : 0;

      let likes = Math.max(0, baseLikes);
      let dislikes = Math.max(0, baseDislikes);
      let viewer =
        current.viewer &&
        (current.viewer === 'like' || current.viewer === 'dislike')
          ? current.viewer
          : null;

      if (action === 'like') {
        if (viewer === 'like') {
          likes = Math.max(0, likes - 1);
          viewer = null;
        } else {
          if (viewer === 'dislike') {
            dislikes = Math.max(0, dislikes - 1);
          }
          likes += 1;
          viewer = 'like';
        }
      } else if (action === 'dislike') {
        if (viewer === 'dislike') {
          dislikes = Math.max(0, dislikes - 1);
          viewer = null;
        } else {
          if (viewer === 'like') {
            likes = Math.max(0, likes - 1);
          }
          dislikes += 1;
          viewer = 'dislike';
        }
      }

      return {
        ...prev,
        [postId]: {
          likes,
          dislikes,
          viewer,
        },
      };
    });
  };

  const showPagination =
    !showEditor && !selectedPostId && activeView === 'home' && totalPages > 1;

  const viewTitle = VIEW_LABEL[activeView] || VIEW_LABEL.home;

  let mainView = null;

  if (showEditor) {
    mainView = (
      <PostEditor
        onSave={handlePostSaved}
        onCancel={() => setShowEditor(false)}
        currentUser={currentUser}
        editing={
          selectedPostId ? posts.find((p) => p.id === selectedPostId) : null
        }
      />
    );
  } else if (selectedPostId) {
    const selectedPost =
      decoratedPosts.find((post) => post.id === selectedPostId) || null;
    mainView = (
      <PostView
        post={selectedPost}
        currentUser={currentUser}
        onBack={handleClosePost}
        onRefresh={loadPosts}
        onRequestLogin={() => setAuthOpen(true)}
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
        onReact={handleReactPost}
      />
    );
  } else {
    switch (activeView) {
      case 'today':
        mainView = (
          <>
            <div className="content-card info-card">
              <h2>{TEXT.todayTitle}</h2>
              <p>{TEXT.todaySubtitle}</p>
            </div>
            <MainContainer
              posts={latestPosts}
              onOpenPost={handleOpenPost}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onReactPost={handleReactPost}
              currentUser={currentUser}
            />
          </>
        );
        break;
      case 'popular':
        mainView = (
          <>
            <div className="content-card info-card">
              <h2>{TEXT.popularTitle}</h2>
              <p>{TEXT.popularSubtitle}</p>
              <div className="popular-section__controls popular-section__controls--inline">
                {POPULAR_SORT_OPTIONS.map((option) => {
                  const isActive = popularSort === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`popular-sort-button${
                        isActive ? ' is-active' : ''
                      }`}
                      onClick={() => setPopularSort(option.id)}
                    >
                      {TEXT[option.labelKey]}
                    </button>
                  );
                })}
              </div>
            </div>
            <MainContainer
              posts={popularFeed}
              onOpenPost={handleOpenPost}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onReactPost={handleReactPost}
              currentUser={currentUser}
            />
          </>
        );
        break;
      case 'myPosts':
        mainView = isLoggedIn ? (
          <>
            <div className="content-card info-card">
              <h2>{TEXT.myPostsTitle}</h2>
              <p>{TEXT.myPostsSubtitle}</p>
            </div>
            <MainContainer
              posts={myPosts}
              onOpenPost={handleOpenPost}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onReactPost={handleReactPost}
              currentUser={currentUser}
            />
          </>
        ) : (
          <div className="content-card info-card">
            <h2>{TEXT.myPostsTitle}</h2>
            <p>{TEXT.myPostsNeedLogin}</p>
            <button
              type="button"
              className="btn-secondary"
              style={{ marginTop: 12 }}
              onClick={() => setAuthOpen(true)}
            >
              {TEXT.login}
            </button>
          </div>
        );
        break;
      case 'gameBoard': {
        const boardPosts = getCategoryPosts('gameBoard');
        mainView = (
          <>
            <div className="content-card info-card">
              <h2>{TEXT.gameTitle}</h2>
              <p>{TEXT.gameSubtitle}</p>
            </div>
            <MainContainer
              posts={boardPosts}
              onOpenPost={handleOpenPost}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onReactPost={handleReactPost}
              currentUser={currentUser}
            />
          </>
        );
        break;
      }
      case 'studyBoard': {
        const boardPosts = getCategoryPosts('studyBoard');
        mainView = (
          <>
            <div className="content-card info-card">
              <h2>{TEXT.studyTitle}</h2>
              <p>{TEXT.studySubtitle}</p>
            </div>
            <MainContainer
              posts={boardPosts}
              onOpenPost={handleOpenPost}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onReactPost={handleReactPost}
              currentUser={currentUser}
            />
          </>
        );
        break;
      }
      case 'devBoard': {
        const boardPosts = getCategoryPosts('devBoard');
        mainView = (
          <>
            <div className="content-card info-card">
              <h2>{TEXT.devTitle}</h2>
              <p>{TEXT.devSubtitle}</p>
            </div>
            <MainContainer
              posts={boardPosts}
              onOpenPost={handleOpenPost}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onReactPost={handleReactPost}
              currentUser={currentUser}
            />
          </>
        );
        break;
      }
      case 'search':
        mainView = (
          <>
            <div className="content-card search-card">
              <h2>{TEXT.searchTitle}</h2>
              <p>{TEXT.searchSubtitle}</p>
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={TEXT.searchPlaceholder}
                style={{ width: '100%', marginTop: 12 }}
              />
            </div>
            {searchTerm ? (
              searchResults.length > 0 ? (
                <MainContainer
                  posts={searchResults}
                  onOpenPost={handleOpenPost}
                  onEditPost={handleEditPost}
                  onDeletePost={handleDeletePost}
                  onReactPost={handleReactPost}
                  currentUser={currentUser}
                />
              ) : (
                <div className="content-card info-card">
                  <h3>{TEXT.searchNoResultTitle}</h3>
                  <p>{TEXT.searchNoResultBody}</p>
                </div>
              )
            ) : (
              <div className="content-card info-card">
                <h3>{TEXT.searchEmptyTitle}</h3>
                <p>{TEXT.searchEmptyBody}</p>
              </div>
            )}
          </>
        );
        break;
      case 'support':
        mainView = (
          <div className="content-card info-card">
            <h2>{TEXT.supportTitle}</h2>
            <p>{TEXT.supportBody}</p>
            <p>{TEXT.supportNote}</p>
          </div>
        );
        break;
      case 'home':
      default:
        mainView = (
          <>
            <PopularPosts
              posts={decoratedPosts}
              onOpenPost={handleOpenPost}
              sortMode={popularSort}
              onSortChange={setPopularSort}
            />
            <MainContainer
              posts={visiblePosts}
              onOpenPost={handleOpenPost}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onReactPost={handleReactPost}
              currentUser={currentUser}
            />
          </>
        );
        break;
    }
  }

  return (
    <div className="MemoContainer">
      <div className="top-bar">
        <button
          type="button"
          className="logo"
          onClick={() => {
            onChangeView('home');
            setSelectedPostId(null);
            setShowEditor(false);
          }}
        >
          Jungle
        </button>

        <div className="top-bar__view">{viewTitle}</div>

        <div className="top-bar__actions">
          <button
            type="button"
            className="top-bar__button top-bar__button--primary"
            onClick={toggleEditor}
          >
            {showEditor ? TEXT.toggleClose : TEXT.toggleOpen}
          </button>
          {currentUser ? (
            <>
              <span className="top-bar__welcome">
                {`${currentUser.username || currentUser}${TEXT.welcomeSuffix}`}
              </span>
              <button
                type="button"
                className="top-bar__button top-bar__button--ghost"
                onClick={handleLogout}
              >
                {TEXT.logout}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="top-bar__button top-bar__button--ghost"
              onClick={() => setAuthOpen(true)}
            >
              {TEXT.login}
            </button>
          )}
        </div>
      </div>

      <div className="memo-body">
        {mainView}

        {showPagination && (
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        )}
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}

export default MemoContainer;
