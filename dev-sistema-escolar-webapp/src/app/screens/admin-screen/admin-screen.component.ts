import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { FacadeService } from 'src/app/services/facade.service';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-admin-screen',
  templateUrl: './admin-screen.component.html',
  styleUrls: ['./admin-screen.component.scss']
})
export class AdminScreenComponent implements OnInit {
  // Variables y métodos del componente
  public name_user:string = "";
  public lista_admins:any[]= [];
  public rol: string = "";

  constructor(
    public facadeService: FacadeService,
    private administradoresService: AdministradoresService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Lógica de inicialización aquí
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    // Obtenemos los administradores
    this.obtenerAdmins();
  }

  //Obtener lista de usuarios
  public obtenerAdmins(){
    this.administradoresService.obtenerListaAdmins().subscribe(
      (response)=>{
        this.lista_admins = response;
        console.log("Lista users: ", this.lista_admins);
      }, (error)=>{
        alert("No se pudo obtener la lista de administradores");
      }
    );
  }

  public goEditar(idUser: number){
    if (this.rol === 'administrador') {
      this.router.navigate(["registro-usuarios/administrador/"+idUser]);
    }else{
      alert("No tienes permisos para actualizar este maestro.");
    }
  }

  public delete(idUser: number) {
       // Se obtiene el ID del usuario en sesión, es decir, quien intenta eliminar
      const userIdSession = Number(this.facadeService.getUserId());
      // --------- Pero el parametro idUser (el de la función) es el ID del maestro que se quiere eliminar ---------
      // Administrador puede eliminar cualquier maestro
      // Maestro solo puede eliminar su propio registro
      if (this.rol === 'administrador' && userIdSession === idUser) {
        //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
        const dialogRef = this.dialog.open(EliminarUserModalComponent,{
          data: {id: idUser, rol: 'maestro'}, //Se pasan valores a través del componente
          height: '288px',
          width: '328px',
        });
  
      dialogRef.afterClosed().subscribe(result => {
        if(result.isDelete){
          console.log("Maestro eliminado");
          alert("Maestro eliminado correctamente.");
          //Recargar página
          window.location.reload();
        }else{
          alert("Maestro no se ha podido eliminar.");
          console.log("No se eliminó el maestro");
        }
      });
      }else{
        alert("No tienes permisos para eliminar este admin.");
      }
    }
    
}
