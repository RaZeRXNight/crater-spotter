# crater-spotter

crater-spotter is a small full-stack javascript project that interacts with
the google maps api. It provides a forum for users to post about pot-holes and
other road hazards, allowing users to pin their locations on a map. crater-spotter
is built using react for the front-end and node/express js for the back-end. The
database used is SQLite,

![Screenshot](https://i.imgur.com/lTETNZf.png)

## Features

With the current react app, you are able to do the following:

- Navigate Google Maps and Drop a pin alongside a Post.
  - Upload an image alongside your post.
- Create an account, log in and out.
  - View user profiles and their posts.
  - View your own dashboard.
- Comment on posts and view comments on posts.
- Administrate your posts and comments, with the ability to delete them.

### Implemented Features

### Front-end

- [ ] Proper Loading and Scaffolding for Data-Intensive Components.
  - [ ] Loading Skeletons for posts, comments, and map markers
  - [ ] Skeleton screens for user profiles and dashboard
  - [ ] Progressive loading for map pins
- [ ] Front-End Design Revamp
  - [ ] Responsive design and mobile-friendly layouts
  - [ ] Dark mode toggle and theme customization
  - [ ] Accessibility improvements (ARIA labels, keyboard navigation)
- [ ] Pin Searching and Filtering
  - [ ] Autocomplete search bar for locations
  - [ ] Filter pins by date, category, and severity
  - [ ] Nearby pins view with radius slider
- [ ] Improved Dashboard, and User Profile Management
  - [ ] User search and filtering
  - [ ] Edit profile and account settings
  - [ ] Post Editing Functionality and Moderation Tools.

### Back-end

- [ ] Real-time Data Updates and Notifications
  - [ ] WebSocket integration for real-time comment updates
  - [ ] Push notifications for new comments on user posts
  - [ ] Live map pin updates when new posts are created
  - [ ] Real-time user activity indicators
  - [ ] Socket-based chat or messaging system for users

#### Auth

- [ ] Implement OAuth 2.0 authentication with Google, GitHub, and Facebook providers
- [ ] Session-based authentication with JWT refresh tokens
- [ ] Two-factor authentication (2FA) with TOTP
- [ ] Password reset flow with email verification
- [ ] Account lockout after failed login attempts

#### Administration & Moderation

- Implement Locking Posts and User Accounts.
- [ ] Image recognition and Verification
  - [ ] Image upload validation and compression
  - [ ] Automated image moderation for inappropriate content
  - [ ] OCR for reading road signs from uploaded images

#### Security

- [ ] Implement SQL injection prevention measures (parameterized queries)
- [ ] TLS/SSL certificate configuration and HTTPS enforcement
- [ ] Implement Helmet.js for secure HTTP headers
- [ ] Add Content Security Policy (CSP) headers
- [ ] CORS configuration and best practices
- [ ] Implement HSTS (HTTP Strict Transport Security) headers
- [ ] Add XSS protection headers and input sanitization
- [ ] Set up proper error handling that doesn't leak sensitive information

#### API

- [ ] Security Hardening and Rate Limiting
  - [ ] Implement rate limiting on API endpoints to prevent abuse
  - [ ] Add input sanitization and validation for all user inputs
  - [ ] Implement CSRF protection for state-changing requests
  - [ ] Set up proper CORS policies
  - [ ] Add request logging and monitoring for suspicious activity
  - [ ] Implement secure session management with HTTP-only cookies
- [ ] API Optimization
  - [ ] Implement caching layer (Redis or in-memory) for frequently accessed data
  - [ ] Optimize API response payloads with field selection
    - [ ] Implement "Globbing" for Pin Search and Filtering
  - [ ] Add API versioning for backward compatibility
  - [ ] Implement request batching for related data

#### Database

- [ ] Database Optimization
  - [ ] Implement database indexing for faster queries
  - [ ] Add pagination for posts and comments
  - [ ] Database connection pooling for better performance
  - [ ] Solve N + 1 query problem in database queries

### Future Features

- Rework Map Pins to avoid "Clumping", Have a list display all of the pins in
  that area.
- Look into Open Streets' Open Source API due to <https://www.bahamaslocal.com>
  website usage of it.
- Implement OAuth for easier sign-in and account creation.
- Implement Administration Dashboard and Features.
- Migrate to PostgreSQL for better performance and scalability.
- Nested Comments and Replies.
- Password Changing
- Minimize Session Request Loads.
- Create a docker image for the project to allow for easier deployment.

## Structure

The structure of the back-end was modeled after Laravel's structure, with the
following folders:

- `storage/` - For storing uploaded images and files.
- `app/` - Being the front-end of the project, containing all of the react code.
  - `src/components` - Components are created and defined here.
  - `src/css` - CSS is defined within this folder.
  - `src/layouts` - layouts like `/layouts/MainLayout` are defined here.
  - `src/middleware` - Where middleware services are defined
  - `src/pages` - Pages and their functionality is defined.
  - `src/routes` - front-end routes are defined
- `src/` - Being the essentials of how the server-side operates.
  - `src/database` - Where Databases may be migrated and defined.
  - `src/routes` - Where routes are defined.
  - `src/models` - Where Databases are Defined for usage of APIs.
  - `src/apis` - API endpoints are defined here.
  - `src/services` - where functions are defined for ease of use.

## How to Install

You can simply clone the repository from `RaZeRXNight/crater-spotter`

### Clone the repository

#### Credentials

1. Create a `.env` by copying the `.env.example` file. Here you will use your
   own credentials, adjusting the port if you want.
2. You will also need to do the same on the front-end, creating
   a `.env` file in the `app/` folder and filling out the credentials for the
   google maps API.

#### Dependencies

1. run `npm install` to install all of the dependencies of the project.
2. run `npm install` within the `/app` directory to install react dependencies.

You may also instead Run the `./install.sh` script to install the dependencies

## How to Use

To deploy the project you can do the following:

- Run `npm run build` to build the front-end.
- Run `npm run start` to start the server and serve the front-end.

It is once again recommended that the `.env` files are created and
filed out with your own credentials.

### Docker

```bash
git clone https://github.com/RaZeRXNight/crater-spotter.git
cd crater-spotter
cp .env.example .env
```

Edit `.env` with your Google Maps API key and a session secret, then:

```bash
docker compose up --build
```

The app is served at `http://localhost:8000`. An admin account
(`admin` / `password`) is auto-created on first run.

## License

Licensed under the GNU GENERAL PUBLIC LICENSE License. See `LICENSE` for more information.

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
