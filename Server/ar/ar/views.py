from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm

def index (request):
    return render (request, "index.html")

def contribute (request):
    return render (request, "contribute.html")

def signupsucess (request):

    return render (request, "sucess-signup.html")

def signup (request):

    if request.method == 'POST':

        form = UserCreationForm(request.POST)

        if form.is_valid():

            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)

            return redirect('signupsucess')
    else:

        form = UserCreationForm()

    return render(request, 'signup.html', {'form': form})