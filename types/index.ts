export type CommonErrorResponse = {
  error?: string
  message?: string
}

export type IPagination<T> = {
  docs: T[]
  totalDocs: number
  offset: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}
