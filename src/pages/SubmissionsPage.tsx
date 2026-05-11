import { Card, Typography } from 'antd'
import { SubmissionHistory } from '../components/SubmissionHistory'
import { useSubmissions } from '../hooks/useSubmissions'

export default function SubmissionsPage() {
  const { submissions, loading, error } = useSubmissions()

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Typography.Title level={2} className="page-title">
            提交记录
          </Typography.Title>
          <Typography.Text className="muted">
            第一阶段会把提交结果保存到浏览器本地数据库。
          </Typography.Text>
        </div>
      </div>

      <Card>
        <SubmissionHistory
          submissions={submissions}
          loading={loading}
          error={error}
          showProblemLink
        />
      </Card>
    </div>
  )
}
