import { useQuery } from '@tanstack/react-query'
import { Card, Row, Col, Input, Select, Table, Image, Tag, Space, Typography, Empty, Button } from 'antd'
import {
    SearchOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    InboxOutlined,
    EyeOutlined,
} from '@ant-design/icons'
import { ItemsService } from '../services/items'
import type { Item, ItemStatus } from '../types/item'
import dayjs from 'dayjs'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const statusConfig: Record<ItemStatus, { color: string; icon: React.ReactNode }> = {
    '보관': { color: 'blue', icon: <InboxOutlined /> },
    '예약': { color: 'orange', icon: <CalendarOutlined /> },
    '찾음': { color: 'green', icon: <CheckCircleOutlined /> },
}

export default function ItemsList() {
    const navigate = useNavigate()
    const [searchText, setSearchText] = useState('')
    const [statusFilter, setStatusFilter] = useState<ItemStatus | 'all'>('all')

    const { data: items, isLoading, error } = useQuery({
        queryKey: ['items'],
        queryFn: ItemsService.getAll,
        staleTime: 1000 * 30,
    })

    const filteredItems = useMemo(() => {
        if (!items) return []
        
        let filtered = items

        // 상태 필터
        if (statusFilter !== 'all') {
            filtered = filtered.filter((item) => item.status === statusFilter)
        }

        // 검색 필터 (위치, 태그에서 검색)
        if (searchText) {
            const searchLower = searchText.toLowerCase()
            filtered = filtered.filter((item) => {
                return (
                    item.location.toLowerCase().includes(searchLower) ||
                    item.tags.some((tag) => tag.name.toLowerCase().includes(searchLower))
                )
            })
        }

        return filtered
    }, [items, statusFilter, searchText])

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: '이미지',
            dataIndex: 'photo_url',
            key: 'photo',
            width: 120,
            render: (url: string) => (
                <Image
                    src={url}
                    alt="item"
                    width={80}
                    height={80}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZTwvdGV4dD48L3N2Zz4="
                />
            ),
        },
        {
            title: '상태',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: ItemStatus) => {
                const config = statusConfig[status]
                return (
                    <Tag color={config.color} icon={config.icon}>
                        {status}
                    </Tag>
                )
            },
        },
        {
            title: '위치',
            dataIndex: 'location',
            key: 'location',
            render: (location: string) => (
                <Space>
                    <EnvironmentOutlined style={{ color: '#999' }} />
                    {location}
                </Space>
            ),
        },
        {
            title: '태그',
            dataIndex: 'tags',
            key: 'tags',
            render: (tags: Item['tags']) => (
                <Space wrap>
                    {tags.map((tag) => (
                        <Tag key={tag.id}>{tag.name}</Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: '등록일',
            dataIndex: 'registered_at',
            key: 'registered_at',
            width: 180,
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
            sorter: (a: Item, b: Item) => dayjs(a.registered_at).valueOf() - dayjs(b.registered_at).valueOf(),
        },
        {
            title: '작업',
            key: 'action',
            width: 100,
            render: (_: unknown, record: Item) => (
                <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/items/${record.id}`)}
                >
                    상세
                </Button>
            ),
        },
    ]

    if (error) {
        return (
            <Card>
                <Empty description="데이터를 불러오는 중 오류가 발생했습니다." />
            </Card>
        )
    }

    return (
        <div>
            <Title level={2} style={{ marginBottom: 24 }}>분실물 목록</Title>

            {/* 필터 영역 */}
            <Card style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                    <Col xs={24} sm={12} md={8}>
                        <Search
                            placeholder="위치 또는 태그로 검색"
                            allowClear
                            enterButton={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onSearch={(value) => setSearchText(value)}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="상태 필터"
                            value={statusFilter}
                            onChange={(value) => setStatusFilter(value)}
                        >
                            <Option value="all">전체</Option>
                            <Option value="보관">보관</Option>
                            <Option value="예약">예약</Option>
                            <Option value="찾음">찾음</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            {/* 통계 정보 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{filteredItems.length}</div>
                            <div style={{ color: '#999' }}>전체 아이템</div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                                {filteredItems.filter((i) => i.status === '보관').length}
                            </div>
                            <div style={{ color: '#999' }}>보관</div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                                {filteredItems.filter((i) => i.status === '예약').length}
                            </div>
                            <div style={{ color: '#999' }}>예약</div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                                {filteredItems.filter((i) => i.status === '찾음').length}
                            </div>
                            <div style={{ color: '#999' }}>찾음</div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* 테이블 */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredItems}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `총 ${total}개`,
                    }}
                    locale={{
                        emptyText: <Empty description="등록된 분실물이 없습니다." />,
                    }}
                />
            </Card>
        </div>
    )
}

