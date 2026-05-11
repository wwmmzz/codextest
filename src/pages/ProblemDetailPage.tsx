import { ArrowLeftOutlined, PlayCircleOutlined, SendOutlined } from '@ant-design/icons'
import Editor from '@monaco-editor/react'
import { Alert, Button, Card, Descriptions, Empty, List, Space, Tabs, Tag, Typography } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { SubmissionHistory } from '../components/SubmissionHistory'
import { difficultyColor, getProblemById } from '../data/problems'
import { indexedDbSubmissionStorage } from '../db/submissionStorage'
import { useProblemDraft, type DraftSaveStatus } from '../hooks/useProblemDraft'
import { useSubmissions } from '../hooks/useSubmissions'
import {
  createJudgeRequest,
  createJudgeWorker,
  isJudgeWorkerResponse,
  postJudgeRequest,
} from '../judge'
import { saveJudgeSubmission } from '../services/submissions'
import type {
  JudgeCaseStatus,
  JudgeResult,
  JudgeResultStatus,
  JudgeRunMode,
} from '../judge'
import type { Problem } from '../types/problem'

function formatValue(value: unknown) {
  return JSON.stringify(value) ?? String(value)
}

const draftStatusText: Record<DraftSaveStatus, string> = {
  loading: '加载草稿中',
  idle: '草稿已加载',
  saving: '保存中',
  saved: '草稿已保存',
  error: '草稿保存失败',
}

const judgeModeText: Record<JudgeRunMode, string> = {
  run: '运行示例',
  submit: '提交',
}

const judgeStatusText: Record<JudgeResultStatus, string> = {
  accepted: '通过',
  'wrong-answer': '答案错误',
  'runtime-error': '运行错误',
  'time-limit-exceeded': '超出时间限制',
  'internal-error': '内部错误',
}

const judgeStatusColor: Record<JudgeResultStatus, string> = {
  accepted: 'success',
  'wrong-answer': 'error',
  'runtime-error': 'error',
  'time-limit-exceeded': 'warning',
  'internal-error': 'default',
}

const judgeCaseStatusText: Record<JudgeCaseStatus, string> = {
  passed: '通过',
  failed: '失败',
  'runtime-error': '运行错误',
  'time-limit-exceeded': '超时',
}

const judgeCaseStatusColor: Record<JudgeCaseStatus, string> = {
  passed: 'success',
  failed: 'error',
  'runtime-error': 'error',
  'time-limit-exceeded': 'warning',
}

function getResultAlertType(status: JudgeResultStatus) {
  if (status === 'accepted') {
    return 'success'
  }

  if (status === 'time-limit-exceeded') {
    return 'warning'
  }

  return 'error'
}

export default function ProblemDetailPage() {
  const { problemId } = useParams()
  const problem = getProblemById(problemId)

  if (!problem) {
    return <Navigate to="/problems" replace />
  }

  return <ProblemWorkspace key={problem.id} problem={problem} />
}

