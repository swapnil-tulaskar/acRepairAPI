const getTime = () => new Date().toISOString();

const logger = {
  info: (msg) => console.log(`[INFO] ${getTime()} ${msg}`),
  error: (msg) => console.error(`[ERROR] ${getTime()} ${msg}`),
  debug: (msg) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEBUG] ${getTime()} ${msg}`);
    }
  }
};

module.exports = { logger };