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
  game: '게임',
  dev: '개발',
  chat: '잡답방',
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

const CATEGORIES = [TEXT.game, TEXT.dev, TEXT.chat];

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
  const categoryActive = activeView === 'category';

  const handleCategoryClick = () => {
    onChangeView(categoryActive ? '' : 'category');
  };

  return (
    <aside className="SideBar">
      <div className="sidebar">
        <div className="toggle">MENU</div>
        <nav className="menu" aria-label={TEXT.primaryMenu}>
          {PRIMARY_ITEMS.map((item) =>
            renderButton(item, activeView, onChangeView),
          )}

          <div
            className={`menu-group${categoryActive ? ' is-active' : ''}`}
            aria-haspopup="true"
            aria-expanded={categoryActive}
          >
            <button
              type="button"
              className={`menu-item menu-item--group${
                categoryActive ? ' is-active' : ''
              }`}
              onClick={handleCategoryClick}
            >
              <span className="menu-item__label">{TEXT.category}</span>
              <span className="menu-item__hint">{TEXT.explore}</span>
            </button>
            <div className="menu-sub">
              {CATEGORIES.map((category) => (
                <span key={category} className="menu-sub__item">
                  {category}
                </span>
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
