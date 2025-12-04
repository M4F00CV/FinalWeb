import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-registro-alumnos',
  templateUrl: './registro-alumnos.component.html',
  styleUrls: ['./registro-alumnos.component.scss']
})
export class RegistroAlumnosComponent implements OnInit {

  @Input() rol: string = "";
  @Input() datos_user: any = {};

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  public alumno:any= {};
  public token: string = "";
  public errors:any={};
  public editar:boolean = false;
  public idUser: Number = 0;

  constructor(
    private router: Router,
    private location : Location,
    public activatedRoute: ActivatedRoute,
    private alumnosService: AlumnosService,
    private facadeService: FacadeService,
  ) { }

  ngOnInit(): void {
    // Inicializar esquema
    this.alumno = this.alumnosService.esquemaAlumno();
    this.alumno.rol = this.rol;
    this.token = this.facadeService.getSessionToken(); 

    // Lógica para detectar EDICIÓN
    if(this.datos_user && this.datos_user.id){
      console.log("Datos alumno recibidos para editar: ", this.datos_user);
      this.editar = true;
      // Asignamos rompiendo referencia
      this.alumno = { ...this.datos_user };
      console.log("Datos cargados en formulario: ", this.alumno);
    }
  }

  public regresar(){
    this.location.back();
  }

  public registrar(){
    //Validamos si el formulario está lleno y correcto
    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    // Lógica para registrar un nuevo alumno
    if(this.alumno.password == this.alumno.confirmar_password){
      this.alumnosService.registrarAlumno(this.alumno).subscribe(
        (response) => {
          // Redirigir o mostrar mensaje de éxito
          alert("Alumno registrado exitosamente");
          console.log("Alumno registrado: ", response);
          if(this.token && this.token !== ""){
            this.router.navigate(["alumnos"]);
          }else{
            this.router.navigate(["/"]);
          }
        },
        (error) => {
          // Manejar errores de la API
          alert("Error al registrar alumno");
          console.error("Error al registrar alumno: ", error);
        }
      );
    }else{
      alert("Las contraseñas no coinciden");
      this.alumno.password="";
      this.alumno.confirmar_password="";
    }
  }

  public actualizar(){
    this.errors = {};
    this.errors = this.alumnosService.validarAlumno(this.alumno, this.editar);
    
    if(Object.keys(this.errors).length > 0){
      return false;
    }

    console.log("Enviando actualización alumno: ", this.alumno);

    this.alumnosService.actualizarAlumno(this.alumno).subscribe(
      (response) => {
        alert("Alumno actualizado correctamente");
        console.log("Respuesta update: ", response);
        this.router.navigate(["alumnos"]);
      },
      (error) => {
        alert("Error al actualizar el alumno");
        console.error("Error: ", error);
      }
    );
  }

  //Funciones para password
  showPassword()
  {
    if(this.inputType_1 == 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  showPwdConfirmar()
  {
    if(this.inputType_2 == 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  //Función para detectar el cambio de fecha
  public changeFecha(event :any){
    console.log(event);
    console.log(event.value.toISOString());

    this.alumno.fecha_nacimiento = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.alumno.fecha_nacimiento);
  }

  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32                         // Espacio
    ) {
      event.preventDefault();
    }
  }

}
