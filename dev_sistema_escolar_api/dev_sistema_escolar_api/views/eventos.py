from django.db.models import *
from django.db import transaction
from django.shortcuts import get_object_or_404
from dev_sistema_escolar_api.serializers import UserSerializer
from dev_sistema_escolar_api.serializers import *
from dev_sistema_escolar_api.models import *
from rest_framework import permissions
from rest_framework import generics
from rest_framework import status
from django.utils import timezone
from rest_framework.response import Response
from django.contrib.auth.models import Group
import json


class EventosView(generics.CreateAPIView):
    # Permisos por método (sobrescribe el comportamiento default)
    # Verifica que el usuario esté autenticado para las peticiones GET, PUT y DELETE
    def get_permissions(self):
        if self.request.method in ['GET', 'PUT', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return []  # POST no requiere autenticación
    #Esta función es esencial para todo donde se requiera autorización de inicio de sesión (token)
    permission_classes = (permissions.IsAuthenticated,)
    # Invocamos la petición GET para obtener todos los administradores
    def get(self, request, *args, **kwargs):
        id_evento = request.GET.get("id")
        if id_evento:
            try:
                evento = Eventos.objects.get(id=id_evento)
                serializer = EventosSerializer(evento)
                data = serializer.data
                # Manejo del JSON de materias igual que en MaestrosAll
                if "publico_objetivo" in data and data["publico_objetivo"]:
                    try:
                        data["publico_objetivo"] = json.loads(data["publico_objetivo"])
                    except Exception:
                        data["publico_objetivo"] = []
                
                return Response(data, 200)
            except Eventos.DoesNotExist:
                return Response({"message": "Evento no encontrado"}, 404)
        
    def post(self, request):
        data = request.data
        
        # Convertimos la lista de público objetivo a string para guardarla en TextField
        if 'publico_objetivo' in data and isinstance(data['publico_objetivo'], list):
            data['publico_objetivo'] = json.dumps(data['publico_objetivo'])

        serializer = EventosSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Evento creado correctamente', 'id': serializer.data['id']}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request):
        data = request.data
        # Necesitamos el ID para saber cuál actualizar
        if 'id' not in data:
             return Response({'message': 'Se requiere el ID para actualizar'}, status=status.HTTP_400_BAD_REQUEST)
             
        try:
            evento = Eventos.objects.get(id=data['id'])
        except Eventos.DoesNotExist:
            return Response({'message': 'Evento no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        # Convertimos lista a string JSON igual que en el POST
        if 'publico_objetivo' in data and isinstance(data['publico_objetivo'], list):
            data['publico_objetivo'] = json.dumps(data['publico_objetivo'])
            
        # Actualizamos la fecha de update
        data['update'] = timezone.now()

        serializer = EventosSerializer(evento, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Evento actualizado correctamente'}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @transaction.atomic
    def delete(self, request, *args, **kwargs):
        # 1. Obtenemos el ID del evento (no "maestro")
        evento = get_object_or_404(Eventos, id=request.GET.get("id"))
        try:
            # 2. CORRECCIÓN: Borramos el evento directamente
            evento.delete()
            return Response({"details":"Evento eliminado"}, 200)
        except Exception as e:
            return Response({"details":"Algo pasó al eliminar"}, 400)
        
        
class EventosViewAll(generics.CreateAPIView):
    # Permisos por método (sobrescribe el comportamiento default)
    # Verifica que el usuario esté autenticado para las peticiones GET, PUT y DELETE
    def get_permissions(self):
        if self.request.method in ['GET', 'PUT', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return []  # POST no requiere autenticación
    #Esta función es esencial para todo donde se requiera autorización de inicio de sesión (token)
    permission_classes = (permissions.IsAuthenticated,)
    # Invocamos la petición GET para obtener todos los eventos
    def get(self, request, *args, **kwargs):
        eventos_db = Eventos.objects.filter(responsable__is_active=1).select_related('responsable').order_by("id")
        lista = EventosSerializer(eventos_db, many=True).data
        for i, evento_dict in enumerate(lista):
            evento_obj = eventos_db[i] 
            if evento_obj.responsable:
                nombre_completo = f"{evento_obj.responsable.first_name} {evento_obj.responsable.last_name}"
                evento_dict["responsable_nombre"] = nombre_completo
            else:
                evento_dict["responsable_nombre"] = "Sin responsable"
                
            if "publico_objetivo" in evento_dict and evento_dict["publico_objetivo"]:
                try:
                    evento_dict["publico_objetivo_lista"] = json.loads(evento_dict["publico_objetivo"])
                except:
                    evento_dict["publico_objetivo_lista"] = []
            else:
                evento_dict["publico_objetivo_lista"] = []

        return Response(lista, 200)