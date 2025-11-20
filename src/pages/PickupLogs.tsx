import { Button, Modal, Space, Table, Typography, Descriptions } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { AdminPickupsService } from '../services/pickups'
import type { PickupLog } from '../services/pickups'
import dayjs from 'dayjs'
import { ItemsService } from '../services/items'
import type { Item } from '../types/item'

export default function PickupLogsPage() {
  const [detailItemId, setDetailItemId] = useState<number | null>(null)

  const { data, isFetching } = useQuery({
    queryKey: ['admin', 'pickup-logs'],
    queryFn: () => AdminPickupsService.logs(),
  })

  const itemDetailQuery = useQuery({
    queryKey: ['items', detailItemId],
    queryFn: () => ItemsService.getById(detailItemId as number),
    enabled: detailItemId !== null,
  })

  const columns = [
    { title: '코드', dataIndex: 'code' },
    {
      title: '사용 여부',
      dataIndex: 'is_used',
      render: (v: boolean) => (v ? '사용됨' : '미사용'),
    },
    {
      title: '발급 시각',
      dataIndex: 'generated_at',
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '만료 시각',
      dataIndex: 'expires_at',
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    { title: '사용자 이메일', dataIndex: 'user_email' },
    {
      title: '아이템 ID',
      dataIndex: 'item_id',
      render: (_: number, record: PickupLog) => (
        <Button type="link" onClick={() => setDetailItemId(record.item_id)}>
          {record.item_id}
        </Button>
      ),
    },
    { title: '아이템 설명', dataIndex: 'item_description' },
    { title: '취소 사유', dataIndex: 'cancel_reason', render: (v?: string | null) => v || '-' },
  ]

  const itemDetail: Item | undefined = itemDetailQuery.data

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Typography.Title level={3}>픽업 로그</Typography.Title>
      <Table<PickupLog>
        rowKey="id"
        loading={isFetching}
        dataSource={data || []}
        columns={columns as any}
      />

      <Modal
        title={`아이템 상세 #${detailItemId ?? ''}`}
        open={detailItemId !== null}
        onCancel={() => setDetailItemId(null)}
        footer={null}
        destroyOnClose
      >
        {itemDetailQuery.isLoading ? (
          <Typography.Text>불러오는 중...</Typography.Text>
        ) : itemDetail ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="위치">{itemDetail.location || '-'}</Descriptions.Item>
            <Descriptions.Item label="상태">{itemDetail.status}</Descriptions.Item>
            <Descriptions.Item label="등록 시각">
              {dayjs(itemDetail.registered_at).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="태그">
              {itemDetail.tags?.map((tag) => tag.name).join(', ') || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="이미지">
              {itemDetail.photo_url ? (
                <img src={itemDetail.photo_url} alt="item" style={{ width: '100%', borderRadius: 4 }} />
              ) : (
                '이미지 없음'
              )}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Typography.Text>아이템 정보를 불러오지 못했습니다.</Typography.Text>
        )}
      </Modal>
    </Space>
  )
}


