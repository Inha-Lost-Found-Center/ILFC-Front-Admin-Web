import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ItemsService } from '../services/items'
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
  message,
  Spin,
} from 'antd'
import { useMemo, useState } from 'react'

type EditableField = 'location' | 'status' | 'description' | 'tags'

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const itemId = Number(id)
  const qc = useQueryClient()
  const [form] = Form.useForm()
  const [editing, setEditing] = useState<EditableField | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['items', itemId],
    queryFn: () => ItemsService.getById(itemId),
    enabled: !!itemId,
  })

  const updateMut = useMutation({
    mutationFn: (body: any) => ItemsService.update(itemId, body),
    onSuccess: () => {
      message.success('수정되었습니다')
      qc.invalidateQueries({ queryKey: ['items', itemId] })
      setEditing(null)
    },
  })

  const fieldMeta = useMemo(() => {
    if (!data) return null
    return {
      location: {
        label: '보관 위치',
        initialValue: data.location ?? '',
        input: <Input placeholder="보관 위치" />,
      },
      status: {
        label: '상태',
        initialValue: data.status,
        input: (
          <Select
            options={['보관', '예약', '찾음'].map((s) => ({ value: s, label: s }))}
          />
        ),
      },
      description: {
        label: '설명',
        initialValue: data.description ?? '',
        input: <Input.TextArea rows={4} />,
      },
      tags: {
        label: '태그',
        initialValue: data.tags?.map((t) => t.name) ?? [],
        input: <Select mode="tags" placeholder="엔터로 태그 추가" />,
      },
    } satisfies Record<EditableField, { label: string; initialValue: any; input: React.ReactNode }>
  }, [data])

  const handleEdit = (field: EditableField) => {
    if (!fieldMeta) return
    setEditing(field)
    form.setFieldsValue({ value: fieldMeta[field].initialValue })
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (!editing) return
    const payload: Record<string, unknown> = {}
    payload[editing] = values.value
    updateMut.mutate(payload)
  }

  if (!data || isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <Spin tip="불러오는 중..." />
      </div>
    )
  }

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 16 }}>
        아이템 상세
      </Typography.Title>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions column={1} bordered size="small" labelStyle={{ width: 140 }}>
          <Descriptions.Item label="보관 위치">
            <Space>
              <span>{data.location || '-'}</span>
              <Button size="small" onClick={() => handleEdit('location')}>
                수정
              </Button>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="상태">
            <Space>
              <Tag color="blue">{data.status}</Tag>
              <Button size="small" onClick={() => handleEdit('status')}>
                수정
              </Button>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="설명">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>{data.description || '설명 없음'}</div>
              <Button size="small" onClick={() => handleEdit('description')}>
                수정
              </Button>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="태그">
            <Space wrap>
              {data.tags?.length
                ? data.tags.map((tag) => <Tag key={tag.id}>{tag.name}</Tag>)
                : '태그 없음'}
              <Button size="small" onClick={() => handleEdit('tags')}>
                수정
              </Button>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="등록 시각">
            {data.registered_at
              ? new Date(data.registered_at).toLocaleString()
              : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {data.photo_url && (
        <Card title="이미지">
          <img
            src={data.photo_url}
            alt="item"
            style={{ maxWidth: '100%', borderRadius: 8 }}
          />
        </Card>
      )}

      <Modal
        open={Boolean(editing)}
        title={editing ? fieldMeta?.[editing].label : ''}
        onCancel={() => setEditing(null)}
        onOk={handleSubmit}
        confirmLoading={updateMut.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={editing ? fieldMeta?.[editing].label : ''}
            name="value"
            rules={[{ required: true, message: '값을 입력하세요' }]}
          >
            {editing ? fieldMeta?.[editing].input : null}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}



