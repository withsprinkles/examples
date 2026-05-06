import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("./routes/zero.tsx"),
    route("contact/:contactId", "./routes/show.tsx"),
    route("contact/:contactId/edit", "./routes/edit.tsx"),
    route("contact/:contactId/destroy", "./routes/destroy.tsx"),
] satisfies RouteConfig;
