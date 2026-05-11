import { Button, Card, Input, Space, Table, Tag, Typography } from 'antd'
import type { TableProps } from 'antd'
import { Link } from 'react-router-dom'
import { difficultyColor, problems } from '../data/problems'
import type { Problem, ProblemStatus } from '../types/problem'

type ProblemRow = Problem & {
  status: ProblemStatus
}

const columns: TableProps<ProblemRow>['columns'] = [
  {
    title: '题目',
    dataIndex: 'title',
    render: (title, row) => <Link to={`/problems/${row.id}`}>{title}</Link>,
  },
  {
    title: '难度',
    dataIndex: 'difficulty',
    width: 120,
    render: (difficulty: Problem['difficulty']) => (
      <Tag color={difficultyColor[difficulty]}>{difficulty}</Tag>
    ),
  },
  {
    title: '标签',
    dataIndex: 'tags',
    render: (tags: string[]) => (
      <Space size={[0, 8]} wrap>
        {tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </Space>
    ),
  },
  {
    title: '测试',
    key: 'tests',
    width: 120,
    render: (_, row) => row.visibleTests.length + row.hiddenTests.length,
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 110,
  },
  {
    title: '操作',
    key: 'action',
    width: 110,
    render: (_, row) => (
      <Button type="link" size="small">
        <Link to={`/problems/${row.id}`}>开始</Link>
      </Button>
    ),
  },
]

export default function ProblemListPage() {
  const rows: ProblemRow[] = problems.map((problem) => ({
    ...problem,
    status: '未开始',
  }))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Typography.Title level={2} className="page-title">
            题目列表
          </Typography.Title>
          <Typography.Text className="muted">
            当前使用静态题库，每道题都包含函数签名、示例测试和隐藏测试。
          </Typography.Text>
        </div>
        <Input.Search
          allowClear
          placeholder="搜索题目"
          style={{ maxWidth: 280 }}
        />
      </div>

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={rows}
          pagination={false}
        />
      </Card>
    </div>
  )
}
