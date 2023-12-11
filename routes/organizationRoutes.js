const { renderOrganizationForm, createOrganization, createForumTable } = require("../controller/organization/organizationController");
const { isAuthenticated } = require("../middlewares/isAuthenticated");

const router = require("express").Router();


router.route("/organization").get(isAuthenticated, renderOrganizationForm).post(isAuthenticated, createOrganization,createForumTable);


module.exports = router;