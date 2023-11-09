import uuid
import os
from django.core.files import File
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from .models import Post, Video
import boto3
from django.conf import settings
import json
from decimal import Decimal
import subprocess
from .srtTovtt import getJSON
from .forms import VideoForm
import threading


async def index(request):
    return render(request, 'video.html')


def home(request):
    # Open an existing file using Python's built-in open()

    return render(request, 'home.html', {'posts': Post.objects.all()})


import shutil


def upload_subtitle(data):
    print('Sub start')
    session = boto3.Session(
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )
    dynamodb = session.resource('dynamodb')
    table = dynamodb.Table('subtitle')
    for i in data:
        table.put_item(Item=json.loads(json.dumps(i), parse_float=Decimal))
    print('Sub end')


def upload_video(copy, ins):
    print('Video start')
    f = open(copy, 'rb')
    myfile = File(f)
    ins.video = myfile
    ins.save()
    f.close()
    os.remove(copy)
    print('Video end')


def video(request):
    print('Video Method', request.method)
    if request.method == 'POST':
        print(request.FILES)
        print('=', request.POST.get('local'), '=')
        form = VideoForm(data=request.POST, files=request.FILES)
        if form.is_valid():
            print(request.FILES['video'].name)
            fileName = originalName = request.FILES['video'].name
            ext = ''
            for i in range(1, len(fileName)):
                if fileName[-i] != '.':
                    ext = fileName[-i] + ext
                else:
                    ext = fileName[-i] + ext
                    break
            newName = str(uuid.uuid4().hex)
            request.FILES['video'].name = newName + ext
            print(request.FILES['video'].name)
            temp = path = request.FILES['video'].temporary_file_path()
            video = ''
            # return HttpResponse('Uploaded Unsuccessfully')
            for i in range(1, len(temp)):
                if temp[-1] != '.':
                    temp = temp[:-1]
                else:
                    temp = temp[:-1]
                    break
            for i in range(1, len(temp)):
                if temp[-1] != '\\':
                    video = temp[-1] + video
                    temp = temp[:-1]
                else:
                    break
            copy = shutil.copyfile(path, temp + newName + ext)
            print('===>', copy)
            process = subprocess.Popen(
                ['CCExtractor/ccextractorwinfull.exe', copy],
                stdout=subprocess.PIPE, stderr=subprocess.STDOUT
            )
            process.communicate()  # wait till all process finish
            data = getJSON(prefix=newName, path=temp, name=newName, video=copy)
            # print(data)
            message = f'{len(data)} Subtitle Found'
            t1 = threading.Thread(target=upload_subtitle, args=(data,), kwargs={})
            t1.setDaemon(True)
            # t1.start()
            ins = Video.objects.create()
            ins.original_name = originalName
            t2 = threading.Thread(target=upload_video, args=(copy, ins,), kwargs={})
            t2.setDaemon(True)
            # t2.start()
            response = {
                'data': data,
                'ins': ins.id,
                'video': newName + ext,
                'subtitle': newName,
                'message': message}
        # return JsonResponse(response)
        return HttpResponse(json.dumps(response), content_type="application/json")
    else:
        return render(request, 'video.html')


def videoIndex(request, index):
    if request.method == 'GET':
        video = Video.objects.get(id=index)
        return render(request, 'videoIndex.html', {'url': video.video.url, 'name': video.name})
