#used for handling requests and responses
from django.http import HttpResponse, HttpRequest
from rest_framework.response import Response
from rest_framework.decorators import api_view

#models used for database queries
from .models import File
from .serializers import *

#used for file downloading
import mimetypes
from django.conf import settings

#used for file uploading
from django.core.files.storage import default_storage
from django.http.response import JsonResponse

#used for uploading current time to database
import time

#used for making a base64 string
import base64

# creates a base64 encoded string
def create_file_id(data: str) -> str:
    base64_bytes = base64.b64encode(data.encode("ascii"))
    base64_string = base64_bytes.decode("ascii")
    return base64_string

# route: api/get-file/<str:file_name>
@api_view(['GET'])
def get_file(request: HttpRequest, file_name) -> Response:
    if request.method == 'GET':
        #query database to get specific file data    
        file = File.objects.get(name=file_name)

        #json data to send to frontend
        file_obj = {
            'name': file.name,
            'size': file.size,
            'date_uploaded': file.date_uploaded
        }

        return Response(file_obj)

# route: api/get-files
@api_view(['GET'])
def get_files(request: HttpRequest) -> Response:
    if request.method == 'GET':
        #query database to get all file data
        files = File.objects.all()
        
        file_serializer = FileSerializer(files, many=True)
        return Response(file_serializer.data)


# route: api/download-file/<str:file_name>
def download_file(request: HttpRequest, file_name: str) -> HttpResponse:
    #get path of file to download
    file_path = settings.MEDIA_ROOT + "\\" + file_name
    file_path = file_path.replace('\\', '/')

    #open file
    file = open(file_path, 'rb')
    
    #get mimetype of file
    mime_type = mimetypes.guess_type(file_path)

    '''
    create http response object to
    allow user to download file
    '''
    response = HttpResponse(file, content_type=mime_type)
    response['Content-Disposition'] = f'attachment; filename={file_name}'

    return response


# route: api/upload-file
@api_view(['POST'])
def upload_file(request: HttpRequest) -> HttpResponse:
    if request.method == 'POST':
        #file uploaded from post request
        file = request.FILES['file']
    
        #upload file to a server directory    
        file_name = default_storage.save(file.name, file)

        #get current time in milliseconds
        current_time = round(time.time() * 1000)

        #insert file to database (name, size, date_uploaded)
        File.objects.create(
            file_id = create_file_id(file.name + str(current_time)),
            name = file.name,
            size = file.size,
            date_uploaded = current_time
        )

        return JsonResponse(file_name, safe=False)