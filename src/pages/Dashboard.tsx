import { memo, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Row, Col, Statistic, Skeleton, Image, Tag, Space, Typography, Empty } from 'antd'
import {
    InboxOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    AppstoreOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined
} from '@ant-design/icons'
import { ItemsService } from '../services/items'
import type { Item, ItemStatus } from '../types/item'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ko'
import { useNavigate } from 'react-router-dom'

dayjs.extend(relativeTime)
dayjs.locale('ko')

const { Title, Text } = Typography

const statusConfig: Record<ItemStatus, { color: string; icon: React.ReactNode }> = {
    '보관': { color: 'blue', icon: <InboxOutlined /> },
    '예약': { color: 'orange', icon: <CalendarOutlined /> },
    '찾음': { color: 'green', icon: <CheckCircleOutlined /> },
}

const ItemCard = memo(function ItemCard({ item, onSelect }: { item: Item; onSelect: (itemId: number) => void }) {
    const statusInfo = statusConfig[item.status]

    return (
        <Card
            hoverable
            style={{ marginBottom: 16 }}
            onClick={() => onSelect(item.id)}
            cover={
                <div
                    style={{ height: 200, overflow: 'hidden', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Image
                        src={item.photo_url}
                        alt={`Item ${item.id}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        preview
                        fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+"
                    />
                </div>
            }
        >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tag color={statusInfo.color} icon={statusInfo.icon} style={{ fontSize: 12 }}>
                        {item.status}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        #{item.id}
                    </Text>
                </div>

                <div>
                    <Space>
                        <EnvironmentOutlined style={{ color: '#999' }} />
                        <Text>{item.location}</Text>
                    </Space>
                </div>

                <div>
                    <Space wrap>
                        {item.tags.map((tag) => (
                            <Tag key={tag.id} color="default">{tag.name}</Tag>
                        ))}
                    </Space>
                </div>

                <div>
                    <Space>
                        <ClockCircleOutlined style={{ color: '#999' }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(item.registered_at).fromNow()}
                        </Text>
                    </Space>
                </div>
            </Space>
        </Card>
    )
})

export default function Dashboard() {
    const navigate = useNavigate()
    const { data: items, isLoading, error } = useQuery({
        queryKey: ['items'],
        queryFn: ItemsService.getAll,
        staleTime: 1000 * 30, // 30초
    })

    const stats = useMemo(() => {
        if (!items) return { total: 0, stored: 0, reserved: 0, found: 0 }
        return {
            total: items.length,
            stored: items.filter((i) => i.status === '보관').length,
            reserved: items.filter((i) => i.status === '예약').length,
            found: items.filter((i) => i.status === '찾음').length,
        }
    }, [items])

    const recentItems = useMemo(() => {
        if (!items) return []
        return [...items]
            .sort((a, b) => dayjs(b.registered_at).valueOf() - dayjs(a.registered_at).valueOf())
            .slice(0, 10)
    }, [items])

    const handleSelect = useCallback(
        (itemId: number) => {
            navigate(`/items/${itemId}`)
        },
        [navigate]
    )

    if (error) {
        return (
            <Card>
                <Empty description="데이터를 불러오는 중 오류가 발생했습니다." />
            </Card>
        )
    }

    return (
        <div>
            <Title level={2} style={{ marginBottom: 24 }}>대시보드</Title>

            {/* 통계 카드 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="전체 아이템"
                            value={stats.total}
                            prefix={<AppstoreOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="보관"
                            value={stats.stored}
                            prefix={<InboxOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="예약"
                            value={stats.reserved}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="찾음"
                            value={stats.found}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 최근 아이템 */}
            <Card title={<Title level={4} style={{ margin: 0 }}>최근 추가된 아이템</Title>}>
                {isLoading ? (
                    <Row gutter={16}>
                        {[1, 2, 3, 4].map((i) => (
                            <Col xs={24} sm={12} lg={6} key={i}>
                                <Card>
                                    <Skeleton.Image active style={{ width: '100%', height: 200 }} />
                                    <Skeleton active paragraph={{ rows: 3 }} style={{ marginTop: 16 }} />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : recentItems.length === 0 ? (
                    <Empty description="등록된 아이템이 없습니다." />
                ) : (
                    <Row gutter={16}>
                        {recentItems.map((item) => (
                            <Col xs={24} sm={12} lg={6} key={item.id}>
                                <ItemCard item={item} onSelect={handleSelect} />
                            </Col>
                        ))}
                    </Row>
                )}
            </Card>
        </div>
    )
}
