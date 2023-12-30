const { QueryTypes } = require("sequelize")
const { sequelize, users } = require("../../model")
const sendEmail = require("../../services/sendEmail")
// const

exports.renderOrganizationForm = (req, res) => {
    //check wheather the user already created org or not redirect accordingly

    const currentOrgNumber = req.user[0].currentOrgNumber;
    if (currentOrgNumber) {
        res.redirect('/dashboard');
        return;
    }
    res.render("addOrganization")
};

const generateRandomNumber = ()=>{
    return Math.floor(1000 + Math.random() * 9000);
}

exports.createOrganization = async(req,res,next)=>{
    const userId = req.userId;

    // find data of above userId 
    const user = await users.findByPk(userId)
  
    const organizationNumber = generateRandomNumber()
    const {organizationName,organizationAddress,organizationPhoneNumber,organizationEmail} = req.body 
    const organizationPanNumber = req.body.organizationPanNumber || null 
    const organizationVatNumber = req.body.organizationVatNumber|| null

    
    
    
    // create users_org table 
    await sequelize.query(`CREATE TABLE IF NOT EXISTS users_org(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, userId INT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE, organizationNumber VARCHAR(255))`,{
        type : QueryTypes.CREATE                                                                                                                                                                                    
    })

    // create organization Table 
    await sequelize.query(`CREATE TABLE organization_${organizationNumber}(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), phoneNumber VARCHAR(255), address VARCHAR(255), panNo VARCHAR(255), vatNo VARCHAR(255) )`,{
        type : QueryTypes.CREATE
    })

    //users invitation table
    await sequelize.query(`CREATE TABLE invitations_${organizationNumber}(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, userId INT REFERENCES users(id), token VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`, {
        type:QueryTypes.CREATE
    })

    // insert above data to table 
    await sequelize.query(`INSERT INTO organization_${organizationNumber}(name,email,phoneNumber,address,panNo,vatNo) VALUES (?,?,?,?,?,?) `,{
        type : QueryTypes.INSERT,                                       
        replacements  : [organizationName,organizationEmail,organizationPhoneNumber,organizationAddress,organizationPanNumber,organizationVatNumber]
    })

   
    await sequelize.query(`INSERT INTO users_org (userId,organizationNumber) VALUES(?,?)`,{
        type : QueryTypes.INSERT,
        replacements : [userId,organizationNumber]
    })

    const organization = await sequelize.query(`SELECT * FROM organization_${organizationNumber}`, {
        type: QueryTypes.SELECT,

    });
    if (organization) {
      const  organization = generateRandomNumber();
    }
    user.currentOrgNumber = organizationNumber
    await user.save()
   req.organizationNumber  = organizationNumber
   next()
}

exports.createQuestionsTable = async(req,res,next)=>{
    const organizationNumber   = req.organizationNumber

    
    // create table

    await sequelize.query(`CREATE TABLE question_${organizationNumber}(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,title VARCHAR(255),description TEXT,userId INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`,{
        type : QueryTypes.CREATE
    })
    next()
}

exports.createAnswersTable = async(req,res)=>{
    const organizationNumber = req.organizationNumber 

    await sequelize.query(`CREATE TABLE answer_${organizationNumber}(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,userId INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE, answer TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, questionId INT REFERENCES questions(id) ON DELETE CASCADE ON UPDATE CASCADE )`,{
        type : QueryTypes.CREATE
    })
    res.redirect("/dashboard")
}

exports.createQuestionImages = async(req,res,next)=>{
    const organizationNumber = req.organizationNumber
  
    await sequelize.query(`CREATE TABLE questionImages_${organizationNumber}(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, questionId INT REFERENCES question_${organizationNumber}(id),questionImage VARCHAR(255),created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP )`,{
        type : QueryTypes.CREATE
    })
    next()
}

// dashboard
exports.renderDashboard = (req,res)=>{
    res.render("dashboard/index")
}

exports.renderForumPage = async(req,res)=>{
    const organizatonNumber = req.user[0].currentOrgNumber

    const questions = await sequelize.query(`SELECT question_${organizatonNumber}.*,users.username FROM question_${organizatonNumber} JOIN users ON question_${organizatonNumber}.userId = users.id`,{
        type : QueryTypes.SELECT
    })
    console.log(questions)
    res.render("dashboard/forum",{questions : questions})
}

