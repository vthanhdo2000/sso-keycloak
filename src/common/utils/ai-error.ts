export function formatAIError(aiResponse: any) {
  return {
    messageFields: aiResponse.messageFields || [],
    messageObjects: aiResponse.messageObjects || [],
    message: aiResponse.message || 'IDG-0000004',
    error: aiResponse.error || ['AI Error'],
    statusCode: aiResponse.statusCode?.toString() || '500',
    status: 'BAD_REQUEST', // hoặc dựa vào statusCode để map
    tampering: aiResponse.tampering || {},
    imgs: aiResponse.imgs || {},
  };
}
