# Discoveries & Notes

## Back-End

- Swapped from simple `node:sqlite` to `sequelize` due to its' similarities to
  Laravel's Modelling.
- The Installation added like 180 packages alongside sqlite3's installation.
  The amount of packages seems ridiculous.

## Front-End

### Routing

- useLoaderData was a game-changer from react-router, Throws data alongside the
  page.

### Components

- The `app/src/components/Map.jsx` component has the default lat & lng built-in
  to it (I should consider moving it to ENV).
