import { useMemo, useState } from 'react'
import { Button, Form, Input, Modal, Table, Space, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { AdminTagsService } from '../services/tags'
import type { AdminTag } from '../services/tags'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function TagsPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AdminTag | null>(null)
  const [form] = Form.useForm()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'tags'],
    queryFn: () => AdminTagsService.list().then((r) => r.data),
  })

  const createMut = useMutation({
    mutationFn: (body: Parameters<typeof AdminTagsService.create>[0]) => AdminTagsService.create(body),
    onSuccess: () => {
      message.success('태그가 저장되었습니다')
      setOpen(false)
      form.resetFields()
      qc.invalidateQueries({ queryKey: ['admin', 'tags'] })
    },
  })

  const updateMut = useMutation({
    mutationFn: (payload: { id: number; data: { name: string } }) => AdminTagsService.update(payload.id, payload.data),
    onSuccess: () => {
      message.success('태그가 수정되었습니다')
      setOpen(false)
      setEditing(null)
      form.resetFields()
      qc.invalidateQueries({ queryKey: ['admin', 'tags'] })
    },
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => AdminTagsService.remove(id),
    onSuccess: () => {
      message.success('삭제되었습니다')
      qc.invalidateQueries({ queryKey: ['admin', 'tags'] })
    },
  })

  const columns = useMemo(
    () => [
      { title: '이름', dataIndex: 'name' },
      {
        title: '액션',
        key: 'actions',
        render: (_: unknown, record: AdminTag) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                setEditing(record)
                setOpen(true)
                form.setFieldsValue({ name: record.name })
              }}
            >
              수정
            </Button>
            <Button size="small" danger loading={deleteMut.isPending} onClick={() => deleteMut.mutate(record.id)}>
              삭제
            </Button>
          </Space>
        ),
      },
    ],
    [deleteMut.isPending, form]
  )

  const onSubmit = async () => {
    const v = await form.validateFields()
    const body = { name: v.name as string }
    if (editing) {
      updateMut.mutate({ id: editing.id, data: body })
    } else {
      createMut.mutate(body)
    }
  }

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setOpen(true); form.resetFields(); }}>
          태그 추가
        </Button>
      </Space>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={data || []}
        columns={columns as any}
        pagination={false}
      />
      <Modal
        title={editing ? '태그 수정' : '태그 추가'}
        open={open}
        onCancel={() => { setOpen(false); setEditing(null); }}
        onOk={onSubmit}
        confirmLoading={createMut.isPending || updateMut.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="이름" name="name" rules={[{ required: true, message: '이름을 입력하세요' }]}>
            <Input placeholder="예: 전자기기" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}


