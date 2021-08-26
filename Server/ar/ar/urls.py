from django.contrib import admin
from django.urls import path, include
import api.views as api
import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),
    path('contribute/', views.contribute),
    path('api/update_available/<str:version>', api.update_available),
    path('api/welcome_page', api.welcome_page),
    path('api/<str:data>', api.api, name='api'),
]
