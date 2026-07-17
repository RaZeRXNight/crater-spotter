export function logger(req, res, next) {
  const startTime = Date.now();

  res.on("finish", () => {
    const latency = Date.now() - startTime;
    const log = [
      req.method,
      res.statusCode,
      [`${req.protocol}://`, req.host, req.path].join(""),
      `${latency}ms`,
      req.ip || req.headers["x-forwarded-for"] || "-", // IP
      req.headers["user-agent"] || "-",
      req.get("content-length") || "0",
    ];
    console.log(log.join(" "));
  });
  next();
}
