import { getPaginationItems } from '@/lib/pagination';

import PageLink from './PageLink';
import './Pagination.css';

export type Props = {
  currentPage: number;
  lastPage: number;
  maxLength: number;
  setCurrentPage: (page: number) => void;
};

export  function Pagination({ currentPage, lastPage, maxLength, setCurrentPage }: Props) {
  const pageNums = getPaginationItems(currentPage, lastPage, maxLength);

  return (
    <nav className="pagination" aria-label="Pagination">
      <PageLink disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
        &lt;
      </PageLink>
      {pageNums.map((pageNum, idx) => (
        <PageLink
          key={idx}
          active={currentPage === pageNum}
          disabled={isNaN(pageNum)}
          onClick={() => {
            setCurrentPage(pageNum);
          }}
        >
          {!isNaN(pageNum) ? pageNum : '...'}
        </PageLink>
      ))}
      <PageLink disabled={currentPage === lastPage} onClick={() => setCurrentPage(currentPage + 1)}>
        &gt;
      </PageLink>
    </nav>
  );
}

type SlidingPaginationProps = {
  currentPage: number
  lastPage: number
  maxLength: number
  setCurrentPage: (page: number) => void
}



export default function SlidingPagination({
  currentPage,
  lastPage,
  maxLength,
  setCurrentPage,
}: SlidingPaginationProps) {
  if (lastPage <= 1) return null;

  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  // calculate start and end
  let startPage = Math.max(1, currentPage - Math.floor(maxLength / 2));
  let endPage = startPage + maxLength - 1;

  if (endPage > lastPage) {
    endPage = lastPage;
    startPage = Math.max(1, endPage - maxLength + 1);
  }

  const pages = range(startPage, endPage);

  return (
    <nav className="pagination flex items-center gap-1" aria-label="Pagination">
      {/* Previous */}
      <PageLink
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        &lt;
      </PageLink>

      {/* First page + ellipsis */}
      {startPage > 1 && (
        <>
          <PageLink
            active={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            1
          </PageLink>
          {startPage > 2 && <span className="px-2">…</span>}
        </>
      )}

      {/* Middle pages */}
      {pages.map((page) => (
        <PageLink
          key={page}
          active={currentPage === page}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </PageLink>
      ))}

      {/* Last page + ellipsis */}
      {endPage < lastPage && (
        <>
          {endPage < lastPage - 1 && <span className="px-2">…</span>}
          <PageLink
            active={currentPage === lastPage}
            onClick={() => setCurrentPage(lastPage)}
          >
            {lastPage}
          </PageLink>
        </>
      )}

      {/* Next */}
      <PageLink
        disabled={currentPage === lastPage}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        &gt;
      </PageLink>
    </nav>
  );
}
