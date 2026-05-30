/*
 * TeamMatch 组队/互评/治理 Service 层
 * M2 联调配对清单：docs/M2后端接口对照.md
 * 统一响应格式：{ code: 200, message: "success", data: ... }
 */

var USE_MOCK = false
var BASE_URL = 'http://localhost:8080/api'

// ========== 辅助函数 ==========

var TOKEN_KEYS = ['token', 'accessToken', 'userToken', 'sessionToken']

function getToken() {
  for (var i = 0; i < TOKEN_KEYS.length; i++) {
    var t = wx.getStorageSync(TOKEN_KEYS[i])
    if (t) return t
  }
  return ''
}

function getUserId() {
  var app = getApp()
  return (app && app.globalData && app.globalData.userId) || 0
}

function authHeader() {
  return {
    'Authorization': 'Bearer ' + getToken(),
    'Content-Type': 'application/json'
  }
}

/**
 * 通用成功码判断（兼容后端 "00000" 或 200）
 */
function isSuccessCode(code) {
  return code === 200 || code === '00000' || code === 0
}

// ========== 方法 1-4：组队请求 ==========

/**
 * 获取组队请求列表
 * @param {'received'|'sent'} direction
 */
function getRequests(direction) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/m4/team-requests?userId=' + getUserId() + '&direction=' + direction,
      method: 'GET',
      header: authHeader(),
      timeout: 10000,
      success: function(res) {
        console.log('[getRequests] 原始响应:', JSON.stringify(res.data))
        if (res.data) {
          var code = res.data.code
          // 兼容 code: 200（数字）或 code: "00000"（字符串）或 code: 0
          var ok = (code === 200 || code === '00000' || code === 0)
          if (ok) {
            var body = res.data
            // 统一归一化，兼容后端 data 为数组格式
            if (Array.isArray(body.data)) {
              resolve({ code: 200, data: { list: body.data } })
            } else {
              resolve({ code: 200, data: body.data })
            }
            return
          }
        }
        reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

/**
 * 接受请求
 */
function acceptRequest(requestId) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/m4/team-requests/' + requestId + '/accept?operatorId=' + getUserId(),
      method: 'POST',
      header: authHeader(),
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) resolve(res.data)
        else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

/**
 * 拒绝请求
 */
function rejectRequest(requestId) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/m4/team-requests/' + requestId + '/reject?operatorId=' + getUserId(),
      method: 'POST',
      header: authHeader(),
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) resolve(res.data)
        else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

/**
 * 取消请求
 */
function cancelRequest(requestId) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/m4/team-requests/' + requestId + '/cancel?operatorId=' + getUserId(),
      method: 'POST',
      header: authHeader(),
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) resolve(res.data)
        else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

// ========== 方法 5：项目成员 ==========

/**
 * 获取项目成员列表
 */
function getMembers(projectId) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/m4/projects/' + projectId + '/members',
      method: 'GET',
      header: authHeader(),
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) {
          // 兼容 data 为数组格式
          if (Array.isArray(res.data.data)) {
            resolve(res.data.data.list || res.data.data)
          } else {
            resolve(res.data.data.list)
          }
        } else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

/**
 * 获取项目详情
 * 完整路径：GET /api/m4/projects/{projectId}
 */
function getProjectDetail(projectId) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/m4/projects/' + projectId,
      method: 'GET',
      header: authHeader(),
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) {
          resolve(res.data.data || res.data)
        } else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

/**
 * 获取用户详情
 * 完整路径：GET /api/profile/detail/{userId}
 */
function getUserProfile(userId) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/profile/detail/' + userId,
      method: 'GET',
      header: authHeader(),
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) {
          resolve(res.data.data || res.data)
        } else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

// ========== 方法 6：主动退出 ==========

/**
 * 成员主动退出项目（后端不接收 reason）
 */
function selfExit(projectId) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/m4/projects/' + projectId + '/exit/self?userId=' + getUserId(),
      method: 'POST',
      header: authHeader(),
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) resolve(res.data)
        else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

// ========== 方法 7-9：退出投票 ==========

/**
 * 获取退出投票详情（新增 projectId 参数）
 */
function getExitVoteDetail(projectId, voteId) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/m4/projects/' + projectId + '/exit/votes/' + voteId,
      method: 'GET',
      header: authHeader(),
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) resolve(res.data.data)
        else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

/**
 * 提交投票
 */
