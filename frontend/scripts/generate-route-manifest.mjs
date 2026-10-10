// Fixed routes only. Laravel resolves published CMS detail slugs at request time.
import { writeFileSync } from "node:fs";
const routes = ["", "expertise", "solutions", "work", "approach", "about", "insights", "contact"];
writeFileSync("dist/site-routes.json", JSON.stringify(routes));
