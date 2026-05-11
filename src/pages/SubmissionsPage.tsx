import { Card, Empty, Typography } from 'antd'

export default function SubmissionsPage() {
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
        <Empty description="暂无提交记录" />
      </Card>
    </div>
  )
}
