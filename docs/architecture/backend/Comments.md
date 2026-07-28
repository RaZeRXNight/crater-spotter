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

