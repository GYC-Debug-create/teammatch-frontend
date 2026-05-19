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
 * Mock 请求：立即返回过滤后的数据
 */
function mockGetRequests(type) {
  var list = mockData.filter(function(item) {
    if (type === 'received') {
      return item.to_user.id === CURRENT_USER_ID
    }
    return item.from_user.id === CURRENT_USER_ID
  })
  return Promise.resolve({
    code: 200,
    message: 'success',
    data: { list: list }
  })
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

/**
 * 接受请求
 */
function acceptRequest(requestId) {
  if (USE_MOCK) {
    return Promise.resolve({ code: 200, message: 'success' })
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/team-requests/${requestId}/accept`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      success(res) {
        if (res.data && res.data.code === 200) resolve(res.data)
        else reject(res.data)
      },
      fail(err) { reject(err) }
    })
  })
}

/**
 * 拒绝请求
 */
function rejectRequest(requestId) {
  if (USE_MOCK) {
    return Promise.resolve({ code: 200, message: 'success' })
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/team-requests/${requestId}/reject`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      success(res) {
        if (res.data && res.data.code === 200) resolve(res.data)
        else reject(res.data)
      },
      fail(err) { reject(err) }
    })
  })
}

/**
 * 取消请求
 */
function cancelRequest(requestId) {
  if (USE_MOCK) {
    return Promise.resolve({ code: 200, message: 'success' })
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/team-requests/${requestId}/cancel`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      success(res) {
        if (res.data && res.data.code === 200) resolve(res.data)
        else reject(res.data)
      },
      fail(err) { reject(err) }
    })
  })
}

/**
 * 获取项目成员列表
 */
function getMembers(projectId) {
  if (USE_MOCK) {
    return Promise.resolve([
      { id: 1, nickname: '江一舟', major: '计算机科学 21级', avatar: '', role: 'leader', status: 'active', exitMode: null, exitDate: null, trustScore: 98 },
      { id: 2, nickname: '林乔', major: '软件工程 22级', avatar: '', role: 'member', status: 'active', exitMode: null, exitDate: null, trustScore: 96 },
      { id: 3, nickname: '周予安', major: '计算机科学 21级', avatar: '', role: 'member', status: 'active', exitMode: null, exitDate: null, trustScore: 91 },
      { id: 4, nickname: '陈知远', major: '软件工程 22级', avatar: '', role: 'member', status: 'exited', exitMode: 'self_exit', exitDate: '05-02', trustScore: 85 },
      { id: 5, nickname: '许之恒', major: '软件工程 21级', avatar: '', role: 'member', status: 'exited', exitMode: 'exit_vote', exitDate: '04-28', trustScore: 72 },
      { id: 6, nickname: '赵一琳', major: '数字媒体 22级', avatar: '', role: 'member', status: 'exited', exitMode: 'exit_vote', exitDate: '04-28', trustScore: 68 }
    ])
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/projects/${projectId}/members`,
      method: 'GET',
      header: { 'Authorization': `Bearer ${wx.getStorageSync('token')}` },
      success(res) {
        if (res.data && res.data.code === 200) resolve(res.data.data.list)
        else reject(res.data)
      },
      fail(err) { reject(err) }
    })
  })
}

/**
 * 成员主动退出项目
 */
function selfExit(projectId, reason) {
  if (USE_MOCK) {
    return Promise.resolve({ code: 200, message: 'success' })
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/projects/${projectId}/members/self-exit`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: { reason },
      success(res) {
        if (res.data && res.data.code === 200) resolve(res.data)
        else reject(res.data)
      },
      fail(err) { reject(err) }
    })
  })
}

/**
 * 获取退出投票详情
 */
function getExitVoteDetail(voteId) {
  if (USE_MOCK) {
    return Promise.resolve({
      id: voteId,
      targetUser: { id: 2, nickname: '林乔', avatar: '', major: '软件工程 22级', trustScore: 96 },
      initiatorId: 1,
      penaltyLevel: 'negotiated',
      status: 'voting',
      totalVoters: 4,
      agreeCount: 2,
      disagreeCount: 1,
      deadlineAt: new Date(Date.now() + 18 * 3600000 + 24 * 60000 + 32 * 1000).toISOString(),
      myVote: null,
      remaining: '',
      voters: [
        { nickname: '陈思语', choice: 'agree' },
        { nickname: '张子涵', choice: 'agree' },
        { nickname: '王悦', choice: 'disagree' }
      ]
    })
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/exit-votes/${voteId}`,
      method: 'GET',
      timeout: 10000,
      header: { 'Authorization': `Bearer ${wx.getStorageSync('token')}` },
      success(res) {
        if (res.data && res.data.code === 200) resolve(res.data.data)
        else reject(res.data)
      },
      fail(err) { reject(err) }
    })
  })
}

