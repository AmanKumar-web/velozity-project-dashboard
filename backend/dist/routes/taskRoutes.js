"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const taskController_js_1 = require("../controllers/taskController.js");
const auth_js_1 = require("../middleware/auth.js");
const validate_js_1 = require("../middleware/validate.js");
const index_js_1 = require("../validators/index.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticateToken);
router.get('/', (0, validate_js_1.validateQuery)(index_js_1.taskFilterSchema), taskController_js_1.getTasks);
router.post('/', (0, auth_js_1.authorizeRoles)(client_1.Role.ADMIN, client_1.Role.PROJECT_MANAGER), (0, validate_js_1.validateBody)(index_js_1.createTaskSchema), taskController_js_1.createTask);
// Both Admins, PMs, and Developers can call PATCH /:id
// Row-level authorization logic inside updateTask enforces that Developers can ONLY modify status on assigned tasks
router.patch('/:id', (0, validate_js_1.validateBody)(index_js_1.updateTaskSchema), taskController_js_1.updateTask);
exports.default = router;
