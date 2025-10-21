const TEXT = {
  mainFeed: '\uba54\uc778\u0020\ud53c\ub4dc',
  latestNews: '\uc624\ub298\uc758\u0020\uc18c\uc2dd',
  newest: '\ucd5c\uc2e0\u0020\uc21c',
  popular: '\uc778\uae30\uae00',
  likeTop: '\uc88b\uc544\uc694\u0020\u0054\u004f\u0050',
  search: '\uac80\uc0c9',
  searchHint: '\uc81c\ubaa9\u0020\uac80\uc0c9',
  support: '\uace0\uac1d\uc13c\ud130',
  supportHint: '\uc9c0\uc6d0',
  primaryMenu: '\uc8fc\u0020\uba54\ub274',
  category: '\uce74\ud14c\uace0\ub9ac',
  explore: '\ub458\ub7ec\ubcf4\uae30',
  game: '\uac8c\uc784',
  dev: '\uac1c\ubc1c',
  chat: '\uc7a1\ub2f5\ubc29',
};

const PRIMARY_ITEMS = [
  { id: 'home', label: TEXT.mainFeed, hint: '\uc804\uccb4\u0020\ud53c\ub4dc' },
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
  return (
    <aside className="SideBar">
      <div className="sidebar">
        <div className="toggle">MENU</div>
        <nav className="menu" aria-label={TEXT.primaryMenu}>
          {PRIMARY_ITEMS.map((item) =>
            renderButton(item, activeView, onChangeView)
          )}

          <div className="menu-group" aria-haspopup="true">
            <button type="button" className="menu-item menu-item--group">
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
            renderButton(item, activeView, onChangeView)
          )}
        </nav>
      </div>
    </aside>
  );
}

export default SideBar;
