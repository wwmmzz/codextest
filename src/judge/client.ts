import type { JudgeRequest, JudgeWorkerMessage, JudgeWorkerResponse } from './types'

export function createJudgeWorker() {
  return new Worker(new URL('./worker.ts', import.meta.url), {
    type: 'module',
  })
}

export function postJudgeRequest(worker: Worker, request: JudgeRequest) {
  worker.postMessage({
    type: 'judge-request',
    request,
  } satisfies JudgeWorkerMessage)
}

export function isJudgeWorkerResponse(
  value: MessageEvent<unknown>,
): value is MessageEvent<JudgeWorkerResponse> {
  return (
    typeof value.data === 'object' &&
    value.data !== null &&
    'type' in value.data
  )
}
