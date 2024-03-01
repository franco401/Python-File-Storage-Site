from django.urls import path
from . import views

urlpatterns = [
    path('get-file/<str:file_name>', views.get_file, name='get_file'),
    path('get-files', views.get_files, name='get_files'),
    path('download-file/<str:file_name>', views.download_file, name='download_file'),
    path('upload-file', views.upload_file, name='upload_file'),
]