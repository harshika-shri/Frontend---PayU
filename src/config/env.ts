export const env = {
  apiUrl: import.meta.env.VITE_API_URL as string || 'http://localhost:8000',
  docExtractionUrl: import.meta.env.VITE_DOC_EXTRACTION_URL as string || 'http://localhost:8001',
  commandCenterUrl: import.meta.env.VITE_COMMAND_CENTER_API_URL as string || 'http://localhost:8003',
} as const;
