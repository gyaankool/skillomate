// Utility functions for handling usage limits

export const isUsageLimitError = (error) => {
  return error?.response?.status === 429 && 
         (error?.response?.data?.error === 'USAGE_LIMIT_EXCEEDED' ||
          error?.response?.data?.error === 'DAILY_LIMIT_EXCEEDED' ||
          error?.response?.data?.error === 'TOKEN_LIMIT_EXCEEDED');
};

export const getUsageLimitData = (error) => {
  if (isUsageLimitError(error)) {
    return error.response.data.usage;
  }
  return null;
};

export const showUsageLimitModal = (usageData, onUpgrade) => {
  // This will be handled by the parent component
  // that imports UsageLimitModal
  if (onUpgrade) {
    onUpgrade(usageData);
  }
};

export const formatUsageMessage = (usage) => {
  if (!usage) return '';
  
  if (usage.plan === 'free') {
    return `You have ${usage.remaining} free responses remaining today.`;
  }
  
  return 'You have unlimited responses with your premium plan.';
};
