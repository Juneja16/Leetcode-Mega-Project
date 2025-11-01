import { getQueueStatus } from "../Services/queueService.js";

// Monitor queue health and status
const getQueueHealth = async (req, res) => {
  try {
    const status = await getQueueStatus();

    res.status(200).json({
      message: "Queue status retrieved",
      response: true,
      queueStatus: status,
      timestamp: new Date().toISOString(),
      system: {
        concurrentWorkers: 5,
        maxJobsPerSecond: 20,
        timeoutPerJob: 30000,
      },
    });
  } catch (error) {
    console.error("Error getting queue status:", error);
    res.status(500).json({
      message: "Error getting queue status",
      response: false,
      error: error.message,
    });
  }
};

export { getQueueHealth };
