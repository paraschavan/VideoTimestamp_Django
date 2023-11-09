from django.db import models
import os

# Create your models here.
def get_path(instance, filename):
    ext = ''
    for i in range(1, len(filename)):
        if filename[-i] != '\\':
            ext = filename[-i] + ext
        else:
            break
    print(os.path.join('video', ext))
    return os.path.join('video', ext)

class Video(models.Model):
    original_name = models.CharField(max_length=200,blank=True)
    name = models.CharField(max_length=50,blank=True)
    video = models.FileField(upload_to=get_path,blank=True)
    def __str__(self):
        return str(self.id)

class Post(models.Model):
    title = models.CharField(max_length=255)
    body = models.TextField()
    image = models.ImageField(upload_to='temp/')

    def __str__(self):
        return self.title