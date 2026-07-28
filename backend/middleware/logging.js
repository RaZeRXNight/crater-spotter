export function logger(req, res, next) {
  const startTime = Date.now();

  res.on("finish", () => {
    const latency = Date.now() - startTime;
    const log = [
      req.method,
      res.statusCode,
      `${req.protocol}`,
      req.host,
      req.path,
      `${latency}ms`,
      req.headers["user-agent"] || "-",
      req.ip || req.headers["x-forwarded-for"] || "-", // IP
    ];
    process.stdout.write(log.join(" ") + "\n");
  });
  next();
}