function ProblemWorkspace({ problem }: { problem: Problem }) {
  const allTests = [...problem.visibleTests, ...problem.hiddenTests]
  const { code, setCode, status } = useProblemDraft(
    problem.id,
    problem.starterCode,
  )
  const [activeMode, setActiveMode] = useState<JudgeRunMode | null>(null)
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null)
  const [judgeError, setJudgeError] = useState<string | null>(null)
  const [submissionSaveError, setSubmissionSaveError] = useState<string | null>(
    null,
  )
  const [submissionRefreshKey, setSubmissionRefreshKey] = useState(0)
  const {
    submissions,
    loading: submissionsLoading,
    error: submissionsError,
  } = useSubmissions(problem.id, submissionRefreshKey)
  const workerRef = useRef<Worker | null>(null)
  const activeRequestIdRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  const runJudge = useCallback(
    (mode: JudgeRunMode) => {
      workerRef.current?.terminate()

      const request = createJudgeRequest(problem, code, mode)
      const worker = createJudgeWorker()

      workerRef.current = worker
      activeRequestIdRef.current = request.requestId
      setActiveMode(mode)
      setJudgeError(null)
      setJudgeResult(null)
      setSubmissionSaveError(null)

      const finishRequest = () => {
        worker.terminate()

        if (workerRef.current === worker) {
          workerRef.current = null
        }

        if (activeRequestIdRef.current === request.requestId) {
          activeRequestIdRef.current = null
          setActiveMode(null)
        }
      }

      worker.onmessage = (event: MessageEvent<unknown>) => {
        if (!isJudgeWorkerResponse(event)) {
          return
        }

        const message = event.data

        if (
          message.type === 'judge-result' &&
          message.result.requestId === request.requestId
        ) {
          const result = message.result

          setJudgeResult(result)

          if (result.mode === 'submit') {
            void saveJudgeSubmission(
              indexedDbSubmissionStorage,
              problem,
              request.code,
              result,
            )
              .then(() => {
                setSubmissionRefreshKey((current) => current + 1)
              })
              .catch((caughtError: unknown) => {
                setSubmissionSaveError(
                  caughtError instanceof Error
                    ? caughtError.message
                    : '提交记录保存失败',
                )
              })
              .finally(finishRequest)
            return
          }

          finishRequest()
          return
        }

        if (
          message.type === 'judge-error' &&
          message.requestId === request.requestId
        ) {
          setJudgeError(message.error)
          finishRequest()
        }
      }

      worker.onerror = (event) => {
        event.preventDefault()
        setJudgeError(event.message || '判题 Worker 运行失败')
        finishRequest()
      }

      postJudgeRequest(worker, request)
    },
    [code, problem],
  )

  const isJudging = activeMode !== null

  return (
    <div className="page">
      <div className="page-header">
        <Space direction="vertical" size={4}>
          <Link to="/problems">
            <Button icon={<ArrowLeftOutlined />} type="text">
              返回题目列表
            </Button>
          </Link>
          <Space align="center" wrap>
            <Typography.Title level={2} className="page-title">
              {problem.title}
            </Typography.Title>
            <Tag color={difficultyColor[problem.difficulty]}>
              {problem.difficulty}
            </Tag>
            {problem.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </Space>
        </Space>
        <Space>
          <Button
            icon={<PlayCircleOutlined />}
            loading={activeMode === 'run'}
            disabled={isJudging && activeMode !== 'run'}
            onClick={() => runJudge('run')}
          >
            运行示例
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={activeMode === 'submit'}
            disabled={isJudging && activeMode !== 'submit'}
            onClick={() => runJudge('submit')}
          >
            提交
          </Button>
        </Space>
      </div>

      <div className="problem-layout">
        <Card className="panel">
          <Tabs
            defaultActiveKey="statement"
            items={[
              {
                key: 'statement',
                label: '题目描述',
                children: (
                  <Space direction="vertical" size={16}>
                    <Typography.Paragraph>{problem.statement}</Typography.Paragraph>

                    <Descriptions
                      bordered
                      size="small"
                      column={1}
                      items={[
                        {
                          key: 'functionName',
                          label: '函数名',
                          children: <code>{problem.functionName}</code>,
                        },
                        {
                          key: 'limits',
                          label: '限制',
                          children: `${problem.timeLimitMs}ms / ${Math.round(
                            problem.memoryLimitBytes / 1024 / 1024,
                          )}MB`,
                        },
                        {
                          key: 'tests',
                          label: '测试用例',
                          children: `${problem.visibleTests.length} visible / ${problem.hiddenTests.length} hidden`,
                        },
                      ]}
                    />

                    <Typography.Title level={4}>示例</Typography.Title>
                    {problem.examples.map((example, index) => (
                      <Card key={`${problem.id}-example-${index}`} size="small">
                        <Typography.Paragraph>
                          <Typography.Text strong>Input: </Typography.Text>
                          <code>{example.input}</code>
                        </Typography.Paragraph>
                        <Typography.Paragraph>
                          <Typography.Text strong>Output: </Typography.Text>
                          <code>{example.output}</code>
                        </Typography.Paragraph>
                        {example.explanation ? (
                          <Typography.Paragraph className="muted">
                            {example.explanation}
                          </Typography.Paragraph>
                        ) : null}
                      </Card>
                    ))}

                    <Typography.Title level={4}>约束</Typography.Title>
                    <ul className="constraint-list">
                      {problem.constraints.map((constraint) => (
                        <li key={constraint}>
                          <code>{constraint}</code>
                        </li>
                      ))}
                    </ul>
                  </Space>
                ),
              },
              {
                key: 'tests',
                label: '测试用例',
                children: allTests.length ? (
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    {allTests.map((testCase) => (
                      <Card key={testCase.id} size="small">
                        <Space direction="vertical" size={6}>
                          <Typography.Text strong>{testCase.id}</Typography.Text>
                          <Typography.Text>
                            Input: <code>{formatValue(testCase.input)}</code>
                          </Typography.Text>
                          <Typography.Text>
                            Expected: <code>{formatValue(testCase.expected)}</code>
                          </Typography.Text>
                        </Space>
                      </Card>
                    ))}
                  </Space>
                ) : (
                  <Empty description="暂无测试用例" />
                ),
              },
              {
                key: 'submissions',
                label: '提交记录',
                children: (
                  <SubmissionHistory
                    submissions={submissions}
                    loading={submissionsLoading}
                    error={submissionsError}
                  />
                ),
              },
            ]}
          />
        </Card>

        <Space direction="vertical" size={16}>
          <Card
            title="代码编辑器"
            className="panel editor-panel"
            extra={
              <Typography.Text className="muted">
                {draftStatusText[status]}
              </Typography.Text>
            }
          >
            <Editor
              height="420px"
              defaultLanguage="javascript"
              language="javascript"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value ?? '')}
              loading="正在加载编辑器..."
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: '"Cascadia Code", Consolas, monospace',
                lineNumbersMinChars: 3,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </Card>
          <Card title="运行结果" className="panel">
            <JudgeResultPanel
              activeMode={activeMode}
              error={judgeError}
              result={judgeResult}
              submissionSaveError={submissionSaveError}
            />
          </Card>
        </Space>
      </div>
    </div>
  )
}

