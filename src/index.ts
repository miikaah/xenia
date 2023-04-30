import { errorHandler } from "./errorHandler";
import { app } from "./express";

export { app } from "./express";
export * from "./routes";

const {
  PORT = 5150,
  NODE_ENV,
  XENIA_PATH = "C:\\Users\\Miika\\repos\\xenia\\lib",
} = process.env;
const baseUrl = `http://localhost:${PORT}`;
const options = {
  root: XENIA_PATH,
};

app.get("/", (req, res) => {
  res.sendFile("dist/root.html", options);
});

app.get("/root.mjs", (req, res) => {
  res.sendFile("dist/root.mjs", options);
});

app.use(errorHandler);

app.listen(PORT, async () => {
  if (NODE_ENV !== "test") {
    console.log(`Serving ${baseUrl}\n`);
  }
});
