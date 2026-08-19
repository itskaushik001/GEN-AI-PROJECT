const express =require("express")
const  authMiddleware =require("../Middlewares/auth.middleware")
const interviewController =require("../controllers/interview.controller")
const upload = require("../Middlewares/file.middleware")

const interviewRouter= express.Router()


/**
 * @route POST/api/interview
 * @description Generate new interview report on the basis of user self description,resume pdf and job description
* @access private
*/
 
interviewRouter.post("/",authMiddleware.authUser,upload.single("resume"),interviewController.generateInterViewReportController)

/**
 * @route GET/api/interview/report/:interviewId
 * @description Get interview report by interviewId
 * @access private
 */
interviewRouter.get("/report/:interviewId",authMiddleware.authUser,interviewController.getInterviewReportByIdController)

/**
 * @route GET/api/interview
 * @description Get all interview reports of logged in user
 * @access private
 */
interviewRouter.get("/",authMiddleware.authUser,interviewController.getAllInterviewReportsController)

/**
 * @route POST/api/interview/resume/pdf
 * @description Generate resume pdf based on user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId",authMiddleware.authUser,interviewController.generateResumePdfController)


module.exports=interviewRouter