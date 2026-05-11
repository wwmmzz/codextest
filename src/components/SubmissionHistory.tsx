import { EyeOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Empty,
  List,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import type { JudgeCaseStatus, JudgeResultStatus } from '../judge'
import type { SubmissionRecord } from '../types/submission'

const submissionStatusText: Record<JudgeResultStatus, string> = {
  accepted: '通过',
  'wrong-answer': '答案错误',
  'runtime-error': '运行错误',
  'time-limit-exceeded': '超出时间限制',
  'internal-error': '内部错误',
}

const submissionStatusColor: Record<JudgeResultStatus, string> = {
  accepted: 'success',
  'wrong-answer': 'error',
  'runtime-error': 'error',
  'time-limit-exceeded': 'warning',
  'internal-error': 'default',
}

const caseStatusText: Record<JudgeCaseStatus, string> = {
  passed: '通过',
  failed: '失败',
  'runtime-error': '运行错误',
  'time-limit-exceeded': '超时',
}

const caseStatusColor: Record<JudgeCaseStatus, string> = {
  passed: 'success',
  failed: 'error',
  'runtime-error': 'error',
  'time-limit-exceeded': 'warning',
}

function formatSubmittedAt(submittedAt: number) {
  return new Date(submittedAt).toLocaleString()
}

function formatValue(value: unknown) {
  return JSON.stringify(value) ?? String(value)
}

export function SubmissionHistory({
  submissions,
  loading,
  error,
  showProblemLink = false,
}: {
  submissions: SubmissionRecord[]
  loading: boolean
  error: string | null
  showProblemLink?: boolean
}) {
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionRecord | null>(null)

  const columns = useMemo<ColumnsType<SubmissionRecord>>(() => {
    const tableColumns: ColumnsType<SubmissionRecord> = [
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 116,
        render: (status: JudgeResultStatus) => (
          <Tag color={submissionStatusColor[status]}>
            {submissionStatusText[status]}
          </Tag>
        ),
      },
    ]

    if (showProblemLink) {
      tableColumns.push({
        title: '题目',
        dataIndex: 'problemTitle',
        key: 'problemTitle',
        render: (_value, submission) => (
          <Link to={`/problems/${submission.problemId}`}>
            <Typography.Text strong>{submission.problemTitle}</Typography.Text>
          </Link>
        ),
      })
    }

    tableColumns.push(
      {
        title: '通过',
        key: 'passed',
        width: 88,
        render: (_value, submission) => (
          <Typography.Text>
            {submission.passedCount}/{submission.totalCount}
          </Typography.Text>
        ),
      },
      {
        title: '耗时',
        dataIndex: 'durationMs',
        key: 'durationMs',
        width: 88,
        render: (durationMs: number) => `${durationMs}ms`,
      },
      {
        title: '提交时间',
        dataIndex: 'submittedAt',
        key: 'submittedAt',
        width: 190,
        render: (submittedAt: number) => formatSubmittedAt(submittedAt),
      },
      {
        title: '操作',
        key: 'action',
        width: 88,
        render: (_value, submission) => (
          <Button
            icon={<EyeOutlined />}
            type="text"
            onClick={() => setSelectedSubmission(submission)}
          >
            查看
          </Button>
        ),
      },
    )

    return tableColumns
  }, [showProblemLink])

  if (error) {
    return <Alert type="error" showIcon message="读取提交记录失败" description={error} />
  }

  if (!loading && submissions.length === 0) {
    return <Empty description="暂无提交记录" />
  }

  return (
    <>
      <Table
        rowKey="id"
        size="small"
        loading={loading}
        columns={columns}
        dataSource={submissions}
        pagination={{
          pageSize: 8,
          hideOnSinglePage: true,
        }}
        scroll={{ x: showProblemLink ? 760 : 560 }}
      />

      <Drawer
        title="提交详情"
        open={selectedSubmission !== null}
        width={720}
        onClose={() => setSelectedSubmission(null)}
      >
        {selectedSubmission ? (
          <SubmissionDetail submission={selectedSubmission} />
        ) : null}
      </Drawer>
    </>
  )
}

function SubmissionDetail({ submission }: { submission: SubmissionRecord }) {
  return (
    <Space direction="vertical" size={20} style={{ width: '100%' }}>
      <Descriptions
        bordered
        size="small"
        column={1}
        items={[
          {
            key: 'problem',
            label: '题目',
            children: (
              <Link to={`/problems/${submission.problemId}`}>
                {submission.problemTitle}
              </Link>
            ),
          },
          {
            key: 'status',
            label: '状态',
            children: (
              <Tag color={submissionStatusColor[submission.status]}>
                {submissionStatusText[submission.status]}
              </Tag>
            ),
          },
          {
            key: 'summary',
            label: '通过',
            children: `${submission.passedCount}/${submission.totalCount}`,
          },
          {
            key: 'duration',
            label: '耗时',
            children: `${submission.durationMs}ms`,
          },
          {
            key: 'submittedAt',
            label: '提交时间',
            children: formatSubmittedAt(submission.submittedAt),
          },
        ]}
      />

      <div>
        <Typography.Title level={5}>测试用例</Typography.Title>
        <List
          size="small"
          dataSource={submission.result.cases}
          renderItem={(caseResult, index) => (
            <List.Item>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Space wrap>
                  <Typography.Text strong>Case {index + 1}</Typography.Text>
                  <Typography.Text className="muted">
                    {caseResult.testCaseId}
                  </Typography.Text>
                  <Tag color={caseStatusColor[caseResult.status]}>
                    {caseStatusText[caseResult.status]}
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
      </div>

      <div>
        <Typography.Title level={5}>提交代码</Typography.Title>
        <pre className="submission-code-block">{submission.code}</pre>
      </div>
    </Space>
  )
}
