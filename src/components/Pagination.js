import React from 'react';

const TEXT = {
  prev: '이전',
  next: '다음',
};

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const goPrev = () => onChange(Math.max(1, page - 1));
  const goNext = () => onChange(Math.min(totalPages, page + 1));

  return (
    <div className="pagination">
      <button type="button" onClick={goPrev} disabled={page === 1}>
        {TEXT.prev}
      </button>
      <span className="pagination__page">
        {page} / {totalPages}
      </span>
      <button type="button" onClick={goNext} disabled={page === totalPages}>
        {TEXT.next}
      </button>
    </div>
  );
}

export default Pagination;
