from django.urls import path
from . import views

#views for jwt authentication
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('file/<str:file_name>/', views.get_file, name='get_file'),
    path('all-files/', views.get_all_files, name='get_all_files'),
    path('files/user/<str:username>/', views.get_files_from_user, name='get_files_from_user'),
    path('download-file/<str:file_name>/', views.download_file, name='download_file'),
    path('delete-file/<str:file_name>/', views.delete_file, name='delete_file'),
    path('upload-file/', views.upload_file, name='upload_file'),
    path('register/', views.register_user, name='register_user'),
    path('login/', views.login_user, name='login_user'),
    path('delete-account/', views.delete_user, name='delete_user'),
]