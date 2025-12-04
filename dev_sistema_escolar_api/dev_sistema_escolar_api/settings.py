import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --- SEGURIDAD: DETECCIÓN DE ENTORNO ---
# Render inyecta la variable 'RENDER' automáticamente. 
# Si existe (estamos en producción), DEBUG se vuelve False.
RENDER = os.environ.get('RENDER', False)
DEBUG = not RENDER 

SECRET_KEY = os.environ.get('SECRET_KEY', '-_&+lsebec(whhw!%n@ww&1j=4-^j_if9x8$q778+99oz&!ms2')

# ALLOWED_HOSTS permite que Render sirva la página
ALLOWED_HOSTS = ["*"] 

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_filters',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',  # Necesario para conectar con Angular
    'dev_sistema_escolar_api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # <--- CRÍTICO: Sirve archivos estáticos en Render
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',       # <--- CRÍTICO: Debe ir antes de CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Permitir acceso desde cualquier lugar (temporalmente para evitar errores de CORS con Vercel)
CORS_ALLOW_ALL_ORIGINS = True 
CORS_ALLOW_CREDENTIALS = True

ROOT_URLCONF = 'dev_sistema_escolar_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'dev_sistema_escolar_api.wsgi.application'

# --- CONFIGURACIÓN DE BASE DE DATOS (IMPORTANTE) ---
# En Render usamos SQLite porque MySQL no está instalado en el contenedor básico gratuito.
if RENDER:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
        }
    }
else:
    # Configuración local de MySQL (esta se usará solo en tu PC)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'OPTIONS': {
                'read_default_file': os.path.join(BASE_DIR, "my.cnf"),
                'charset': 'utf8mb4',
            }
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# --- ARCHIVOS ESTÁTICOS ---
STATIC_URL = '/static/'

# STATIC_ROOT es obligatorio para que collectstatic funcione en el build.sh de Render
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Activar compresión de WhiteNoise solo cuando DEBUG es False (Producción)
if not DEBUG:    
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

REST_FRAMEWORK = {
    'COERCE_DECIMAL_TO_STRING': False,
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'dev_sistema_escolar_api.models.BearerTokenAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
}