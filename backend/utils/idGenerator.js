const generateId = (prefix) => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const timestamp = Date.now().toString().slice(-5);
  return `${prefix}-${timestamp}${rand}`;
};

module.exports = generateId;
