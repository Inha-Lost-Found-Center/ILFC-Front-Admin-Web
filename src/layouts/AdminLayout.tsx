import { Layout, Menu, Switch, theme, Avatar, Dropdown, Button } from 'antd'
import {
    DashboardOutlined,
    LogoutOutlined,
    UserOutlined,
    PlusOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuthStore } from '../store/auth'
import { AuthService } from '../services/auth'
import { message } from 'antd'

const { Header, Sider, Content } = Layout

type AdminLayoutProps = {
    headerRight?: ReactNode
}

export default function AdminLayout({ headerRight }: AdminLayoutProps) {
    const location = useLocation()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(false)
  const { token } = theme.useToken()
  const tokens = useAuthStore((s) => s.tokens)
  const setTokens = useAuthStore((s) => s.setTokens)

    const selectedKeys = useMemo(() => {
        const path = location.pathname
        if (path.startsWith('/dashboard')) return ['dashboard']
        if (path.startsWith('/items')) {
            if (path.includes('/register')) return ['items-register']
            return ['items-list']
        }
        return []
    }, [location.pathname])

  const handleLogout = async () => {
    try {
      await AuthService.logout()
    } catch (e) {
      // 로그아웃 실패해도 클라이언트에서 처리
    } finally {
      setTokens(null)
      message.success('로그아웃되었습니다')
      navigate('/login', { replace: true })
    }
  }

  const userMenuItems = [
    {
      key: 'logout',
      label: '로그아웃',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  // JWT 토큰에서 이메일 추출 (임시 처리)
  const getUserEmail = () => {
    if (!tokens?.access_token) return '관리자'
    try {
      const payload = JSON.parse(atob(tokens.access_token.split('.')[1]))
      return payload.sub || '관리자'
    } catch {
      return '관리자'
    }
  }

    return (
    <Layout style={{ minHeight: '100vh', background: isDark ? token.colorBgBase : undefined }}>
            <Sider breakpoint="lg" collapsedWidth={64}>
                <div
                    style={{
                        height: 48,
                        margin: 16,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 700,
                    }}
                >
                    ILFC Admin
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={selectedKeys}
                    items={[
                        {
                            key: 'dashboard',
                            icon: <DashboardOutlined />,
                            label: <Link to="/dashboard">대시보드</Link>,
                        },
                        {
                            key: 'items-list',
                            icon: <UnorderedListOutlined />,
                            label: <Link to="/items">분실물 목록</Link>,
                        },
                        {
                            key: 'items-register',
                            icon: <PlusOutlined />,
                            label: <Link to="/items/register">분실물 등록</Link>,
                        },
                    ]}
                />
            </Sider>
            <Layout>
        <Header
                    style={{
            background: isDark ? token.colorBgElevated : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 16px',
                    }}
                >
                    <div />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: isDark ? token.colorText : undefined }}>Dark</span>
            <Switch checked={isDark} onChange={setIsDark} />
                        {headerRight}
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <Button 
                                type="text" 
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 8,
                                  color: isDark ? token.colorText : undefined 
                                }}
                            >
                                <Avatar size="small" icon={<UserOutlined />} />
                                <span>{getUserEmail()}</span>
                            </Button>
                        </Dropdown>
                    </div>
                </Header>
                <Content style={{ margin: 24 }}>
          <div style={{ background: isDark ? token.colorBgElevated : '#fff', padding: 24, minHeight: 360, borderRadius: 8 }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    )
}


