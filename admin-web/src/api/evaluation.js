import request from '@/utils/request'

/** 获取待复核评价列表 GET /admin/evaluations/pending?projectId=xxx */
export function getPendingEvaluations(params) {
  return request({ url: '/admin/evaluations/pending', method: 'get', params })
}

/** 执行评价复核 POST /admin/evaluations/{id}/review */
export function reviewEvaluation(id, data) {
  return request({ url: `/admin/evaluations/${id}/review`, method: 'post', data })
}