/**
 * 提交投票
 */
function submitExitVote(voteId, choice) {
  if (USE_MOCK) {
    return Promise.resolve({ code: 200, message: 'success' })
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/exit-votes/${voteId}/vote`,
      method: 'POST',
      timeout: 10000,
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: { choice },
      success(res) {
        // 409 = 重复投票, 422 = 投票已关闭
        if (res.data && res.data.code === 200) resolve(res.data)
        else reject(res.data)
      },
      fail(err) { reject(err) }
    })
  })
}

/**
 * 关闭投票（队长）
 */
function closeExitVote(voteId) {
  if (USE_MOCK) {
    return Promise.resolve({ code: 200, message: 'success' })
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/exit-votes/${voteId}/close`,
      method: 'POST',
      timeout: 10000,
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      success(res) {
        if (res.data && res.data.code === 200) resolve(res.data)
        else reject(res.data)
      },
      fail(err) { reject(err) }
    })
  })
}

/**
 * 校验评价资格
 * @param {Number} projectId
 * @param {Number} targetUserId
 * @returns {Promise<{ eligible: boolean, reason: string|null }>}
 */
function checkEvaluationEligibility(projectId, targetUserId) {
  if (USE_MOCK) {
    return Promise.resolve({
      eligible: true,
      reason: null
    })
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/evaluations/eligibility?projectId=${projectId}&targetUserId=${targetUserId}`,
      method: 'GET',
      header: { 'Authorization': `Bearer ${wx.getStorageSync('token')}` },
      timeout: 10000,
      success(res) {
        if (res.data && res.data.code === 200) resolve(res.data.data)
        else reject(res.data)
      },
      fail(err) { reject(err) }
    })
  })
}

/**
 * 提交评价
 * @param {Object} params - { projectId, targetUserId, scores, positiveTags, negativeTags, comment, endorsedSkills }
 * @returns {Promise<{ code: number, message: string }>}
 */
function submitEvaluation(params) {
  if (USE_MOCK) {
    return Promise.resolve({ code: 200, message: 'success' })
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/evaluations`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: params,
      timeout: 10000,
      success(res) {
        if (res.data && res.data.code === 200) resolve(res.data)
        else reject(res.data)
      },
      fail(err) { reject(err) }
    })
  })
}

/**
 * 获取当前信誉分
 * @returns {Promise<number>}
 */
function getCurrentCreditScore() {
  if (USE_MOCK) {
    return Promise.resolve(98)
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/me/credit-score`,
      method: 'GET',
      header: { 'Authorization': `Bearer ${wx.getStorageSync('token')}` },
      timeout: 10000,
      success(res) {
        if (res.data && res.data.code === 200) resolve(res.data.data.score)
        else reject(res.data)
      },
      fail(err) { reject(err) }
    })
  })
}

/**
 * 获取信誉分变化历史
 * @returns {Promise<Array>}
 */
function getCreditHistory() {
  if (USE_MOCK) {
    return Promise.resolve([
      { id: 1, changeType: 'evaluation', changeValue: 3, effective: 1, sourceDesc: 'AI创新实践队', desc: '项目互评加分', time: '2024-05-12 14:30' },
      { id: 2, changeType: 'evaluation', changeValue: 2, effective: 1, sourceDesc: '智能课表小程序', desc: '项目互评加分', time: '2024-05-10 10:15' },
      { id: 3, changeType: 'self_exit', changeValue: -10, effective: 1, sourceDesc: '校园跑腿', desc: '主动退出扣分', time: '2024-05-08 09:00' },
      { id: 4, changeType: 'appeal_restore', changeValue: 10, effective: 1, sourceDesc: '处罚撤销', desc: '申诉恢复', time: '2024-05-06 16:45' },
      { id: 5, changeType: 'exit_vote', changeValue: -5, effective: 1, sourceDesc: '机器学习实践', desc: '被投票移除扣分', time: '2024-05-04 11:20' },
      { id: 6, changeType: 'penalty', changeValue: -20, effective: 0, sourceDesc: '违规处罚', desc: '处罚扣分', time: '2024-05-01 08:00' }
    ])
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/me/credit-history`,
      method: 'GET',
      header: { 'Authorization': `Bearer ${wx.getStorageSync('token')}` },
      timeout: 10000,
      success(res) {
        if (res.data && res.data.code === 200) resolve(res.data.data.list)
        else reject(res.data)
      },
      fail(err) { reject(err) }
    })
  })
}

