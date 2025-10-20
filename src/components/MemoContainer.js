import React, { useEffect, useMemo, useState } from 'react';
import '../App.css';
import MainContainer from './MainContainer';
import AuthModal from './AuthModal';
import PostEditor from './PostEditor';
import PostView from './PostView';
import Pagination from './Pagination';
import { getUser, clearAuth } from '../auth';
import { fetchPosts, deletePost } from '../api';

const PAGE_SIZE = 5;

function MemoContainer() {
  const [authOpen, setAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getUser());
  const [posts, setPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // load posts from API on mount
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // persist lightweight current user if needed
    if (currentUser) {
      try {
        localStorage.setItem('mp_current_user', JSON.stringify(currentUser));
      } catch {}
    } else {
      localStorage.removeItem('mp_current_user');
    }
  }, [currentUser]);

  async function loadPosts() {
    try {
      const data = await fetchPosts();
      // normalize posts to previous client shape for compatibility
      const mapped = (data || []).map((p) => ({
        _id: p._id,
        id: p._id,
        title: p.title,
        body: p.body,
        content: p.body,
        author:
          p.author && p.author.username ? p.author.username : p.author || '',
        authorObj: p.author,
        createdAt: p.createdAt,
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

  const visiblePosts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return posts.slice(start, start + PAGE_SIZE);
  }, [page, posts]);

  useEffect(() => {
    if (selectedPostId && !posts.some((post) => post.id === selectedPostId)) {
      setSelectedPostId(null);
    }
  }, [posts, selectedPostId]);

  const selectedPost = selectedPostId
    ? posts.find((post) => post.id === selectedPostId)
    : null;

  const toggleEditor = () => {
    if (!currentUser) {
      setAuthOpen(true);
      return;
    }
    setSelectedPostId(null);
    setShowEditor((prev) => !prev);
  };

  const handleLogin = (id) => {
    // id is username string from AuthModal
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
    // refresh list after create/edit
    await loadPosts();
    setShowEditor(false);
    setPage(1);
    if (post && (post._id || post.id)) setSelectedPostId(post._id || post.id);
  };

  const handleEditPost = (post) => {
    // open editor with post
    setSelectedPostId(post.id);
    setShowEditor(true);
  };

  const handleDeletePost = async (post) => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return;
    try {
      await deletePost(post._id || post.id);
      await loadPosts();
      setSelectedPostId(null);
    } catch (err) {
      alert(err.response?.message || err.message || '삭제 실패');
    }
  };

  const handleCommentCreated = async (postId, comment) => {
    // refresh posts
    await loadPosts();
  };

  const handleOpenPost = (post) => {
    setShowEditor(false);
    setSelectedPostId(post.id);
  };

  const handleClosePost = () => setSelectedPostId(null);

  let mainView = null;

  if (showEditor) {
    mainView = (
      <PostEditor
        onSave={handlePostSaved}
        onCancel={() => setShowEditor(false)}
        currentUser={currentUser}
        editing={selectedPost}
      />
    );
  } else if (!selectedPost) {
    mainView = (
      <MainContainer
        posts={visiblePosts}
        onOpenPost={handleOpenPost}
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
        currentUser={currentUser}
      />
    );
  } else {
    mainView = (
      <PostView
        post={selectedPost}
        currentUser={currentUser}
        onBack={handleClosePost}
        onRefresh={loadPosts}
        onRequestLogin={() => setAuthOpen(true)}
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
      />
    );
  }

  return (
    <div className="MemoContainer">
      <div className="top-bar">
        <button
          type="button"
          className="logo"
          onClick={() => setSelectedPostId(null)}
        >
          Jungle
        </button>
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <button className="login" onClick={toggleEditor}>
            {showEditor ? '작성 닫기' : '게시글 작성'}
          </button>
          {currentUser ? (
            <>
              <div style={{ marginLeft: 12, color: '#0f172a' }}>
                {`${currentUser.username || currentUser}님 환영합니다`}
              </div>
              <button className="login" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <button className="login" onClick={() => setAuthOpen(true)}>
              로그인
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: 24 }}>
        {mainView}

        {!showEditor && (
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
