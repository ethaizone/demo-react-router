import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layout.tsx", [
    index("routes/home.tsx"),
    ...prefix("example-api", [
      route("get", "routes/example-api/get.tsx"),
      route("post", "routes/example-api/post.tsx"),
    ]),
    route("stream", "routes/stream.tsx"),
    route("stream-resource", "routes/stream-resource.tsx"),
    ...prefix("users", [
      index("routes/users/index.tsx"),
      route(":id", "routes/users/item.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
