const RAILWAY_API_URL = import.meta.env.VITE_RAILWAY_API_URL;
const RAILWAY_API_KEY = import.meta.env.VITE_RAILWAY_API_KEY;

export const railwayService = {
  /**
   * Compress model using Railway ML backend
   */
  async compressModel(modelFile, options = {}) {
    const {
      compressionLevel = 90,
      techniques = {},
      onProgress
    } = options;

    try {
      const formData = new FormData();
      formData.append('model', modelFile);
      formData.append('compression_level', compressionLevel);
      formData.append('quantization', techniques.quantization || false);
      formData.append('pruning', techniques.pruning || false);
      formData.append('distillation', techniques.distillation || false);
      formData.append('clustering', techniques.clustering || false);

      // Initial upload
      const response = await fetch(`${RAILWAY_API_URL}/api/compress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RAILWAY_API_KEY}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Compression failed');
      }

      const { job_id } = await response.json();

      // Poll for progress
      return new Promise((resolve, reject) => {
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(`${RAILWAY_API_URL}/api/compress/${job_id}/status`, {
              headers: {
                'Authorization': `Bearer ${RAILWAY_API_KEY}`
              }
            });

            const statusData = await statusRes.json();

            if (onProgress) {
              onProgress(statusData.progress || 0);
            }

            if (statusData.status === 'completed') {
              clearInterval(pollInterval);
              resolve({
                job_id,
                original_size: statusData.original_size,
                compressed_size: statusData.compressed_size,
                reduction: statusData.reduction_percentage,
                accuracy_loss: statusData.accuracy_loss,
                download_url: statusData.download_url,
                compression_time: statusData.time_taken,
                original_accuracy: statusData.original_accuracy,
                compressed_accuracy: statusData.compressed_accuracy,
                techniques: statusData.techniques_applied
              });
            } else if (statusData.status === 'failed') {
              clearInterval(pollInterval);
              reject(new Error(statusData.error || 'Compression failed'));
            }
          } catch (error) {
            clearInterval(pollInterval);
            reject(error);
          }
        }, 2000); // Poll every 2 seconds
      });

    } catch (error) {
      console.error('Railway compression error:', error);
      throw error;
    }
  },

  /**
   * Verify model in Docker sandbox using Railway backend
   */
  async verifyModel(modelFile, goldDatasets = []) {
    try {
      const formData = new FormData();
      formData.append('algorithm', modelFile);
      formData.append('datasets', JSON.stringify(goldDatasets));

      const response = await fetch(`${RAILWAY_API_URL}/api/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RAILWAY_API_KEY}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Verification failed');
      }

      const { job_id } = await response.json();

      // Poll for verification results
      return new Promise((resolve, reject) => {
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(`${RAILWAY_API_URL}/api/verify/${job_id}/status`, {
              headers: {
                'Authorization': `Bearer ${RAILWAY_API_KEY}`
              }
            });

            const statusData = await statusRes.json();

            if (statusData.status === 'completed') {
              clearInterval(pollInterval);
              resolve({
                job_id,
                scores: {
                  latency: statusData.scores.latency,
                  accuracy: statusData.scores.accuracy,
                  cpu: statusData.scores.cpu_usage,
                  ram: statusData.scores.memory_usage,
                  gpu: statusData.scores.gpu_efficiency
                },
                dataset_results: statusData.dataset_results,
                sandbox_logs: statusData.logs,
                passed: statusData.passed
              });
            } else if (statusData.status === 'failed') {
              clearInterval(pollInterval);
              reject(new Error(statusData.error || 'Verification failed'));
            }
          } catch (error) {
            clearInterval(pollInterval);
            reject(error);
          }
        }, 3000);
      });

    } catch (error) {
      console.error('Railway verification error:', error);
      throw error;
    }
  },

  /**
   * Download compressed model
   */
  async downloadModel(jobId) {
    try {
      const response = await fetch(`${RAILWAY_API_URL}/api/compress/${jobId}/download`, {
        headers: {
          'Authorization': `Bearer ${RAILWAY_API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      return response.blob();
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }
};