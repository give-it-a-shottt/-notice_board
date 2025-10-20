function SideBar() {
  return (
    <div className="SideBar">
      <div className="sidebar">
        <div className="toggle">메뉴</div>
        <div className="menu">
          <p>오늘의 소식</p>
          <p>인기 글</p>
          <p>카테고리</p>
          <p>검색</p>
          <p>읽기 목록</p>
          <p>고객센터</p>
        </div>
        <button className="logout">로그아웃</button>
      </div>
    </div>
  );
}

export default SideBar;
