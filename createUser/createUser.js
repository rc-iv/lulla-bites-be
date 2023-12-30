const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

    // Check if the user already exists
    const getUserParams = {
      TableName: "LullabitesUsers",
      Key: {
        userId: email,
      },
    };

    const existingUser = await dynamoDb.get(getUserParams).promise();
    if (existingUser.Item) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        body: JSON.stringify({ message: "User already exists." }),
      };
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Generate email verification code
    const emailCode = uuidv4();

    // User data
    const userData = {
      userId: email,
      signupTime: new Date().toISOString(),
      lastLoginTime: null,
      password: hashedPassword,
      isEmailVerified: false,
      emailCode: emailCode,
      childrenSettings: [
        {
          name: "Little One",
          birthday: new Date().toISOString(),
          targetFeedingAmount: 0,
          targetSleepAmount: 0,
          numberNaps: 0,
          targetBedtime: "00:00",
          targetWakeTime: "00:00",
        },
      ],
    };

    // DynamoDB parameters
    const putParams = {
      TableName: "LullabitesUsers",
      Item: userData,
    };

    // Store in DynamoDB
    await dynamoDb.put(putParams).promise();

    // Send verification email
    const verificationLink = `https://lulla-bites.com/verify?email=${encodeURIComponent(
      email
    )}&code=${emailCode}`;
    const emailParams = {
      Source: "register@lulla-bites.com",
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: "Email Verification" },
        Body: {
          Text: {
            Data: `Please click the following link to verify your email: ${verificationLink}.`,
          },
        },
      },
    };

    await ses.sendEmail(emailParams).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify({
        message: "User created and verification email sent successfully.",
      }),
    };
  } catch (error) {
    console.error("Error in user creation or email sending:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify({
        error: "Error in user creation or email sending.",
      }),
    };
  }
};
