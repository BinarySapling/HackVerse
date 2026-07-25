export const getApiData = (response, fallback = null) => {
  return response?.data ?? fallback;
};

export const getApiList = (response) => {
  return Array.isArray(response?.data) ? response.data : [];
};

export const getApiMeta = (response, fallback = null) => {
  return response?.meta ?? fallback;
};
