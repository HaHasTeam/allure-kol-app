export type TRoute = {
  title: string
  name: string
  description: string
  keywords?: string[]
  path: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getPath: (params?: any) => string
  preview?: string
}
