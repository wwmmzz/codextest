import {
  AppstoreOutlined,
  CodeOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { Layout, Menu, Typography, theme } from 'antd'
import type { MenuProps } from 'antd'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import ProblemDetailPage from './pages/ProblemDetailPage'
import ProblemListPage from './pages/ProblemListPage'
import SubmissionsPage from './pages/SubmissionsPage'

const { Header, Content, Sider } = Layout

const navItems: MenuProps['items'] = [
  {
    key: '/problems',
    icon: <AppstoreOutlined />,
    label: <Link to="/problems">题目列表</Link>,
  },
  {
    key: '/submissions',
    icon: <DatabaseOutlined />,
    label: <Link to="/submissions">提交记录</Link>,
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: '设置',
    disabled: true,
  },
]

function App() {
  const location = useLocation()
  const {
    token: { colorBgContainer, colorBorderSecondary },
  } = theme.useToken()

  const selectedKey = location.pathname.startsWith('/submissions')
    ? '/submissions'
    : '/problems'

  return (
    <Layout className="app-shell">
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        theme="light"
        className="app-sider"
      >
        <Link to="/problems" className="brand">
          <CodeOutlined className="brand-icon" />
          <span>AI Judge</span>
        </Link>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={navItems}
          className="app-menu"
        />
      </Sider>

      <Layout>
        <Header
          className="app-header"
          style={{
            background: colorBgContainer,
            borderBottom: `1px solid ${colorBorderSecondary}`,
          }}
        >
          <Typography.Title level={4} className="app-title">
            在线做题平台
          </Typography.Title>
        </Header>
        <Content className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/problems" replace />} />
            <Route path="/problems" element={<ProblemListPage />} />
            <Route path="/problems/:problemId" element={<ProblemDetailPage />} />
            <Route path="/submissions" element={<SubmissionsPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
