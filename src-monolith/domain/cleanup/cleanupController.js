const cleanupService = require('./cleanupService.js');

module.exports = {
  /**
   * Manually trigger cleanup of expired pastes
   */
  async runCleanup(req, res) {
    try {
      console.log('Manual cleanup triggered');
      const deletedCount = await cleanupService.runNow();
      
      return res.status(200).json({
        success: true,
        message: 'Cleanup completed successfully',
        deletedCount
      });
    } catch (error) {
      console.error('Error during manual cleanup:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to complete cleanup',
        error: error.message
      });
    }
  }
};