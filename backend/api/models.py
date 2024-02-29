from django.db import models
from django.db.models.functions import Now

class File(models.Model):
    #base64 encoded id
    file_id = models.CharField(max_length=64)
    
    #name of file (max 255 chars)
    name = models.CharField()

    #size of file in bytes
    size = models.IntegerField()

    #when the file was uploaded
    date_uploaded = models.DateTimeField(db_default=Now()) 