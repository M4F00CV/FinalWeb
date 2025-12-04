import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service';


@Component({
  selector: 'app-maestros-screen',
  templateUrl: './maestros-screen.component.html',
  styleUrls: ['./maestros-screen.component.scss']
})
export class MaestrosScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_maestros: any[] = [];
  public idUserSession: number = 0;

  //Para la tabla
  displayedColumns: string[] = ['id_trabajador', 'nombre', 'email', 'fecha_nacimiento', 'telefono', 'rfc', 'cubiculo', 'area_investigacion', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosUsuario>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public facadeService: FacadeService,
    public maestrosService: MaestrosService,
    private router: Router,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient 
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.idUserSession = Number(this.facadeService.getUserId());
    this.rol = this.facadeService.getUserGroup().toLowerCase();
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    // Debug para verificar en consola
    console.log("Rol normalizado:", this.rol); 
    console.log("ID Usuario Sesión:", this.idUserSession);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    if(this.rol != 'administrador'){
       this.displayedColumns = this.displayedColumns.filter(c => c != 'eliminar');
    }
    //Obtener maestros
    this.obtenerMaestros();
  }
  
  public filtro(event: KeyboardEvent) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage(); 
    }
  }

  // Consumimos el servicio para obtener los maestros
  public obtenerMaestros() {
    this.maestrosService.obtenerListaMaestros().subscribe(
      (response) => {
        this.lista_maestros = response;
        console.log("Lista users: ", this.lista_maestros);
        if (this.lista_maestros.length > 0) {
          //Agregar datos del nombre e email
          this.lista_maestros.forEach(usuario => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
            usuario.id_user = usuario.user.id;
            if (usuario.id_user == this.idUserSession) {
              console.log("¡Encontré mi propio usuario en la tabla!", usuario);
            }
          });
          
          console.log("Maestros: ", this.lista_maestros);

          this.dataSource = new MatTableDataSource<DatosUsuario>(this.lista_maestros as DatosUsuario[]);
        
          this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
              case 'nombre': return (item.first_name + item.last_name).toLowerCase();
              default: return item[property];
            }
          };
          this.dataSource.filterPredicate = (data: DatosUsuario, filter: string) => {
            const dataStr = (data.first_name +" "+ data.last_name).toLowerCase();
            return dataStr.indexOf(filter) !== -1;
          };
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        }
      }, (error) => {
        console.error("Error al obtener la lista de maestros: ", error);
        alert("No se pudo obtener la lista de maestros");
      }
    );
  }


  public goEditar(idUser: number) {
    if (this.rol === 'administrador' || this.rol === 'maestro') {
      this.router.navigate(["registro-usuarios/maestros/" + idUser]);
    }else{
      alert("No tienes permisos para actualizar este maestro.");
    }
  }

  public delete(idUser: number) {
     // Se obtiene el ID del usuario en sesión
    const userIdSession = Number(this.facadeService.getUserId());
    
    // Validar permisos
    if (this.rol === 'administrador') {
      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idUser, rol: 'maestro'}, 
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result.isDelete){
          console.log("Maestro eliminado");
          alert("Maestro eliminado correctamente.");
          window.location.reload();
        }else{
          alert("Maestro no se ha podido eliminar.");
          console.log("No se eliminó el maestro");
        }
      });
    }else{
      alert("No tienes permisos para eliminar este maestro.");
    }
  }


}

// Interfaz fuera de la clase
export interface DatosUsuario {
  id: number,
  id_user: number,
  id_trabajador: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string,
  telefono: string,
  rfc: string,
  cubiculo: string,
  area_investigacion: number,
}