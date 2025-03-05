export type TFile = {
  name: string
  fileUrl: string
  id?: string
}

export type CustomFile = File & {
  fileUrl?: string
  id?: string
}
