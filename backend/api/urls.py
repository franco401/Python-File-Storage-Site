from django.urls import path
from . import views

urlpatterns = [
    path('file/<str:file_name>', views.get_file, name='get_file'),
    path('all-files', views.get_all_files, name='get_all_files'),
    path('files/user/<str:username>', views.get_files_from_user, name='get_files_from_user'),
    path('download-file/<str:file_name>', views.download_file, name='download_file'),
    path('upload-file', views.upload_file, name='upload_file'),
    path('register-user', views.register_user, name='register_user'),
    path('delete-user', views.delete_user, name='delete_user'),
]