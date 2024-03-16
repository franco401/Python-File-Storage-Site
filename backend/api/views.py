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

#used for customizing jwt token
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

#==============================================================
#used for adding username to jwt response
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        token = super().validate(attrs)

        # Add your extra responses here
        token['username'] = self.user.name
        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
#==============================================================


# creates a base64 encoded string
def create_file_id(data: str) -> str:
    base64_bytes = base64.b64encode(data.encode("ascii"))
    base64_string = base64_bytes.decode("ascii")
    return base64_string

# route: api/file/<str:file_name>/
@api_view(['GET'])
def get_file(request: HttpRequest, file_name) -> Response:
    if request.method == 'GET':
        try:
            #query database to get specific file data    
            file = File.objects.get(name=file_name)

            #json data to send to frontend
            file_obj = {
                'name': file.name,
                'size': file.size,
                'date_uploaded': file.date_uploaded,
                'uploader': file.uploader,
            }

            return Response(data=file_obj)
        except:
            #if the specified file name isn't in the database
            return Response(status=404, data={"error": "file_not_found"})

# route: api/all-files/
@api_view(['GET'])
def get_all_files(request: HttpRequest) -> Response:
    if request.method == 'GET':
        #query database to get all file data
        files = File.objects.all()
        
        file_serializer = FileSerializer(files, many=True)
        return Response(data=file_serializer.data)


# route: api/files/user/<str:username>/
@api_view(['GET'])
def get_files_from_user(request: HttpRequest, username: str) -> Response:
    if request.method == 'GET':
        try:
            #query database to get all file data from a specific user
            files = File.objects.filter(uploader=username)
            
            for file in files:
                print("file:", file.name, file.uploader)

            file_serializer = FileSerializer(files, many=True)
            return Response(data=file_serializer.data)
        except:
            #if specified user doesn't exist
            return Response(status=404)


# route: api/download-file/<str:file_name>/
def download_file(request: HttpRequest, file_name: str) -> HttpResponse:
    #get path of file to download
    file_path = settings.MEDIA_ROOT + "\\" + file_name
    file_path = file_path.replace('\\', '/')

    try:
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
    except:
        #if specified file is not found
        return HttpResponse(404)


# route: api/upload-file/
@api_view(['POST'])
def upload_file(request: HttpRequest) -> JsonResponse:
    if request.method == 'POST':
        #file uploaded from post request
        file = request.FILES['file']

        #get the index of the character '|'
        delimiter_index = file.name.index("|")
        
        #get username from substring before '|'
        username = file.name[0:delimiter_index]
        
        #get filename from substring after '|'
        file_name = file.name[delimiter_index+1:]

        #upload file to a server directory    
        file_to_save = default_storage.save(file_name, file)

        #get current time in milliseconds
        current_time = round(time.time() * 1000)

        #insert file to database (with the following data below)
        File.objects.create(
            file_id = create_file_id(file_name + str(current_time)),
            name = file_name,
            size = file.size,
            date_uploaded = current_time,
            uploader = username,
        )

        return JsonResponse(file_to_save, safe=False)

# route: api/delete-file/<str:file_name>/
def delete_file(request: HttpRequest, file_name: str) -> HttpResponse:
    try:
        #query file name from database
        file = File.objects.get(name=file_name)

        #delete file from database
        file.delete()

        #delete file from media folder
        default_storage.delete(file.name)

        return HttpResponse(200)
    except:
        #if file name is not in database
        return HttpResponse(404)

# route: api/register-user/
@api_view(['POST'])
def register_user(request: HttpRequest) -> Response:
    if request.method == 'POST':
        email = request.data['email']
        password = request.data['password']

        '''
        gets name from email
        example: gets user1 from user1@example.com
        '''
        username = email[0:email.index("@")]

        try:
            #create user account and save it to database
            user = UserAccount.objects.create_user(email=email, name=username, password=password)
            user.save()
            return Response(status=200)
        except:
            #if an insert error occurs
            return Response(status=404)
        

# route: api/login-user/
# may be unused
@api_view(['POST'])
def login_user(request: HttpRequest) -> Response:
    if request.method == 'POST':
        email = request.data['email']
        password = request.data['password']

        try:
            #try to find account by email in database
            user = UserAccount.objects.get(email=email)
            
            #if account's password matches
            if user.check_password(password):
                return Response(status=200)
            else:
                return Response(status=404)
        except:
            #if account doesn't exist (couldn't find email)
            return Response(status=404)

# route: api/delete-user/
@api_view(['POST'])
def delete_user(request: HttpRequest) -> Response:
    if request.method == 'POST':
        email = request.data['email']
        try:
            #get user object from database and delete it
            user = UserAccount.objects.get(email=email)
            user.delete()
            return Response(status=200)
        except:
            #if account doesn't exist (couldn't find email)
            return Response(status=404)