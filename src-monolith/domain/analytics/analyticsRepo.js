const prismaClient = require("../../../prisma/prismaClient");

class AnalyticsRepository {
  // Add new analytics data
  async createAnalytics(dateBucket, pasteId) {
    return await prismaClient.analytics.create({
      data: { dateBucket, pasteId },
    });
  }

  // Increment view count for analytics
  async incrementViews(dateBucket, pasteId) {
    const existingRecord = await prismaClient.analytics.findUnique({
      where: { pasteId_dateBucket_unique: { pasteId, dateBucket } },
    });

    if (existingRecord) {
      return await prismaClient.analytics.update({
        where: { pasteId_dateBucket_unique: { pasteId, dateBucket } },
        data: { views: { increment: 1 } },
      });
    } else {
      return await prismaClient.analytics.create({
        data: { dateBucket, pasteId, views: 1 },
      });
    }
  }

  // Get analytics by pasteId
  async getAnalyticsByPasteId(pasteId) {
    return await prismaClient.analytics.findMany({
      where: { pasteId },
      orderBy: { dateBucket: "asc" },
    });
  }

  // Delete analytics by ID
  async deleteAnalytics(id) {
    return await prismaClient.analytics.delete({
      where: { id },
    });
  }

  // Get monthly analytics for a paste
  async getAnalyticsForMonth(pasteId, month, year) {
    const startDate = new Date(year, month - 1, 1); // Start of the month
    const endDate = new Date(year, month, 1); // Start of the next month

    return await prismaClient.analytics.findMany({
      where: {
        pasteId,
        dateBucket: { gte: startDate, lt: endDate },
      },
      orderBy: { dateBucket: "asc" },
    });
  }
}

module.exports = new AnalyticsRepository();
