from django import forms
from Main.models import Video

class VideoForm(forms.ModelForm):
    class Meta:
        model = Video
        fields=('video',)