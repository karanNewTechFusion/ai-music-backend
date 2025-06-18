export const sendResponse = (res, success, status, message, data = {}) => {
  return res.status(status).json({
    success,
    status,
    message,
    data,
  });
};