function submitExitVote(projectId, voteId, choice) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/m4/projects/' + projectId + '/exit/votes/' + voteId + '/submit',
      method: 'POST',
      header: authHeader(),
      data: { voterId: getUserId(), choice: choice },
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) resolve(res.data)
        else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

/**
 * 关闭投票
 */
function closeExitVote(projectId, voteId) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/m4/projects/' + projectId + '/exit/votes/' + voteId + '/close?operatorId=' + getUserId(),
      method: 'POST',
      header: authHeader(),
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) resolve(res.data)
        else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

// ========== 方法 10-11：互评 ==========

/**
 * 校验评价资格
 */
function checkEvaluationEligibility(projectId, targetUserId) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/m5/projects/' + projectId + '/members/' + targetUserId + '/evaluation-eligibility',
      method: 'GET',
      header: authHeader(),
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) {
          // 后端返回 Boolean（true/false），包装为 { eligible, reason } 对象给页面使用
          var eligible = res.data.data === true
          resolve({ eligible: eligible, reason: eligible ? '' : '您当前没有评价该成员的资格' })
        }
        else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

/**
 * 获取可评价成员列表
 * 完整路径：GET /api/m5/projects/{projectId}/evaluatable-members
 */
function getEvaluatableMembers(projectId) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/m5/projects/' + projectId + '/evaluatable-members',
      method: 'GET',
      header: authHeader(),
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) {
          if (Array.isArray(res.data.data)) {
            resolve(res.data.data.list || res.data.data)
          } else {
            resolve(res.data.data.list)
          }
        } else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

/**
 * 提交评价（评分字段扁平化）
 * @param {Object} params - { projectId, targetId, communicationScore, taskScore, skillScore, responsibilityScore, comment, positiveTags, negativeTags }
 */
function submitEvaluation(params) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/m5/evaluations',
      method: 'POST',
      header: authHeader(),
      data: {
        projectId: params.projectId,
        targetId: params.targetUserId || params.targetId,
        communicationScore: params.scores ? params.scores.communication : params.communicationScore,
        taskScore: params.scores ? params.scores.task : params.taskScore,
        skillScore: params.scores ? params.scores.skill : params.skillScore,
        responsibilityScore: params.scores ? params.scores.responsibility : params.responsibilityScore,
        comment: params.comment || '',
        positiveTags: params.positiveTags || [],
        negativeTags: params.negativeTags || []
      },
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) resolve(res.data)
        else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

// ========== 方法 12-13：信誉分 ==========

/**
 * 获取当前信誉分
 * @returns {Promise<number>}
 */
function getCurrentCreditScore() {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/m5/credit/score',
      method: 'GET',
      header: authHeader(),
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) resolve(res.data.data.creditScore)
        else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

/**
 * 获取信誉分变化历史
 * @returns {Promise<Array>}
 */
function getCreditHistory() {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/m5/credit/changes?page=1&pageSize=20',
      method: 'GET',
      header: authHeader(),
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) {
          if (Array.isArray(res.data.data)) {
            resolve(res.data.data.list || res.data.data)
          } else {
            resolve(res.data.data.list)
          }
        } else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

// ========== 方法 14-15：举报 ==========

/**
 * 提交举报（reasons 数组转为字符串）
 */
function submitReport(params) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/reports',
      method: 'POST',
      header: authHeader(),
      data: {
        targetType: params.targetType,
        targetId: params.targetId,
        reason: (params.reasons || []).join('、') || params.reason || ''
      },
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) resolve(res.data)
        else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

/**
 * 获取我的举报列表
 */
function getMyReports() {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/reports/my',
      method: 'GET',
      header: authHeader(),
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) {
          if (Array.isArray(res.data.data)) {
            resolve(res.data.data.list || res.data.data)
          } else {
            resolve(res.data.data.list)
          }
        } else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

// ========== 方法 16-18：申诉 ==========

/**
 * 获取可申诉对象列表（后端无对应接口，保留 Mock）
 */
function getAppealTargets(appealType) {
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

/**
 * 提交申诉
 */
function submitAppeal(params) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/appeals',
      method: 'POST',
      header: authHeader(),
      data: {
        targetType: params.appealType,
        targetId: params.targetId,
        reason: params.reason || ''
      },
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) resolve(res.data)
        else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

/**
 * 获取我的申诉列表
 */
function getMyAppeals() {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/appeals/my',
      method: 'GET',
      header: authHeader(),
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) {
          if (Array.isArray(res.data.data)) {
            resolve(res.data.data.list || res.data.data)
          } else {
            resolve(res.data.data.list)
          }
        } else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

