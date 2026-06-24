export default function configRouter(Router) {
  // config DB API
  // Routes
  Router.get("/config/", (req, res) => {
    res.json({
      message: { GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY },
    });
  });

  return Router;
}
