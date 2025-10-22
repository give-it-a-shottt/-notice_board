import { useEffect, useMemo, useRef, useState } from 'react';

const TEXT = {
  mainFeed: '메인 피드',
  latestNews: '오늘의 소식',
  newest: '최신순',
  popular: '인기글',
  likeTop: '좋아요 TOP',
  search: '검색',
  searchHint: '제목 검색',
  support: '고객센터',
  supportHint: '지원',
  primaryMenu: '주 메뉴',
  category: '카테고리',
  explore: '둘러보기',
  myPosts: '내가 쓴 글',
  myPostsHint: '내가 쓴 글 페이지',
  game: '게임',
  gameHint: '게임 게시판',
  study: '공부',
  studyHint: '공부 게시판',
  dev: '개발',
  devHint: '개발 게시판',
};
const PRIMARY_ITEMS = [
  { id: 'home', label: TEXT.mainFeed, hint: '전체 피드' },
  { id: 'today', label: TEXT.latestNews, hint: TEXT.newest },
  { id: 'popular', label: TEXT.popular, hint: TEXT.likeTop },
];

const TAIL_ITEMS = [
  { id: 'search', label: TEXT.search, hint: TEXT.searchHint },
  { id: 'support', label: TEXT.support, hint: TEXT.supportHint },
];

const CATEGORY_ITEMS = [
  { id: 'myPosts', label: TEXT.myPosts, hint: TEXT.myPostsHint },
  { id: 'gameBoard', label: TEXT.game, hint: TEXT.gameHint },
  { id: 'studyBoard', label: TEXT.study, hint: TEXT.studyHint },
  { id: 'devBoard', label: TEXT.dev, hint: TEXT.devHint },
];

const renderButton = (item, activeView, onChangeView) => (
  <button
    key={item.id}
    type="button"
    className={`menu-item${activeView === item.id ? ' is-active' : ''}`}
    onClick={() => onChangeView(item.id)}
  >
    <span className="menu-item__label">{item.label}</span>
    <span className="menu-item__hint">{item.hint}</span>
  </button>
);

function SideBar({ activeView = 'home', onChangeView = () => {} }) {
  const categoryIds = useMemo(
    () => CATEGORY_ITEMS.map((item) => item.id),
    [],
  );
  const [categoryOpen, setCategoryOpen] = useState(false);
  const menuGroupRef = useRef(null);
  const selectedCategoryId = categoryIds.includes(activeView)
    ? activeView
    : null;
  const groupExpanded = categoryOpen && CATEGORY_ITEMS.length > 0;

  useEffect(() => {
    if (!selectedCategoryId) {
      setCategoryOpen(false);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    if (!groupExpanded) return;
    const handlePointerDown = (event) => {
      if (
        menuGroupRef.current &&
        !menuGroupRef.current.contains(event.target)
      ) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [groupExpanded]);

  const handleCategoryClick = () => {
    const nextOpen = !categoryOpen;
    setCategoryOpen(nextOpen);
    if (nextOpen && !selectedCategoryId && CATEGORY_ITEMS.length > 0) {
      onChangeView(CATEGORY_ITEMS[0].id);
    }
  };

  const handleSelectCategory = (id) => {
    onChangeView(id);
    setCategoryOpen(false);
  };

  const menuGroupClassName = [
    'menu-group',
    groupExpanded ? 'is-active' : '',
    selectedCategoryId ? 'has-selection' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className="SideBar">
      <div className="sidebar">
        <div className="toggle">MENU</div>
        <nav className="menu" aria-label={TEXT.primaryMenu}>
          {PRIMARY_ITEMS.map((item) =>
            renderButton(item, activeView, onChangeView),
          )}

          <div
            ref={menuGroupRef}
            className={menuGroupClassName}
            data-open={groupExpanded ? 'true' : 'false'}
          >
            <button
              type="button"
              className={`menu-item menu-item--group${
                groupExpanded ? ' is-active' : ''
              }${selectedCategoryId ? ' is-selected' : ''}`}
              aria-haspopup="true"
              aria-expanded={groupExpanded}
              onClick={handleCategoryClick}
            >
              <span className="menu-item__label">{TEXT.category}</span>
              <span className="menu-item__hint">{TEXT.explore}</span>
            </button>
            <div className="menu-sub">
              {CATEGORY_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`menu-sub__item${
                    activeView === item.id ? ' is-active' : ''
                  }`}
                  onClick={() => handleSelectCategory(item.id)}
                >
                  <span className="menu-sub__label">{item.label}</span>
                  <span className="menu-sub__hint">{item.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {TAIL_ITEMS.map((item) =>
            renderButton(item, activeView, onChangeView),
          )}
        </nav>
      </div>
    </aside>
  );
}

export default SideBar;




