import { Card, Form, Input, Select, Button, Space, Typography, message, Row, Col, Tag, Modal } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ItemStatus } from '../types/item'
import { ItemsService } from '../services/items'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminTagsService } from '../services/tags'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

export default function ItemRegister() {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [tagModalOpen, setTagModalOpen] = useState(false)
    const [newTagName, setNewTagName] = useState('')
    const qc = useQueryClient()

    const { data: tagsData } = useQuery({
        queryKey: ['admin', 'tags'],
        queryFn: () => AdminTagsService.list().then((r) => r.data),
    })

    const createTagMutation = useMutation({
        mutationFn: (name: string) => AdminTagsService.create({ name }),
        onSuccess: (_, variables) => {
            message.success('태그가 추가되었습니다.')
            setTagModalOpen(false)
            setNewTagName('')
            setSelectedTags((prev) =>
                prev.includes(variables) ? prev : [...prev, variables]
            )
            qc.invalidateQueries({ queryKey: ['admin', 'tags'] })
        },
    })

    const handleSubmit = async (values: {
        photo_url: string
        location: string
        status: ItemStatus
        description?: string
    }) => {
        setLoading(true)
        try {
            if (selectedTags.length === 0) {
                message.error('최소 한 개 이상의 태그를 선택하세요.')
                return
            }
            await ItemsService.adminRegister({
                photo_url: values.photo_url,
                device_name: 'ManualRegister',
                location: values.location,
                description: values.description ?? '',
                tags: selectedTags,
            })
            message.success('분실물이 등록되었습니다.')
            form.resetFields()
            setSelectedTags([])
            navigate('/items')
        } catch (error) {
            message.error('등록 중 오류가 발생했습니다.')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        form.resetFields()
        setSelectedTags([])
        navigate('/items')
    }

    return (
        <div>
            <Title level={2} style={{ marginBottom: 24 }}>분실물 등록</Title>

            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        status: '보관',
                    }}
                >
                    <Row gutter={16}>
                        <Col xs={24}>
                            <Form.Item
                                label="이미지 URL"
                                name="photo_url"
                                rules={[{ required: true, message: '이미지 URL을 입력하세요' }]}
                                extra="S3 등 외부 스토리지에 업로드된 이미지 주소를 입력하세요"
                            >
                                <Input placeholder="https://..." />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="위치"
                                name="location"
                                rules={[{ required: true, message: '위치를 입력하세요' }]}
                            >
                                <Input placeholder="예: 학생회관 1층 로비" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="상태"
                                name="status"
                                rules={[{ required: true, message: '상태를 선택하세요' }]}
                            >
                                <Select>
                                    <Option value="보관">보관</Option>
                                    <Option value="예약">예약</Option>
                                    <Option value="찾음">찾음</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="태그"
                        required
                        extra="적용할 태그를 선택하세요. 목록에 없으면 새로운 태그를 추가할 수 있습니다."
                    >
                        <Space wrap>
                            {(tagsData || []).map((tag) => (
                                <Tag.CheckableTag
                                    key={tag.id}
                                    checked={selectedTags.includes(tag.name)}
                                    onChange={(checked) => {
                                        setSelectedTags((prev) =>
                                            checked ? [...prev, tag.name] : prev.filter((t) => t !== tag.name)
                                        )
                                    }}
                                >
                                    {tag.name}
                                </Tag.CheckableTag>
                            ))}
                            <Button size="small" type="dashed" onClick={() => setTagModalOpen(true)}>
                                태그 추가
                            </Button>
                        </Space>
                        {selectedTags.length === 0 && (
                            <div style={{ color: '#ff4d4f', marginTop: 8 }}>최소 한 개 이상의 태그를 선택하세요.</div>
                        )}
                    </Form.Item>

                    <Form.Item
                        label="설명"
                        name="description"
                    >
                        <TextArea
                            rows={4}
                            placeholder="분실물에 대한 추가 설명을 입력하세요"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                등록
                            </Button>
                            <Button onClick={handleCancel}>
                                취소
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            <Modal
                title="새 태그 추가"
                open={tagModalOpen}
                onCancel={() => setTagModalOpen(false)}
                onOk={() => {
                    if (!newTagName.trim()) {
                        message.warning('태그 이름을 입력하세요.')
                        return
                    }
                    createTagMutation.mutate(newTagName.trim())
                }}
                confirmLoading={createTagMutation.isPending}
            >
                <Input
                    placeholder="태그 이름"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onPressEnter={() => {
                        if (!newTagName.trim()) {
                            return
                        }
                        createTagMutation.mutate(newTagName.trim())
                    }}
                />
            </Modal>
        </div>
    )
}

