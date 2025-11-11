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
      console.error('Login error:', e)
      console.error('Response:', e?.response)
      console.error('Response data:', e?.response?.data)
      
      // 더 자세한 에러 메시지 표시
      let errorMessage = '로그인에 실패했습니다.'
      
      if (e?.response?.status === 401) {
        errorMessage = e?.response?.data?.message || e?.response?.data?.detail || '이메일 또는 비밀번호가 올바르지 않습니다.'
      } else if (e?.response?.status === 400) {
        errorMessage = e?.response?.data?.message || e?.response?.data?.detail || '잘못된 요청입니다.'
      } else if (e?.response?.status >= 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      } else if (e?.message) {
        errorMessage = e.message
      }
      
      message.error(errorMessage)
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


