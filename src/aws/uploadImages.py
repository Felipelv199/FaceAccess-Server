import boto3
import sys

file_name = ''
user_name = ''
try:
    file_name = sys.argv[1]
    user_name = " ".join(sys.argv[2:])
except:
    print('Not file name or user name argument')
    exit()

s3 = boto3.resource('s3')
file = open('uploads/' + file_name, 'rb')
object = s3.Object('up-faces-tia', 'index/' + file_name)
ret = object.put(Body=file, Metadata={'FullName': str(user_name)})
print('File uploaded to s3 bucket')
