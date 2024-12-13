from django.apps import apps
from django.contrib import admin


api_models = apps.get_app_config("api").get_models()

for model in api_models:
    admin.site.register(model)