exports.renderQuestionForm = (req,res)=>{
    res.render("dashboard/askQuestion")

}


exports.createQuestion = async (req,res)=>{
   const organizationNumber = req.user[0].currentOrgNumber
   

    const userId = req.userId
  
    const {title,description} = req.body 
    const files = req.files


    if(!title || !description){
        return res.send("Please provide title,description")
    }

    // insert data into tables 
   const [questionQueryResponse] =  await sequelize.query(`INSERT INTO question_${organizationNumber} (title,description,userId) VALUES(?,?,?) `,{
        type : QueryTypes.INSERT,
        replacements : [title,description,userId]
    })
 

   for(var i = 0 ; i < files.length  ;i++){
    await sequelize.query(`INSERT INTO questionImages_${organizationNumber}(questionId,questionImage) VALUE(?,?)`,{
        TYPE : QueryTypes.INSERT,
        replacements : [ questionQueryResponse,files[i].filename]
    })
   }
    res.redirect("/forum")

}

exports.renderSingleQuestion = async (req,res)=>{
    const organizationNumber= req.user[0].currentOrgNumber
    const {id} = req.params
    const question = await sequelize.query(`SELECT * FROM question_${organizationNumber} WHERE id=?`,{
        type : QueryTypes.SELECT,
        replacements : [id]
    })
    const questionImages = await sequelize.query(`SELECT * FROM questionImages_${organizationNumber} WHERE questionId=?`,{
        type : QueryTypes.SELECT,
        replacements : [id]
    })
    const answers = await sequelize.query(`SELECT * FROM answer_${organizationNumber} JOIN users ON users.id=answer_${organizationNumber}.userId WHERE questionId=?`, {
        type: QueryTypes.SELECT,
        replacements:[id]
    })
    // console.log(answers);
    res.render("dashboard/singleQuestion",{question,questionImages, answers })
}

exports.answerQuestion = async (req, res) => {
    const organizationNumber = req.user[0].currentOrgNumber;
    const { text, questionId } = req.body;
    const userId = req.userId;
    const answerGarneyManxeyKoEmail = req.user[0].email;
    //const take u
  const [data]=  await sequelize.query(`SELECT users.email FROM question_${organizationNumber} JOIN users ON question_${organizationNumber}.userId=users.id WHERE question_${organizationNumber}.id=?`, {
        type: QueryTypes.SELECT,
        replacements: [questionId]
    });

    const questionGarneyManxeyKoEmail = data.email;
    await sequelize.query(`INSERT INTO answer_${organizationNumber} (userId,questionId,answer)VALUES(?,?,?)`, {
        type: QueryTypes.INSERT,
        replacements: [userId, questionId, text]
    });
    sendEmail({
        to: questionGarneyManxeyKoEmail,
        subject: "Someone has answered your question",
        userEmail: userEmail,
        text:`${answerGarneyManxeyKoEmail} is invitiing `
    })


    res.json({
        status: 200,
        message: "Answer send successfully"
    });
};



exports.renderMyOrgs = async (req, res) => {
    const userId = req.userId;
    // console.log(userId, "id");
    const organizationNumber = req.user[0].currentOrgNumber;
   
    

    //query the users org table to get orgnumber list 
   const userOrgsNumber =  await sequelize.query(`SELECT organizationNumber FROM users_org WHERE userId=?`,{
        type : QueryTypes.SELECT,
        replacements : [userId]
    })
    // console.log(userOrgsNumber, "organization num");
    // return;
    let orgDatas = [];
    for (let i = 0; i < userOrgsNumber.length; i++){
        const [orgData] = await sequelize.query(`SELECT * FROM organization_${userOrgsNumber[i].organizationNumber}`, {
            
        });
        
        orgDatas.push({...orgData[0],organizationNumber:+userOrgsNumber[i].organizationNumber});
    };
    // console.log(orgDatas);
    // return;  

    res.render('dashboard/myOrgs',{orgDatas,currentOrgNumber:organizationNumber});
}

