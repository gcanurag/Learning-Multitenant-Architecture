const { renderOrganizationForm, createOrganization, createQuestionsTable, createAnswerTable, renderDashboard, renderForumPage, renderQuestionForm, createQuestion } = require("../controller/organization/organizationController");
const { isAuthenticated } = require("../middlewares/isAuthenticated");

const router = require("express").Router();


router.route("/organization").get(isAuthenticated, renderOrganizationForm).post(isAuthenticated, createOrganization, createQuestionsTable, createAnswerTable);

router.route('/dashboard').get(isAuthenticated,renderDashboard);

router.route('/forum').get(isAuthenticated, renderForumPage);

router.route('/question').get(renderQuestionForm).post(isAuthenticated, createQuestion);
module.exports = router;