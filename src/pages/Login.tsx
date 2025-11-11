import { Button, Card, Form, Input, Typography, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../services/auth'
import { useAuthStore } from '../store/auth'

export default function Login() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const tokens = await AuthService.login(values)
      setTokens(tokens)
      message.success('로그인 성공')
      navigate('/dashboard', { replace: true })
    } catch (e: any) {
      message.error(e?.response?.data?.message || '로그인 실패')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card style={{ width: 360 }}>
        <Typography.Title level={4} style={{ textAlign: 'center' }}>관리자 로그인</Typography.Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="이메일" name="email" rules={[{ required: true, type: 'email', message: '이메일을 입력하세요' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="비밀번호" name="password" rules={[{ required: true, message: '비밀번호를 입력하세요' }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>로그인</Button>
        </Form>
      </Card>
    </div>
  )
}


