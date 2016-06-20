
module.exports = {
  workerJob: () => {
    const workerLoop = () => {
      setTimeout(workerLoop, 1000);
    };
    workerLoop();
  },
};
