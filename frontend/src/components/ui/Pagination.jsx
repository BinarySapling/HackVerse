import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-2xl ring-1 ring-white/[0.06] bg-white/[0.02] ${className}`}
    >
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Page <span className="font-semibold text-secondary">{currentPage}</span> of{' '}
          <span className="font-semibold text-secondary">{totalPages}</span>
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 !rounded-full"
          >
            <ChevronLeft size={16} />
          </Button>

          {Array.from({ length: totalPages }, (_, idx) => {
            const pageNum = idx + 1;
            if (pageNum === 1 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1) {
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="w-8 h-8 p-0 !rounded-full"
                >
                  {pageNum}
                </Button>
              );
            }
            if (pageNum === 2 || pageNum === totalPages - 1) {
              return (
                <span key={pageNum} className="text-muted px-1">
                  ...
                </span>
              );
            }
            return null;
          })}

          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 !rounded-full"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
