# crater-spotter-react

The notes below are for the react app. These are to help me in navigating and
learning react. This isn't meant to be a full reference or documentation for
the application.

## Routes

We must import:

- createBrowserRouter from react-router
- RouterProvider from react-router/dom.

These two will take care of the routing for our react app.

### Basic Routing

```javascript
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppComponentNameHere />,
  },
]);
```

Within `createBrowserRouter` it takes a list of Javascript objects. Here we can
specify what routes we want to use and what they'll return. This is showcased
in the example above.

### Nested Routing

```javascript

  {
    path: "/",
    element: <AppComponentNameHere />,
    children: [{ path: "auth", element: <AuthComponentNameHere /> }],
  }

```

The above example shows nested routes. This is how we get routes such as admin/dashboard.

### Route objects

```javascript
import { createBrowserRouter, useLoaderData } from "react-router";

createBrowserRouter([
  {
    path: "/teams/:teamId",
    loader: async ({ params }) => {
      let team = await fetchTeam(params.teamId);
      return { name: team.name };
    },
    Component: Team,
  },
]);

function Team() {
  let data = useLoaderData();
  return <h1>{data.name}</h1>;
}
```

The example above showcases how to pass an object to a route.

<https://reactrouter.com/start/data/route-object>

### CSS

<https://ui.shadcn.com/docs/installation/vite>

## How to edit
