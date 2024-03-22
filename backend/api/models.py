from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class UserAccountManager(BaseUserManager):
    def create_user(self, email, name, password=None):
        if not email:
            raise ValueError('Users must enter an email address.')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, name, password=None):
        if not email:
            raise ValueError('Users must enter an email address.')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name)
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        return user

class UserAccount(AbstractBaseUser, PermissionsMixin):
    '''
    unique being True means that the email field will be
    used as the main way of authenticating the user instead
    of the username for logging in
    '''
    email = models.EmailField(unique=True)
    name = models.CharField()
    is_staff = models.BooleanField(default=False)
    
    #5 GB storage limit, in bytes
    storage_limit = models.BigIntegerField(default=5368709120)
    
    #will decrease towards 0 for each file the user uploads
    remaining_storage = models.BigIntegerField(default=5368709120)


    '''
    the main way to login a user with their password 
    instead of their username
    '''
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    objects = UserAccountManager()

    def get_full_name(self):
        return self.name
    
    def __str__(self):
        return self.email

class File(models.Model):
    #base64 encoded id
    file_id = models.CharField(max_length=255)
    
    #name of file (max 255 chars)
    name = models.CharField()

    #size of file in bytes
    size = models.IntegerField()

    #when the file was uploaded (time in milliseconds)
    date_uploaded = models.BigIntegerField()

    #user who uploaded this file
    uploader = models.CharField()

    #when this user's account is deleted, delete this file as well
    #user_id = models.ForeignKey(UserAccount, on_delete=models.CASCADE)