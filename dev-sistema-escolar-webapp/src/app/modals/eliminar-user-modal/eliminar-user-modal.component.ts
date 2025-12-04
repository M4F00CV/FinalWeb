import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MaestrosService } from 'src/app/services/maestros.service';

@Component({
  selector: 'app-eliminar-user-modal',
  templateUrl: './eliminar-user-modal.component.html',
  styleUrls: ['./eliminar-user-modal.component.scss']
})
export class EliminarUserModalComponent implements OnInit {

  public rol: string = "";
  public accion: string = "";
  titulo: string;
  descripcion: string;
  textoBoton: string;

  constructor(
    private administradoresService: AdministradoresService,
    private maestrosService: MaestrosService,
    private alumnosService: AlumnosService,
    private dialogRef: MatDialogRef<EliminarUserModalComponent>,
    @Inject (MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.rol = this.data.rol;
    this.accion = this.data.accion || 'eliminar';
    if(this.accion === 'editar'){
      this.titulo = `Editar ${this.rol}`;
      this.descripcion = `¿Estás seguro que deseas editar este ${this.rol}? Serás redirigido al formulario.`;
      this.textoBoton = "Editar";
    } else {
      // Configuración por defecto (Eliminar)
      this.titulo = `Eliminar ${this.rol}`;
      this.descripcion = `Estás a punto de eliminar este ${this.rol}. Una vez que lo elimines no podrás deshacer esta acción.`;
      this.textoBoton = "Eliminar";
    }
  }

  public cerrar_modal(){
    this.dialogRef.close({isDelete:false});
  }

  public accionModal(){
    if(this.accion === 'editar'){
      this.dialogRef.close({ isEditable: true });
      return; 
    }
    this.eliminarUser();
  }

  public eliminarUser(){
    if(this.rol == "administrador"){
      this.administradoresService.eliminarAdmin(this.data.id).subscribe(
        (response)=>{ this.dialogRef.close({isDelete:true}); }, 
        (error)=>{ this.dialogRef.close({isDelete:false}); }
      );
    } else if(this.rol == "maestro"){
      this.maestrosService.eliminarMaestro(this.data.id).subscribe(
        (response)=>{ this.dialogRef.close({isDelete:true}); }, 
        (error)=>{ this.dialogRef.close({isDelete:false}); }
      );
    } else if(this.rol == "alumno"){
       this.alumnosService.eliminarAlumno(this.data.id).subscribe(
        (response)=>{ this.dialogRef.close({isDelete:true}); }, 
        (error)=>{ this.dialogRef.close({isDelete:false}); }
      );
    } else if(this.rol == "Evento" || this.rol == "evento"){
       this.dialogRef.close({isDelete:true});
    }
  }
  
  
}