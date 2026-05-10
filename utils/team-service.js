/*
 * 基线约束（V2.1）：
 * 1. 请求状态仅用 pending/accepted/rejected/cancelled/expired
 * 2. 请求类型仅用 invite/apply
 * 3. 不出现 removed、remove_vote 等旧名称
 * 4. 统一响应格式：{ code, message, data: { list } }
 * 5. 操作按钮（接受/拒绝/取消）将在后续联调接入真接口
 */

const USE_MOCK = true

const BASE_URL = 'https://your-api-domain/api'

// 当前用户 ID：received 过滤 to_user.id === 202，sent 过滤 from_user.id === 202
const CURRENT_USER_ID = 202

const mockData = [
  {
    requestId: 'REQ-20260510-001',
    projectName: '智能课表小程序',
    requestType: 'invite',
    from_user: { id: 201, nickname: '队长小明', major: '计算机科学 22级' },
    to_user: { id: 202, nickname: '我', major: '' },
    status: 'pending',
    createdAt: '05-10 14:20'
  },
  {
    requestId: 'REQ-20260509-002',
    projectName: '智能课表小程序',
    requestType: 'apply',
    from_user: { id: 202, nickname: '我', major: '' },
    to_user: { id: 203, nickname: '林乔', major: '软件工程 22级' },
    status: 'accepted',
    createdAt: '05-09 18:36'
  },
  {
    requestId: 'REQ-20260508-003',
    projectName: '校园跑腿',
    requestType: 'apply',
    from_user: { id: 202, nickname: '我', major: '' },
    to_user: { id: 204, nickname: '项目队长', major: '信息管理 21级' },
    status: 'pending',
    createdAt: '05-08 09:45'
  },
  {
    requestId: 'REQ-20260507-004',
    projectName: '机器学习实践',
    requestType: 'apply',
    from_user: { id: 202, nickname: '我', major: '' },
    to_user: { id: 205, nickname: '许知遥', major: '数据科学 22级' },
    status: 'rejected',
    createdAt: '05-07 12:18'
  },
  {
    requestId: 'REQ-20260506-005',
    projectName: '二手交易市场',
    requestType: 'invite',
    from_user: { id: 206, nickname: '赵敏', major: '电商 21级' },
    to_user: { id: 202, nickname: '我', major: '' },
    status: 'expired',
    createdAt: '05-06 16:05'
  },
  {
    requestId: 'REQ-20260505-006',
    projectName: '宿舍报修系统',
    requestType: 'invite',
    from_user: { id: 201, nickname: '队长小明', major: '计算机科学 22级' },
    to_user: { id: 202, nickname: '我', major: '' },
    status: 'rejected',
    createdAt: '05-05 10:30'
  },
  {
    requestId: 'REQ-20260504-007',
    projectName: '图书漂流平台',
    requestType: 'apply',
    from_user: { id: 202, nickname: '我', major: '' },
    to_user: { id: 207, nickname: '陈知远', major: '软件工程 21级' },
    status: 'cancelled',
    createdAt: '05-04 08:15'
  }
]

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 获取组队请求列表
 * @param {'received'|'sent'} type - 请求方向
 * @returns {Promise<{ code: number, data: { list: Array } }>}
 */
function getRequests(type) {
  if (USE_MOCK) {
    return mockGetRequests(type)
  }
  return realGetRequests(type)
}

/**
 * Mock 请求：模拟 500ms 延迟后返回过滤后的数据
 */
async function mockGetRequests(type) {
  await delay(500)

  const list = mockData.filter(item => {
    if (type === 'received') {
      return item.to_user.id === CURRENT_USER_ID
    }
    return item.from_user.id === CURRENT_USER_ID
  })

  return {
    code: 200,
    message: 'success',
    data: { list }
  }
}

/**
 * 真实接口预留：调用后端 API
 */
async function realGetRequests(type) {
  try {
    const token = wx.getStorageSync('token')
    const res = await wx.request({
      url: `${BASE_URL}/team-requests?type=${type}`,
      method: 'GET',
      header: {
        Authorization: `Bearer ${token}`
      }
    })
    return res.data
  } catch (err) {
    return {
      code: -1,
      message: err.message || '网络异常',
      data: { list: [] }
    }
  }
}

module.exports = {
  getRequests
}
