import React from 'react';

const TEXT = {
  prev: '\uc774\uc804',
  next: '\ub2e4\uc74c',
};

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const goPrev = () => onChange(Math.max(1, page - 1));
  const goNext = () => onChange(Math.min(totalPages, page + 1));

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
      }}
    >
      <button onClick={goPrev} disabled={page === 1}>
        {TEXT.prev}
      </button>
      <div>
        {page} / {totalPages}
      </div>
      <button onClick={goNext} disabled={page === totalPages}>
        {TEXT.next}
      </button>
    </div>
  );
}

export default Pagination;
