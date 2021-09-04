from django.http.response import HttpResponse
from django.shortcuts import render
import json
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from accounts.models import Profile, Donation, DonationForm
from django.views.decorators.csrf import csrf_exempt
from django.http import QueryDict

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

def login (request, CREDENTIALS):

    #Computes the login from the app, and checks if credentials are correct
    #Returns a dictionary with the user information if sucessful. 

    #Decoding base64:
    #CREDENTIALS = base64.b64decode(CREDENTIALS)

    if type(CREDENTIALS) == str:

        #Checking validation of credentials:

        user = authenticate(request,
        username=CREDENTIALS[:CREDENTIALS.index(':')],
        password=CREDENTIALS[CREDENTIALS.index(':')+1:])

        if user is not None:

            return {
                    "login_status": True,
                    "bio" : user.profile.bio,
                    "location" : user.profile.location,
                    "number_of_books" : user.profile.number_of_books,
                    "profile_image" : user.profile.image,
                    "supporter" : user.profile.supporter,
            }
        
        else: #Invalid credentials
            return {
                "login_status": False,
            }

def get_info (request, user_id):
    #Returns user profile

    user = User.objects.get(pk=user_id)

@csrf_exempt
def donation (request):

    #New user made a donation

    if request.method == 'POST':

        dic = request.POST.dict()

        keys = list(dic.keys())[0]

        keys = keys[0] + '"' + keys[1:-1] + '"}'

        keys_list = []

        keys_list[:0]=keys

        for element in keys_list:

            if element == ':':

                index = keys_list.index(element)

                keys_list[index] = '":"'

            if element == ',':

                index = keys_list.index(element)

                keys_list[index] = '","'

        keys = ''.join(map(str, keys_list))

        timestamp = keys.find('timestamp') + 4

        error = keys.find('":"', timestamp)

        keys = keys[:error] + ':'
    
        #keys = json.loads((keys))

        return HttpResponse(keys)

        #Creating now the form

        #form = DonationForm(initial=dic)

        #print(form)

        #if form.is_valid():
           # return HttpResponse('Valid')


    return HttpResponse(status=400)




    