#used for sending responses to frontend
from django.http import HttpResponse

#models used for database queries
from .models import File

#used for file downloading
import mimetypes
from django.conf import settings

# Create your views here.

# route: api/get-file/<str:file_name>
def get_file(response, file_name):
    file = File.objects.filter(name=file_name).values()
    return HttpResponse(
        file,
        headers={
            "Content-Type": "application/json"
        }
    )

# route: api/get-files
def get_files(response):
    files = File.objects.all().values()
    return HttpResponse(
        files,
        headers={
            "Content-Type": "application/json"
        }
    )

# route: api/download-file/<str:file_name>
def download_file(response, file_name):
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