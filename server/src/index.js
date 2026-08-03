import config from "./config/index.js";
import { buildApp } from "./app.js";

const app = buildApp();

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});
