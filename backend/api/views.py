#used for sending responses to frontend
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view

#models used for database queries
from .models import File
from .serializers import *

#used for file downloading
import mimetypes
from django.conf import settings


# route: api/get-file/<str:file_name>
@api_view(['GET'])
def get_file(response, file_name) -> Response:
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
def get_files(response: HttpResponse) -> Response:
    #query database to get all file data
    files = File.objects.all()
    
    file_serializer = FileSerializer(files, many=True)
    return Response(file_serializer.data)


# route: api/download-file/<str:file_name>
def download_file(response: HttpResponse, file_name: str) -> HttpResponse:
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