import { w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as CategoryScreen } from "./screens-EhguTc_6.mjs";
import { r as Route } from "./router-BzEIgKth.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/games._category-CQFDLgMk.js
var import_jsx_runtime = require_jsx_runtime();
var SplitComponent = function CategoryRoute() {
	const { category } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryScreen, { category });
};
//#endregion
export { SplitComponent as component };
