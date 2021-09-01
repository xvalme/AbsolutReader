from django.contrib import admin
from django.urls import path, include
import api.views as api
from .views import index, contribute


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', index, name='index'),
    path('contribute/', contribute),

    path('api/update_available/<str:version>', api.update_available),
    path('api/welcome_page', api.welcome_page),
    path('api/login/<str:CREDENTIALS>', api.login),
    path('api/<str:data>', api.api, name='api'),
]
