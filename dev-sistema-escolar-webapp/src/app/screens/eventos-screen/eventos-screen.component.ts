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
import { eventosRegistroService } from 'src/app/services/eventos-registro.service';


@Component({
  selector: 'app-eventos-screen',
  templateUrl: './eventos-screen.component.html',
  styleUrls: ['./eventos-screen.component.scss']
})
export class EventosScreenComponent {

    public name_user: string = "";
    public rol: string = "";
    public token: string = "";
    public lista_maestros: any[] = [];

  
    //Para la tabla
    displayedColumns: string[] = ['titulo', 'tipo_evento', 'fecha_inicio', 'fecha_fin', 'lugar', 'publico_objetivo', 'cupo_maximo', 'responsable', 'editar', 'eliminar'];
    dataSource = new MatTableDataSource<DatosUsuario>([]);
  
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
  
    constructor(
      public facadeService: FacadeService,
      public maestrosService: eventosRegistroService,
      private router: Router,
      public dialog: MatDialog,
      private activatedRoute: ActivatedRoute,
      private http: HttpClient 
    ) { }
  
    ngOnInit(): void {
      this.name_user = this.facadeService.getUserCompleteName();
      this.rol = this.facadeService.getUserGroup().toLowerCase();
      this.token = this.facadeService.getSessionToken();
      console.log("Token: ", this.token);
      if(this.token == ""){
        this.router.navigate(["/"]);
      }
      if (this.rol !== 'administrador') {
        this.displayedColumns = this.displayedColumns.filter(c => c !== 'eliminar');
        this.displayedColumns = this.displayedColumns.filter(c => c !== 'editar');
      }
      //Obtener maestros
      this.obtenerEventos();
    }
    
    public filtro(event: KeyboardEvent) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
  
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage(); 
      }
    }
  
    // Consumimos el servicio para obtener los maestros
    public obtenerEventos() {
      this.maestrosService.obtenerListaEventos().subscribe(
        (response) => {
          let lista_manejo_previo = response;
          if(this.rol != 'administrador'){
            if(this.rol!='maestro'){
              this.lista_maestros = lista_manejo_previo.filter((evento: any) => {
                const publico = evento.publico_objetivo ? evento.publico_objetivo.toLowerCase() : '';
                return publico.includes('estudiantes') || publico.includes('general');
              });
            }else{
              this.lista_maestros = lista_manejo_previo.filter((evento: any) => {
                const publico = evento.publico_objetivo ? evento.publico_objetivo.toLowerCase() : ''; 
                return publico.includes('profesores') || publico.includes('general');
              });
            }
          }else{
            this.lista_maestros = lista_manejo_previo;
          }
          console.log("Lista users: ", this.lista_maestros);
          if (this.lista_maestros.length > 0) {
  
            this.dataSource = new MatTableDataSource<DatosUsuario>(this.lista_maestros as DatosUsuario[]);
          
            this.dataSource.sortingDataAccessor = (item, property) => {
              switch (property) {
                case 'nombre': return (item.responsable_nombre).toLowerCase();
                default: return item[property];
              }
            };
            this.dataSource.filterPredicate = (data: DatosUsuario, filter: string) => {
              const dataStr = (data.responsable_nombre).toLowerCase();
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
  
  
    public goEditar(idEvento: number) { // <--- Recibes el ID del evento
      if (this.rol === 'administrador' || this.rol === 'maestro') {
        console.log("Abriendo modal para editar evento ID: ", idEvento);
        const dialogRef = this.dialog.open(EliminarUserModalComponent, {
          data: { id: idEvento, rol: 'evento', accion: 'editar' }, 
          height: '288px',
          width: '328px',
        });
        console.log("Diálogo abierto para editar evento ID: ", idEvento);

        dialogRef.afterClosed().subscribe(result => {
          // Verificamos si el modal devolvió true en isEditable
          console.log("redirecionar¿?: ", idEvento);
          if (result.isEditable) {
            console.log("redirecionar¿? == yes : ", idEvento);
            console.log("Redirigiendo a edición...");
            this.router.navigate(["eventos-registro/" + idEvento]);
          }
        });

      } else {
        alert("No tienes permisos para actualizar este evento.");
      }
    }
  
    public delete(idEvento: number) { 
    const userIdSession = Number(this.facadeService.getUserId());
    if (this.rol === 'administrador') {
      
      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        data: { id: idEvento, rol: 'evento' }, 
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.isDelete) {
          this.maestrosService.eliminarEvento(idEvento).subscribe(
            (response) => {
              console.log("Evento eliminado");
              alert("Evento eliminado correctamente.");
              window.location.reload(); 
            },
            (error) => {
              console.error("Error al eliminar:", error);
              alert("No se pudo eliminar el evento.");
            }
          );
        } else {
          console.log("Cancelado por el usuario");
        }
      });
    } else {
      alert("No tienes permisos para eliminar eventos.");
    }
  }


}

// Al final del archivo
export interface DatosUsuario {
  id: number; // Agregamos ID por si acaso
  titulo: string;
  tipo_evento: string;
  fecha_inicio: string;
  fecha_fin: string;
  lugar: string;
  publico_objetivo: string;    
  publico_objetivo_lista: any[]; 
  cupo_maximo: number;
  responsable: number;         
  responsable_nombre: string;  
}