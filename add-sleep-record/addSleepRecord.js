const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const data = JSON.parse(event.body);
    const params = {
        TableName: 'SleepRecords',
        Item: {
            'UserID': data.UserID,
            'DateTime': data.DateTime,
            'SleepStart': data.SleepStart,
            'SleepEnd': data.SleepEnd,
            'WakeUps': data.WakeUps,
            'SleepQuality': data.SleepQuality,
            'SleepNotes': data.SleepNotes,
            'UpdatedAt': new Date().toISOString()
        }
    };

    try {
        await dynamoDb.put(params).promise();
        return {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            },
            body: JSON.stringify({ message: "Sleep record added successfully." }),
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