function JudgeResultPanel({
  activeMode,
  error,
  result,
  submissionSaveError,
}: {
  activeMode: JudgeRunMode | null
  error: string | null
  result: JudgeResult | null
  submissionSaveError: string | null
}) {
  if (activeMode) {
    return (
      <Alert
        type="info"
        showIcon
        message={`${judgeModeText[activeMode]}中`}
        description="QuickJS Worker 正在执行测试用例。"
      />
    )
  }

  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message="判题失败"
        description={error}
      />
    )
  }

  if (!result) {
    return <Empty description="运行或提交后会显示判题结果" />
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type={getResultAlertType(result.status)}
        showIcon
        message={
          <Space wrap>
            <Typography.Text strong>
              {judgeModeText[result.mode]}：{judgeStatusText[result.status]}
            </Typography.Text>
            <Tag color={judgeStatusColor[result.status]}>
              {result.passedCount}/{result.totalCount}
            </Tag>
          </Space>
        }
        description={`总耗时 ${result.durationMs}ms`}
      />

      {submissionSaveError ? (
        <Alert
          type="warning"
          showIcon
          message="提交记录保存失败"
          description={submissionSaveError}
        />
      ) : null}

      <List
        size="small"
        dataSource={result.cases}
        renderItem={(caseResult, index) => (
          <List.Item>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Space wrap>
                <Typography.Text strong>Case {index + 1}</Typography.Text>
                <Typography.Text className="muted">
                  {caseResult.testCaseId}
                </Typography.Text>
                <Tag color={judgeCaseStatusColor[caseResult.status]}>
                  {judgeCaseStatusText[caseResult.status]}
                </Tag>
                <Typography.Text className="muted">
                  {caseResult.durationMs}ms
                </Typography.Text>
              </Space>

              {caseResult.error ? (
                <Alert type="error" message={caseResult.error} />
              ) : (
                <Space direction="vertical" size={4}>
                  <Typography.Text className="judge-value">
                    Input: <code>{formatValue(caseResult.input)}</code>
                  </Typography.Text>
                  <Typography.Text className="judge-value">
                    Expected: <code>{formatValue(caseResult.expected)}</code>
                  </Typography.Text>
                  <Typography.Text className="judge-value">
                    Actual: <code>{formatValue(caseResult.actual)}</code>
                  </Typography.Text>
                </Space>
              )}
            </Space>
          </List.Item>
        )}
      />
    </Space>
  )
}
