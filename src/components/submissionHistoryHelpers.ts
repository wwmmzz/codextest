export function formatSubmittedAt(submittedAt: number) {
  return new Date(submittedAt).toLocaleString()
}

export function formatSubmissionValue(value: unknown) {
  return JSON.stringify(value) ?? String(value)
}
