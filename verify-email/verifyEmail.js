const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        // Parse the query parameters
        const {email, code} = JSON.parse(event.body);

        console.log("Verifying email:", email, code)
        // Retrieve user data from DynamoDB
        const getUserParams = {
            TableName: "LullabitesUsers",
            Key: {
                userId: email,
            },
        };
        const result = await dynamoDb.get(getUserParams).promise();

        // Check if the user exists and verification code matches
        if (!result.Item || result.Item.emailCode !== code) {
            return {
                statusCode: 400,
                headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Headers": "Content-Type",
                  "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
                body: JSON.stringify({ message: "Invalid request or verification code." }),
            };
        }

        // Update the isEmailVerified status
        const updateParams = {
            TableName: "LullabitesUsers",
            Key: {
                userId: email,
            },
            UpdateExpression: "set isEmailVerified = :v",
            ExpressionAttributeValues: {
                ":v": true,
            },
        };

        await dynamoDb.update(updateParams).promise();

        return {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({ message: "Email verified successfully." }),
        };
    } catch (error) {
        console.error("Error verifying email:", error);
        return {
            statusCode: 500,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            body: JSON.stringify({ error: "Error verifying email." }),
        };
    }
};
