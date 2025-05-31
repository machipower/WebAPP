import json
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('users')

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])

        userId = body.get('userId')
        nickname = body.get('nickname')
        major = body.get('major')
        skills = body.get('skills', [])
        selfIntro = body.get('selfIntro', '')
        resumeUrl = body.get('resumeUrl', '')
        timestamp = datetime.utcnow().isoformat()

        # 寫入 DynamoDB
        table.put_item(
            Item={
                'userId': userId,
                'nickname': nickname,
                'major': major,
                'skills': skills,
                'selfIntro': selfIntro,
                'resumeUrl': resumeUrl,
                'createdAt': timestamp
            }
        )

        return {
            'statusCode': 200,
            'body': json.dumps({'message': '✅ 使用者資料已儲存'})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
