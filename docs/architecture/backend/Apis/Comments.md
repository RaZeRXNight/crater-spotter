# Comments

## High-Level Overview

Comments belong to a pin (`PinParent`). Optional nesting via `CommentParent` + `replyLevel`.

## API Endpoints

All under `/api/comment`.

| Method | Path             | Auth      | Body                                                            | Response                                     |
| ------ | ---------------- | --------- | --------------------------------------------------------------- | -------------------------------------------- |
| GET    | /api/comment/    | —         | —                                                               | `{ message: { rows, count } }`               |
| GET    | /api/comment/:id | —         | —                                                               | `{ message: { rows, count } }` (ignores :id) |
| POST   | /api/comment     | BasicAuth | `{ authorid, PinParent, comment, CommentParent?, replyLevel? }` | `{ id, comment, message }`                   |
| DELETE | /api/comment/:id | BasicAuth | —                                                               | `{ message }`                                |
| PUT    | /api/comment     | —         | —                                                               | **Not implemented** — always returns error   |

## API Overview

### `/comment/` GET

The API accepts the following queries:

- postid (required)
- userid
- commentParentid
- order
- page
- perPage

Returns a List of Rows of a specified level. On default, without a commentParentid
the api returns the root comments without a parent. It also returns
the following information:

- An Array of Comments,
- Count, CurrentPage, perPage (Integers)
- hasNext (Boolean)

The Frontend determines when to create a thread for deeply nested comments.
