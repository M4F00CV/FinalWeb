import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; // Importante: ActivatedRoute
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { eventosRegistroService } from 'src/app/services/eventos-registro.service';

@Component({
  selector: 'app-eventos-registro-screen',
  templateUrl: './eventos-registro-screen.component.html',
  styleUrls: ['./eventos-registro-screen.component.scss']
})
export class EventosRegistroScreenComponent implements OnInit {
  @Input() rol: string = "";
  @Input() datos_user: any = {};

  public errors: any = {};
  public editar: boolean = false;
  
  // Variables para Fechas
  public minDate: Date = new Date();
  public dateTimeStart: any;
  public dateTimeEnd: any;

  public evento: any;
  public lista_responsables: any[] = [];
  public idEvento: Number = 0; 

  public tipos_eventos: any[] = [
    { value: '1', viewValue: 'Conferencia' },
    { value: '2', viewValue: 'Taller' },
    { value: '3', viewValue: 'Seminario' },
    { value: '4', viewValue: 'Curso' }
  ];

  public programas_educativos: any[] = [
    { value: '1', carrera: 'Ingeniería en Ciencias de la Computación' },
    { value: '2', carrera: 'Licenciatura en Ciencias de la Computación' },
    { value: '3', carrera: 'Ingeniería en Tecnologias de la Información' }
  ];

  public lista_publico: any[] = [
    { value: '1', nombre: 'Estudiantes' },
    { value: '2', nombre: 'Profesores' },
    { value: '3', nombre: 'Público en general' }
  ];
  
  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute, 
    private facadeService: FacadeService,
    private eventosService: eventosRegistroService
  ) { 
    this.evento = this.eventosService.esquemaEvento();
  }

  ngOnInit(): void {
    // 1. Cargar lista de responsables
    this.obtenerResponsables();

    // 2. Revisar si hay un ID en la URL (Modo Edición desde Lista)
    // El 'id' debe coincidir con como lo nombraste en tu app-routing.module.ts
    // Ejemplo: { path: 'eventos-academicos/registro/:id', component: ... }
    if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      console.log("ID del evento a editar: ", this.idEvento);
      
      // Llamamos a la función para traer los datos
      this.obtenerEventoPorId(this.idEvento);
    }
  }

  public obtenerEventoPorId(id: any){
    this.eventosService.obtenerEventoPorId(id).subscribe(
      (response) => {
        this.evento = response;
        
        if(this.evento.fecha_inicio){
          this.dateTimeStart = new Date(this.evento.fecha_inicio);
        }
        if(this.evento.fecha_fin){
          this.dateTimeEnd = new Date(this.evento.fecha_fin);
        }

        if(!this.evento.publico_objetivo){
          this.evento.publico_objetivo = [];
        }

        console.log("Datos del evento cargados: ", this.evento);
      },
      (error) => {
        console.error("Error al obtener evento: ", error);
      }
    );
  }

  public obtenerResponsables() {
    this.eventosService.obtenerListaMaestrosAdmins().subscribe(
      (response) => {
        this.lista_responsables = [...response.admins, ...response.maestros];
        this.lista_responsables.forEach(element => {
            if(element.user){
               element.nombre_completo = element.user.first_name + ' ' + element.user.last_name;
            } else {
               element.nombre_completo = element.first_name + ' ' + element.last_name;
            }
        });
      }, (error) => {
        console.error("Error al obtener responsables: ", error);
      }
    );
  }

  public regresar() {
    this.location.back();
  }

  public validarAlfanumerico(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode >= 48 && charCode <= 57) || (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || charCode === 32 || charCode === 241 || charCode === 209) {
      return true;
    }
    return false;
  }

  public validarNumeros(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode >= 48 && charCode <= 57) {
      return true;
    }
    return false;
  }

  public checkboxChange(event: any) {
    if (event.checked) {
      this.evento.publico_objetivo.push(event.source.value);
    } else {
      this.evento.publico_objetivo.forEach((item: any, i: number) => {
        if (item == event.source.value) {
          this.evento.publico_objetivo.splice(i, 1);
        }
      });
    }
  }

  public revisarSeleccion(nombre: string) {
    if (this.evento.publico_objetivo) {
      var busqueda = this.evento.publico_objetivo.find((element: any) => element == nombre);
      return busqueda != undefined;
    }
    return false;
  }

  public registrar() {
    this.errors = {};
    this.evento.fecha_inicio = this.dateTimeStart;
    this.evento.fecha_fin = this.dateTimeEnd;

    this.errors = this.eventosService.validarRegistro(this.evento, this.editar);
    if (Object.keys(this.errors).length > 0) return false;

    this.eventosService.registrarEvento(this.evento).subscribe(
      (response) => {
        alert("Evento registrado exitosamente");
        this.router.navigate(["/eventos"]);
      }, (error) => { alert("Error al registrar evento"); }
    );
  }

  public actualizar() {
    this.errors = {};
    this.evento.fecha_inicio = this.dateTimeStart;
    this.evento.fecha_fin = this.dateTimeEnd;

    this.errors = this.eventosService.validarRegistro(this.evento, this.editar);
    if (Object.keys(this.errors).length > 0) return false;

    this.eventosService.actualizarEvento(this.evento).subscribe(
      (response) => {
        alert("Evento actualizado correctamente");
        this.router.navigate(["/eventos"]);
      }, (error) => { alert("Error al actualizar el evento"); }
    );
  }
}