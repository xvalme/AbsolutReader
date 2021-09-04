from django.db import models
from django.forms import ModelForm
from django.contrib.auth.models import User
from django.db.models.fields import BLANK_CHOICE_DASH
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=30, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    email = models.EmailField(blank=True)
    profile_image = models.ImageField(upload_to = 'profile_images', blank=True)
    number_of_books = models.IntegerField(default=0)
    supporter = models.BooleanField(default=False)
    
    def __str__(self):
        return self.user.username

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class Book(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.TextField(max_length=100, blank=True)
    pdf = models.FileField()

    def __str__(self):
        return self.title

class Donation(models.Model):
    user = models.ForeignKey(User, blank=True, null=True, on_delete=models.CASCADE)
    message_id = models.IntegerField(max_length=100)
    timestamp = models.CharField(max_length=100)
    is_public = models.BooleanField(default=True)
    from_name = models.CharField(max_length=100, blank=True, null=True)
    url = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    is_subscription_payment = models.BooleanField(default=False)
    is_first_subscription_payment = models.BooleanField(default=False)
    kofi_transaction_id = models.CharField(max_length=100)
    ammount = models.IntegerField(default=1)
    
    def __str__(self):
        return self.from_name

class DonationForm(ModelForm):
    class Meta:
        model = Donation
        fields = ['user', 'message_id', 'timestamp', 'is_public',
                    'from_name', 'url', 'email', 'is_subscription_payment',
                        'is_first_subscription_payment', 'kofi_transaction_id', 'ammount']