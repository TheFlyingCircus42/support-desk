import config from "./config/index.js";
import { buildApp } from "./app.js";

const app = buildApp();

console.log("BOOTING SERVER")

app.listen(config.port, () => {
  console.log(`Support-desk API listening on http://localhost:${config.port}`);
});
