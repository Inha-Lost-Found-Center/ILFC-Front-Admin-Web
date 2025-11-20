import { useState } from 'react'
import { Button, Card, Form, Input, Select, Space, Statistic, Table, message } from 'antd'
import { AdminLockersService } from '../services/lockers'
import type { LockerOpenLog, LockerStatus } from '../services/lockers'
import { useQuery } from '@tanstack/react-query'

export default function LockerControlPage() {
  const [lockerId, setLockerId] = useState<string>('A') // 기본값
  const [status, setStatus] = useState<LockerStatus | null>(null)
  const [logs, setLogs] = useState<LockerOpenLog[]>([])
  const [loading, setLoading] = useState(false)

  const { refetch: refetchStatus } = useQuery({
    queryKey: ['admin', 'lockers', 'status', lockerId],
    queryFn: () => AdminLockersService.status(lockerId).then((r) => r.data),
    enabled: false,
  })

  const checkStatus = async () => {
    const res = await refetchStatus()
    if (res.data) setStatus(res.data)
  }

  const onOpen = async (values: { code: string }) => {
    try {
      setLoading(true)
      const res = await AdminLockersService.open(lockerId, values.code)
      message.success(`결과: ${res.data.result}`)
      const log: LockerOpenLog = {
        id: String(Date.now()),
        lockerId,
        result: res.data.result,
        occurredAt: new Date().toISOString(),
      }
      setLogs((prev) => [log, ...prev].slice(0, 20))
      await checkStatus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card>
        <Space>
          <span>사물함</span>
          <Select
            value={lockerId}
            style={{ width: 160 }}
            onChange={setLockerId}
            options={[
              { value: 'A', label: 'A' },
              { value: 'B', label: 'B' },
            ]}
          />
          <Button onClick={checkStatus}>상태 조회</Button>
        </Space>
      </Card>

      <Card title="사물함 열기 (6자리 코드)">
        <Form layout="inline" onFinish={onOpen}>
          <Form.Item
            name="code"
            rules={[
              { required: true, message: '코드를 입력하세요' },
              { pattern: /^\d{6}$/, message: '6자리 숫자만 입력' },
            ]}
          >
            <Input placeholder="123456" maxLength={6} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              열기
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="현재 상태">
        <Space size={32}>
          <Statistic title="도어" value={status?.door ?? 'UNKNOWN'} />
          {status?.lastOpenedAt && <Statistic title="마지막 오픈" value={new Date(status.lastOpenedAt).toLocaleString()} />}
          {typeof status?.battery === 'number' && <Statistic title="배터리" value={status?.battery} suffix="%" />}
          {typeof status?.temperature === 'number' && <Statistic title="온도" value={status?.temperature} suffix="℃" />}
        </Space>
      </Card>

      <Card title="최근 열기 로그(클라이언트 측 캐시)">
        <Table
          rowKey="id"
          dataSource={logs}
          columns={[
            { title: '시간', dataIndex: 'occurredAt' },
            { title: '사물함', dataIndex: 'lockerId' },
            { title: '결과', dataIndex: 'result' },
          ]}
          pagination={false}
        />
      </Card>
    </Space>
  )
}


