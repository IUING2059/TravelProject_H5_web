import service from "./request";

/**
 * POST 旅行推荐接口
 * @param {Object} data 请求体数据
 * @returns Promise
 */
export function getTravelRecommend(data) {
  return service.post("/api/travel/recommend", data);
}
