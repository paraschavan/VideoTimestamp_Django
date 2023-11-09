import threading

from django.db.models.signals import pre_save, pre_delete, post_delete
from django.dispatch import receiver
from Main.models import Video
import boto3
from django.conf import settings
from boto3.dynamodb.conditions import Key

#
@receiver(pre_save,sender=Video)
def add_name(sender,instance,**kwargs):
    print('Signal Invoked')
    name = instance.video.name
    print(name)
    for i in range(1,len(name)):
        if name[-1] != '.':
            name = name[:-1]
        else:
            name = name[:-1]
            break
    newName = ''
    for i in range(1, len(name)):
        if name[-i] != '\\':
            newName = name[-i] + newName
        else:
            break
    instance.name = newName
    print('======>>',instance.name)

# @receiver(pre_delete, sender=Video)
# def mymodel_delete(sender, instance, **kwargs):
#     instance.video.delete(False)

# from pathlib import Path
# import shutil
# import boto3
#
# @receiver(post_delete, sender=Video)
# def mymodel_post_delete(sender, instance, **kwargs):
#     print('Post delete')
#     bucket_name = "v2s"
#     s3_client = boto3.client("s3")
#     # First we list all files in folder
#     response = s3_client.list_objects_v2(Bucket=bucket_name,
#                                          Prefix=f"static/video/{instance.name}/")
#     files_in_folder = response["Contents"]
#     files_to_delete = []
#     # We will create Key array to pass to delete_objects function
#     for f in files_in_folder:
#         files_to_delete.append({"Key": f["Key"]})
#     # This will delete all files in a folder
#     response = s3_client.delete_objects(
#         Bucket=bucket_name, Delete={"Objects": files_to_delete}
#     )
#     print(response)
def dynamoDB(instance):
    name = instance.name
    session = boto3.Session(
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )
    dynamodb = session.resource('dynamodb')
    table = dynamodb.Table('subtitle')
    out = table.scan(FilterExpression=Key('video').eq(name))
    response = out['Items']
    if response:
        print(response)
        print(len(response))
    for r in response:
        res = table.delete_item(
            Key={
                'id': r['id'],
            }
        )

@receiver(post_delete, sender=Video)
def mymodel_post_delete(sender, instance, **kwargs):
    t1 = threading.Thread(target=dynamoDB, args=(instance,), kwargs={})
    t1.setDaemon(True)
    t1.start()
