import { executeQuickJsTestCase } from './executor'
import { runJudgeRequest } from './runner'
import type { JudgeWorkerMessage, JudgeWorkerResponse } from './types'

type JudgeWorkerScope = {
  onmessage: ((event: MessageEvent<JudgeWorkerMessage>) => void) | null
  postMessage(message: JudgeWorkerResponse): void
}

const worker = self as unknown as JudgeWorkerScope

worker.onmessage = (event: MessageEvent<JudgeWorkerMessage>) => {
  const message = event.data

  if (message.type === 'cancel') {
    return
  }

  void runJudgeRequest(message.request, executeQuickJsTestCase)
    .then((result) => {
      worker.postMessage({
        type: 'judge-result',
        result,
      } satisfies JudgeWorkerResponse)
    })
    .catch((error: unknown) => {
      worker.postMessage({
        type: 'judge-error',
        requestId: message.request.requestId,
        error: error instanceof Error ? error.message : 'Unknown judge error',
      } satisfies JudgeWorkerResponse)
    })
}
