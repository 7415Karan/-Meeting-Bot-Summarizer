import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/_index.tsx"),
    route("result", "routes/result.tsx"),
    route("history", "routes/history.tsx")
] satisfies RouteConfig;
