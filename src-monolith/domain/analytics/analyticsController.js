const analyticsService = require('./AnalyticsService');


class AnalyticsController {

    async getAnalytics(req, res) {
        try {
            
            res.render("analyticsView")
        } catch (error) {
            console.error(error);
            res.status(500).send("Error retrieving analytics");
        }
    }

    async getAnalyticsData(req, res) {
        try {
            const analyticsData = await analyticsService.getAnalyticsForMonth(pasteId, month, year);
            res.json(analyticsData);
        } catch (error) {
            console.error(error);
            res.status(500).send("Error retrieving analytics data");
        }
    }


}

module.exports =  new AnalyticsController();