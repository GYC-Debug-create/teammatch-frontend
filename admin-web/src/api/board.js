import request from '@/utils/request'

/** 获取板块列表（管理端）GET /admin/boards */
export function getBoardList() {
  return request({ url: '/admin/boards', method: 'get' })
}

/** 获取板块详情 GET /admin/boards/{id} */
export function getBoardDetail(id) {
  return request({ url: `/admin/boards/${id}`, method: 'get' })
}

/** 创建板块 POST /admin/boards */
export function createBoard(data) {
  return request({ url: '/admin/boards', method: 'post', data })
}

/** 更新板块 PUT /admin/boards/{id} */
export function updateBoard(id, data) {
  return request({ url: `/admin/boards/${id}`, method: 'put', data })
}

/** 删除板块 DELETE /admin/boards/{id} */
export function deleteBoard(id) {
  return request({ url: `/admin/boards/${id}`, method: 'delete' })
}

/** 获取板块下的项目列表（后端暂无管理端接口，用 m4 全量项目接口前端过滤） */
export function getBoardProjects(boardId) {
  return request({ url: '/m4/projects?pageNum=1&pageSize=999', method: 'get' })
}