exports.deleteOrganization = async(req, res)=> {
    const { id: organizationNumber } = req.params;
    const currentOrg = req.user[0].currentOrgNumber;
    const userId = req.userId;
   

     
    
    

    await sequelize.query(`DROP TABLE IF EXISTS organization_${organizationNumber}`, {
        type: QueryTypes.DELETE 
    });
    await sequelize.query(`DROP TABLE IF EXISTS forum_${organizationNumber}`, {
        type: QueryTypes.DELETE 
    });
    await sequelize.query(`DROP TABLE IF EXISTS answer_${organizationNumber}`, {
        type: QueryTypes.DELETE 
    });
    await sequelize.query(`DELETE FROM users_org WHERE organizationNumber=?`, {
        type: QueryTypes.DELETE,
        replacements:[organizationNumber]
    });
    
    
    if (organizationNumber == currentOrg) {
        //switching to previous one 
        const userOrgsNumber = await sequelize.query(`SELECT organizationNumber FROM users_org WHERE userId=?`, {
            type : QueryTypes.SELECT,
            replacements : [userId]
        })
        console.log(userOrgsNumber,"kingi");
        const orgsLength = userOrgsNumber.length;
        const previousOrg = userOrgsNumber[orgsLength - 2];
        console.log(previousOrg, "queen");
        // return;
        const user = await users.findByPk(userId);
        user.currentOrgNumber = previousOrg.organizationNumber;
        await user.save();
         
     }
    res.redirect('/myOrgs');

}

exports.renderInvitePage = (req, res) => {
    res.render('invite')
}

function generateToken(length=32) {
    return crypto.randomBytes(length).toString('hex')
}

exports.inviteFriends = async (req, res) => {
    const { email: receiverEmail } = req.body;
    const currentOrg = req.user[0].currentOrgNumber;
    const userEmail = req.user[0].email;
    const userId = req.userId;


    const token = generateToken(10);


    await sequelize.query(`INSERT INTO invitation_${currentOrg}(userId,token) VALUES(?,?)`, {
        type: QueryTypes.INSERT,
        replacements: [userId, token]
    });

    await sendEmail({
        email: receiverEmail,
        subject: "Invitation to multitenant03",
        userEmail: userEmail,
        invitationLink: `http://localhost:3000/accept-invite?org=${currentOrg}&token=${token}`
    });

    res.send('INVITED SUCCESSFULLY');



};

exports.acceptInvitation = async (req, res) => {
    const { token, org: orgNumber } = req.query;
    const userId = req.userId;

    //check wheather that 
    const [exists] = await sequelize.query(`SELECT * FROM invitaions_${orgNumber} WHERE token=?`, {
        type: QueryTypes.SELECT,
        replacements: [token]
    });

    if (exists) {
        //if exists xa vaney change the current org value of  the requesting user

        const userData = await users.findByPk(userId);

        userData.currentOrgNumber = orgNumber;
        await userData.save();
        res.redirect('/dashboard')
    } else {
        res.send("Invalid invitation link");
    }
};

exports.deleteQuestions = async (req, res) => {
    const userId = req.userId;
    const { id: questionId } = req.params;
    const organizationNumber=req.user[0].currentOrgNumber
    const [question] = await sequelize.query(`SELECT * FROM question_${organizationNumber}`, {
        type: QueryTypes.SELECT,
        replacements: [questionId]
    });
    if (!question) {
        res.send("Question deosnt exist of theat id");

    } else {
        //
        if (question.userId !== userId) {
            res.send('You are not allowed to delete this question');
        } else {
            await sequelize.query(`DELETE FROM question_${organizationNumber} WHERE userId=?`, {
                type: QueryTypes.DELETE,
                replacements: [questionId]
            });
            res.redirect('/questionDelete/' + questionId);
        }
    }
}

exports.deleteAnswer = async (req, res) => {
    const userId = req.userId;
    const { id: answerId } = req.params;
    const organizationNumber=req.user[0].currentOrgNumber
    const [answer] = await sequelize.query(`SELECT * FROM question_${organizationNumber} WHERE id=?`, {
        type: QueryTypes.SELECT,
        replacements: [answerId]
    });
    if (!answer) {
        res.send("Answer deosnt exist of theat id");

    } else {
        //
        if (question.userId !== userId) {
            res.send('You are not allowed to delete this answer');
        } else {
            await sequelize.query(`DELETE FROM answer_${organizationNumber} WHERE id=?`, {
                type: QueryTypes.DELETE,
                replacements: [answerId]
            });
            res.redirect('/question/' + answerId);
        }
    }
}