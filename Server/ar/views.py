from django.http import HttpResponse
from django.shortcuts import render

def index (request):
    return render (request, "index.html")

def contribute (request):
    return 0