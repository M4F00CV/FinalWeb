# FinalWeb
Sistema Escolar - BUAP (Fullstack)

Este proyecto es un sistema de gestión escolar desarrollado con una arquitectura Fullstack, separando el Frontend y el Backend.

🏗️ Estructura del Proyecto

El repositorio está organizado en dos carpetas principales:

/backend: API REST desarrollada con Python y Django.

/frontend: Aplicación web desarrollada con Angular y Angular Material.

🚀 Guía de Ejecución Local

Para ejecutar este proyecto, necesitarás abrir dos terminales: una para el servidor de Django y otra para el servidor de Angular.

Prerrequisitos

Asegúrate de tener instalado:

Python (v3.8 o superior)

Node.js (v16 o superior)

Angular CLI (npm install -g @angular/cli)

1️⃣ Configuración del Backend (Python/Django)

En tu primera terminal, sigue estos pasos:

Entra a la carpeta del backend:

cd backend


Crea un entorno virtual (recomendado):

python -m venv venv


Activa el entorno virtual:

Windows: venv\Scripts\activate

Mac/Linux: source venv/bin/activate

Instala las dependencias:

pip install -r requirements.txt


Realiza las migraciones de la base de datos:

python manage.py makemigrations
python manage.py migrate


(Opcional) Crea un superusuario para entrar al panel de administración:

python manage.py createsuperuser


Ejecuta el servidor:

python manage.py runserver


El Backend estará corriendo en: http://127.0.0.1:8000/

2️⃣ Configuración del Frontend (Angular)

En tu segunda terminal, sigue estos pasos:

Entra a la carpeta del frontend:

cd frontend


Instala las dependencias de Node (solo la primera vez):

npm install


Ejecuta la aplicación:

ng serve -o


El Frontend se abrirá automáticamente en: http://localhost:4200/

🛠️ Tecnologías Utilizadas

Backend: Django, Django REST Framework.

Frontend: Angular 16+, Angular Material, Chart.js (Ng2-Charts), Bootstrap.

Base de Datos: SQLite (por defecto para desarrollo).

👤 Usuarios de Prueba (Roles)

Si generaste usuarios de prueba, puedes listar aquí algunos para acceso rápido:

Administrador: (Tu usuario / contraseña)

Maestro: ...

Alumno: ...

Desarrollado para la materia de Desarrollo de Aplicaciones Web - BUAP