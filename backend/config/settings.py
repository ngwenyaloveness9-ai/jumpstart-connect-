"""
Django settings for config project.
"""

from pathlib import Path
import os
import environ

# -------------------------------------------------

# BASE DIRECTORY

# -------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

# -------------------------------------------------

# ENVIRONMENT VARIABLES

# -------------------------------------------------

env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# -------------------------------------------------

# SECURITY SETTINGS

# -------------------------------------------------

SECRET_KEY = env('SECRET_KEY')

DEBUG = env.bool('DEBUG', default=True)

ALLOWED_HOSTS = [
    "127.0.0.1",
    "localhost",
]

# -------------------------------------------------

# APPLICATION DEFINITION

# -------------------------------------------------

INSTALLED_APPS = [
# Django default apps
'django.contrib.admin',
'django.contrib.auth',
'django.contrib.contenttypes',
'django.contrib.sessions',
'django.contrib.messages',
'django.contrib.staticfiles',


# Third-party apps
'rest_framework',
'rest_framework.authtoken',
'corsheaders',

# Your apps
'users',
'authentication',
'superadmin',
'organization',


# Your apps (core system modules)
'users',
'authentication',
'superadmin',
'organization',

# Phase 3 apps
'jyc_apps.chat',
'jyc_apps.announcements',
'jyc_apps.files',
'jyc_apps.directory',
]

MIDDLEWARE = [
'django.middleware.security.SecurityMiddleware',
'corsheaders.middleware.CorsMiddleware',


'django.contrib.sessions.middleware.SessionMiddleware',
'django.middleware.common.CommonMiddleware',
'django.middleware.csrf.CsrfViewMiddleware',
'django.contrib.auth.middleware.AuthenticationMiddleware',
'django.contrib.messages.middleware.MessageMiddleware',
'django.middleware.clickjacking.XFrameOptionsMiddleware',


]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
{
'BACKEND': 'django.template.backends.django.DjangoTemplates',
'DIRS': [],
'APP_DIRS': True,
'OPTIONS': {
'context_processors': [
'django.template.context_processors.request',
'django.contrib.auth.context_processors.auth',
'django.contrib.messages.context_processors.messages',
],
},
},
]

WSGI_APPLICATION = 'config.wsgi.application'

# -------------------------------------------------

# DATABASE

# -------------------------------------------------

DATABASES = {
'default': {
'ENGINE': 'django.db.backends.postgresql',
'NAME': env('DB_NAME'),
'USER': env('DB_USER'),
'PASSWORD': env('DB_PASSWORD'),
'HOST': env('DB_HOST'),
'PORT': env('DB_PORT'),
}
}

# -------------------------------------------------

# CUSTOM USER MODEL

# -------------------------------------------------

AUTH_USER_MODEL = 'users.User'

# -------------------------------------------------

# PASSWORD VALIDATION

# -------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
{
'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
},
{
'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
},
{
'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
},
{
'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
},
]

# -------------------------------------------------

# INTERNATIONALIZATION

# -------------------------------------------------

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# -------------------------------------------------

# STATIC FILES

# -------------------------------------------------

STATIC_URL = '/static/'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# MEDIA FILES (for file uploads)
# -------------------------------------------------
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# -------------------------------------------------
# DJANGO REST FRAMEWORK CONFIG
# -------------------------------------------------

# DJANGO REST FRAMEWORK

# -------------------------------------------------

REST_FRAMEWORK = {
'DEFAULT_AUTHENTICATION_CLASSES': [
'rest_framework.authentication.SessionAuthentication',
'rest_framework.authentication.TokenAuthentication',
],
'DEFAULT_PERMISSION_CLASSES': [
'rest_framework.permissions.IsAuthenticated',
]
}

# -------------------------------------------------

# EMAIL CONFIGURATION

# -------------------------------------------------

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

DEFAULT_FROM_EMAIL = 'noreply@jumpstart.com'

# -------------------------------------------------

# CORS SETTINGS

# -------------------------------------------------

CORS_ALLOW_ALL_ORIGINS = True

# Alternative production-safe option:

# CORS_ALLOWED_ORIGINS = [

# "http://localhost:5173",

# "http://127.0.0.1:5173",

# ]
