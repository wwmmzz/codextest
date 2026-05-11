import { ArrowLeftOutlined, PlayCircleOutlined, SendOutlined } from '@ant-design/icons'
import { Button, Card, Descriptions, Empty, Space, Tabs, Tag, Typography } from 'antd'
import { Link, Navigate, useParams } from 'react-router-dom'
import { difficultyColor, getProblemById } from '../data/problems'

function formatValue(value: unknown) {
  return JSON.stringify(value)
}

export default function ProblemDetailPage() {
  const { problemId } = useParams()
  const problem = getProblemById(problemId)

  if (!problem) {
    return <Navigate to="/problems" replace />
  }

  const allTests = [...problem.visibleTests, ...problem.hiddenTests]

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
          <Button icon={<PlayCircleOutlined />}>运行示例</Button>
          <Button type="primary" icon={<SendOutlined />}>
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
                  <Typography.Text className="muted">
                    本地提交记录会在接入 IndexedDB 后显示。
                  </Typography.Text>
                ),
              },
            ]}
          />
        </Card>

        <Space direction="vertical" size={16}>
          <Card title="代码编辑器" className="panel">
            <pre className="code-preview">{problem.starterCode}</pre>
          </Card>
          <Card title="运行结果" className="panel">
            <Typography.Text className="muted">
              QuickJS Worker 判题结果会显示在这里。
            </Typography.Text>
          </Card>
        </Space>
      </div>
    </div>
  )
}
