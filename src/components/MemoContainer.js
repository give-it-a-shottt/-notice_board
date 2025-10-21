import React, { useEffect, useMemo, useState } from 'react';
import '../App.css';
import MainContainer from './MainContainer';
import AuthModal from './AuthModal';
import PostEditor from './PostEditor';
import PostView from './PostView';
import Pagination from './Pagination';
import PopularPosts from './PopularPosts';
import { getUser, clearAuth } from '../auth';
import { fetchPosts, deletePost } from '../api';

const PAGE_SIZE = 5;

const VIEW_LABEL = {
  home: '\uba54\uc778\u0020\ud53c\ub4dc',
  today: '\uc624\ub298\uc758\u0020\uc18c\uc2dd',
  popular: '\uc778\uae30\uae00',
  search: '\uac80\uc0c9',
  support: '\uace0\uac1d\uc13c\ud130',
  category: '\uce74\ud14c\uace0\ub9ac',
};

const TEXT = {
  confirmDelete:
    '\uc774\u0020\uac8c\uc2dc\uae00\uc744\u0020\uc815\ub9d0\u0020\uc0ad\uc81c\ud558\uc2dc\uaca0\uc5b4\uc694\u003f\u0020\ub418\ub3cc\ub9b4\u0020\uc218\u0020\uc5c6\uc5b4\uc694\u002e',
  deleteFail: '\uc0ad\uc81c\u0020\uc2e4\ud328',
  todayTitle: '\uc624\ub298\uc758\u0020\uc18c\uc2dd',
  todaySubtitle:
    '\ub530\ub048\ub530\ub048\ud55c\u0020\ucd5c\uc2e0\u0020\uae00\uc744\u0020\ubc14\ub85c\u0020\ub9cc\ub098\ubcf4\uc138\uc694\u002e',
  popularTitle: '\uc778\uae30\uae00',
  popularSubtitle:
    '\ucee4\ubba4\ub2c8\ud2f0\uc5d0\uc11c\u0020\uac00\uc7a5\u0020\uc0ac\ub791\ubc1b\uc740\u0020\uc774\uc57c\uae30\ub4e4\uc785\ub2c8\ub2e4\u002e',
  searchTitle: '\uc81c\ubaa9\uc73c\ub85c\u0020\uac80\uc0c9',
  searchSubtitle:
    '\ud0a4\uc6cc\ub4dc\ub97c\u0020\uc785\ub825\ud558\uba74\u0020\uc81c\ubaa9\uc5d0\u0020\ud3ec\ud568\ub41c\u0020\uae00\uc744\u0020\ucc3e\uc544\ub4dc\ub9b4\uac8c\uc694\u002e',
  searchPlaceholder: '\uc608\u003a\u0020\u004a\u0075\u006e\u0067\u006c\u0065\u0020\uc5c5\ub370\uc774\ud2b8',
  searchEmptyTitle: '\uac80\uc0c9\uc5b4\ub97c\u0020\uc785\ub825\ud574\u0020\uc8fc\uc138\uc694\u002e',
  searchEmptyBody:
    '\uac80\uc0c9\uc740\u0020\uacf5\ubc31\u0020\uc5c6\uc774\u0020\ucd5c\uc18c\u0020\u0031\uae00\uc790\u0020\uc774\uc0c1\u0020\uc785\ub825\ud574\uc57c\u0020\ud574\uc694\u002e',
  searchNoResultTitle: '\uac80\uc0c9\u0020\uacb0\uacfc\uac00\u0020\uc5c6\uc5b4\uc694\u002e',
  searchNoResultBody:
    '\ucca0\uc790\ub97c\u0020\ub2e4\uc2dc\u0020\ud655\uc778\ud558\uac70\ub098\u0020\ub2e4\ub978\u0020\ud0a4\uc6cc\ub4dc\ub85c\u0020\uac80\uc0c9\ud574\ubcf4\uc138\uc694\u002e',
  supportTitle: '\uace0\uac1d\uc13c\ud130',
  supportBody:
    '\u0032\u0030\u0032\u0035\u0020\u0031\u0030\uc6d4\u0020\u0032\u0033\uc77c\ubd80\ub85c\u0020\uc6b4\uc601\uc774\u0020\uc911\uc9c0\ub418\uc5c8\uc2b5\ub2c8\ub2e4\u002e',
  supportNote:
    '\uad81\uae08\ud55c\u0020\uc810\uc774\u0020\uc788\ub2e4\uba74\u0020\u004a\u0075\u006e\u0067\u006c\u0065\u0020\ucee4\ubba4\ub2c8\ud2f0\uc5d0\uc11c\u0020\uc11c\ub85c\u0020\ub3c4\uc640\uc8fc\uc138\uc694\u002e',
  toggleClose: '\uc791\uc131\u0020\ub2eb\uae30',
  toggleOpen: '\uae00\uc4f0\uae30',
  welcomeSuffix: '\ub2d8\u0020\ud658\uc601\ud574\uc694',
  logout: '\ub85c\uadf8\uc544\uc6c3',
  login: '\ub85c\uadf8\uc778',
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
      const mapped = (data || []).map((p) => ({
        _id: p._id,
        id: p._id,
        title: p.title,
        body: p.body,
        content: p.body,
        imageUrl: p.imageUrl || (p.assets && p.assets.cover) || '',
        author:
          p.author && p.author.username ? p.author.username : p.author || '',
        authorObj: p.author,
        createdAt: p.createdAt,
        likes:
          typeof p.likes === 'number'
            ? p.likes
            : typeof p.reactions?.likes === 'number'
            ? p.reactions.likes
            : 0,
        dislikes:
          typeof p.dislikes === 'number'
            ? p.dislikes
            : typeof p.reactions?.dislikes === 'number'
            ? p.reactions.dislikes
            : 0,
        comments: (p.comments || []).map((c) => ({
          _id: c._id,
          id: c._id,
          content: c.content,
          text: c.content,
          author:
            c.author && c.author.username ? c.author.username : c.author || '',
          authorObj: c.author,
          createdAt: c.createdAt,
        })),
      }));
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

  const visiblePosts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return decoratedPosts.slice(start, start + PAGE_SIZE);
  }, [page, decoratedPosts]);

  const latestPosts = useMemo(() => {
    return [...decoratedPosts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [decoratedPosts]);

  const popularFeed = useMemo(() => {
    return [...decoratedPosts].sort((a, b) => {
      const likeDiff = (b.likes || 0) - (a.likes || 0);
      if (likeDiff !== 0) return likeDiff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [decoratedPosts]);

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const keyword = searchTerm.toLowerCase();
    return decoratedPosts.filter((post) =>
      (post.title || '').toLowerCase().includes(keyword)
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

  const handleOpenPost = (post) => {
    setShowEditor(false);
    setSelectedPostId(post.id);
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
        editing={selectedPostId ? posts.find((p) => p.id === selectedPostId) : null}
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
