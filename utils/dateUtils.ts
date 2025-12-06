export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (isoString: string): string => {
  return new Date(isoString).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (isoString: string): string => {
  return new Date(isoString).toLocaleString('ar-EG', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
