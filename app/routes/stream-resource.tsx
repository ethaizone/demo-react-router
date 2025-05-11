import type { LoaderFunctionArgs } from "react-router";
import { eventStream } from "remix-utils/sse/server";

// --- Loader for SSE ---
export async function loader({ request }: LoaderFunctionArgs) {
  let timer = 0;
  let controller = new AbortController();
  let interval: NodeJS.Timeout;

  return eventStream(request.signal, (send, abort) => {
    async function run() {
      interval = setInterval(() => {
        timer += 1;

        console.log("Timer: ", timer);
        send({ event: "time", data: `Timer: ${timer} seconds` });

        if (timer >= 10) {
          console.log("Timer: Exited");
          send({ event: "exit", data: "exited" });
          clearInterval(interval);
          abort();
        }
      }, 1000);
    }

    controller.signal.addEventListener("abort", () => {
      clearInterval(interval);
    });

    run();

    return () => {
      controller.abort();
    };
  });
}
