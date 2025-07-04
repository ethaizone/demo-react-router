import type { ActionFunctionArgs } from "react-router";

// You can try make requests with curl
// curl -X POST \
//   http://localhost:5173/example-api/post \
//   -H 'Content-Type: application/json' \
//   -d '{"key":"value"}'

export async function action({ request }: ActionFunctionArgs) {
  // You can use `request.json()` to parse the request body if it's json
  // You can use `request.formData()` to parse the request body if it's form data

  return {
    data: await request.json(),
  };
}
