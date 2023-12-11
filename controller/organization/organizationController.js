const { QueryTypes } = require("sequelize");
const { sequelize, users } = require("../../model");

exports.renderOrganizationForm = (req, res) => {
  res.render("addOrganization");
};

function generateRandom4DigitNumber() {
  return Math.floor(1000 + Math.random() * 9000);
}

exports.createOrganization = async (req, res,next) => {
  const {
    organizationName,
    organizationAddress,
    organizationPhoneNumber,
    organizationEmail,
  } = req.body;
  const organizationPanNumber = req.body.organizationPanNumber || null;
  const organizationVatNumber = req.body.organizationAddress || null;
  const organizationNumber = generateRandom4DigitNumber();
  const userId = req.userId;

  //finding data of abover userId
  const user = await users.findByPk(userId);

  try {
    //create users_org table
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS users_org(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            userId INT REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
            organizationNumber VARCHAR(255))`,
      {
        type: QueryTypes.CREATE,
      }
    );
    //create organization table
    await sequelize.query(
      `CREATE TABLE organization_${organizationNumber}(
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phoneNumber VARCHAR(255),
        address VARCHAR(255),
        panNo VARCHAR(255),
        vatNo VARCHAR(255)
    )`,
      {
        type: QueryTypes.CREATE,
      }
    );
    // res.send("Organization created successfully");

    //inserting data into the table

    await sequelize.query(
      `INSERT INTO organization_${organizationNumber}(name,email,phoneNumber,address,panNo,vatNo) VALUES(?,?,?,?,?,?)`,
      {
        type: QueryTypes.INSERT,
        replacements: [
          organizationName,
          organizationEmail,
          organizationPhoneNumber,
          organizationAddress,
          organizationPanNumber,
          organizationVatNumber,
        ],
      }
    );

    await sequelize.query(
      `INSERT INTO users_org(userId,organizationNumber) VALUES(?,?)`,
      {
        type: QueryTypes.INSERT,
        replacements: [userId, organizationNumber],
      }
    );
    user.currentOrganization = organizationNumber;
    await user.save();
      req.organizationNumber = organizationNumber;
      next();
  } catch (error) {
    console.log("error create organization", error);
  }
};



exports.createForumTable = async (req, res) => {
    //create table
    const organizationNumber = req.organizationNumber;
    await sequelize.query(`CREATE TABLE forum_${organizationNumber}(
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        questions VARCHAR(255),
        answer VARCHAR(255)
    )`, {
        type: QueryTypes.CREATE
    });
    res.send("Organization created successfully");
}
