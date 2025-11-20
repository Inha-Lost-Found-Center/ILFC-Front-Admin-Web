import { Button, Form, Input, Modal, Select, Space, Switch, Table, message } from 'antd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { AdminUsersService } from '../services/users'
import type { AdminUser } from '../services/users'

export default function UsersPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [form] = Form.useForm()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => AdminUsersService.list().then((r) => r.data),
  })

  const createMut = useMutation({
    mutationFn: (body: Parameters<typeof AdminUsersService.create>[0]) => AdminUsersService.create(body),
    onSuccess: () => {
      message.success('사용자가 생성되었습니다')
      setOpen(false); form.resetFields()
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  const updateMut = useMutation({
    mutationFn: (payload: { id: string; data: Partial<AdminUser> }) => AdminUsersService.update(payload.id, payload.data),
    onSuccess: () => {
      message.success('수정되었습니다')
      setOpen(false); setEditing(null); form.resetFields()
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => AdminUsersService.remove(id),
    onSuccess: () => {
      message.success('삭제되었습니다')
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  const resetPwMut = useMutation({
    mutationFn: (id: string) => AdminUsersService.resetPassword(id),
    onSuccess: (r) => {
      const t = r.data.resetToken || r.data.tempPassword
      message.success(`초기화 완료: ${t ?? '발급됨'}`)
    },
  })

  const onSubmit = async () => {
    const v = await form.validateFields()
    if (editing) {
      updateMut.mutate({ id: editing.id, data: v })
    } else {
      createMut.mutate(v)
    }
  }

  const columns = useMemo(
    () => [
      { title: '이메일', dataIndex: 'email' },
      { title: '이름', dataIndex: 'name' },
      { title: '전화', dataIndex: 'phone' },
      { title: '권한', dataIndex: 'role' },
      { title: '활성', dataIndex: 'isActive', render: (v: boolean) => (v ? '활성' : '중지') },
      {
        title: '액션',
        render: (_: unknown, record: AdminUser) => (
          <Space>
            <Button size="small" onClick={() => { setEditing(record); setOpen(true); form.setFieldsValue(record) }}>수정</Button>
            <Button size="small" onClick={() => resetPwMut.mutate(record.id)}>비밀번호 초기화</Button>
            <Button size="small" danger loading={deleteMut.isPending} onClick={() => deleteMut.mutate(record.id)}>삭제</Button>
          </Space>
        ),
      },
    ],
    [deleteMut.isPending, form, resetPwMut.isPending]
  )

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => { setEditing(null); setOpen(true); form.resetFields() }}>사용자 추가</Button>
      </Space>
      <Table rowKey="id" loading={isLoading} dataSource={data || []} columns={columns as any} />

      <Modal
        title={editing ? '사용자 수정' : '사용자 추가'}
        open={open}
        onCancel={() => { setOpen(false); setEditing(null) }}
        onOk={onSubmit}
        confirmLoading={createMut.isPending || updateMut.isPending}
      >
        <Form form={form} layout="vertical" initialValues={{ role: 'STAFF', isActive: true }}>
          {!editing && (
            <Form.Item label="이메일" name="email" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="admin@example.com" />
            </Form.Item>
          )}
          {!editing && (
            <Form.Item label="비밀번호" name="password" rules={[{ required: true, min: 6 }]}>
              <Input.Password placeholder="초기 비밀번호" />
            </Form.Item>
          )}
          <Form.Item label="이름" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="전화번호" name="phone">
            <Input />
          </Form.Item>
          <Form.Item label="권한" name="role">
            <Select options={['ADMIN', 'STAFF', 'USER'].map((v) => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item label="활성화" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}


