---
trigger: always_on
---

This project based on react-router@7. This version based from Remix but it is deprecated and migrate to react-router@7.
You need to think react-router@7 has feature from remix but it work on react-router.

Here is changed logs.

- Replace import from `@remix-run/*` to `react-router`. Such as `@remix-run/node` need to change.
- Replace import from `react-router-dom` to `react-router`.
- Remove `import { json } from "@remix-run/node";` as. it doesn't exists in `react-router`. We can return raw variable from loader and json in react-router.
