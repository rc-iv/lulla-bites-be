const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const data = JSON.parse(event.body);
    const date = data.Date; // Expecting 'YYYY-MM-DD' format
    const userId = data.UserID;

    const params = {
        TableName: 'SleepRecords',
        KeyConditionExpression: 'UserID = :userId and begins_with(#dt, :date)',
        ExpressionAttributeNames: {
            '#dt': 'DateTime'
        },
        ExpressionAttributeValues: {
            ':userId': userId,
            ':date': date
        }
    };

    try {
        const result = await dynamoDb.query(params).promise();
        return {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            body: JSON.stringify(result.Items),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            body: JSON.stringify({ error: error.message }),
        };
    }
};
