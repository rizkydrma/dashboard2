import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronRight,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';

import { usePagination, DOTS } from './usePagination';
import './pagination.css';

export default function Pagination(props) {
  const {
    totalItems,
    page,
    perPage,
    onChange,
    onNext,
    onPrev,
    siblingCount = 0,
  } = props;
  const paginationRange = usePagination({
    page,
    totalItems,
    siblingCount,
    perPage,
  });

  if (page === 0 || paginationRange.length < 2) {
    return null;
  }

  return (
    <div className="pagination:container">
      <button
        disabled={page === paginationRange.firstPage ? true : false}
        className="pagination:number arrow"
        onClick={() => onPrev()}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>

      {paginationRange &&
        paginationRange.map((pageNumber) => {
          if (pageNumber === DOTS) {
            return (
              <div className="pagination:number dots" key={pageNumber}>
                ...
              </div>
            );
          }

          return (
            <div
              className={`pagination:number ${
                page === pageNumber ? 'pagination:active' : ''
              }`}
              key={pageNumber}
              onClick={() => onChange(pageNumber)}
            >
              {pageNumber}
            </div>
          );
        })}

      <button
        disabled={page === paginationRange.lastPage ? true : false}
        className="pagination:number arrow"
        onClick={() => onNext()}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  );
}
