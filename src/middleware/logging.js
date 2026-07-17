export function logger(req, res, next) {
  const startTime = Date.now();

  res.on("finish", () => {
    const latency = Date.now() - startTime;
    const log = [
      req.method,
      req.protocl,
      req.host,
      req.path,
      res.statusCode,
      `${latency}ms`,
      req.ip || req.headers["x-forwarded-for"] || "-", // IP
      req.headers["user-agent"] || "-",
      req.get("content-length") || "0",
    ];
    console.log(log.join(" "));
  });
  next();
}
