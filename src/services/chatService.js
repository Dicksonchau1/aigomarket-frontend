// src/services/chatService.js

const AIGO_API_URL = import.meta.env.VITE_API_URL || 'https://aigomarket-backend-production-8b8d.up.railway.app';

export const sendMessageToAIGO = async (message, conversationHistory = []) => {
  try {
    const response = await fetch(`${AIGO_API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from AIGO');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message to AIGO:', error);
    throw error;
  }
};

export const uploadDataset = async (file) => {
  try {
    const formData = new FormData();
    formData.append('dataset', file);

    const response = await fetch(`${AIGO_API_URL}/api/upload-dataset`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload dataset');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading dataset:', error);
    throw error;
  }
};