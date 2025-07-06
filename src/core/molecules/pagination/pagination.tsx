import { component$ } from "@builder.io/qwik";
import { BaseComponentProps, mergeClasses } from "../../../design-system/props";
import { Button } from "../../atoms/button/button";
import { Row } from "../../../layouts/row";
import { Stack } from "../../../layouts/stack";

export interface PaginationProps extends BaseComponentProps<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  maxVisiblePages?: number;
  size?: "sm" | "md" | "lg";
  showPageInfo?: boolean;
}

export const Pagination = component$<PaginationProps>(({
  currentPage,
  totalPages,
  maxVisiblePages = 5,
  size = "md",
  showPageInfo = true,
  class: qwikClass,
  className,
  style,
  ...props
}) => {
  const getVisiblePages = () => {
    const pages: number[] = [];
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const paginationClasses = mergeClasses(
    "pagination",
    `pagination-${size}`,
    qwikClass,
    className
  );

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();

  return (
    <div class="themed-content">
      <Stack class={paginationClasses} style={style} alignItems="center" gap="4" {...props}>
      <Row alignItems="center" gap="2" class="pagination-controls">
        {/* Previous Page */}
        {currentPage > 1 && (
          <Button 
            class="pagination-btn pagination-prev" 
            intent="neutral"
            size={size}
            disabled
          >
            ⟨ Previous
          </Button>
        )}

        {/* Page Numbers */}
        {visiblePages.map((page) => (
          <Button
            key={page}
            class={[
              "pagination-btn",
              "pagination-page",
              page === currentPage && "pagination-current"
            ].filter(Boolean).join(" ")}
            intent={page === currentPage ? "primary" : "neutral"}
            size={size}
          >
            {page}
          </Button>
        ))}

        {/* Next Page */}
        {currentPage < totalPages && (
          <Button 
            class="pagination-btn pagination-next" 
            intent="neutral"
            size={size}
            disabled
          >
            Next ⟩
          </Button>
        )}
      </Row>

      {/* Page Info */}
      {showPageInfo && (
        <div class="pagination-info text-sm text-neutral-dark">
          Page {currentPage} of {totalPages}
        </div>
      )}
      </Stack>
    </div>
  );
});
