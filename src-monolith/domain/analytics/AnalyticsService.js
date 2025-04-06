const analyticsRepo = require("./analyticsRepo");

class AnalyticsService {
  /**
   * Tạo mới dữ liệu analytics
   * @param {Date} dateBucket - Ngày thống kê
   * @param {number} pasteId - ID của paste liên quan
   * @returns {Promise<Object>}
   */
  async createAnalytics(dateBucket, pasteId) {
    dateBucket.setHours(0, 0, 0, 0);
    return await analyticsRepo.createAnalytics(dateBucket, pasteId);
  }

  /**
   * Tăng số lượt xem analytics
   * @param {Date} dateBucket - Ngày thống kê
   * @param {number} pasteId - ID của paste liên quan
   * @returns {Promise<Object>}
   */
  async incrementViews(dateBucket, pasteId) {
    console.log("dateBucket", dateBucket);
    console.log("pasteId", pasteId);
    dateBucket.setHours(0, 0, 0, 0);
    return await analyticsRepo.incrementViews(dateBucket, pasteId);
  }

  /**
   * Lấy danh sách analytics của một paste
   * @param {number} pasteId - ID của paste
   * @returns {Promise<Array>}
   */
  async getAnalyticsByPasteId(pasteId) {
    return await analyticsRepo.getAnalyticsByPasteId(pasteId);
  }

  /**
   * Xóa dữ liệu analytics theo ID
   * @param {number} id - ID của analytics
   * @returns {Promise<Object>}
   */
  async deleteAnalytics(id) {
    return await analyticsRepo.deleteAnalytics(id);
  }

  /**
   * Lấy thống kê analytics trong một tháng
   * @param {number} pasteId - ID của paste
   * @param {number} month - Tháng cần lấy dữ liệu (1-12)
   * @param {number} year - Năm cần lấy dữ liệu
   * @returns {Promise<Array>}
   */
  async getAnalyticsForMonth(pasteId, month, year) {
    return await analyticsRepo.getAnalyticsForMonth(pasteId, month, year);
  }
}

module.exports = new AnalyticsService();
