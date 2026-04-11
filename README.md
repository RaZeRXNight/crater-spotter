# crater-spotter

crater-spotter is a small full-stack javascript project that interacts with
the google maps api. It provides a forum for users to post about pot-holes and
other road hazards, allowing users to pin their locations on a map. crater-spotter
is built using react for the front-end and node/express js for the back-end. The
database used is SQLite, and the project may be deployed using docker.

## Features to Implement

### Front-end

- [ X ] Landing page with a map of pins and recent posts
- [ X ] Dashboard for authenticated users to view their posts and recent posts
- [ X ] Post creation form with the ability to add a pin on the map.

### Back-end

- [ X ] User authentication and authorization
  - [ X ] Validation for image uploads and post content.
- [ X ] Integration with Google Maps API to display pins and posts on the map.
- [ X ] Database schema design for users, comments, and pins.

## Features

With the current react app, you are able to do the following:

- Navigate Google Maps and Drop a pin alongside a Post.

The structure of the back-end was modeled after Laravel's structure, with the
following folders:

- `storage/` - For storing uploaded images and files.
- `app/` - Being the front-end of the project, containing all of the react code.
- `src/` - Being the essentials of how the server-side operates.
  - `src/database` - Where Databases may be migrated and defined.
  - `src/routes` - Where routes are defined.
  - `src/models` - Where Databases are Defined for usage of APIs.

### Future Features

- Rework Map Pins to avoid "Clumping", Have a list display all of the pins in
  that area.
- Look into Open Streets' Open Source API due to <https://www.bahamaslocal.com>
  website usage of it.
- Implement Locking Posts and User Accounts.
- Implement Administration Dashboard and Features.
- Nested Comments and Replies.

## How to Install

You can simply clone the repository from `RaZeRXNight/crater-spotter` or
pull the docker image from `razerxnight/crater-spotter`.

### Clone the repository

1. Create a `.env` by copying the `.env.example` file. Here you will use your
   own credentials, adjusting the port if you want.
2. run `npm install` to install all of the dependencies of the project.

You may also instead Run the `.dev.sh` script to install the dependencies
and run the project in development mode.

### Docker Install

## How to Use

## License

## References

- <https://dev.to/techcheck/creating-a-react-node-and-express-app-1ieg>
- <https://reactrouter.com/start/data/routing>
- <https://react.dev/learn>
- <https://visgl.github.io/react-google-maps/docs/guides/interacting-with-google-maps-api>
- <https://axios-http.com/docs/example>
- <https://developers.google.com/maps/documentation/javascript/reference/map#Map>
- <https://sequelize.org/docs/v6/>
- <https://www.npmjs.com/package/connect-session-sequelize>
- <https://github.com/expressjs/session?tab=readme-ov-file>
- <https://express-validator.github.io/docs/>
- <https://www.npmjs.com/package/bcrypt>
- <https://fkhadra.github.io/react-toastify/introduction/>
- <https://www.npmjs.com/package/multer>
