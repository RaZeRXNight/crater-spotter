# crater-spotter

crater-spotter is a small full-stack javascript project that interacts with
the google maps api. It provides a forum for users to post about pot-holes and
other road hazards, allowing users to pin their locations on a map. crater-spotter
is built using react for the front-end and node/express js for the back-end. The
database used is SQLite, and the project may be deployed using docker.

## Features to Implement

### Front-end

- [ ] Landing page with a map of pins and recent posts
- [ ] Dashboard for authenticated users to view their posts and recent posts
  - [ ] Admin dashboard to view all posts and users
  - [ ] User dashboard to view their posts and recent posts.
- [ X ] Post creation form with the ability to add a pin on the map.

### Back-end

- [ ] User authentication and authorization
- [ ] CRUD operations for posting and commenting.
  - [ ] Validation for image uploads and post content.
- [ ] Admin functionalities to manage users and posts.
- [ X ] Integration with Google Maps API to display pins and posts on the map.
- [ ] Database schema design for users, posts, comments, and pins.

## Features

With the current react app, you are able to do the following:

The structure of the back-end was modeled after Laravel's structure, with the
following folders:

- `storage/` - For storing uploaded images and files.
- `app/` - Being the front-end of the project, containing all of the react code.
- `src/` - Being the essentials of how the server-side operates.
  - `src/database` - Where Databases may be migrated and defined.
  - `src/routes` - Where routes are defined.

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
