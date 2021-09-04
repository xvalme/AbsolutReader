# Generated by Django 3.2.6 on 2021-09-02 21:08

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='number_of_books',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='profile',
            name='profile_image',
            field=models.ImageField(blank=True, upload_to='profile_images'),
        ),
        migrations.AddField(
            model_name='profile',
            name='supporter',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='profile',
            name='email',
            field=models.EmailField(blank=True, max_length=254),
        ),
        migrations.CreateModel(
            name='Donation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message_id', models.IntegerField(max_length=100)),
                ('timestamp', models.CharField(max_length=100)),
                ('is_public', models.BooleanField(default=True)),
                ('from_name', models.CharField(blank=True, max_length=100, null=True)),
                ('url', models.CharField(max_length=100)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('is_subscription_payment', models.BooleanField(default=False)),
                ('is_first_subscription_payment', models.BooleanField(default=False)),
                ('kofi_transaction_id', models.IntegerField(max_length=100)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Book',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.TextField(blank=True, max_length=100)),
                ('pdf', models.FileField(upload_to='')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
