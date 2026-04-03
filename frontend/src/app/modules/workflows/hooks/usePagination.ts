import { useCallback, useEffect, useState } from 'react'

export function usePagination(totalPages: number) {
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [totalPages])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages))
  }, [totalPages])

  const goToNextPage = useCallback(() => {
    setCurrentPage((page) => Math.min(page + 1, totalPages))
  }, [totalPages])

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((page) => Math.max(page - 1, 1))
  }, [])

  const resetPagination = useCallback(() => {
    setCurrentPage(1)
  }, [])

  return {
    currentPage,
    canGoNext: currentPage < totalPages,
    canGoPrevious: currentPage > 1,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    resetPagination,
  }
}
