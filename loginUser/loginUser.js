const AWS = require('aws-sdk');
const bcrypt = require('bcryptjs');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        const { email, password } = JSON.parse(event.body);

        // Fetch user data from DynamoDB
        const params = {
            TableName: 'LullabitesUsers',
            Key: {
                userId: email
            }
        };

        const result = await dynamoDb.get(params).promise();
        const user = result.Item;

        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found.' })
            };
        }

        // Verify password
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Invalid password.' })
            };
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Email not verified.' })
            };
        }

        // Update last login time
        const updateParams = {
            TableName: 'LullabitesUsers',
            Key: {
                userId: email
            },
            UpdateExpression: 'set lastLoginTime = :t',
            ExpressionAttributeValues: {
                ':t': new Date().toISOString()
            },
            ReturnValues: 'UPDATED_NEW'
        };

        await dynamoDb.update(updateParams).promise();

        // Return success response
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Login successful.' })
        };
    } catch (error) {
        console.error('Error in login process:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error during login process.' })
        };
    }
};
