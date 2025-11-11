import { Card, Form, Input, Upload, Select, Button, Space, Typography, message, Row, Col } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ItemStatus } from '../types/item'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

export default function ItemRegister() {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (values: {
        location: string
        status: ItemStatus
        tags: string
        description?: string
        photo?: UploadFile[]
    }) => {
        setLoading(true)
        try {
            // TODO: API 호출 구현
            console.log('등록 데이터:', values)
            console.log('파일:', fileList)
            
            message.success('분실물이 등록되었습니다.')
            form.resetFields()
            setFileList([])
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
        setFileList([])
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
                        name="tags"
                        rules={[{ required: true, message: '태그를 입력하세요' }]}
                        extra="쉼표(,)로 구분하여 입력하세요. 예: 지갑, 카드, 학생증"
                    >
                        <Input placeholder="예: 지갑, 카드, 학생증" />
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

                    <Form.Item
                        label="이미지"
                        name="photo"
                        rules={[{ required: true, message: '이미지를 업로드하세요' }]}
                        extra="분실물 사진을 업로드하세요 (최대 5장)"
                    >
                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            beforeUpload={() => false}
                            maxCount={5}
                            accept="image/*"
                        >
                            {fileList.length < 5 && (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>업로드</div>
                                </div>
                            )}
                        </Upload>
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
        </div>
    )
}

