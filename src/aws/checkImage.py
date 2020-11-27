import sys
import boto3
import io
from PIL import Image

photo = sys.argv[1]

rekognition = boto3.client('rekognition', region_name='eu-west-1')
dynamodb = boto3.client('dynamodb', region_name='eu-west-1')

image = Image.open(photo)
stream = io.BytesIO()
image.save(stream, format="JPEG")
image_binary = stream.getvalue()

response = ''
try:
    response = rekognition.search_faces_by_image(
        CollectionId='family_collection',
        Image={'Bytes': image_binary}
    )
except:
    print(-1)
    exit()

if len(response['FaceMatches']) <= 0:
    print('No match found in person lookup')

for match in response['FaceMatches']:
    print(match['Face']['FaceId'], match['Face']['Confidence'])

    face = dynamodb.get_item(
        TableName='family_collection',
        Key={'RekognitionId': {'S': match['Face']['FaceId']}}
    )

    if 'Item' in face:
        print(face['Item']['FullName']['S'])
    else:
        print(-1)