// ========== 方法 19-20：我的项目 / 待处理投票 ==========

/**
 * 获取当前用户已加入的项目列表
 * 通过已接受的组队请求来聚合用户加入的项目，再获取项目详情
 */
function getMyJoinedProjects() {
  var userId = getUserId()
  return new Promise(function(resolve, reject) {
    // 并行获取收到和发出的请求
    var count = 0
    var allRequests = []
    function done() {
      count++
      if (count < 2) return
      // 筛选 accepted 状态的请求，提取唯一 projectId
      var accepted = allRequests.filter(function(r) { return r.status === 'accepted' })
      var projectIds = []
      for (var i = 0; i < accepted.length; i++) {
        var pid = accepted[i].projectId
        if (pid && projectIds.indexOf(pid) === -1) projectIds.push(pid)
      }
      if (projectIds.length === 0) {
        resolve([])
        return
      }
      // 获取项目详情
      var detailPromises = projectIds.map(function(pid) {
        return new Promise(function(dResolve) {
          wx.request({
            url: BASE_URL + '/m4/projects/' + pid,
            method: 'GET', header: authHeader(), timeout: 10000,
            success: function(res) {
              if (res.data && isSuccessCode(res.data.code)) {
                var detail = res.data.data || res.data
                detail.projectId = pid
                dResolve(detail)
              } else dResolve(null)
            },
            fail: function() { dResolve(null) }
          })
        })
      })
      Promise.all(detailPromises).then(function(details) {
        resolve(details.filter(function(d) { return d !== null }))
      }).catch(function() { resolve([]) })
    }
    // 收到
    wx.request({
      url: BASE_URL + '/m4/team-requests?userId=' + userId + '&direction=received',
      method: 'GET', header: authHeader(), timeout: 10000,
      success: function(res) {
        var data = (res.data && isSuccessCode(res.data.code)) ? res.data.data : null
        if (Array.isArray(data)) allRequests = allRequests.concat(data)
        done()
      },
      fail: function() { done() }
    })
    // 发出
    wx.request({
      url: BASE_URL + '/m4/team-requests?userId=' + userId + '&direction=sent',
      method: 'GET', header: authHeader(), timeout: 10000,
      success: function(res) {
        var data = (res.data && isSuccessCode(res.data.code)) ? res.data.data : null
        if (Array.isArray(data)) allRequests = allRequests.concat(data)
        done()
      },
      fail: function() { done() }
    })
  })
}

/**
 * 获取项目所有退出投票列表（用于投票管理页）
 */
function getProjectExitVotes(projectId) {
  return new Promise(function(resolve, reject) {
    wx.request({
      url: BASE_URL + '/m4/projects/' + projectId + '/exit/votes',
      method: 'GET',
      header: authHeader(),
      timeout: 10000,
      success: function(res) {
        if (res.data && isSuccessCode(res.data.code)) {
          var data = res.data.data
          resolve(Array.isArray(data) ? data : [])
        } else reject(res.data)
      },
      fail: function(err) { reject(err) }
    })
  })
}

/**
 * 获取项目的待处理退出投票列表
 */
function getProjectPendingVotes(projectId) {
  return getProjectExitVotes(projectId).then(function(votes) {
    return votes.filter(function(v) { return v.status === 'voting' })
  })
}

module.exports = {
  getRequests: getRequests,
  acceptRequest: acceptRequest,
  rejectRequest: rejectRequest,
  cancelRequest: cancelRequest,
  getMembers: getMembers,
  getProjectDetail: getProjectDetail,
  getUserProfile: getUserProfile,
  selfExit: selfExit,
  getExitVoteDetail: getExitVoteDetail,
  submitExitVote: submitExitVote,
  closeExitVote: closeExitVote,
  checkEvaluationEligibility: checkEvaluationEligibility,
  getEvaluatableMembers: getEvaluatableMembers,
  submitEvaluation: submitEvaluation,
  getCurrentCreditScore: getCurrentCreditScore,
  getCreditHistory: getCreditHistory,
  submitReport: submitReport,
  getMyReports: getMyReports,
  getAppealTargets: getAppealTargets,
  submitAppeal: submitAppeal,
  getMyAppeals: getMyAppeals,
  getMyJoinedProjects: getMyJoinedProjects,
  getProjectPendingVotes: getProjectPendingVotes,
  getProjectExitVotes: getProjectExitVotes
}