/**
 * 提交举报
 * @param {Object} params - { targetType, targetId, reasons, description, images }
 * @returns {Promise<{ code: number, message: string }>}
 */

/**
 * 获取可申诉对象列表
 * @param {'evaluation'|'penalty'} appealType
 * @returns {Promise<Array>}
 */
function getAppealTargets(appealType) {
  if (USE_MOCK) {
    if (appealType === 'evaluation') {
      return Promise.resolve([
        { id: 101, projectName: 'AI创新实践队', time: '2024-05-12 14:30', avgScore: 2.5, tags: ['沟通差', '延期'] },
        { id: 102, projectName: '智能课表小程序', time: '2024-05-10 10:15', avgScore: 2.0, tags: ['质量低'] }
      ])
    }
    return Promise.resolve([
      { id: 201, penaltyType: '扣分', time: '2024-05-01 08:00', reason: '违规处罚', value: -20 },
      { id: 202, penaltyType: '封禁', time: '2024-04-28 09:00', reason: '恶意行为', value: '账号封禁' }
    ])
  }
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/appeals/targets?type=' + appealType,
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token') },
      timeout: 10000,
      success: function(res) {
        if (res.data && res.data.code === 200) resolve(res.data.data.list)
        else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

/**
 * 提交申诉
 * @param {Object} params - { appealType, targetId, reason, images }
 * @returns {Promise<{ code: number, message: string }>}
 */
function submitAppeal(params) {
  if (USE_MOCK) {
    return Promise.resolve({ code: 200, message: 'success' })
  }
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/appeals',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token'),
        'Content-Type': 'application/json'
      },
      data: params,
      timeout: 10000,
      success: function(res) {
        if (res.data && res.data.code === 200) resolve(res.data)
        else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

/**
 * 获取我的举报列表
 * @returns {Promise<Array>}
 */
function getMyReports() {
  if (USE_MOCK) {
    return Promise.resolve([
      { id: 1, targetType: 'user', targetName: '测试用户A', reasons: ['虚假信息'], description: '该用户发布虚假项目', status: 'pending', createdAt: '2024-05-12 10:30' },
      { id: 2, targetType: 'project', targetName: '测试项目B', reasons: ['侵权内容'], description: '项目使用未授权素材', status: 'resolved', createdAt: '2024-05-10 08:15' }
    ])
  }
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/reports/my',
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token') },
      timeout: 10000,
      success: function(res) {
        if (res.data && res.data.code === 200) resolve(res.data.data.list)
        else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

/**
 * 获取我的申诉列表
 * @returns {Promise<Array>}
 */
function getMyAppeals() {
  if (USE_MOCK) {
    return Promise.resolve([
      { id: 1, appealType: 'evaluation', targetDesc: 'AI创新实践队 互评 3.5分', reason: '评分与事实不符', status: 'pending', createdAt: '2024-05-13 14:20' }
    ])
  }
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/appeals/my',
      method: 'GET',
      header: { 'Authorization': 'Bearer ' + wx.getStorageSync('token') },
      timeout: 10000,
      success: function(res) {
        if (res.data && res.data.code === 200) resolve(res.data.data.list)
        else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

/**
 * 提交举报
 * @param {Object} params - { targetType, targetId, reasons, description, images }
 * @returns {Promise<{ code: number, message: string }>}
 */
function submitReport(params) {
  if (USE_MOCK) {
    return Promise.resolve({ code: 200, message: 'success' })
  }
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}/reports`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: params,
      timeout: 10000,
      success(res) {
        if (res.data && res.data.code === 200) resolve(res.data)
        else reject(res.data)
      },
      fail(err) { reject(err) }
    })
  })
}

module.exports = {
  getRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  getMembers,
  selfExit,
  getExitVoteDetail,
  submitExitVote,
  closeExitVote,
  checkEvaluationEligibility,
  submitEvaluation,
  getCurrentCreditScore,
  getCreditHistory,
  submitReport,
  getAppealTargets,
  submitAppeal,
  getMyReports,
  getMyAppeals
}
