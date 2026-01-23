import { useState } from 'react';
import { runPodCompress, checkRunPodStatus } from '../services/api';
import toast from 'react-hot-toast';

export const useRunPod = () => {
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState([]);

    const addLog = (message) => {
        setLogs(prev => [...prev, `> ${message}`]);
    };

    const compressModel = async (file, options = {}) => {
        setProcessing(true);
        setProgress(0);
        setLogs([]);

        try {
            addLog(`Starting compression for ${file.name}`);
            addLog('Uploading to GPU server...');
            setProgress(20);

            const response = await runPodCompress(file, options);
            
            if (response.job_id) {
                addLog(`Job started: ${response.job_id}`);
                setProgress(40);

                // Poll for status
                const pollStatus = async () => {
                    const status = await checkRunPodStatus(response.job_id);
                    
                    if (status.status === 'COMPLETED') {
                        setProgress(100);
                        addLog('??Compression completed successfully');
                        addLog(`Original size: ${status.original_size}`);
                        addLog(`Compressed size: ${status.compressed_size}`);
                        addLog(`Reduction: ${status.reduction_percentage}%`);
                        toast.success('Model compressed successfully!');
                        return status;
                    } else if (status.status === 'FAILED') {
                        throw new Error(status.error || 'Compression failed');
                    } else {
                        // Still processing
                        setProgress(40 + (status.progress || 0) * 0.6);
                        addLog(`Processing... ${status.progress || 0}%`);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        return pollStatus();
                    }
                };

                const result = await pollStatus();
                return result;
            }
        } catch (error) {
            addLog(`??Error: ${error.message}`);
            toast.error('Compression failed: ' + error.message);
            throw error;
        } finally {
            setProcessing(false);
        }
    };

    return {
        compressModel,
        processing,
        progress,
        logs
    };
};
