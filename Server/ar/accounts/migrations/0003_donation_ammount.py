# Generated by Django 3.2.6 on 2021-09-02 21:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_auto_20210902_1408'),
    ]

    operations = [
        migrations.AddField(
            model_name='donation',
            name='ammount',
            field=models.IntegerField(default=1, max_length=100),
        ),
    ]
