"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activityController_js_1 = require("../controllers/activityController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticateToken);
router.get('/feed', activityController_js_1.getActivityFeed);
exports.default = router;
