import type { LoaderFunctionArgs } from "react-router";

// Demo of in-app memory
// This will be reset on every server restart
let count = 0;

// Just open with http://localhost:5173/example-api/post
export async function loader({ request }: LoaderFunctionArgs) {
  count++;
  return {
    message: "This is response for GET method API",
    count,
  };
}
