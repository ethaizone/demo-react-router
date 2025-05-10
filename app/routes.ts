import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  ...prefix("users", [
    index("routes/users/index.tsx"),
    route(":id", "routes/users/item.tsx"),
  ]),
] satisfies RouteConfig;
