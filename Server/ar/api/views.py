from django.http.response import HttpResponse
from django.shortcuts import render
import json

# Create your views here.

def api (request, data):
    return 0

def update_available (request, version):
    #Checks if there is an available update and returns an object
    update_available = False
    current_version = '0.0.1'

    if current_version != version:
        update_available = True

    data =  {"update_available": update_available,
            "current_version": current_version,
            "new_version_features": None}

    return HttpResponse( json.dumps( data ) )

def welcome_page (request):

    data = {"title": "Welcome to Absolut Reader",
            "text": "Consider making a donation on our website"}

    return HttpResponse( json.dumps( data ) )