import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service'; //
import { MatSort } from '@angular/material/sort'; //
import { MatDialog } from '@angular/material/dialog'; 
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({ //
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit { //

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_alumnos: any[] = []; //
  public idUserSession: number = 0;

  //Para la tabla //
  displayedColumns: string[] = ['matricula', 'nombre', 'email', 'fecha_nacimiento', 'edad', 'curp', 'rfc', 'telefono', 'ocupacion', 'editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosAlumno>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor( //
    public facadeService: FacadeService,
    public AlumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup().toLowerCase();
    this.token = this.facadeService.getSessionToken();
    this.idUserSession = Number(this.facadeService.getUserId());
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    if (this.rol !== 'administrador') {
      this.displayedColumns = this.displayedColumns.filter(c => c !== 'eliminar');
    }
    //Obtener alumnos
    this.obtenerAlumnos();
  }

  public filtro(event: KeyboardEvent) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage(); 
    }
  }

  // Consumimos el servicio para obtener los maestros
  //Obtener maestros 
  //Cambios
  public obtenerAlumnos() {
    this.AlumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        console.log("Lista users: ", this.lista_alumnos);
        if (this.lista_alumnos.length > 0) {
          //Agregar datos del nombre e email
          this.lista_alumnos.forEach(usuario => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          console.log("Maestros: ", this.lista_alumnos);

          this.dataSource = new MatTableDataSource<DatosAlumno>(this.lista_alumnos as DatosAlumno[]);

          this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property) {
              case 'nombre': return (item.first_name + item.last_name).toLowerCase();
              default: return item[property];
            }
          };
          this.dataSource.filterPredicate = (data: DatosAlumno, filter: string) => {
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
    this.router.navigate(["registro-usuarios/alumno/" + idUser]);
    
  }

  public delete(idUser: number) {
    // Validamos que solo los administradores puedan borrar
    // (Puedes ajustar esto si otros roles también pueden borrar)
    if (this.rol === 'administrador' || this.rol === 'maestro') {
      
      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        data: { id: idUser, rol: 'alumno' },
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.isDelete) {
          console.log("Alumno eliminado");
          alert("Alumno eliminado correctamente.");
          // Recargamos la página para ver los cambios
          window.location.reload();
        } else {
          console.log("No se eliminó el alumno");
          alert("No se eliminó el alumno");
        }
      });

    } else {
      alert("No tienes permisos para eliminar este alumno.");
    }
  }

}

//Esto va fuera de la llave que cierra la clase
export interface DatosAlumno {
  id: number;
  matricula: string;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string;
  edad: number;
  curp: string;
  rfc: string;
  telefono: string;
  ocupacion: string;
}

